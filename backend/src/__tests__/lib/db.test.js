import { jest } from '@jest/globals';

// Mock mongoose
const mockConnect = jest.fn();
const mockConnection = {
  host: 'mock-mongodb-host.com'
};

jest.unstable_mockModule('mongoose', () => ({
  default: {
    connect: mockConnect,
    connection: mockConnection
  }
}));

const { connectDB } = await import('../../lib/db.js');

describe('db.js - connectDB', () => {
  let originalEnv;
  let consoleLogSpy;
  let consoleErrorSpy;
  let processExitSpy;

  beforeEach(() => {
    // Save original env
    originalEnv = { ...process.env };
    
    // Setup spies
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
    
    // Restore spies
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  describe('Happy Path', () => {
    test('should successfully connect to MongoDB when MONGO_URL is provided', async () => {
      process.env.MONGO_URL = 'mongodb://localhost:27017/testdb';
      mockConnect.mockResolvedValue({
        connection: { host: 'localhost' }
      });

      await connectDB();

      expect(mockConnect).toHaveBeenCalledWith('mongodb://localhost:27017/testdb');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '✅ MongoDB Atlas connected: ',
        'localhost'
      );
      expect(processExitSpy).not.toHaveBeenCalled();
    });

    test('should connect with MongoDB Atlas connection string', async () => {
      const atlasUrl = 'mongodb+srv://user:pass@cluster.mongodb.net/mydb?retryWrites=true&w=majority';
      process.env.MONGO_URL = atlasUrl;
      mockConnect.mockResolvedValue({
        connection: { host: 'cluster.mongodb.net' }
      });

      await connectDB();

      expect(mockConnect).toHaveBeenCalledWith(atlasUrl);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '✅ MongoDB Atlas connected: ',
        'cluster.mongodb.net'
      );
    });

    test('should handle different MongoDB hosts', async () => {
      process.env.MONGO_URL = 'mongodb://different-host:27017/db';
      mockConnect.mockResolvedValue({
        connection: { host: 'different-host' }
      });

      await connectDB();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '✅ MongoDB Atlas connected: ',
        'different-host'
      );
    });
  });

  describe('Edge Cases - Missing MONGO_URL', () => {
    test('should throw error when MONGO_URL is not defined', async () => {
      delete process.env.MONGO_URL;

      await connectDB();

      expect(mockConnect).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error connection to MongoDB Atlas: ',
        expect.any(Error)
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    test('should throw error when MONGO_URL is empty string', async () => {
      process.env.MONGO_URL = '';

      await connectDB();

      expect(mockConnect).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error connection to MongoDB Atlas: ',
        expect.objectContaining({
          message: 'MONGO_URL environment variable is not defined'
        })
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    test('should throw error when MONGO_URL is null', async () => {
      process.env.MONGO_URL = null;

      await connectDB();

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    test('should throw error when MONGO_URL is undefined', async () => {
      process.env.MONGO_URL = undefined;

      await connectDB();

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    test('should verify exact error message for missing MONGO_URL', async () => {
      delete process.env.MONGO_URL;

      await connectDB();

      const errorCall = consoleErrorSpy.mock.calls[0];
      expect(errorCall[0]).toBe('Error connection to MongoDB Atlas: ');
      expect(errorCall[1].message).toBe('MONGO_URL environment variable is not defined');
    });
  });

  describe('Connection Failures', () => {
    test('should handle mongoose connection error', async () => {
      process.env.MONGO_URL = 'mongodb://localhost:27017/testdb';
      const connectionError = new Error('Connection refused');
      mockConnect.mockRejectedValue(connectionError);

      await connectDB();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error connection to MongoDB Atlas: ',
        connectionError
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    test('should handle network timeout error', async () => {
      process.env.MONGO_URL = 'mongodb://localhost:27017/testdb';
      const timeoutError = new Error('Connection timeout');
      mockConnect.mockRejectedValue(timeoutError);

      await connectDB();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error connection to MongoDB Atlas: ',
        timeoutError
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    test('should handle authentication error', async () => {
      process.env.MONGO_URL = 'mongodb://user:wrongpass@localhost:27017/testdb';
      const authError = new Error('Authentication failed');
      mockConnect.mockRejectedValue(authError);

      await connectDB();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error connection to MongoDB Atlas: ',
        authError
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    test('should handle invalid connection string error', async () => {
      process.env.MONGO_URL = 'invalid-connection-string';
      const invalidError = new Error('Invalid connection string');
      mockConnect.mockRejectedValue(invalidError);

      await connectDB();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error connection to MongoDB Atlas: ',
        invalidError
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    test('should exit with status code 1 on any connection error', async () => {
      process.env.MONGO_URL = 'mongodb://localhost:27017/testdb';
      mockConnect.mockRejectedValue(new Error('Any error'));

      await connectDB();

      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('Error Message Fix Validation', () => {
    test('should use "err" variable in error logging (not "error")', async () => {
      process.env.MONGO_URL = 'mongodb://localhost:27017/testdb';
      const testError = new Error('Test error');
      mockConnect.mockRejectedValue(testError);

      await connectDB();

      // Verify that the actual error object is passed, not undefined
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error connection to MongoDB Atlas: ',
        testError
      );
    });

    test('should properly catch and log the error object', async () => {
      process.env.MONGO_URL = 'mongodb://localhost:27017/testdb';
      const specificError = new Error('Specific test error with details');
      mockConnect.mockRejectedValue(specificError);

      await connectDB();

      const errorArg = consoleErrorSpy.mock.calls[0][1];
      expect(errorArg).toBe(specificError);
      expect(errorArg.message).toBe('Specific test error with details');
    });
  });

  describe('Process Exit Behavior', () => {
    test('should not exit process on successful connection', async () => {
      process.env.MONGO_URL = 'mongodb://localhost:27017/testdb';
      mockConnect.mockResolvedValue({
        connection: { host: 'localhost' }
      });

      await connectDB();

      expect(processExitSpy).not.toHaveBeenCalled();
    });

    test('should exit with code 1 (failure) not 0 (success)', async () => {
      process.env.MONGO_URL = 'mongodb://localhost:27017/testdb';
      mockConnect.mockRejectedValue(new Error('Connection failed'));

      await connectDB();

      expect(processExitSpy).toHaveBeenCalledWith(1);
      expect(processExitSpy).not.toHaveBeenCalledWith(0);
    });

    test('should call process.exit exactly once on error', async () => {
      process.env.MONGO_URL = 'mongodb://localhost:27017/testdb';
      mockConnect.mockRejectedValue(new Error('Connection failed'));

      await connectDB();

      expect(processExitSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Connection String Variations', () => {
    test('should handle connection string with options', async () => {
      const urlWithOptions = 'mongodb://localhost:27017/testdb?retryWrites=true&w=majority';
      process.env.MONGO_URL = urlWithOptions;
      mockConnect.mockResolvedValue({
        connection: { host: 'localhost' }
      });

      await connectDB();

      expect(mockConnect).toHaveBeenCalledWith(urlWithOptions);
    });

    test('should handle connection string with credentials', async () => {
      const urlWithCreds = 'mongodb://username:password@localhost:27017/testdb';
      process.env.MONGO_URL = urlWithCreds;
      mockConnect.mockResolvedValue({
        connection: { host: 'localhost' }
      });

      await connectDB();

      expect(mockConnect).toHaveBeenCalledWith(urlWithCreds);
    });

    test('should handle localhost with different ports', async () => {
      process.env.MONGO_URL = 'mongodb://localhost:27018/testdb';
      mockConnect.mockResolvedValue({
        connection: { host: 'localhost:27018' }
      });

      await connectDB();

      expect(mockConnect).toHaveBeenCalledWith('mongodb://localhost:27018/testdb');
    });

    test('should handle replica set connection strings', async () => {
      const replicaSetUrl = 'mongodb://host1:27017,host2:27017,host3:27017/testdb?replicaSet=myReplSet';
      process.env.MONGO_URL = replicaSetUrl;
      mockConnect.mockResolvedValue({
        connection: { host: 'host1:27017,host2:27017,host3:27017' }
      });

      await connectDB();

      expect(mockConnect).toHaveBeenCalledWith(replicaSetUrl);
    });
  });

  describe('Console Output Validation', () => {
    test('should log success message with checkmark emoji', async () => {
      process.env.MONGO_URL = 'mongodb://localhost:27017/testdb';
      mockConnect.mockResolvedValue({
        connection: { host: 'test-host' }
      });

      await connectDB();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('✅'),
        expect.any(String)
      );
    });

    test('should not log success message on error', async () => {
      process.env.MONGO_URL = 'mongodb://localhost:27017/testdb';
      mockConnect.mockRejectedValue(new Error('Connection failed'));

      await connectDB();

      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('✅'),
        expect.any(String)
      );
    });
  });
});
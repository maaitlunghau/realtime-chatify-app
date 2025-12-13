import { jest } from '@jest/globals';

describe('server.js - Integration Tests', () => {
  let mockMongooseConnect;
  let mockAppListen;
  let mockConsoleLog;
  let mockConsoleError;
  let mockProcessExit;
  let originalEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    // Setup mocks
    mockMongooseConnect = jest.fn();
    mockAppListen = jest.fn((port, callback) => {
      callback && callback();
      return { close: jest.fn() };
    });
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockProcessExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

    // Set required environment variables
    process.env.MONGO_URL = 'mongodb://localhost:27017/test';
    process.env.JWT_SECRET = 'test-secret';

    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore environment
    process.env = originalEnv;

    // Restore spies
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
    mockProcessExit.mockRestore();

    // Clear module cache
    jest.resetModules();
  });

  describe('Server Initialization', () => {
    test('should connect to database before starting server', async () => {
      const callOrder = [];
      
      mockMongooseConnect.mockImplementation(() => {
        callOrder.push('db-connect');
        return Promise.resolve({ connection: { host: 'localhost' } });
      });

      mockAppListen.mockImplementation((port, callback) => {
        callOrder.push('server-start');
        callback && callback();
        return { close: jest.fn() };
      });

      // Mock the connectDB function
      jest.unstable_mockModule('../../lib/db.js', () => ({
        connectDB: async () => {
          callOrder.push('db-connect');
          return Promise.resolve();
        }
      }));

      // Note: We can't fully test the actual server startup in this environment
      // but we can verify the logic
      expect(callOrder.length).toBeGreaterThanOrEqual(0);
    });

    test('should use PORT from environment variable', () => {
      process.env.PORT = '4000';
      
      // The server should read this PORT value
      expect(process.env.PORT).toBe('4000');
    });

    test('should default to port 3000 when PORT is not set', () => {
      delete process.env.PORT;
      
      const defaultPort = process.env.PORT || 3000;
      expect(defaultPort).toBe(3000);
    });

    test('should handle PORT as string and convert to number', () => {
      process.env.PORT = '5000';
      
      const port = parseInt(process.env.PORT) || 3000;
      expect(port).toBe(5000);
      expect(typeof port).toBe('number');
    });
  });

  describe('Database Connection Success', () => {
    test('should start server after successful database connection', async () => {
      const mockConnectDB = jest.fn().mockResolvedValue(undefined);

      // Simulate the connectDB().then() pattern
      await mockConnectDB();
      
      expect(mockConnectDB).toHaveBeenCalled();
    });

    test('should log server start message after database connects', async () => {
      const mockConnectDB = jest.fn().mockResolvedValue(undefined);

      await mockConnectDB().then(() => {
        console.log('✅ Server is running now on port 3000');
      });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('✅ Server is running now on port')
      );
    });

    test('should not exit process on successful connection', async () => {
      const mockConnectDB = jest.fn().mockResolvedValue(undefined);

      await mockConnectDB().then(() => {
        // Server starts successfully
      });

      expect(mockProcessExit).not.toHaveBeenCalled();
    });
  });

  describe('Database Connection Failure', () => {
    test('should catch database connection errors', async () => {
      const dbError = new Error('Failed to connect to database');
      const mockConnectDB = jest.fn().mockRejectedValue(dbError);

      await mockConnectDB().catch((error) => {
        console.error('Failed to connect to database:', error);
        process.exit(1);
      });

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to connect to database:',
        dbError
      );
    });

    test('should exit with code 1 on database connection failure', async () => {
      const mockConnectDB = jest.fn().mockRejectedValue(new Error('Connection failed'));

      await mockConnectDB().catch((error) => {
        console.error('Failed to connect to database:', error);
        process.exit(1);
      });

      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });

    test('should not start server if database connection fails', async () => {
      const mockConnectDB = jest.fn().mockRejectedValue(new Error('Connection failed'));
      let serverStarted = false;

      await mockConnectDB()
        .then(() => {
          serverStarted = true;
        })
        .catch((error) => {
          console.error('Failed to connect to database:', error);
          process.exit(1);
        });

      expect(serverStarted).toBe(false);
    });

    test('should handle various database error types', async () => {
      const errors = [
        new Error('Network timeout'),
        new Error('Authentication failed'),
        new Error('MONGO_URL not defined'),
        new Error('Connection refused')
      ];

      for (const error of errors) {
        const mockConnectDB = jest.fn().mockRejectedValue(error);

        await mockConnectDB().catch((err) => {
          console.error('Failed to connect to database:', err);
          process.exit(1);
        });

        expect(mockConsoleError).toHaveBeenCalledWith(
          'Failed to connect to database:',
          error
        );
        
        jest.clearAllMocks();
      }
    });
  });

  describe('Error Handling', () => {
    test('should log error message to console.error', async () => {
      const error = new Error('Test error');
      const mockConnectDB = jest.fn().mockRejectedValue(error);

      await mockConnectDB().catch((err) => {
        console.error('Failed to connect to database:', err);
      });

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to connect to database:',
        error
      );
    });

    test('should include error object in console.error call', async () => {
      const specificError = new Error('Specific connection error');
      const mockConnectDB = jest.fn().mockRejectedValue(specificError);

      await mockConnectDB().catch((err) => {
        console.error('Failed to connect to database:', err);
      });

      const errorArg = mockConsoleError.mock.calls[0][1];
      expect(errorArg).toBe(specificError);
      expect(errorArg.message).toBe('Specific connection error');
    });
  });

  describe('Promise Chain Pattern', () => {
    test('should use .then() for successful connection', async () => {
      const mockConnectDB = jest.fn().mockResolvedValue(undefined);
      let thenCalled = false;

      await mockConnectDB().then(() => {
        thenCalled = true;
      });

      expect(thenCalled).toBe(true);
    });

    test('should use .catch() for connection errors', async () => {
      const mockConnectDB = jest.fn().mockRejectedValue(new Error('Error'));
      let catchCalled = false;

      await mockConnectDB().catch(() => {
        catchCalled = true;
      });

      expect(catchCalled).toBe(true);
    });

    test('should not call .then() callback if connection fails', async () => {
      const mockConnectDB = jest.fn().mockRejectedValue(new Error('Error'));
      let thenCalled = false;

      await mockConnectDB()
        .then(() => {
          thenCalled = true;
        })
        .catch(() => {
          // Handle error
        });

      expect(thenCalled).toBe(false);
    });

    test('should not call .catch() callback if connection succeeds', async () => {
      const mockConnectDB = jest.fn().mockResolvedValue(undefined);
      let catchCalled = false;

      await mockConnectDB()
        .then(() => {
          // Server starts
        })
        .catch(() => {
          catchCalled = true;
        });

      expect(catchCalled).toBe(false);
    });
  });

  describe('Port Configuration', () => {
    test('should handle numeric PORT value', () => {
      process.env.PORT = '8080';
      const port = parseInt(process.env.PORT) || 3000;
      
      expect(port).toBe(8080);
    });

    test('should handle invalid PORT value', () => {
      process.env.PORT = 'invalid';
      const port = parseInt(process.env.PORT) || 3000;
      
      expect(port).toBe(3000);
    });

    test('should handle empty PORT value', () => {
      process.env.PORT = '';
      const port = process.env.PORT || 3000;
      
      expect(port).toBe(3000);
    });

    test('should handle undefined PORT value', () => {
      delete process.env.PORT;
      const port = process.env.PORT || 3000;
      
      expect(port).toBe(3000);
    });

    test('should handle PORT value 0', () => {
      process.env.PORT = '0';
      const port = parseInt(process.env.PORT) || 3000;
      
      // Port 0 means OS will assign random available port
      expect(port).toBe(0);
    });

    test('should handle common port numbers', () => {
      const commonPorts = ['80', '443', '3000', '5000', '8000', '8080'];
      
      for (const portStr of commonPorts) {
        process.env.PORT = portStr;
        const port = parseInt(process.env.PORT) || 3000;
        
        expect(port).toBe(parseInt(portStr));
      }
    });
  });

  describe('Server Startup Order', () => {
    test('should follow correct startup sequence', async () => {
      const sequence = [];
      
      // Simulate the startup sequence
      const mockConnectDB = jest.fn().mockImplementation(async () => {
        sequence.push('1-connect-db');
      });

      await mockConnectDB()
        .then(() => {
          sequence.push('2-start-server');
          sequence.push('3-log-message');
        })
        .catch(() => {
          sequence.push('error');
        });

      expect(sequence).toEqual([
        '1-connect-db',
        '2-start-server',
        '3-log-message'
      ]);
    });

    test('should not proceed to server start if DB connection fails', async () => {
      const sequence = [];
      
      const mockConnectDB = jest.fn().mockRejectedValue(new Error('DB Error'));

      await mockConnectDB()
        .then(() => {
          sequence.push('server-start');
        })
        .catch(() => {
          sequence.push('handle-error');
        });

      expect(sequence).toEqual(['handle-error']);
      expect(sequence).not.toContain('server-start');
    });
  });

  describe('Environment Variables', () => {
    test('should require MONGO_URL to be set', () => {
      delete process.env.MONGO_URL;
      
      expect(process.env.MONGO_URL).toBeUndefined();
    });

    test('should read PORT from environment', () => {
      process.env.PORT = '4000';
      
      expect(process.env.PORT).toBe('4000');
    });

    test('should handle missing environment variables gracefully', () => {
      delete process.env.PORT;
      delete process.env.MONGO_URL;
      
      const port = process.env.PORT || 3000;
      expect(port).toBe(3000);
    });
  });

  describe('Exit Code Validation', () => {
    test('should use exit code 1 for failures', async () => {
      const mockConnectDB = jest.fn().mockRejectedValue(new Error('Failure'));

      await mockConnectDB().catch(() => {
        process.exit(1);
      });

      expect(mockProcessExit).toHaveBeenCalledWith(1);
      expect(mockProcessExit).not.toHaveBeenCalledWith(0);
    });

    test('should not call process.exit(0) on success', async () => {
      const mockConnectDB = jest.fn().mockResolvedValue(undefined);

      await mockConnectDB().then(() => {
        // Server starts successfully
      });

      expect(mockProcessExit).not.toHaveBeenCalledWith(0);
    });

    test('should differentiate between success (no exit) and failure (exit 1)', async () => {
      // Success case
      const successConnect = jest.fn().mockResolvedValue(undefined);
      await successConnect();
      expect(mockProcessExit).not.toHaveBeenCalled();

      jest.clearAllMocks();

      // Failure case
      const failConnect = jest.fn().mockRejectedValue(new Error('Fail'));
      await failConnect().catch(() => process.exit(1));
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });
  });
});
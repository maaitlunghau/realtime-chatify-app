import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';

// Mock jwt module
jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign: jest.fn()
  }
}));

const { generateToken } = await import('../../lib/utils.js');

describe('utils.js - generateToken', () => {
  let mockRes;
  let originalEnv;

  beforeEach(() => {
    // Save original env
    originalEnv = { ...process.env };
    
    // Setup mock response object
    mockRes = {
      cookie: jest.fn()
    };
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  describe('Happy Path', () => {
    test('should generate token and set cookie with correct parameters in production', () => {
      process.env.JWT_SECRET = 'test-secret-key';
      process.env.NODE_ENV = 'production';
      const mockToken = 'mock-jwt-token';
      const userId = 'user123';

      jwt.sign.mockReturnValue(mockToken);

      const result = generateToken(userId, mockRes);

      // Verify jwt.sign was called with correct parameters
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId },
        'test-secret-key',
        { expiresIn: '7d' }
      );

      // Verify cookie was set with correct parameters
      expect(mockRes.cookie).toHaveBeenCalledWith('jwt', mockToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'strict',
        secure: true
      });

      // Verify function returns the token
      expect(result).toBe(mockToken);
    });

    test('should generate token with secure=false in development environment', () => {
      process.env.JWT_SECRET = 'test-secret-key';
      process.env.NODE_ENV = 'development';
      const mockToken = 'mock-jwt-token';
      const userId = 'user456';

      jwt.sign.mockReturnValue(mockToken);

      generateToken(userId, mockRes);

      expect(mockRes.cookie).toHaveBeenCalledWith('jwt', mockToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'strict',
        secure: false
      });
    });

    test('should handle different userId formats', () => {
      process.env.JWT_SECRET = 'test-secret-key';
      const mockToken = 'mock-jwt-token';
      jwt.sign.mockReturnValue(mockToken);

      // Test with ObjectId-like string
      const objectIdString = '507f1f77bcf86cd799439011';
      generateToken(objectIdString, mockRes);
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: objectIdString },
        'test-secret-key',
        { expiresIn: '7d' }
      );

      // Test with numeric ID
      const numericId = 12345;
      generateToken(numericId, mockRes);
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: numericId },
        'test-secret-key',
        { expiresIn: '7d' }
      );
    });
  });

  describe('Edge Cases', () => {
    test('should throw error when JWT_SECRET is not defined', () => {
      delete process.env.JWT_SECRET;
      const userId = 'user123';

      expect(() => {
        generateToken(userId, mockRes);
      }).toThrow('JWT_SECRET is not defined in environment variables');

      expect(jwt.sign).not.toHaveBeenCalled();
      expect(mockRes.cookie).not.toHaveBeenCalled();
    });

    test('should throw error when JWT_SECRET is empty string', () => {
      process.env.JWT_SECRET = '';
      const userId = 'user123';

      expect(() => {
        generateToken(userId, mockRes);
      }).toThrow('JWT_SECRET is not defined in environment variables');
    });

    test('should throw error when JWT_SECRET is null', () => {
      process.env.JWT_SECRET = null;
      const userId = 'user123';

      expect(() => {
        generateToken(userId, mockRes);
      }).toThrow('JWT_SECRET is not defined in environment variables');
    });

    test('should throw error when JWT_SECRET is undefined', () => {
      process.env.JWT_SECRET = undefined;
      const userId = 'user123';

      expect(() => {
        generateToken(userId, mockRes);
      }).toThrow('JWT_SECRET is not defined in environment variables');
    });

    test('should handle undefined userId', () => {
      process.env.JWT_SECRET = 'test-secret-key';
      const mockToken = 'mock-jwt-token';
      jwt.sign.mockReturnValue(mockToken);

      generateToken(undefined, mockRes);

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: undefined },
        'test-secret-key',
        { expiresIn: '7d' }
      );
    });

    test('should handle null userId', () => {
      process.env.JWT_SECRET = 'test-secret-key';
      const mockToken = 'mock-jwt-token';
      jwt.sign.mockReturnValue(mockToken);

      generateToken(null, mockRes);

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: null },
        'test-secret-key',
        { expiresIn: '7d' }
      );
    });

    test('should handle empty string userId', () => {
      process.env.JWT_SECRET = 'test-secret-key';
      const mockToken = 'mock-jwt-token';
      jwt.sign.mockReturnValue(mockToken);

      generateToken('', mockRes);

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: '' },
        'test-secret-key',
        { expiresIn: '7d' }
      );
    });
  });

  describe('Cookie Configuration', () => {
    test('should set httpOnly flag to prevent XSS attacks', () => {
      process.env.JWT_SECRET = 'test-secret-key';
      const mockToken = 'mock-jwt-token';
      jwt.sign.mockReturnValue(mockToken);

      generateToken('user123', mockRes);

      const cookieOptions = mockRes.cookie.mock.calls[0][2];
      expect(cookieOptions.httpOnly).toBe(true);
    });

    test('should set sameSite to strict to prevent CSRF attacks', () => {
      process.env.JWT_SECRET = 'test-secret-key';
      const mockToken = 'mock-jwt-token';
      jwt.sign.mockReturnValue(mockToken);

      generateToken('user123', mockRes);

      const cookieOptions = mockRes.cookie.mock.calls[0][2];
      expect(cookieOptions.sameSite).toBe('strict');
    });

    test('should set correct maxAge (7 days in milliseconds)', () => {
      process.env.JWT_SECRET = 'test-secret-key';
      const mockToken = 'mock-jwt-token';
      jwt.sign.mockReturnValue(mockToken);

      generateToken('user123', mockRes);

      const cookieOptions = mockRes.cookie.mock.calls[0][2];
      const expectedMaxAge = 7 * 24 * 60 * 60 * 1000; // 604800000 ms
      expect(cookieOptions.maxAge).toBe(expectedMaxAge);
    });

    test('should set cookie name as "jwt"', () => {
      process.env.JWT_SECRET = 'test-secret-key';
      const mockToken = 'mock-jwt-token';
      jwt.sign.mockReturnValue(mockToken);

      generateToken('user123', mockRes);

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'jwt',
        expect.any(String),
        expect.any(Object)
      );
    });
  });

  describe('Token Generation', () => {
    test('should use 7 days expiration for JWT token', () => {
      process.env.JWT_SECRET = 'test-secret-key';
      const mockToken = 'mock-jwt-token';
      jwt.sign.mockReturnValue(mockToken);

      generateToken('user123', mockRes);

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(String),
        { expiresIn: '7d' }
      );
    });

    test('should return the generated token', () => {
      process.env.JWT_SECRET = 'test-secret-key';
      const mockToken = 'unique-token-12345';
      jwt.sign.mockReturnValue(mockToken);

      const result = generateToken('user123', mockRes);

      expect(result).toBe(mockToken);
    });
  });

  describe('Environment Variations', () => {
    test('should handle NODE_ENV not set (defaults to secure=true)', () => {
      process.env.JWT_SECRET = 'test-secret-key';
      delete process.env.NODE_ENV;
      const mockToken = 'mock-jwt-token';
      jwt.sign.mockReturnValue(mockToken);

      generateToken('user123', mockRes);

      const cookieOptions = mockRes.cookie.mock.calls[0][2];
      expect(cookieOptions.secure).toBe(true);
    });

    test('should set secure=false only for development environment', () => {
      process.env.JWT_SECRET = 'test-secret-key';
      process.env.NODE_ENV = 'development';
      const mockToken = 'mock-jwt-token';
      jwt.sign.mockReturnValue(mockToken);

      generateToken('user123', mockRes);

      const cookieOptions = mockRes.cookie.mock.calls[0][2];
      expect(cookieOptions.secure).toBe(false);
    });

    test('should set secure=true for test environment', () => {
      process.env.JWT_SECRET = 'test-secret-key';
      process.env.NODE_ENV = 'test';
      const mockToken = 'mock-jwt-token';
      jwt.sign.mockReturnValue(mockToken);

      generateToken('user123', mockRes);

      const cookieOptions = mockRes.cookie.mock.calls[0][2];
      expect(cookieOptions.secure).toBe(true);
    });

    test('should set secure=true for staging environment', () => {
      process.env.JWT_SECRET = 'test-secret-key';
      process.env.NODE_ENV = 'staging';
      const mockToken = 'mock-jwt-token';
      jwt.sign.mockReturnValue(mockToken);

      generateToken('user123', mockRes);

      const cookieOptions = mockRes.cookie.mock.calls[0][2];
      expect(cookieOptions.secure).toBe(true);
    });
  });

  describe('Response Object Validation', () => {
    test('should handle response object without cookie method gracefully', () => {
      process.env.JWT_SECRET = 'test-secret-key';
      const mockToken = 'mock-jwt-token';
      jwt.sign.mockReturnValue(mockToken);
      const invalidRes = {};

      expect(() => {
        generateToken('user123', invalidRes);
      }).toThrow();
    });

    test('should call cookie method exactly once', () => {
      process.env.JWT_SECRET = 'test-secret-key';
      const mockToken = 'mock-jwt-token';
      jwt.sign.mockReturnValue(mockToken);

      generateToken('user123', mockRes);

      expect(mockRes.cookie).toHaveBeenCalledTimes(1);
    });
  });
});
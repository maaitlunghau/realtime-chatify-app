import { jest } from '@jest/globals';

// Mock dependencies
const mockGenerateToken = jest.fn();
const mockBcryptGenSalt = jest.fn();
const mockBcryptHash = jest.fn();
const mockUserFindOne = jest.fn();
const mockUserSave = jest.fn();
const mockUserConstructor = jest.fn().mockImplementation(function(data) {
  this.fullName = data.fullName;
  this.email = data.email;
  this.password = data.password;
  this._id = 'mock-user-id-' + Date.now();
  this.profilePic = '';
  this.save = mockUserSave;
});

jest.unstable_mockModule('../../lib/utils.js', () => ({
  generateToken: mockGenerateToken
}));

jest.unstable_mockModule('../../models/User.js', () => ({
  default: Object.assign(mockUserConstructor, {
    findOne: mockUserFindOne
  })
}));

jest.unstable_mockModule('bcryptjs', () => ({
  default: {
    genSalt: mockBcryptGenSalt,
    hash: mockBcryptHash
  }
}));

const { signup } = await import('../../controllers/auth.controller.js');

describe('auth.controller.js - signup', () => {
  let mockReq;
  let mockRes;
  let consoleLogSpy;

  beforeEach(() => {
    // Setup mock request
    mockReq = {
      body: {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      }
    };

    // Setup mock response
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    // Setup console spy
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('Happy Path', () => {
    test('should successfully create a new user with valid data', async () => {
      const mockSavedUser = {
        _id: 'user123',
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'hashedpassword',
        profilePic: ''
      };

      mockUserFindOne.mockResolvedValue(null);
      mockBcryptGenSalt.mockResolvedValue('salt');
      mockBcryptHash.mockResolvedValue('hashedpassword');
      mockUserSave.mockResolvedValue(mockSavedUser);
      mockGenerateToken.mockReturnValue('mock-token');

      await signup(mockReq, mockRes);

      expect(mockUserFindOne).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(mockBcryptGenSalt).toHaveBeenCalledWith(10);
      expect(mockBcryptHash).toHaveBeenCalledWith('password123', 'salt');
      expect(mockUserSave).toHaveBeenCalled();
      expect(mockGenerateToken).toHaveBeenCalledWith('user123', mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        user: {
          _id: expect.any(String),
          fullName: 'John Doe',
          email: 'john@example.com',
          profilePic: ''
        }
      });
    });

    test('should hash password with bcrypt before saving', async () => {
      mockUserFindOne.mockResolvedValue(null);
      mockBcryptGenSalt.mockResolvedValue('test-salt');
      mockBcryptHash.mockResolvedValue('hashed-password-123');
      mockUserSave.mockResolvedValue({ _id: 'user123' });

      await signup(mockReq, mockRes);

      expect(mockBcryptHash).toHaveBeenCalledWith('password123', 'test-salt');
    });

    test('should generate token after saving user', async () => {
      const savedUser = {
        _id: 'saved-user-id',
        fullName: 'John Doe',
        email: 'john@example.com'
      };

      mockUserFindOne.mockResolvedValue(null);
      mockBcryptGenSalt.mockResolvedValue('salt');
      mockBcryptHash.mockResolvedValue('hashed');
      mockUserSave.mockResolvedValue(savedUser);

      await signup(mockReq, mockRes);

      expect(mockUserSave).toHaveBeenCalled();
      expect(mockGenerateToken).toHaveBeenCalledWith('saved-user-id', mockRes);
    });

    test('should use saved user ID for token generation, not new user ID', async () => {
      const savedUser = {
        _id: 'different-id-after-save',
        fullName: 'John Doe',
        email: 'john@example.com'
      };

      mockUserFindOne.mockResolvedValue(null);
      mockBcryptGenSalt.mockResolvedValue('salt');
      mockBcryptHash.mockResolvedValue('hashed');
      mockUserSave.mockResolvedValue(savedUser);

      await signup(mockReq, mockRes);

      expect(mockGenerateToken).toHaveBeenCalledWith('different-id-after-save', mockRes);
    });
  });

  describe('Validation - Missing Fields', () => {
    test('should return 400 when fullName is missing', async () => {
      mockReq.body.fullName = undefined;

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'All fields are required'
      });
      expect(mockUserFindOne).not.toHaveBeenCalled();
    });

    test('should return 400 when email is missing', async () => {
      mockReq.body.email = undefined;

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'All fields are required'
      });
    });

    test('should return 400 when password is missing', async () => {
      mockReq.body.password = undefined;

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'All fields are required'
      });
    });

    test('should return 400 when all fields are missing', async () => {
      mockReq.body = {};

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'All fields are required'
      });
    });

    test('should return 400 when fullName is empty string', async () => {
      mockReq.body.fullName = '';

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'All fields are required'
      });
    });

    test('should return 400 when email is empty string', async () => {
      mockReq.body.email = '';

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test('should return 400 when password is empty string', async () => {
      mockReq.body.password = '';

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test('should return 400 when fields are null', async () => {
      mockReq.body = {
        fullName: null,
        email: null,
        password: null
      };

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Validation - Password Length', () => {
    test('should return 400 when password is less than 6 characters', async () => {
      mockReq.body.password = '12345';

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    });

    test('should accept password with exactly 6 characters', async () => {
      mockReq.body.password = '123456';
      mockUserFindOne.mockResolvedValue(null);
      mockBcryptGenSalt.mockResolvedValue('salt');
      mockBcryptHash.mockResolvedValue('hashed');
      mockUserSave.mockResolvedValue({ _id: 'user123' });

      await signup(mockReq, mockRes);

      expect(mockRes.status).not.toHaveBeenCalledWith(400);
      expect(mockUserFindOne).toHaveBeenCalled();
    });

    test('should accept password with more than 6 characters', async () => {
      mockReq.body.password = 'verylongpassword123';
      mockUserFindOne.mockResolvedValue(null);
      mockBcryptGenSalt.mockResolvedValue('salt');
      mockBcryptHash.mockResolvedValue('hashed');
      mockUserSave.mockResolvedValue({ _id: 'user123' });

      await signup(mockReq, mockRes);

      expect(mockRes.status).not.toHaveBeenCalledWith(400);
    });

    test('should return 400 for 5 character password', async () => {
      mockReq.body.password = '12345';

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test('should return 400 for 1 character password', async () => {
      mockReq.body.password = '1';

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Validation - Email Format', () => {
    test('should return 400 for invalid email format', async () => {
      mockReq.body.email = 'invalid-email';

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid email format'
      });
    });

    test('should return 400 for email without @', async () => {
      mockReq.body.email = 'invalidemail.com';

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test('should return 400 for email without domain', async () => {
      mockReq.body.email = 'invalid@';

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test('should return 400 for email without extension', async () => {
      mockReq.body.email = 'invalid@example';

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test('should accept valid email formats', async () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user123@test-domain.com'
      ];

      for (const email of validEmails) {
        mockReq.body.email = email;
        mockUserFindOne.mockResolvedValue(null);
        mockBcryptGenSalt.mockResolvedValue('salt');
        mockBcryptHash.mockResolvedValue('hashed');
        mockUserSave.mockResolvedValue({ _id: 'user123' });

        await signup(mockReq, mockRes);

        expect(mockRes.status).not.toHaveBeenCalledWith(400);
        jest.clearAllMocks();
      }
    });

    test('should reject email with spaces', async () => {
      mockReq.body.email = 'test @example.com';

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test('should reject email with multiple @', async () => {
      mockReq.body.email = 'test@@example.com';

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Duplicate Email Check', () => {
    test('should return 400 when email already exists', async () => {
      mockUserFindOne.mockResolvedValue({
        _id: 'existing-user',
        email: 'john@example.com'
      });

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Email already exists'
      });
      expect(mockBcryptGenSalt).not.toHaveBeenCalled();
    });

    test('should check for existing email before processing', async () => {
      mockUserFindOne.mockResolvedValue({
        _id: 'existing-user',
        email: 'john@example.com'
      });

      await signup(mockReq, mockRes);

      expect(mockUserFindOne).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(mockBcryptHash).not.toHaveBeenCalled();
      expect(mockUserSave).not.toHaveBeenCalled();
    });

    test('should perform case-sensitive email check', async () => {
      mockReq.body.email = 'John@Example.com';
      mockUserFindOne.mockResolvedValue(null);
      mockBcryptGenSalt.mockResolvedValue('salt');
      mockBcryptHash.mockResolvedValue('hashed');
      mockUserSave.mockResolvedValue({ _id: 'user123' });

      await signup(mockReq, mockRes);

      expect(mockUserFindOne).toHaveBeenCalledWith({ email: 'John@Example.com' });
    });
  });

  describe('Error Handling', () => {
    test('should return 500 when database error occurs', async () => {
      mockUserFindOne.mockRejectedValue(new Error('Database connection failed'));

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Interval server error'
      });
    });

    test('should log error when exception occurs', async () => {
      const error = new Error('Test error');
      mockUserFindOne.mockRejectedValue(error);

      await signup(mockReq, mockRes);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Error in signup controller:',
        error
      );
    });

    test('should return 500 when bcrypt fails', async () => {
      mockUserFindOne.mockResolvedValue(null);
      mockBcryptGenSalt.mockRejectedValue(new Error('Bcrypt error'));

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    test('should return 500 when user save fails', async () => {
      mockUserFindOne.mockResolvedValue(null);
      mockBcryptGenSalt.mockResolvedValue('salt');
      mockBcryptHash.mockResolvedValue('hashed');
      mockUserSave.mockRejectedValue(new Error('Save failed'));

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    test('should handle generateToken errors', async () => {
      mockUserFindOne.mockResolvedValue(null);
      mockBcryptGenSalt.mockResolvedValue('salt');
      mockBcryptHash.mockResolvedValue('hashed');
      mockUserSave.mockResolvedValue({ _id: 'user123' });
      mockGenerateToken.mockImplementation(() => {
        throw new Error('Token generation failed');
      });

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('Response Format', () => {
    test('should return user object without password', async () => {
      mockUserFindOne.mockResolvedValue(null);
      mockBcryptGenSalt.mockResolvedValue('salt');
      mockBcryptHash.mockResolvedValue('hashed');
      mockUserSave.mockResolvedValue({
        _id: 'user123',
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'hashedpassword',
        profilePic: ''
      });

      await signup(mockReq, mockRes);

      const responseCall = mockRes.json.mock.calls[0][0];
      expect(responseCall.user).not.toHaveProperty('password');
    });

    test('should return success: true on successful signup', async () => {
      mockUserFindOne.mockResolvedValue(null);
      mockBcryptGenSalt.mockResolvedValue('salt');
      mockBcryptHash.mockResolvedValue('hashed');
      mockUserSave.mockResolvedValue({ _id: 'user123' });

      await signup(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    test('should include user _id, fullName, email, and profilePic in response', async () => {
      mockUserFindOne.mockResolvedValue(null);
      mockBcryptGenSalt.mockResolvedValue('salt');
      mockBcryptHash.mockResolvedValue('hashed');
      mockUserSave.mockResolvedValue({
        _id: 'user123',
        fullName: 'John Doe',
        email: 'john@example.com',
        profilePic: 'default.jpg'
      });

      await signup(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        user: {
          _id: expect.any(String),
          fullName: 'John Doe',
          email: 'john@example.com',
          profilePic: expect.any(String)
        }
      });
    });

    test('should return 201 status code for successful creation', async () => {
      mockUserFindOne.mockResolvedValue(null);
      mockBcryptGenSalt.mockResolvedValue('salt');
      mockBcryptHash.mockResolvedValue('hashed');
      mockUserSave.mockResolvedValue({ _id: 'user123' });

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('Bcrypt Configuration', () => {
    test('should use salt rounds of 10', async () => {
      mockUserFindOne.mockResolvedValue(null);
      mockBcryptGenSalt.mockResolvedValue('salt');
      mockBcryptHash.mockResolvedValue('hashed');
      mockUserSave.mockResolvedValue({ _id: 'user123' });

      await signup(mockReq, mockRes);

      expect(mockBcryptGenSalt).toHaveBeenCalledWith(10);
    });

    test('should hash password with generated salt', async () => {
      const customSalt = 'custom-salt-value';
      mockUserFindOne.mockResolvedValue(null);
      mockBcryptGenSalt.mockResolvedValue(customSalt);
      mockBcryptHash.mockResolvedValue('hashed');
      mockUserSave.mockResolvedValue({ _id: 'user123' });

      await signup(mockReq, mockRes);

      expect(mockBcryptHash).toHaveBeenCalledWith('password123', customSalt);
    });
  });

  describe('Edge Cases', () => {
    test('should handle very long fullName', async () => {
      mockReq.body.fullName = 'A'.repeat(1000);
      mockUserFindOne.mockResolvedValue(null);
      mockBcryptGenSalt.mockResolvedValue('salt');
      mockBcryptHash.mockResolvedValue('hashed');
      mockUserSave.mockResolvedValue({ _id: 'user123' });

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    test('should handle special characters in fullName', async () => {
      mockReq.body.fullName = "John O'Reilly-Smith";
      mockUserFindOne.mockResolvedValue(null);
      mockBcryptGenSalt.mockResolvedValue('salt');
      mockBcryptHash.mockResolvedValue('hashed');
      mockUserSave.mockResolvedValue({ _id: 'user123' });

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    test('should handle unicode characters in fullName', async () => {
      mockReq.body.fullName = '张伟';
      mockUserFindOne.mockResolvedValue(null);
      mockBcryptGenSalt.mockResolvedValue('salt');
      mockBcryptHash.mockResolvedValue('hashed');
      mockUserSave.mockResolvedValue({ _id: 'user123' });

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    test('should handle very long password', async () => {
      mockReq.body.password = 'a'.repeat(1000);
      mockUserFindOne.mockResolvedValue(null);
      mockBcryptGenSalt.mockResolvedValue('salt');
      mockBcryptHash.mockResolvedValue('hashed');
      mockUserSave.mockResolvedValue({ _id: 'user123' });

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    test('should handle special characters in password', async () => {
      mockReq.body.password = 'P@ssw0rd!#$%^&*()';
      mockUserFindOne.mockResolvedValue(null);
      mockBcryptGenSalt.mockResolvedValue('salt');
      mockBcryptHash.mockResolvedValue('hashed');
      mockUserSave.mockResolvedValue({ _id: 'user123' });

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('Execution Order Fix Validation', () => {
    test('should save user before generating token', async () => {
      const callOrder = [];
      
      mockUserFindOne.mockResolvedValue(null);
      mockBcryptGenSalt.mockResolvedValue('salt');
      mockBcryptHash.mockResolvedValue('hashed');
      
      mockUserSave.mockImplementation(async () => {
        callOrder.push('save');
        return { _id: 'user123' };
      });
      
      mockGenerateToken.mockImplementation(() => {
        callOrder.push('generateToken');
        return 'token';
      });

      await signup(mockReq, mockRes);

      expect(callOrder).toEqual(['save', 'generateToken']);
    });

    test('should use savedUser._id not newUser._id for token', async () => {
      const newUserId = 'temp-id-before-save';
      const savedUserId = 'persistent-id-after-save';

      mockUserFindOne.mockResolvedValue(null);
      mockBcryptGenSalt.mockResolvedValue('salt');
      mockBcryptHash.mockResolvedValue('hashed');
      mockUserSave.mockResolvedValue({ _id: savedUserId });

      await signup(mockReq, mockRes);

      expect(mockGenerateToken).toHaveBeenCalledWith(savedUserId, mockRes);
    });

    test('should await user.save() before calling generateToken', async () => {
      let saveCompleted = false;
      
      mockUserFindOne.mockResolvedValue(null);
      mockBcryptGenSalt.mockResolvedValue('salt');
      mockBcryptHash.mockResolvedValue('hashed');
      
      mockUserSave.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        saveCompleted = true;
        return { _id: 'user123' };
      });
      
      mockGenerateToken.mockImplementation(() => {
        expect(saveCompleted).toBe(true);
        return 'token';
      });

      await signup(mockReq, mockRes);
    });
  });
});
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuthService = require('../services/authService');
const UserService = require('../services/userService');
const ApiResponse = require('../utils/apiResponse');
const { JWT_SECRET, JWT_EXPIRATION } = process.env;

const register = async (req, res) => {
    try {
      const user = await UserService.createUser(req.body);
      const tokens = AuthService.generateTokens(user._id);
  
      return ApiResponse.success(res, {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles,
          groups: user.groups
        },
        tokens
      }, 'Registration successful', 201);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  };

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return ApiResponse.error(res, 'Refresh token is required', 400);
    }

    const user = await AuthService.verifyRefreshToken(refreshToken);
    const tokens = AuthService.generateTokens(user._id);

    return ApiResponse.success(res, { tokens }, 'Token refreshed successfully');
  } catch (error) {
    return ApiResponse.error(res, error.message, 401);
  }
};

const logout = async (req, res) => {
  try {
    await AuthService.revokeRefreshToken(req.user._id);
    return ApiResponse.success(res, null, 'Logged out successfully');
  } catch (error) {
    return ApiResponse.error(res, error.message);
  }
};

const login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await AuthService.authenticateUser(email, password);
      const tokens = AuthService.generateTokens(user._id);
  
      return ApiResponse.success(res, {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles,
          permissions: user.permissions
        },
        tokens
      }, 'Login successful');
    } catch (error) {
      return ApiResponse.error(res, error.message, 401);
    }
  };

module.exports = { register, login, logout, refreshToken };
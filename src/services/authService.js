const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');

class AuthService {
    static async authenticateUser(email, password) {
        const user = await User.findOne({ email })
          .populate('roles')
          .populate('permissions');
    
        if (!user || !user.isActive) {
          throw new Error('Invalid credentials');
        }
    
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          throw new Error('Invalid credentials');
        }
    
        // Update last login
        user.lastLogin = new Date();
        await user.save();
    
        return user;
      }

  static generateTokens(userId) {
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRATION  }
    );

    return { accessToken, refreshToken };
  }

  static async verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static async revokeRefreshToken(userId) {
    return true;
  }
}

module.exports = AuthService;

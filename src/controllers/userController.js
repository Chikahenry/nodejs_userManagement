const UserService = require('../services/userService');
const ApiResponse = require('../utils/apiResponse');

const userController = {
  getCurrentUser: async (req, res) => {
    const user = await UserService.getUserProfile(req.user._id);
    return ApiResponse.success(res, user);
  },

  updateProfile: async (req, res) => {
    const { firstName, lastName, email } = req.body;
    const updatedUser = await UserService.updateUserProfile(req.user._id, {
      firstName,
      lastName,
      email
    });
    return ApiResponse.success(res, updatedUser);
  },

  // Get all users (admin)
  getAllUsers: async (req, res) => {
    const { page, limit, search, role, group, status } = req.query;
    const users = await UserService.getAllUsers({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      search,
      role,
      group,
      status
    });
    return ApiResponse.success(res, users);
  },

  getUserById: async (req, res) => {
    const user = await UserService.getUserById(req.params.id);
    if (!user) {
      return ApiResponse.error(res, 'User not found', 404);
    }
    return ApiResponse.success(res, user);
  },

  // Update user (admin)
  updateUser: async (req, res) => {
    const { id } = req.params;
    const userData = req.body;
    const user = await UserService.updateUser(id, userData);
    return ApiResponse.success(res, user);
  },

  // Delete user (admin)
  deleteUser: async (req, res) => {
    await UserService.deleteUser(req.params.id);
    return ApiResponse.success(res, null, 'User deleted successfully');
  },

  // Update user roles (admin)
  updateUserRoles: async (req, res) => {
    const { id } = req.params;
    const { roleIds } = req.body;
    const user = await UserService.updateUserRoles(id, roleIds);
    return ApiResponse.success(res, user);
  },

  // Update user groups (admin)
  updateUserGroups: async (req, res) => {
    const { id } = req.params;
    const { groupIds } = req.body;
    const user = await UserService.updateUserGroups(id, groupIds);
    return ApiResponse.success(res, user);
  },

  // Update user permissions (admin)
  updateUserPermissions: async (req, res) => {
    const { id } = req.params;
    const { permissionIds } = req.body;
    const user = await UserService.updateUserPermissions(id, permissionIds);
    return ApiResponse.success(res, user);
  },

  // Update user status (admin)
  updateUserStatus: async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;
    const user = await UserService.updateUserStatus(id, isActive);
    return ApiResponse.success(res, user);
  },

  // Bulk create users (admin)
  bulkCreateUsers: async (req, res) => {
    const { users } = req.body;
    const createdUsers = await UserService.bulkCreateUsers(users);
    return ApiResponse.success(res, createdUsers, 'Users created successfully', 201);
  },

  // Bulk update users (admin)
  bulkUpdateUsers: async (req, res) => {
    const { updates } = req.body;
    const updatedUsers = await UserService.bulkUpdateUsers(updates);
    return ApiResponse.success(res, updatedUsers);
  }
};

module.exports = userController;
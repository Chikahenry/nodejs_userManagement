const User = require('../models/User');
const Role = require('../models/Role');
const Group = require('../models/Group');
const Permission = require('../models/Permission');

class UserService {
  static async getAllUsers({ page = 1, limit = 10, search, role, group, status }) {
    const query = {};

    if (search) {
      query.$or = [
        { email: new RegExp(search, 'i') },
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') }
      ];
    }

    if (role) query.roles = role;
    if (group) query.groups = group;
    if (status !== undefined) query.isActive = status === 'active';

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .populate('roles')
        .populate('groups')
        .populate('permissions')
        .skip(skip)
        .limit(limit)
        .select('-password'),
      User.countDocuments(query)
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async getUserById(userId) {
    return User.findById(userId)
      .populate('roles')
      .populate('groups')
      .populate('permissions')
      .select('-password');
  }

  static async createUser(userData) {
    const { email, password, firstName, lastName, roleIds, groupIds } = userData;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    let finalRoleIds = roleIds;
    let finalGroupIds = groupIds;

    if (!roleIds || roleIds.length === 0) {
      const defaultRole = await Role.findOne({ name: DEFAULT_CONFIG.roles.default });
      finalRoleIds = [defaultRole._id];
    }

    if (!groupIds || groupIds.length === 0) {
      const defaultGroup = await Group.findOne({ name: DEFAULT_CONFIG.groups.default });
      finalGroupIds = [defaultGroup._id];
    }

    // Create user with roles and groups
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      roles: finalRoleIds,
      groups: finalGroupIds
    });

    await user.save();

    // Add user to groups
    await Group.updateMany(
      { _id: { $in: finalGroupIds } },
      { $addToSet: { members: user._id } }
    );

    // Return user without password
    const populatedUser = await User.findById(user._id)
      .populate('roles')
      .populate('groups')
      .select('-password');

    return populatedUser;
  }

  static async updateUser(userId, updateData) {
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).populate(['roles', 'groups', 'permissions']);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  }

  static async deleteUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Remove user from all groups
    await Group.updateMany(
      { members: userId },
      { $pull: { members: userId } }
    );

    await user.remove();
    return true;
  }

  static async updateUserRoles(userId, roleIds) {
    const [user, roles] = await Promise.all([
      User.findById(userId),
      Role.find({ _id: { $in: roleIds } })
    ]);

    if (!user) {
      throw new Error('User not found');
    }

    if (roles.length !== roleIds.length) {
      throw new Error('Some roles do not exist');
    }

    user.roles = roleIds;
    await user.save();

    return user.populate(['roles', 'groups', 'permissions']);
  }

  static async updateUserGroups(userId, groupIds) {
    const [user, groups] = await Promise.all([
      User.findById(userId),
      Group.find({ _id: { $in: groupIds } })
    ]);

    if (!user) {
      throw new Error('User not found');
    }

    if (groups.length !== groupIds.length) {
      throw new Error('Some groups do not exist');
    }

    // Remove user from old groups
    await Group.updateMany(
      { members: userId },
      { $pull: { members: userId } }
    );

    // Add user to new groups
    await Group.updateMany(
      { _id: { $in: groupIds } },
      { $addToSet: { members: userId } }
    );

    user.groups = groupIds;
    await user.save();

    return user.populate(['roles', 'groups', 'permissions']);
  }

  static async updateUserStatus(userId, isActive) {
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).populate(['roles', 'groups', 'permissions']);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  static async bulkCreateUsers(users) {
    return User.insertMany(users, { runValidators: true });
  }

  static async bulkUpdateUsers(updates) {
    const bulkOps = updates.map(update => ({
      updateOne: {
        filter: { _id: update.id },
        update: { $set: update.data },
        runValidators: true
      }
    }));

    return User.bulkWrite(bulkOps);
  }
}

module.exports = UserService;
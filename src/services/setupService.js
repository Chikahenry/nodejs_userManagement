const Role = require('../models/Role');
const Group = require('../models/Group');
const Permission = require('../models/Permission');
const DEFAULT_CONFIG = require('../config/defaults');

const setupDefaultsService = {
  async initializeDefaults() {
    await this.createDefaultPermissions();
    await this.createDefaultRoles();
    await this.createDefaultGroups();
  },

  async createDefaultPermissions() {
    const allPermissions = new Set();
    Object.values(DEFAULT_CONFIG.permissions).forEach(perms => {
      perms.forEach(perm => allPermissions.add(perm));
    });

    for (const permName of allPermissions) {
      const [action, resource] = permName.split(':');
      await Permission.findOneAndUpdate(
        { name: permName },
        {
          name: permName,
          action,
          resource,
          description: `Permission to ${action} ${resource}`
        },
        { upsert: true }
      );
    }
  },

  async createDefaultRoles() {
    for (const roleName of DEFAULT_CONFIG.roles.system) {
      const permissions = await Permission.find({
        name: { $in: DEFAULT_CONFIG.permissions[roleName] || [] }
      });

      await Role.findOneAndUpdate(
        { name: roleName },
        {
          name: roleName,
          description: `${roleName} role`,
          permissions: permissions.map(p => p._id)
        },
        { upsert: true }
      );
    }
  },

  async createDefaultGroups() {
    for (const groupName of DEFAULT_CONFIG.groups.system) {
      await Group.findOneAndUpdate(
        { name: groupName },
        {
          name: groupName,
          description: `${groupName} group`
        },
        { upsert: true }
      );
    }
  }
};

module.exports = setupDefaultsService;
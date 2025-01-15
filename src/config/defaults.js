const DEFAULT_CONFIG = {
    roles: {
      default: 'USER',
      system: ['ADMIN', 'USER', 'MANAGER']
    },
    groups: {
      default: 'GENERAL',
      system: ['GENERAL', 'SUPPORT', 'OPERATIONS']
    },
    permissions: {
      USER: [
        'read:own_profile',
        'update:own_profile',
        'read:public_content'
      ],
      MANAGER: [
        'read:team_profiles',
        'update:team_profiles',
        'create:content',
        'update:content'
      ],
      ADMIN: [
        'manage:users',
        'manage:roles',
        'manage:permissions',
        'manage:groups'
      ]
    }
  };
  
  module.exports = DEFAULT_CONFIG;
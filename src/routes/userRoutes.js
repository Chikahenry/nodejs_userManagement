const express = require('express');
const router = express.Router();
const { auth, checkPermission } = require('../middleware/auth');
const userController = require('../controllers/userController');
const { validate, userValidationSchema } = require('../middleware/validator');
const asyncHandler = require('../utils/asyncHandler');

// Public routes (if any)

// Protected routes
router.get('/me', 
  auth, 
  asyncHandler(userController.getCurrentUser)
);

router.put('/me',
  auth,
  validate({
    firstName: userValidationSchema.firstName,
    lastName: userValidationSchema.lastName,
    email: userValidationSchema.email
  }),
  asyncHandler(userController.updateProfile)
);

// router.put('/me/password',
//   auth,
//   validate({
//     currentPassword: { notEmpty: true },
//     newPassword: userValidationSchema.password
//   }),
//   asyncHandler(userController.changePassword)
// );

// Admin routes
router.get('/',
  auth,
  checkPermission('manage:users'),
  asyncHandler(userController.getAllUsers)
);

router.get('/:id',
  auth,
  checkPermission('manage:users'),
  asyncHandler(userController.getUserById)
);

router.post('/',
  auth,
  checkPermission('manage:users'),
  validate(userValidationSchema),
  asyncHandler(userController.createUser)
);

router.put('/:id',
  auth,
  checkPermission('manage:users'),
  validate(userValidationSchema),
  asyncHandler(userController.updateUser)
);

router.delete('/:id',
  auth,
  checkPermission('manage:users'),
  asyncHandler(userController.deleteUser)
);

// Role management
// router.put('/:id/roles',
//   auth,
//   checkPermission('manage:users'),
//   asyncHandler(userController.updateUserRoles)
// );

// Group management
// router.put('/:id/groups',
//   auth,
//   checkPermission('manage:users'),
//   asyncHandler(userController.updateUserGroups)
// );

// Permission management
// router.put('/:id/permissions',
//   auth,
//   checkPermission('manage:users'),
//   asyncHandler(userController.updateUserPermissions)
// );

// User status
// router.put('/:id/status',
//   auth,
//   checkPermission('manage:users'),
//   asyncHandler(userController.updateUserStatus)
// );

// Bulk operations
// router.post('/bulk-create',
//   auth,
//   checkPermission('manage:users'),
//   asyncHandler(userController.bulkCreateUsers)
// );

// router.post('/bulk-update',
//   auth,
//   checkPermission('manage:users'),
//   asyncHandler(userController.bulkUpdateUsers)
// );

module.exports = router;
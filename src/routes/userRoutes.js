const express = require('express');
const router = express.Router();
const { auth, checkPermission } = require('../middleware/auth');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const { validate, userValidationSchema } = require('../middleware/validator');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users with filtering and pagination
 *     description: Retrieve a list of users with optional filtering by search term, role, group, and status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering users by name or email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter users by role ID
 *       - in: query
 *         name: group
 *         schema:
 *           type: string
 *         description: Filter users by group ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter users by status
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 100
 *                         currentPage:
 *                           type: number
 *                           example: 1
 *                         totalPages:
 *                           type: number
 *                           example: 10
 *                         limit:
 *                           type: number
 *                           example: 10
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal Server Error
 */
router.get('/', 
  auth, 
  checkPermission('read:users'),
  asyncHandler(userController.getAllUsers)
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user by ID
 *     description: Retrieve a user by their ID with populated roles, groups, and permissions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/:id',
  auth,
  checkPermission('read:users'),
  asyncHandler(userController.getUserById)
);

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile management endpoints
 *
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: uuid
 *           example: "507f1f77bcf86cd799439011"
 *         email:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *         firstName:
 *           type: string
 *           example: "John"
 *         lastName:
 *           type: string
 *           example: "Doe"
 *         roles:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               name:
 *                 type: string
 *         groups:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               name:
 *                 type: string
 *         isActive:
 *           type: boolean
 *         lastLogin:
 *           type: string
 *           format: date-time
 *
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Authentication failed"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error fetching user profile"
 *
 *   put:
 *     summary: Update current user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation Error"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["First name is required", "Invalid email format"]
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       500:
 *         description: Internal server error
 *
 * @swagger
 * /api/users/me/password:
 *   put:
 *     summary: Change current user password
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: "currentPass123"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: "newPass123"
 *                 minLength: 8
 *             required:
 *               - currentPassword
 *               - newPassword
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Password updated successfully"
 *       400:
 *         description: Validation error or incorrect current password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Current password is incorrect"
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       500:
 *         description: Internal server error
 */
router.get('api/users/me', 
  auth, 
  asyncHandler(userController.getCurrentUser)
);

router.put('api/users/me',
  auth,
  validate({
    firstName: userValidationSchema.firstName,
    lastName: userValidationSchema.lastName,
    email: userValidationSchema.email
  }),
  asyncHandler(userController.updateProfile)
);

router.put('api/users/me/password',
  auth,
  validate({
    currentPassword: { notEmpty: true },
    newPassword: userValidationSchema.password
  }),
  asyncHandler(userController.changePassword)
);

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
  asyncHandler(authController.register)
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

/**
 * @swagger
  /api/users/{id}/roles:
    put:
      summary: Update user roles
      security:
        - BearerAuth: []
      tags:
        - Users
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
          description: User ID
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - roleIds
              properties:
                roleIds:
                  type: array
                  items:
                    type: string
      responses:
        '200':
          description: User roles updated successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    $ref: '#/components/schemas/User'
*/
router.put('api/users/:id/roles',
  auth,
  checkPermission('manage:users'),
  asyncHandler(userController.updateUserRoles)
);

/**
 * @swagger
  /api/users/{id}/groups:
    put:
      summary: Update user groups
      security:
        - BearerAuth: []
      tags:
        - Users
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
          description: User ID
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - groupIds
              properties:
                groupIds:
                  type: array
                  items:
                    type: string
      responses:
        '200':
          description: User groups updated successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    $ref: '#/components/schemas/User'
*/
router.put('api/users/:id/groups',
  auth,
  checkPermission('manage:users'),
  asyncHandler(userController.updateUserGroups)
);

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
const express = require('express');
const router = express.Router();
const { validate, userValidationSchema } = require('../middleware/validator');
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

router.post('/register', 
  validate(userValidationSchema),
  asyncHandler(authController.register)
);

router.post('/login',
  validate({
    email: userValidationSchema.email,
    password: { notEmpty: true }
  }),
  asyncHandler(authController.login)
);

router.post('/refresh-token',
  asyncHandler(authController.refreshToken)
);

router.post('/logout',
  auth,
  asyncHandler(authController.logout)
);

module.exports = router;
const { validationResult, checkSchema } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors.array()
      });
    }
    next();
  };
};

// User Validation schemas
const userValidationSchema = {
  email: {
    isEmail: true,
    normalizeEmail: true,
    trim: true
  },
  password: {
    isLength: {
      options: { min: 8 },
      errorMessage: 'Password must be at least 8 characters long'
    }
  },
  firstName: {
    trim: true,
    notEmpty: true,
    errorMessage: 'First name is required'
  },
  lastName: {
    trim: true,
    notEmpty: true,
    errorMessage: 'Last name is required'
  }
};

module.exports = {
  validate,
  userValidationSchema
};
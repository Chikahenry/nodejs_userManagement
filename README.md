# User Management System

A comprehensive Node.js application implementing CRUD operations for users, roles, groups, and permissions with authentication and authorization.

## Features
- User authentication using JWT
- Role-based access control (RBAC)
- RESTful API
- Input validation
- Error handling
- MongoDB integration
- Environment configuration
- Password hashing
- Request logging

## Tech Stack
- Node.js & Express.js
- MongoDB & Mongoose
- JWT for authentication
- bcrypt for password hashing
- Winston for logging
- Jest for testing
- Express-validator for input validation

## Project Structure
```
user-management-system/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── logger.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── roleController.js
│   │   ├── groupController.js
│   │   └── permissionController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── requestLogger.js
│   │   └── validator.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Role.js
│   │   ├── Group.js
│   │   └── Permission.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── roleRoutes.js
│   │   ├── groupRoutes.js
│   │   └── permissionRoutes.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── roleService.js
│   │   ├── groupService.js
│   │   └── permissionService.js
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   └── apiResponse.js
│   └── app.js
├── tests/
│   ├── integration/
│   │   └── auth.test.js
│   └── unit/
│       └── userService.test.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Database Schema

### User Schema
```javascript
{
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}
```

### Role Schema
```javascript
{
  name: { type: String, required: true, unique: true },
  description: String,
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}
```

### Group Schema
```javascript
{
  name: { type: String, required: true, unique: true },
  description: String,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}
```

### Permission Schema
```javascript
{
  name: { type: String, required: true, unique: true },
  description: String,
  resource: { type: String, required: true },
  action: { type: String, required: true, enum: ['create', 'read', 'update', 'delete'] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}
```

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/yourusername/user-management-system.git
cd user-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Create .env file:
```bash
cp .env.example .env
```

4. Update .env with your configuration:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/user-management
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=24h
NODE_ENV=development
```

5. Start MongoDB:
```bash
mongod
```

6. Run the application:
```bash
# Development
npm run dev

# Production
npm start
```

7. Run tests:
```bash
npm test
```

## API Documentation

### Authentication
```
POST /api/auth/register - Register new user
POST /api/auth/login - Login user
POST /api/auth/logout - Logout user
POST /api/auth/refresh-token - Refresh JWT token
```

### Users
```
GET /api/users - Get all users
GET /api/users/:id - Get user by ID
POST /api/users - Create new user
PUT /api/users/:id - Update user
DELETE /api/users/:id - Delete user
PUT /api/users/:id/roles - Update user roles
```

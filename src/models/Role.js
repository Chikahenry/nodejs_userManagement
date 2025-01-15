const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  description: {
    type: String,
    required: true
  },
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

roleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Role = mongoose.model('Role', roleSchema);
module.exports = Role;
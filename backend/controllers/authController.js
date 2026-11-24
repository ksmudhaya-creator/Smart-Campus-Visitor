const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const SecurityLog = require('../models/SecurityLog');
const { generateLogId } = require('../utils/generateId');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, phone, badgeNumber } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }

    // Restrict initial role creation if not admin (default to VISITOR or SECURITY)
    const assignedRole = ['ADMIN', 'SECURITY', 'VISITOR'].includes(role?.toUpperCase())
      ? role.toUpperCase()
      : 'VISITOR';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: assignedRole,
      department: department || 'General',
      phone: phone || '',
      badgeNumber: badgeNumber || ''
    });

    // Create log
    await SecurityLog.create({
      logId: generateLogId(),
      userId: { id: user._id, name: user.name, role: user.role },
      action: 'USER_REGISTERED',
      description: `New user account created: ${user.name} (${user.role})`,
      status: 'SUCCESS'
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        badgeNumber: user.badgeNumber,
        token: generateToken(user._id, user.role)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact administrator.'
      });
    }

    // Log login
    await SecurityLog.create({
      logId: generateLogId(),
      userId: { id: user._id, name: user.name, role: user.role },
      action: 'USER_LOGIN',
      description: `User signed in: ${user.name} [Role: ${user.role}]`,
      status: 'SUCCESS'
    });

    res.json({
      success: true,
      message: 'Authentication successful.',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        badgeNumber: user.badgeNumber,
        token: generateToken(user._id, user.role)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.department = req.body.department || user.department;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        department: updatedUser.department,
        phone: updatedUser.phone,
        badgeNumber: updatedUser.badgeNumber
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
};

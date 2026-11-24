const User = require('../models/User');
const SecurityLog = require('../models/SecurityLog');
const { generateLogId } = require('../utils/generateId');

// @desc    Get all system users
// @route   GET /api/users
// @access  Private (Admin only)
const getUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== 'ALL') {
      query.role = role.toUpperCase();
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { email: regex }, { department: regex }, { badgeNumber: regex }];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a user account (Security, Admin, etc.)
// @route   POST /api/users
// @access  Private (Admin only)
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, phone, badgeNumber } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: password || 'Default@123',
      role: role ? role.toUpperCase() : 'SECURITY',
      department: department || 'Campus Security',
      phone: phone || '',
      badgeNumber: badgeNumber || ''
    });

    await SecurityLog.create({
      logId: generateLogId(),
      userId: { id: req.user._id, name: req.user.name, role: req.user.role },
      action: 'ADMIN_CREATE_USER',
      description: `Admin created new account: ${user.name} (${user.role})`,
      status: 'SUCCESS'
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        badgeNumber: user.badgeNumber,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active/suspended state
// @route   PATCH /api/users/:id/toggle-status
// @access  Private (Admin only)
const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own administrative account.'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    await SecurityLog.create({
      logId: generateLogId(),
      userId: { id: req.user._id, name: req.user.name, role: req.user.role },
      action: 'ADMIN_USER_STATUS_CHANGE',
      description: `Admin updated user status for ${user.name} to ${user.isActive ? 'ACTIVE' : 'DEACTIVATED'}`,
      status: 'WARNING'
    });

    res.json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}.`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own administrative account.'
      });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await SecurityLog.create({
      logId: generateLogId(),
      userId: { id: req.user._id, name: req.user.name, role: req.user.role },
      action: 'ADMIN_DELETE_USER',
      description: `Admin deleted user account: ${user.name} (${user.email})`,
      status: 'WARNING'
    });

    res.json({
      success: true,
      message: 'User deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  createUser,
  toggleUserStatus,
  deleteUser
};

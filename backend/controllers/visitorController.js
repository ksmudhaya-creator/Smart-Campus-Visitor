const { Visitor } = require('../models/Visitor');
const VisitorStateHistory = require('../models/VisitorStateHistory');
const SecurityLog = require('../models/SecurityLog');
const { generateVisitorId, generateLogId } = require('../utils/generateId');
const { executeTransition } = require('../services/fsmService');

// @desc    Register a new visitor
// @route   POST /api/visitors
// @access  Public / Security / Admin
const createVisitor = async (req, res, next) => {
  try {
    const {
      fullName,
      mobileNumber,
      email,
      visitorType,
      collegeId,
      personToMeet,
      department,
      purpose,
      visitDate,
      expectedEntryTime,
      expectedExitTime,
      vehicleNumber,
      address,
      remarks
    } = req.body;

    // Check for duplicate active visitor with same mobile on the same date
    const targetDate = visitDate ? new Date(visitDate) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const existingActiveVisitor = await Visitor.findOne({
      mobileNumber,
      visitDate: { $gte: startOfDay, $lte: endOfDay },
      currentState: { $nin: ['CHECKED_OUT', 'REJECTED', 'CANCELLED'] }
    });

    if (existingActiveVisitor) {
      return res.status(400).json({
        success: false,
        message: `An active visitor pass (${existingActiveVisitor.visitorId}) already exists for mobile number ${mobileNumber} on this date. Current state: ${existingActiveVisitor.currentState}.`
      });
    }

    const visitorId = generateVisitorId();

    const registeredByUser = req.user
      ? `${req.user.name} (${req.user.role})`
      : 'SELF_REGISTRATION';

    const newVisitor = await Visitor.create({
      visitorId,
      fullName,
      mobileNumber,
      email,
      visitorType: visitorType || 'Academic Guest',
      collegeId: collegeId || '',
      personToMeet,
      department,
      purpose,
      visitDate: visitDate || new Date(),
      expectedEntryTime,
      expectedExitTime,
      vehicleNumber: vehicleNumber || '',
      address: address || '',
      remarks: remarks || '',
      currentState: 'REGISTERED',
      verificationStatus: 'PENDING',
      registeredBy: registeredByUser
    });

    const actionUser = {
      userId: req.user?._id || null,
      name: req.user?.name || 'Self Registration',
      role: req.user?.role || 'VISITOR'
    };

    // Log initial state in VisitorStateHistory
    await VisitorStateHistory.create({
      visitorId: newVisitor.visitorId,
      visitorDocId: newVisitor._id,
      previousState: 'NONE',
      newState: 'REGISTERED',
      actionBy: actionUser,
      isValid: true,
      reason: 'Visitor registration submitted to the system.',
      description: `Visitor ${newVisitor.fullName} registered for visit to ${newVisitor.department}`,
      transitionType: 'EXECUTED'
    });

    // Security Log
    await SecurityLog.create({
      logId: generateLogId(),
      userId: actionUser,
      visitorId: newVisitor.visitorId,
      action: 'VISITOR_REGISTERED',
      description: `New visitor registered: ${newVisitor.fullName} (${newVisitor.visitorId})`,
      previousState: 'NONE',
      newState: 'REGISTERED',
      status: 'SUCCESS'
    });

    res.status(201).json({
      success: true,
      message: 'Visitor registered successfully.',
      data: newVisitor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all visitors with filters and pagination
// @route   GET /api/visitors
// @access  Private (Security, Admin)
const getVisitors = async (req, res, next) => {
  try {
    const {
      search,
      state,
      department,
      visitorType,
      date,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {};

    if (state && state !== 'ALL') {
      query.currentState = state;
    }

    if (department && department !== 'ALL') {
      query.department = department;
    }

    if (visitorType && visitorType !== 'ALL') {
      query.visitorType = visitorType;
    }

    if (date) {
      const d = new Date(date);
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));
      query.visitDate = { $gte: startOfDay, $lte: endOfDay };
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { visitorId: regex },
        { fullName: regex },
        { mobileNumber: regex },
        { email: regex },
        { personToMeet: regex },
        { department: regex },
        { vehicleNumber: regex }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === 'asc' ? 1 : -1;

    const total = await Visitor.countDocuments(query);
    const visitors = await Visitor.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: visitors.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      data: visitors
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single visitor by ID or visitorId
// @route   GET /api/visitors/:id
// @access  Public / Private
const getVisitorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let visitor;

    // Check if MongoDB ObjectId or visitorId string
    if (id.startsWith('SCV-')) {
      visitor = await Visitor.findOne({ visitorId: id });
    } else {
      visitor = await Visitor.findById(id);
    }

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: `Visitor not found with ID ${id}`
      });
    }

    // Also get state history
    const history = await VisitorStateHistory.find({ visitorId: visitor.visitorId }).sort({
      timestamp: -1
    });

    res.json({
      success: true,
      data: visitor,
      history
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update visitor details
// @route   PUT /api/visitors/:id
// @access  Private (Security, Admin)
const updateVisitor = async (req, res, next) => {
  try {
    const { id } = req.params;
    let visitor = await Visitor.findOne({
      $or: [{ visitorId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found'
      });
    }

    const updatableFields = [
      'fullName',
      'mobileNumber',
      'email',
      'visitorType',
      'collegeId',
      'personToMeet',
      'department',
      'purpose',
      'expectedEntryTime',
      'expectedExitTime',
      'vehicleNumber',
      'address',
      'remarks'
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        visitor[field] = req.body[field];
      }
    });

    const updated = await visitor.save();

    await SecurityLog.create({
      logId: generateLogId(),
      userId: { id: req.user?._id, name: req.user?.name, role: req.user?.role },
      visitorId: visitor.visitorId,
      action: 'VISITOR_UPDATED',
      description: `Visitor details updated for ${visitor.fullName} (${visitor.visitorId})`,
      status: 'INFO'
    });

    res.json({
      success: true,
      message: 'Visitor details updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete visitor record
// @route   DELETE /api/visitors/:id
// @access  Private (Admin only)
const deleteVisitor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const visitor = await Visitor.findOne({
      $or: [{ visitorId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found'
      });
    }

    await Visitor.deleteOne({ _id: visitor._id });
    await VisitorStateHistory.deleteMany({ visitorId: visitor.visitorId });

    await SecurityLog.create({
      logId: generateLogId(),
      userId: { id: req.user?._id, name: req.user?.name, role: req.user?.role },
      visitorId: visitor.visitorId,
      action: 'VISITOR_DELETED',
      description: `Admin deleted visitor record: ${visitor.fullName} (${visitor.visitorId})`,
      status: 'WARNING'
    });

    res.json({
      success: true,
      message: `Visitor ${visitor.visitorId} deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify visitor identity
// @route   PUT /api/visitors/:id/verify
// @access  Private (Security, Admin)
const verifyVisitor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const visitor = await Visitor.findOne({
      $or: [{ visitorId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!visitor) {
      return res.status(404).json({ success: false, message: 'Visitor not found' });
    }

    // If currently REGISTERED, move to PENDING_VERIFICATION first if needed, or straight to VERIFIED if permitted
    if (visitor.currentState === 'REGISTERED') {
      await executeTransition({
        visitorId: visitor.visitorId,
        targetState: 'PENDING_VERIFICATION',
        user: req.user,
        description: 'Auto-advanced to PENDING_VERIFICATION for identity check'
      });
    }

    const result = await executeTransition({
      visitorId: visitor.visitorId,
      targetState: 'VERIFIED',
      user: req.user,
      description: remarks || 'Government ID and personal details verified by security staff'
    });

    res.json({
      success: true,
      message: 'Visitor identity verified successfully.',
      data: result.visitor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve visitor entry
// @route   PUT /api/visitors/:id/approve
// @access  Private (Security, Admin)
const approveVisitor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const visitor = await Visitor.findOne({
      $or: [{ visitorId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!visitor) {
      return res.status(404).json({ success: false, message: 'Visitor not found' });
    }

    const result = await executeTransition({
      visitorId: visitor.visitorId,
      targetState: 'ENTRY_APPROVED',
      user: req.user,
      description: remarks || 'Entry approved by campus authority'
    });

    res.json({
      success: true,
      message: 'Visitor campus entry approved successfully.',
      data: result.visitor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject visitor entry
// @route   PUT /api/visitors/:id/reject
// @access  Private (Security, Admin)
const rejectVisitor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, remarks } = req.body;

    const visitor = await Visitor.findOne({
      $or: [{ visitorId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!visitor) {
      return res.status(404).json({ success: false, message: 'Visitor not found' });
    }

    const result = await executeTransition({
      visitorId: visitor.visitorId,
      targetState: 'REJECTED',
      user: req.user,
      description: remarks || reason || 'Entry rejected by security/department',
      rejectionReason: reason || 'Security criteria not met'
    });

    res.json({
      success: true,
      message: 'Visitor entry has been rejected.',
      data: result.visitor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record visitor check-in
// @route   POST /api/visitors/:id/checkin
// @access  Private (Security, Admin)
const checkInVisitor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remarks, autoMoveInside = true } = req.body;

    const visitor = await Visitor.findOne({
      $or: [{ visitorId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!visitor) {
      return res.status(404).json({ success: false, message: 'Visitor not found' });
    }

    // Step 1: Transition ENTRY_APPROVED -> CHECKED_IN
    const checkInResult = await executeTransition({
      visitorId: visitor.visitorId,
      targetState: 'CHECKED_IN',
      user: req.user,
      description: remarks || 'Physical check-in at security gate. Pass badge issued.'
    });

    // Step 2: In real campus security, gate entry marks them INSIDE_CAMPUS
    let finalVisitor = checkInResult.visitor;
    if (autoMoveInside) {
      const insideResult = await executeTransition({
        visitorId: visitor.visitorId,
        targetState: 'INSIDE_CAMPUS',
        user: req.user,
        description: 'Visitor passed through campus gate barrier into campus grounds.'
      });
      finalVisitor = insideResult.visitor;
    }

    res.json({
      success: true,
      message: 'Visitor check-in completed. Visitor is now inside campus.',
      data: finalVisitor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record visitor check-out
// @route   POST /api/visitors/:id/checkout
// @access  Private (Security, Admin)
const checkOutVisitor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const visitor = await Visitor.findOne({
      $or: [{ visitorId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!visitor) {
      return res.status(404).json({ success: false, message: 'Visitor not found' });
    }

    const result = await executeTransition({
      visitorId: visitor.visitorId,
      targetState: 'CHECKED_OUT',
      user: req.user,
      description: remarks || 'Exit gate scan completed; visitor left campus.'
    });

    res.json({
      success: true,
      message: `Visitor check-out recorded. Total duration: ${result.visitor.totalDurationMinutes} mins.`,
      data: result.visitor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Quick search for visitor by ID or Phone (Public / Security)
// @route   GET /api/visitors/search/:query
// @access  Public / Private
const searchVisitorQuick = async (req, res, next) => {
  try {
    const { query } = req.params;
    const visitors = await Visitor.find({
      $or: [
        { visitorId: new RegExp(query, 'i') },
        { mobileNumber: new RegExp(query, 'i') },
        { fullName: new RegExp(query, 'i') }
      ]
    }).limit(10);

    res.json({
      success: true,
      count: visitors.length,
      data: visitors
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createVisitor,
  getVisitors,
  getVisitorById,
  updateVisitor,
  deleteVisitor,
  verifyVisitor,
  approveVisitor,
  rejectVisitor,
  checkInVisitor,
  checkOutVisitor,
  searchVisitorQuick
};

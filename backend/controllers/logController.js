const SecurityLog = require('../models/SecurityLog');
const VisitorStateHistory = require('../models/VisitorStateHistory');

// @desc    Get all activity logs with filtering and pagination
// @route   GET /api/logs
// @access  Private (Security, Admin)
const getActivityLogs = async (req, res, next) => {
  try {
    const {
      visitorId,
      action,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 30
    } = req.query;

    const query = {};

    if (visitorId) {
      query.visitorId = new RegExp(visitorId, 'i');
    }

    if (action && action !== 'ALL') {
      query.action = new RegExp(action, 'i');
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(new Date(startDate).setHours(0, 0, 0, 0));
      }
      if (endDate) {
        query.timestamp.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
      }
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await SecurityLog.countDocuments(query);
    const logs = await SecurityLog.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: logs.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logs for a specific visitor
// @route   GET /api/logs/:visitorId
// @access  Private (Security, Admin)
const getLogsByVisitor = async (req, res, next) => {
  try {
    const { visitorId } = req.params;

    const [securityLogs, stateHistories] = await Promise.all([
      SecurityLog.find({ visitorId }).sort({ timestamp: -1 }),
      VisitorStateHistory.find({ visitorId }).sort({ timestamp: -1 })
    ]);

    res.json({
      success: true,
      visitorId,
      securityLogs,
      stateHistories
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivityLogs,
  getLogsByVisitor
};

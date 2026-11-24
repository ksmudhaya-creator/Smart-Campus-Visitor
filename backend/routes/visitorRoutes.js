const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/visitorController');
const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');

// Public or authenticated registration
router.post('/', optionalAuth, createVisitor);

// Quick search (usable by gate kiosk or authenticated staff)
router.get('/search/:query', optionalAuth, searchVisitorQuick);

// Authenticated routes
router.get('/', protect, authorize('SECURITY', 'ADMIN'), getVisitors);
router.get('/:id', optionalAuth, getVisitorById);
router.put('/:id', protect, authorize('SECURITY', 'ADMIN'), updateVisitor);
router.delete('/:id', protect, authorize('ADMIN'), deleteVisitor);

// Verification and Approval workflows
router.put('/:id/verify', protect, authorize('SECURITY', 'ADMIN'), verifyVisitor);
router.put('/:id/approve', protect, authorize('SECURITY', 'ADMIN'), approveVisitor);
router.put('/:id/reject', protect, authorize('SECURITY', 'ADMIN'), rejectVisitor);

// Gate Check-in & Check-out
router.post('/:id/checkin', protect, authorize('SECURITY', 'ADMIN'), checkInVisitor);
router.post('/:id/checkout', protect, authorize('SECURITY', 'ADMIN'), checkOutVisitor);

module.exports = router;

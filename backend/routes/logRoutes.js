const express = require('express');
const router = express.Router();
const {
  getActivityLogs,
  getLogsByVisitor
} = require('../controllers/logController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('SECURITY', 'ADMIN'), getActivityLogs);
router.get('/:visitorId', protect, authorize('SECURITY', 'ADMIN'), getLogsByVisitor);

module.exports = router;

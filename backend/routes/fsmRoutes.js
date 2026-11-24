const express = require('express');
const router = express.Router();
const {
  getFsmDefinition,
  testValidateTransition,
  runTransition,
  getAllowedTransitions,
  getVisitorHistory
} = require('../controllers/fsmController');
const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');

router.get('/definition', getFsmDefinition);
router.post('/validate', optionalAuth, testValidateTransition);
router.post('/transition', protect, authorize('SECURITY', 'ADMIN'), runTransition);
router.get('/allowed-transitions/:visitorId', optionalAuth, getAllowedTransitions);
router.get('/history/:visitorId', optionalAuth, getVisitorHistory);

module.exports = router;

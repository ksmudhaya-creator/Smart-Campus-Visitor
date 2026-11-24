const { Visitor, VISITOR_STATES } = require('../models/Visitor');
const VisitorStateHistory = require('../models/VisitorStateHistory');
const {
  FSM_TRANSITIONS,
  STATE_METADATA,
  validateTransition,
  executeTransition
} = require('../services/fsmService');

// @desc    Get FSM Graph Definition & State Metadata
// @route   GET /api/fsm/definition
// @access  Public / Authenticated
const getFsmDefinition = async (req, res, next) => {
  try {
    res.json({
      success: true,
      states: VISITOR_STATES,
      transitions: FSM_TRANSITIONS,
      metadata: STATE_METADATA
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate a transition candidate without executing (Simulation)
// @route   POST /api/fsm/validate
// @access  Private (Security, Admin)
const testValidateTransition = async (req, res, next) => {
  try {
    const { currentState, targetState, visitorId } = req.body;

    let effectiveCurrent = currentState;
    let visitorObj = null;

    if (visitorId) {
      visitorObj = await Visitor.findOne({
        $or: [{ visitorId }, { _id: visitorId.match(/^[0-9a-fA-F]{24}$/) ? visitorId : null }]
      });
      if (visitorObj) {
        effectiveCurrent = visitorObj.currentState;
      }
    }

    if (!effectiveCurrent || !targetState) {
      return res.status(400).json({
        success: false,
        message: 'Both current state and target state are required for validation.'
      });
    }

    const validation = validateTransition(effectiveCurrent, targetState);

    // If an invalid transition was tested for a concrete visitor, optionally record the simulation
    if (visitorObj && !validation.isValid && req.body.recordSimulation) {
      await VisitorStateHistory.create({
        visitorId: visitorObj.visitorId,
        visitorDocId: visitorObj._id,
        previousState: effectiveCurrent,
        newState: targetState,
        actionBy: {
          userId: req.user?._id,
          name: req.user?.name || 'Simulator',
          role: req.user?.role || 'TESTER'
        },
        isValid: false,
        reason: validation.reason,
        description: `Validator Engine Simulation: Tested illegal transition ${effectiveCurrent} -> ${targetState}`,
        transitionType: 'SIMULATION'
      });
    }

    res.json({
      success: true,
      validation: {
        currentState: effectiveCurrent,
        targetState,
        isValid: validation.isValid,
        result: validation.isValid ? 'VALID TRANSITION' : 'ILLEGAL TRANSITION',
        reason: validation.reason,
        allowedNextStates: validation.allowedNextStates
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Execute FSM Transition for a visitor
// @route   POST /api/fsm/transition
// @access  Private (Security, Admin)
const runTransition = async (req, res, next) => {
  try {
    const { visitorId, targetState, description, rejectionReason } = req.body;

    if (!visitorId || !targetState) {
      return res.status(400).json({
        success: false,
        message: 'Visitor ID and Target State are required.'
      });
    }

    const result = await executeTransition({
      visitorId,
      targetState,
      user: req.user,
      description,
      rejectionReason
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Get Allowed Next States for a visitor
// @route   GET /api/fsm/allowed-transitions/:visitorId
// @access  Public / Private
const getAllowedTransitions = async (req, res, next) => {
  try {
    const { visitorId } = req.params;
    const visitor = await Visitor.findOne({
      $or: [{ visitorId }, { _id: visitorId.match(/^[0-9a-fA-F]{24}$/) ? visitorId : null }]
    });

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found'
      });
    }

    const currentState = visitor.currentState;
    const allowed = FSM_TRANSITIONS[currentState] || [];

    res.json({
      success: true,
      visitorId: visitor.visitorId,
      currentState,
      allowedNextStates: allowed,
      isTerminal: allowed.length === 0
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get FSM transition history for a visitor
// @route   GET /api/fsm/history/:visitorId
// @access  Public / Private
const getVisitorHistory = async (req, res, next) => {
  try {
    const { visitorId } = req.params;
    const history = await VisitorStateHistory.find({ visitorId }).sort({
      timestamp: -1
    });

    res.json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFsmDefinition,
  testValidateTransition,
  runTransition,
  getAllowedTransitions,
  getVisitorHistory
};

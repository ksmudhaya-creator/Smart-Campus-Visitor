const { Visitor, VISITOR_STATES } = require('../models/Visitor');
const VisitorStateHistory = require('../models/VisitorStateHistory');
const SecurityLog = require('../models/SecurityLog');

// Define Permissible State Transitions according to FSM specification
const FSM_TRANSITIONS = {
  REGISTERED: ['PENDING_VERIFICATION', 'CANCELLED'],
  PENDING_VERIFICATION: ['VERIFIED', 'REJECTED'],
  VERIFIED: ['ENTRY_APPROVED', 'REJECTED'],
  ENTRY_APPROVED: ['CHECKED_IN', 'CANCELLED'],
  CHECKED_IN: ['INSIDE_CAMPUS'],
  INSIDE_CAMPUS: ['CHECKED_OUT'],
  CHECKED_OUT: [], // Terminal state
  REJECTED: [],    // Terminal state
  CANCELLED: []    // Terminal state
};

// Descriptions and metadata for states
const STATE_METADATA = {
  REGISTERED: {
    label: 'Registered',
    description: 'Visitor details submitted to the system.',
    badgeColor: 'blue',
    isTerminal: false
  },
  PENDING_VERIFICATION: {
    label: 'Pending Verification',
    description: 'Awaiting security / admin identity verification.',
    badgeColor: 'yellow',
    isTerminal: false
  },
  VERIFIED: {
    label: 'Verified',
    description: 'Identity & credentials verified by security staff.',
    badgeColor: 'indigo',
    isTerminal: false
  },
  ENTRY_APPROVED: {
    label: 'Entry Approved',
    description: 'Host department / authority approved campus entry.',
    badgeColor: 'purple',
    isTerminal: false
  },
  CHECKED_IN: {
    label: 'Checked In',
    description: 'Security gate check-in confirmed; badge issued.',
    badgeColor: 'teal',
    isTerminal: false
  },
  INSIDE_CAMPUS: {
    label: 'Inside Campus',
    description: 'Active visitor physically moving on campus premises.',
    badgeColor: 'emerald',
    isTerminal: false
  },
  CHECKED_OUT: {
    label: 'Checked Out',
    description: 'Visitor completed exit scan at campus gate.',
    badgeColor: 'gray',
    isTerminal: true
  },
  REJECTED: {
    label: 'Rejected',
    description: 'Visitor entry denied due to security/host policy.',
    badgeColor: 'red',
    isTerminal: true
  },
  CANCELLED: {
    label: 'Cancelled',
    description: 'Visit cancelled prior to physical campus entry.',
    badgeColor: 'rose',
    isTerminal: true
  }
};

/**
 * Validate a state transition from currentState to targetState
 * @param {string} currentState
 * @param {string} targetState
 * @returns {{ isValid: boolean, reason: string, allowedNextStates: string[] }}
 */
const validateTransition = (currentState, targetState) => {
  // Check if both states exist in FSM
  if (!VISITOR_STATES.includes(currentState)) {
    return {
      isValid: false,
      reason: `Current state '${currentState}' is not a recognized system state.`,
      allowedNextStates: []
    };
  }

  if (!VISITOR_STATES.includes(targetState)) {
    return {
      isValid: false,
      reason: `Target state '${targetState}' is not a recognized system state.`,
      allowedNextStates: FSM_TRANSITIONS[currentState] || []
    };
  }

  // Same state check
  if (currentState === targetState) {
    return {
      isValid: false,
      reason: `Visitor is already in the '${currentState}' state. State transition requires a new target state.`,
      allowedNextStates: FSM_TRANSITIONS[currentState] || []
    };
  }

  // Terminal state checks
  if (['CHECKED_OUT', 'REJECTED', 'CANCELLED'].includes(currentState)) {
    return {
      isValid: false,
      reason: `State '${currentState}' is a terminal state. No further transitions are permitted. A new registration must be created.`,
      allowedNextStates: []
    };
  }

  const allowedNext = FSM_TRANSITIONS[currentState] || [];
  const isPermitted = allowedNext.includes(targetState);

  if (isPermitted) {
    let successReason = `Valid transition from ${currentState} to ${targetState}.`;
    if (currentState === 'REGISTERED' && targetState === 'PENDING_VERIFICATION') {
      successReason = 'Visitor details submitted; forwarded to security checkpoint for identity verification.';
    } else if (currentState === 'PENDING_VERIFICATION' && targetState === 'VERIFIED') {
      successReason = 'Visitor identity, government ID, and contact credentials successfully verified.';
    } else if (currentState === 'PENDING_VERIFICATION' && targetState === 'REJECTED') {
      successReason = 'Identity verification failed or visitor flagged by security.';
    } else if (currentState === 'VERIFIED' && targetState === 'ENTRY_APPROVED') {
      successReason = 'Host department and campus authority have approved visitor entry.';
    } else if (currentState === 'VERIFIED' && targetState === 'REJECTED') {
      successReason = 'Host department declined or unavailable for visitor entry.';
    } else if (currentState === 'ENTRY_APPROVED' && targetState === 'CHECKED_IN') {
      successReason = 'Gate security confirmed physical arrival; check-in logged and pass issued.';
    } else if (currentState === 'CHECKED_IN' && targetState === 'INSIDE_CAMPUS') {
      successReason = 'Visitor passed physical gate barrier and is currently inside campus.';
    } else if (currentState === 'INSIDE_CAMPUS' && targetState === 'CHECKED_OUT') {
      successReason = 'Visitor completed exit scan at campus gate; visit concluded.';
    } else if (targetState === 'CANCELLED') {
      successReason = 'Visit cancelled by visitor or authority prior to campus entry.';
    }

    return {
      isValid: true,
      reason: successReason,
      allowedNextStates: allowedNext
    };
  }

  // Provide specific educational error reasons for illegal transitions
  let illegalReason = `Illegal state transition from ${currentState} to ${targetState}.`;

  if (currentState === 'REGISTERED' && targetState === 'CHECKED_IN') {
    illegalReason = 'Visitor must complete verification and entry approval before check-in.';
  } else if (currentState === 'REGISTERED' && targetState === 'INSIDE_CAMPUS') {
    illegalReason = 'Visitor cannot be marked inside campus without verification, approval, and gate check-in.';
  } else if (currentState === 'PENDING_VERIFICATION' && targetState === 'CHECKED_IN') {
    illegalReason = 'Visitor is still pending verification. Cannot check in without identity verification and entry approval.';
  } else if (currentState === 'VERIFIED' && targetState === 'CHECKED_IN') {
    illegalReason = 'Visitor is verified but requires host entry approval before gate check-in.';
  } else if (currentState === 'CHECKED_IN' && targetState === 'CHECKED_OUT') {
    illegalReason = 'Visitor must transition to INSIDE_CAMPUS before completing CHECKED_OUT.';
  } else if (targetState === 'CHECKED_IN' && currentState !== 'ENTRY_APPROVED') {
    illegalReason = `Check-in is only allowed when visitor has ENTRY_APPROVED status (current: ${currentState}).`;
  } else if (currentState === 'INSIDE_CAMPUS' && targetState === 'CHECKED_IN') {
    illegalReason = 'Visitor is already inside campus; duplicate check-in is strictly prohibited.';
  } else {
    illegalReason = `Illegal transition: Cannot transition directly from ${currentState} to ${targetState}. Permissible next states: [${allowedNext.join(', ') || 'None'}].`;
  }

  return {
    isValid: false,
    reason: illegalReason,
    allowedNextStates: allowedNext
  };
};

/**
 * Execute a state transition on a visitor
 * Validates with FSM, logs both valid and invalid attempts, updates visitor doc
 */
const executeTransition = async ({
  visitorId,
  targetState,
  user,
  description = '',
  rejectionReason = ''
}) => {
  // Find visitor
  const visitor = await Visitor.findOne({ visitorId });
  if (!visitor) {
    const error = new Error(`Visitor with ID '${visitorId}' not found.`);
    error.statusCode = 404;
    throw error;
  }

  const previousState = visitor.currentState;
  const validation = validateTransition(previousState, targetState);

  const actionUser = {
    userId: user?._id || user?.id || null,
    name: user?.name || 'System Operator',
    role: user?.role || 'SECURITY'
  };

  // If transition is INVALID, log the illegal attempt to history and security logs
  if (!validation.isValid) {
    // 1. Record in VisitorStateHistory as invalid attempt
    await VisitorStateHistory.create({
      visitorId: visitor.visitorId,
      visitorDocId: visitor._id,
      previousState,
      newState: targetState,
      actionBy: actionUser,
      isValid: false,
      reason: validation.reason,
      description: description || `Attempted invalid transition from ${previousState} to ${targetState}`,
      transitionType: 'ILLEGAL_ATTEMPT',
      timestamp: new Date()
    });

    // 2. Record in SecurityLog
    const logId = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await SecurityLog.create({
      logId,
      userId: actionUser,
      visitorId: visitor.visitorId,
      action: 'INVALID_TRANSITION_ATTEMPT',
      description: `Rejected illegal FSM transition: ${previousState} -> ${targetState}. Reason: ${validation.reason}`,
      previousState,
      newState: targetState,
      status: 'WARNING',
      timestamp: new Date()
    });

    const error = new Error(validation.reason);
    error.statusCode = 400;
    error.validation = validation;
    throw error;
  }

  // Apply State Side-Effects
  visitor.currentState = targetState;

  if (targetState === 'PENDING_VERIFICATION') {
    visitor.verificationStatus = 'PENDING';
  } else if (targetState === 'VERIFIED') {
    visitor.verificationStatus = 'VERIFIED';
    visitor.verifiedBy = {
      userId: actionUser.userId,
      name: actionUser.name,
      role: actionUser.role,
      timestamp: new Date()
    };
  } else if (targetState === 'REJECTED') {
    visitor.verificationStatus = 'REJECTED';
    if (rejectionReason) {
      visitor.rejectionReason = rejectionReason;
    }
  } else if (targetState === 'ENTRY_APPROVED') {
    visitor.approvedBy = {
      userId: actionUser.userId,
      name: actionUser.name,
      role: actionUser.role,
      timestamp: new Date()
    };
  } else if (targetState === 'CHECKED_IN') {
    visitor.actualEntryTime = visitor.actualEntryTime || new Date();
    visitor.checkedInBy = {
      userId: actionUser.userId,
      name: actionUser.name,
      role: actionUser.role,
      timestamp: new Date()
    };
  } else if (targetState === 'CHECKED_OUT') {
    const exitTime = new Date();
    visitor.actualExitTime = exitTime;
    visitor.checkedOutBy = {
      userId: actionUser.userId,
      name: actionUser.name,
      role: actionUser.role,
      timestamp: exitTime
    };

    // Calculate total campus duration in minutes
    if (visitor.actualEntryTime) {
      const diffMs = exitTime.getTime() - new Date(visitor.actualEntryTime).getTime();
      visitor.totalDurationMinutes = Math.max(1, Math.round(diffMs / (1000 * 60)));
    }
  }

  if (description) {
    visitor.remarks = description;
  }

  await visitor.save();

  // Record valid transition in VisitorStateHistory
  const historyRecord = await VisitorStateHistory.create({
    visitorId: visitor.visitorId,
    visitorDocId: visitor._id,
    previousState,
    newState: targetState,
    actionBy: actionUser,
    isValid: true,
    reason: validation.reason,
    description: description || `Transitioned from ${previousState} to ${targetState}`,
    transitionType: 'EXECUTED',
    timestamp: new Date()
  });

  // Record in SecurityLog
  const logId = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  await SecurityLog.create({
    logId,
    userId: actionUser,
    visitorId: visitor.visitorId,
    action: `FSM_TRANSITION_${targetState}`,
    description: `FSM Transition executed: ${previousState} -> ${targetState}. ${validation.reason}`,
    previousState,
    newState: targetState,
    status: 'SUCCESS',
    timestamp: new Date()
  });

  return {
    success: true,
    message: validation.reason,
    visitor,
    historyRecord,
    validation
  };
};

module.exports = {
  FSM_TRANSITIONS,
  STATE_METADATA,
  validateTransition,
  executeTransition
};

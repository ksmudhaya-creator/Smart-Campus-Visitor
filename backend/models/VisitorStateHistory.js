const mongoose = require('mongoose');

const visitorStateHistorySchema = new mongoose.Schema(
  {
    visitorId: {
      type: String,
      required: true,
      index: true
    },
    visitorDocId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Visitor'
    },
    previousState: {
      type: String,
      required: true
    },
    newState: {
      type: String,
      required: true
    },
    actionBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, default: 'System' },
      role: { type: String, default: 'SYSTEM' }
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    description: {
      type: String,
      default: ''
    },
    isValid: {
      type: Boolean,
      required: true,
      default: true,
      index: true
    },
    reason: {
      type: String,
      default: ''
    },
    transitionType: {
      type: String,
      enum: ['EXECUTED', 'ILLEGAL_ATTEMPT', 'SIMULATION'],
      default: 'EXECUTED'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('VisitorStateHistory', visitorStateHistorySchema);

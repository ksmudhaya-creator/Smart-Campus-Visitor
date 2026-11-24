const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema(
  {
    logId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, default: 'System' },
      role: { type: String, default: 'SYSTEM' }
    },
    visitorId: {
      type: String,
      default: '',
      index: true
    },
    action: {
      type: String,
      required: true,
      index: true
    },
    description: {
      type: String,
      required: true
    },
    previousState: {
      type: String,
      default: ''
    },
    newState: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE', 'WARNING', 'INFO'],
      default: 'INFO'
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('SecurityLog', securityLogSchema);

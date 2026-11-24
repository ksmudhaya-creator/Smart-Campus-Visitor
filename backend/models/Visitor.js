const mongoose = require('mongoose');

const VISITOR_STATES = [
  'REGISTERED',
  'PENDING_VERIFICATION',
  'VERIFIED',
  'ENTRY_APPROVED',
  'CHECKED_IN',
  'INSIDE_CAMPUS',
  'CHECKED_OUT',
  'REJECTED',
  'CANCELLED'
];

const visitorSchema = new mongoose.Schema(
  {
    visitorId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      index: true
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true
    },
    visitorType: {
      type: String,
      required: [true, 'Visitor type is required'],
      enum: [
        'Academic Guest',
        'Parent/Guardian',
        'Vendor/Contractor',
        'Student Guest',
        'Interviewee',
        'Delivery/Logistics',
        'Alumni',
        'Official/Govt',
        'Other'
      ],
      default: 'Academic Guest'
    },
    collegeId: {
      type: String,
      trim: true,
      default: ''
    },
    personToMeet: {
      type: String,
      required: [true, 'Person to meet is required'],
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true
    },
    purpose: {
      type: String,
      required: [true, 'Purpose of visit is required'],
      trim: true,
      maxlength: [500, 'Purpose cannot exceed 500 characters']
    },
    visitDate: {
      type: Date,
      required: [true, 'Date of visit is required'],
      default: Date.now
    },
    expectedEntryTime: {
      type: String,
      required: [true, 'Expected entry time is required']
    },
    expectedExitTime: {
      type: String,
      required: [true, 'Expected exit time is required']
    },
    actualEntryTime: {
      type: Date,
      default: null
    },
    actualExitTime: {
      type: Date,
      default: null
    },
    totalDurationMinutes: {
      type: Number,
      default: 0
    },
    vehicleNumber: {
      type: String,
      trim: true,
      default: ''
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    currentState: {
      type: String,
      enum: VISITOR_STATES,
      default: 'REGISTERED',
      index: true
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'PENDING'
    },
    verifiedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: String,
      role: String,
      timestamp: Date
    },
    approvedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: String,
      role: String,
      timestamp: Date
    },
    checkedInBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: String,
      role: String,
      timestamp: Date
    },
    checkedOutBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: String,
      role: String,
      timestamp: Date
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    remarks: {
      type: String,
      default: ''
    },
    registeredBy: {
      type: String,
      default: 'SELF'
    }
  },
  {
    timestamps: true
  }
);

module.exports = {
  Visitor: mongoose.model('Visitor', visitorSchema),
  VISITOR_STATES
};

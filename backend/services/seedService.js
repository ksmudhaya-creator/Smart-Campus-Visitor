const dotenv = require('dotenv');
dotenv.config();

const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const { Visitor } = require('../models/Visitor');
const VisitorStateHistory = require('../models/VisitorStateHistory');
const SecurityLog = require('../models/SecurityLog');

const seedData = async (shouldExit = true) => {
  try {
    console.log('[Seed] Starting database seeding process...');

    // Clear existing collections
    await User.deleteMany({});
    await Visitor.deleteMany({});
    await VisitorStateHistory.deleteMany({});
    await SecurityLog.deleteMany({});

    console.log('[Seed] Cleared existing records.');

    // 1. Create Default Users
    const adminUser = await User.create({
      name: 'Dr. Arthur Pendelton',
      email: 'admin@campus.edu',
      password: 'Admin@123',
      role: 'ADMIN',
      department: 'Campus Administration',
      phone: '+1 800-555-0199',
      badgeNumber: 'ADM-001',
      isActive: true
    });

    const securityUser = await User.create({
      name: 'Officer John Miller',
      email: 'security@campus.edu',
      password: 'Security@123',
      role: 'SECURITY',
      department: 'Campus Gate Security',
      phone: '+1 800-555-0144',
      badgeNumber: 'SEC-702',
      isActive: true
    });

    const visitorUser = await User.create({
      name: 'David Thompson',
      email: 'visitor@campus.edu',
      password: 'Visitor@123',
      role: 'VISITOR',
      department: 'Guest',
      phone: '+1 800-555-0177',
      isActive: true
    });

    console.log('[Seed] Created users: Admin, Security Officer, Visitor.');

    // 2. Sample Visitors
    const today = new Date();
    const entryTimeInside = new Date(Date.now() - 75 * 60 * 1000); // 75 mins ago
    const entryTimeInside2 = new Date(Date.now() - 35 * 60 * 1000); // 35 mins ago
    const entryTimeCheckedOut = new Date(Date.now() - 180 * 60 * 1000); // 3 hours ago
    const exitTimeCheckedOut = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

    const visitorsData = [
      {
        visitorId: 'SCV-20241124-1001',
        fullName: 'Dr. Robert Vance',
        mobileNumber: '9876543210',
        email: 'r.vance@techinst.edu',
        visitorType: 'Academic Guest',
        collegeId: 'GUEST-FAC-88',
        personToMeet: 'Prof. Alan Turing',
        department: 'Computer Science & Engineering',
        purpose: 'Keynote Speaker for Annual Distributed Systems & AI Symposium',
        visitDate: today,
        expectedEntryTime: '09:30 AM',
        expectedExitTime: '04:00 PM',
        actualEntryTime: entryTimeInside,
        currentState: 'INSIDE_CAMPUS',
        verificationStatus: 'VERIFIED',
        vehicleNumber: 'KA-05-MH-2021',
        address: '42 Academic Ridge, Tech Park',
        verifiedBy: { userId: securityUser._id, name: securityUser.name, role: securityUser.role, timestamp: new Date(Date.now() - 90 * 60 * 1000) },
        approvedBy: { userId: adminUser._id, name: adminUser.name, role: adminUser.role, timestamp: new Date(Date.now() - 85 * 60 * 1000) },
        checkedInBy: { userId: securityUser._id, name: securityUser.name, role: securityUser.role, timestamp: entryTimeInside }
      },
      {
        visitorId: 'SCV-20241124-1002',
        fullName: 'Sarah Jenkins',
        mobileNumber: '9876543211',
        email: 'sarah.jenkins@gmail.com',
        visitorType: 'Parent/Guardian',
        collegeId: '',
        personToMeet: 'Dr. Katherine Bell (HOD)',
        department: 'Mechanical Engineering',
        purpose: 'Semester Academic Performance Discussion & Hostel Permission',
        visitDate: today,
        expectedEntryTime: '11:00 AM',
        expectedExitTime: '01:30 PM',
        currentState: 'ENTRY_APPROVED',
        verificationStatus: 'VERIFIED',
        vehicleNumber: 'MH-12-AB-9922',
        address: '74 Greenfield Avenue, West Suburb',
        verifiedBy: { userId: securityUser._id, name: securityUser.name, role: securityUser.role, timestamp: new Date(Date.now() - 40 * 60 * 1000) },
        approvedBy: { userId: adminUser._id, name: adminUser.name, role: adminUser.role, timestamp: new Date(Date.now() - 20 * 60 * 1000) }
      },
      {
        visitorId: 'SCV-20241124-1003',
        fullName: 'David Miller',
        mobileNumber: '9876543212',
        email: 'dmiller@solarpower.com',
        visitorType: 'Vendor/Contractor',
        collegeId: 'VEND-SP-40',
        personToMeet: 'Eng. Ramesh Patel',
        department: 'Facility & Infrastructure',
        purpose: 'Rooftop Solar Array Maintenance & Efficiency Calibration',
        visitDate: today,
        expectedEntryTime: '10:15 AM',
        expectedExitTime: '03:00 PM',
        actualEntryTime: new Date(Date.now() - 15 * 60 * 1000),
        currentState: 'CHECKED_IN',
        verificationStatus: 'VERIFIED',
        vehicleNumber: 'DL-01-EE-3341',
        address: '15 Industrial Zone, Sector 4',
        verifiedBy: { userId: securityUser._id, name: securityUser.name, role: securityUser.role, timestamp: new Date(Date.now() - 30 * 60 * 1000) },
        approvedBy: { userId: adminUser._id, name: adminUser.name, role: adminUser.role, timestamp: new Date(Date.now() - 25 * 60 * 1000) },
        checkedInBy: { userId: securityUser._id, name: securityUser.name, role: securityUser.role, timestamp: new Date(Date.now() - 15 * 60 * 1000) }
      },
      {
        visitorId: 'SCV-20241124-1004',
        fullName: 'Dr. Elena Rostova',
        mobileNumber: '9876543213',
        email: 'elena.rostova@biotech.org',
        visitorType: 'Interviewee',
        collegeId: 'CAND-2024-BIO',
        personToMeet: 'Dean of Faculty Affairs',
        department: 'Biotechnology & Bioinformatics',
        purpose: 'Faculty Recruitment Interview for Associate Professor Position',
        visitDate: today,
        expectedEntryTime: '01:00 PM',
        expectedExitTime: '05:00 PM',
        currentState: 'VERIFIED',
        verificationStatus: 'VERIFIED',
        vehicleNumber: '',
        address: 'B-12 Hilltop Residency',
        verifiedBy: { userId: securityUser._id, name: securityUser.name, role: securityUser.role, timestamp: new Date(Date.now() - 10 * 60 * 1000) }
      },
      {
        visitorId: 'SCV-20241124-1005',
        fullName: 'Marcus Brody',
        mobileNumber: '9876543214',
        email: 'mbrody@historical.org',
        visitorType: 'Academic Guest',
        collegeId: '',
        personToMeet: 'Prof. Henry Jones',
        department: 'Humanities & Social Sciences',
        purpose: 'Museum Artifact Loan Review & Historical Archives Consultation',
        visitDate: today,
        expectedEntryTime: '02:00 PM',
        expectedExitTime: '04:30 PM',
        currentState: 'PENDING_VERIFICATION',
        verificationStatus: 'PENDING',
        vehicleNumber: 'KA-04-TR-4567',
        address: '22 Marshall College Quad'
      },
      {
        visitorId: 'SCV-20241124-1006',
        fullName: 'Priya Sharma',
        mobileNumber: '9876543215',
        email: 'priya.sharma99@yahoo.com',
        visitorType: 'Student Guest',
        collegeId: 'STU-EXT-902',
        personToMeet: 'President, Student Council',
        department: 'Electrical & Electronics',
        purpose: 'Inter-College Hackathon Preparation & Hardware Kit Exchange',
        visitDate: today,
        expectedEntryTime: '02:30 PM',
        expectedExitTime: '06:00 PM',
        currentState: 'REGISTERED',
        verificationStatus: 'PENDING',
        vehicleNumber: '',
        address: 'Flat 401, Sapphire Towers'
      },
      {
        visitorId: 'SCV-20241124-1007',
        fullName: 'Kevin O\'Connor',
        mobileNumber: '9876543216',
        email: 'kevin.express@speedcourier.com',
        visitorType: 'Delivery/Logistics',
        collegeId: '',
        personToMeet: 'Store Manager Mr. Sharma',
        department: 'Central Store & Procurement',
        purpose: 'Delivery of High-Precision Oscilloscopes & Signal Generators',
        visitDate: today,
        expectedEntryTime: '08:30 AM',
        expectedExitTime: '10:00 AM',
        actualEntryTime: entryTimeCheckedOut,
        actualExitTime: exitTimeCheckedOut,
        totalDurationMinutes: 120,
        currentState: 'CHECKED_OUT',
        verificationStatus: 'VERIFIED',
        vehicleNumber: 'KA-51-LL-8812',
        address: 'Speed Express Logistics Hub 9',
        verifiedBy: { userId: securityUser._id, name: securityUser.name, role: securityUser.role, timestamp: new Date(Date.now() - 190 * 60 * 1000) },
        approvedBy: { userId: adminUser._id, name: adminUser.name, role: adminUser.role, timestamp: new Date(Date.now() - 185 * 60 * 1000) },
        checkedInBy: { userId: securityUser._id, name: securityUser.name, role: securityUser.role, timestamp: entryTimeCheckedOut },
        checkedOutBy: { userId: securityUser._id, name: securityUser.name, role: securityUser.role, timestamp: exitTimeCheckedOut }
      },
      {
        visitorId: 'SCV-20241124-1008',
        fullName: 'Amanda Clark',
        mobileNumber: '9876543217',
        email: 'amanda.clark@fintechcorp.com',
        visitorType: 'Alumni',
        collegeId: 'ALUM-2018-CS',
        personToMeet: 'Placement Director Dr. Roy',
        department: 'Career Advisory & Placement',
        purpose: 'Conducting Mock Technical Interviews & Placement Mentoring',
        visitDate: today,
        expectedEntryTime: '09:00 AM',
        expectedExitTime: '01:00 PM',
        actualEntryTime: new Date(Date.now() - 240 * 60 * 1000),
        actualExitTime: new Date(Date.now() - 30 * 60 * 1000),
        totalDurationMinutes: 210,
        currentState: 'CHECKED_OUT',
        verificationStatus: 'VERIFIED',
        vehicleNumber: 'KA-01-EE-7766',
        address: 'Villa 18, Palm Meadows',
        verifiedBy: { userId: securityUser._id, name: securityUser.name, role: securityUser.role, timestamp: new Date(Date.now() - 250 * 60 * 1000) },
        approvedBy: { userId: adminUser._id, name: adminUser.name, role: adminUser.role, timestamp: new Date(Date.now() - 245 * 60 * 1000) },
        checkedInBy: { userId: securityUser._id, name: securityUser.name, role: securityUser.role, timestamp: new Date(Date.now() - 240 * 60 * 1000) },
        checkedOutBy: { userId: securityUser._id, name: securityUser.name, role: securityUser.role, timestamp: new Date(Date.now() - 30 * 60 * 1000) }
      },
      {
        visitorId: 'SCV-20241124-1009',
        fullName: 'Ronald Briggs',
        mobileNumber: '9876543218',
        email: 'ronald.briggs@coldmarketing.com',
        visitorType: 'Vendor/Contractor',
        collegeId: '',
        personToMeet: 'Registrar Office',
        department: 'Campus Administration',
        purpose: 'Unsolicited Commercial Promotion & Product Distribution',
        visitDate: today,
        expectedEntryTime: '10:00 AM',
        expectedExitTime: '11:00 AM',
        currentState: 'REJECTED',
        verificationStatus: 'REJECTED',
        rejectionReason: 'Unapproved commercial solicitation without official procurement authorization.',
        vehicleNumber: 'MH-04-XX-1122',
        address: 'Market Street Commercial Complex'
      },
      {
        visitorId: 'SCV-20241124-1010',
        fullName: 'Rachel Adams',
        mobileNumber: '9876543219',
        email: 'rachel.adams@yahoo.co.in',
        visitorType: 'Parent/Guardian',
        collegeId: '',
        personToMeet: 'Hostel Warden Mrs. Mary',
        department: 'Civil Engineering',
        purpose: 'Scheduled visit to hostel facilities (Postponed by parent)',
        visitDate: today,
        expectedEntryTime: '11:30 AM',
        expectedExitTime: '01:00 PM',
        currentState: 'CANCELLED',
        verificationStatus: 'PENDING',
        vehicleNumber: '',
        address: '5th Main, Jayanagar'
      },
      {
        visitorId: 'SCV-20241124-1011',
        fullName: 'Hon. Vikram Singhania',
        mobileNumber: '9876543220',
        email: 'vikram.singhania@gov.ac.in',
        visitorType: 'Official/Govt',
        collegeId: 'GOV-NAAC-009',
        personToMeet: 'Vice Chancellor & Provost',
        department: 'Vice Chancellor Office',
        purpose: 'State Higher Education Council Campus Infrastructure Audit',
        visitDate: today,
        expectedEntryTime: '10:00 AM',
        expectedExitTime: '04:30 PM',
        actualEntryTime: entryTimeInside2,
        currentState: 'INSIDE_CAMPUS',
        verificationStatus: 'VERIFIED',
        vehicleNumber: 'KA-01-G-0007',
        address: 'Government Secretariat Bhavan',
        verifiedBy: { userId: securityUser._id, name: securityUser.name, role: securityUser.role, timestamp: new Date(Date.now() - 50 * 60 * 1000) },
        approvedBy: { userId: adminUser._id, name: adminUser.name, role: adminUser.role, timestamp: new Date(Date.now() - 45 * 60 * 1000) },
        checkedInBy: { userId: securityUser._id, name: securityUser.name, role: securityUser.role, timestamp: entryTimeInside2 }
      },
      {
        visitorId: 'SCV-20241124-1012',
        fullName: 'Liam Thorne',
        mobileNumber: '9876543221',
        email: 'liam.thorne@sportsclub.org',
        visitorType: 'Student Guest',
        collegeId: 'SPORTS-ATH-22',
        personToMeet: 'Sports Director Coach Vance',
        department: 'Physical Education & Athletics',
        purpose: 'Inter-Collegiate Basketball Tournament Match Referee',
        visitDate: today,
        expectedEntryTime: '03:00 PM',
        expectedExitTime: '07:00 PM',
        currentState: 'ENTRY_APPROVED',
        verificationStatus: 'VERIFIED',
        vehicleNumber: 'KA-03-MM-4411',
        address: 'National Sports Complex',
        verifiedBy: { userId: securityUser._id, name: securityUser.name, role: securityUser.role, timestamp: new Date(Date.now() - 30 * 60 * 1000) },
        approvedBy: { userId: adminUser._id, name: adminUser.name, role: adminUser.role, timestamp: new Date(Date.now() - 15 * 60 * 1000) }
      }
    ];

    const createdVisitors = await Visitor.insertMany(visitorsData);
    console.log(`[Seed] Created ${createdVisitors.length} sample visitors.`);

    // 3. Create realistic FSM State History records for each visitor
    const historyEntries = [];

    // Visitor 1: Full transition chain up to INSIDE_CAMPUS
    const v1 = createdVisitors[0];
    historyEntries.push(
      { visitorId: v1.visitorId, visitorDocId: v1._id, previousState: 'NONE', newState: 'REGISTERED', actionBy: { name: 'Visitor Self', role: 'VISITOR' }, isValid: true, reason: 'Initial registration', timestamp: new Date(Date.now() - 120 * 60 * 1000) },
      { visitorId: v1.visitorId, visitorDocId: v1._id, previousState: 'REGISTERED', newState: 'PENDING_VERIFICATION', actionBy: { name: securityUser.name, role: securityUser.role }, isValid: true, reason: 'Routed to verification', timestamp: new Date(Date.now() - 100 * 60 * 1000) },
      { visitorId: v1.visitorId, visitorDocId: v1._id, previousState: 'PENDING_VERIFICATION', newState: 'VERIFIED', actionBy: { name: securityUser.name, role: securityUser.role }, isValid: true, reason: 'Identity and credentials verified', timestamp: new Date(Date.now() - 90 * 60 * 1000) },
      { visitorId: v1.visitorId, visitorDocId: v1._id, previousState: 'VERIFIED', newState: 'ENTRY_APPROVED', actionBy: { name: adminUser.name, role: adminUser.role }, isValid: true, reason: 'Department approved entry pass', timestamp: new Date(Date.now() - 85 * 60 * 1000) },
      { visitorId: v1.visitorId, visitorDocId: v1._id, previousState: 'ENTRY_APPROVED', newState: 'CHECKED_IN', actionBy: { name: securityUser.name, role: securityUser.role }, isValid: true, reason: 'Gate security check-in scanned', timestamp: entryTimeInside },
      { visitorId: v1.visitorId, visitorDocId: v1._id, previousState: 'CHECKED_IN', newState: 'INSIDE_CAMPUS', actionBy: { name: securityUser.name, role: securityUser.role }, isValid: true, reason: 'Turnstile gate opened; visitor inside campus', timestamp: entryTimeInside }
    );

    // Also inject 2 ILLEGAL attempt records for academic demonstration in FSM Engine!
    historyEntries.push(
      {
        visitorId: createdVisitors[5].visitorId, // Priya Sharma (REGISTERED)
        visitorDocId: createdVisitors[5]._id,
        previousState: 'REGISTERED',
        newState: 'CHECKED_IN',
        actionBy: { name: 'Officer John Miller', role: 'SECURITY' },
        isValid: false,
        reason: 'Visitor must complete verification and entry approval before check-in.',
        description: 'Attempted premature check-in without verification approval',
        transitionType: 'ILLEGAL_ATTEMPT',
        timestamp: new Date(Date.now() - 50 * 60 * 1000)
      },
      {
        visitorId: createdVisitors[6].visitorId, // Kevin O'Connor (CHECKED_OUT)
        visitorDocId: createdVisitors[6]._id,
        previousState: 'CHECKED_OUT',
        newState: 'INSIDE_CAMPUS',
        actionBy: { name: 'Gate Scanner Terminal', role: 'SYSTEM' },
        isValid: false,
        reason: 'State CHECKED_OUT is a terminal state. No further transitions are permitted.',
        description: 'Attempted re-entry on expired checked-out pass',
        transitionType: 'ILLEGAL_ATTEMPT',
        timestamp: new Date(Date.now() - 25 * 60 * 1000)
      }
    );

    await VisitorStateHistory.insertMany(historyEntries);
    console.log(`[Seed] Created ${historyEntries.length} state transition history records (including illegal transition tests).`);

    // 4. Sample Security Logs
    const securityLogs = [
      {
        logId: 'LOG-INIT-001',
        userId: { id: adminUser._id, name: adminUser.name, role: adminUser.role },
        action: 'SYSTEM_INITIALIZED',
        description: 'Smart Campus Visitor Entry & Exit Tracking System initialized with FSM Engine v2.0',
        status: 'SUCCESS',
        timestamp: new Date(Date.now() - 300 * 60 * 1000)
      },
      {
        logId: 'LOG-SEED-002',
        userId: { id: securityUser._id, name: securityUser.name, role: securityUser.role },
        visitorId: 'SCV-20241124-1001',
        action: 'VISITOR_CHECKED_IN',
        description: 'Visitor Dr. Robert Vance completed physical gate check-in and received RFID Visitor Badge #88',
        previousState: 'ENTRY_APPROVED',
        newState: 'CHECKED_IN',
        status: 'SUCCESS',
        timestamp: entryTimeInside
      },
      {
        logId: 'LOG-SEED-003',
        userId: { id: securityUser._id, name: securityUser.name, role: securityUser.role },
        visitorId: 'SCV-20241124-1009',
        action: 'VISITOR_ENTRY_REJECTED',
        description: 'Entry denied for Ronald Briggs. Policy violation: Unauthorized commercial canvassing.',
        previousState: 'PENDING_VERIFICATION',
        newState: 'REJECTED',
        status: 'WARNING',
        timestamp: new Date(Date.now() - 70 * 60 * 1000)
      },
      {
        logId: 'LOG-SEED-004',
        userId: { id: securityUser._id, name: securityUser.name, role: securityUser.role },
        visitorId: 'SCV-20241124-1006',
        action: 'INVALID_TRANSITION_ATTEMPT',
        description: 'FSM Engine blocked transition: REGISTERED -> CHECKED_IN. Reason: Verification and approval required.',
        previousState: 'REGISTERED',
        newState: 'CHECKED_IN',
        status: 'WARNING',
        timestamp: new Date(Date.now() - 50 * 60 * 1000)
      }
    ];

    await SecurityLog.insertMany(securityLogs);
    console.log(`[Seed] Created ${securityLogs.length} initial audit security logs.`);

    console.log('--------------------------------------------------------------');
    console.log('  SMART CAMPUS VISITOR TRACKING SYSTEM - SAMPLE CREDENTIALS  ');
    console.log('--------------------------------------------------------------');
    console.log('  Admin User:     admin@campus.edu    / Password: Admin@123');
    console.log('  Security Guard: security@campus.edu / Password: Security@123');
    console.log('  Visitor:        visitor@campus.edu  / Password: Visitor@123');
    console.log('--------------------------------------------------------------');

    if (shouldExit) {
      console.log('[Seed] Seeding completed successfully. Exiting.');
      process.exit(0);
    }
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    if (shouldExit) {
      process.exit(1);
    }
  }
};

// If run directly from CLI
if (require.main === module) {
  connectDB().then(() => seedData(true));
}

module.exports = seedData;

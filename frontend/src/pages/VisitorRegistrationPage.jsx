import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Shield,
  CheckCircle,
  AlertCircle,
  Calendar,
  Clock,
  Printer,
  RotateCcw,
  Building,
  User,
  Phone,
  Mail,
  Car,
  FileText
} from 'lucide-react';
import api from '../api/axios';
import StateBadge from '../components/StateBadge';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Mechanical Engineering',
  'Electrical & Electronics',
  'Civil Engineering',
  'Biotechnology & Bioinformatics',
  'Humanities & Social Sciences',
  'Campus Administration',
  'Vice Chancellor Office',
  'Central Store & Procurement',
  'Career Advisory & Placement',
  'Facility & Infrastructure',
  'Physical Education & Athletics'
];

const VISITOR_TYPES = [
  'Academic Guest',
  'Parent/Guardian',
  'Vendor/Contractor',
  'Student Guest',
  'Interviewee',
  'Delivery/Logistics',
  'Alumni',
  'Official/Govt',
  'Other'
];

const VisitorRegistrationPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    email: '',
    visitorType: 'Academic Guest',
    collegeId: '',
    personToMeet: '',
    department: 'Computer Science & Engineering',
    purpose: '',
    visitDate: new Date().toISOString().split('T')[0],
    expectedEntryTime: '10:00 AM',
    expectedExitTime: '01:00 PM',
    vehicleNumber: '',
    address: '',
    remarks: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredVisitor, setRegisteredVisitor] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Form Validations
    if (!formData.fullName.trim()) return setError('Full name is required.');
    if (!formData.mobileNumber.trim() || formData.mobileNumber.length < 10) {
      return setError('Please enter a valid 10-digit mobile number.');
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      return setError('Please enter a valid email address.');
    }
    if (!formData.personToMeet.trim()) return setError('Host/Person to meet is required.');
    if (!formData.purpose.trim()) return setError('Purpose of visit is required.');

    try {
      setLoading(true);
      const res = await api.post('/visitors', formData);
      if (res.data && res.data.data) {
        setRegisteredVisitor(res.data.data);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to register visitor. Please check form data.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRegisteredVisitor(null);
    setFormData({
      fullName: '',
      mobileNumber: '',
      email: '',
      visitorType: 'Academic Guest',
      collegeId: '',
      personToMeet: '',
      department: 'Computer Science & Engineering',
      purpose: '',
      visitDate: new Date().toISOString().split('T')[0],
      expectedEntryTime: '10:00 AM',
      expectedExitTime: '01:00 PM',
      vehicleNumber: '',
      address: '',
      remarks: ''
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <UserPlus className="w-6 h-6 text-blue-600" />
            Visitor Registration Module
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Digitally register campus guests. Automatically triggers FSM state: <span className="font-mono text-blue-600 font-bold">REGISTERED</span>.
          </p>
        </div>

        <button
          onClick={() => navigate('/visitors')}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
        >
          View All Visitors
        </button>
      </div>

      {/* Success Confirmation Card */}
      {registeredVisitor ? (
        <div className="bg-white rounded-2xl border-2 border-emerald-500/30 shadow-xl p-8 space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center gap-3 text-emerald-600">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Registration Confirmed!</h2>
              <p className="text-xs text-slate-500">
                Visitor pass has been created and registered in the system.
              </p>
            </div>
          </div>

          {/* Pass Preview Ticket */}
          <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/70 space-y-4 printable-pass">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Smart Campus Pass</p>
                <h3 className="text-2xl font-black text-slate-900">{registeredVisitor.fullName}</h3>
                <p className="font-mono text-xs font-bold text-blue-600">ID: {registeredVisitor.visitorId}</p>
              </div>
              <StateBadge state={registeredVisitor.currentState} size="lg" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Host to Meet:</span>
                <span className="font-bold text-slate-800">{registeredVisitor.personToMeet}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Department:</span>
                <span className="font-bold text-slate-800">{registeredVisitor.department}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Date of Visit:</span>
                <span className="font-bold text-slate-800">
                  {new Date(registeredVisitor.visitDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Expected Window:</span>
                <span className="font-bold text-slate-800">
                  {registeredVisitor.expectedEntryTime} - {registeredVisitor.expectedExitTime}
                </span>
              </div>
            </div>

            <div className="pt-2 text-xs">
              <span className="text-slate-400 block">Visit Purpose:</span>
              <p className="text-slate-700 font-medium mt-0.5">{registeredVisitor.purpose}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Register Another Visitor</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-sm transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Gate Pass</span>
              </button>
              <button
                onClick={() => navigate('/pending-verification')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                Go to Verification Queue ➔
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Registration Form */
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Visitor Profile */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-blue-600" />
              1. Personal Particulars
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Robert Vance"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@organization.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Visitor Category / Type <span className="text-rose-500">*</span>
                </label>
                <select
                  name="visitorType"
                  value={formData.visitorType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden bg-white"
                >
                  {VISITOR_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  College ID / Govt ID Reference (Optional)
                </label>
                <input
                  type="text"
                  name="collegeId"
                  value={formData.collegeId}
                  onChange={handleChange}
                  placeholder="e.g. DL-99201 or GUEST-01"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Vehicle License Number (Optional)
                </label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  placeholder="e.g. KA-05-MH-2021"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Residential Address / City</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Visitor residential or office address"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Section 2: Visit Destination & Host Details */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-blue-600" />
              2. Host & Campus Visit Schedule
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Host Faculty / Person to Meet <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="personToMeet"
                  value={formData.personToMeet}
                  onChange={handleChange}
                  placeholder="e.g. Prof. Alan Turing (HOD)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Host Department <span className="text-rose-500">*</span>
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden bg-white"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Date of Visit <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="visitDate"
                  value={formData.visitDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expected Entry</label>
                  <input
                    type="text"
                    name="expectedEntryTime"
                    value={formData.expectedEntryTime}
                    onChange={handleChange}
                    placeholder="10:00 AM"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expected Exit</label>
                  <input
                    type="text"
                    name="expectedExitTime"
                    value={formData.expectedExitTime}
                    onChange={handleChange}
                    placeholder="01:00 PM"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Detailed Purpose of Visit <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="purpose"
                rows={3}
                value={formData.purpose}
                onChange={handleChange}
                placeholder="State clearly the reason for entering campus..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
                required
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-semibold transition-colors"
            >
              Clear Form
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Generating ID & Registering...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Submit & Generate Pass</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default VisitorRegistrationPage;

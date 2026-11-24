import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Search,
  UserPlus,
  CheckCircle2,
  Clock,
  Printer,
  FileText,
  AlertCircle,
  Building,
  User,
  ArrowRight
} from 'lucide-react';
import api from '../api/axios';
import StateBadge from '../components/StateBadge';

const PublicVisitorPortal = () => {
  const [activeTab, setActiveTab] = useState('lookup'); // 'lookup' | 'register'

  // Lookup
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Self Registration Form
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    email: '',
    visitorType: 'Academic Guest',
    personToMeet: '',
    department: 'Computer Science & Engineering',
    purpose: '',
    visitDate: new Date().toISOString().split('T')[0],
    expectedEntryTime: '10:00 AM',
    expectedExitTime: '01:00 PM',
    vehicleNumber: '',
    address: ''
  });
  const [registering, setRegistering] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(null);

  const handleLookup = async (e) => {
    e.preventDefault();
    setSearchError('');
    setLookupResult(null);

    if (!lookupQuery.trim()) {
      return setSearchError('Please enter a Visitor ID or Mobile number.');
    }

    try {
      setSearching(true);
      const res = await api.get(`/visitors/search/${encodeURIComponent(lookupQuery.trim())}`);
      if (res.data?.data && res.data.data.length > 0) {
        setLookupResult(res.data.data[0]);
      } else {
        setSearchError(`No visitor pass found matching '${lookupQuery}'. Please check the ID or mobile number.`);
      }
    } catch (err) {
      setSearchError('Error looking up visitor status. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess(null);

    if (!formData.fullName.trim() || !formData.mobileNumber.trim() || !formData.email.trim() || !formData.personToMeet.trim() || !formData.purpose.trim()) {
      return setRegError('Please complete all required fields.');
    }

    try {
      setRegistering(true);
      const res = await api.post('/visitors', formData);
      if (res.data?.data) {
        setRegSuccess(res.data.data);
      }
    } catch (err) {
      setRegError(err.response?.data?.message || 'Registration failed. Please check details.');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
      {/* Top Navigation */}
      <header className="h-16 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-950/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white">Campus Visitor Self-Service Kiosk</h1>
            <p className="text-[10px] text-slate-400">Digital Entry & Exit State Tracking</p>
          </div>
        </div>

        <Link
          to="/login"
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
        >
          <span>Staff / Admin Login</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl w-full mx-auto p-4 sm:p-6 my-6">
        {/* Tab Toggle */}
        <div className="flex items-center justify-center mb-6">
          <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex text-xs font-bold">
            <button
              onClick={() => setActiveTab('lookup')}
              className={`px-5 py-2 rounded-lg flex items-center gap-2 transition-all ${
                activeTab === 'lookup'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Track Visitor Status</span>
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`px-5 py-2 rounded-lg flex items-center gap-2 transition-all ${
                activeTab === 'register'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Self Registration</span>
            </button>
          </div>
        </div>

        {/* TAB 1: TRACK PASS STATUS */}
        {activeTab === 'lookup' && (
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-extrabold text-white">Track Visitor Pass & Approval Status</h2>
              <p className="text-xs text-slate-400">
                Enter your Visitor ID (e.g. SCV-20241124-1001) or 10-digit registered mobile number.
              </p>
            </div>

            <form onSubmit={handleLookup} className="flex gap-2">
              <input
                type="text"
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                placeholder="Enter Visitor ID or Mobile number..."
                className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={searching}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {searching ? 'Checking...' : 'Check Status'}
              </button>
            </form>

            {searchError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{searchError}</span>
              </div>
            )}

            {lookupResult && (
              <div className="border border-slate-700 bg-slate-900/80 rounded-2xl p-6 space-y-5 animate-in fade-in duration-200">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                      Official Campus Pass
                    </span>
                    <h3 className="text-xl font-bold text-white mt-0.5">{lookupResult.fullName}</h3>
                    <p className="font-mono text-xs font-bold text-blue-400">
                      ID: {lookupResult.visitorId}
                    </p>
                  </div>
                  <StateBadge state={lookupResult.currentState} size="lg" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Person to Meet:</span>
                    <span className="font-semibold text-slate-200">{lookupResult.personToMeet}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Department:</span>
                    <span className="font-semibold text-slate-200">{lookupResult.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Visit Date:</span>
                    <span className="font-semibold text-slate-200">
                      {new Date(lookupResult.visitDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Time Slot:</span>
                    <span className="font-semibold text-slate-200">
                      {lookupResult.expectedEntryTime} - {lookupResult.expectedExitTime}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-slate-300">
                  <span className="text-slate-500 block mb-0.5 font-bold">Purpose:</span>
                  <p>{lookupResult.purpose}</p>
                </div>

                {/* State Guidance */}
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 space-y-1">
                  <span className="font-bold block">Current Stage Instructions:</span>
                  {lookupResult.currentState === 'REGISTERED' && (
                    <p>Your visit is registered. Please proceed to Campus Gate 1 Security Checkpoint for identity verification.</p>
                  )}
                  {lookupResult.currentState === 'PENDING_VERIFICATION' && (
                    <p>Security is verifying your identity credentials. Please show a valid government ID at the gate.</p>
                  )}
                  {lookupResult.currentState === 'VERIFIED' && (
                    <p>Identity verified! Awaiting final entry authorization from host department.</p>
                  )}
                  {lookupResult.currentState === 'ENTRY_APPROVED' && (
                    <p className="text-emerald-300 font-bold">Entry Approved! You may now scan your pass at the turnstile gate to enter.</p>
                  )}
                  {lookupResult.currentState === 'INSIDE_CAMPUS' && (
                    <p className="text-emerald-300 font-bold">Active Visitor. Please remember to scan your pass at the exit barrier when leaving.</p>
                  )}
                  {lookupResult.currentState === 'CHECKED_OUT' && (
                    <p className="text-slate-400">Visit Concluded. Thank you for visiting the campus.</p>
                  )}
                  {lookupResult.currentState === 'REJECTED' && (
                    <p className="text-rose-300">Entry has been declined. Reason: {lookupResult.rejectionReason || 'Security policy'}.</p>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-2 border border-slate-700"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Status Pass</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SELF REGISTRATION */}
        {activeTab === 'register' && (
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-extrabold text-white">Campus Visitor Self-Registration</h2>
              <p className="text-xs text-slate-400">
                Pre-register your campus visit to receive an electronic entry pass code.
              </p>
            </div>

            {regSuccess ? (
              <div className="border border-emerald-500/30 bg-emerald-500/10 rounded-2xl p-6 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">Registration Submitted!</h3>
                <p className="text-xs text-slate-300">
                  Your electronic visitor pass code is:
                </p>
                <div className="font-mono text-xl font-extrabold text-blue-400 bg-slate-900 py-2 px-4 rounded-xl border border-blue-500/30 inline-block">
                  {regSuccess.visitorId}
                </div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Please keep this pass code handy when arriving at the campus security checkpoint.
                </p>
                <button
                  onClick={() => {
                    setLookupQuery(regSuccess.visitorId);
                    setActiveTab('lookup');
                    setLookupResult(regSuccess);
                  }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  View Status & Pass ➔
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
                {regError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                    {regError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Dr. Robert Vance"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                      placeholder="10-digit number"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Visitor Category</label>
                    <select
                      value={formData.visitorType}
                      onChange={(e) => setFormData({ ...formData, visitorType: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-blue-500/30 focus:outline-hidden"
                    >
                      <option value="Academic Guest">Academic Guest</option>
                      <option value="Parent/Guardian">Parent/Guardian</option>
                      <option value="Vendor/Contractor">Vendor/Contractor</option>
                      <option value="Student Guest">Student Guest</option>
                      <option value="Interviewee">Interviewee</option>
                      <option value="Delivery/Logistics">Delivery/Logistics</option>
                      <option value="Alumni">Alumni</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Host / Person to Meet *</label>
                    <input
                      type="text"
                      value={formData.personToMeet}
                      onChange={(e) => setFormData({ ...formData, personToMeet: e.target.value })}
                      placeholder="Faculty or Officer Name"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Department *</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-blue-500/30 focus:outline-hidden"
                    >
                      <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Electrical & Electronics">Electrical & Electronics</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Biotechnology & Bioinformatics">Biotechnology & Bioinformatics</option>
                      <option value="Campus Administration">Campus Administration</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Purpose of Visit *</label>
                  <textarea
                    rows={3}
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    placeholder="Describe the reason for entering campus..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-hidden"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={registering}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {registering ? 'Submitting Registration...' : 'Generate Electronic Pass'}
                </button>
              </form>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        Smart Campus Visitor Entry & Exit State Tracking System • All rights reserved
      </footer>
    </div>
  );
};

export default PublicVisitorPortal;

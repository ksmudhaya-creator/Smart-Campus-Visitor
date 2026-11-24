import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ScanLine,
  LogIn,
  LogOut,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Car,
  User,
  Shield,
  Building,
  Printer,
  ChevronRight
} from 'lucide-react';
import api from '../api/axios';
import StateBadge from '../components/StateBadge';
import ConfirmationModal from '../components/ConfirmationModal';

const CheckInOutPage = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'checkout' ? 'checkout' : 'checkin');

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [searching, setSearching] = useState(false);

  // Active inside campus list for checkout tab
  const [insideVisitors, setInsideVisitors] = useState([]);
  const [loadingInside, setLoadingInside] = useState(false);

  // Check-in / Check-out execution
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('checkin'); // 'checkin' | 'checkout'
  const [actionLoading, setActionLoading] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (activeTab === 'checkout') {
      fetchInsideVisitors();
    }
  }, [activeTab]);

  const fetchInsideVisitors = async () => {
    try {
      setLoadingInside(true);
      const res = await api.get('/visitors', {
        params: { state: 'INSIDE_CAMPUS', limit: 50 }
      });
      setInsideVisitors(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching inside campus visitors:', err);
    } finally {
      setLoadingInside(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      const res = await api.get(`/visitors/search/${encodeURIComponent(searchQuery.trim())}`);
      setSearchResults(res.data?.data || []);
      if (res.data?.data?.length > 0) {
        setSelectedVisitor(res.data.data[0]);
      } else {
        setSelectedVisitor(null);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleCheckIn = async () => {
    if (!selectedVisitor) return;
    try {
      setActionLoading(true);
      const res = await api.post(`/visitors/${selectedVisitor.visitorId}/checkin`, {
        remarks: remarks || 'Gate security check-in pass scanned. Access permitted.'
      });

      setModalOpen(false);
      setRemarks('');
      setFeedback({
        type: 'success',
        text: `Check-in complete for ${res.data.data.fullName}. State: INSIDE_CAMPUS.`
      });
      setSelectedVisitor(res.data.data);
      if (activeTab === 'checkout') fetchInsideVisitors();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!selectedVisitor) return;
    try {
      setActionLoading(true);
      const res = await api.post(`/visitors/${selectedVisitor.visitorId}/checkout`, {
        remarks: remarks || 'Exit gate scanner processed departure.'
      });

      setModalOpen(false);
      setRemarks('');
      setFeedback({
        type: 'success',
        text: `Check-out recorded for ${res.data.data.fullName}. Total Duration: ${res.data.data.totalDurationMinutes} mins. State: CHECKED_OUT.`
      });
      setSelectedVisitor(res.data.data);
      fetchInsideVisitors();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Helper to calculate minutes spent inside campus
  const getElapsedMinutes = (entryTime) => {
    if (!entryTime) return 0;
    const diffMs = Date.now() - new Date(entryTime).getTime();
    return Math.max(1, Math.round(diffMs / (1000 * 60)));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ScanLine className="w-6 h-6 text-emerald-600" />
            Security Check-In & Check-Out Terminal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gate terminal for physical barrier check-in and exit verification using strict FSM rules.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab('checkin');
              setSelectedVisitor(null);
              setSearchResults([]);
            }}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'checkin'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-4 h-4 text-emerald-600" />
            <span>Gate Check-In</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('checkout');
              setSelectedVisitor(null);
            }}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'checkout'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogOut className="w-4 h-4 text-slate-600" />
            <span>Gate Check-Out</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="font-bold underline text-[11px]">
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: GATE CHECK-IN */}
      {activeTab === 'checkin' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Search Bar & Results */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Scan or Search Visitor</h3>

            <form onSubmit={handleSearch} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Visitor ID or Mobile Number
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. SCV-20241124-1002 or phone"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={searching}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
              >
                {searching ? 'Searching...' : 'Scan / Lookup Visitor'}
              </button>
            </form>

            {searchResults.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Matches ({searchResults.length})
                </p>
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {searchResults.map((v) => (
                    <div
                      key={v._id}
                      onClick={() => setSelectedVisitor(v)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                        selectedVisitor?._id === v._id
                          ? 'border-blue-500 bg-blue-50/50'
                          : 'border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{v.fullName}</span>
                        <StateBadge state={v.currentState} size="sm" showIcon={false} />
                      </div>
                      <p className="font-mono text-[10px] text-blue-600">{v.visitorId}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (2 Cols): Visitor Pass Inspector & Action */}
          <div className="lg:col-span-2">
            {!selectedVisitor ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2 h-full min-h-[300px]">
                <ScanLine className="w-10 h-10 text-slate-300" />
                <p className="font-medium text-slate-600">No Visitor Selected for Check-In</p>
                <p className="text-slate-400 max-w-sm">
                  Search by Visitor ID (e.g. SCV-20241124-1002) or phone number above to inspect credentials.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      Gate Security Inspection
                    </span>
                    <h2 className="text-xl font-extrabold text-slate-900">{selectedVisitor.fullName}</h2>
                    <p className="font-mono text-xs font-bold text-blue-600">ID: {selectedVisitor.visitorId}</p>
                  </div>
                  <StateBadge state={selectedVisitor.currentState} size="lg" />
                </div>

                {/* Particulars Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Host Faculty:</span>
                    <span className="font-bold text-slate-800">{selectedVisitor.personToMeet}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Department:</span>
                    <span className="font-bold text-slate-800">{selectedVisitor.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Visitor Type:</span>
                    <span className="font-bold text-slate-800">{selectedVisitor.visitorType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Vehicle / Pass:</span>
                    <span className="font-bold text-slate-800">{selectedVisitor.vehicleNumber || 'None'}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-xs">
                  <span className="text-slate-400 block mb-0.5">Stated Purpose:</span>
                  <p className="font-medium text-slate-800">{selectedVisitor.purpose}</p>
                </div>

                {/* FSM Eligibility Rule Check */}
                {selectedVisitor.currentState === 'ENTRY_APPROVED' ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-emerald-900">
                      <p className="font-bold">Entry Pass Approved & Validated!</p>
                      <p className="mt-0.5 text-emerald-700">
                        Visitor has completed identity verification and host department authorization. Turnstile gate can now be unlocked.
                      </p>
                    </div>
                  </div>
                ) : selectedVisitor.currentState === 'INSIDE_CAMPUS' ? (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-900">
                      <p className="font-bold">Already Checked In & Inside Campus</p>
                      <p className="mt-0.5 text-blue-700">
                        Visitor is already on campus premises. Duplicate check-in is blocked by the FSM.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-rose-900">
                      <p className="font-bold">FSM Rule Violation: Check-In Disallowed</p>
                      <p className="mt-0.5 text-rose-700">
                        Current state is <span className="font-mono font-bold">{selectedVisitor.currentState}</span>. Under FSM rules, visitors can ONLY check in when state is <span className="font-mono font-bold">ENTRY_APPROVED</span>.
                      </p>
                    </div>
                  </div>
                )}

                {/* Check In Action Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    disabled={selectedVisitor.currentState !== 'ENTRY_APPROVED'}
                    onClick={() => {
                      setModalMode('checkin');
                      setModalOpen(true);
                    }}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Confirm Gate Check-In & Issue Badge</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: GATE CHECK-OUT */}
      {activeTab === 'checkout' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Active Campus Visitors (Inside Campus)</h3>
              <p className="text-xs text-slate-500">
                Visitors with state <span className="font-mono text-emerald-600 font-bold">INSIDE_CAMPUS</span>. Click "Check-Out" when visitor reaches the exit gate barrier.
              </p>
            </div>
            <button
              onClick={fetchInsideVisitors}
              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5"
            >
              <span>Refresh</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {loadingInside ? (
              <div className="p-12 text-center text-slate-400 text-xs">Loading active campus visitors...</div>
            ) : insideVisitors.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                No active visitors currently recorded inside campus grounds.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Visitor</th>
                    <th className="py-3 px-4">Host / Department</th>
                    <th className="py-3 px-4">Check-In Time</th>
                    <th className="py-3 px-4">Time Spent on Campus</th>
                    <th className="py-3 px-4">Vehicle</th>
                    <th className="py-3 px-4 text-right">Gate Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {insideVisitors.map((v) => {
                    const elapsed = getElapsedMinutes(v.actualEntryTime);
                    return (
                      <tr key={v._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{v.fullName}</p>
                          <p className="font-mono text-[11px] text-blue-600">{v.visitorId}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-800">{v.personToMeet}</p>
                          <p className="text-[10px] text-slate-500">{v.department}</p>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700">
                          {v.actualEntryTime
                            ? new Date(v.actualEntryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md text-[11px]">
                            {elapsed} mins elapsed
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                          {v.vehicleNumber || 'Pedestrian'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedVisitor(v);
                              setModalMode('checkout');
                              setModalOpen(true);
                            }}
                            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 ml-auto shadow-xs transition-colors"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Check-Out</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal for Check-In or Check-Out */}
      <ConfirmationModal
        isOpen={modalOpen}
        title={modalMode === 'checkin' ? 'Confirm Campus Gate Check-In' : 'Confirm Campus Gate Check-Out'}
        message={
          modalMode === 'checkin'
            ? `Record physical check-in for visitor ${selectedVisitor?.fullName} (${selectedVisitor?.visitorId})? This advances the FSM state to CHECKED_IN and INSIDE_CAMPUS.`
            : `Record campus exit for visitor ${selectedVisitor?.fullName}? Total duration will be calculated and state set to terminal CHECKED_OUT.`
        }
        confirmText={modalMode === 'checkin' ? 'Execute Check-In' : 'Execute Check-Out'}
        confirmVariant={modalMode === 'checkin' ? 'emerald' : 'blue'}
        loading={actionLoading}
        onConfirm={modalMode === 'checkin' ? handleCheckIn : handleCheckOut}
        onCancel={() => setModalOpen(false)}
      >
        <div className="mt-2 text-xs">
          <label className="block font-semibold text-slate-700 mb-1">
            Gate Officer Remarks:
          </label>
          <input
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder={
              modalMode === 'checkin'
                ? 'e.g. Visitor issued RFID Badge #42; vehicle inspected'
                : 'e.g. Visitor returned badge; exit scan verified'
            }
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
          />
        </div>
      </ConfirmationModal>
    </div>
  );
};

export default CheckInOutPage;

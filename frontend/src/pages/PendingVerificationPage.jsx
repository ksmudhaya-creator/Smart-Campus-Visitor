import React, { useState, useEffect } from 'react';
import {
  Clock,
  ShieldCheck,
  XCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
  User,
  Building,
  RefreshCw
} from 'lucide-react';
import api from '../api/axios';
import StateBadge from '../components/StateBadge';
import ConfirmationModal from '../components/ConfirmationModal';

const PendingVerificationPage = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Actions
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const fetchPendingVisitors = async () => {
    try {
      setLoading(true);
      // Fetch both REGISTERED and PENDING_VERIFICATION
      const [regRes, penRes] = await Promise.all([
        api.get('/visitors', { params: { state: 'REGISTERED', limit: 50 } }),
        api.get('/visitors', { params: { state: 'PENDING_VERIFICATION', limit: 50 } })
      ]);

      const combined = [
        ...(penRes.data?.data || []),
        ...(regRes.data?.data || [])
      ];

      setVisitors(combined);
    } catch (err) {
      console.error('Error fetching pending verification visitors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingVisitors();
  }, []);

  const handleVerify = async () => {
    if (!selectedVisitor) return;
    try {
      setActionLoading(true);
      const res = await api.put(`/visitors/${selectedVisitor.visitorId}/verify`, {
        remarks: remarks || 'Government ID and personal credentials checked and verified by security staff'
      });

      setVerifyModalOpen(false);
      setSelectedVisitor(null);
      setRemarks('');
      setFeedbackMessage({
        type: 'success',
        text: `Visitor ${res.data.data.fullName} (${res.data.data.visitorId}) successfully moved to VERIFIED state.`
      });
      fetchPendingVisitors();
    } catch (err) {
      alert(err.response?.data?.message || 'Verification failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedVisitor) return;
    if (!rejectionReason.trim()) {
      return alert('Please enter a specific reason for entry rejection.');
    }

    try {
      setActionLoading(true);
      const res = await api.put(`/visitors/${selectedVisitor.visitorId}/reject`, {
        reason: rejectionReason,
        remarks: remarks || 'Rejected during identity verification checkpoint'
      });

      setRejectModalOpen(false);
      setSelectedVisitor(null);
      setRejectionReason('');
      setRemarks('');
      setFeedbackMessage({
        type: 'warning',
        text: `Visitor ${res.data.data.fullName} entry has been REJECTED.`
      });
      fetchPendingVisitors();
    } catch (err) {
      alert(err.response?.data?.message || 'Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredVisitors = visitors.filter((v) => {
    const q = search.toLowerCase();
    return (
      v.fullName.toLowerCase().includes(q) ||
      v.visitorId.toLowerCase().includes(q) ||
      v.mobileNumber.includes(q) ||
      v.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-amber-500" />
            Identity Verification Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gate security checkpoint for visitors in <span className="font-mono text-amber-600 font-bold">PENDING_VERIFICATION</span> or <span className="font-mono text-blue-600 font-bold">REGISTERED</span> state.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search queue..."
              className="pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <button
            onClick={fetchPendingVisitors}
            className="p-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-amber-50 border border-amber-200 text-amber-800'
          }`}
        >
          <span>{feedbackMessage.text}</span>
          <button onClick={() => setFeedbackMessage(null)} className="font-bold underline text-[11px]">
            Dismiss
          </button>
        </div>
      )}

      {/* Cards Queue */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading verification queue...</div>
      ) : filteredVisitors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Verification Queue is Clear</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All registered visitors have been verified or processed. New registrations will automatically appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVisitors.map((v) => (
            <div
              key={v._id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{v.fullName}</h3>
                    <p className="font-mono text-xs font-semibold text-blue-600">{v.visitorId}</p>
                  </div>
                  <StateBadge state={v.currentState} size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-3">
                  <div>
                    <span className="text-slate-400 block">Mobile:</span>
                    <span className="font-semibold text-slate-800">{v.mobileNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Category:</span>
                    <span className="font-semibold text-slate-800">{v.visitorType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Host:</span>
                    <span className="font-semibold text-slate-800">{v.personToMeet}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Department:</span>
                    <span className="font-semibold text-slate-800 truncate block">{v.department}</span>
                  </div>
                </div>

                <div className="text-xs bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Purpose of Visit:</span>
                  <p className="text-slate-700 font-medium">{v.purpose}</p>
                </div>

                {v.vehicleNumber && (
                  <p className="text-[11px] text-slate-500 font-mono mt-2">
                    Vehicle: <span className="font-bold text-slate-700">{v.vehicleNumber}</span>
                  </p>
                )}
              </div>

              {/* Security Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setSelectedVisitor(v);
                    setRejectModalOpen(true);
                  }}
                  className="px-3 py-1.5 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedVisitor(v);
                    setVerifyModalOpen(true);
                  }}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verify Identity</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Verify Confirmation Modal */}
      <ConfirmationModal
        isOpen={verifyModalOpen}
        title="Confirm Identity Verification"
        message={`Confirm identity check for visitor ${selectedVisitor?.fullName} (${selectedVisitor?.visitorId}). This will advance the FSM state to VERIFIED.`}
        confirmText="Verify Visitor"
        confirmVariant="blue"
        loading={actionLoading}
        onConfirm={handleVerify}
        onCancel={() => setVerifyModalOpen(false)}
      >
        <div className="mt-2 text-xs">
          <label className="block font-semibold text-slate-700 mb-1">
            Verification Remarks / ID Checked:
          </label>
          <input
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Government Aadhaar / Driver License verified"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
          />
        </div>
      </ConfirmationModal>

      {/* Reject Confirmation Modal */}
      <ConfirmationModal
        isOpen={rejectModalOpen}
        title="Reject Campus Entry"
        message={`Are you sure you want to reject visitor ${selectedVisitor?.fullName}? In the FSM, REJECTED is a terminal state.`}
        confirmText="Reject Entry"
        confirmVariant="rose"
        loading={actionLoading}
        onConfirm={handleReject}
        onCancel={() => setRejectModalOpen(false)}
      >
        <div className="mt-2 space-y-2 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Rejection Reason <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Identity mismatch / Unauthorized solicitation"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:outline-hidden"
              required
            />
          </div>
        </div>
      </ConfirmationModal>
    </div>
  );
};

export default PendingVerificationPage;

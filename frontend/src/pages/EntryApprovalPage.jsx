import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Search,
  Building,
  User,
  Calendar,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import api from '../api/axios';
import StateBadge from '../components/StateBadge';
import ConfirmationModal from '../components/ConfirmationModal';

const EntryApprovalPage = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchVerifiedVisitors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/visitors', {
        params: { state: 'VERIFIED', limit: 50 }
      });
      setVisitors(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching verified visitors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifiedVisitors();
  }, []);

  const handleApprove = async () => {
    if (!selectedVisitor) return;
    try {
      setActionLoading(true);
      const res = await api.put(`/visitors/${selectedVisitor.visitorId}/approve`, {
        remarks: remarks || 'Entry approved by campus authority & host department'
      });

      setApproveModalOpen(false);
      setSelectedVisitor(null);
      setRemarks('');
      setFeedback({
        type: 'success',
        text: `Visitor ${res.data.data.fullName} is now ENTRY_APPROVED. Gate check-in pass unlocked!`
      });
      fetchVerifiedVisitors();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedVisitor) return;
    if (!rejectionReason.trim()) {
      return alert('Please enter a rejection reason.');
    }

    try {
      setActionLoading(true);
      const res = await api.put(`/visitors/${selectedVisitor.visitorId}/reject`, {
        reason: rejectionReason,
        remarks: remarks || 'Entry denied by host department'
      });

      setRejectModalOpen(false);
      setSelectedVisitor(null);
      setRejectionReason('');
      setRemarks('');
      setFeedback({
        type: 'warning',
        text: `Visitor ${res.data.data.fullName} entry was REJECTED.`
      });
      fetchVerifiedVisitors();
    } catch (err) {
      alert(err.response?.data?.message || 'Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = visitors.filter((v) => {
    const q = search.toLowerCase();
    return (
      v.fullName.toLowerCase().includes(q) ||
      v.visitorId.toLowerCase().includes(q) ||
      v.department.toLowerCase().includes(q) ||
      v.personToMeet.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-purple-600" />
            Host Entry Approval Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Department approval for visitors in <span className="font-mono text-indigo-600 font-bold">VERIFIED</span> state. Approving enables physical gate check-in (<span className="font-mono text-purple-600 font-bold">ENTRY_APPROVED</span>).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search verified visitors..."
              className="pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <button
            onClick={fetchVerifiedVisitors}
            className="p-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-purple-50 border border-purple-200 text-purple-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="font-bold underline text-[11px]">
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading verified visitors...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-purple-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Approval Queue is Clear</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No visitors are currently awaiting host authorization. Verified visitors will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((v) => (
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
                    <span className="text-slate-400 block">Host Faculty:</span>
                    <span className="font-semibold text-slate-800">{v.personToMeet}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Department:</span>
                    <span className="font-semibold text-slate-800 truncate block">{v.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Expected Entry:</span>
                    <span className="font-semibold text-slate-800">{v.expectedEntryTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Mobile:</span>
                    <span className="font-semibold text-slate-800">{v.mobileNumber}</span>
                  </div>
                </div>

                <div className="text-xs bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Purpose of Visit:</span>
                  <p className="text-slate-700 font-medium">{v.purpose}</p>
                </div>

                {v.verifiedBy && (
                  <p className="text-[10px] text-emerald-600 font-medium mt-2">
                    ✓ Verified by {v.verifiedBy.name} ({new Date(v.verifiedBy.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setSelectedVisitor(v);
                    setRejectModalOpen(true);
                  }}
                  className="px-3 py-1.5 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Decline</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedVisitor(v);
                    setApproveModalOpen(true);
                  }}
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Grant Entry Approval</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approve Modal */}
      <ConfirmationModal
        isOpen={approveModalOpen}
        title="Approve Campus Entry"
        message={`Authorize entry for visitor ${selectedVisitor?.fullName} to department '${selectedVisitor?.department}'? This advances state to ENTRY_APPROVED.`}
        confirmText="Approve Entry"
        confirmVariant="purple"
        loading={actionLoading}
        onConfirm={handleApprove}
        onCancel={() => setApproveModalOpen(false)}
      >
        <div className="mt-2 text-xs">
          <label className="block font-semibold text-slate-700 mb-1">
            Approval Remarks / Gate Pass Instructions:
          </label>
          <input
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Approved by Head of Department; pass to Building B"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-hidden"
          />
        </div>
      </ConfirmationModal>

      {/* Reject Modal */}
      <ConfirmationModal
        isOpen={rejectModalOpen}
        title="Decline Campus Entry"
        message={`Decline campus entry request for ${selectedVisitor?.fullName}?`}
        confirmText="Decline Entry"
        confirmVariant="rose"
        loading={actionLoading}
        onConfirm={handleReject}
        onCancel={() => setRejectModalOpen(false)}
      >
        <div className="mt-2 text-xs">
          <label className="block font-semibold text-slate-700 mb-1">
            Reason for Declining:
          </label>
          <input
            type="text"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. Faculty unavailable / Meeting rescheduled"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:outline-hidden"
            required
          />
        </div>
      </ConfirmationModal>
    </div>
  );
};

export default EntryApprovalPage;

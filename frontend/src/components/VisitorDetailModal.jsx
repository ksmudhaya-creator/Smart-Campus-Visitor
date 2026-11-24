import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  Shield,
  Clock,
  User,
  Phone,
  Mail,
  Building,
  Car,
  MapPin,
  CheckCircle,
  XCircle,
  AlertTriangle,
  History,
  QrCode
} from 'lucide-react';
import StateBadge from './StateBadge';
import api from '../api/axios';

const VisitorDetailModal = ({ visitor, isOpen, onClose, onRefresh }) => {
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (isOpen && visitor?.visitorId) {
      fetchHistory(visitor.visitorId);
    }
  }, [isOpen, visitor]);

  const fetchHistory = async (visitorId) => {
    try {
      setLoadingHistory(true);
      const res = await api.get(`/fsm/history/${visitorId}`);
      if (res.data && res.data.data) {
        setHistory(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load visitor transition history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen || !visitor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{visitor.fullName}</h3>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                  {visitor.visitorId}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Registered on {new Date(visitor.createdAt || visitor.visitDate).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Print Campus Pass"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Pass</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Printable Campus Gate Pass Card */}
          <div className="printable-pass border-2 border-dashed border-blue-300 rounded-2xl p-5 bg-gradient-to-br from-blue-50/50 via-white to-slate-50 relative overflow-hidden shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-blue-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                  Official Campus Visitor Pass
                </span>
                <h4 className="text-xl font-extrabold text-slate-900 mt-1">{visitor.fullName}</h4>
                <p className="text-xs text-slate-500 font-mono">Pass Code: {visitor.visitorId}</p>
              </div>

              <div className="flex flex-col items-end">
                <StateBadge state={visitor.currentState} size="lg" />
                <span className="text-[11px] text-slate-500 mt-1 font-medium">
                  {visitor.visitorType}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 text-xs">
              <div>
                <p className="text-slate-400 font-medium">Person To Meet</p>
                <p className="font-semibold text-slate-800">{visitor.personToMeet}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Department</p>
                <p className="font-semibold text-slate-800">{visitor.department}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Expected Time</p>
                <p className="font-semibold text-slate-800">
                  {visitor.expectedEntryTime} - {visitor.expectedExitTime}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Vehicle / College ID</p>
                <p className="font-semibold text-slate-800">
                  {visitor.vehicleNumber || visitor.collegeId || 'None'}
                </p>
              </div>
            </div>

            {/* Actual Timestamps & Duration */}
            {(visitor.actualEntryTime || visitor.actualExitTime) && (
              <div className="bg-white/80 rounded-xl p-3 border border-blue-100/80 flex flex-wrap items-center justify-between text-xs gap-3">
                {visitor.actualEntryTime && (
                  <div>
                    <span className="text-slate-500">Actual Check-In: </span>
                    <span className="font-semibold text-slate-800">
                      {new Date(visitor.actualEntryTime).toLocaleTimeString()}
                    </span>
                  </div>
                )}
                {visitor.actualExitTime && (
                  <div>
                    <span className="text-slate-500">Actual Check-Out: </span>
                    <span className="font-semibold text-slate-800">
                      {new Date(visitor.actualExitTime).toLocaleTimeString()}
                    </span>
                  </div>
                )}
                {visitor.totalDurationMinutes > 0 && (
                  <div className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-md">
                    Total Duration: {visitor.totalDurationMinutes} mins
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Visitor Particulars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70 space-y-2.5">
              <h5 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Contact & Identity
              </h5>
              <div className="flex justify-between">
                <span className="text-slate-500">Mobile Number:</span>
                <span className="font-semibold text-slate-800">{visitor.mobileNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email Address:</span>
                <span className="font-semibold text-slate-800">{visitor.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Verification Status:</span>
                <span className="font-bold text-slate-800">{visitor.verificationStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Residential Address:</span>
                <span className="font-semibold text-slate-800 text-right max-w-[200px] truncate">
                  {visitor.address || 'Not provided'}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70 space-y-2.5">
              <h5 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                Visit Specifics
              </h5>
              <div>
                <span className="text-slate-500 block mb-0.5">Purpose of Visit:</span>
                <p className="font-medium text-slate-800 bg-white p-2 rounded border border-slate-200/60">
                  {visitor.purpose}
                </p>
              </div>
              {visitor.rejectionReason && (
                <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-lg text-rose-700">
                  <span className="font-bold block">Rejection Reason:</span>
                  <span>{visitor.rejectionReason}</span>
                </div>
              )}
            </div>
          </div>

          {/* FSM Transition Audit History Timeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                FSM State Transition Audit Trail ({history.length} records)
              </h5>
            </div>

            {loadingHistory ? (
              <p className="text-xs text-slate-400 py-4 text-center">Loading transition history...</p>
            ) : history.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No history recorded yet.</p>
            ) : (
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden max-h-56 overflow-y-auto text-xs">
                {history.map((h, idx) => (
                  <div
                    key={h._id || idx}
                    className={`p-3 flex items-start justify-between gap-3 ${
                      !h.isValid ? 'bg-rose-50/50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-slate-700">{h.previousState}</span>
                        <span className="text-slate-400">➔</span>
                        <span className="font-mono font-bold text-blue-700">{h.newState}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 font-bold rounded-full ${
                            h.isValid
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {h.isValid ? 'VALID' : 'ILLEGAL ATTEMPT'}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{h.reason || h.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-[10px] font-medium text-slate-500">
                        {new Date(h.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </p>
                      <p className="text-[10px] text-slate-400">{h.actionBy?.name || 'System'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisitorDetailModal;

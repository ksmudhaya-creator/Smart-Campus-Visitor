import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Calendar,
  Clock,
  User,
  Building,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Filter
} from 'lucide-react';
import api from '../api/axios';
import StateBadge from '../components/StateBadge';
import VisitorDetailModal from '../components/VisitorDetailModal';

const VisitorHistoryPage = () => {
  const [visitors, setVisitors] = useState([]);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/visitors', { params: { limit: 50 } });
      if (res.data?.data) {
        setVisitors(res.data.data);
        if (res.data.data.length > 0) {
          selectVisitor(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching visitors:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectVisitor = async (visitor) => {
    setSelectedVisitor(visitor);
    try {
      setHistoryLoading(true);
      const res = await api.get(`/fsm/history/${visitor.visitorId}`);
      setHistory(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching visitor history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const filteredVisitors = visitors.filter((v) => {
    const q = search.toLowerCase();
    return (
      v.fullName.toLowerCase().includes(q) ||
      v.visitorId.toLowerCase().includes(q) ||
      v.mobileNumber.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-indigo-600" />
            Visitor Movement & Historical Audit Trails
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete chronological journey and state transitions of campus visitors over time.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side (4 cols): Visitors List */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search visitor records..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto">
            {loading ? (
              <p className="p-4 text-center text-xs text-slate-400">Loading visitors...</p>
            ) : filteredVisitors.length === 0 ? (
              <p className="p-4 text-center text-xs text-slate-400">No visitors found.</p>
            ) : (
              filteredVisitors.map((v) => (
                <div
                  key={v._id}
                  onClick={() => selectVisitor(v)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedVisitor?._id === v._id
                      ? 'border-indigo-500 bg-indigo-50/40 shadow-xs'
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{v.fullName}</span>
                    <StateBadge state={v.currentState} size="sm" showIcon={false} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span className="font-mono text-blue-600">{v.visitorId}</span>
                    <span>{new Date(v.visitDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side (8 cols): Chronological Timeline & Particulars */}
        <div className="lg:col-span-8 space-y-4">
          {selectedVisitor ? (
            <>
              {/* Summary Header Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-slate-900">{selectedVisitor.fullName}</h3>
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                      {selectedVisitor.visitorId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedVisitor.visitorType} • Department: {selectedVisitor.department}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <StateBadge state={selectedVisitor.currentState} size="md" />
                  <button
                    onClick={() => setDetailModalOpen(true)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
                  >
                    View Full Pass
                  </button>
                </div>
              </div>

              {/* Movement Timeline */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  State Machine Lifecycle Progression ({history.length} stages)
                </h4>

                {historyLoading ? (
                  <p className="text-xs text-slate-400 py-6 text-center">Loading timeline data...</p>
                ) : history.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No history recorded for this visitor.</p>
                ) : (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {history.map((item, idx) => (
                      <div key={item._id || idx} className="relative group">
                        {/* Dot indicator */}
                        <div
                          className={`absolute -left-[27px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                            item.isValid ? 'bg-indigo-600' : 'bg-rose-600 ring-2 ring-rose-200'
                          }`}
                        />

                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 hover:border-slate-300 transition-colors space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 font-mono font-bold">
                              <span className="text-slate-600">{item.previousState}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-indigo-600">{item.newState}</span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  item.isValid
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {item.isValid ? 'VALID' : 'BLOCKED ILLEGAL ATTEMPT'}
                              </span>
                            </div>

                            <span className="text-[11px] font-mono text-slate-400">
                              {new Date(item.timestamp).toLocaleString([], {
                                dateStyle: 'short',
                                timeStyle: 'medium'
                              })}
                            </span>
                          </div>

                          <p className="text-xs text-slate-700 leading-relaxed">
                            {item.reason || item.description}
                          </p>

                          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200/50">
                            <span>Operator: {item.actionBy?.name || 'System'}</span>
                            <span className="uppercase font-semibold text-[10px]">
                              Role: {item.actionBy?.role || 'SYSTEM'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              Select a visitor from the list on the left to inspect movement history.
            </div>
          )}
        </div>
      </div>

      {/* Visitor Detail Modal */}
      <VisitorDetailModal
        visitor={selectedVisitor}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
      />
    </div>
  );
};

export default VisitorHistoryPage;

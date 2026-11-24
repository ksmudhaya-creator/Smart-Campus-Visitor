import React, { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  Filter,
  Shield,
  Clock,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';
import api from '../api/axios';

const ACTIONS = [
  'ALL',
  'VISITOR_REGISTERED',
  'FSM_TRANSITION',
  'INVALID_TRANSITION_ATTEMPT',
  'VISITOR_CHECKED_IN',
  'VISITOR_CHECKED_OUT',
  'VISITOR_ENTRY_REJECTED',
  'USER_LOGIN',
  'ADMIN_CREATE_USER'
];

const STATUSES = ['ALL', 'SUCCESS', 'WARNING', 'FAILURE', 'INFO'];

const ActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [visitorId, setVisitorId] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        visitorId: visitorId.trim() || undefined,
        action: selectedAction !== 'ALL' ? selectedAction : undefined,
        status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      };

      const res = await api.get('/logs', { params });
      if (res.data) {
        setLogs(res.data.data || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, selectedAction, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleReset = () => {
    setVisitorId('');
    setSelectedAction('ALL');
    setSelectedStatus('ALL');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-blue-600" />
            Security & Activity Audit Logs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            System audit trail recording visitor registrations, gate check-ins, check-outs, FSM transitions, and invalid transition attempts.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Visitor ID Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={visitorId}
              onChange={(e) => setVisitorId(e.target.value)}
              placeholder="Search Visitor ID..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Action Filter */}
          <div>
            <select
              value={selectedAction}
              onChange={(e) => {
                setSelectedAction(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden font-medium text-slate-700"
            >
              {ACTIONS.map((a) => (
                <option key={a} value={a}>
                  Action: {a}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden font-medium text-slate-700"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  Status: {s}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Filter Logs
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-2 border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-lg shrink-0"
              title="Reset Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Log ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Visitor ID</th>
                <th className="py-3 px-4">Transition</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">User / Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    Loading activity logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    No activity logs recorded matching criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log._id || log.logId}
                    className={`transition-colors ${
                      log.status === 'WARNING'
                        ? 'bg-rose-50/40 hover:bg-rose-50/80'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {log.logId}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {new Date(log.timestamp).toLocaleString([], {
                        dateStyle: 'short',
                        timeStyle: 'medium'
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      {log.visitorId || '—'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {log.previousState && log.newState ? (
                        <span className="flex items-center gap-1 font-semibold">
                          <span className="text-slate-600">{log.previousState}</span>
                          <span className="text-slate-400">➔</span>
                          <span className="text-purple-600">{log.newState}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-sm truncate" title={log.description}>
                      {log.description}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.status === 'WARNING'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <p className="font-semibold text-slate-800">{log.userId?.name || 'System'}</p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {log.userId?.role || 'SYSTEM'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-800">{logs.length}</span> of{' '}
            <span className="font-bold text-slate-800">{total}</span> total logs
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg hover:bg-slate-100 disabled:opacity-40 font-semibold"
            >
              Previous
            </button>
            <span className="px-3 py-1 font-bold text-slate-800">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg hover:bg-slate-100 disabled:opacity-40 font-semibold"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogsPage;

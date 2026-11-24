import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Building,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  Plus
} from 'lucide-react';
import api from '../api/axios';
import StateBadge from '../components/StateBadge';
import VisitorDetailModal from '../components/VisitorDetailModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS = [
  'ALL',
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

const STATES = [
  'ALL',
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

const VisitorManagementPage = () => {
  const [searchParams] = useSearchParams();
  const { isAdmin } = useAuth();

  const [visitors, setVisitors] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || 'ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('');

  // Modals
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [visitorToDelete, setVisitorToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
        search: search.trim() || undefined,
        state: selectedState !== 'ALL' ? selectedState : undefined,
        department: selectedDept !== 'ALL' ? selectedDept : undefined,
        date: selectedDate || undefined
      };

      const res = await api.get('/visitors', { params });
      if (res.data) {
        setVisitors(res.data.data || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching visitors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, [page, selectedState, selectedDept, selectedDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchVisitors();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedState('ALL');
    setSelectedDept('ALL');
    setSelectedDate('');
    setPage(1);
  };

  const handleExportCSV = () => {
    if (visitors.length === 0) return alert('No records to export');

    const headers = [
      'Visitor ID',
      'Full Name',
      'Mobile Number',
      'Email',
      'Visitor Type',
      'Person To Meet',
      'Department',
      'Purpose',
      'Current State',
      'Visit Date',
      'Actual Entry',
      'Actual Exit',
      'Duration (Mins)'
    ];

    const rows = visitors.map((v) => [
      v.visitorId,
      `"${v.fullName.replace(/"/g, '""')}"`,
      v.mobileNumber,
      v.email,
      v.visitorType,
      `"${v.personToMeet.replace(/"/g, '""')}"`,
      `"${v.department.replace(/"/g, '""')}"`,
      `"${v.purpose.replace(/"/g, '""')}"`,
      v.currentState,
      new Date(v.visitDate).toLocaleDateString(),
      v.actualEntryTime ? new Date(v.actualEntryTime).toLocaleTimeString() : 'N/A',
      v.actualExitTime ? new Date(v.actualExitTime).toLocaleTimeString() : 'N/A',
      v.totalDurationMinutes || 0
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `campus_visitors_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const confirmDelete = async () => {
    if (!visitorToDelete) return;
    try {
      setActionLoading(true);
      await api.delete(`/visitors/${visitorToDelete._id}`);
      setDeleteModalOpen(false);
      setVisitorToDelete(null);
      fetchVisitors();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete visitor');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-600" />
            Visitor Management Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete database of campus visitors. Search, filter by FSM state, inspect audit trails, and export reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone, ID..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          {/* FSM State Filter */}
          <div>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden font-medium text-slate-700"
            >
              {STATES.map((s) => (
                <option key={s} value={s}>
                  State: {s}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden font-medium text-slate-700 truncate"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  Dept: {d}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter & Search Action */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden text-slate-700"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shrink-0 transition-colors"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              title="Reset Filters"
              className="p-2 border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-lg shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Visitors Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Visitor ID</th>
                <th className="py-3 px-4">Visitor Name</th>
                <th className="py-3 px-4">Mobile & Type</th>
                <th className="py-3 px-4">Host / Department</th>
                <th className="py-3 px-4">Purpose</th>
                <th className="py-3 px-4">Date & Timestamps</th>
                <th className="py-3 px-4">Current FSM State</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    Loading visitors database...
                  </td>
                </tr>
              ) : visitors.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    No visitors found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                visitors.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Visitor ID */}
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                      {v.visitorId}
                    </td>

                    {/* Full Name */}
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {v.fullName}
                    </td>

                    {/* Mobile & Type */}
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-700">{v.mobileNumber}</p>
                      <span className="text-[10px] text-slate-400">{v.visitorType}</span>
                    </td>

                    {/* Host & Department */}
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{v.personToMeet}</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[150px]">{v.department}</p>
                    </td>

                    {/* Purpose */}
                    <td className="py-3 px-4 text-slate-600 max-w-[180px] truncate" title={v.purpose}>
                      {v.purpose}
                    </td>

                    {/* Date & Timestamps */}
                    <td className="py-3 px-4">
                      <p className="text-slate-700 font-medium">
                        {new Date(v.visitDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {v.actualEntryTime
                          ? `In: ${new Date(v.actualEntryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                          : `Exp: ${v.expectedEntryTime}`}
                      </p>
                    </td>

                    {/* State Badge */}
                    <td className="py-3 px-4">
                      <StateBadge state={v.currentState} size="sm" />
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedVisitor(v);
                            setDetailModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                          title="View Details & Pass"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {isAdmin && (
                          <button
                            onClick={() => {
                              setVisitorToDelete(v);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors"
                            title="Delete Visitor (Admin)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-800">{visitors.length}</span> of{' '}
            <span className="font-bold text-slate-800">{total}</span> total visitors
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

      {/* Visitor Detail Modal */}
      <VisitorDetailModal
        visitor={selectedVisitor}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onRefresh={fetchVisitors}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Visitor Record"
        message={`Are you sure you want to permanently delete visitor record ${visitorToDelete?.visitorId} (${visitorToDelete?.fullName})? This action cannot be undone.`}
        confirmText="Delete Record"
        confirmVariant="rose"
        loading={actionLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

export default VisitorManagementPage;

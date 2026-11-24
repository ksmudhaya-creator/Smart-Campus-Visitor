import React, { useState, useEffect } from 'react';
import {
  FileBarChart,
  Download,
  Printer,
  Calendar,
  Building,
  Users,
  Clock,
  TrendingUp,
  PieChart as PieIcon
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import api from '../api/axios';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b', '#3b82f6'];

const ReportsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, statsRes] = await Promise.all([
        api.get('/dashboard/analytics'),
        api.get('/dashboard/stats')
      ]);

      setAnalytics(analyticsRes.data);
      setStats(statsRes.data?.stats);
    } catch (err) {
      console.error('Failed to load report analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileBarChart className="w-6 h-6 text-blue-600" />
            Campus Entry & Exit Analytical Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Academic report dashboard evaluating campus traffic, department footfall, and state machine distributions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Total All-Time Visitors
          </p>
          <h3 className="text-2xl font-bold text-slate-900">{stats?.totalAllTime || 0}</h3>
          <p className="text-xs text-slate-400 mt-2">Recorded since system inception</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Completed Visits Today
          </p>
          <h3 className="text-2xl font-bold text-emerald-600">{stats?.visitorsCheckedOutToday || 0}</h3>
          <p className="text-xs text-slate-400 mt-2">Fully checked-out exits</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Active Inside Campus
          </p>
          <h3 className="text-2xl font-bold text-blue-600">{stats?.currentlyInsideCampus || 0}</h3>
          <p className="text-xs text-slate-400 mt-2">Currently moving on premises</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Blocked Security Attempts
          </p>
          <h3 className="text-2xl font-bold text-rose-600">{stats?.invalidFsmAttempts || 0}</h3>
          <p className="text-xs text-slate-400 mt-2">Intercepted by FSM rules</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visitor Category Distribution Pie Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Visitor Category Composition</h3>
              <p className="text-xs text-slate-500">Distribution by guest type</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.visitorTypeStats || []}
                  dataKey="value"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {(analytics?.visitorTypeStats || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Traffic Pattern */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Hourly Gate Check-In Footfall</h3>
              <p className="text-xs text-slate-500">Peak arrival hours at campus main gate</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.hourlyData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="entries" name="Entries" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="exits" name="Exits" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Academic Department Footfall Summary</h3>
          <span className="text-xs font-semibold text-slate-500">Live Metric Aggregation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Total Visitors</th>
                <th className="py-3 px-4">Currently Inside</th>
                <th className="py-3 px-4">Completed Visits</th>
                <th className="py-3 px-4 text-right">Traffic Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(analytics?.departmentStats || []).map((dept) => {
                const totalAll = stats?.totalAllTime || 1;
                const sharePercent = Math.round((dept.total / totalAll) * 100);
                return (
                  <tr key={dept.department} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-800">{dept.department}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{dept.total}</td>
                    <td className="py-3 px-4 text-emerald-700 font-bold">{dept.inside}</td>
                    <td className="py-3 px-4 text-slate-600">{dept.checkedOut}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${Math.min(100, sharePercent)}%` }}
                          />
                        </div>
                        <span className="font-mono text-slate-500 w-8">{sharePercent}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

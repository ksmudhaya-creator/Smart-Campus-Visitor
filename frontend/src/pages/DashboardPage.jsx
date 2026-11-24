import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  MapPin,
  LogOut,
  Clock,
  ShieldCheck,
  XCircle,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  ScanLine,
  GitBranch,
  Shield
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
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
import StatCard from '../components/StatCard';
import StateBadge from '../components/StateBadge';
import VisitorDetailModal from '../components/VisitorDetailModal';
import api from '../api/axios';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [activeVisitors, setActiveVisitors] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, analyticsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/analytics')
      ]);

      if (statsRes.data && statsRes.data.stats) {
        setStats(statsRes.data.stats);
        setActiveVisitors(statsRes.data.activeVisitors || []);
        setRecentLogs(statsRes.data.recentLogs || []);
      }

      if (analyticsRes.data) {
        setAnalytics(analyticsRes.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const openVisitorDetails = (visitor) => {
    setSelectedVisitor(visitor);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              CAMPUS SECURITY MONITOR
            </span>
            <span className="text-xs text-slate-400">• Real-Time Tracking</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Campus Visitor Movement Center</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Controlled Finite State Machine (FSM) tracking visitor entry, verification, approval, and exit lifecycle.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => navigate('/register-visitor')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Visitor</span>
          </button>
          <button
            onClick={() => navigate('/check-in-out')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-md transition-all"
          >
            <ScanLine className="w-4 h-4" />
            <span>Gate Scanner</span>
          </button>
          <button
            onClick={() => navigate('/fsm-engine')}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-md transition-all"
          >
            <GitBranch className="w-4 h-4" />
            <span>FSM Engine</span>
          </button>
          <button
            onClick={fetchDashboardData}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 6 Key Statistics Cards (From Section 8) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Today"
          value={stats?.totalVisitorsToday ?? '...'}
          subtitle={`Total All-Time: ${stats?.totalAllTime || 0}`}
          icon={Users}
          color="blue"
          onClick={() => navigate('/visitors')}
        />
        <StatCard
          title="Inside Campus"
          value={stats?.currentlyInsideCampus ?? '...'}
          subtitle="Active visitors on grounds"
          icon={MapPin}
          color="emerald"
          onClick={() => navigate('/check-in-out?tab=checkout')}
        />
        <StatCard
          title="Checked Out"
          value={stats?.visitorsCheckedOutToday ?? '...'}
          subtitle="Completed campus visits"
          icon={LogOut}
          color="slate"
          onClick={() => navigate('/visitors?state=CHECKED_OUT')}
        />
        <StatCard
          title="Pending Verify"
          value={stats?.pendingVerification ?? '...'}
          subtitle="Awaiting ID verification"
          icon={Clock}
          color="amber"
          onClick={() => navigate('/pending-verification')}
        />
        <StatCard
          title="Entry Approved"
          value={stats?.entryApproved ?? '...'}
          subtitle="Ready for gate check-in"
          icon={ShieldCheck}
          color="purple"
          onClick={() => navigate('/entry-approval')}
        />
        <StatCard
          title="Rejected / Blocked"
          value={stats?.rejectedVisitors ?? '...'}
          subtitle={`${stats?.invalidFsmAttempts || 0} illegal FSM attempts`}
          icon={XCircle}
          color="rose"
          onClick={() => navigate('/visitors?state=REJECTED')}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: 7-Day Trend (Entry vs Exit vs Registered) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">7-Day Entry vs Exit Trend</h3>
              <p className="text-xs text-slate-500">Daily campus footfall and departure volume</p>
            </div>
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              Trend
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={analytics?.dailyTrend || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRegistered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="registered" name="Registered" stroke="#2563eb" fillOpacity={1} fill="url(#colorRegistered)" />
                <Area type="monotone" dataKey="entries" name="Checked In" stroke="#10b981" fillOpacity={1} fill="url(#colorEntries)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Department-Wise Visitor Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Department-Wise Visitor Distribution</h3>
              <p className="text-xs text-slate-500">Breakdown of hosts and academic departments visited</p>
            </div>
            <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
              Departments
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics?.departmentStats || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="department"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="total" name="Total Visitors" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lower Row: Currently Inside Campus Table + Recent Security Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Inside Campus Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-900">Currently Inside Campus</h3>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                {activeVisitors.length} Active
              </span>
            </div>
            <button
              onClick={() => navigate('/check-in-out?tab=checkout')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Manage Check-Outs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            {activeVisitors.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No active visitors currently recorded inside campus grounds.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Visitor</th>
                    <th className="py-2.5 px-4">Host / Department</th>
                    <th className="py-2.5 px-4">Entry Time</th>
                    <th className="py-2.5 px-4">Vehicle / Pass</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeVisitors.map((v) => (
                    <tr key={v._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{v.fullName}</p>
                        <p className="font-mono text-[11px] text-blue-600">{v.visitorId}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-slate-800 font-medium">{v.personToMeet}</p>
                        <p className="text-[11px] text-slate-500">{v.department}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-700">
                          {v.actualEntryTime ? new Date(v.actualEntryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : v.expectedEntryTime}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {v.vehicleNumber || 'Pedestrian'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openVisitorDetails(v)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-xs transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Live Security Log Feed (1 Col) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Live Activity Feed</h3>
            </div>
            <button
              onClick={() => navigate('/activity-logs')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              All Logs
            </button>
          </div>

          <div className="p-4 space-y-3 overflow-y-auto max-h-96 text-xs divide-y divide-slate-100">
            {recentLogs.map((log) => (
              <div key={log._id || log.logId} className="pt-2.5 first:pt-0">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                  <span className="font-mono font-medium text-slate-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span
                    className={`font-bold px-1.5 py-0.2 rounded ${
                      log.status === 'WARNING'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
                <p className="font-semibold text-slate-800 leading-snug">{log.description}</p>
                {log.visitorId && (
                  <p className="text-[10px] font-mono text-blue-600 mt-0.5">ID: {log.visitorId}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visitor Detail Modal */}
      <VisitorDetailModal
        visitor={selectedVisitor}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onRefresh={fetchDashboardData}
      />
    </div>
  );
};

export default DashboardPage;

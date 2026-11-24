import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UserPlus,
  Users,
  Clock,
  ShieldCheck,
  ScanLine,
  GitBranch,
  History,
  Activity,
  FileBarChart,
  UserCog,
  LogOut,
  Shield,
  ChevronRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SECURITY'] },
    { name: 'Visitor Registration', path: '/register-visitor', icon: UserPlus, roles: ['ADMIN', 'SECURITY', 'VISITOR'] },
    { name: 'Visitor Management', path: '/visitors', icon: Users, roles: ['ADMIN', 'SECURITY'] },
    { name: 'Pending Verification', path: '/pending-verification', icon: Clock, roles: ['ADMIN', 'SECURITY'], badge: 'Queue' },
    { name: 'Entry Approval', path: '/entry-approval', icon: ShieldCheck, roles: ['ADMIN', 'SECURITY'] },
    { name: 'Check-In / Check-Out', path: '/check-in-out', icon: ScanLine, roles: ['ADMIN', 'SECURITY'], highlight: true },
    { name: 'FSM Transition Engine', path: '/fsm-engine', icon: GitBranch, roles: ['ADMIN', 'SECURITY'], featured: true },
    { name: 'Visitor History', path: '/visitor-history', icon: History, roles: ['ADMIN', 'SECURITY'] },
    { name: 'Activity Logs', path: '/activity-logs', icon: Activity, roles: ['ADMIN', 'SECURITY'] },
    { name: 'Reports', path: '/reports', icon: FileBarChart, roles: ['ADMIN', 'SECURITY'] },
    { name: 'User Management', path: '/user-management', icon: UserCog, roles: ['ADMIN'] }
  ];

  // Filter based on role
  const userRole = user?.role || 'VISITOR';
  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                SmartCampus
                <span className="text-[10px] font-semibold uppercase bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                  FSM
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Visitor State Tracking</p>
            </div>
          </div>
        </div>

        {/* FSM Engine Banner */}
        <div className="px-4 py-3">
          <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-lg p-2.5 flex items-center justify-between text-xs text-blue-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
              <div>
                <p className="font-semibold text-white">FSM Core Engine</p>
                <p className="text-[10px] text-blue-300/80">9 States • Finite Rules</p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            System Modules
          </div>

          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                } ${item.featured ? 'border border-blue-500/30 bg-blue-950/20' : ''}`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 opacity-80 group-hover:opacity-100" />
                <span>{item.name}</span>
              </div>

              {item.badge && (
                <span className="text-[10px] bg-slate-800 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded">
                  {item.badge}
                </span>
              )}
              {item.featured && (
                <span className="text-[9px] bg-blue-500 text-white font-bold px-1.5 py-0.5 rounded">
                  CORE
                </span>
              )}
            </NavLink>
          ))}

          {/* Visitor Public Portal Link */}
          <div className="pt-3">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Visitor Portal
            </div>
            <NavLink
              to="/portal"
              target="_blank"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            >
              <div className="flex items-center gap-2.5">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Visitor Self-Kiosk</span>
              </div>
              <ChevronRight className="w-3 h-3 opacity-60" />
            </NavLink>
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3 px-2 py-2 mb-2 rounded-lg bg-slate-800/50">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-white uppercase">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <p className="text-[10px] text-slate-400 truncate">{user?.role || 'Guest'}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>12. Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

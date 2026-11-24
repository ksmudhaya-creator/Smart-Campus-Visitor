import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Shield,
  UserCheck,
  Search,
  CheckCircle2,
  Bell,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onToggleSidebar }) => {
  const { user, quickLogin } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleQuickRoleSwitch = async (role) => {
    setSwitching(true);
    await quickLogin(role);
    setSwitching(false);
    navigate('/dashboard');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/visitors?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* System FSM Active Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-xs text-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold">FSM State Engine:</span>
          <span className="font-mono text-emerald-700">STRICT_ENFORCEMENT</span>
        </div>
      </div>

      {/* Global Quick Search */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative max-w-xs w-full mx-4">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Visitor ID, Mobile, Name..."
          className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
        />
      </form>

      {/* Right Controls: Role Switcher & User Profile */}
      <div className="flex items-center gap-3">
        {/* Role Switcher for Academic Evaluation */}
        <div className="hidden xl:flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase px-2">Role:</span>
          <button
            onClick={() => handleQuickRoleSwitch('ADMIN')}
            disabled={switching || user?.role === 'ADMIN'}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              user?.role === 'ADMIN'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => handleQuickRoleSwitch('SECURITY')}
            disabled={switching || user?.role === 'SECURITY'}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              user?.role === 'SECURITY'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            Security
          </button>
          <button
            onClick={() => handleQuickRoleSwitch('VISITOR')}
            disabled={switching || user?.role === 'VISITOR'}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              user?.role === 'VISITOR'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            Visitor
          </button>
        </div>

        {/* Live Date/Time */}
        <div className="hidden lg:block text-right pr-2">
          <p className="text-xs font-medium text-slate-800">
            {currentTime.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })}
          </p>
          <p className="text-[11px] font-mono text-slate-500">
            {currentTime.toLocaleTimeString('en-US', { hour12: true })}
          </p>
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[130px]">
              {user?.name || 'Administrator'}
            </p>
            <span className="text-[10px] text-blue-600 font-medium tracking-tight">
              {user?.role} • {user?.department || 'Campus'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

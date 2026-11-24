import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  Lock,
  Mail,
  UserCheck,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, quickLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      return setError('Please enter both email and password.');
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  const handleDemoLogin = async (roleName) => {
    setError('');
    setLoading(true);
    const result = await quickLogin(roleName);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Icon & Heading */}
        <div className="text-center">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 items-center justify-center text-white shadow-xl shadow-blue-500/20 mb-3">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Smart Campus Access</h2>
          <p className="text-xs text-blue-300 font-medium mt-1">
            Visitor Entry and Exit State Tracking System (FSM Core)
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-8 bg-slate-800/80 backdrop-blur-md border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Quick Demo Credentials Panel */}
          <div className="bg-slate-900/70 border border-slate-700/80 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
              <span className="flex items-center gap-1.5 text-blue-400">
                <Sparkles className="w-3.5 h-3.5" />
                1-Click Demo Accounts
              </span>
              <span className="text-[10px] text-slate-500">Evaluation Mode</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin('ADMIN')}
                className="py-1.5 px-2 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white rounded-lg text-[11px] font-semibold transition-all border border-slate-700 hover:border-blue-500 text-center"
              >
                Admin
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin('SECURITY')}
                className="py-1.5 px-2 bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white rounded-lg text-[11px] font-semibold transition-all border border-slate-700 hover:border-emerald-500 text-center"
              >
                Security Guard
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin('VISITOR')}
                className="py-1.5 px-2 bg-slate-800 hover:bg-purple-600 text-slate-200 hover:text-white rounded-lg text-[11px] font-semibold transition-all border border-slate-700 hover:border-purple-500 text-center"
              >
                Visitor
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@campus.edu"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-hidden"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-hidden"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Campus System'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Public Portal Shortcut */}
          <div className="pt-3 border-t border-slate-700/60 text-center">
            <Link
              to="/portal"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              <span>Are you a guest? Open Visitor Self-Service Kiosk</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-500 mt-6">
          Smart Campus Visitor Entry & Exit Tracking System • Academic Project
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

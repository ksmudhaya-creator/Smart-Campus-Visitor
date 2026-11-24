import React from 'react';
import {
  FileText,
  Clock,
  ShieldCheck,
  CheckCircle,
  LogIn,
  MapPin,
  LogOut,
  XCircle,
  Slash
} from 'lucide-react';

const STATE_CONFIG = {
  REGISTERED: {
    label: 'Registered',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    icon: FileText
  },
  PENDING_VERIFICATION: {
    label: 'Pending Verification',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    icon: Clock
  },
  VERIFIED: {
    label: 'Verified',
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
    icon: ShieldCheck
  },
  ENTRY_APPROVED: {
    label: 'Entry Approved',
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-500',
    icon: CheckCircle
  },
  CHECKED_IN: {
    label: 'Checked In',
    bg: 'bg-teal-50 text-teal-700 border-teal-200',
    dot: 'bg-teal-500',
    icon: LogIn
  },
  INSIDE_CAMPUS: {
    label: 'Inside Campus',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20',
    dot: 'bg-emerald-500 animate-pulse',
    icon: MapPin
  },
  CHECKED_OUT: {
    label: 'Checked Out',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
    icon: LogOut
  },
  REJECTED: {
    label: 'Rejected',
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
    icon: XCircle
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: 'bg-neutral-100 text-neutral-600 border-neutral-300',
    dot: 'bg-neutral-400',
    icon: Slash
  }
};

const StateBadge = ({ state, size = 'md', showIcon = true }) => {
  const config = STATE_CONFIG[state] || {
    label: state || 'Unknown',
    bg: 'bg-gray-100 text-gray-700 border-gray-200',
    dot: 'bg-gray-400',
    icon: FileText
  };

  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs tracking-wide transition-colors ${config.bg} ${sizeClasses[size] || sizeClasses.md}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {showIcon && <IconComponent className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />}
      <span>{config.label}</span>
    </span>
  );
};

export default StateBadge;

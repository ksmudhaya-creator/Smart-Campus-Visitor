import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend,
  trendPositive,
  onClick
}) => {
  const colorMap = {
    blue: 'bg-blue-500/10 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-100',
    indigo: 'bg-indigo-500/10 text-indigo-600 border-indigo-100',
    amber: 'bg-amber-500/10 text-amber-600 border-amber-100',
    purple: 'bg-purple-500/10 text-purple-600 border-purple-100',
    rose: 'bg-rose-500/10 text-rose-600 border-rose-100',
    slate: 'bg-slate-500/10 text-slate-600 border-slate-100'
  };

  const badgeClass = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:border-slate-300 relative overflow-hidden ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl border ${badgeClass}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 font-medium ${
                trendPositive ? 'text-emerald-600' : 'text-slate-500'
              }`}
            >
              {trendPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;

import React from 'react';
import { WorkerAvailabilityStatus } from '../types';

interface AvailabilityBadgeProps {
  status: WorkerAvailabilityStatus;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onStatusChange?: (newStatus: WorkerAvailabilityStatus) => void;
}

export const AvailabilityBadge: React.FC<AvailabilityBadgeProps> = ({
  status,
  size = 'md',
  interactive = false,
  onStatusChange,
}) => {
  const configs: Record<
    WorkerAvailabilityStatus,
    { label: string; bg: string; text: string; dot: string; pulse: boolean }
  > = {
    available_now: {
      label: 'Available Now',
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
      pulse: true,
    },
    on_job: {
      label: 'On a Job',
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-700',
      dot: 'bg-amber-500',
      pulse: false,
    },
    offline: {
      label: 'Offline',
      bg: 'bg-slate-100 border-slate-200',
      text: 'text-slate-600',
      dot: 'bg-slate-400',
      pulse: false,
    },
  };

  const current = configs[status] || configs.offline;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  };

  if (interactive && onStatusChange) {
    return (
      <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-xs">
        {(['available_now', 'on_job', 'offline'] as WorkerAvailabilityStatus[]).map((st) => {
          const cfg = configs[st];
          const isSelected = status === st;
          return (
            <button
              key={st}
              type="button"
              onClick={() => onStatusChange(st)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? `${cfg.bg} ${cfg.text} border shadow-xs`
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${cfg.dot} ${
                  isSelected && cfg.pulse ? 'animate-ping inline-block' : ''
                }`}
              />
              <span>{cfg.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold ${current.bg} ${current.text} ${sizeClasses[size]}`}
    >
      <span className="relative flex h-2 w-2">
        {current.pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${current.dot} opacity-75`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${current.dot}`} />
      </span>
      <span>{current.label}</span>
    </span>
  );
};

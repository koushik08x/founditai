import React from 'react';
import { Sparkles, ShieldAlert } from 'lucide-react';

export interface MatchScorePillProps {
  score: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MatchScorePill: React.FC<MatchScorePillProps> = ({
  score,
  showIcon = true,
  size = 'md',
  className = ''
}) => {
  let colorStyles = 'bg-slate-100 text-slate-700 border-slate-200';
  let tierLabel = 'Low / Plausible';

  if (score >= 75) {
    colorStyles = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    tierLabel = 'High Match';
  } else if (score >= 55) {
    colorStyles = 'bg-blue-50 text-blue-800 border-blue-300';
    tierLabel = 'Moderate Match';
  } else if (score >= 35) {
    colorStyles = 'bg-amber-50 text-amber-800 border-amber-300';
    tierLabel = 'Plausible Match';
  }

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-bold px-3 py-1.5 gap-2'
  };

  return (
    <div
      className={`inline-flex items-center rounded-full border shadow-2xs font-medium tracking-tight ${sizeStyles[size]} ${colorStyles} ${className}`}
      title={`${score}% score — ${tierLabel}. Possible match — verify before claiming.`}
    >
      {showIcon && (
        score >= 60 ? (
          <Sparkles className="w-3.5 h-3.5 shrink-0 opacity-80" />
        ) : (
          <ShieldAlert className="w-3.5 h-3.5 shrink-0 opacity-80" />
        )
      )}
      <span>{score}% Match</span>
      <span className="opacity-60 font-normal">({tierLabel})</span>
    </div>
  );
};

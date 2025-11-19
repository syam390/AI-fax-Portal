import React from 'react';
import { ReferralStatus } from '../types';

interface StatusBadgeProps {
  status: ReferralStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const styles = {
    [ReferralStatus.PENDING]: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20",
    [ReferralStatus.ACCEPTED]: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20",
    [ReferralStatus.REJECTED]: "bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20",
  };

  const labels = {
    [ReferralStatus.PENDING]: "Review Needed",
    [ReferralStatus.ACCEPTED]: "Accepted",
    [ReferralStatus.REJECTED]: "Rejected",
  };

  const dots = {
    [ReferralStatus.PENDING]: "bg-amber-500",
    [ReferralStatus.ACCEPTED]: "bg-emerald-500",
    [ReferralStatus.REJECTED]: "bg-rose-500",
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center rounded-md border ${sizeClasses} font-medium ring-1 ring-inset ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dots[status]}`}></span>
      {labels[status]}
    </span>
  );
};
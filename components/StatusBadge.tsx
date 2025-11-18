import React from 'react';
import { ReferralStatus } from '../types';

interface StatusBadgeProps {
  status: ReferralStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles = {
    [ReferralStatus.PENDING]: "bg-yellow-100 text-yellow-800 border-yellow-200",
    [ReferralStatus.ACCEPTED]: "bg-green-100 text-green-800 border-green-200",
    [ReferralStatus.REJECTED]: "bg-red-100 text-red-800 border-red-200",
  };

  const labels = {
    [ReferralStatus.PENDING]: "Pending Review",
    [ReferralStatus.ACCEPTED]: "Accepted",
    [ReferralStatus.REJECTED]: "Rejected",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

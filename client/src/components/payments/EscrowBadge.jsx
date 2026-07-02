import React from 'react';

const EscrowBadge = ({ status }) => {
  const styles = {
    pending: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
    escrow: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    released: 'bg-green-500/10 text-green-400 border border-green-500/20',
    refunded: 'bg-red-500/10 text-red-400 border border-red-500/20',
    disputed: 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
  };

  const labels = {
    pending: 'Pending',
    escrow: 'In Escrow',
    released: 'Released',
    refunded: 'Refunded',
    disputed: 'Disputed'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  );
};

export default EscrowBadge;

import React from 'react';
import Loader from '@/presentation/components/Loader/Loader';

const RedirectingModal: React.FC<{ show: boolean }> = ({ show }) => {
  if (!show) return null;

  return <Loader label="Redirecting…" />;
};

export default RedirectingModal;

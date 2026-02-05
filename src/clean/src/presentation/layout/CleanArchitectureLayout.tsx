import React from 'react';
import { DependencyProvider } from '../infrastructure/di/DependencyContext';

interface CleanArchitectureLayoutProps {
  children: React.ReactNode;
}

export const CleanArchitectureLayout: React.FC<CleanArchitectureLayoutProps> = ({ children }) => {
  return (
    <DependencyProvider>
      {children}
    </DependencyProvider>
  );
};
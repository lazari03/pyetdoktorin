import React from 'react';

const CenteredLoader: React.FC = () => (
  <div className="flex items-center justify-center w-full h-full min-h-[100px]">
    <div
      className="h-10 w-10 rounded-full border-2 border-purple-200/70 border-t-purple-600 border-r-purple-400 animate-spin"
      aria-label="Loading"
      role="status"
    />
  </div>
);

export default CenteredLoader;

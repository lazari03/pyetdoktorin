import React from 'react';

const CenteredLoader: React.FC = () => (
  <div className="flex items-center justify-center w-full h-full min-h-[100px]">
    <span className="loading loading-spinner loading-lg text-purple-500" />
  </div>
);

export default CenteredLoader;

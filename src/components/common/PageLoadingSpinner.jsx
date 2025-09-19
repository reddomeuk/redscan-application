import React from 'react';
import { Loader2 } from 'lucide-react';

const PageLoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Loading...</p>
      </div>
    </div>
  );
};

export default PageLoadingSpinner;
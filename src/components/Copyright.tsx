
import React from 'react';
import { Copyright as CopyrightIcon } from 'lucide-react';

export const Copyright = () => {
  return (
    <div className="fixed bottom-4 right-4 text-xs text-gray-500 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
      <div className="flex items-center gap-1">
        <CopyrightIcon className="w-3 h-3" />
        <span>SAFIDY RAHARIJESY - UI/UX DESIGNER</span>
      </div>
    </div>
  );
};

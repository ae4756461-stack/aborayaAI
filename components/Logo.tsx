import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`relative w-8 h-8 flex items-center justify-center ${className} select-none`}>
    {/* Abstract Background Shape */}
    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-lg transform rotate-6 opacity-75"></div>
    
    {/* Main Logo Box */}
    <div className="absolute inset-0 bg-gradient-to-bl from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg z-10 border border-white/10">
      {/* Letter 'A' with custom styling */}
      <span className="font-bold font-cairo text-lg leading-none mt-[-2px]">A</span>
    </div>
  </div>
);

export default Logo;
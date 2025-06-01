
import React from 'react';

export const LoadingIndicator: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out">
      <div className="flex flex-col items-center bg-white p-8 rounded-lg shadow-xl">
        <svg className="animate-spin h-12 w-12 text-sky-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-slate-700 font-medium text-lg">処理中です...</p>
        <p className="text-slate-500 text-sm">しばらくお待ちください</p>
      </div>
    </div>
  );
};

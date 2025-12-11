import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-slate-500">
        <div className="flex gap-4">
          <Link to="/privacy" className="hover:text-slate-900 hover:underline">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-slate-900 hover:underline">Terms of Service</Link>
        </div>
        
        <div className="text-center md:text-right flex items-center gap-2">
          <p>&copy; {new Date().getFullYear()} GEENMY Project.</p>
          <span className="hidden md:inline text-slate-300">|</span>
          <p className="font-medium text-slate-400">Powered by Gemini</p>
        </div>
      </div>
    </footer>
  );
};
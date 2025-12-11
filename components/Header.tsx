import React from 'react';
import { Menu, Database, Book, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/Button';
import { AuthButton } from './AuthButton';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-slate-100 p-1.5 rounded-lg group-hover:bg-slate-200 transition-colors text-slate-700">
            <Book className="w-5 h-5" />
          </div>
          <span className="font-bold text-2xl tracking-tight flex items-center">
            <span className="text-blue-600">ge</span>
            <span className="text-red-600">en</span>
            <span className="text-green-600">my</span>
          </span>
        </Link>
        
        <nav className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 mr-2">
             <Link to="/about">
                <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                  <Info className="w-4 h-4 mr-2" />
                  About
                </Button>
             </Link>
             <Link to="/generate">
                <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                  <Database className="w-4 h-4 mr-2" />
                  Database
                </Button>
             </Link>
          </div>
          
          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>
          
          <AuthButton />
          
          <Link to="/generate" className="sm:hidden">
            <Button variant="ghost" size="icon">
              <Database className="w-5 h-5" />
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
};
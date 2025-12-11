import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';
import { DropdownMenu, DropdownMenuItem } from './ui/DropdownMenu';
import { LogOut, User, Loader2 } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';

export const AuthButton: React.FC = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Failed to initialize login. Please check Supabase configuration.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <Button variant="ghost" disabled size="sm">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (!user) {
    return (
      <Button onClick={handleLogin} size="sm" className="bg-slate-900 text-white hover:bg-slate-800">
        Log In
      </Button>
    );
  }

  // Get user avatar or initials
  const avatarUrl = user.user_metadata?.avatar_url;
  const email = user.email || '';
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <DropdownMenu 
      trigger={
        <Avatar 
          src={avatarUrl} 
          fallback={initials} 
          className="hover:ring-2 hover:ring-slate-200 transition-all cursor-pointer" 
        />
      }
    >
      <div className="px-4 py-2 border-b border-slate-100">
        <p className="text-sm font-medium text-slate-900">My Account</p>
        <p className="text-xs text-slate-500 truncate max-w-[180px]">{email}</p>
      </div>
      <DropdownMenuItem disabled>
        <User className="mr-2 h-4 w-4" />
        Profile
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
        <LogOut className="mr-2 h-4 w-4" />
        Log out
      </DropdownMenuItem>
    </DropdownMenu>
  );
};
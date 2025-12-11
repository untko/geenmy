import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { WordCard } from '../components/WordCard';
import { dictionaryStore } from '../lib/dictionaryStore';
import { DictionaryEntry } from '../types';
import { Database, Shuffle, CheckCircle, Trophy, PartyPopper } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';

export const Home: React.FC = () => {
  const [featuredWord, setFeaturedWord] = useState<DictionaryEntry | null>(null);
  const [totalWords, setTotalWords] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [allVoted, setAllVoted] = useState(false);
  const navigate = useNavigate();

  // Helper to get the correct word based on auth state
  const fetchFeaturedWord = useCallback((currentUser: User | null) => {
    if (currentUser) {
      // If logged in, prioritize unvoted/low-voted words for contribution
      const entry = dictionaryStore.getLeastVotedWord(currentUser.id);
      if (entry) {
        setFeaturedWord(entry);
        setAllVoted(false);
      } else {
        setFeaturedWord(null);
        setAllVoted(true);
      }
    } else {
      // If logged out, just random
      setFeaturedWord(dictionaryStore.getRandom());
      setAllVoted(false);
    }
  }, []);

  // Initial Auth Check & Listener
  useEffect(() => {
    // Initial fetch of word count
    setTotalWords(dictionaryStore.getAll().length);

    // Initial Auth Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currUser = session?.user ?? null;
      setUser(currUser);
      fetchFeaturedWord(currUser);
    });

    // Auth State Listener
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currUser = session?.user ?? null;
      // Only update if user ID changed to avoid unnecessary re-fetches on token refreshes
      setUser(prev => {
        if (prev?.id !== currUser?.id) {
            fetchFeaturedWord(currUser);
            return currUser;
        }
        return prev;
      });
    });

    return () => {
      authSub.unsubscribe();
    };
  }, [fetchFeaturedWord]);

  // Dictionary Store Listener
  useEffect(() => {
    const unsubscribeStore = dictionaryStore.subscribe(() => {
      setTotalWords(dictionaryStore.getAll().length);
      
      // If we are currently in "All Voted" state, and the store updates (e.g. new word added),
      // we should try to fetch a word again for the logged-in user.
      if (allVoted && user) {
         fetchFeaturedWord(user);
      }
    });

    return unsubscribeStore;
  }, [allVoted, user, fetchFeaturedWord]);

  const handleQuickSearch = (word: string) => {
    navigate(`/search?q=${encodeURIComponent(word)}`);
  };

  // Called when the user votes on the current card
  const handleVoteAction = () => {
    if (user) {
      // Smooth transition to next word
      setTimeout(() => {
        fetchFeaturedWord(user);
      }, 400); 
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Hero Section */}
      <section className="w-full py-8 md:py-12 px-4 flex flex-col items-center justify-center bg-gradient-to-b from-white to-slate-50">
        <h1 className="text-5xl md:text-7xl font-bold mb-4 text-center tracking-tight flex items-center justify-center gap-0.5">
          <span className="text-blue-600">ge</span>
          <span className="text-red-600">en</span>
          <span className="text-green-600">my</span>
        </h1>
        <p className="text-slate-500 text-base md:text-lg mb-6 max-w-lg text-center leading-relaxed">
          Gemini Empowered English-Myanmar Dictionary.
          <br />
          <span className="inline-flex items-center gap-1.5 mt-3 bg-slate-100 px-3 py-1 rounded-full text-xs font-medium text-slate-600">
             <Database className="w-3.5 h-3.5" />
             Currently tracking {totalWords.toLocaleString()} words
          </span>
        </p>
        
        <SearchBar variant="large" />
        
        <div className="mt-4 flex gap-4 text-sm text-slate-400">
          <span>Try:</span>
          <button onClick={() => handleQuickSearch('Serendipity')} className="hover:text-slate-900 underline decoration-slate-300 underline-offset-4 transition-colors">Serendipity</button>
          <button onClick={() => handleQuickSearch('Algorithm')} className="hover:text-slate-900 underline decoration-slate-300 underline-offset-4 transition-colors">Algorithm</button>
          <button onClick={() => handleQuickSearch('Resilience')} className="hover:text-slate-900 underline decoration-slate-300 underline-offset-4 transition-colors">Resilience</button>
        </div>
      </section>

      {/* Dynamic Word Section */}
      <section className="w-full max-w-3xl px-4 py-4 md:py-6">
        <div className="flex items-center gap-2 mb-3">
          {user ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider">Help Improve Dictionary</h2>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full ml-auto">
                  Review mode
                </span>
              </>
          ) : (
              <>
                <Shuffle className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider">Random Word</h2>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full ml-auto">
                  Log in to contribute
                </span>
              </>
          )}
        </div>
        
        {featuredWord ? (
          <div key={featuredWord.id || featuredWord.headword} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <WordCard entry={featuredWord} onVote={handleVoteAction} />
              
              <div className="flex justify-center mt-4">
                <button 
                    onClick={() => fetchFeaturedWord(user)} 
                    className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
                >
                    <Shuffle className="w-3 h-3" />
                    Skip this word
                </button>
              </div>
          </div>
        ) : allVoted && user ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="flex justify-center mb-6">
               <div className="bg-yellow-50 p-4 rounded-full relative">
                 <Trophy className="w-12 h-12 text-yellow-500" />
                 <PartyPopper className="w-6 h-6 text-purple-500 absolute -top-1 -right-1" />
               </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">You're all caught up!</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              Incredible! You've reviewed every single word currently in our database. Your contributions help make this dictionary better for everyone.
            </p>
            <button 
               onClick={() => navigate('/generate')} 
               className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-full transition-colors"
            >
               Generate new words to review &rarr;
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
};
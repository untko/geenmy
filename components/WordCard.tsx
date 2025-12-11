import React, { useState, useEffect } from 'react';
import { DictionaryEntry } from '../types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Dialog } from './ui/Dialog';
import { Volume2, Share2, ThumbsUp, ThumbsDown, PenLine, LogIn, CheckCircle2, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { dictionaryStore } from '../lib/dictionaryStore';
import { EntryEditor } from './EntryEditor';

interface WordCardProps {
  entry: DictionaryEntry;
  onVote?: () => void;
}

export const WordCard: React.FC<WordCardProps> = ({ entry, onVote }) => {
  const [userVote, setUserVote] = useState<'up' | 'down' | undefined>(undefined);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  // Re-fetch stats on render or store update
  const stats = entry.community_stats || { upvotes: 0, downvotes: 0 };
  const isMyanmarHeadword = entry.source_lang === 'my';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    
    if (entry.id) {
        setUserVote(dictionaryStore.getUserVote(entry.id));
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [entry.id]);

  const handleVote = async (type: 'up' | 'down') => {
    if (!user) {
        setIsLoginPromptOpen(true);
        return;
    }
    
    if (entry.id) {
        await dictionaryStore.voteForWord(entry.id, user.id, type);
        setUserVote(dictionaryStore.getUserVote(entry.id));
        if (onVote) {
          onVote();
        }
    }
  };

  const handleSuggestEdit = () => {
    if (user) {
      setIsEditModalOpen(true);
    } else {
      setIsLoginPromptOpen(true);
    }
  };

  const submitSuggestion = async (updatedEntry: DictionaryEntry) => {
    if (user) {
        await dictionaryStore.submitSuggestion(entry.id, user.id, updatedEntry);
        setIsEditModalOpen(false);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
    }
  };

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
    }
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(entry.headword);
      // Prioritize English, fallback to browser default if lang not found
      utterance.lang = entry.source_lang === 'my' ? 'my-MM' : 'en-US';
      utterance.rate = 0.9; // Slightly slower for clarity
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleShare = async () => {
    // Construct link to search page with query
    // Assuming HashRouter is used based on App.tsx: /#/search?q=word
    // Or if BrowserRouter: /search?q=word
    // Using window.location.origin and hash based on typical SPA setup in this project
    const baseUrl = window.location.href.split('#')[0];
    const hashPath = `#/search?q=${encodeURIComponent(entry.headword)}`;
    const url = `${baseUrl}${hashPath}`;

    try {
      await navigator.clipboard.writeText(url);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    } catch (err) {
      console.error('Failed to copy url', err);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 relative">
        {showSuccessToast && (
            <div className="absolute top-0 left-0 right-0 z-10 bg-green-50 text-green-700 text-xs font-medium py-2 px-4 flex items-center justify-center animate-in slide-in-from-top-full">
                <CheckCircle2 className="w-3 h-3 mr-2" />
                Suggestion submitted for review!
            </div>
        )}
        
        {showShareToast && (
            <div className="absolute top-0 left-0 right-0 z-10 bg-slate-800 text-white text-xs font-medium py-2 px-4 flex items-center justify-center animate-in slide-in-from-top-full">
                <LinkIcon className="w-3 h-3 mr-2" />
                Link copied to clipboard
            </div>
        )}

        {/* Header Section */}
        <div className="p-5 border-b border-slate-50">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-baseline flex-wrap gap-3">
                <h2 className={`text-2xl font-bold text-slate-900 ${isMyanmarHeadword ? 'font-myanmar leading-tight' : 'font-sans'}`}>
                  {entry.headword}
                </h2>
                {(entry.phonetic_ipa || entry.romanization) && (
                  <span className="text-slate-500 font-mono text-sm">
                    {entry.phonetic_ipa || `[${entry.romanization}]`}
                  </span>
                )}
              </div>
              
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                  {entry.source_lang === 'en' ? 'English' : 'Myanmar'} &rarr; {entry.target_lang === 'en' ? 'English' : 'Myanmar'}
                </span>
              </div>
            </div>
            
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-full"
                onClick={handleSpeak}
                title="Pronounce word"
              >
                <Volume2 className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-full"
                onClick={handleShare}
                title="Copy link"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Senses Section */}
        <div className="divide-y divide-slate-100">
          {entry.senses.map((sense, index) => (
            <div key={sense.sense_id} className="p-5">
              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="secondary" className="italic font-serif text-xs">
                  {sense.pos}
                </Badge>
                {sense.tags?.map(tag => (
                  <Badge key={tag} variant="outline" className="text-slate-500 border-slate-200 text-[10px] px-1.5">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Definitions */}
              <div className="mb-3">
                <p className="text-base font-semibold text-slate-800 mb-0.5">
                  {sense.gloss}
                </p>
                <p className={`text-slate-600 ${entry.target_lang === 'my' ? 'font-myanmar text-base' : 'text-sm'}`}>
                  {sense.definition}
                </p>
                {sense.usage_note && (
                  <p className="mt-1 text-xs text-slate-500 italic">
                    Note: {sense.usage_note}
                  </p>
                )}
              </div>

              {/* Examples */}
              {sense.examples.length > 0 && (
                <div className="space-y-2 mt-3">
                  {sense.examples.map((example, exIndex) => (
                    <div 
                      key={exIndex} 
                      className="bg-slate-50 rounded-lg p-2.5 border-l-4 border-slate-300"
                    >
                      <p className={`text-slate-700 text-sm font-medium ${entry.source_lang === 'my' ? 'font-myanmar' : ''}`}>
                        {example.src}
                      </p>
                      {example.src_roman && (
                         <p className="text-slate-400 text-[10px] font-mono mb-0.5">{example.src_roman}</p>
                      )}
                      
                      <p className={`text-slate-600 mt-0.5 text-sm ${entry.target_lang === 'my' ? 'font-myanmar leading-relaxed' : ''}`}>
                        {example.tgt}
                      </p>
                      {example.tgt_roman && (
                         <p className="text-slate-400 text-[10px] font-mono mt-0.5">{example.tgt_roman}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Interaction Footer */}
        <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-500 hover:text-slate-900 h-8 text-xs"
            onClick={handleSuggestEdit}
          >
            <PenLine className="w-3.5 h-3.5 mr-1.5" />
            Suggest Edit
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
                <Button 
                variant="ghost" 
                size="sm" 
                className={`h-8 px-2 hover:bg-green-50 ${userVote === 'up' ? 'text-green-600 bg-green-50' : 'text-slate-400 hover:text-green-600'}`}
                onClick={() => handleVote('up')}
                >
                <ThumbsUp className={`w-3.5 h-3.5 ${userVote === 'up' ? 'fill-current' : ''}`} />
                <span className="ml-1.5 text-xs font-medium">{stats.upvotes}</span>
                </Button>
            </div>
            
            <div className="flex items-center gap-1">
                <Button 
                variant="ghost" 
                size="sm" 
                className={`h-8 px-2 hover:bg-red-50 ${userVote === 'down' ? 'text-red-600 bg-red-50' : 'text-slate-400 hover:text-red-600'}`}
                onClick={() => handleVote('down')}
                >
                <ThumbsDown className={`w-3.5 h-3.5 ${userVote === 'down' ? 'fill-current' : ''}`} />
                {stats.downvotes > 0 && <span className="ml-1.5 text-xs font-medium">{stats.downvotes}</span>}
                </Button>
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
          <EntryEditor 
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            initialEntry={entry}
            onSave={submitSuggestion}
            title={`Suggest Edit for "${entry.headword}"`}
            saveLabel="Submit Suggestion"
          />
      )}

      <Dialog 
        isOpen={isLoginPromptOpen} 
        onClose={() => setIsLoginPromptOpen(false)} 
        title="Login Required"
        description="Please log in to vote or contribute to the dictionary."
      >
        <div className="space-y-4 flex flex-col items-center py-4">
            <div className="bg-slate-100 p-4 rounded-full mb-2">
                <LogIn className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-center text-slate-600 text-sm max-w-xs">
                To ensure quality and prevent spam, we require contributors to sign in. It only takes a second!
            </p>
            <div className="flex gap-2 w-full justify-center mt-4">
                <Button variant="outline" onClick={() => setIsLoginPromptOpen(false)}>Cancel</Button>
                <Button onClick={handleLogin} className="bg-slate-900 text-white">Log In with Google</Button>
            </div>
        </div>
      </Dialog>
    </>
  );
};
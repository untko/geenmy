import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dictionaryStore } from '../lib/dictionaryStore';

interface SearchBarProps {
  initialValue?: string;
  variant?: 'large' | 'compact';
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  initialValue = '', 
  variant = 'large' 
}) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [dbHeadwords, setDbHeadwords] = useState<string[]>([]);
  
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Load headwords from store and subscribe to changes
  useEffect(() => {
    const updateHeadwords = () => {
        const entries = dictionaryStore.getAll();
        const unique = Array.from(new Set(entries.map(e => e.headword)));
        setDbHeadwords(unique);
    };

    updateHeadwords();
    const unsubscribe = dictionaryStore.subscribe(updateHeadwords);
    return unsubscribe;
  }, []);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setActiveSuggestion(-1);

    if (value.trim().length > 0) {
        // Filter headwords that start with the query (case-insensitive)
        const filtered = dbHeadwords
            .filter(w => w.toLowerCase().startsWith(value.toLowerCase()))
            .sort()
            .slice(0, 8); // Limit to 8 suggestions
            
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
    } else {
        setSuggestions([]);
        setShowSuggestions(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSuggestionClick = (word: string) => {
    setQuery(word);
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(word)}`);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestion(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestion(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
        if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
            e.preventDefault();
            handleSuggestionClick(suggestions[activeSuggestion]);
        }
    } else if (e.key === 'Escape') {
        setShowSuggestions(false);
    }
  };

  const isLarge = variant === 'large';

  // We use rounded-[28px] (approx 1.75rem) to ensure full pill shape for h-14 (56px) 
  // without relying on rounded-full which causes artifacts when transitioning to rounded-b-none.
  const radiusClass = "rounded-[28px]";

  return (
    <div ref={wrapperRef} className={`w-full relative ${isLarge ? 'max-w-2xl' : 'max-w-xl'}`}>
        <form onSubmit={handleSearch} className="relative z-20">
            <Search 
                className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors pointer-events-none ${isLarge ? 'w-6 h-6' : 'w-5 h-5'}`} 
            />
            <input
                type="text"
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => { if (query.trim() && suggestions.length > 0) setShowSuggestions(true); }}
                placeholder="Search English word..."
                className={`w-full bg-white border border-slate-200 outline-none transition-all shadow-sm placeholder:text-slate-400
                    ${isLarge ? 'h-14 pl-14 pr-12 text-lg' : 'h-11 pl-12 pr-10 text-base'}
                    ${showSuggestions 
                        ? `rounded-t-[28px] rounded-b-none border-b-transparent focus:border-slate-300` 
                        : `${radiusClass} focus:border-slate-400 focus:shadow-md`
                    }
                `}
                autoFocus={isLarge}
                autoComplete="off"
            />
            {query && (
                <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                >
                    <X className={isLarge ? 'w-5 h-5' : 'w-4 h-4'} />
                </button>
            )}
        </form>

        {showSuggestions && (
            <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 border-t-0 rounded-b-[28px] shadow-lg z-10 overflow-hidden -mt-px pt-1">
                <ul className="py-2">
                    {suggestions.map((suggestion, index) => (
                        <li 
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className={`px-4 py-2 cursor-pointer flex items-center gap-3 transition-colors ${
                                index === activeSuggestion 
                                    ? 'bg-slate-100' 
                                    : 'hover:bg-slate-50'
                            } ${isLarge ? 'pl-14 text-base' : 'pl-12 text-sm'}`}
                        >
                            <Search className="w-4 h-4 text-slate-300" />
                            <span className={index === activeSuggestion ? 'text-slate-900 font-medium' : 'text-slate-700'}>
                                {suggestion}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        )}
    </div>
  );
};
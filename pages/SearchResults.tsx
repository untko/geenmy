import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { WordCard } from '../components/WordCard';
import { dictionaryStore } from '../lib/dictionaryStore';
import { DictionaryEntry } from '../types';
import { Frown, Sparkles, Loader2, Check, Edit2, Trash2, Database } from 'lucide-react';
import { defineWord, searchHuggingFace } from '../lib/aiService';
import { Button } from '../components/ui/Button';
import { EntryEditor } from '../components/EntryEditor';

export const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<DictionaryEntry[]>([]);

  // Search State
  const [isSearching, setIsSearching] = useState(false);
  const [searchSource, setSearchSource] = useState<'gemini' | 'huggingface' | null>(null);
  const [searchResult, setSearchResult] = useState<DictionaryEntry | null>(null);
  const [searchError, setSearchError] = useState(false);

  // Editing State
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    if (!query) return;

    setSearchResult(null);
    setSearchSource(null);
    setSearchError(false);
    setIsSearching(false);

    const matches = dictionaryStore.search(query);
    setResults(matches);

    if (matches.length === 0) {
      handleExternalSearch(query);
    }
  }, [query]);

  const handleExternalSearch = async (word: string) => {
    setIsSearching(true);
    setSearchError(false);

    try {
      // 1. Try HuggingFace first
      setSearchSource('huggingface');
      const hfResult = await searchHuggingFace(word);

      if (hfResult) {
        setSearchResult(hfResult);
        return;
      }

      // 2. Fallback to Gemini
      setSearchSource('gemini');
      const geminiResult = await defineWord(word);
      if (geminiResult) {
        setSearchResult(geminiResult);
      } else {
        setSearchError(true);
      }
    } catch (e) {
      setSearchError(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveSearchResult = async () => {
    if (searchResult) {
      await dictionaryStore.addEntries([searchResult]);
      const matches = dictionaryStore.search(query);
      setResults(matches);
      setSearchResult(null);
      setSearchSource(null);
    }
  };

  const handleEditSearchResult = () => {
    setIsEditorOpen(true);
  };

  const handleSaveEditedEntry = async (updatedEntry: DictionaryEntry) => {
    setSearchResult(updatedEntry);
    setIsEditorOpen(false);

    await dictionaryStore.addEntries([updatedEntry]);
    const matches = dictionaryStore.search(query);
    setResults(matches);
    setSearchResult(null);
    setSearchSource(null);
  };

  const handleDiscard = () => {
    setSearchResult(null);
    setSearchSource(null);
    setSearchError(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <SearchBar initialValue={query} variant="compact" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {results.length > 0 && (
          <div>
            <p className="text-slate-500 mb-4 text-sm">
              Found {results.length} result{results.length !== 1 ? 's' : ''} for{' '}
              <span className="font-semibold text-slate-900">"{query}"</span>
            </p>
            <div className="space-y-4">
              {results.map((entry, idx) => (
                <WordCard key={`${entry.headword}-${idx}`} entry={entry} />
              ))}
            </div>
          </div>
        )}

        {results.length === 0 && isSearching && (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-pulse">
            {searchSource === 'huggingface' ? (
              <Database className="w-10 h-10 text-blue-400 mb-3 animate-bounce" />
            ) : (
              <Sparkles className="w-10 h-10 text-purple-400 mb-3 animate-bounce" />
            )}
            <h3 className="text-base font-semibold text-slate-900">
              {searchSource === 'huggingface' ? 'Searching HuggingFace...' : 'Consulting Gemini...'}
            </h3>
            <p className="text-slate-500 mt-1 text-sm">
              {searchSource === 'huggingface'
                ? `Looking up "${query}" in external datasets`
                : `Generating a new definition for "${query}"`}
            </p>
          </div>
        )}

        {results.length === 0 && !isSearching && searchResult && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div
              className={`border rounded-lg p-3 flex items-center justify-between ${searchSource === 'huggingface' ? 'bg-blue-50 border-blue-100' : 'bg-purple-50 border-purple-100'}`}
            >
              <div className="flex items-center gap-3">
                <div className="bg-white p-1.5 rounded-full shadow-sm">
                  {searchSource === 'huggingface' ? (
                    <Database className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-purple-600" />
                  )}
                </div>
                <div>
                  <h3
                    className={`font-semibold text-sm ${searchSource === 'huggingface' ? 'text-blue-900' : 'text-purple-900'}`}
                  >
                    {searchSource === 'huggingface'
                      ? 'External Dataset Result'
                      : 'AI Generated Result'}
                  </h3>
                  <p
                    className={`text-xs ${searchSource === 'huggingface' ? 'text-blue-700' : 'text-purple-700'}`}
                  >
                    {searchSource === 'huggingface'
                      ? 'This definition was found on HuggingFace. Review it before saving.'
                      : 'This definition was generated by Gemini. Review it before saving.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div
                className={`absolute -inset-0.5 rounded-xl opacity-20 blur bg-gradient-to-r ${searchSource === 'huggingface' ? 'from-blue-600 to-cyan-600' : 'from-purple-600 to-blue-600'}`}
              ></div>
              <div className="relative">
                <WordCard entry={searchResult} />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
              <Button
                onClick={handleSaveSearchResult}
                className="bg-slate-900 hover:bg-slate-800 text-white gap-2 shadow-lg shadow-slate-200"
              >
                <Check className="w-4 h-4" />
                Accept & Save
              </Button>
              <Button variant="outline" onClick={handleEditSearchResult} className="gap-2">
                <Edit2 className="w-4 h-4" />
                Edit Definition
              </Button>
              <Button
                variant="ghost"
                onClick={handleDiscard}
                className="text-slate-400 hover:text-red-600 gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Discard
              </Button>
            </div>
          </div>
        )}

        {results.length === 0 && !isSearching && !searchResult && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-slate-100 p-3 rounded-full mb-3">
              <Frown className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">No definitions found</h3>
            <p className="text-slate-500 max-w-sm mt-1 text-sm">
              We couldn't find a match for "{query}" in our local database or generate one with AI.
              Try checking your spelling.
            </p>
          </div>
        )}

        {searchResult && (
          <EntryEditor
            isOpen={isEditorOpen}
            onClose={() => setIsEditorOpen(false)}
            initialEntry={searchResult}
            onSave={handleSaveEditedEntry}
            title={`Editing Draft: "${searchResult.headword}"`}
            saveLabel="Save to Dictionary"
          />
        )}
      </div>
    </div>
  );
};

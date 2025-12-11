import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { dictionaryStore } from '../lib/dictionaryStore';
import { generateWords } from '../lib/aiService';
import { DictionaryEntry } from '../types';
import { 
  Loader2, Save, Database, Sparkles, RefreshCcw, 
  Trash2, Edit2, Search, ChevronLeft, ChevronRight, AlertTriangle, 
  Download, Upload, ArrowUpDown, ArrowUp, ArrowDown, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { Dialog } from '../components/ui/Dialog';
import { EntryEditor } from '../components/EntryEditor';

const ITEMS_PER_PAGE = 10;

type SortKey = 'headword' | 'upvotes' | 'downvotes';
type SortDirection = 'asc' | 'desc';

export const WordGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEntries, setGeneratedEntries] = useState<DictionaryEntry[]>([]);
  const [dbEntries, setDbEntries] = useState<DictionaryEntry[]>([]);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  
  // Sort State
  const [sortKey, setSortKey] = useState<SortKey>('headword');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Edit State
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [originalHeadword, setOriginalHeadword] = useState<string>('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Delete State
  const [entryToDelete, setEntryToDelete] = useState<DictionaryEntry | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // File Import Ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Load data
  useEffect(() => {
    setDbEntries(dictionaryStore.getAll());
    const unsubscribe = dictionaryStore.subscribe(() => {
      setDbEntries(dictionaryStore.getAll());
    });
    return unsubscribe;
  }, []);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Filter & Sort Logic
  const filteredAndSortedEntries = React.useMemo(() => {
    // 1. Filter
    const lowerFilter = filter.toLowerCase();
    let result = dbEntries.filter(e => 
      e.headword.toLowerCase().includes(lowerFilter) || 
      e.senses.some(s => 
        s.gloss.toLowerCase().includes(lowerFilter) ||
        s.tags?.some(tag => tag.toLowerCase().includes(lowerFilter))
      )
    );

    // 2. Sort
    result.sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortKey === 'headword') {
        valA = a.headword.toLowerCase();
        valB = b.headword.toLowerCase();
      } else if (sortKey === 'upvotes') {
        valA = a.community_stats?.upvotes || 0;
        valB = b.community_stats?.upvotes || 0;
      } else if (sortKey === 'downvotes') {
        valA = a.community_stats?.downvotes || 0;
        valB = b.community_stats?.downvotes || 0;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [dbEntries, filter, sortKey, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedEntries.length / ITEMS_PER_PAGE);
  const paginatedEntries = filteredAndSortedEntries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filter/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, sortKey, sortDirection]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }
    setError('');
    setIsGenerating(true);
    setGeneratedEntries([]);

    try {
      const results = await generateWords(topic, count);
      setGeneratedEntries(results);
    } catch (err) {
      setError('Failed to generate words. Please check API configuration.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToDb = async () => {
    await dictionaryStore.addEntries(generatedEntries);
    setGeneratedEntries([]);
  };

  const handleRefresh = () => {
    setDbEntries(dictionaryStore.getAll());
    setCurrentPage(1);
  };

  const handleExport = () => {
    const dataToExport = dictionaryStore.getAll();
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `geenmy_dictionary_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const json = JSON.parse(text);
        
        if (Array.isArray(json)) {
           if (json.length > 0 && !json[0].headword) {
             throw new Error("Invalid format");
           }
           const result = await dictionaryStore.addEntries(json);
           alert(`Import successful! Added ${result.added} new words and updated ${result.updated} existing words.`);
        } else {
           alert("Invalid file format. Expected a JSON array.");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to parse JSON file. Please ensure it is a valid GEENMY export.");
      } finally {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  const handleEdit = (entry: DictionaryEntry) => {
    setSelectedEntry(JSON.parse(JSON.stringify(entry)));
    setOriginalHeadword(entry.headword);
    setIsEditorOpen(true);
  };

  const handleSaveEdit = (updatedEntry: DictionaryEntry) => {
    if (originalHeadword) {
      try {
        dictionaryStore.updateEntry(originalHeadword, updatedEntry);
        setIsEditorOpen(false);
      } catch (e: any) {
        alert(e.message || "Failed to update entry");
      }
    }
  };

  const confirmDelete = (entry: DictionaryEntry) => {
    setEntryToDelete(entry);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (entryToDelete) {
      dictionaryStore.deleteEntry(entryToDelete.headword);
      setIsDeleteDialogOpen(false);
      setEntryToDelete(null);
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="w-3 h-3 text-slate-300 ml-1" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3 h-3 text-purple-600 ml-1" />
      : <ArrowDown className="w-3 h-3 text-purple-600 ml-1" />;
  };

  const inputClass = "w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-slate-500 focus:ring-1 focus:ring-slate-200 focus:outline-none bg-white text-slate-900";

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex flex-col lg:flex-row gap-4 h-full min-h-0">
        
        {/* Left Panel: Generator */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4 overflow-y-auto pr-1">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm shrink-0">
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              AI Generator
            </h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Topic</label>
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Cooking, Legal"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Count</label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 20].map((num) => (
                    <button
                      key={num}
                      onClick={() => setCount(num)}
                      className={`py-1.5 px-1 text-xs rounded-md border transition-all ${
                        count === num 
                          ? 'bg-slate-900 text-white border-slate-900' 
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-red-500 text-xs">{error}</p>}

              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating} 
                className="w-full h-9"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Generated Preview (Scrollable) */}
          {generatedEntries.length > 0 && (
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col animate-in fade-in">
                <div className="flex justify-between items-center mb-3 shrink-0">
                  <h3 className="font-semibold text-purple-900 text-xs">Preview ({generatedEntries.length})</h3>
                  <Button size="sm" onClick={handleSaveToDb} className="bg-purple-600 hover:bg-purple-700 text-white h-7 text-xs px-2">
                    <Save className="w-3 h-3 mr-1.5" />
                    Save
                  </Button>
                </div>
                <div className="space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                  {generatedEntries.map((entry, idx) => (
                    <div key={idx} className="bg-purple-50 p-2 rounded border border-purple-100 text-xs flex justify-between items-center">
                      <div>
                         <span className="font-bold text-slate-800 block">{entry.headword}</span>
                         <span className="text-slate-500">{entry.senses[0]?.definition.substring(0, 30)}...</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Right Panel: Database View */}
        <div className="w-full lg:w-2/3 h-full flex flex-col min-h-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-3 border-b border-slate-100 flex flex-wrap justify-between items-center bg-slate-50 gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-slate-500" />
                <h2 className="text-base font-bold text-slate-900">Live Database</h2>
                <Badge variant="secondary" className="ml-1 text-xs">
                  {dbEntries.length}
                </Badge>
              </div>
              
              <div className="flex gap-2 items-center flex-1 justify-end">
                <div className="relative w-full max-w-[220px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Filter..." 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
                    />
                </div>
                
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".json" 
                    onChange={handleFileChange}
                />
                <Button variant="outline" size="sm" className="h-9 w-9 p-0" onClick={handleImportClick} title="Import">
                    <Upload className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-9 w-9 p-0" onClick={handleExport} title="Export">
                    <Download className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={handleRefresh}>
                    <RefreshCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-slate-50/50">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th 
                      className="p-3 font-semibold text-xs text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-200 transition-colors select-none"
                      onClick={() => handleSort('headword')}
                    >
                      <div className="flex items-center">Word <SortIcon column="headword" /></div>
                    </th>
                    <th className="p-3 font-semibold text-xs text-slate-500 uppercase tracking-wider">Definition</th>
                    <th 
                      className="p-3 font-semibold text-xs text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-200 transition-colors w-16 text-center select-none"
                      onClick={() => handleSort('upvotes')}
                      title="Sort by Upvotes"
                    >
                      <div className="flex items-center justify-center"><ThumbsUp className="w-3.5 h-3.5 mr-1"/> <SortIcon column="upvotes" /></div>
                    </th>
                    <th 
                      className="p-3 font-semibold text-xs text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-200 transition-colors w-16 text-center select-none"
                      onClick={() => handleSort('downvotes')}
                      title="Sort by Downvotes"
                    >
                      <div className="flex items-center justify-center"><ThumbsDown className="w-3.5 h-3.5 mr-1"/> <SortIcon column="downvotes" /></div>
                    </th>
                    <th className="p-3 font-semibold text-xs text-slate-500 uppercase tracking-wider w-24 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {paginatedEntries.map((entry, idx) => (
                    <tr key={`${entry.headword}-${idx}`} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-3 align-top w-1/4">
                        <div className="font-bold text-slate-900 text-sm">{entry.headword}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {entry.senses.map((s, i) => (
                              <span key={i} className="text-[10px] font-serif italic text-slate-500 bg-slate-100 px-1 rounded">
                                  {s.pos}
                              </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 align-top">
                         {entry.senses.map((sense, i) => (
                             <div key={i} className={`mb-1.5 ${i > 0 ? 'border-t border-slate-100 pt-1.5' : ''}`}>
                                <div className="font-myanmar text-xs text-slate-800 leading-relaxed">
                                    {sense.definition}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                    {sense.gloss}
                                </div>
                             </div>
                         ))}
                      </td>
                      <td className="p-3 align-top text-center">
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                          {entry.community_stats?.upvotes || 0}
                        </span>
                      </td>
                      <td className="p-3 align-top text-center">
                        <span className="text-xs font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">
                          {entry.community_stats?.downvotes || 0}
                        </span>
                      </td>
                      <td className="p-3 align-top text-right">
                        <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(entry)} className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => confirmDelete(entry)} className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedEntries.length === 0 && (
                      <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-400 text-xs">
                              No words found matching "{filter}".
                          </td>
                      </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="p-2 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
                    <div className="text-xs text-slate-500 font-medium ml-1">
                        Page {currentPage}/{totalPages}
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="h-10 w-10 p-0"
                            title="Previous Page"
                        >
                            <ChevronLeft className="w-6 h-6 text-slate-600" />
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="h-10 w-10 p-0"
                            title="Next Page"
                        >
                            <ChevronRight className="w-6 h-6 text-slate-600" />
                        </Button>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>

      {selectedEntry && (
        <EntryEditor 
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          initialEntry={selectedEntry}
          onSave={handleSaveEdit}
          title={`Editing "${originalHeadword}"`}
        />
      )}

      <Dialog 
        isOpen={isDeleteDialogOpen} 
        onClose={() => setIsDeleteDialogOpen(false)} 
        title="Confirm Deletion"
        description="This action cannot be undone."
        className="max-w-sm"
      >
        <div className="flex flex-col items-center justify-center p-4">
            <div className="bg-red-100 p-3 rounded-full mb-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-center text-slate-700 mb-6 text-sm">
                Are you sure you want to delete <br/>
                <span className="font-bold text-slate-900">"{entryToDelete?.headword}"</span>?
            </p>
            <div className="flex w-full gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsDeleteDialogOpen(false)}>
                    Cancel
                </Button>
                <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete}>
                    Delete
                </Button>
            </div>
        </div>
      </Dialog>
    </div>
  );
};
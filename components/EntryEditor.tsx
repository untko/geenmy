import React, { useState, useEffect } from 'react';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { DictionaryEntry } from '../types';
import { Plus, Trash2, Sparkles, Wand2, Loader2, Check } from 'lucide-react';
import { checkAndCorrectEntry, enrichEntryExamples } from '../lib/aiService';

interface EntryEditorProps {
  isOpen: boolean;
  onClose: () => void;
  initialEntry: DictionaryEntry;
  onSave: (entry: DictionaryEntry) => void;
  title?: string;
  saveLabel?: string;
}

export const EntryEditor: React.FC<EntryEditorProps> = ({ 
  isOpen, onClose, initialEntry, onSave, 
  title = "Edit Entry",
  saveLabel = "Save Changes"
}) => {
  const [entry, setEntry] = useState<DictionaryEntry>(initialEntry);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEntry(JSON.parse(JSON.stringify(initialEntry)));
    }
  }, [initialEntry, isOpen]);

  const updateField = (field: keyof DictionaryEntry, value: any) => {
    setEntry({ ...entry, [field]: value });
  };

  const updateSense = (index: number, field: string, value: any) => {
    const newSenses = [...entry.senses];
    newSenses[index] = { ...newSenses[index], [field]: value };
    setEntry({ ...entry, senses: newSenses });
  };

  const updateExample = (senseIndex: number, exIndex: number, field: string, value: any) => {
    const newSenses = [...entry.senses];
    const newExamples = [...newSenses[senseIndex].examples];
    newExamples[exIndex] = { ...newExamples[exIndex], [field]: value };
    newSenses[senseIndex] = { ...newSenses[senseIndex], examples: newExamples };
    setEntry({ ...entry, senses: newSenses });
  };

  // --- Manual Edit Actions ---

  const handleAddSense = () => {
    const newId = entry.senses.length + 1;
    setEntry({
        ...entry,
        senses: [
            ...entry.senses,
            {
                sense_id: `s${newId}`,
                pos: 'noun',
                gloss: '',
                definition: '',
                examples: [],
                tags: []
            }
        ]
    });
  };

  const handleRemoveSense = (index: number) => {
    if (confirm("Are you sure you want to delete this definition?")) {
        const newSenses = entry.senses.filter((_, i) => i !== index);
        setEntry({ ...entry, senses: newSenses });
    }
  };

  const handleAddExample = (senseIndex: number) => {
    const newSenses = [...entry.senses];
    newSenses[senseIndex].examples.push({ src: '', tgt: '' });
    setEntry({ ...entry, senses: newSenses });
  };

  const handleRemoveExample = (senseIndex: number, exIndex: number) => {
    const newSenses = [...entry.senses];
    newSenses[senseIndex].examples = newSenses[senseIndex].examples.filter((_, i) => i !== exIndex);
    setEntry({ ...entry, senses: newSenses });
  };

  // --- AI Actions ---

  const handleAiCheck = async () => {
    setIsAiProcessing(true);
    try {
        const corrected = await checkAndCorrectEntry(entry);
        if (corrected) {
            setEntry(corrected);
        }
    } catch (e) {
        alert("Failed to check entry with AI.");
    } finally {
        setIsAiProcessing(false);
    }
  };

  const handleAiExpand = async () => {
    setIsAiProcessing(true);
    try {
        const expanded = await enrichEntryExamples(entry);
        if (expanded) {
            setEntry(expanded);
        }
    } catch (e) {
        alert("Failed to generate examples.");
    } finally {
        setIsAiProcessing(false);
    }
  };

  const inputClass = "w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-slate-500 focus:ring-1 focus:ring-slate-200 focus:outline-none bg-white text-slate-900";

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title}
      description="Modify properties below or use AI to enhance the entry."
      className="max-w-4xl"
    >
        <div className="flex flex-col h-[75vh]">
            {/* AI Toolbar */}
            <div className="flex gap-3 mb-4 p-3 bg-purple-50 rounded-lg border border-purple-100 items-center animate-in fade-in slide-in-from-top-2">
                <span className="text-xs font-bold text-purple-800 uppercase tracking-wider mr-auto flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI Assistants
                </span>
                
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-white text-purple-700 border-purple-200 hover:bg-purple-100 h-8 text-xs"
                    onClick={handleAiCheck}
                    disabled={isAiProcessing}
                >
                    {isAiProcessing ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Check className="w-3.5 h-3.5 mr-2" />}
                    Check & Correct
                </Button>
                
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-white text-purple-700 border-purple-200 hover:bg-purple-100 h-8 text-xs"
                    onClick={handleAiExpand}
                    disabled={isAiProcessing}
                >
                    {isAiProcessing ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Wand2 className="w-3.5 h-3.5 mr-2" />}
                    Add More Examples
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-6">
                
                {/* General Info */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
                    <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">General Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Headword</label>
                            <input 
                                className={inputClass}
                                value={entry.headword}
                                onChange={(e) => updateField('headword', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">IPA / Phonetic</label>
                            <input 
                                className={inputClass}
                                value={entry.phonetic_ipa || ''}
                                onChange={(e) => updateField('phonetic_ipa', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Senses List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Definitions (Senses)</h3>
                    </div>

                    {entry.senses.map((sense, idx) => (
                        <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden transition-all hover:border-slate-300">
                            <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-slate-600">Sense {idx + 1}</span>
                                    <Badge variant="outline" className="bg-white text-[10px] h-5">{sense.sense_id}</Badge>
                                </div>
                                <button 
                                    onClick={() => handleRemoveSense(idx)}
                                    className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                                    title="Delete Sense"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="p-4 space-y-4 bg-white">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-1">
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Part of Speech</label>
                                        <input 
                                            className={inputClass}
                                            value={sense.pos}
                                            onChange={(e) => updateSense(idx, 'pos', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Tags (comma separated)</label>
                                        <input 
                                            className={inputClass}
                                            value={sense.tags?.join(', ') || ''}
                                            onChange={(e) => updateSense(idx, 'tags', e.target.value.split(',').map((s: string) => s.trim()))}
                                            placeholder="e.g. food, slang"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Gloss (English)</label>
                                        <input 
                                            className={inputClass}
                                            value={sense.gloss}
                                            onChange={(e) => updateSense(idx, 'gloss', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Definition (Myanmar)</label>
                                        <input 
                                            className={`${inputClass} font-myanmar`}
                                            value={sense.definition}
                                            onChange={(e) => updateSense(idx, 'definition', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Examples */}
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <label className="block text-xs font-medium text-slate-500">Examples</label>
                                        <button 
                                            onClick={() => handleAddExample(idx)}
                                            className="text-[10px] text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1 hover:underline"
                                        >
                                            <Plus className="w-3 h-3" />
                                            Add Example
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {sense.examples.map((ex, exIdx) => (
                                            <div key={exIdx} className="pl-3 border-l-2 border-slate-200 text-sm space-y-2 relative group">
                                                <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => handleRemoveExample(idx, exIdx)}
                                                        className="p-1 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <input 
                                                    className={inputClass}
                                                    value={ex.src}
                                                    onChange={(e) => updateExample(idx, exIdx, 'src', e.target.value)}
                                                    placeholder="English sentence"
                                                />
                                                <input 
                                                    className={`${inputClass} font-myanmar`}
                                                    value={ex.tgt}
                                                    onChange={(e) => updateExample(idx, exIdx, 'tgt', e.target.value)}
                                                    placeholder="Myanmar translation"
                                                />
                                            </div>
                                        ))}
                                        {sense.examples.length === 0 && (
                                            <div className="text-center py-2 border border-dashed border-slate-200 rounded text-xs text-slate-400">
                                                No examples yet.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <Button 
                        variant="outline" 
                        onClick={handleAddSense} 
                        className="w-full border-dashed border-slate-300 text-slate-500 hover:text-slate-700 hover:border-slate-400"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Sense
                    </Button>
                </div>
            </div>
            
            <div className="pt-4 mt-2 border-t border-slate-200 flex justify-end gap-2 bg-white">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={() => onSave(entry)} className="bg-slate-900 text-white">{saveLabel}</Button>
            </div>
        </div>
    </Dialog>
  );
};
import { DictionaryEntry, WordVote, WordSuggestion } from '../types';
import { MOCK_DATA } from '../constants';
import { supabase } from './supabaseClient';

const STORAGE_KEY = 'ai_dictionary_db';

class DictionaryStore {
  private data: DictionaryEntry[] = [];
  private listeners: Set<() => void> = new Set();
  private isLoading = true;
  
  // Local cache for real-time UI updates before re-fetch
  private voteCache: Record<string, { up: number, down: number }> = {};
  private userVoteCache: Record<string, 'up' | 'down'> = {};

  constructor() {
    this.init();
  }

  private async init() {
    this.loadFromLocalStorage();
    await this.syncWithCloud();
    this.isLoading = false;
    this.notify();
  }

  private loadFromLocalStorage() {
    if (typeof window === 'undefined') return;
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        this.data = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse dictionary DB', e);
        this.data = [...MOCK_DATA];
      }
    } else {
      this.data = [...MOCK_DATA];
      this.saveToLocalStorage();
    }
    
    // Initialize vote cache from data
    this.data.forEach(entry => {
      if (entry.id && entry.community_stats) {
        this.voteCache[entry.id] = {
          up: entry.community_stats.upvotes,
          down: entry.community_stats.downvotes
        };
      }
    });
  }

  private saveToLocalStorage() {
    if (typeof window === 'undefined') return;
    
    // Merge current cache into data before saving to ensure stats are persisted correctly
    // This solves the issue where exports/reloads might lose recent votes or imported stats
    const snapshot = this.data.map(entry => {
       if (entry.id && this.voteCache[entry.id]) {
         return {
           ...entry,
           community_stats: {
             upvotes: this.voteCache[entry.id].up,
             downvotes: this.voteCache[entry.id].down
           }
         };
       }
       return entry;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    this.notify();
  }

  private async syncWithCloud() {
    try {
      const { data, error } = await supabase
        .from('dictionary_entries')
        .select('id, headword, entry');

      if (error) return;

      if (data && data.length > 0) {
        // Merge logic...
      }
    } catch (e) {
      console.warn('Sync error', e);
    }
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  public subscribe(callback: () => void) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public getAll(): DictionaryEntry[] {
    // Inject current vote counts into returned objects
    return this.data.map(entry => {
      if (entry.id && this.voteCache[entry.id]) {
        return {
          ...entry,
          community_stats: {
            upvotes: this.voteCache[entry.id].up,
            downvotes: this.voteCache[entry.id].down
          }
        };
      }
      return entry;
    });
  }

  public async addEntries(newEntries: DictionaryEntry[]) {
    const entryMap = new Map<string, DictionaryEntry>();
    this.data.forEach(e => entryMap.set(e.headword.toLowerCase(), e));

    const entriesToUpsert: DictionaryEntry[] = [];
    let addedCount = 0;
    let updatedCount = 0;

    for (const newEntry of newEntries) {
        const key = newEntry.headword.toLowerCase();
        // Ensure ID
        if (!newEntry.id) newEntry.id = crypto.randomUUID();

        // IMPORT LOGIC: If the imported entry has statistics, update the local cache
        // This ensures that importing a file "restores" the vote counts visually
        if (newEntry.community_stats && newEntry.id) {
            this.voteCache[newEntry.id] = {
                up: newEntry.community_stats.upvotes || 0,
                down: newEntry.community_stats.downvotes || 0
            };
        }

        if (entryMap.has(key)) {
            const existingEntry = entryMap.get(key)!;
            // Preserve existing ID if headword matches
            if (existingEntry.id) newEntry.id = existingEntry.id;
            
            // If importing an existing entry that has newer stats, update cache for that ID too
            if (newEntry.community_stats && existingEntry.id) {
                this.voteCache[existingEntry.id] = {
                    up: newEntry.community_stats.upvotes || 0,
                    down: newEntry.community_stats.downvotes || 0
                };
                // Explicitly update the data object's stats as well
                existingEntry.community_stats = newEntry.community_stats;
            }

            let entryModified = false;
            for (const newSense of newEntry.senses) {
                const exists = existingEntry.senses.some(s => 
                    s.gloss.toLowerCase() === newSense.gloss.toLowerCase() ||
                    s.definition === newSense.definition
                );
                if (!exists) {
                    const nextId = existingEntry.senses.length + 1;
                    const mergedSense = { ...newSense, sense_id: `s${nextId}` };
                    existingEntry.senses.push(mergedSense);
                    entryModified = true;
                }
            }
            if (entryModified) {
                updatedCount++;
                entriesToUpsert.push(existingEntry);
            }
        } else {
            this.data.unshift(newEntry);
            entryMap.set(key, newEntry);
            entriesToUpsert.push(newEntry);
            addedCount++;
        }
    }

    this.data = [...this.data];
    this.saveToLocalStorage();

    if (entriesToUpsert.length > 0) {
        try {
            const rows = entriesToUpsert.map(entry => ({
                id: entry.id,
                headword: entry.headword,
                entry: entry
            }));
            await supabase.from('dictionary_entries').upsert(rows, { onConflict: 'headword' });
        } catch (e) { console.error(e); }
    }
    
    return { added: addedCount, updated: updatedCount };
  }

  public async updateEntry(originalHeadword: string, updatedEntry: DictionaryEntry) {
    // Direct Admin Edit
    this.data = this.data.map(item => 
      item.headword === originalHeadword ? updatedEntry : item
    );
    this.saveToLocalStorage();
    
    try {
       await supabase.from('dictionary_entries').upsert({
           id: updatedEntry.id,
           headword: updatedEntry.headword,
           entry: updatedEntry
       }, { onConflict: 'headword' });
    } catch (e) {}
  }

  public deleteEntry(headword: string) {
    this.data = this.data.filter(item => item.headword !== headword);
    this.saveToLocalStorage();
    try {
        supabase.from('dictionary_entries').delete().eq('headword', headword);
    } catch (e) {}
  }

  public search(query: string): DictionaryEntry[] {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    
    const results = this.data.filter(entry => 
      entry.headword.toLowerCase().includes(q) ||
      entry.senses.some(sense => 
        sense.gloss.toLowerCase().includes(q) ||
        sense.definition.toLowerCase().includes(q) ||
        sense.tags?.some(tag => tag.toLowerCase().includes(q))
      )
    );

    // Inject votes
    return results.map(entry => {
       if (entry.id && this.voteCache[entry.id]) {
        return {
          ...entry,
          community_stats: {
             upvotes: this.voteCache[entry.id].up,
             downvotes: this.voteCache[entry.id].down
          }
        };
       }
       return entry;
    });
  }

  public getRandom(): DictionaryEntry {
    if (this.data.length === 0) return MOCK_DATA[0];
    const entry = this.data[Math.floor(Math.random() * this.data.length)];
    return this.enrichEntry(entry);
  }

  /**
   * Returns a word with low engagement that the user hasn't voted on yet.
   * Logic: 
   * 1. Exclude words voted by user.
   * 2. Sort by:
   *    a) Total votes = 0 (Unvoted)
   *    b) Downvotes Ascending (Safest/Least controversial first)
   *    c) Total votes Ascending (Low engagement first)
   * 3. Return null if no words left to vote on.
   */
  public getLeastVotedWord(excludeUserVoteId?: string): DictionaryEntry | null {
    if (this.data.length === 0) return null;

    // 1. Enrich all data first to get latest stats
    let candidates = this.data.map(e => this.enrichEntry(e));

    // 2. Filter out words user has already voted on
    if (excludeUserVoteId) {
        candidates = candidates.filter(e => e.id && !this.userVoteCache[e.id]);
    }

    // 3. If no unvoted words left, return null (Stop condition)
    if (candidates.length === 0) {
        return null;
    }

    // 4. Sort Strategy
    candidates.sort((a, b) => {
        const statsA = a.community_stats || { upvotes: 0, downvotes: 0 };
        const statsB = b.community_stats || { upvotes: 0, downvotes: 0 };
        
        const totalA = statsA.upvotes + statsA.downvotes;
        const totalB = statsB.upvotes + statsB.downvotes;

        // Priority 1: Zero votes come first (Fresh content)
        if (totalA === 0 && totalB > 0) return -1;
        if (totalA > 0 && totalB === 0) return 1;

        // Priority 2: Lowest Downvotes first
        if (statsA.downvotes !== statsB.downvotes) {
            return statsA.downvotes - statsB.downvotes;
        }

        // Priority 3: Lowest Total Engagement (Tie breaker)
        return totalA - totalB;
    });

    // 5. Return top result
    return candidates[0];
  }

  private enrichEntry(entry: DictionaryEntry): DictionaryEntry {
    if (entry.id && this.voteCache[entry.id]) {
        return {
          ...entry,
          community_stats: {
             upvotes: this.voteCache[entry.id].up,
             downvotes: this.voteCache[entry.id].down
          }
        };
    }
    return entry;
  }

  // --- VOTING & SUGGESTION LOGIC ---

  public async voteForWord(wordId: string, userId: string, voteType: 'up' | 'down') {
    // Optimistic Update
    if (!this.voteCache[wordId]) {
        this.voteCache[wordId] = { up: 0, down: 0 };
    }
    
    // Simple toggle logic for demo: If same vote, remove it. If diff, swap.
    const previousVote = this.userVoteCache[wordId];
    
    if (previousVote === voteType) {
        // Remove vote
        this.voteCache[wordId][voteType]--;
        delete this.userVoteCache[wordId];
    } else {
        // Swap or New
        if (previousVote) this.voteCache[wordId][previousVote]--;
        this.voteCache[wordId][voteType]++;
        this.userVoteCache[wordId] = voteType;
    }
    
    // Persist changes to local storage so they appear in exports/reloads
    this.saveToLocalStorage();

    // Sync with DB
    try {
        await supabase.from('word_votes').upsert({
            word_id: wordId,
            user_id: userId,
            vote_type: voteType
        }, { onConflict: 'word_id, user_id' });
    } catch (e) {
        console.error("Vote sync error", e);
    }
  }

  public getUserVote(wordId: string): 'up' | 'down' | undefined {
      return this.userVoteCache[wordId];
  }

  public async submitSuggestion(wordId: string | undefined, userId: string, proposedEntry: DictionaryEntry) {
    try {
        const { error } = await supabase.from('word_suggestions').insert({
            original_word_id: wordId,
            user_id: userId,
            proposed_content: proposedEntry,
            status: 'pending'
        });
        
        if (error) throw error;
        return { success: true };
    } catch (e) {
        console.error("Suggestion submit error", e);
        return { success: false, error: e };
    }
  }
}

export const dictionaryStore = new DictionaryStore();
export type DictionaryEntry = {
  id?: string; // UUID from database
  headword: string;
  source_lang: 'en' | 'my';
  target_lang: 'en' | 'my';
  phonetic_ipa?: string;
  romanization?: string;
  senses: {
    sense_id: string;
    pos: string;
    gloss: string;
    definition: string;
    usage_note?: string;
    examples: {
      src: string;
      tgt: string;
      src_roman?: string;
      tgt_roman?: string;
    }[];
    tags: string[];
  }[];
  community_stats?: {
    upvotes: number;
    downvotes: number;
  };
};

export type WordVote = {
  id: string;
  word_id: string;
  user_id: string;
  vote_type: 'up' | 'down';
  created_at: string;
};

export type WordSuggestion = {
  id: string;
  original_word_id?: string;
  user_id: string;
  proposed_content: DictionaryEntry;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};
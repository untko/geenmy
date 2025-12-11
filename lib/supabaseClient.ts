import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// Note: In a real Next.js app, these would be process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

const isMock = supabaseUrl === 'https://placeholder-project.supabase.co';

let client: SupabaseClient;

if (!isMock) {
  client = createClient(supabaseUrl, supabaseKey);
} else {
  // --- MOCK IMPLEMENTATION FOR TESTING ---
  console.log("⚠️ Using Mock Supabase Client. Login will be simulated locally.");
  
  const MOCK_USER: User = {
    id: 'mock-user-123',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'tester@example.com',
    email_confirmed_at: new Date().toISOString(),
    phone: '',
    confirmation_sent_at: '',
    confirmed_at: '',
    last_sign_in_at: '',
    app_metadata: { provider: 'google', providers: ['google'] },
    user_metadata: {
      avatar_url: 'https://ui-avatars.com/api/?name=Test+User&background=0f172a&color=fff',
      full_name: 'Test User',
      email: 'tester@example.com'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const MOCK_SESSION: Session = {
    access_token: 'mock-access-token',
    token_type: 'bearer',
    expires_in: 3600,
    refresh_token: 'mock-refresh-token',
    user: MOCK_USER,
  };

  class MockAuth {
    private listeners: Array<(event: string, session: Session | null) => void> = [];
    private _session: Session | null = null;

    constructor() {
      // Check local storage to persist mock session across reloads
      const stored = localStorage.getItem('mock_session_active');
      if (stored === 'true') {
        this._session = MOCK_SESSION;
      }
    }

    async getSession() {
      return { data: { session: this._session }, error: null };
    }

    onAuthStateChange(callback: (event: string, session: Session | null) => void) {
      this.listeners.push(callback);
      // Fire immediately with current state
      callback(this._session ? 'SIGNED_IN' : 'SIGNED_OUT', this._session);
      return { data: { subscription: { unsubscribe: () => {
        this.listeners = this.listeners.filter(l => l !== callback);
      }}}};
    }

    async signInWithOAuth() {
      console.log('🔄 Simulating OAuth Redirect...');
      this._session = MOCK_SESSION;
      localStorage.setItem('mock_session_active', 'true');
      this.notify('SIGNED_IN');
      return { data: { url: window.location.href }, error: null };
    }

    async signOut() {
      console.log('👋 Signing out...');
      this._session = null;
      localStorage.removeItem('mock_session_active');
      this.notify('SIGNED_OUT');
      return { error: null };
    }

    private notify(event: string) {
      this.listeners.forEach(cb => cb(event, this._session));
    }
  }

  // Mock DB Query Builder
  const createMockQueryBuilder = (table: string) => {
    return {
      select: () => Promise.resolve({ data: [], error: null }),
      insert: (rows: any) => {
        console.log(`[MockDB] Inserting into ${table}:`, rows);
        return Promise.resolve({ data: rows, error: null });
      },
      upsert: (rows: any) => Promise.resolve({ data: rows, error: null }),
    } as any;
  };

  // We cast this object to SupabaseClient to satisfy TypeScript usage
  client = {
    auth: new MockAuth(),
    from: (table: string) => createMockQueryBuilder(table),
  } as unknown as SupabaseClient;
}

export const supabase = client;
/**
 * ROAD TO PRO — SUPABASE SYNC ENGINE & STATE MANAGER
 */

const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

let supabaseClient = null;
if (typeof supabase !== 'undefined' && SUPABASE_URL !== 'https://YOUR_PROJECT_ID.supabase.co') {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

const DEFAULT_STATE = {
  stats: { level: 1, xp: 0 },
  tasks: [
    { id: 't1', title: 'تمارين الضغط والسكوات', category: 'WORKOUT', type: 'PRIMARY', xp: 50, isCompleted: false },
    { id: 't2', title: 'تمارين الميولينج ومحاذاة الفك', category: 'WORKOUT', type: 'SECONDARY', xp: 30, isCompleted: false }
  ],
  footballSkills: { shooting: 75, passing: 78, vision: 74, dribbling: 82, ballControl: 80, speed: 85, stamina: 80, strength: 72 },
  footballMatches: [],
  prs: { pushups: 0, squats: 0, pullups: 0, runningKm: 0 }
};

let appState = JSON.parse(localStorage.getItem('RTP_STATE')) || DEFAULT_STATE;

function saveState() {
  localStorage.setItem('RTP_STATE', JSON.stringify(appState));
}

window.syncEngine = {
  currentUser: null,
  async syncLocalToRemote() {
    if (!supabaseClient || !this.currentUser) return;
    try {
      await supabaseClient.from('user_states').upsert({
        user_id: this.currentUser.id,
        state_data: appState,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.error('Sync failed:', e);
    }
  }
};

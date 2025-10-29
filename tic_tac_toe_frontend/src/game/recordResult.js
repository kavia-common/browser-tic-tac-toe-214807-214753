import { getSupabaseClient } from '../lib/supabaseClient';

/**
 * PUBLIC_INTERFACE
 * recordMatchResult
 * Records a Tic Tac Toe match result into Supabase 'matches' table.
 * The table is expected to have columns:
 *  - id (uuid default uuid_generate_v4() or gen_random_uuid())
 *  - player_x (text)
 *  - player_o (text)
 *  - winner (text enum-like: 'X' | 'O' | 'draw')
 *  - winner_name (text, nullable)
 *  - created_at (timestamp with time zone default now())
 *
 * If Supabase is not configured, this function no-ops and resolves gracefully.
 *
 * @param {Object} params
 * @param {string} params.playerX - Display name for player X
 * @param {string} params.playerO - Display name for player O
 * @param {'X'|'O'|null} params.winner - Winner mark or null when draw
 */
export async function recordMatchResult({ playerX, playerO, winner }) {
  /** This is a public function. */
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, skipped: true, reason: 'Supabase not configured' };
  }

  const winnerName =
    winner === 'X' ? playerX : winner === 'O' ? playerO : null;
  const payload = {
    player_x: playerX || 'Player X',
    player_o: playerO || 'Player O',
    winner: winner ?? 'draw',
    winner_name: winnerName,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from('matches').insert([payload]).select();

  if (error) {
    console.warn('Failed to record match result:', error.message);
    return { ok: false, error };
  }
  return { ok: true, data };
}

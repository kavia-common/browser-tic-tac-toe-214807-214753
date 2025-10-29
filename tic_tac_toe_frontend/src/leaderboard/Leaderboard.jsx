import React, { useEffect, useMemo, useState } from 'react';
import { getSupabaseClient } from '../lib/supabaseClient';

/**
 * PUBLIC_INTERFACE
 * Leaderboard
 * Displays the top 10 players by win ratio with a minimum games threshold.
 * Computes wins/losses/games by aggregating the 'matches' table client-side.
 *
 * Schema expected:
 *  - matches(player_x text, player_o text, winner text ['X','O','draw'], winner_name text)
 */
export default function Leaderboard({ minGames = 3 }) {
  /** This is a public function. */
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    const run = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setErr('Supabase not configured. Provide REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY.');
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('matches')
        .select('player_x, player_o, winner, winner_name, created_at')
        .order('created_at', { ascending: false })
        .limit(1000); // reasonable limit

      if (error) {
        setErr(error.message);
        setLoading(false);
        return;
      }

      // Aggregate per player name based on both player_x and player_o occurrences
      const stats = new Map();
      const ensure = (name) => {
        if (!name) return null;
        if (!stats.has(name)) stats.set(name, { name, wins: 0, losses: 0, draws: 0, games: 0 });
        return stats.get(name);
      };

      for (const m of data || []) {
        const px = m.player_x || 'Player X';
        const po = m.player_o || 'Player O';
        const w = m.winner; // 'X' | 'O' | 'draw'
        const wname = m.winner_name || null;

        const sX = ensure(px);
        const sO = ensure(po);
        if (sX) sX.games += 1;
        if (sO) sO.games += 1;

        if (w === 'draw') {
          if (sX) sX.draws += 1;
          if (sO) sO.draws += 1;
        } else if (wname) {
          const winnerStat = ensure(wname);
          if (winnerStat) winnerStat.wins += 1;

          const loserName = wname === px ? po : px;
          const loserStat = ensure(loserName);
          if (loserStat) loserStat.losses += 1;
        }
      }

      const list = Array.from(stats.values())
        .filter((r) => r.games >= minGames)
        .map((r) => ({
          ...r,
          win_ratio: r.games > 0 ? r.wins / r.games : 0,
        }))
        .sort((a, b) => b.win_ratio - a.win_ratio || b.wins - a.wins)
        .slice(0, 10);

      setRows(list);
      setLoading(false);
    };

    run();
  }, [minGames]);

  const table = useMemo(() => {
    if (loading) return <div className="status-bar status-turn">Loading leaderboard…</div>;
    if (err) return <div className="status-bar status-draw">Error: {err}</div>;
    if (!rows.length) return <div className="status-bar status-draw">No results yet.</div>;

    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left' }}>
              <th style={{ padding: '8px' }}>Player</th>
              <th style={{ padding: '8px' }}>Wins</th>
              <th style={{ padding: '8px' }}>Losses</th>
              <th style={{ padding: '8px' }}>Draws</th>
              <th style={{ padding: '8px' }}>Games</th>
              <th style={{ padding: '8px' }}>Win Ratio</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} style={{ borderTop: '1px solid rgba(15, 23, 42, 0.06)' }}>
                <td style={{ padding: '8px', fontWeight: 700 }}>{r.name}</td>
                <td style={{ padding: '8px' }}>{r.wins}</td>
                <td style={{ padding: '8px' }}>{r.losses}</td>
                <td style={{ padding: '8px' }}>{r.draws}</td>
                <td style={{ padding: '8px' }}>{r.games}</td>
                <td style={{ padding: '8px' }}>{(r.win_ratio * 100).toFixed(0)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [rows, loading, err]);

  return (
    <div className="game-card">
      <h2 className="title">Leaderboard</h2>
      {table}
      <div className="actions" style={{ marginTop: 16 }}>
        <a className="btn" href="/" title="Back to Game">Back to Game</a>
      </div>
      <p className="hint">Minimum games threshold: {minGames}</p>
    </div>
  );
}

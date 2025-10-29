import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import ChatAssistant from './components/ChatAssistant';
import ChatToggleButton from './components/ChatToggleButton';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
} from 'react-router-dom';
import { Leaderboard } from './leaderboard';
import { usePlayerIdentity } from './hooks/usePlayerIdentity';
import { recordMatchResult } from './game/recordResult';

/**
 * Utility to calculate the winner and the winning line indices.
 * Returns an object: { winner: 'X' | 'O' | null, line: number[] | null }
 */
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], // rows
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6], // cols
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8], // diags
    [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return { winner: null, line: null };
}

/**
 * Square component renders a single button cell.
 */
function Square({ value, onClick, highlight }) {
  return (
    <button
      className={`ttt-square ${highlight ? 'highlight' : ''}`}
      onClick={onClick}
      aria-label={`Square ${value ? value : 'empty'}`}
    >
      {value}
    </button>
  );
}

/**
 * Board renders 3x3 grid of squares.
 */
function Board({ squares, onSquareClick, winningLine }) {
  const renderSquare = (i) => (
    <Square
      key={i}
      value={squares[i]}
      onClick={() => onSquareClick(i)}
      highlight={winningLine?.includes(i)}
    />
  );

  return (
    <div className="ttt-grid">
      {[0, 1, 2].map((r) => (
        <div className="ttt-row" key={`row-${r}`}>
          {renderSquare(r * 3 + 0)}
          {renderSquare(r * 3 + 1)}
          {renderSquare(r * 3 + 2)}
        </div>
      ))}
    </div>
  );
}

function GameCard() {
  /**
   * Game state
   */
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  const { winner, line } = useMemo(() => calculateWinner(squares), [squares]);
  const isDraw = useMemo(
    () => squares.every(Boolean) && !winner,
    [squares, winner]
  );
  const gameOver = Boolean(winner) || isDraw;

  /**
   * Handle a move at a specific index.
   */
  const handleSquareClick = (i) => {
    if (squares[i] || gameOver) return;
    const next = squares.slice();
    next[i] = xIsNext ? 'X' : 'O';
    setSquares(next);
    setXIsNext((prev) => !prev);
  };

  /**
   * Reset the game state.
   */
  const handleRestart = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
  };

  const status = winner
    ? `Winner: ${winner}`
    : isDraw
    ? 'Draw'
    : `Next Player: ${xIsNext ? 'X' : 'O'}`;

  const [assistantOpen, setAssistantOpen] = useState(false);
  const { name: displayName, setName: setDisplayName } = usePlayerIdentity();

  // Names for X and O for this device/session. If one name, use as X; allow O entry as well.
  const [nameX, setNameX] = useState('');
  const [nameO, setNameO] = useState('');

  useEffect(() => {
    if (!nameX && displayName) setNameX(displayName);
  }, [displayName, nameX]);

  // On game over, persist result
  useEffect(() => {
    if (!winner && !isDraw) return;
    const xName = nameX?.trim() || 'Player X';
    const oName = nameO?.trim() || 'Player O';
    recordMatchResult({
      playerX: xName,
      playerO: oName,
      winner: winner ?? null,
    });
  }, [winner, isDraw, nameX, nameO]);

  return (
    <div className="app-root">
      <div className="game-card">
        <h1 className="title">Tic Tac Toe</h1>

        <div className="actions" style={{ justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              placeholder="Name for X"
              value={nameX}
              onChange={(e) => setNameX(e.target.value)}
              className="btn"
              style={{ padding: '8px 10px', minWidth: 120 }}
            />
            <input
              placeholder="Name for O"
              value={nameO}
              onChange={(e) => setNameO(e.target.value)}
              className="btn"
              style={{ padding: '8px 10px', minWidth: 120 }}
            />
          </div>
          <Link className="btn" to="/leaderboard" title="View Leaderboard">
            Leaderboard
          </Link>
        </div>

        <div
          className={`status-bar ${winner ? 'status-win' : isDraw ? 'status-draw' : 'status-turn'}`}
          role="status"
          aria-live="polite"
          style={{ marginTop: 12 }}
        >
          {status}
        </div>

        <Board
          squares={squares}
          onSquareClick={handleSquareClick}
          winningLine={line}
        />

        <div className="actions">
          <button className="btn primary" onClick={handleRestart}>
            Restart
          </button>
        </div>

        <p className="hint">
          X starts. Click an empty square to place your mark.
        </p>
      </div>

      {/* Floating chat UI */}
      <ChatToggleButton
        isOpen={assistantOpen}
        onToggle={() => setAssistantOpen((v) => !v)}
      />
      <ChatAssistant
        isOpen={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        board={squares}
        nextPlayer={xIsNext ? 'X' : 'O'}
      />
    </div>
  );
}

function App() {
  // Router wrapper to provide navigation to Leaderboard
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GameCard />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </Router>
  );
}

export default App;

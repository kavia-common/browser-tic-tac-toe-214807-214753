//
// Lightweight OpenAI client wrapper for the demo
// PUBLIC_INTERFACE
export async function chatWithOpenAI({ messages, model = "gpt-4o-mini", signal }) {
  /**
   * This function sends a chat completion request to OpenAI.
   * It prefers a client-side direct call using the OPENAI_API_KEY at build time.
   * If the key is not provided at build-time, it falls back to a proxy endpoint /api/chat.
   *
   * Environment variable:
   * - REACT_APP_OPENAI_API_KEY (must be set at build-time in .env)
   */
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

  // If we have an API key, call OpenAI directly
  if (apiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
        }),
        signal,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`OpenAI error ${res.status}: ${text}`);
      }
      const data = await res.json();
      const content =
        data?.choices?.[0]?.message?.content ?? "I'm sorry, I couldn't generate a response.";
      return { content };
    } catch (err) {
      throw new Error(err.message || "Failed to reach OpenAI");
    }
  }

  // Otherwise, attempt to call a backend proxy (if one exists)
  // Instructions: Provide a simple server that accepts POST /api/chat
  // { messages: [...], model?: string } and forwards to OpenAI.
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, model }),
      signal,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Proxy error ${res.status}: ${text}`);
    }
    const data = await res.json();
    return { content: data?.content ?? "" };
  } catch (err) {
    throw new Error(
      "No REACT_APP_OPENAI_API_KEY found and /api/chat proxy failed. " +
        "Set REACT_APP_OPENAI_API_KEY in .env or implement a proxy."
    );
  }
}

// PUBLIC_INTERFACE
export function suggestNextMove(board, player = "X") {
  /**
   * Provides a simple, synchronous suggestion for the next move given the current board array of length 9.
   * Strategy:
   * 1. If there is a winning move for 'player', take it.
   * 2. Block opponent's winning move if present.
   * 3. Take center if available.
   * 4. Take any corner if available.
   * 5. Take any side.
   */
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  const opponent = player === "X" ? "O" : "X";
  const emptyIndices = board.map((v, i) => (v ? null : i)).filter((v) => v !== null);

  const canWin = (who) => {
    for (const [a, b, c] of lines) {
      const line = [board[a], board[b], board[c]];
      const countWho = line.filter((x) => x === who).length;
      const countEmpty = line.filter((x) => x === null).length;
      if (countWho === 2 && countEmpty === 1) {
        const idx = [a, b, c].find((i) => board[i] === null);
        if (idx !== undefined) return idx;
      }
    }
    return null;
  };

  // 1. Win
  const winning = canWin(player);
  if (winning !== null) return winning;

  // 2. Block
  const blocking = canWin(opponent);
  if (blocking !== null) return blocking;

  // 3. Center
  if (board[4] === null) return 4;

  // 4. Corners
  const corners = [0, 2, 6, 8];
  const openCorner = corners.find((i) => board[i] === null);
  if (openCorner !== undefined) return openCorner;

  // 5. Any side
  return emptyIndices[0] ?? null;
}

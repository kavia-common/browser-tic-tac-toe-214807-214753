# Lightweight React Template for KAVIA

This project provides a minimal React template with a clean, modern UI and minimal dependencies.

Now extended with:
- Supabase integration for recording match results
- Leaderboard page showing top win ratios (min games threshold)
- Simple per-session player name capture

## Features

- **Lightweight**: No heavy UI frameworks - uses only vanilla CSS and React
- **Modern UI**: Clean, responsive design with KAVIA brand styling
- **Fast**: Minimal dependencies for quick loading times
- **Simple**: Easy to understand and modify

## Environment

Copy `.env.example` to `.env` and fill:

```
REACT_APP_OPENAI_API_KEY=
REACT_APP_SUPABASE_URL=
REACT_APP_SUPABASE_KEY=
```

Note: Variables must be present at build time.

## Supabase schema

Run the SQL in `../../docs/supabase_schema.sql` (from project root `docs/supabase_schema.sql`) in the Supabase SQL editor to create the required tables and policies.

## Getting Started

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## Components

- `src/lib/supabaseClient.js` – exports `getSupabaseClient()` reading env vars
- `src/game/recordResult.js` – function to record a match result to Supabase
- `src/leaderboard/Leaderboard.jsx` – Leaderboard page
- `src/hooks/usePlayerIdentity.js` – captures a display name in localStorage

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).

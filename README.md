# Meta Hub - Competitive Gaming Analytics

A multi-game competitive analytics platform. Currently featuring Brawl Stars with Clash Royale and Clash of Clans planned.

## Features

- Tier Lists with Meta Score rankings
- Optimal Builds with usage percentages
- Mode-specific meta picks + ban suggestions
- Map-specific recommendations
- Ranked team compositions with ban swaps
- Interactive Draft Simulator with AI suggestions
- Meta Statistics dashboard with charts
- Trending tracker (rising/declining brawlers)
- Dark/Light theme toggle
- Mobile-first with bottom navigation

## Deploy for FREE on Vercel

### Step 1: GitHub
1. Go to github.com and create a free account
2. Click + then New repository
3. Name it: meta-hub
4. Keep it Public
5. Do NOT check any boxes (no README, no gitignore)
6. Click Create repository
7. Click "uploading an existing file"
8. Drag ALL files from this folder into the upload area
9. Click Commit changes

IMPORTANT: package.json must be at the ROOT of your repo, not inside a subfolder.

### Step 2: Vercel
1. Go to vercel.com
2. Sign up with GitHub (free)
3. Click Import Project
4. Select your meta-hub repo
5. Click Deploy
6. Done! Your site is live.

## Project Structure

```
src/
  App.jsx              # Main app shell + pages
  main.jsx             # React entry
  data/
    theme.js           # Design tokens + game config
    scoring.js         # Meta/ban/draft scoring engines
  games/
    brawlstars/
      brawlers.js      # All brawler data
      meta.js          # Modes, maps, comps, patches
    clashroyale/
      cards.js         # Placeholder for expansion
```

## Adding a New Game

1. Create folder: src/games/newgame/
2. Add data files following the brawlstars pattern
3. Add game to GAMES array in src/data/theme.js
4. Import data in App.jsx and add new pages

## Supercell API (Future)

Register at developer.brawlstars.com for live data.
API endpoints: /players, /clubs, /rankings, /brawlers

## Tech Stack

- React 18
- Recharts (charts)
- Vite (build)
- Vercel (hosting)

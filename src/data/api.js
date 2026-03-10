// ================================================================
// API SERVICE LAYER
// Currently returns static data. When ready for live data,
// swap the implementations to fetch from real APIs.
//
// Supercell APIs:
//   Brawl Stars: https://developer.brawlstars.com
//   Clash Royale: https://developer.clashroyale.com
//   Clash of Clans: https://developer.clashofclans.com
//
// All require an API key (free to register).
// Keys must be stored in environment variables, never in client code.
// Use Vercel serverless functions (/api/) to proxy requests.
// ================================================================

// Base config - swap URLs when backend is ready
const API_CONFIG = {
  brawlstars: {
    base: "https://api.brawlstars.com/v1",
    // Future endpoints:
    // GET /brawlers - list all brawlers
    // GET /rankings/{countryCode}/players - top players
    // GET /players/{playerTag} - player profile
    // GET /clubs/{clubTag} - club info
    useStatic: true, // flip to false when API is connected
  },
  clashroyale: {
    base: "https://api.clashroyale.com/v1",
    useStatic: true,
  },
  clashofclans: {
    base: "https://api.clashofclans.com/v1",
    useStatic: true,
  },
};

// Fetch wrapper with error handling
async function apiFetch(game, endpoint) {
  const config = API_CONFIG[game];
  if (!config || config.useStatic) {
    throw new Error("API not configured - using static data");
  }
  // In production, this would go through your Vercel serverless function
  // to keep the API key secret:
  // const res = await fetch(`/api/${game}${endpoint}`);
  // return res.json();
}

// Public API functions - currently return null (static data used instead)
// When API is connected, these return live data
export async function fetchBrawlers() {
  try {
    return await apiFetch("brawlstars", "/brawlers");
  } catch {
    return null; // fall back to static data
  }
}

export async function fetchPlayerProfile(tag) {
  try {
    return await apiFetch("brawlstars", "/players/" + encodeURIComponent(tag));
  } catch {
    return null;
  }
}

export async function fetchTopPlayers(country = "global") {
  try {
    return await apiFetch("brawlstars", "/rankings/" + country + "/players");
  } catch {
    return null;
  }
}

export default API_CONFIG;

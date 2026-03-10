// Game Adapter Registry
// Each game exports a standard interface. UI pages import the registry
// and use the active adapter - making the UI game-agnostic.
//
// To add a new game:
// 1. Create src/games/newgame/adapter.js following this interface
// 2. Import and register it below
// 3. Flip its "active" flag to true

import { BRAWLERS, ROLE_ICONS, brawlerEntries, brawlerNames, allRoles, allBSModes } from "./brawlstars/brawlers";
import { MODES as BS_MODES, MAPS as BS_MAPS, COMPS as BS_COMPS, PATCHES as BS_PATCHES } from "./brawlstars/meta";
import { getMetaScore, getBanScore, getDraftScore } from "../data/scoring";

// Brawl Stars adapter
export const BrawlStarsAdapter = {
  id: "brawlstars",
  name: "Brawl Stars",
  icon: "\u2B50",
  active: true,
  units: BRAWLERS,
  unitEntries: brawlerEntries,
  unitNames: brawlerNames,
  roleIcons: ROLE_ICONS,
  allRoles: allRoles,
  allModes: allBSModes,
  modes: BS_MODES,
  maps: BS_MAPS,
  comps: BS_COMPS,
  patches: BS_PATCHES,
  getMetaScore,
  getBanScore,
  getDraftScore,
  // Visual config
  unitLabel: "Brawler",
  unitsLabel: "Brawlers",
  buildLabel: "Build",
  // SEO
  seoTitle: (page) => page + " - Brawl Stars Meta Hub",
  // API config (future)
  apiBase: "https://api.brawlstars.com/v1",
  apiReady: false,
};

// Clash Royale adapter (placeholder)
export const ClashRoyaleAdapter = {
  id: "clashroyale",
  name: "Clash Royale",
  icon: "\uD83C\uDFF0",
  active: false,
  units: {},
  unitEntries: [],
  unitNames: [],
  roleIcons: {},
  allRoles: [],
  allModes: [],
  modes: [],
  maps: [],
  comps: [],
  patches: [],
  getMetaScore: () => 0,
  getBanScore: () => 0,
  getDraftScore: () => 0,
  unitLabel: "Card",
  unitsLabel: "Cards",
  buildLabel: "Deck",
  seoTitle: (page) => page + " - Clash Royale Meta Hub",
  apiBase: "https://api.clashroyale.com/v1",
  apiReady: false,
};

// Clash of Clans adapter (placeholder)
export const ClashOfClansAdapter = {
  id: "clashofclans",
  name: "Clash of Clans",
  icon: "\u2694\uFE0F",
  active: false,
  units: {},
  unitEntries: [],
  unitNames: [],
  roleIcons: {},
  allRoles: [],
  allModes: [],
  modes: [],
  maps: [],
  comps: [],
  patches: [],
  getMetaScore: () => 0,
  getBanScore: () => 0,
  getDraftScore: () => 0,
  unitLabel: "Troop",
  unitsLabel: "Troops",
  buildLabel: "Army",
  seoTitle: (page) => page + " - Clash of Clans Meta Hub",
  apiBase: "https://api.clashofclans.com/v1",
  apiReady: false,
};

// Registry
export const GAME_REGISTRY = {
  brawlstars: BrawlStarsAdapter,
  clashroyale: ClashRoyaleAdapter,
  clashofclans: ClashOfClansAdapter,
};

export const ACTIVE_GAMES = Object.values(GAME_REGISTRY).filter(g => g.active);
export const ALL_GAMES = Object.values(GAME_REGISTRY);

// Get the currently active game adapter
export function getActiveAdapter(gameId = "brawlstars") {
  return GAME_REGISTRY[gameId] || BrawlStarsAdapter;
}

export default GAME_REGISTRY;

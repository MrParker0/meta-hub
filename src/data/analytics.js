// Lightweight analytics wrapper
// Swap the implementation when you add a real provider (Vercel Analytics, GA, etc.)

const ENABLED = true;
const LOG_TO_CONSOLE = false; // flip for debugging

const events = [];

export function track(eventName, payload = {}) {
  if (!ENABLED) return;
  const event = {
    event: eventName,
    timestamp: Date.now(),
    ...payload,
  };
  events.push(event);
  if (LOG_TO_CONSOLE) {
    console.log("[analytics]", eventName, payload);
  }
  // Future: send to your backend
  // fetch("/api/track", { method: "POST", body: JSON.stringify(event) });
}

// Pre-built event helpers
export const trackPageView = (page) => track("page_view", { page });
export const trackBrawlerView = (name) => track("view_brawler", { name });
export const trackDraftUse = (mode) => track("use_draft", { mode });
export const trackSearch = (query) => track("search", { query });
export const trackBanAdded = (name) => track("ban_added", { name });
export const trackPickAdded = (name) => track("pick_added", { name });

// Get all events (for debugging or future dashboard)
export function getEvents() {
  return [...events];
}

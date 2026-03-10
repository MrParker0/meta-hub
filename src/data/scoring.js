// Meta Score: universal scoring for any character/card/troop
export function getMetaScore(unit) {
  return (unit.winRate * 0.45) + (unit.pickRate * 0.30) + ((unit.banRate || 0) * 0.25);
}

// Ban priority scoring
export function getBanScore(unit) {
  return (getMetaScore(unit) * 0.5) + ((unit.banRate || 0) * 0.3) + (unit.pickRate * 0.2);
}

// Draft pick scoring (mode-aware)
export function getDraftScore(unit, mode, allyModes, isCounter) {
  const TW = {S:10,A:7,B:4,C:2,D:0,F:0};
  const wr = unit.winRate * 0.35;
  const pr = unit.pickRate * 0.15;
  const modeB = (unit.modes || []).includes(mode) ? 8 : 0;
  const syn = allyModes ? (unit.modes || []).filter(m => allyModes.has(m)).length * 2.5 * 0.2 : 0;
  const counter = isCounter ? 10 * 0.2 : 0;
  const tw = (TW[unit.tier] || 0) * 0.1;
  return wr + pr + modeB + syn + counter + tw;
}

// Fuzzy search (works for any string)
export function fuzzy(query, text) {
  const q = query.toLowerCase(), t = text.toLowerCase();
  if (t.includes(q)) return true;
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

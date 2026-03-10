export const DARK = {
  bg:"#0F172A",card:"#1E293B",card2:"#273548",border:"#334155",
  accent:"#22C55E",red:"#EF4444",amber:"#F59E0B",blue:"#3B82F6",
  purple:"#A855F7",cyan:"#06B6D4",pink:"#EC4899",
  text:"#F8FAFC",text2:"#94A3B8",text3:"#64748B",
  S:"#EF4444",A:"#F59E0B",B:"#22C55E",C:"#3B82F6",D:"#A855F7",F:"#64748B",
  navBg:"#0F172Aee"
};
export const LIGHT = {
  bg:"#F1F5F9",card:"#FFFFFF",card2:"#F8FAFC",border:"#E2E8F0",
  accent:"#16A34A",red:"#DC2626",amber:"#D97706",blue:"#2563EB",
  purple:"#7C3AED",cyan:"#0891B2",pink:"#DB2777",
  text:"#0F172A",text2:"#475569",text3:"#94A3B8",
  S:"#DC2626",A:"#D97706",B:"#16A34A",C:"#2563EB",D:"#7C3AED",F:"#94A3B8",
  navBg:"#F1F5F9ee"
};
export const TIERS = ["S","A","B","C","D","F"];
export const TIER_LABELS = {S:"Meta Defining",A:"Excellent",B:"Solid",C:"Situational",D:"Weak",F:"Avoid"};

// Platform config - add new games here
export const GAMES = [
  {id:"brawlstars",name:"Brawl Stars",icon:"\u2B50",active:true,api:"https://api.brawlstars.com/v1"},
  {id:"clashroyale",name:"Clash Royale",icon:"\uD83C\uDFF0",active:false,api:"https://api.clashroyale.com/v1"},
  {id:"clashofclans",name:"Clash of Clans",icon:"\u2694\uFE0F",active:false,api:"https://api.clashofclans.com/v1"},
];

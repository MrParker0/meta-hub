export const MODES = [
  {id:"gg",name:"Gem Grab",icon:"\uD83D\uDC8E",color:"#A855F7",top:["Crow","Spike","Mortis"],bans:["Crow","Sirius","Mortis"],comp:{brawlers:["Crow","Spike","Gray"],strat:"Chip control + area denial + hook displacement"}},
  {id:"bb",name:"Brawl Ball",icon:"\u26BD",color:"#3B82F6",top:["Bibi","Mortis","Bull"],bans:["Bibi","Mortis","Frank"],comp:{brawlers:["Bibi","Mortis","Frank"],strat:"Knockback carrier + dash scorer + stun lockdown"}},
  {id:"he",name:"Heist",icon:"\uD83D\uDD12",color:"#EF4444",top:["Crow","Colt","Sirius"],bans:["Crow","Colt","Bull"],comp:{brawlers:["Colt","Crow","Bull"],strat:"Wall destruction + poison pressure + tank rush"}},
  {id:"ko",name:"Knockout",icon:"\uD83D\uDC80",color:"#F59E0B",top:["Crow","Mortis","Colt"],bans:["Crow","Mortis","Cordelius"],comp:{brawlers:["Crow","Colt","Piper"],strat:"Chip + burst DPS + snipe elimination"}},
  {id:"bo",name:"Bounty",icon:"\u2B50",color:"#8B5CF6",top:["Mortis","Crow","Bea"],bans:["Mortis","Cordelius","Crow"],comp:{brawlers:["Mortis","Bea","Piper"],strat:"Dive assassination + charged burst + long range"}},
  {id:"hz",name:"Hot Zone",icon:"\uD83D\uDD25",color:"#F97316",top:["Spike","Emz","Crow"],bans:["Spike","Emz","Sirius"],comp:{brawlers:["Spike","Emz","Gray"],strat:"Cactus zone + lingering AoE + displacement hook"}},
  {id:"sd",name:"Showdown",icon:"\uD83C\uDFDC\uFE0F",color:"#22C55E",top:["Leon","Crow","Bull"],bans:[],comp:{brawlers:["Leon","Crow","Spike"],strat:"Stealth ambush + chip poison + burst"}},
  {id:"wo",name:"Wipeout",icon:"\uD83D\uDCA5",color:"#EC4899",top:["Mortis","Crow","Emz"],bans:["Mortis","Crow","Bibi"],comp:{brawlers:["Mortis","Crow","Emz"],strat:"Chain kills + constant chip + AoE shred"}},
];

export const MAPS = [
  {name:"Gem Fort",mode:"Gem Grab",best:["Rico","Spike","Mortis"],wr:["Spike","Rico","Emz"],avoid:["Shelly","Bull"]},
  {name:"Satomi Springs",mode:"Gem Grab",best:["Crow","Spike","Emz"],wr:["Crow","Spike","Rico"],avoid:["Bull","Shelly"]},
  {name:"Hard Rock Mine",mode:"Gem Grab",best:["Mortis","Crow","Sirius"],wr:["Mortis","Rico","Emz"],avoid:["Piper","Bea"]},
  {name:"Center Stage",mode:"Brawl Ball",best:["Bibi","Mortis","Bull"],wr:["Bibi","Frank","Crow"],avoid:["Piper","Byron"]},
  {name:"Sneaky Fields",mode:"Brawl Ball",best:["Mortis","Crow","Bibi"],wr:["Crow","Bull","Leon"],avoid:["Piper","Bea"]},
  {name:"Pinball Dreams",mode:"Brawl Ball",best:["Rico","Colt","Bibi"],wr:["Rico","Spike","Emz"],avoid:["Leon","Shelly"]},
  {name:"Aridity",mode:"Heist",best:["Colt","Crow","Sirius"],wr:["Colt","Bull","Nita"],avoid:["Poco","Byron"]},
  {name:"Hot Potato",mode:"Heist",best:["Crow","Colt","Bull"],wr:["Nita","Colt","Crow"],avoid:["Mortis","Piper"]},
  {name:"Pinned Down",mode:"Knockout",best:["Crow","Mortis","Colt"],wr:["Piper","Bea","Cordelius"],avoid:["Bull","Frank"]},
  {name:"Skull Creek",mode:"Showdown",best:["Leon","Crow","Bull"],wr:["Shelly","Leon","Surge"],avoid:["Piper","Byron"]},
  {name:"Super Center",mode:"Hot Zone",best:["Spike","Emz","Crow"],wr:["Spike","Gray","Frank"],avoid:["Piper","Leon"]},
  {name:"Penalty Kick",mode:"Brawl Ball",best:["Bibi","Bull","Mortis"],wr:["Frank","Bibi","Crow"],avoid:["Piper","Byron"]},
  {name:"Acid Lakes",mode:"Showdown",best:["Crow","Leon","Shelly"],wr:["Leon","Surge","Bull"],avoid:["Piper","Byron"]},
];

export const COMPS = [
  {name:"Assassin Rush",desc:"Dash dive + poison chip + knockback carry.",brawlers:["Mortis","Crow","Bibi"],modes:["Brawl Ball","Gem Grab","Wipeout"],banSwaps:{Mortis:"Fang",Crow:"Leon",Bibi:"Bull"},strength:"Devastating dive pressure",weakness:"Outranged by snipers"},
  {name:"Zone Fortress",desc:"Layered area denial nobody can contest.",brawlers:["Spike","Emz","Gray"],modes:["Hot Zone","Gem Grab"],banSwaps:{Spike:"Rico",Emz:"Crow",Gray:"Frank"},strength:"Total zone ownership",weakness:"Vulnerable to coordinated dives"},
  {name:"Safe Demolition",desc:"Pure safe DPS with wall destruction.",brawlers:["Colt","Crow","Bull"],modes:["Heist"],banSwaps:{Colt:"Rico",Crow:"Sirius",Bull:"Nita"},strength:"Fastest safe destruction",weakness:"Fragile if pushed back"},
  {name:"Elimination Squad",desc:"Pick specialists for star collection.",brawlers:["Mortis","Bea","Piper"],modes:["Bounty","Knockout"],banSwaps:{Mortis:"Cordelius",Bea:"Crow",Piper:"Mandy"},strength:"One-shot chain kills",weakness:"No sustain or healing"},
  {name:"Iron Wall",desc:"Immovable zone control with tank synergy.",brawlers:["Frank","Gray","Crow"],modes:["Hot Zone","Brawl Ball"],banSwaps:{Frank:"Bull",Gray:"Emz",Crow:"Spike"},strength:"Cannot be displaced from zone",weakness:"Kited by mobile brawlers"},
  {name:"Shadow Swarm",desc:"Shadow clones + healing overwhelms defenses.",brawlers:["Sirius","Byron","Crow"],modes:["Gem Grab","Heist"],banSwaps:{Sirius:"Spike",Byron:"Poco",Crow:"Emz"},strength:"Relentless shadow pressure",weakness:"Depends on shadow management"},
];

export const PATCHES = [
  {version:"March 2026",buffs:[{name:"Crow",detail:"Piercing + returning daggers"},{name:"Bibi",detail:"Restored competitive stats"},{name:"Leon",detail:"Stealth duration increase"},{name:"Bull",detail:"Tank survivability up"},{name:"Nita",detail:"Bear HP increased"},{name:"Bo",detail:"Vision + mine improvements"}],nerfs:[{name:"Emz",detail:"Slight damage adjustment"},{name:"Otis",detail:"Super charge rate reduced"}]},
  {version:"February 2026",buffs:[{name:"Sirius",detail:"Launch with strong base stats"},{name:"Mortis",detail:"Super dash chain speed"},{name:"Cordelius",detail:"Mushroom spawn rate up"}],nerfs:[{name:"Charlie",detail:"HP reduction"},{name:"Melodie",detail:"Shield duration reduced"}]},
  {version:"January 2026",buffs:[{name:"Rico",detail:"Unload speed improvement"},{name:"Poco",detail:"Super charge rate up"},{name:"Frank",detail:"Sponge rework"}],nerfs:[{name:"Lily",detail:"Damage reduced"},{name:"Otis",detail:"Super charge nerf"}]},
];

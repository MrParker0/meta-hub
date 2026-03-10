import { useState, useMemo, memo, useEffect, Component } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";
import { DARK, LIGHT, TIERS, TIER_LABELS, GAMES } from "./data/theme";
import { getMetaScore, getBanScore, getDraftScore, fuzzy } from "./data/scoring";
import { trackPageView, trackBrawlerView, trackDraftUse, trackSearch } from "./data/analytics";
import { BRAWLERS, ROLE_ICONS, brawlerEntries, brawlerNames, allRoles, allBSModes } from "./games/brawlstars/brawlers";
import { MODES as BS_MODES, MAPS as BS_MAPS, COMPS as BS_COMPS, PATCHES as BS_PATCHES } from "./games/brawlstars/meta";

const ri = (r) => ROLE_ICONS[r] || "\u26A1";

// ================================================================
// ERROR BOUNDARY (prevents white-screen crashes)
// ================================================================
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      const T = DARK;
      return <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div style={{textAlign:"center",color:T.text}}>
          <div style={{fontSize:40,marginBottom:12}}>{"Something went wrong"}</div>
          <p style={{color:T.text2,marginBottom:16}}>Try refreshing the page</p>
          <button onClick={() => window.location.reload()} style={{padding:"10px 20px",borderRadius:8,background:T.accent,border:"none",color:"#fff",cursor:"pointer",fontSize:14,fontWeight:700}}>Refresh</button>
        </div>
      </div>;
    }
    return this.props.children;
  }
}

// ================================================================
// FEATURE FLAGS (toggle features without redeploying)
// ================================================================
const FLAGS = {
  showAds: false,           // flip to true when AdSense is ready
  showClashRoyale: false,   // flip when CR data is added
  showClashOfClans: false,  // flip when CoC data is added
  showDraftScores: true,    // show point scores in draft suggestions
  showBanScores: true,      // show ban scores in modes
  showTrendArrows: true,    // show trending up/down arrows
  maxLeaderboard: 10,       // how many in power rankings
};

// ================================================================
// UI PRIMITIVES
// ================================================================
function PB({pct, color, h=6}) {
  return <div style={{background:"rgba(0,0,0,0.25)",borderRadius:h/2,height:h,width:"100%",overflow:"hidden"}}><div style={{width:Math.min(pct,100)+"%",height:"100%",background:color,borderRadius:h/2,transition:"width 0.5s"}}/></div>;
}
const Pl = memo(function Pl({children, color, bg}) {
  return <span style={{fontSize:10,padding:"2px 8px",background:bg,color,borderRadius:12,fontWeight:600,whiteSpace:"nowrap",display:"inline-block"}}>{children}</span>;
});
const TB = memo(function TB({t, T}) {
  return <span style={{fontSize:11,fontWeight:800,padding:"2px 8px",borderRadius:4,background:(T[t]||T.text3)+"22",color:T[t]||T.text3,display:"inline-block"}}>{t}</span>;
});
function Cd({children, T, style:s={}, onClick}) {
  const [h, setH] = useState(false);
  return <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} onClick={onClick} style={{background:T.card,borderRadius:12,border:"1px solid "+(h&&onClick?T.accent+"55":T.border),padding:16,transition:"all 0.2s",cursor:onClick?"pointer":"default",transform:h&&onClick?"translateY(-2px)":"none",...s}}>{children}</div>;
}
function Trend({trend, T}) {
  if (trend === "up") return <span style={{color:T.accent,fontSize:10,fontWeight:700}}>{"\u2191"}</span>;
  if (trend === "down") return <span style={{color:T.red,fontSize:10,fontWeight:700}}>{"\u2193"}</span>;
  return <span style={{color:T.text3,fontSize:10}}>{"\u2192"}</span>;
}
function AdZone({T}) {
  if (!FLAGS.showAds) return null;
  return <div style={{background:T.card2,border:"1px dashed "+T.border,borderRadius:8,padding:"10px 16px",textAlign:"center",margin:"14px 0"}}><span style={{fontSize:8,color:T.text3}}>Ad Space</span></div>;
}

// ================================================================
// BRAWLER CARD
// ================================================================
const BC = memo(function BC({name, compact, onClick, T}) {
  const d = BRAWLERS[name]; if (!d) return null;
  const ms = getMetaScore(d).toFixed(1);
  if (compact) return <Cd T={T} onClick={onClick} style={{padding:10,textAlign:"center",minWidth:80}}>
    <div style={{fontSize:22}}>{ri(d.role)}</div>
    <div style={{fontSize:11,fontWeight:700,color:T.text}}>{name}</div>
    <TB t={d.tier} T={T}/><div style={{fontSize:9,color:T.accent,marginTop:2}}>{ms}</div>
  </Cd>;
  return <Cd T={T} onClick={onClick}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:26}}>{ri(d.role)}</span>
        <div><div style={{fontSize:15,fontWeight:700,color:T.text}}>{name}</div><div style={{fontSize:10,color:T.text3}}>{d.rarity} {d.role}</div></div>
      </div>
      <div style={{textAlign:"right"}}><TB t={d.tier} T={T}/><div style={{fontSize:9,color:T.accent,marginTop:2}}>{ms} <Trend trend={d.trend} T={T}/></div></div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4,marginBottom:8}}>
      {[["WR",d.winRate,d.winRate>=55?T.accent:d.winRate>=50?T.amber:T.red],["PR",d.pickRate,T.blue],["BAN",d.banRate,T.red]].map(([l,v,c]) => <div key={l} style={{background:T.bg,borderRadius:6,padding:"4px 6px",textAlign:"center"}}><div style={{fontSize:8,color:T.text3}}>{l}</div><div style={{fontSize:14,fontWeight:800,color:c}}>{v}%</div></div>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:3,fontSize:10,marginBottom:6}}>
      <div><span style={{color:T.text3}}>G </span><span style={{color:T.pink,fontWeight:600}}>{d.builds.gadget.name}</span></div>
      <div><span style={{color:T.text3}}>SP </span><span style={{color:T.amber,fontWeight:600}}>{d.builds.starPower.name}</span></div>
    </div>
    {d.builds.gears.map(g => <div key={g.name} style={{marginBottom:2}}><div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:T.text3}}><span>{g.name}</span><span>{g.usage}%</span></div><PB pct={g.usage} color={T.accent}/></div>)}
    {d.buffie && <div style={{marginTop:6,fontSize:9,padding:"3px 7px",background:T.accent+"12",borderRadius:5,color:T.accent,border:"1px solid "+T.accent+"33"}}>{"\uD83D\uDD25"} {d.buffie}</div>}
  </Cd>;
});

// ================================================================
// MODAL
// ================================================================
function Mdl({name, onClose, T}) {
  const d = BRAWLERS[name]; if (!d) return null;
  const ms = getMetaScore(d).toFixed(1);
  return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
    <div onClick={e => e.stopPropagation()} style={{background:T.card,borderRadius:16,padding:20,maxWidth:460,width:"100%",maxHeight:"85vh",overflowY:"auto",border:"1px solid "+T.border}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:34}}>{ri(d.role)}</span>
          <div><div style={{fontSize:20,fontWeight:800,color:T.text}}>{name}</div><div style={{fontSize:11,color:T.text3}}>{d.rarity} {d.role}</div></div>
        </div>
        <button onClick={onClose} style={{background:T.card2,border:"none",color:T.text3,borderRadius:8,width:30,height:30,cursor:"pointer",fontSize:14}}>X</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:4,marginBottom:12}}>
        {[["WR",d.winRate+"%",T.accent],["PR",d.pickRate+"%",T.blue],["BAN",d.banRate+"%",T.red],["META",ms,T.purple]].map(([l,v,c]) => <div key={l} style={{background:T.bg,borderRadius:6,padding:6,textAlign:"center"}}><div style={{fontSize:7,color:T.text3}}>{l}</div><div style={{fontSize:14,fontWeight:800,color:c}}>{v}</div></div>)}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:10}}><Trend trend={d.trend} T={T}/><span style={{fontSize:10,color:T.text3}}>Prev: {d.prevWR}% ({d.winRate>=d.prevWR?"+":""}{d.winRate-d.prevWR}%)</span></div>
      <div style={{background:T.bg,borderRadius:10,padding:12,marginBottom:10}}>
        <div style={{fontSize:10,color:T.text3,fontWeight:700,marginBottom:6}}>BUILD ({d.builds.count} sources)</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[["GADGET",d.builds.gadget,T.pink],["STAR POWER",d.builds.starPower,T.amber]].map(([l,item,c]) => <div key={l}><div style={{fontSize:8,color:T.text3}}>{l}</div><div style={{fontSize:12,fontWeight:600,color:c}}>{item.name}</div><PB pct={item.usage} color={c} h={4}/><div style={{fontSize:8,color:T.text3}}>{item.usage}%</div></div>)}
        </div>
        <div style={{marginTop:8}}>{d.builds.gears.map(g => <div key={g.name} style={{marginBottom:3}}><div style={{display:"flex",justifyContent:"space-between",fontSize:10}}><span style={{color:T.text2}}>{g.name}</span><span style={{color:T.accent,fontWeight:600}}>{g.usage}%</span></div><PB pct={g.usage} color={T.accent} h={4}/></div>)}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
        <div><div style={{fontSize:10,color:T.text3,fontWeight:700,marginBottom:3}}>BEST MODES</div><div style={{display:"flex",flexWrap:"wrap",gap:3}}>{d.modes.map(m => <Pl key={m} color={T.cyan} bg={T.cyan+"18"}>{m}</Pl>)}</div></div>
        <div><div style={{fontSize:10,color:T.text3,fontWeight:700,marginBottom:3}}>SYNERGIES</div><div style={{display:"flex",flexWrap:"wrap",gap:3}}>{d.synergies.map(s => <Pl key={s} color={T.accent} bg={T.accent+"18"}>{s}</Pl>)}</div></div>
      </div>
      <div style={{fontSize:10,color:T.text3,fontWeight:700,marginBottom:3}}>COUNTERED BY</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:3}}>{d.counters.map(c => <Pl key={c} color={T.red} bg={T.red+"18"}>{c}</Pl>)}</div>
      {d.buffie && <div style={{marginTop:10,padding:"6px 10px",background:T.accent+"12",borderRadius:8,border:"1px solid "+T.accent+"33",fontSize:11,color:T.accent}}>{"\uD83D\uDD25"} {d.buffie}</div>}
    </div>
  </div>;
}

// ================================================================
// PAGES
// ================================================================
function Home({nav, setM, T}) {
  const scored = useMemo(() => [...brawlerEntries].map(([n,d]) => ({n,...d,score:getMetaScore(d)})).sort((a,b) => b.score-a.score), []);
  const wrC = useMemo(() => [...brawlerEntries].sort((a,b) => b[1].winRate-a[1].winRate).slice(0,8).map(([n,d]) => ({name:n,wr:d.winRate})), []);
  const trending = useMemo(() => [...brawlerEntries].filter(([,d]) => d.trend==="up").sort((a,b) => (b[1].winRate-b[1].prevWR)-(a[1].winRate-a[1].prevWR)), []);
  const declining = useMemo(() => [...brawlerEntries].filter(([,d]) => d.trend==="down"), []);
  return <div>
    <div style={{background:"linear-gradient(135deg,"+T.accent+"12,"+T.purple+"10,"+T.blue+"08)",borderRadius:16,padding:"28px 20px",marginBottom:20,border:"1px solid "+T.accent+"22"}}>
      <div style={{fontSize:10,color:T.accent,fontWeight:700,letterSpacing:2}}>COMPETITIVE GAMING ANALYTICS</div>
      <h1 style={{fontSize:24,fontWeight:900,color:T.text,margin:"4px 0 6px",lineHeight:1.2}}>Meta Hub</h1>
      <p style={{fontSize:11,color:T.text2,margin:0,maxWidth:300}}>Original competitive analysis for Brawl Stars. Tier lists, builds, ranked comps, draft simulator, and meta scoring.</p>
      <div style={{display:"flex",gap:8,marginTop:12}}>
        <button onClick={() => nav("builds")} style={{padding:"8px 16px",borderRadius:8,fontSize:12,fontWeight:700,background:T.accent,border:"none",color:"#fff",cursor:"pointer"}}>Builds</button>
        <button onClick={() => nav("draft")} style={{padding:"8px 16px",borderRadius:8,fontSize:12,fontWeight:700,background:"transparent",border:"1px solid "+T.accent,color:T.accent,cursor:"pointer"}}>Draft Sim</button>
      </div>
      <div style={{display:"flex",gap:6,marginTop:12}}>
        {GAMES.map(g => <Pl key={g.id} color={g.active?T.accent:T.text3} bg={g.active?T.accent+"18":T.card2}>{g.icon} {g.name}{g.active?"":" (Soon)"}</Pl>)}
      </div>
    </div>
    <h2 style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:8}}>{"\uD83C\uDFC6"} Meta Power Rankings</h2>
    <Cd T={T} style={{marginBottom:14,padding:10}}>
      {scored.slice(0,10).map((b,i) => <div key={b.n} onClick={() => setM(b.n)} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 0",borderBottom:i<9?"1px solid "+T.border+"22":"none",cursor:"pointer"}}>
        <span style={{fontSize:13,fontWeight:800,color:i<3?T.accent:T.text3,minWidth:20}}>#{i+1}</span>
        <span style={{fontSize:16}}>{ri(b.role)}</span>
        <span style={{fontSize:12,fontWeight:700,color:T.text,flex:1}}>{b.n}</span>
        <TB t={b.tier} T={T}/>
        <span style={{fontSize:10,color:T.purple,fontWeight:700,minWidth:28}}>{b.score.toFixed(1)}</span>
        <Trend trend={b.trend} T={T}/>
      </div>)}
    </Cd>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
      <Cd T={T} style={{padding:10}}><div style={{fontSize:10,fontWeight:700,color:T.accent,marginBottom:4}}>{"\u2191"} Rising</div>
        {trending.slice(0,4).map(([n,d]) => <div key={n} onClick={() => setM(n)} style={{display:"flex",justifyContent:"space-between",fontSize:10,cursor:"pointer",marginBottom:2}}><span style={{color:T.text,fontWeight:600}}>{n}</span><span style={{color:T.accent}}>+{d.winRate-d.prevWR}%</span></div>)}
      </Cd>
      <Cd T={T} style={{padding:10}}><div style={{fontSize:10,fontWeight:700,color:T.red,marginBottom:4}}>{"\u2193"} Declining</div>
        {declining.slice(0,4).map(([n,d]) => <div key={n} onClick={() => setM(n)} style={{display:"flex",justifyContent:"space-between",fontSize:10,cursor:"pointer",marginBottom:2}}><span style={{color:T.text,fontWeight:600}}>{n}</span><span style={{color:T.red}}>{d.winRate-d.prevWR}%</span></div>)}
      </Cd>
    </div>
    <AdZone T={T}/>
    <Cd T={T} style={{padding:10,marginBottom:14}}><div style={{fontSize:10,fontWeight:700,color:T.text,marginBottom:6}}>Top Win Rates</div>
      <ResponsiveContainer width="100%" height={130}><BarChart data={wrC}><XAxis dataKey="name" tick={{fontSize:7,fill:T.text3}} axisLine={false} tickLine={false}/><YAxis hide domain={[35,70]}/><Tooltip contentStyle={{background:T.card,border:"1px solid "+T.border,borderRadius:8,fontSize:10}}/><Bar dataKey="wr" radius={[3,3,0,0]}>{wrC.map((e,i) => <Cell key={i} fill={e.wr>=55?T.accent:e.wr>=50?T.amber:T.red}/>)}</Bar></BarChart></ResponsiveContainer>
    </Cd>
    <h2 style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:8}}>Modes</h2>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:6,marginBottom:14}}>
      {BS_MODES.slice(0,6).map(m => <Cd key={m.id} T={T} onClick={() => nav("modes")} style={{padding:10}}><div style={{fontSize:16}}>{m.icon}</div><div style={{fontSize:11,fontWeight:700,color:T.text}}>{m.name}</div><div style={{fontSize:9,color:T.text3,marginTop:2}}>{m.top.join(", ")}</div></Cd>)}
    </div>
    <h2 style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:8}}>Patches</h2>
    {BS_PATCHES.map(p => <Cd key={p.version} T={T} style={{marginBottom:6,padding:10}}>
      <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:4}}>{p.version}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <div><div style={{fontSize:9,fontWeight:700,color:T.accent,marginBottom:2}}>BUFFS</div>{p.buffs.map(b => <div key={b.name} style={{fontSize:9,color:T.text2,marginBottom:1}}><span style={{color:T.text,fontWeight:600}}>{b.name}</span> {b.detail}</div>)}</div>
        <div><div style={{fontSize:9,fontWeight:700,color:T.red,marginBottom:2}}>NERFS</div>{p.nerfs.map(b => <div key={b.name} style={{fontSize:9,color:T.text2,marginBottom:1}}><span style={{color:T.text,fontWeight:600}}>{b.name}</span> {b.detail}</div>)}</div>
      </div>
    </Cd>)}
  </div>;
}

function Builds({setM, T}) {
  const [q, setQ] = useState(""); const [ft, setFt] = useState("All"); const [fr, setFr] = useState("All"); const [fm, setFm] = useState("All"); const [sort, setSort] = useState("score");
  const filtered = useMemo(() => [...brawlerEntries].filter(([n,d]) => {if(q&&!fuzzy(q,n))return false;if(ft!=="All"&&d.tier!==ft)return false;if(fr!=="All"&&d.role!==fr)return false;if(fm!=="All"&&!d.modes.includes(fm))return false;return true;}).sort((a,b) => sort==="score"?getMetaScore(b[1])-getMetaScore(a[1]):sort==="wr"?b[1].winRate-a[1].winRate:b[1].pickRate-a[1].pickRate), [q,ft,fr,fm,sort]);
  const FR = ({l,v,fn,opts}) => <div style={{display:"flex",gap:2,flexWrap:"wrap",alignItems:"center"}}><span style={{fontSize:9,color:T.text3,minWidth:28}}>{l}</span>{opts.map(o => <button key={o} onClick={() => fn(o)} style={{padding:"3px 7px",borderRadius:5,fontSize:9,cursor:"pointer",fontWeight:v===o?700:400,background:v===o?(T[o]||T.accent)+"18":"transparent",border:"1px solid "+(v===o?(T[o]||T.accent)+"44":T.border+"44"),color:v===o?(T[o]||T.accent):T.text3}}>{o}</button>)}</div>;
  return <div>
    <h2 style={{fontSize:18,fontWeight:800,color:T.text,marginBottom:10}}>Builds</h2>
    <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..." style={{width:"100%",padding:"9px 12px",fontSize:12,background:T.card,border:"1px solid "+T.border,borderRadius:8,color:T.text,outline:"none",marginBottom:8,boxSizing:"border-box"}}/>
    <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:8}}><FR l="Tier" v={ft} fn={setFt} opts={["All","S","A","B","C","D"]}/><FR l="Role" v={fr} fn={setFr} opts={["All",...allRoles]}/><FR l="Mode" v={fm} fn={setFm} opts={["All",...allBSModes]}/></div>
    <div style={{display:"flex",gap:3,marginBottom:8}}><span style={{fontSize:9,color:T.text3}}>Sort:</span>{[["score","Score"],["wr","WR"],["pr","PR"]].map(([k,l]) => <button key={k} onClick={() => setSort(k)} style={{padding:"3px 7px",borderRadius:4,fontSize:9,cursor:"pointer",background:sort===k?T.accent+"18":"transparent",border:"1px solid "+(sort===k?T.accent+"44":T.border+"33"),color:sort===k?T.accent:T.text3,fontWeight:sort===k?700:400}}>{l}</button>)}</div>
    <div style={{fontSize:9,color:T.text3,marginBottom:6}}>{filtered.length} results</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:8}}>{filtered.map(([n]) => <BC key={n} name={n} T={T} onClick={() => setM(n)}/>)}</div>
    <AdZone T={T}/>
  </div>;
}

function TierList({setM, T}) {
  const g = useMemo(() => {const r={};TIERS.forEach(t => r[t]=[]);brawlerEntries.forEach(([n,d]) => {if(r[d.tier])r[d.tier].push(n)});return r;}, []);
  return <div>
    <h2 style={{fontSize:18,fontWeight:800,color:T.text,marginBottom:4}}>Tier List</h2>
    <p style={{fontSize:10,color:T.text3,marginBottom:14}}>Original analysis - March 2026</p>
    {TIERS.map(t => {const ns=g[t];if(!ns||!ns.length)return null;return <div key={t} style={{marginBottom:12}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><span style={{fontSize:20,fontWeight:900,color:T[t]}}>{t}</span><span style={{fontSize:10,color:T.text3}}>{TIER_LABELS[t]}</span><div style={{height:1,flex:1,background:T[t]+"33"}}/></div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{ns.map(n => <BC key={n} name={n} compact T={T} onClick={() => setM(n)}/>)}</div>
    </div>;})}
  </div>;
}

function ModesP({setM, T}) {
  const [s, setS] = useState(0); const m = BS_MODES[s];
  return <div>
    <h2 style={{fontSize:18,fontWeight:800,color:T.text,marginBottom:10}}>Mode Meta</h2>
    <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:14}}>{BS_MODES.map((mo,i) => <button key={mo.id} onClick={() => setS(i)} style={{padding:"5px 10px",borderRadius:7,fontSize:10,cursor:"pointer",border:s===i?"2px solid "+mo.color:"2px solid "+T.border,background:s===i?mo.color+"12":"transparent",color:s===i?mo.color:T.text3,fontWeight:s===i?700:400}}>{mo.icon} {mo.name}</button>)}</div>
    <h3 style={{margin:"0 0 10px",fontSize:15,fontWeight:800,color:m.color,borderLeft:"3px solid "+m.color,paddingLeft:10}}>{m.icon} {m.name}</h3>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:8,marginBottom:12}}>{m.top.map((n,i) => <Cd key={n} T={T} onClick={() => setM(n)}><div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:16}}>{["\uD83E\uDD47","\uD83E\uDD48","\uD83E\uDD49"][i]}</span><span style={{fontSize:13,fontWeight:700,color:T.text}}>{n}</span><TB t={BRAWLERS[n]?.tier} T={T}/></div><div style={{fontSize:9,color:T.text2,marginTop:3}}>{BRAWLERS[n]?.builds.gadget.name} + {BRAWLERS[n]?.builds.starPower.name}</div></Cd>)}</div>
    {m.bans.length>0 && <Cd T={T} style={{marginBottom:8,padding:12}}><div style={{fontSize:11,fontWeight:700,color:T.red,marginBottom:4}}>Bans</div><div style={{display:"flex",gap:3}}>{m.bans.map(b => <Pl key={b} color={T.red} bg={T.red+"15"}>{b}</Pl>)}</div></Cd>}
    <Cd T={T} style={{padding:12}}><div style={{fontSize:11,fontWeight:700,color:T.accent,marginBottom:4}}>Best Comp</div><div style={{display:"flex",gap:3,marginBottom:4}}>{m.comp.brawlers.map(b => <Pl key={b} color={T.accent} bg={T.accent+"15"}>{b}</Pl>)}</div><div style={{fontSize:10,color:T.text2}}>{m.comp.strat}</div></Cd>
  </div>;
}

function MapsP({setM, T}) {
  const [f, setF] = useState("All");
  const ms = useMemo(() => ["All",...new Set(BS_MAPS.map(m => m.mode))], []);
  const fl = useMemo(() => f==="All"?BS_MAPS:BS_MAPS.filter(m => m.mode===f), [f]);
  return <div>
    <h2 style={{fontSize:18,fontWeight:800,color:T.text,marginBottom:10}}>Map Meta</h2>
    <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:14}}>{ms.map(m => <button key={m} onClick={() => setF(m)} style={{padding:"4px 9px",borderRadius:6,fontSize:10,cursor:"pointer",border:"1px solid "+(f===m?T.accent+"55":T.border),background:f===m?T.accent+"12":"transparent",color:f===m?T.accent:T.text3,fontWeight:f===m?700:400}}>{m}</button>)}</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:8}}>{fl.map(map => <Cd key={map.name} T={T}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontWeight:700,fontSize:13,color:T.text}}>{map.name}</span><Pl color={T.cyan} bg={T.cyan+"12"}>{map.mode}</Pl></div>
      {[["META",map.best,T.amber],["WR",map.wr,T.accent],["AVOID",map.avoid,T.red]].map(([l,items,c]) => items&&items.length>0&&<div key={l} style={{marginBottom:4}}><div style={{fontSize:8,color:T.text3,marginBottom:2}}>{l}</div><div style={{display:"flex",gap:2,flexWrap:"wrap"}}>{items.map((b,i) => <span key={b} onClick={() => BRAWLERS[b]&&setM(b)} style={{fontSize:9,fontWeight:600,color:l==="META"&&i===0?T.amber:c,padding:"2px 5px",background:T.bg,borderRadius:3,border:"1px solid "+c+"22",cursor:BRAWLERS[b]?"pointer":"default"}}>{l==="META"&&i===0?"\uD83D\uDC51 ":""}{b}</span>)}</div></div>)}
    </Cd>)}</div>
  </div>;
}

function RankedP({setM, T}) {
  const [s, setS] = useState(0); const c = BS_COMPS[s];
  return <div>
    <h2 style={{fontSize:18,fontWeight:800,color:T.text,marginBottom:10}}>Ranked</h2>
    <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:14}}>{BS_COMPS.map((co,i) => <button key={co.name} onClick={() => setS(i)} style={{padding:"5px 10px",borderRadius:7,fontSize:10,cursor:"pointer",fontWeight:s===i?700:400,border:"1px solid "+(s===i?T.red+"55":"transparent"),background:s===i?T.red+"12":T.card,color:s===i?T.red:T.text2}}>{co.name}</button>)}</div>
    <Cd T={T}>
      <h3 style={{margin:"0 0 3px",fontSize:15,fontWeight:800,color:T.red}}>{c.name}</h3>
      <p style={{fontSize:11,color:T.text2,margin:"0 0 8px"}}>{c.desc}</p>
      <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:10}}>{c.modes.map(m => <Pl key={m} color={T.cyan} bg={T.cyan+"15"}>{m}</Pl>)}</div>
      {c.brawlers.map(b => <Cd key={b} T={T} onClick={() => setM(b)} style={{marginBottom:6,background:T.bg,padding:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:3}}>
          <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:13,fontWeight:700,color:T.text}}>{b}</span><TB t={BRAWLERS[b]?.tier} T={T}/></div>
          <span style={{fontSize:9,color:T.text3}}>Ban: <span style={{color:T.amber,fontWeight:600}}>{c.banSwaps[b]}</span></span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:3,fontSize:9,marginTop:3}}>
          <div><span style={{color:T.text3}}>G </span><span style={{color:T.pink,fontWeight:600}}>{BRAWLERS[b]?.builds.gadget.name}</span></div>
          <div><span style={{color:T.text3}}>SP </span><span style={{color:T.amber,fontWeight:600}}>{BRAWLERS[b]?.builds.starPower.name}</span></div>
        </div>
      </Cd>)}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginTop:6}}>
        <div style={{background:T.accent+"10",borderRadius:6,padding:"6px 8px",border:"1px solid "+T.accent+"22"}}><div style={{fontSize:9,color:T.accent,fontWeight:700}}>STRENGTH</div><div style={{fontSize:10,color:T.text2}}>{c.strength}</div></div>
        <div style={{background:T.red+"10",borderRadius:6,padding:"6px 8px",border:"1px solid "+T.red+"22"}}><div style={{fontSize:9,color:T.red,fontWeight:700}}>WEAKNESS</div><div style={{fontSize:10,color:T.text2}}>{c.weakness}</div></div>
      </div>
    </Cd>
  </div>;
}

function DraftP({setM, T}) {
  const [mode, setMode] = useState(null); const [bans, setBans] = useState([]); const [picks, setPicks] = useState([]); const [enemy, setEnemy] = useState([]);
  const phase = !mode?"mode":bans.length<2?"ban":picks.length<3?"pick":"done";
  const taken = useMemo(() => new Set([...bans,...picks,...enemy]), [bans,picks,enemy]);
  const avail = useMemo(() => brawlerNames.filter(n => !taken.has(n)), [taken]);
  const reset = () => {setMode(null);setBans([]);setPicks([]);setEnemy([]);};
  const sugg = useMemo(() => {
    if (!mode||picks.length>=3) return [];
    const ec = new Set(enemy.flatMap(e => BRAWLERS[e]?.counters||[]));
    const am = new Set(picks.flatMap(p => BRAWLERS[p]?.modes||[]));
    return avail.map(n => {const d=BRAWLERS[n];if(!d)return null;const sc=getDraftScore(d,mode,am,ec.has(n))+(ec.has(n)?10:0)-(enemy.some(e => d.counters.includes(e))?5:0);return{name:n,score:sc,counter:ec.has(n)};}).filter(Boolean).sort((a,b) => b.score-a.score).slice(0,6);
  }, [mode,picks,enemy,avail]);

  if (phase==="mode") return <div><h2 style={{fontSize:18,fontWeight:800,color:T.text,marginBottom:10}}>Draft Simulator</h2>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:6}}>{BS_MODES.filter(m => m.bans.length>0).map(m => <Cd key={m.id} T={T} onClick={() => setMode(m.name)} style={{padding:12,textAlign:"center"}}><div style={{fontSize:26}}>{m.icon}</div><div style={{fontSize:12,fontWeight:700,color:T.text,marginTop:3}}>{m.name}</div></Cd>)}</div></div>;

  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><h2 style={{fontSize:18,fontWeight:800,color:T.text,margin:0}}>Draft - {mode}</h2><button onClick={reset} style={{padding:"5px 10px",borderRadius:5,fontSize:10,background:T.card,border:"1px solid "+T.border,color:T.text3,cursor:"pointer"}}>Reset</button></div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:12}}>
      {[["BANS",bans,2,T.red],["PICKS",picks,3,T.accent],["ENEMY",enemy,3,T.purple]].map(([l,a,mx,c]) => <Cd key={l} T={T} style={{padding:8,background:c+"10",borderColor:c+"33"}}><div style={{fontSize:8,color:c,fontWeight:700}}>{l} ({a.length}/{mx})</div><div style={{display:"flex",gap:2,marginTop:3,flexWrap:"wrap"}}>{a.map(b => <Pl key={b} color={c} bg={c+"22"}>{b}</Pl>)}</div></Cd>)}
    </div>
    {phase==="pick"&&sugg.length>0&&<div style={{marginBottom:10}}><div style={{fontSize:10,color:T.amber,fontWeight:700,marginBottom:4}}>AI Suggestions</div><div style={{display:"flex",gap:4,overflowX:"auto",paddingBottom:3}}>{sugg.map(s => <Cd key={s.name} T={T} onClick={() => setPicks(p => [...p,s.name])} style={{padding:8,textAlign:"center",minWidth:70,background:s.counter?T.accent+"15":T.card}}><div style={{fontSize:18}}>{ri(BRAWLERS[s.name]?.role)}</div><div style={{fontSize:9,fontWeight:700,color:T.text}}>{s.name}</div><div style={{fontSize:8,color:T.accent}}>{s.score.toFixed(0)}pts</div>{s.counter&&<div style={{fontSize:7,color:T.amber}}>COUNTER</div>}</Cd>)}</div></div>}
    <div style={{fontSize:11,fontWeight:700,color:phase==="ban"?T.red:T.accent,marginBottom:6}}>{phase==="ban"?"Tap to ban":phase==="pick"?"Tap to pick":"Draft complete!"}</div>
    {phase!=="done"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(65px,1fr))",gap:3,marginBottom:10}}>{avail.map(n => <div key={n} onClick={() => {if(phase==="ban"&&bans.length<2)setBans(p => [...p,n]);else if(phase==="pick"&&picks.length<3)setPicks(p => [...p,n]);}} style={{background:T.card,borderRadius:5,padding:5,textAlign:"center",cursor:"pointer",border:"1px solid "+T.border,fontSize:8,fontWeight:600,color:T.text}}><TB t={BRAWLERS[n]?.tier} T={T}/><div style={{marginTop:1}}>{n}</div></div>)}</div>}
    {phase!=="done"&&<div><div style={{fontSize:9,color:T.purple,fontWeight:700,marginBottom:3}}>Enemy picks:</div><div style={{display:"flex",flexWrap:"wrap",gap:2}}>{avail.map(n => <button key={n} onClick={() => setEnemy(p => p.length<3?[...p,n]:p)} style={{padding:"2px 5px",fontSize:8,borderRadius:3,background:T.purple+"10",border:"1px solid "+T.purple+"22",color:T.purple,cursor:"pointer"}}>{n}</button>)}</div></div>}
    {phase==="done"&&<Cd T={T} style={{marginTop:10,background:T.accent+"10",borderColor:T.accent+"33"}}><div style={{fontSize:13,fontWeight:700,color:T.accent,marginBottom:6}}>Your Draft</div><div style={{display:"flex",gap:6}}>{picks.map(n => <BC key={n} name={n} compact T={T} onClick={() => setM(n)}/>)}</div></Cd>}
  </div>;
}

function StatsP({T}) {
  const wrD = useMemo(() => [...brawlerEntries].sort((a,b) => b[1].winRate-a[1].winRate).slice(0,10).map(([n,d]) => ({name:n,wr:d.winRate,pr:d.pickRate,ban:d.banRate})), []);
  const tc = useMemo(() => TIERS.map(t => ({tier:t,count:brawlerEntries.filter(([,d]) => d.tier===t).length})).filter(t => t.count>0), []);
  const all = useMemo(() => [...brawlerEntries].sort((a,b) => getMetaScore(b[1])-getMetaScore(a[1])), []);
  return <div>
    <h2 style={{fontSize:18,fontWeight:800,color:T.text,marginBottom:14}}>Stats</h2>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
      <Cd T={T} style={{padding:10}}><div style={{fontSize:10,fontWeight:700,color:T.text,marginBottom:6}}>WR / PR / Ban</div>
        <ResponsiveContainer width="100%" height={170}><BarChart data={wrD}><CartesianGrid strokeDasharray="3 3" stroke={T.border}/><XAxis dataKey="name" tick={{fontSize:5,fill:T.text3}} axisLine={false} tickLine={false} interval={0} angle={-45} textAnchor="end" height={35}/><YAxis tick={{fontSize:8,fill:T.text3}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:T.card,border:"1px solid "+T.border,borderRadius:6,fontSize:9}}/><Bar dataKey="wr" name="Win%" fill={T.accent} radius={[2,2,0,0]}/><Bar dataKey="pr" name="Pick%" fill={T.blue} radius={[2,2,0,0]}/><Bar dataKey="ban" name="Ban%" fill={T.red} radius={[2,2,0,0]}/></BarChart></ResponsiveContainer>
      </Cd>
      <Cd T={T} style={{padding:10}}><div style={{fontSize:10,fontWeight:700,color:T.text,marginBottom:6}}>Tiers</div>
        <ResponsiveContainer width="100%" height={170}><BarChart data={tc}><XAxis dataKey="tier" tick={{fontSize:11,fill:T.text3,fontWeight:700}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:8,fill:T.text3}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:T.card,border:"1px solid "+T.border,borderRadius:6,fontSize:9}}/><Bar dataKey="count" radius={[5,5,0,0]}>{tc.map((e,i) => <Cell key={i} fill={T[e.tier]||T.text3}/>)}</Bar></BarChart></ResponsiveContainer>
      </Cd>
    </div>
    <Cd T={T}><div style={{fontSize:11,fontWeight:700,color:T.text,marginBottom:8}}>Leaderboard</div>
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
        <thead><tr style={{borderBottom:"1px solid "+T.border}}>{["#","Name","T","Score","WR","PR","Ban","Trend"].map(h => <th key={h} style={{textAlign:h==="Name"?"left":"center",padding:"4px 4px",color:T.text3,fontWeight:600,fontSize:8}}>{h}</th>)}</tr></thead>
        <tbody>{all.map(([n,d],i) => <tr key={n} style={{borderBottom:"1px solid "+T.border+"12"}}><td style={{padding:"3px 4px",color:T.text3,textAlign:"center",fontSize:9}}>{i+1}</td><td style={{padding:"3px 4px",color:T.text,fontWeight:600}}>{n}</td><td style={{padding:"3px 4px",textAlign:"center"}}><TB t={d.tier} T={T}/></td><td style={{padding:"3px 4px",textAlign:"center",color:T.purple,fontWeight:700}}>{getMetaScore(d).toFixed(1)}</td><td style={{padding:"3px 4px",textAlign:"center",color:d.winRate>=55?T.accent:d.winRate>=50?T.amber:T.red,fontWeight:700}}>{d.winRate}%</td><td style={{padding:"3px 4px",textAlign:"center",color:T.blue}}>{d.pickRate}%</td><td style={{padding:"3px 4px",textAlign:"center",color:T.red}}>{d.banRate}%</td><td style={{padding:"3px 4px",textAlign:"center"}}><Trend trend={d.trend} T={T}/></td></tr>)}</tbody>
      </table></div>
    </Cd>
    <AdZone T={T}/>
  </div>;
}

// ================================================================
// MAIN
// ================================================================
const TABS = [{id:"home",l:"Home",ic:"\uD83C\uDFE0"},{id:"builds",l:"Builds",ic:"\uD83D\uDD27"},{id:"tiers",l:"Tiers",ic:"\uD83C\uDFC6"},{id:"modes",l:"Modes",ic:"\uD83C\uDFAE"},{id:"maps",l:"Maps",ic:"\uD83D\uDDFA\uFE0F"},{id:"ranked",l:"Ranked",ic:"\u2694\uFE0F"},{id:"draft",l:"Draft",ic:"\uD83C\uDFAF"},{id:"stats",l:"Stats",ic:"\uD83D\uDCCA"}];
const MOB = ["home","builds","tiers","ranked","draft"];

export default function App() {
  const [tab, setTab] = useState("home");
  const [modal, setModal] = useState(null);
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem("mh-theme") !== "light"; } catch { return true; }
  });
  const T = dark ? DARK : LIGHT;

  useEffect(() => {
    try { localStorage.setItem("mh-theme", dark ? "dark" : "light"); } catch {}
  }, [dark]);

  const navTo = (id) => { setTab(id); trackPageView(id); };
  const openModal = (name) => { setModal(name); if(name) trackBrawlerView(name); };

  return <ErrorBoundary><div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"'Segoe UI',-apple-system,system-ui,sans-serif",paddingBottom:56}}>
    <nav style={{position:"sticky",top:0,zIndex:100,background:T.navBg,backdropFilter:"blur(12px)",borderBottom:"1px solid "+T.border,padding:"0 10px"}}>
      <div style={{maxWidth:920,margin:"0 auto",display:"flex",alignItems:"center",gap:3,overflowX:"auto",height:46}}>
        <span style={{fontSize:13,fontWeight:900,color:T.accent,marginRight:6,whiteSpace:"nowrap",flexShrink:0}}>META HUB</span>
        {TABS.map(t => <button key={t.id} onClick={() => navTo(t.id)} style={{padding:"5px 8px",borderRadius:5,fontSize:9,cursor:"pointer",border:"none",background:tab===t.id?T.accent+"18":"transparent",color:tab===t.id?T.accent:T.text3,fontWeight:tab===t.id?700:400,whiteSpace:"nowrap",flexShrink:0}}>{t.ic} {t.l}</button>)}
        <button onClick={() => setDark(!dark)} style={{marginLeft:"auto",padding:"3px 7px",borderRadius:5,fontSize:9,cursor:"pointer",background:T.card,border:"1px solid "+T.border,color:T.text3,flexShrink:0}}>{dark?"\u2600\uFE0F":"\uD83C\uDF19"}</button>
      </div>
    </nav>
    <main style={{maxWidth:920,margin:"0 auto",padding:"14px 10px 20px"}}>
      {tab==="home"&&<Home nav={navTo} setM={openModal} T={T}/>}
      {tab==="builds"&&<Builds setM={openModal} T={T}/>}
      {tab==="tiers"&&<TierList setM={openModal} T={T}/>}
      {tab==="modes"&&<ModesP setM={openModal} T={T}/>}
      {tab==="maps"&&<MapsP setM={openModal} T={T}/>}
      {tab==="ranked"&&<RankedP setM={openModal} T={T}/>}
      {tab==="draft"&&<DraftP setM={openModal} T={T}/>}
      {tab==="stats"&&<StatsP T={T}/>}
    </main>
    <div style={{textAlign:"center",padding:"10px 10px 64px",borderTop:"1px solid "+T.border}}>
      <p style={{fontSize:8,color:T.text3,margin:"0 0 4px"}}>Meta Hub v1.0 — Original competitive analysis and insights</p>
      <p style={{fontSize:7,color:T.text3,margin:0}}>Not affiliated with, endorsed, or sponsored by Supercell. Brawl Stars, Clash Royale, and Clash of Clans are trademarks of Supercell Oy. Data and insights are derived from community analysis and game mechanics study.</p>
    </div>
    <div style={{position:"fixed",bottom:0,left:0,right:0,background:T.card+"f5",backdropFilter:"blur(12px)",borderTop:"1px solid "+T.border,display:"flex",justifyContent:"space-around",padding:"5px 0 8px",zIndex:100}}>
      {TABS.filter(t => MOB.includes(t.id)).map(t => <button key={t.id} onClick={() => navTo(t.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1,background:"none",border:"none",cursor:"pointer",color:tab===t.id?T.accent:T.text3,fontSize:7,fontWeight:tab===t.id?700:400,padding:"2px 6px"}}><span style={{fontSize:16}}>{t.ic}</span>{t.l}</button>)}
    </div>
    {modal&&<Mdl name={modal} onClose={() => openModal(null)} T={T}/>}
  </div></ErrorBoundary>;
}

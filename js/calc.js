/* ============================================================
   生存狂 OS v3 · calc.js
   全部评分都是真算的，公式写在注释里，随时可核对
   ============================================================ */

let S = null;

function load(){
  try{
    const raw = localStorage.getItem(DB_KEY);
    if(raw) S = JSON.parse(raw);
  }catch(e){ S = null; }
  if(!S) S = JSON.parse(JSON.stringify(DEFAULT_STATE));
  S.profile = S.profile || {city:'山东·泰安', members:JSON.parse(JSON.stringify(DEFAULT_MEMBERS))};
  S.profile.members = S.profile.members || JSON.parse(JSON.stringify(DEFAULT_MEMBERS));
  S.settings = S.settings || {amapKey:''};
  ['supplies','skills','trainings','trainingLog','drills','markers','quests','news','posts','gear'].forEach(k=>{
    if(!Array.isArray(S[k])) S[k]=[];
  });
  migrateExpiry();
  return S;
}
function save(){ try{ localStorage.setItem(DB_KEY, JSON.stringify(S)); }catch(e){} }
function uid(p){ return p+Math.random().toString(36).slice(2,8); }
function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
function round1(v){ return Math.round(v*10)/10; }

/* ---------- 保质期：自动推算 ----------
   存 生产日期 prodDate + 总保质天数 expDays
   剩余天数 = expDays − 从生产日期到今天过的天数
   老数据（只有 exp＝剩余天数）自动迁移：prodDate=今天、expDays=exp */
function todayStr(){ return new Date().toISOString().slice(0,10); }
function migrateExpiry(){
  (S.supplies||[]).forEach(it=>{
    if(it.expDays==null && it.exp!=null){
      it.expDays = it.exp;
      it.prodDate = todayStr();
      delete it.exp;
    }
  });
}
function remainingDays(it){
  if(it.expDays!=null && it.prodDate){
    const d0 = new Date(it.prodDate + 'T00:00:00');
    const daysGone = Math.floor((Date.now() - d0.getTime()) / 86400e3);
    return it.expDays - daysGone;
  }
  if(it.exp!=null) return it.exp;
  return null;
}

function needs(){
  const m = S.profile.members || [];
  const k = m.reduce((a,x)=> a + (x.extra||1), 0) || 1;
  return { water: 3*k, kcal: 2000*k, people: m.length, coef:round1(k) };
}
function supplyDays(){
  const n = needs();
  let L = 0, K = 0;
  S.supplies.forEach(it=>{
    L += (it.qty||0) * (it.lPerUnit||0);
    K += (it.qty||0) * (it.kcalPerUnit||0);
  });
  return { water: n.water>0?L/n.water:0, food: n.kcal>0?K/n.kcal:0, liters:round1(L), kcal:Math.round(K) };
}

function compute(){
  const d = supplyDays();
  const now = Date.now();
  const DAY = 86400e3;

  let expiring = 0, expired = 0;
  S.supplies.forEach(it=>{
    const r = remainingDays(it);
    if(r==null) return;
    if(r < 0) expired++;
    else if(r <= 30) expiring++;
  });

  const cats = new Set(S.supplies.map(i=>i.cat));
  const variety = cats.size;

  const skillSum = S.skills.reduce((a,x)=>a+(x.level||0),0);
  const skillMaxed = S.skills.filter(x=>x.level>=(x.max||5)).length;
  const skillCap = 50; // 记满 50 级就算技能满分（不用全部点满）

  const weekAgo = now - 7*DAY;
  const train7 = (S.trainingLog||[]).filter(t=>t.ts>=weekAgo).length;
  const today = new Date().toISOString().slice(0,10);
  const todayDone = (S.trainingLog||[]).filter(t=>t.day===today).length;
  const todayTarget = S.trainings.reduce((a,t)=>a+(t.target||1),0) || 1;

  // 连续训练天数（今天没练则从昨天往前数）
  const days = new Set((S.trainingLog||[]).map(l=>l.day));
  let trainStreak = 0;
  for(let i=0;i<400;i++){
    const dt = new Date(now - i*DAY).toISOString().slice(0,10);
    if(days.has(dt)) trainStreak++;
    else if(i===0) continue;      // 今天还没练，不算断
    else break;
  }

  const drillCount = (S.drills||[]).reduce((a,x)=>a + (x.logs||[]).length, 0);
  const drillScores = (S.drills||[]).flatMap(x=>(x.logs||[]).map(l=>l.score||0));
  const drillAvg = drillScores.length ? drillScores.reduce((a,b)=>a+b,0)/drillScores.length : 0;

  const markerCount = (S.markers||[]).length;
  const markerTypes = new Set((S.markers||[]).map(m=>m.type)).size;

  const questDone = (S.quests||[]).filter(q=>q.status==='done').length;
  const postCount = (S.posts||[]).length;
  const newsAll = (S.news||[]).length || 1;
  const newsRead = (S.news||[]).filter(n=>n.read).length / newsAll;

  const gearFilled = (S.gear||[]).filter(g=>g.item && g.item.trim()).length;
  const gearWeight = (S.gear||[]).reduce((a,g)=>a+(g.wt||0),0);

  const coverage = Math.min(d.water, d.food);

  const M  = clamp( Math.min(coverage/30,1)*70 + (variety/6)*30 - expired*8 - expiring*2, 0, 100);
  const Sk = clamp( skillSum/skillCap*100, 0, 100);
  const P  = clamp( Math.min(train7/10,1)*60 + Math.min(todayDone/todayTarget,1)*40, 0, 100);
  const Dr = clamp( Math.min(drillCount/3,1)*60 + drillAvg*0.4, 0, 100);
  const Mp = clamp( (markerTypes/8)*70 + Math.min(markerCount/8,1)*30, 0, 100);
  const C  = clamp( Math.min(postCount/3,1)*40 + Math.min(questDone/5,1)*40 + newsRead*20, 0, 100);

  const total = Math.round(0.35*M + 0.15*Sk + 0.15*P + 0.15*Dr + 0.10*Mp + 0.10*C);
  const grade = total>=90?'S': total>=80?'A': total>=70?'B': total>=60?'C': total>=40?'D':'E';

  const parts = [
    {key:'M',   name:'物资', score:Math.round(M),  w:'35%', advice:'把水和热量补到覆盖 30 天，顺手处理临期/过期。'},
    {key:'S',   name:'技能', score:Math.round(Sk), w:'15%', advice:'先点「净水」「止血」「取火」——缺什么补什么，别平均点。'},
    {key:'P',   name:'体能', score:Math.round(P),  w:'15%', advice:'一周内练满 10 次，体重无关，坚持才有分。'},
    {key:'D',   name:'演习', score:Math.round(Dr), w:'15%', advice:'先做一次 15 分钟 BOB 打包，分数立刻上来。'},
    {key:'Map', name:'地图', score:Math.round(Mp), w:'10%', advice:'把水源、医疗、集合点、危险点标满八类。'},
    {key:'C',   name:'参与', score:Math.round(C),  w:'10%', advice:'完成几个副本、发两条生存圈，把资讯读完。'}
  ];
  parts.sort((a,b)=>a.score-b.score);

  return {
    days:d, coverage:round1(coverage), expiring, expired, variety,
    skillSum, skillCap, skillMaxed, train7, todayDone, todayTarget, trainStreak,
    drillCount, drillAvg:Math.round(drillAvg), markerCount, markerTypes,
    questDone, postCount, newsRead, gearFilled, gearWeight,
    suppliesCount:S.supplies.length, members:(S.profile.members||[]).length,
    scores:{M:Math.round(M), S:Math.round(Sk), P:Math.round(P), D:Math.round(Dr), Map:Math.round(Mp), C:Math.round(C)},
    total, grade, parts, short:parts.slice(0,3)
  };
}

function medalState(){
  const c = compute();
  return MEDALS.map(m=>({...m, unlocked: !!m.cond(c)}));
}

function alerts(){
  const c = compute();
  const out = [];
  if(c.days.water < 3) out.push({lv:'bad', text:`饮用水只够 ${round1(c.days.water)} 天，低于 3 天红线。`});
  else if(c.days.water < 7) out.push({lv:'warn', text:`饮用水够 ${round1(c.days.water)} 天，建议补到 7 天。`});
  if(c.days.food < 7) out.push({lv:'bad', text:`热量只够 ${round1(c.days.food)} 天，建议补主食。`});
  else if(c.days.food < 30) out.push({lv:'warn', text:`热量够 ${round1(c.days.food)} 天，目标 30 天。`});
  if(c.expired) out.push({lv:'bad', text:`有 ${c.expired} 项物资已过期，尽快替换。`});
  if(c.expiring) out.push({lv:'warn', text:`有 ${c.expiring} 项 30 天内到期，先吃先用。`});
  if(c.drillCount===0) out.push({lv:'warn', text:'还没做过演习，评分会一直卡在 D 项。'});
  if(c.markerCount<3) out.push({lv:'warn', text:`地图只有 ${c.markerCount} 个标注，水源和集合点最重要。`});
  return out;
}

function rollQuests(force){
  const today = new Date().toISOString().slice(0,10);
  if(!force && S.questSeedDay === today && (S.quests||[]).length) return;
  const custom = (S.quests||[]).filter(q=>q.custom);
  const pool = [...QUEST_POOL].sort(()=>Math.random()-0.5).slice(0,3);
  const gen = pool.map((q,i)=>({
    id: uid('q'), title:q.title, tag:q.tag, diff:q.diff, exp:q.exp,
    status:'open', due: Date.now() + (i+2)*86400e3
  }));
  S.quests = custom.concat(gen);
  S.questSeedDay = today;
  save();
}

function fmtDays(v){ return v>=999?'999+':round1(v).toFixed(1); }
function scoreColor(v){ return v>=70?'var(--accent)': v>=40?'var(--warn)':'var(--danger)'; }
function gradeColor(g){
  return g==='S'||g==='A' ? 'var(--accent)' : g==='B' ? 'var(--blue)' : g==='C' ? 'var(--warn)' : 'var(--danger)';
}

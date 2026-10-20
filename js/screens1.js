/* ============================================================
   生存狂 OS v3 · screens1.js
   首页 / 物资 / 技能 / 训练 / 演习 / 更多
   ============================================================ */

/* ---------------- 首页 ---------------- */
function screen_home(){
  const c = compute();
  const al = alerts();
  const m = S.profile.members;

  const alertHtml = al.length
    ? al.slice(0,3).map(a=>`<div class="${a.lv==='bad'?'warnbox':'okbox'}">${esc(a.text)}</div>`).join('')
    : `<div class="okbox">今天没有明显短板，保持。</div>`;

  const bars = [
    ['物资', c.scores.M, 'bag'], ['技能', c.scores.S, 'gear'], ['体能', c.scores.P, 'heart'],
    ['演习', c.scores.D, 'target'], ['地图', c.scores.Map, 'map'], ['参与', c.scores.C, 'radio']
  ].map(([n,v,ic])=>`<div style="margin-bottom:6px">
      <div class="between small"><span class="muted">${pix(ic,12)} ${n}</span><span style="color:${scoreColor(v)}">${v}</span></div>
      ${bar(v)}</div>`).join('');

  const shortHtml = c.short.map(p=>`
    <div class="item">
      <div class="meta"><b>${p.name} <span class="muted tiny">${p.score} 分 / 权重 ${p.w}</span></b>
      <div class="sub">${esc(p.advice)}</div></div>
    </div>`).join('');

  const mem = m.map(x=>`<span class="pill">${esc(x.role)} ${x.age}</span>`).join(' ');

  return `
  ${card(`${pix('target',13)} 综合状态`, `
    <div class="hero">
      ${ring(c.total,'')}
      <div class="grow">
        <div class="between"><span class="muted small">评级</span>
          <b style="font-size:22px;color:${gradeColor(c.grade)}">${c.grade}</b></div>
        <div class="between"><span class="muted small">自持天数</span>
          <b style="color:${c.coverage<3?'var(--danger)':c.coverage<7?'var(--warn)':'var(--accent)'}">${fmtDays(c.coverage)} 天</b></div>
        <div class="between"><span class="muted small">家庭</span><b>${m.length} 人</b></div>
        <div class="between"><span class="muted small">地点</span><b class="small">${esc(S.profile.city)}</b></div>
      </div>
    </div>
    <div style="margin-top:8px">${mem}</div>`, new Date().toLocaleDateString('zh-CN'))}

  ${card(`${pix('skull',13)} 预警`, alertHtml)}

  ${card(`${pix('water',13)} 物资覆盖`, `
    <div class="between small"><span>${pix('water',11,'var(--blue)')} 饮用水</span><b style="color:var(--blue)">${fmtDays(c.days.water)} 天</b></div>
    ${bar(Math.min(c.days.water/30*100,100), c.days.water<3?'danger':'')}
    <div class="between small" style="margin-top:6px"><span>${pix('wheat',11,'var(--warn)')} 热量</span><b style="color:var(--warn)">${fmtDays(c.days.food)} 天</b></div>
    ${bar(Math.min(c.days.food/30*100,100), c.days.food<7?'danger':'')}
    <div class="tiny muted" style="margin-top:6px">基线：3L 水 + 2000kcal / 人 / 天（哺乳期×1.15）</div>`)}

  ${card(`${pix('gear',13)} 六项评分`, bars)}

  ${card(`${pix('compass',13)} 短板三条`, shortHtml || emptyBox('暂无'))}

  ${card(`${pix('target',13)} 今日副本`, (S.quests||[]).filter(q=>q.status==='open').slice(0,3).map(q=>`
      <div class="item">
        <div class="meta"><b>${esc(q.title)}</b>
          <div class="sub">${'★'.repeat(q.diff)} · ${q.exp} EXP · ${esc(q.tag)}</div></div>
        <button class="btn mini primary" onclick="doneQuest('${q.id}')">完成</button>
      </div>`).join('') || emptyBox('今天的副本已清空'))}
  `;
}

/* ---------------- 物资 ---------------- */
let SUP_FILTER = 'all';

function screen_supplies(){
  const c = compute();
  const list = S.supplies.filter(i=> SUP_FILTER==='all' || i.cat===SUP_FILTER);
  const catPills = `<div class="scroll-x">
    <span class="pill ${SUP_FILTER==='all'?'on':''}" onclick="setSupFilter('all')">全部</span>
    ${Object.entries(CATS).map(([k,v])=>`<span class="pill ${SUP_FILTER===k?'on':''}" onclick="setSupFilter('${k}')">${pix(v.icon,10)} ${v.name}</span>`).join('')}
  </div>`;

  const items = list.map(i=>{
    const cat = CATS[i.cat] || CATS.tool;
    let expBadge = '';
    if(i.exp!=null){
      if(i.exp<0) expBadge = `<span class="badge b-bad">已过期</span>`;
      else if(i.exp<=30) expBadge = `<span class="badge b-warn">${i.exp}天</span>`;
      else expBadge = `<span class="badge b-ok">${i.exp}天</span>`;
    }
    const extra = i.cat==='water' ? `${round1((i.lPerUnit||0)*i.qty)}L`
                : (i.kcalPerUnit ? `${Math.round(i.kcalPerUnit*i.qty)}kcal` : '');
    return `<div class="item" onclick="openSupply('${i.id}')">
      ${pix(cat.icon,22,cat.color)}
      <div class="meta"><b>${esc(i.name)}</b><div class="sub">${i.qty} ${esc(i.unit)} ${extra?'· '+extra:''}</div></div>
      ${expBadge}</div>`;
  }).join('');

  return `
  ${card(`${pix('bag',13)} 物资总览`, `
    ${kv('饮用水', fmtDays(c.days.water)+' 天', 'var(--blue)')}
    ${kv('热量', fmtDays(c.days.food)+' 天', 'var(--warn)')}
    ${kv('品类', c.variety+' / 6', c.variety>=6?'var(--accent)':'var(--warn)')}
    ${kv('临期 / 过期', c.expiring+' / '+c.expired, c.expired?'var(--danger)':'var(--dim)')}
    <div style="height:8px"></div>
    <button class="btn primary block" onclick="openSupplyForm()">+ 添加物资</button>`, S.supplies.length+' 项')}
  ${card(`${pix('wheat',13)} 清单`, catPills + (items || emptyBox('这个分类还是空的')))}
  `;
}
function setSupFilter(k){ SUP_FILTER = k; render(); }

function openSupply(pid){
  const i = S.supplies.find(x=>x.id===pid); if(!i) return;
  const cat = CATS[i.cat]||CATS.tool;
  openSheet('物资 · '+i.name, `
    ${kv('分类', cat.name)}${kv('数量', i.qty+' '+i.unit)}
    ${kv('每单位水量', (i.lPerUnit||0)+' L')}${kv('每单位热量', (i.kcalPerUnit||0)+' kcal')}
    ${kv('剩余保质期', (i.exp==null?'未记录':i.exp+' 天'))}${kv('备注', i.note||'—')}
    <div style="height:8px"></div>
    <div class="row"><button class="btn primary grow" onclick="openSupplyForm('${i.id}')">编辑</button>
    <button class="btn danger" onclick="delSupply('${i.id}')">删除</button></div>`);
}
function delSupply(pid){ S.supplies = S.supplies.filter(x=>x.id!==pid); save(); closeSheet(); render(); toast('已删除'); }

let EDIT_PID = null;
function openSupplyForm(pid){
  EDIT_PID = pid || null;
  const i = pid ? S.supplies.find(x=>x.id===pid) : null;
  const presetOpts = SUPPLY_PRESETS.map((p,idx)=>`<option value="${idx}">${p.name}</option>`).join('');
  openSheet(i?'编辑物资':'添加物资', `
    <div class="field"><label>从预设选（自动填分类和热量）</label>
      <select id="f-preset" onchange="applyPreset()"><option value="-1">— 手动填写 —</option>${presetOpts}</select></div>
    <div class="field"><label>名称</label><input id="f-name" value="${i?esc(i.name):''}"></div>
    <div class="field"><label>分类</label><select id="f-cat">
      ${Object.entries(CATS).map(([k,v])=>`<option value="${k}" ${i&&i.cat===k?'selected':''}>${v.name}</option>`).join('')}
    </select></div>
    <div class="row">
      <div class="field grow"><label>数量</label><input id="f-qty" type="number" step="0.1" value="${i?i.qty:1}"></div>
      <div class="field grow"><label>单位</label><input id="f-unit" value="${i?esc(i.unit):'个'}"></div>
    </div>
    <div class="row">
      <div class="field grow"><label>每单位水量 L</label><input id="f-l" type="number" step="0.01" value="${i?(i.lPerUnit||0):0}"></div>
      <div class="field grow"><label>每单位热量 kcal</label><input id="f-k" type="number" step="10" value="${i?(i.kcalPerUnit||0):0}"></div>
    </div>
    <div class="field"><label>剩余保质期（天，可留空）</label><input id="f-exp" type="number" value="${i&&i.exp!=null?i.exp:''}"></div>
    <div class="field"><label>备注</label><input id="f-note" value="${i?esc(i.note||''):''}"></div>
    <button class="btn primary block" onclick="saveSupply()">保存</button>`);
}
function applyPreset(){
  const idx = +document.getElementById('f-preset').value;
  if(idx<0) return;
  const p = SUPPLY_PRESETS[idx];
  f('f-name').value = p.name; f('f-cat').value = p.cat; f('f-unit').value = p.unit;
  f('f-l').value = p.lPerUnit; f('f-k').value = p.kcalPerUnit;
}
function f(id){ return document.getElementById(id); }
function saveSupply(){
  const o = {
    name: f('f-name').value.trim() || '未命名',
    cat: f('f-cat').value,
    qty: parseFloat(f('f-qty').value)||0,
    unit: f('f-unit').value.trim()||'个',
    lPerUnit: parseFloat(f('f-l').value)||0,
    kcalPerUnit: parseFloat(f('f-k').value)||0,
    exp: f('f-exp').value===''?null:parseInt(f('f-exp').value,10),
    note: f('f-note').value.trim()
  };
  if(EDIT_PID){ const i = S.supplies.find(x=>x.id===EDIT_PID); if(i) Object.assign(i,o); }
  else S.supplies.push({id:uid('p'), ...o});
  save(); closeSheet(); render(); toast('已保存');
}

/* ---------------- 技能 ---------------- */
function screen_skills(){
  const c = compute();
  const groups = Object.entries(SKILL_CATS).map(([k,v])=>{
    const list = S.skills.filter(s=>s.cat===k);
    if(!list.length) return '';
    const lvSum = list.reduce((a,s)=>a+s.level,0);
    return `<div style="margin-bottom:12px">
      <div class="between" style="margin-bottom:6px">
        <span class="small" style="color:${v.color}">${pix(v.icon,14,v.color)} ${v.name}</span>
        <span class="tiny muted">${lvSum}/${list.length*5}</span>
      </div>
      ${list.map(s=>`
        <div class="item">
          <div class="meta">
            <b>${esc(s.name)}</b><div class="sub">${esc(s.desc||'')}</div>
            <div style="margin-top:4px;letter-spacing:1px">${'■'.repeat(s.level)}${'□'.repeat((s.max||5)-s.level)}</div>
          </div>
          <button class="btn mini ${s.level>=(s.max||5)?'':'primary'}" ${s.level>=(s.max||5)?'disabled':''} onclick="lvSkill('${s.id}')">+</button>
        </div>`).join('')}
    </div>`;
  }).join('');

  return `
  ${card(`${pix('gear',13)} 技能总览`, `
    ${kv('总等级', c.skillSum+' / '+c.skillCap, 'var(--accent)')}
    ${bar(c.skillSum/c.skillCap*100)}
    ${kv('点满技能', c.skillMaxed+' 项')}
    <div class="tiny muted" style="margin-top:5px">技能分 = 总等级 / 50 × 100（封顶）。10 类 39 项，含偏门技能。</div>`)}
  ${card(`${pix('brain',13)} 技能树`, groups)}
  `;
}
function lvSkill(id){
  const s = S.skills.find(x=>x.id===id); if(!s || s.level>=(s.max||5)) return;
  s.level++; save(); render(); toast(s.name+' → '+s.level+' 级');
}

/* ---------------- 训练 ---------------- */
function screen_training(){
  const c = compute();
  const today = new Date().toISOString().slice(0,10);
  const logs = (S.trainingLog||[]).filter(t=>t.day===today);

  const items = S.trainings.map(t=>{
    const n = logs.filter(l=>l.tid===t.id).length;
    return `<div class="item">
      <div class="meta"><b>${esc(t.name)}</b>
        <div class="sub">${esc(t.type)} · 今日 ${n}/${t.target} ${t.unit}</div>
        ${bar(n/(t.target||1)*100, n>=t.target?'':'warn')}</div>
      <button class="btn mini primary" onclick="doTrain('${t.id}')">+1</button>
    </div>`;
  }).join('');

  return `
  ${card(`${pix('heart',13)} 今日训练`, `
    ${kv('今日完成', logs.length+' / '+c.todayTarget, logs.length>=c.todayTarget?'var(--accent)':'var(--warn)')}
    ${bar(logs.length/c.todayTarget*100)}
    ${kv('近 7 天', c.train7+' 次', c.train7>=10?'var(--accent)':'var(--warn)')}
    ${kv('连续天数', c.trainStreak+' 天', c.trainStreak>=7?'var(--accent)':'var(--warn)')}
    <div class="tiny muted" style="margin-top:5px">体能分 = 近7天训练量 60% + 今日完成率 40%</div>`)}
  ${card(`${pix('boot',13)} 训练清单`, items + `
    <div class="row" style="margin-top:8px">
      <button class="btn grow" onclick="resetToday()">重置今日</button>
      <button class="btn primary grow" onclick="addTraining()">+ 自建训练</button>
    </div>`)}
  `;
}
function doTrain(tid){
  const t = S.trainings.find(x=>x.id===tid); if(!t) return;
  S.trainingLog.push({tid, ts:Date.now(), day:new Date().toISOString().slice(0,10), type:t.type});
  save(); render(); toast('打卡 +1');
}
function resetToday(){
  const today = new Date().toISOString().slice(0,10);
  S.trainingLog = S.trainingLog.filter(l=>l.day!==today);
  save(); render(); toast('已重置今日');
}
function addTraining(){
  openSheet('自建训练', `
    <div class="field"><label>名称</label><input id="tr-name" value=""></div>
    <div class="row">
      <div class="field grow"><label>类型</label><input id="tr-type" value="力量"></div>
      <div class="field grow"><label>每日目标</label><input id="tr-target" type="number" value="1"></div>
    </div>
    <div class="field"><label>单位</label><input id="tr-unit" value="组"></div>
    <button class="btn primary block" onclick="saveTraining()">保存</button>`);
}
function saveTraining(){
  const n = f('tr-name').value.trim(); if(!n) return;
  S.trainings.push({id:uid('t'), name:n, type:f('tr-type').value.trim()||'力量',
    target:parseInt(f('tr-target').value,10)||1, unit:f('tr-unit').value.trim()||'次'});
  save(); closeSheet(); render(); toast('已添加');
}

/* ---------------- 演习 ---------------- */
function screen_drill(){
  const c = compute();
  const list = S.drills.map(d=>{
    const last = d.logs[d.logs.length-1];
    return `<div class="item">
      <div class="meta"><b>${esc(d.name)}</b>
        <div class="sub">${esc(d.scenario)}</div>
        <div class="sub">${last?`上次 ${last.score} 分 · ${last.min} 分钟`:''} ${d.logs.length?`· 共 ${d.logs.length} 次`:''}</div>
      </div>
      <button class="btn mini primary" onclick="openDrillLog('${d.id}')">记录</button>
    </div>`;
  }).join('');

  const presets = DRILL_PRESETS.map((p,i)=>`<option value="${i}">${p.name}</option>`).join('');

  return `
  ${card(`${pix('target',13)} 演习总览`, `
    ${kv('总次数', c.drillCount, c.drillCount>=3?'var(--accent)':'var(--warn)')}
    ${kv('平均分', c.drillAvg, c.drillAvg>=70?'var(--accent)':'var(--warn)')}
    <div class="tiny muted" style="margin-top:5px">演习分 = 次数(60) + 平均分(40)。先做一次 15 分钟 BOB 打包。</div>`)}
  ${card(`${pix('hourglass',13)} 演习项目`, list)}
  ${card(`${pix('star',13)} 自建演习`, `
    <div class="field"><label>从常用模板选</label>
      <select id="dr-preset" onchange="applyDrillPreset()"><option value="-1">— 自定义 —</option>${presets}</select></div>
    <div class="field"><label>名称</label><input id="dr-name" value=""></div>
    <div class="field"><label>场景描述</label><input id="dr-scenario" value=""></div>
    <button class="btn primary block" onclick="addDrill()">添加演习项目</button>`)}
  `;
}
function applyDrillPreset(){
  const i = +f('dr-preset').value; if(i<0) return;
  f('dr-name').value = DRILL_PRESETS[i].name;
  f('dr-scenario').value = DRILL_PRESETS[i].scenario;
}
function addDrill(){
  const n = f('dr-name').value.trim(); if(!n) return;
  S.drills.push({id:uid('d'), name:n, scenario:f('dr-scenario').value.trim(), best:0, logs:[]});
  save(); render(); toast('已添加演习');
}
function openDrillLog(id){
  const d = S.drills.find(x=>x.id===id); if(!d) return;
  openSheet('记录演习 · '+d.name, `
    <div class="field"><label>用时（分钟）</label><input id="d-min" type="number" value="15"></div>
    <div class="field"><label>自评（1-5）</label><input id="d-self" type="number" min="1" max="5" value="3"></div>
    <div class="tiny muted" style="margin-bottom:8px">计分：110 − 用时×2 + 自评×4，封顶 0–100。超时越久扣越多。</div>
    <button class="btn primary block" onclick="saveDrill('${id}')">保存记录</button>`);
}
function saveDrill(id){
  const d = S.drills.find(x=>x.id===id); if(!d) return;
  const min = parseFloat(f('d-min').value)||0;
  const self = clamp(parseInt(f('d-self').value,10)||3,1,5);
  const score = Math.round(clamp(110 - min*2 + self*4, 0, 100));
  d.logs.push({ts:Date.now(), min, self, score});
  d.best = Math.max(d.best||0, score);
  save(); closeSheet(); render(); toast('本次 '+score+' 分');
}

/* ---------------- 更多 ---------------- */
function screen_more(){
  const tiles = [
    ['training','训练计划','boot'], ['drill','模拟演习','target'],
    ['quests','随机副本','star'], ['news','资讯预警','radio'],
    ['social','生存圈','heart'], ['equipment','装备配装','bag'],
    ['medals','能力勋章','medal'], ['rating','生存率评分','compass']
  ].map(([k,n,ic])=>`<div class="tile" onclick="go('${k}')">${pix(ic,26,'var(--accent)')}<b>${n}</b></div>`).join('');

  const c = compute();
  return `
  <div class="themeBar">
    ${THEMES.map(t=>`<button class="${document.documentElement.getAttribute('data-theme')===t?'on':''}" onclick="applyTheme('${t}');render()">${THEME_NAMES[t]}</button>`).join('')}
  </div>
  ${card(`${pix('grid',13)} 全部模块`, `<div class="grid2">${tiles}</div>`)}
  ${card(`${pix('home',13)} 家庭档案`, `
    ${S.profile.members.map(m=>`<div class="item">${pix('footprint',18,'var(--dim)')}
      <div class="meta"><b>${esc(m.role)}</b><div class="sub">${m.age} 岁 · ${m.sex} · 系数 ${m.extra}</div></div></div>`).join('')}
    <div style="height:8px"></div>
    <button class="btn block" onclick="go('profile')">编辑家庭 / 设置</button>`)}
  ${card(`${pix('card',13)} 数据`, `
    ${kv('物资条目', S.supplies.length)}${kv('技能项', S.skills.length)}
    ${kv('地图标注', S.markers.length)}${kv('勋章', medalState().filter(m=>m.unlocked).length+' / '+MEDALS.length)}
    <div style="height:8px"></div>
    <button class="btn danger block" onclick="resetAll()">清空全部数据（重置）</button>`)}
  `;
}
function resetAll(){
  if(!confirm('确定清空所有记录？')) return;
  localStorage.removeItem(DB_KEY); location.reload();
}

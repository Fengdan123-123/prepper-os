/* ============================================================
   生存狂 OS v3 · screens2.js
   地图(真实定位) / 副本 / 资讯 / 生存圈 / 装备 / 勋章 / 评分 / 家庭
   ============================================================ */

/* ================= 求生地图 ================= */
let MAP = null, ME = null, ME_CIRCLE = null, POI_LAYERS = [];

function screen_map(){
  const list = S.markers.map(m=>{
    const t = MARKER_TYPES[m.type]||MARKER_TYPES.custom;
    const dist = meDistance(m);
    return `<div class="item" onclick="openMarker('${m.id}')">
      ${pix(t.icon,20,t.color)}
      <div class="meta"><b style="color:${t.color}">${esc(m.name)}</b>
        <div class="sub">${t.name} · ${esc(m.note||'无备注')}${dist?' · '+dist:''}</div></div>
    </div>`;
  }).join('');

  const poiBtns = POI_TYPES.map(p=>`<button class="btn mini" onclick="searchPOI('${p.key}','${p.code}')">${pix(p.icon,11)} ${p.key}</button>`).join('');

  return `
  ${card(`${pix('map',13)} 定位与周边`, `
    <div id="map"></div>
    <div class="row" style="margin-top:8px;flex-wrap:wrap;gap:5px">
      <button class="btn mini primary" onclick="locateMe(true)">${pix('target',11)} 定位我</button>
      <span id="geo-status" class="tiny muted">未定位</span>
    </div>
    <div class="scroll-x" style="margin-top:8px">${poiBtns}</div>
    <div id="poi-list"></div>`, S.markers.length+' 个标注')}
  ${card(`${pix('pin',13)} 我的标注`, list || emptyBox('还没有标注，点地图上的位置就能加'))}
  ${card(`${pix('compass',13)} 图例`, Object.entries(MARKER_TYPES).map(([k,v])=>
      `<span class="badge" style="color:${v.color};border-color:${v.color};margin:2px">${v.name}</span>`).join(''))}
  `;
}

function afterRender(){
  if(PAGE==='map'){ initMap(); }
  if(PAGE==='rating'){ drawRadar(); }
}

function initMap(){
  const el = document.getElementById('map');
  if(!el || typeof L === 'undefined') return;
  if(MAP){ try{ MAP.remove(); }catch(e){} MAP = null; }
  MAP = L.map('map', {zoomControl:false, attributionControl:false}).setView([36.1993,117.0876], 13);
  L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
    subdomains:'1234', maxZoom:18
  }).addTo(MAP);
  MAP.on('click', e=>{ openAddMarker(e.latlng.lat, e.latlng.lng); });
  S.markers.forEach(m=>{
    if(m.lat==null || m.lng==null) return;
    const t = MARKER_TYPES[m.type]||MARKER_TYPES.custom;
    L.marker([m.lat,m.lng], { icon: L.divIcon({
      className:'', iconSize:[14,14],
      html:`<div class="mkdot" style="color:${t.color};background:${t.color}"></div>`
    })}).addTo(MAP).on('click', ()=>openMarker(m.id));
  });
  if(ME) drawME();
}

function drawME(){
  if(!MAP || !ME) return;
  if(ME_CIRCLE){ try{ MAP.removeLayer(ME_CIRCLE); }catch(e){} }
  ME_CIRCLE = L.circleMarker(ME, {radius:7, color:'#fff', weight:2, fillColor:'#5ec8ff', fillOpacity:1}).addTo(MAP);
}

function locateMe(center){
  const st = document.getElementById('geo-status');
  if(!navigator.geolocation){ if(st) st.textContent='浏览器不支持定位'; return; }
  if(st) st.textContent='定位中…';
  navigator.geolocation.getCurrentPosition(p=>{
    ME = [p.coords.latitude, p.coords.longitude];
    if(st) st.textContent = `已定位 ${ME[0].toFixed(5)}, ${ME[1].toFixed(5)} ±${Math.round(p.coords.accuracy)}m`;
    if(MAP){ MAP.setView(ME, 16); drawME();
      S.markers.forEach(m=>{}); }
    refreshMapList();
    if(typeof toast==='function') toast('定位成功');
  }, err=>{
    if(st) st.textContent = '定位失败：'+(err.message||'被拒绝')+'（用 https 或 localhost 打开才行）';
  }, {enableHighAccuracy:true, timeout:12000, maximumAge:30000});
}

function refreshMapList(){ if(PAGE==='map') render(); }

function meDistance(m){
  if(!ME || m.lat==null || m.lng==null) return '';
  const d = haversine(ME, [m.lat, m.lng]);
  return `${Math.round(d)} m · ${bearingName(bearing(ME, [m.lat,m.lng]))}`;
}
function haversine(a,b){
  const R=6371000, toRad=x=>x*Math.PI/180;
  const dLat=toRad(b[0]-a[0]), dLon=toRad(b[1]-a[1]);
  const s=Math.sin(dLat/2)**2 + Math.cos(toRad(a[0]))*Math.cos(toRad(b[0]))*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(s));
}
function bearing(a,b){
  const toRad=x=>x*Math.PI/180, toDeg=x=>x*180/Math.PI;
  const y=Math.sin(toRad(b[1]-a[1]))*Math.cos(toRad(b[0]));
  const x=Math.cos(toRad(a[0]))*Math.sin(toRad(b[0]))-Math.sin(toRad(a[0]))*Math.cos(toRad(b[0]))*Math.cos(toRad(b[1]-a[1]));
  return (toDeg(Math.atan2(y,x))+360)%360;
}
function bearingName(deg){
  const dirs=['北','东北','东','东南','南','西南','西','西北'];
  return dirs[Math.round(deg/45)%8];
}

function openAddMarker(lat,lng){
  openSheet('新增标注', `
    <div class="field"><label>名称</label><input id="m-name" value="新标注"></div>
    <div class="field"><label>类型</label><select id="m-type">
      ${Object.entries(MARKER_TYPES).map(([k,v])=>`<option value="${k}">${v.name}</option>`).join('')}
    </select></div>
    <div class="field"><label>备注</label><input id="m-note" value=""></div>
    <button class="btn primary block" onclick="addMarker(${lat},${lng})">保存</button>`);
}
function addMarker(lat,lng){
  S.markers.push({id:uid('k'), name:f('m-name').value.trim()||'标注', type:f('m-type').value,
    lat, lng, note:f('m-note').value.trim()});
  save(); closeSheet(); render(); toast('已添加');
}
function openMarker(id){
  const m = S.markers.find(x=>x.id===id); if(!m) return;
  openSheet('标注 · '+m.name, `
    <div class="field"><label>名称</label><input id="m-name" value="${esc(m.name)}"></div>
    <div class="field"><label>类型</label><select id="m-type">
      ${Object.entries(MARKER_TYPES).map(([k,v])=>`<option value="${k}" ${m.type===k?'selected':''}>${v.name}</option>`).join('')}
    </select></div>
    <div class="field"><label>备注</label><input id="m-note" value="${esc(m.note||'')}"></div>
    <div class="row"><button class="btn primary grow" onclick="saveMarker('${id}')">保存</button>
    <button class="btn danger" onclick="delMarker('${id}')">删除</button></div>`);
}
function saveMarker(id){
  const m = S.markers.find(x=>x.id===id); if(!m) return;
  m.name = f('m-name').value.trim()||m.name; m.type = f('m-type').value; m.note = f('m-note').value.trim();
  save(); closeSheet(); render(); toast('已保存');
}
function delMarker(id){
  S.markers = S.markers.filter(x=>x.id!==id); save(); closeSheet(); render(); toast('已删除');
}

/* ---------- 周边设施（高德 POI） ---------- */
function searchPOI(name, code){
  const key = (S.settings.amapKey||'').trim();
  const box = document.getElementById('poi-list');
  if(!key){
    if(box) box.innerHTML = `<div class="warnbox">还没填高德 key。去 <b>lbs.amap.com</b> 免费申请一个「Web服务」key，填到「家庭档案 → 设置」里，就能自动搜周边。</div>`;
    return;
  }
  if(!ME){ if(box) box.innerHTML = `<div class="warnbox">先点「定位我」。</div>`; return; }
  if(box) box.innerHTML = `<div class="tiny muted">正在搜周边${name}…</div>`;
  const url = `https://restapi.amap.com/v3/place/around?key=${encodeURIComponent(key)}&location=${ME[1].toFixed(6)},${ME[0].toFixed(6)}&types=${code}&radius=2000&offset=20&page=1&extensions=base&sortrule=distance`;
  fetch(url).then(r=>r.json()).then(j=>{
    if(!j.pois || !j.pois.length){
      if(box) box.innerHTML = `<div class="empty">周边 2 公里没搜到${name}（或 key 无效）</div>`;
      return;
    }
    // 清掉上一次的 POI 图层
    POI_LAYERS.forEach(l=>{ try{ MAP.removeLayer(l); }catch(e){} });
    POI_LAYERS = [];
    const rows = j.pois.map((p,i)=>{
      const dist = p.distance ? p.distance+' 米' : (p.location ? Math.round(haversine(ME, p.location.split(',').map(Number).reverse()))+' 米' : '');
      if(p.location && MAP){
        const ll = p.location.split(',').map(Number);
        const mk = L.circleMarker([ll[1],ll[0]], {radius:6, color:'#ffd75e', weight:2, fillColor:'#ffd75e', fillOpacity:.9}).addTo(MAP);
        mk.bindPopup(esc(p.name));
        POI_LAYERS.push(mk);
        if(i===0) MAP.setView([ll[1],ll[0]], 15);
      }
      return `<div class="item">${pix('star',16,'var(--gold)')}
        <div class="meta"><b>${esc(p.name)}</b><div class="sub">${esc(p.address||'')} ${dist?'· '+dist:''}</div></div>
        <button class="btn mini" onclick="savePOI('${esc(p.name)}','${esc(p.address||'')}',${p.location?p.location.split(',')[1]:ME[0]},${p.location?p.location.split(',')[0]:ME[1]})">存为标注</button>
      </div>`;
    }).join('');
    if(box) box.innerHTML = `<div class="tiny muted" style="margin:6px 0">周边 2 公里${name}（${j.pois.length} 个）：</div>${rows}`;
  }).catch(err=>{
    if(box) box.innerHTML = `<div class="warnbox">搜索失败：${esc(err.message)}（key 或网络问题）</div>`;
  });
}
function savePOI(name,addr,lat,lng){
  S.markers.push({id:uid('k'), name, type:'supply', lat, lng, note:addr});
  save(); render(); toast('已存为标注');
}

/* ================= 随机副本 ================= */
function screen_quests(){
  const open = S.quests.filter(q=>q.status==='open');
  const done = S.quests.filter(q=>q.status==='done');
  const row = (q, isDone)=>`<div class="item">
      ${pix('star',18,'var(--gold)')}
      <div class="meta"><b>${esc(q.title)}</b>
        <div class="sub">${'★'.repeat(q.diff)} · ${q.exp} EXP · ${esc(q.tag)}${q.custom?' · 自建':''}</div></div>
      ${isDone?'':`<button class="btn mini primary" onclick="doneQuest('${q.id}')">完成</button>`}
    </div>`;
  return `
  ${card(`${pix('star',13)} 今日副本`, `
    ${open.map(q=>row(q,false)).join('') || emptyBox('今天没有待办副本')}
    <div class="row" style="margin-top:8px">
      <button class="btn grow" onclick="refreshQuests()">重新抽 3 个</button>
      <button class="btn primary grow" onclick="newQuest()">+ 自建副本</button>
    </div>`, open.length+' 个')}
  ${card(`${pix('medal',13)} 已完成`, done.map(q=>row(q,true)).join('') || emptyBox('还没完成过副本'))}
  `;
}
function doneQuest(id){
  const q = S.quests.find(x=>x.id===id); if(!q) return;
  q.status='done'; save(); render(); toast('+'+q.exp+' EXP');
}
function refreshQuests(){ rollQuests(true); render(); toast('已刷新副本'); }
function newQuest(){
  openSheet('自建副本', `
    <div class="field"><label>任务</label><input id="q-title" value=""></div>
    <div class="row">
      <div class="field grow"><label>难度 1-5</label><input id="q-diff" type="number" min="1" max="5" value="2"></div>
      <div class="field grow"><label>EXP</label><input id="q-exp" type="number" value="35"></div>
    </div>
    <div class="field"><label>标签</label><input id="q-tag" value="自建"></div>
    <button class="btn primary block" onclick="saveQuest()">添加</button>`);
}
function saveQuest(){
  const t = f('q-title').value.trim(); if(!t) return;
  S.quests.push({id:uid('q'), title:t, tag:f('q-tag').value.trim()||'自建',
    diff:clamp(parseInt(f('q-diff').value,10)||2,1,5), exp:parseInt(f('q-exp').value,10)||35,
    status:'open', custom:true});
  save(); closeSheet(); render(); toast('已添加');
}

/* ================= 资讯 ================= */
function screen_news(){
  const list = S.news.slice().sort((a,b)=>b.ts-a.ts).map(n=>{
    const lv = n.level==='紧急'?'b-bad': n.level==='重要'?'b-warn':'b-info';
    return `<div class="item" onclick="readNews('${n.id}')">
      ${pix('radio',18,'var(--dim)')}
      <div class="meta"><b style="color:${n.read?'var(--dim)':'#f0fff0'}">${esc(n.title)}</b>
        <div class="sub">${new Date(n.ts).toLocaleString('zh-CN')}</div></div>
      <span class="badge ${lv}">${esc(n.level)}</span></div>`;
  }).join('');
  return `
  ${card(`${pix('radio',13)} 预警规则`, `<div class="tiny muted">这里只做记录与提醒，不做预测。真预警以官方发布为准（气象台、应急管理局、疾控、水务）。</div>`)}
  ${card(`${pix('skull',13)} 信息流`, list + `<div style="height:8px"></div><button class="btn block" onclick="addNews()">+ 手动添加一条</button>`)}
  `;
}
function readNews(id){ const n=S.news.find(x=>x.id===id); if(!n) return; n.read=true; save(); render(); }
function addNews(){
  openSheet('添加资讯', `
    <div class="field"><label>标题</label><input id="n-title" value=""></div>
    <div class="field"><label>级别</label><select id="n-level"><option>一般</option><option>重要</option><option>紧急</option></select></div>
    <button class="btn primary block" onclick="saveNews()">保存</button>`);
}
function saveNews(){
  const t=f('n-title').value.trim(); if(!t) return;
  S.news.unshift({id:uid('n'), title:t, level:f('n-level').value, ts:Date.now(), read:false});
  save(); closeSheet(); render();
}

/* ================= 生存圈 ================= */
function screen_social(){
  const list = S.posts.slice().reverse().map(p=>`
    <div class="px-card">
      <div class="between"><b class="small">${esc(p.author)}</b>
        <span class="tiny muted">${new Date(p.ts).toLocaleString('zh-CN')}</span></div>
      <div style="margin:6px 0;font-size:12px">${esc(p.text)}</div>
      <div class="row"><span class="tiny muted">★ ${p.likes||0}</span>
        <button class="btn mini" onclick="likePost('${p.id}')">点赞</button></div>
    </div>`).join('');
  return `
  ${card(`${pix('heart',13)} 生存圈`, `
    <div class="tiny muted" style="margin-bottom:8px">本地记录，不上传。以后接服务器才是真"抱团"。</div>
    <button class="btn primary block" onclick="newPost()">+ 发一条</button>`)}
  ${list || emptyBox('还没有动态')}
  `;
}
function newPost(){
  openSheet('发一条', `<div class="field"><label>内容</label><textarea id="s-text" rows="4"></textarea></div>
    <button class="btn primary block" onclick="savePost()">发布</button>`);
}
function savePost(){
  const t=f('s-text').value.trim(); if(!t) return;
  S.posts.push({id:uid('o'), author:'我', text:t, ts:Date.now(), likes:0});
  save(); closeSheet(); render(); toast('已发布');
}
function likePost(id){ const p=S.posts.find(x=>x.id===id); if(!p) return; p.likes=(p.likes||0)+1; save(); render(); }

/* ================= 装备 ================= */
function screen_equipment(){
  const totalWt = S.gear.reduce((a,g)=>a+(g.wt||0),0);
  const slots = GEAR_SLOTS.map(slot=>{
    const g = S.gear.find(x=>x.slot===slot);
    return `<div class="item" onclick="editGear('${slot}')">
      ${pix('bag',20,'var(--dim)')}
      <div class="meta"><b>${slot}</b><div class="sub">${g?esc(g.item)+' · '+(g.wt||0)+' kg':'未配置'}</div></div>
      <span class="badge ${g?'b-ok':'b-warn'}">${g?'已配':'空'}</span></div>`;
  }).join('');
  return `
  ${card(`${pix('bag',13)} 配装清单`, `
    ${kv('总重量', totalWt.toFixed(1)+' kg', totalWt>12?'var(--warn)':'var(--accent)')}
    ${kv('已填槽位', S.gear.filter(g=>g.item&&g.item.trim()).length+' / 8')}
    <div class="tiny muted" style="margin-top:5px">成人负重建议不超过体重的 20%。先保证水、药、照明、通信。</div>`)}
  ${card(`${pix('boot',13)} 槽位`, slots)}
  `;
}
function editGear(slot){
  const g = S.gear.find(x=>x.slot===slot);
  openSheet('配置 · '+slot, `
    <div class="field"><label>物品</label><input id="g-item" value="${g?esc(g.item):''}"></div>
    <div class="field"><label>重量 kg</label><input id="g-wt" type="number" step="0.1" value="${g?(g.wt||0):0}"></div>
    <button class="btn primary block" onclick="saveGear('${slot}')">保存</button>`);
}
function saveGear(slot){
  const item=f('g-item').value.trim(), wt=parseFloat(f('g-wt').value)||0;
  const g = S.gear.find(x=>x.slot===slot);
  if(g){ g.item=item; g.wt=wt; } else S.gear.push({slot,item,wt});
  save(); closeSheet(); render(); toast('已保存');
}

/* ================= 勋章 ================= */
function screen_medals(){
  const ms = medalState();
  const got = ms.filter(m=>m.unlocked).length;
  const tierColor = {bronze:'#c98a4b', silver:'#c9d0d6', gold:'var(--gold)', legend:'var(--purple)'};
  return `
  ${card(`${pix('medal',13)} 勋章墙`, `
    ${kv('已解锁', got+' / '+ms.length, 'var(--accent)')}
    ${bar(got/ms.length*100)}
    <div class="grid3" style="margin-top:10px">
      ${ms.map(m=>`<div class="tile" style="opacity:${m.unlocked?1:.38}">
        ${pix(m.unlocked?'medal':'lock',24,m.unlocked?tierColor[m.tier]:'var(--dim)')}
        <b>${esc(m.name)}</b><span>${esc(m.desc)}</span></div>`).join('')}
    </div>`)}
  `;
}

/* ================= 评分 ================= */
function screen_rating(){
  const c = compute();
  const dims = [['物资',c.scores.M],['技能',c.scores.S],['体能',c.scores.P],['演习',c.scores.D],['地图',c.scores.Map],['参与',c.scores.C]];
  return `
  ${card(`${pix('compass',13)} 综合生存率`, `
    <div class="hero">${ring(c.total,'')}
      <div class="grow">
        <div class="between"><span class="muted">评级</span><b style="font-size:26px;color:${gradeColor(c.grade)}">${c.grade}</b></div>
        <div class="between"><span class="muted small">物资自持</span><b>${fmtDays(c.coverage)} 天</b></div>
        <div class="between"><span class="muted small">水 / 热量</span><b class="small">${fmtDays(c.days.water)} / ${fmtDays(c.days.food)} 天</b></div>
      </div></div>
    <hr><canvas id="radar" width="300" height="220"></canvas>`, '按真实数据算')}
  ${card(`${pix('gear',13)} 分项明细`, dims.map(([n,v])=>`
      <div style="margin-bottom:8px"><div class="between small"><span>${n}</span><span style="color:${scoreColor(v)}">${v}</span></div>${bar(v)}</div>`).join(''))}
  ${card(`${pix('target',13)} 短板与建议`, c.short.map(p=>`
      <div class="item">${pix('target',18,scoreColor(p.score))}
        <div class="meta"><b>${p.name} <span class="muted tiny">${p.score}</span></b>
        <div class="sub">${esc(p.advice)}</div></div></div>`).join(''))}
  ${card(`${pix('card',13)} 算法说明`, `
    <div class="tiny muted" style="line-height:1.8">
      总分 = 物资35% + 技能15% + 体能15% + 演习15% + 地图10% + 参与10%<br>
      物资分 = min(覆盖天数/30,1)×70 + 品类/6×30 − 过期×8 − 临期×2<br>
      覆盖天数 = min(水量/(3L×人数系数), 热量/(2000kcal×人数系数))<br>
      技能分 = 总等级/50×100（封顶）<br>
      体能分 = 近7天训练量×60% + 今日完成率×40%<br>
      演习分 = 次数(封顶3次)×60 + 平均分×40<br>
      地图分 = 标注类型/8×70 + 标注数/8×30
    </div>`)}
  `;
}
function drawRadar(){
  const cv = document.getElementById('radar'); if(!cv) return;
  const c = compute();
  const vals=[c.scores.M,c.scores.S,c.scores.P,c.scores.D,c.scores.Map,c.scores.C];
  const labels=['物资','技能','体能','演习','地图','参与'];
  const ctx=cv.getContext('2d'), W=cv.width, H=cv.height, cx=W/2, cy=H/2+6, R=78;
  ctx.clearRect(0,0,W,H);
  for(let ring=1;ring<=4;ring++){
    ctx.beginPath();
    for(let i=0;i<6;i++){
      const a=-Math.PI/2+i*Math.PI/3, r=R*ring/4;
      const x=cx+Math.cos(a)*r, y=cy+Math.sin(a)*r;
      i?ctx.lineTo(x,y):ctx.moveTo(x,y);
    }
    ctx.closePath(); ctx.strokeStyle='#1f2d1f'; ctx.stroke();
  }
  for(let i=0;i<6;i++){
    const a=-Math.PI/2+i*Math.PI/3;
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(a)*R,cy+Math.sin(a)*R);
    ctx.strokeStyle='#1f2d1f'; ctx.stroke();
    ctx.fillStyle='#7f9a7f'; ctx.font='10px monospace';
    ctx.fillText(labels[i], cx+Math.cos(a)*(R+16)-8, cy+Math.sin(a)*(R+16)+4);
  }
  ctx.beginPath();
  vals.forEach((v,i)=>{
    const a=-Math.PI/2+i*Math.PI/3, r=R*(v/100);
    const x=cx+Math.cos(a)*r, y=cy+Math.sin(a)*r;
    i?ctx.lineTo(x,y):ctx.moveTo(x,y);
  });
  ctx.closePath(); ctx.fillStyle='rgba(157,255,107,.18)'; ctx.fill();
  ctx.strokeStyle='#9dff6b'; ctx.lineWidth=2; ctx.stroke();
}

/* ================= 家庭 / 设置 ================= */
function screen_profile(){
  const m = S.profile.members;
  const rows = m.map((x,i)=>`
    <div class="item">${pix('footprint',20,'var(--dim)')}
      <div class="meta"><b>${esc(x.role)}</b><div class="sub">${x.age} 岁 · ${x.sex} · 系数 ${x.extra}</div></div>
      <button class="btn mini" onclick="editMember(${i})">改</button></div>`).join('');
  return `
  ${card(`${pix('home',13)} 家庭档案`, `
    <div class="field"><label>所在城市</label><input id="p-city" value="${esc(S.profile.city)}"></div>
    ${rows}
    <div class="row" style="margin-top:8px">
      <button class="btn primary grow" onclick="addMember()">+ 加人</button>
      <button class="btn grow" onclick="saveCity()">保存城市</button>
    </div>
    <div class="tiny muted" style="margin-top:8px">系数：成人 1.0，哺乳期 1.15，10 岁 0.6，6 岁 0.5，1 岁 0.3。人口一多，物资需求直接翻倍。</div>`)}
  ${card(`${pix('map',13)} 地图设置`, `
    <div class="field"><label>高德 Web 服务 Key（用于搜周边）</label>
      <input id="p-amap" value="${esc(S.settings.amapKey||'')}" placeholder="在 lbs.amap.com 免费申请"></div>
    <button class="btn primary block" onclick="saveAmap()">保存 Key</button>
    <div class="tiny muted" style="margin-top:8px">申请步骤：lbs.amap.com → 控制台 → 应用管理 → 创建应用 → 添加 Key → 服务平台选「Web服务」。个人开发者免费。</div>`)}
  `;
}
function editMember(i){
  const x=S.profile.members[i];
  openSheet('修改成员', `
    <div class="field"><label>称呼</label><input id="u-role" value="${esc(x.role)}"></div>
    <div class="row">
      <div class="field grow"><label>年龄</label><input id="u-age" type="number" value="${x.age}"></div>
      <div class="field grow"><label>性别</label><select id="u-sex">
        <option ${x.sex==='男'?'selected':''}>男</option><option ${x.sex==='女'?'selected':''}>女</option></select></div>
    </div>
    <div class="field"><label>消耗系数</label><input id="u-extra" type="number" step="0.05" value="${x.extra}"></div>
    <button class="btn primary block" onclick="saveMember(${i})">保存</button>
    <div style="height:8px"></div>
    <button class="btn danger block" onclick="delMember(${i})">删除这个成员</button>`);
}
function saveMember(i){
  const x=S.profile.members[i];
  x.role=f('u-role').value.trim()||x.role; x.age=parseInt(f('u-age').value,10)||x.age;
  x.sex=f('u-sex').value; x.extra=parseFloat(f('u-extra').value)||1;
  save(); closeSheet(); render(); toast('已保存');
}
function delMember(i){ S.profile.members.splice(i,1); save(); closeSheet(); render(); toast('已删除'); }
function addMember(){
  openSheet('添加成员', `
    <div class="field"><label>称呼</label><input id="a-role" value="新成员"></div>
    <div class="row">
      <div class="field grow"><label>年龄</label><input id="a-age" type="number" value="30"></div>
      <div class="field grow"><label>性别</label><select id="a-sex"><option>男</option><option>女</option></select></div>
    </div>
    <div class="field"><label>消耗系数</label><input id="a-extra" type="number" step="0.05" value="1"></div>
    <button class="btn primary block" onclick="doAddMember()">保存</button>`);
}
function doAddMember(){
  S.profile.members.push({id:uid('m'), role:f('a-role').value.trim()||'成员',
    age:parseInt(f('a-age').value,10)||30, sex:f('a-sex').value, extra:parseFloat(f('a-extra').value)||1});
  save(); closeSheet(); render(); toast('已添加');
}
function saveCity(){ S.profile.city=f('p-city').value.trim()||S.profile.city; save(); render(); toast('已保存'); }
function saveAmap(){ S.settings.amapKey=f('p-amap').value.trim(); save(); render(); toast('已保存 Key'); }

/* ================= 启动 ================= */
load();
rollQuests();
S.lastOpen = Date.now();
save();
const _hash = (location.hash||'').replace('#','');
const _q = new URLSearchParams(location.search).get('p') || '';
if(_q && PAGES[_q]) PAGE = _q;
else if(_hash && PAGES[_hash]) PAGE = _hash;
render();

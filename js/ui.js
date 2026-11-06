/* ============================================================
   生存狂 OS v3 · ui.js
   路由、导航、弹层、通用组件
   ============================================================ */

const TABS = [
  {id:'home',     name:'首页', icon:'home'},
  {id:'supplies', name:'物资', icon:'bag'},
  {id:'skills',   name:'技能', icon:'gear'},
  {id:'map',      name:'地图', icon:'map'},
  {id:'more',     name:'更多', icon:'grid'}
];

const PAGES = {
  home:'首页', supplies:'物资管理', skills:'技能树', training:'训练计划', drill:'模拟演习',
  map:'求生地图', quests:'随机副本', news:'资讯预警', social:'生存圈',
  equipment:'装备配装', medals:'能力勋章', rating:'生存率评分', more:'全部模块', profile:'家庭档案'
};

let PAGE = 'home';

function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function go(name){
  PAGE = name;
  const main = document.getElementById('view');
  if(main) main.scrollTop = 0;
  render();
}

function render(){
  const c = compute();
  const hd = document.getElementById('hdr-days');
  const hg = document.getElementById('hdr-grade');
  if(hd) hd.textContent = fmtDays(c.coverage);
  if(hg){ hg.textContent = c.grade + ' · ' + c.total; hg.style.color = gradeColor(c.grade); }

  const fn = window['screen_' + PAGE] || screen_home;
  const view = document.getElementById('view');
  if(view){
    const y = view.scrollTop;
    view.innerHTML = fn();
  }

  const nav = document.getElementById('nav');
  if(nav){
    nav.innerHTML = TABS.map(t=>{
      const on = (t.id===PAGE) || (t.id==='more' && !['home','supplies','skills','map'].includes(PAGE));
      return `<button class="${on?'on':''}" onclick="go('${t.id}')">${pix(t.icon,20)}<span>${t.name}</span></button>`;
    }).join('');
  }
  if(typeof afterRender === 'function') afterRender();
}

/* ---------- 弹层 ---------- */
function openSheet(title, inner){
  const m = document.getElementById('modal');
  document.getElementById('sheet').innerHTML =
    `<h2>${esc(title)}</h2>${inner}<div style="height:8px"></div>
     <button class="btn block" onclick="closeSheet()">关闭</button>`;
  m.classList.add('on');
}
function closeSheet(){ document.getElementById('modal').classList.remove('on'); }
function toast(msg){
  const d = document.createElement('div');
  d.textContent = msg;
  d.style.cssText = 'position:fixed;left:50%;bottom:88px;transform:translateX(-50%);background:var(--panel2);border:2px solid var(--accent);color:var(--accent);padding:7px 14px;font-size:11px;z-index:200;box-shadow:3px 3px 0 rgba(0,0,0,.7)';
  document.body.appendChild(d);
  setTimeout(()=>d.remove(), 1500);
}

/* ---------- 组件 ---------- */
function bar(pct, cls){ return `<div class="bar ${cls||''}"><i style="width:${clamp(pct,0,100)}%"></i></div>`; }

function ring(pct, label){
  const r=42, c=2*Math.PI*r, off=c*(1-clamp(pct,0,100)/100);
  return `<div class="ring">
    <svg width="100" height="100">
      <circle cx="50" cy="50" r="${r}" fill="none" stroke="#16200f" stroke-width="9"/>
      <circle cx="50" cy="50" r="${r}" fill="none" stroke="${scoreColor(pct)}" stroke-width="9"
        stroke-dasharray="${c}" stroke-dashoffset="${off}"/>
    </svg>
    <div class="num"><b style="color:${scoreColor(pct)}">${Math.round(pct)}</b><span>${label||''}</span></div>
  </div>`;
}
function card(title, body, tag){
  return `<div class="px-card"><h3>${title}${tag?`<span class="tag">${tag}</span>`:''}</h3>${body}</div>`;
}
function kv(k, v, color){ return `<div class="kv"><span class="muted">${k}</span><b style="color:${color||'#f0fff0'}">${v}</b></div>`; }
function emptyBox(t){ return `<div class="empty">${t}</div>`; }
function itemRow(iconName, iconColor, title, sub, right){
  return `<div class="item">${pix(iconName,22,iconColor)}
    <div class="meta"><b>${title}</b>${sub?`<div class="sub">${sub}</div>`:''}</div>${right||''}</div>`;
}

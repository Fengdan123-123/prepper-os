/* ============================================================
   生存狂 OS v3 · data.js
   默认数据、预设库、技能树、勋章、设施类型
   ============================================================ */

const DB_KEY = 'prepper_os_v3';

/* ---------- 物资分类 ---------- */
const CATS = {
  water:{name:'水', icon:'water', color:'#5ec8ff'},
  food:{name:'食物', icon:'wheat', color:'#ffb020'},
  medical:{name:'医疗', icon:'medkit', color:'#ff6b6b'},
  tool:{name:'工具', icon:'wrench', color:'#9aa79a'},
  protection:{name:'防护', icon:'shield', color:'#c79bff'},
  energy:{name:'能源', icon:'battery', color:'#9dff6b'}
};

const SUPPLY_PRESETS = [
  {name:'桶装水', cat:'water', unit:'桶', lPerUnit:18.9, kcalPerUnit:0},
  {name:'瓶装水', cat:'water', unit:'瓶', lPerUnit:0.55, kcalPerUnit:0},
  {name:'矿泉水整箱', cat:'water', unit:'箱', lPerUnit:13.2, kcalPerUnit:0},
  {name:'大米', cat:'food', unit:'kg', lPerUnit:0, kcalPerUnit:3600},
  {name:'面粉', cat:'food', unit:'kg', lPerUnit:0, kcalPerUnit:3500},
  {name:'挂面', cat:'food', unit:'kg', lPerUnit:0, kcalPerUnit:3450},
  {name:'压缩饼干', cat:'food', unit:'块', lPerUnit:0, kcalPerUnit:500},
  {name:'肉罐头', cat:'food', unit:'罐', lPerUnit:0, kcalPerUnit:400},
  {name:'水果罐头', cat:'food', unit:'罐', lPerUnit:0, kcalPerUnit:180},
  {name:'婴儿奶粉', cat:'food', unit:'罐', lPerUnit:0, kcalPerUnit:4200},
  {name:'蜂蜜', cat:'food', unit:'kg', lPerUnit:0, kcalPerUnit:3040},
  {name:'食用油', cat:'food', unit:'L', lPerUnit:0, kcalPerUnit:8000},
  {name:'盐', cat:'food', unit:'kg', lPerUnit:0, kcalPerUnit:0},
  {name:'糖', cat:'food', unit:'kg', lPerUnit:0, kcalPerUnit:4000},
  {name:'急救包', cat:'medical', unit:'套', lPerUnit:0, kcalPerUnit:0},
  {name:'纸尿裤', cat:'medical', unit:'包', lPerUnit:0, kcalPerUnit:0},
  {name:'常用药', cat:'medical', unit:'盒', lPerUnit:0, kcalPerUnit:0},
  {name:'净水片', cat:'tool', unit:'片', lPerUnit:0, kcalPerUnit:0},
  {name:'手摇收音机', cat:'tool', unit:'台', lPerUnit:0, kcalPerUnit:0},
  {name:'绳索取', cat:'tool', unit:'米', lPerUnit:0, kcalPerUnit:0},
  {name:'火柴打火机', cat:'tool', unit:'盒', lPerUnit:0, kcalPerUnit:0},
  {name:'丁烷气罐', cat:'energy', unit:'罐', lPerUnit:0, kcalPerUnit:0},
  {name:'充电宝', cat:'energy', unit:'个', lPerUnit:0, kcalPerUnit:0},
  {name:'太阳能板', cat:'energy', unit:'块', lPerUnit:0, kcalPerUnit:0},
  {name:'雨衣', cat:'protection', unit:'件', lPerUnit:0, kcalPerUnit:0},
  {name:'防毒面具', cat:'protection', unit:'个', lPerUnit:0, kcalPerUnit:0},
  {name:'保温毯', cat:'protection', unit:'张', lPerUnit:0, kcalPerUnit:0}
];

/* ---------- 家庭 ---------- */
const DEFAULT_MEMBERS = [
  {id:'m1', role:'爸爸', age:35, sex:'男', extra:1.0},
  {id:'m2', role:'妈妈', age:36, sex:'女', extra:1.15},
  {id:'m3', role:'大女儿', age:10, sex:'女', extra:0.6},
  {id:'m4', role:'二女儿', age:6,  sex:'女', extra:0.5},
  {id:'m5', role:'小儿子', age:1,  sex:'男', extra:0.3}
];

/* ---------- 技能树：10 类 39 项（含偏门技能） ---------- */
const SKILL_CATS = {
  survival:      {name:'生存基础', icon:'fire',     color:'#9dff6b'},
  medical:       {name:'医疗急救', icon:'medkit',   color:'#ff6b6b'},
  combat:        {name:'防卫自保', icon:'shield',   color:'#ffb020'},
  mechanic:      {name:'维修建造', icon:'wrench',   color:'#9aa79a'},
  farming:       {name:'种植养殖', icon:'wheat',    color:'#c79f6b'},
  communication: {name:'通信组织', icon:'radio',    color:'#5ec8ff'},
  mobility:      {name:'机动出行', icon:'car',      color:'#8fd0ff'},
  psych:         {name:'心理韧性', icon:'brain',    color:'#c79bff'},
  digital:       {name:'信息数字', icon:'card',     color:'#7ad4ff'},
  trade:         {name:'交换经济', icon:'shop',     color:'#ffd75e'}
};

const SKILL_DEFS = [
  ['取火与火绒','survival','打火石、火绒、湿柴生火'],
  ['净水与储水','survival','过滤、煮沸、消毒片配比'],
  ['绳结与固定','survival','单套结、布林结、捆扎固定'],
  ['庇护所搭建','survival','保温优先、防水、防风'],
  ['气味管理（零痕迹）','survival','不开火、垃圾处理、痕迹消除'],
  ['天气与云图判读','survival','看云识雨、气压变化、风向'],
  ['止血包扎','medical','直接压迫、止血带、三角巾'],
  ['骨折固定','medical','夹板、颈托、搬运'],
  ['常用药与剂量','medical','退烧、补液盐、抗生素禁忌'],
  ['伤口缝合','medical','清创、缝合、换药'],
  ['草药识别','medical','本地常见止血/消炎植物'],
  ['撤离优先','combat','先跑再打、报警、保留证据'],
  ['合法防卫边界','combat','正当防卫、防身器械合法性'],
  ['夜间警觉','combat','听觉、光源控制、门外判断'],
  ['人群挤压应对','combat','站位、护头、逆流脱身'],
  ['水电维修','mechanic','跳闸、漏电、水管接头'],
  ['胶带工程','mechanic','临时密封、固定、缠绕加固'],
  ['门窗加固','mechanic','插销、阻门器、玻璃膜'],
  ['发电机维护','mechanic','机油、化油器、并联供电'],
  ['芽苗菜','farming','3-7 天出菜，不用土'],
  ['堆肥','farming','厨余发酵、无味堆肥'],
  ['发酵腌制','farming','酸菜、泡菜、晒干保存'],
  ['鱼菜共生','farming','水循环、鱼粪供肥'],
  ['手台守听','communication','频率、静噪、守听纪律'],
  ['应急暗号','communication','家庭口令、敲门暗号、儿童呼叫'],
  ['家庭分工','communication','谁拿水谁抱娃、集合点'],
  ['无线电测向','communication','信号方向判断、搜索'],
  ['车辆保养','mobility','胎压、电瓶、油量、冬季准备'],
  ['撤离路线规划','mobility','主路备路、堵点、加油点'],
  ['无人机侦察','mobility','航拍看路况、电池管理、法规'],
  ['情绪急救','psych','止慌、呼吸、稳定他人'],
  ['危机决策','psych','优先级排序、不可逆决策'],
  ['家庭沟通','psych','不审判的表达、危机中的分工'],
  ['离线地图','digital','提前缓存、纸图标注'],
  ['数据备份','digital','照片/证件/病历三处备份'],
  ['AI 工具','digital','用 AI 查资料、写方案、学技能'],
  ['以物易物','trade','估价、交换时机、避免被坑'],
  ['物资估值','trade','什么在危机中真正值钱'],
  ['谈判议价','trade','先听后说、给对方台阶']
];

const DEFAULT_SKILLS = SKILL_DEFS.map((s,i)=>({
  id:'s'+(i+1), name:s[0], cat:s[1], desc:s[2], max:5,
  level: (i===0||i===6||i===14||i===22||i===30) ? 1 : 0
}));

const DEFAULT_TRAININGS = [
  {id:'t1', name:'负重走 3km', type:'耐力', target:1, unit:'次'},
  {id:'t2', name:'深蹲 30 个', type:'力量', target:2, unit:'组'},
  {id:'t3', name:'平板支撑 90 秒', type:'核心', target:2, unit:'组'},
  {id:'t4', name:'冷水洗脸 + 深呼吸', type:'意志', target:1, unit:'次'}
];

const DRILL_PRESETS = [
  {name:'BOB 打包演习', scenario:'限时 15 分钟，把全家应急包背起来出门'},
  {name:'停电断水 24h', scenario:'关总闸，只用水桶和应急灯过一天'},
  {name:'夜间撤离', scenario:'无照明从卧室到楼下集合点'},
  {name:'全家集合点演练', scenario:'约定时间内带孩子到集合点报数'},
  {name:'72 小时口粮测试', scenario:'三天只吃储备粮，记录消耗与情绪'},
  {name:'无网络一天', scenario:'断网断电，只用纸笔和对讲机'}
];

const MARKER_TYPES = {
  water:{name:'水源', icon:'water', color:'#5ec8ff'},
  shelter:{name:'避难', icon:'tent', color:'#9dff6b'},
  supply:{name:'补给', icon:'shop', color:'#ffb020'},
  danger:{name:'危险', icon:'skull', color:'#ff5252'},
  meeting:{name:'集合点', icon:'pin', color:'#c79bff'},
  medical:{name:'医疗', icon:'medkit', color:'#ff6b6b'},
  school:{name:'学校', icon:'school', color:'#7ad4ff'},
  custom:{name:'自定义', icon:'star', color:'#9aa79a'}
};

/* 周边设施（高德 POI 分类码） */
const POI_TYPES = [
  {key:'医院', code:'090100', icon:'medkit'},
  {key:'学校', code:'141200', icon:'school'},
  {key:'超市', code:'060400', icon:'shop'},
  {key:'药店', code:'090601', icon:'pill'},
  {key:'派出所', code:'130100', icon:'shield'},
  {key:'加油站', code:'010000', icon:'car'}
];

const QUEST_POOL = [
  {title:'装满 3 天的饮用水', diff:1, exp:20, tag:'物资'},
  {title:'清点一次药箱，扔掉过期药', diff:1, exp:20, tag:'医疗'},
  {title:'把应急包背上走 1 公里', diff:2, exp:35, tag:'体能'},
  {title:'定一个家庭集合点并演练', diff:2, exp:35, tag:'组织'},
  {title:'学会用打火石生火', diff:2, exp:35, tag:'技能'},
  {title:'拍下家里的电闸/水阀位置', diff:1, exp:20, tag:'准备'},
  {title:'给手机做一次离线地图', diff:2, exp:35, tag:'地图'},
  {title:'教会孩子一个求助暗号', diff:2, exp:35, tag:'组织'},
  {title:'准备 7 天主食并记录热量', diff:3, exp:50, tag:'物资'},
  {title:'做一次 15 分钟 BOB 打包', diff:3, exp:50, tag:'演练'},
  {title:'给车加满油', diff:1, exp:20, tag:'机动'},
  {title:'整理一份家庭用药清单', diff:2, exp:35, tag:'医疗'},
  {title:'写下三条撤离路线', diff:2, exp:35, tag:'机动'},
  {title:'让孩子背下家长电话', diff:2, exp:35, tag:'组织'},
  {title:'把证件拍照并三处备份', diff:2, exp:35, tag:'数字'},
  {title:'试一次 24 小时不开火', diff:3, exp:50, tag:'技能'},
  {title:'记下邻居里谁是医生/司机', diff:3, exp:50, tag:'社区'},
  {title:'给家里加一个应急灯', diff:1, exp:20, tag:'物资'}
];

const DEFAULT_NEWS = [
  {id:'n1', title:'泰安市气象台：未来 24 小时有强降雨', level:'重要', ts:Date.now()-3600e3, read:false},
  {id:'n2', title:'停水通知（小区管网检修）', level:'紧急', ts:Date.now()-7200e3, read:false},
  {id:'n3', title:'冬季取暖用电高峰，注意线路负荷', level:'一般', ts:Date.now()-86400e3, read:true}
];

const GEAR_SLOTS = ['背包','水具','照明','刀具','药包','通信','电源','衣物'];

/* ---------- 勋章：24 枚，四档 ---------- */
const MEDALS = [
  {id:'a1',  name:'第一桶水',   tier:'bronze', desc:'水储备覆盖全家 ≥3 天', cond:s=>s.days.water>=3},
  {id:'a2',  name:'一周不慌',   tier:'silver', desc:'水储备 ≥7 天', cond:s=>s.days.water>=7},
  {id:'a3',  name:'一月口粮',   tier:'gold',   desc:'热量覆盖 ≥30 天', cond:s=>s.days.food>=30},
  {id:'a4',  name:'六类齐备',   tier:'bronze', desc:'六大类物资各有其一', cond:s=>s.variety>=6},
  {id:'a5',  name:'手艺人',     tier:'bronze', desc:'技能总等级 ≥10', cond:s=>s.skillSum>=10},
  {id:'a6',  name:'老手',       tier:'silver', desc:'技能总等级 ≥25', cond:s=>s.skillSum>=25},
  {id:'a7',  name:'一门精',     tier:'silver', desc:'有技能点满 5 级', cond:s=>s.skillMaxed>=1},
  {id:'a8',  name:'全科医生',   tier:'gold',   desc:'点满 3 项技能', cond:s=>s.skillMaxed>=3},
  {id:'a9',  name:'练家子',     tier:'bronze', desc:'近 7 天训练 ≥10 次', cond:s=>s.train7>=10},
  {id:'a10', name:'铁人',       tier:'silver', desc:'近 7 天训练 ≥25 次', cond:s=>s.train7>=25},
  {id:'a11', name:'连练七天',   tier:'gold',   desc:'连续 7 天有训练记录', cond:s=>s.trainStreak>=7},
  {id:'a12', name:'演练狂',     tier:'bronze', desc:'完成 ≥3 次演习', cond:s=>s.drillCount>=3},
  {id:'a13', name:'老演习',     tier:'gold',   desc:'完成 ≥10 次演习', cond:s=>s.drillCount>=10},
  {id:'a14', name:'高分演习',   tier:'silver', desc:'演习平均分 ≥80', cond:s=>s.drillAvg>=80},
  {id:'a15', name:'活地图',     tier:'bronze', desc:'地图标注 ≥6 个', cond:s=>s.markerCount>=6},
  {id:'a16', name:'全域地图',   tier:'gold',   desc:'六类以上标注齐全', cond:s=>s.markerTypes>=6},
  {id:'a17', name:'侦察兵',     tier:'bronze', desc:'完成 ≥5 个副本', cond:s=>s.questDone>=5},
  {id:'a18', name:'老兵',       tier:'gold',   desc:'完成 ≥20 个副本', cond:s=>s.questDone>=20},
  {id:'a19', name:'不是一个人', tier:'bronze', desc:'生存圈发过 3 条', cond:s=>s.postCount>=3},
  {id:'a20', name:'社区节点',   tier:'silver', desc:'生存圈发过 10 条', cond:s=>s.postCount>=10},
  {id:'a21', name:'总评 B',     tier:'silver', desc:'综合 ≥70', cond:s=>s.total>=70},
  {id:'a22', name:'总评 A',     tier:'gold',   desc:'综合 ≥80', cond:s=>s.total>=80},
  {id:'a23', name:'满配',       tier:'gold',   desc:'八个装备槽全填满', cond:s=>s.gearFilled>=8},
  {id:'a24', name:'零过期',     tier:'gold',   desc:'有 10 项以上物资且无过期', cond:s=>s.expired===0&&s.suppliesCount>=10}
];

const DEFAULT_STATE = {
  profile:{ city:'山东·泰安', members: JSON.parse(JSON.stringify(DEFAULT_MEMBERS)) },
  settings:{ amapKey:'' },
  supplies:[
    {id:'p1', name:'桶装水', cat:'water', qty:8, unit:'桶', lPerUnit:18.9, kcalPerUnit:0, exp:80, note:'阳台'},
    {id:'p2', name:'矿泉水整箱', cat:'water', qty:4, unit:'箱', lPerUnit:13.2, kcalPerUnit:0, exp:300, note:''},
    {id:'p3', name:'大米', cat:'food', qty:25, unit:'kg', lPerUnit:0, kcalPerUnit:3600, exp:200, note:''},
    {id:'p4', name:'面粉', cat:'food', qty:10, unit:'kg', lPerUnit:0, kcalPerUnit:3500, exp:180, note:''},
    {id:'p5', name:'挂面', cat:'food', qty:6, unit:'kg', lPerUnit:0, kcalPerUnit:3450, exp:150, note:''},
    {id:'p6', name:'压缩饼干', cat:'food', qty:24, unit:'块', lPerUnit:0, kcalPerUnit:500, exp:400, note:''},
    {id:'p7', name:'肉罐头', cat:'food', qty:20, unit:'罐', lPerUnit:0, kcalPerUnit:400, exp:500, note:''},
    {id:'p8', name:'婴儿奶粉', cat:'food', qty:3, unit:'罐', lPerUnit:0, kcalPerUnit:4200, exp:400, note:'老三'},
    {id:'p9', name:'急救包', cat:'medical', qty:1, unit:'套', lPerUnit:0, kcalPerUnit:0, exp:600, note:''},
    {id:'p10', name:'纸尿裤', cat:'medical', qty:8, unit:'包', lPerUnit:0, kcalPerUnit:0, exp:500, note:''},
    {id:'p11', name:'净水片', cat:'tool', qty:40, unit:'片', lPerUnit:0, kcalPerUnit:0, exp:500, note:''},
    {id:'p12', name:'手摇收音机', cat:'tool', qty:1, unit:'台', lPerUnit:0, kcalPerUnit:0, exp:900, note:''},
    {id:'p13', name:'丁烷气罐', cat:'energy', qty:8, unit:'罐', lPerUnit:0, kcalPerUnit:0, exp:900, note:''},
    {id:'p14', name:'充电宝', cat:'energy', qty:2, unit:'个', lPerUnit:0, kcalPerUnit:0, exp:1000, note:''},
    {id:'p15', name:'雨衣', cat:'protection', qty:5, unit:'件', lPerUnit:0, kcalPerUnit:0, exp:1200, note:''}
  ],
  skills: JSON.parse(JSON.stringify(DEFAULT_SKILLS)),
  trainings: JSON.parse(JSON.stringify(DEFAULT_TRAININGS)),
  trainingLog: [
    {tid:'t1', ts:Date.now()-4*86400e3, day:new Date(Date.now()-4*86400e3).toISOString().slice(0,10), type:'耐力'},
    {tid:'t2', ts:Date.now()-2*86400e3, day:new Date(Date.now()-2*86400e3).toISOString().slice(0,10), type:'力量'},
    {tid:'t4', ts:Date.now()-1*86400e3, day:new Date(Date.now()-1*86400e3).toISOString().slice(0,10), type:'意志'},
    {tid:'t2', ts:Date.now()-1*86400e3, day:new Date(Date.now()-1*86400e3).toISOString().slice(0,10), type:'力量'}
  ],
  drills:[
    {id:'d1', name:'BOB 打包演习', scenario:'限时 15 分钟，把全家应急包背起来出门', best:82,
      logs:[{ts:Date.now()-6*86400e3, min:14, self:4, score:82}]},
    {id:'d2', name:'停电断水 24h', scenario:'关总闸，只用水桶和应急灯过一天', best:0, logs:[]},
    {id:'d3', name:'夜间撤离', scenario:'无照明从卧室到楼下集合点', best:0, logs:[]}
  ],
  markers:[
    {id:'k1', name:'小区水站', type:'water', lat:36.2001, lng:117.0892, note:'可接水'},
    {id:'k2', name:'楼下空地', type:'meeting', lat:36.1988, lng:117.0865, note:'集合点'},
    {id:'k3', name:'社区医院', type:'medical', lat:36.2025, lng:117.0841, note:'24h 急诊'},
    {id:'k4', name:'小超市', type:'supply', lat:36.1975, lng:117.0903, note:'可能被抢空'},
    {id:'k5', name:'地下车库坡道', type:'danger', lat:36.1993, lng:117.0931, note:'暴雨易积水'}
  ],
  quests:[],
  news: JSON.parse(JSON.stringify(DEFAULT_NEWS)),
  posts:[
    {id:'o1', author:'我', text:'今天把饮用水补到 8 桶了，离 30 天目标还差一半。', ts:Date.now()-86400e3, likes:2}
  ],
  gear:[
    {slot:'背包', item:'65L 战术包', wt:1.8},
    {slot:'水具', item:'净水器', wt:0.3},
    {slot:'照明', item:'头灯+手电', wt:0.4}
  ],
  questSeedDay:'',
  lastOpen:0
};

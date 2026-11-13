// Scene animation layers for Level 1 (all twelve stations).
// Pure markup builders plus a pure state comparison. Nothing in this file reads
// or writes the saved game: animations are decoration over the existing images.
// Geometry is given in pixels of the 1672 x 941 scene images and stays
// left-to-right in every language.
export const FX_WIDTH=1672;
export const FX_HEIGHT=941;
// Seconds after which a one-shot sequence counts as finished.
export const FX_LENGTH={turn:.34,flow:2.1,moist:1.8,water:4.4,collect:3,scene:.7,read:1.2,pack:1.1,forest:3.6,wobble:.9,secure:1.4,step:1.2,shield:1.4,dawn:4.4};
// One-shot sequences that are long enough to need a skip control.
export const FX_SKIPPABLE=['water','collect','forest','dawn'];
// Picture and tone behind every Level 1 stage that shows a scene image.
export const FX_PICTURE={research:['workroom',''],illness:['illness',''],resolve:['workroom','evening'],pack:['workroom','evening'],threshold:['threshold',''],river:['river',''],'river-crossing':['river',''],'river-complete':['river',''],garden:['garden-dry',''],'garden-complete':['garden-wet',''],chamber:['chamber',''],return:['threshold','storm'],dina:['illness',''],healing:['illness',''],'level-complete':['morning','']};
export const FX_STEP=.28;

const num=value=>Number(value.toFixed(2));
const at=(x,y)=>`left:${num(x/FX_WIDTH*100)}%;top:${num(y/FX_HEIGHT*100)}%`;
const box=(x,y,w,h)=>`${at(x,y)};width:${num(w/FX_WIDTH*100)}%;height:${num(h/FX_HEIGHT*100)}%`;
// Particles sit in a carrier that measures a tenth of the layer, so percentage
// translations stay proportional to the picture at every screen width.
const dx=pixels=>num(pixels/FX_WIDTH*1000)+'%';
const dy=pixels=>num(pixels/FX_HEIGHT*1000)+'%';
function random(seed){let a=seed>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

/** Decide which decorative one-shots follow a state change. Pure; never mutates. */
export function fxTransition(before,after){
 const events=[];
 const b=before?.garden,a=after?.garden;
 if(b&&a){
  const tiles=a.rotations.map((rotation,index)=>rotation!==b.rotations[index]?index:-1).filter(index=>index>=0);
  if(tiles.length)events.push({type:'turn',tiles});
  if(!b.inspected&&a.inspected)events.push({type:'moist'});
  if(!b.watered&&a.watered)events.push({type:'water'});
  else if(!b.tested&&a.tested)events.push({type:'flow'});
 }
 if(before?.bloom&&after?.bloom&&!before.bloom.collected&&after.bloom.collected)events.push({type:'collect'});
 if(!before||!after)return events;
 if(Array.isArray(before.read)&&Array.isArray(after.read)&&after.read.length>before.read.length)events.push({type:'read',id:after.read[after.read.length-1]});
 if(Array.isArray(before.packed)&&Array.isArray(after.packed)&&after.packed.length>before.packed.length)events.push({type:'pack'});
 if(before.river&&after.river){
  if(!before.river.inspected&&after.river.inspected)events.push({type:'wobble'});
  if(!before.river.secured&&after.river.secured)events.push({type:'secure'});
  if(after.stage==='river-crossing'&&(before.stage!=='river-crossing'||before.river.crossingPanel!==after.river.crossingPanel))events.push({type:'step'});
 }
 if(before.journey&&after.journey&&!before.journey.protected&&after.journey.protected)events.push({type:'shield'});
 if(typeof before.stage==='string'&&before.stage!==after.stage&&FX_PICTURE[after.stage]){
  const from=FX_PICTURE[before.stage],to=FX_PICTURE[after.stage];
  if(before.stage==='healing'&&after.stage==='level-complete')events.push({type:'dawn'});
  else if(from&&(from[0]!==to[0]||from[1]!==to[1])&&!events.some(event=>event.type==='water'))events.push({type:'scene',from:from[0],tone:from[1]});
  if(after.stage==='threshold')events.push({type:'forest'});
 }
 return events;
}

/** Layer wrapper. `now` keeps endless loops in phase across re-renders; `elapsed` drives one-shots. */
export function fxLayer(content,{now=0,elapsed=null,cover=false,name=''}={}){
 const playing=elapsed!==null;
 return `<div class="scene-fx ${cover?'fx-cover':''} ${playing?'fx-play':''} ${name}" aria-hidden="true" style="--now:${num(now)}s;--el:${playing?num(elapsed):0}s">${content}</div>`;
}
/** Drifting motes: golden light dust (default) or dry dust. `areas` are [x,y,w,h] boxes. */
export function fxDust({seed,count,areas,kind='light',rise=[-150,-70],drift=[-30,40],time=[7,12],size=[8,13]}){
 const r=random(seed);let out='';
 for(let i=0;i<count;i++){
  const [x,y,w,h]=areas[i%areas.length];
  const t=time[0]+r()*(time[1]-time[0]);
  out+=`<i class="fx-p fx-${kind}" style="${at(x+r()*w,y+r()*h)};--t:${num(t)}s;--d:${num(r()*t)}s;--dx:${dx(drift[0]+r()*(drift[1]-drift[0]))};--dy:${dy(rise[0]+r()*(rise[1]-rise[0]))};--s:${num(size[0]+r()*(size[1]-size[0]))}%"></i>`;
 }
 return out;
}
/** Falling water streaks inside a clipped box. */
export function fxStream({seed,x,y,w,h,count=4,time=1.5}){
 const r=random(seed);let out='';
 for(let i=0;i<count;i++)out+=`<i style="left:${num((i+.2+r()*.6)/count*100)}%;--t:${num(time*(.8+r()*.5))}s;--d:${num(r()*time)}s"></i>`;
 return `<div class="fx-stream" style="${box(x,y,w,h)}">${out}</div>`;
}
/** Small star glints. `cls` chooses twinkling water glints or the steady moist shimmer. */
export function fxGlints(points,{seed=1,cls='fx-twinkle',size=1.5}={}){
 const r=random(seed);
 return points.map(([x,y],index)=>`<i class="fx-glint ${cls}" style="${at(x,y)};width:${num(size*(.75+r()*.5))}%;--t:${num(2.6+r()*2.4)}s;--d:${num(r()*4)}s;--i:${index}"></i>`).join('');
}
/** Soft breathing glow. Radius in image pixels. */
export function fxGlow(x,y,radius,cls='',time=5){
 return `<i class="fx-glow ${cls}" style="${at(x-radius,y-radius)};width:${num(radius*2/FX_WIDTH*100)}%;--t:${time}s"></i>`;
}
/** Leaves that sink and flutter along a straight path. Each entry: [x,y,dx,dy,seconds,delay]. */
export function fxLeaves(leaves){
 return leaves.map(([x,y,moveX,moveY,t,d],index)=>`<i class="fx-leaf" style="${at(x,y)};--dx:${dx(moveX)};--dy:${dy(moveY)};--t:${t}s;--d:${d}s;--f:${num(2.2+index*.5)}s"></i>`).join('');
}
/** Previous picture on top; fades out while a sequence plays, invisible otherwise. */
export function fxCrossfade(src,cls=''){return `<img class="fx-fade${cls?' '+cls:''}" src="${src}" alt="" draggable="false">`;}
const eyes=fxGlow(1097,89,20,'fx-eye',6.5)+fxGlow(1131,89,20,'fx-eye',6.5);

/** Station 7: the dry garden. */
export function gardenDryFx({now=0,inspected=false,moist=null,overlay=''}={}){
 const content=
  `<i class="fx-heat" style="${box(800,560,820,150)};--t:7s;--d:0s"></i><i class="fx-heat" style="${box(980,640,640,140)};--t:9s;--d:3s"></i><i class="fx-heat" style="${box(760,470,560,120)};--t:8s;--d:5.5s"></i>`
  +fxDust({seed:7,count:6,areas:[[900,560,650,220]],kind:'dry',rise:[-50,-10],drift:[-190,-90],time:[9,14],size:[6,10]})
  +fxLeaves([[1560,150,-110,430,12,0],[1290,300,-70,330,14,5],[60,60,120,330,13,8.5]])
  +fxStream({seed:11,x:92,y:296,w:78,h:186,count:5})
  +fxStream({seed:12,x:118,y:520,w:120,h:60,count:4,time:1.1})
  +fxStream({seed:13,x:412,y:512,w:62,h:52,count:3,time:1})
  +fxGlints([[205,612],[395,596],[105,650],[300,640]],{seed:3})
  +eyes
  +(inspected?`<div class="fx-moist-group ${moist!==null?'fx-arrive':''}" style="--el:${moist!==null?num(moist):0}s">${fxGlints([[548,524],[602,502],[660,489],[722,507],[588,602],[640,578],[786,532]],{seed:5,cls:'fx-moist',size:1.9})}</div>`:'')
  +overlay;
 return fxLayer(content,{now,name:'fx-garden-dry'});
}
/** Station 8: the watered garden. `elapsed` is null for the settled picture. */
export function gardenWetFx({now=0,elapsed=null,drySrc=''}={}){
 const run=[0,.1,.2,.32,.46].map((delay,index)=>`<i class="fx-run" style="${at(470,505)};--d:${delay}s;--s:${18-index*3}%"></i>`).join('');
 const settled=
  fxDust({seed:21,count:14,areas:[[380,270,240,150],[690,390,300,130],[1500,600,150,160],[480,760,170,110],[1290,170,170,230],[1000,560,330,90],[40,110,90,60]]})
  +fxStream({seed:22,x:735,y:566,w:70,h:92,count:4,time:1.2})
  +fxStream({seed:23,x:640,y:466,w:56,h:50,count:3,time:1})
  +fxGlints([[950,694],[1150,668],[1322,702],[1052,734],[1242,650],[860,676]],{seed:9})
  +fxGlow(1385,300,175,'fx-door',5.6);
 const content=
  fxStream({seed:11,x:92,y:296,w:78,h:186,count:5})
  +fxStream({seed:12,x:118,y:520,w:120,h:60,count:4,time:1.1})
  +fxStream({seed:13,x:412,y:512,w:62,h:52,count:3,time:1})
  +fxGlints([[205,612],[395,596],[105,650]],{seed:3})
  +eyes
  +`<div class="fx-late">${settled}</div>`
  +(elapsed!==null?fxCrossfade(drySrc)+'<i class="fx-warm"></i>'+run:'');
 return fxLayer(content,{now,elapsed,name:'fx-garden-wet'});
}
const eyesChamber=fxGlow(1502,34,18,'fx-eye',6.5);
/** Station 9: the bloom chamber. */
export function chamberFx({now=0,collected=false,elapsed=null,overlay=''}={}){
 const r=random(31);let fly='';
 if(elapsed!==null)for(let i=0;i<10;i++)fly+=`<i class="fx-fly" style="${at(1085+(r()-.5)*150,395+(r()-.5)*130)};--d:${num(i*.1+r()*.08)}s;--dx:${dx(415-1085+(r()-.5)*30)}"><i style="--dy:${dy(655-395+(r()-.5)*24)};--up:${dy(-70-r()*90)};--s:${num(9+r()*5)}%"></i></i>`;
 const content=
  fxGlow(1085,395,235,'fx-bloom',5.2)
  +fxDust({seed:33,count:9,areas:[[960,290,250,210]],rise:[-190,-90],drift:[-90,90],time:[6,10],size:[8,12]})
  +fxGlints([[1252,22],[862,124],[1160,150],[1642,62],[1392,376],[1602,386],[78,812],[222,882],[1652,732],[330,268],[1298,300]],{seed:35,cls:'fx-twinkle fx-gold',size:1.4})
  +fxStream({seed:36,x:1492,y:462,w:86,h:124,count:4,time:1.3})
  +fxStream({seed:37,x:1414,y:606,w:44,h:118,count:3,time:1.2})
  +fxStream({seed:38,x:188,y:498,w:36,h:50,count:2,time:1})
  +fxStream({seed:39,x:256,y:344,w:46,h:54,count:2,time:1})
  +eyesChamber
  +(collected?`<div class="fx-jar">${fxGlow(415,694,74,'fx-jarlight',4.4)}${fxGlow(296,652,96,'fx-lantern',3.6)}${fxDust({seed:41,count:5,areas:[[385,668,58,54]],rise:[-22,-8],drift:[-12,12],time:[3.5,5.5],size:[4,6]})}</div>`:'')
  +fly+overlay;
 return fxLayer(content,{now,elapsed,cover:true,name:'fx-chamber'});
}

/** A short one-shot inside a layer, with its own clock. Empty when nothing plays. */
export function fxShot(content,elapsed,cls=''){return elapsed===null||elapsed===undefined?'':`<div class="fx-shot fx-play ${cls}" style="--el:${num(elapsed)}s">${content}</div>`;}
/** Scene change: the previous picture fades out quickly over the new one. */
export function fxSceneChange(src,tone,elapsed){return fxShot(fxCrossfade(src,'fx-quick'+(tone==='evening'?' fx-evening':'')),elapsed);}
/** Diagonal rain, falling towards the lower left. */
export function fxRain({seed,count}){
 const r=random(seed);let out='';
 for(let i=0;i<count;i++){const t=.75+r()*.5;out+=`<i class="fx-rain" style="left:${num(r()*135)}%;top:${num(-14+r()*8)}%;--t:${num(t)}s;--d:${num(r()*t)}s"></i>`;}
 return out;
}
const bands=(cls,list)=>list.map(([x,y,w,h,t,d])=>`<i class="${cls}" style="${box(x,y,w,h)};--t:${t}s;--d:${d}s"></i>`).join('');
/** Motes that travel in an arc from one point to another while a one-shot plays. */
function fxFlight({seed,count,from,to,spread=40,lift=[-60,-120],step=.1,time=1.7}){
 const r=random(seed);let out='';
 for(let i=0;i<count;i++)out+=`<i class="fx-fly" style="${at(from[0]+(r()-.5)*spread,from[1]+(r()-.5)*spread)};--ft:${time}s;--d:${num(i*step+r()*.05)}s;--dx:${dx(to[0]-from[0]+(r()-.5)*20)}"><i style="--dy:${dy(to[1]-from[1]+(r()-.5)*20)};--up:${dy(lift[0]+r()*(lift[1]-lift[0]))};--s:${num(9+r()*5)}%"></i></i>`;
 return out;
}
// Where the four sources lie on the work table (image pixels).
const PAPERS={field:[1137,621],travel:[368,819],drawing:[568,630],advert:[1438,678]};
/** Stations 1, 3 and 4: the shared work table, by day or in the evening. */
export function workroomFx({now=0,evening=false,read=[],readId=null,readEl=null,packed=0,packEl=null,overlay=''}={}){
 const sheen=id=>{const [x,y]=PAPERS[id];return fxGlints([[x-70,y-34],[x+66,y+30]],{seed:x,cls:'fx-moist fx-paper',size:1.5});};
 const settled=read.filter(id=>PAPERS[id]&&!(id===readId&&readEl!==null)).map(sheen).join('');
 const content=
  fxGlow(1592,226,evening?210:150,'fx-lamp',evening?4.6:5.4)
  +fxDust({seed:51,count:evening?4:5,areas:[[1400,270,240,230]],rise:[-70,-25],drift:[-40,30],time:[8,13],size:[5,8]})
  +(evening?'':fxDust({seed:52,count:7,areas:[[20,20,420,300]],rise:[-60,-10],drift:[20,90],time:[9,14],size:[5,8]})+fxGlow(230,150,210,'fx-window',7))
  +fxGlints([[838,792],[1290,690]],{seed:53,cls:'fx-twinkle fx-gold',size:1.2})
  +(evening?'':settled+(readId&&PAPERS[readId]?fxShot(sheen(readId),readEl,'fx-arrive'):''))
  +(evening?fxGlints([[40,575],[100,612],[62,655],[124,585]].slice(0,Math.max(0,Math.min(4,packed))),{seed:55,cls:'fx-moist fx-paper',size:1.6}):'')
  +fxShot(fxFlight({seed:57,count:3,from:[700,640],to:[72,600],time:.8,lift:[-70,-130]}),packEl)
  +overlay;
 return fxLayer(content,{now,cover:true,name:'fx-workroom'});
}
/** Stations 2, 11 (Dina) and 12 (night): Dina's room. */
export function illnessFx({now=0,overlay=''}={}){
 const content=
  fxGlow(1608,218,200,'fx-lamp fx-flick',2.9)
  +fxGlow(618,244,34,'fx-lamp fx-flick',3.7)
  +`<i class="fx-breath" style="${box(800,515,600,180)};--t:4.8s"></i>`
  +fxGlow(237,68,34,'fx-moon',8)
  +fxGlints([[155,126],[238,134],[290,178],[101,126],[247,104]],{seed:61,cls:'fx-twinkle fx-gold',size:1})
  +fxDust({seed:62,count:4,areas:[[1440,300,200,220]],rise:[-60,-20],drift:[-40,20],time:[9,13],size:[5,8]})
  +overlay;
 return fxLayer(content,{now,cover:true,name:'fx-illness'});
}
/** Station 5 (calm evening) and station 10 (storm) on the path behind the last lantern. */
export function thresholdFx({now=0,storm=false,protectedLight=false,shieldEl=null,elapsed=null,overlay=''}={}){
 const jar=protectedLight
  ?`<div class="fx-jar ${shieldEl!==null?'fx-arrive':''}" style="--el:${shieldEl!==null?num(shieldEl):0}s">${fxGlow(800,560,105,'fx-jarlight',4.4)}${fxGlow(146,236,190,'fx-lamp',4)}${fxDust({seed:75,count:4,areas:[[770,530,60,50]],rise:[-40,-12],drift:[-16,16],time:[3.5,5.5],size:[4,6]})}</div>`
  :fxGlow(800,560,62,'fx-jarlight fx-flick fx-faint',2.4);
 const content=storm
  ?fxGlow(146,236,130,'fx-lamp fx-flick',2.3)
   +fxGlow(156,62,52,'fx-lamp fx-flick',3.1)
   +bands('fx-gust',[[900,120,900,420,6.5,0],[1100,470,1000,380,9,3.4]])
   +fxRain({seed:71,count:26})
   +jar
  :fxGlow(146,236,128,'fx-lamp fx-swing',3.4)
   +fxGlow(156,62,52,'fx-lamp',4.6)
   +fxGlints([[266,262],[334,266],[262,346],[170,440],[400,642],[452,646],[534,362],[310,402],[556,470],[1150,585],[1245,548]],{seed:72,cls:'fx-twinkle fx-gold',size:1})
   +`<div class="fx-late">${bands('fx-fog',[[850,560,640,170,13,0],[1000,430,520,150,17,6],[640,680,560,150,15,9]])
   +fxDust({seed:73,count:8,areas:[[900,330,330,300],[1080,500,230,180]],rise:[-70,-10],drift:[-60,60],time:[7,12],size:[4,7]})}</div>`;
 return fxLayer(content+overlay,{now,elapsed,cover:true,name:storm?'fx-storm':'fx-threshold'});
}
/** Station 6: the river and the moving trunk. */
export function riverFx({now=0,secured=false,overlay=''}={}){
 const content=
  fxStream({seed:81,x:906,y:192,w:34,h:100,count:3,time:1.2})
  +fxStream({seed:82,x:948,y:196,w:34,h:96,count:3,time:1.3})
  +fxStream({seed:83,x:428,y:292,w:44,h:70,count:3,time:1.1})
  +fxStream({seed:88,x:508,y:300,w:40,h:60,count:3,time:1})
  +fxDust({seed:84,count:12,areas:[[880,570,640,290],[520,385,380,80],[1290,440,330,100],[420,470,260,60]],kind:'foam',rise:[14,52],drift:[70,180],time:[3.2,5.6],size:[9,15]})
  +fxGlints([[1052,470],[1255,562],[1404,704],[702,442],[1152,822],[1502,880],[984,642],[1340,520]],{seed:85})
  +fxGlints([[640,168],[1118,160],[652,126]],{seed:86,cls:'fx-twinkle fx-gold',size:1})
  +(secured?fxGlints([[430,716],[282,668]],{seed:87,cls:'fx-moist fx-paper',size:1.5}):'')
  +overlay;
 return fxLayer(content,{now,cover:true,name:'fx-river'});
}
/** Station 12: the other morning. While `elapsed` runs, the night picture fades into the morning. */
export function morningFx({now=0,elapsed=null,nightSrc='',overlay=''}={}){
 const settled=
  `<i class="fx-ray" style="${box(60,0,620,600)};--t:7s;--d:0s"></i><i class="fx-ray" style="${box(170,0,560,520)};--t:9s;--d:3s"></i>`
  +fxGlow(230,150,230,'fx-window',6.5)
  +fxDust({seed:91,count:10,areas:[[70,50,470,380]],rise:[-70,-10],drift:[20,100],time:[8,13],size:[5,9]})
  +fxGlints([[1605,402],[1642,470],[1560,486],[1238,838],[1330,790]],{seed:92,cls:'fx-twinkle fx-gold',size:1.2})
  +`<i class="fx-breath" style="${box(800,540,600,180)};--t:5.6s"></i>`;
 const content=fxGlow(1608,218,150,'fx-lamp fx-soft',6)
  +`<div class="fx-late">${settled}</div>`
  +(elapsed!==null?fxCrossfade(nightSrc,'fx-slow')+'<i class="fx-warm fx-warm-left"></i>':'')
  +overlay;
 return fxLayer(content,{now,elapsed,cover:true,name:'fx-morning'});
}

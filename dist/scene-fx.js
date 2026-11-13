// Scene animation layers for Level 1 (pilot: spring garden and bloom chamber).
// Pure markup builders plus a pure state comparison. Nothing in this file reads
// or writes the saved game: animations are decoration over the existing images.
// Geometry is given in pixels of the 1672 x 941 scene images and stays
// left-to-right in every language.
export const FX_WIDTH=1672;
export const FX_HEIGHT=941;
// Seconds after which a one-shot sequence counts as finished.
export const FX_LENGTH={turn:.34,flow:2.1,moist:1.8,water:4.4,collect:3};
// One-shot sequences that are long enough to need a skip control.
export const FX_SKIPPABLE=['water','collect'];
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
export function fxCrossfade(src){return `<img class="fx-fade" src="${src}" alt="" draggable="false">`;}
const eyes=fxGlow(1097,89,20,'fx-eye',6.5)+fxGlow(1131,89,20,'fx-eye',6.5);

/** Station 7: the dry garden. */
export function gardenDryFx({now=0,inspected=false,moist=null}={}){
 const content=
  `<i class="fx-heat" style="${box(800,560,820,150)};--t:7s;--d:0s"></i><i class="fx-heat" style="${box(980,640,640,140)};--t:9s;--d:3s"></i><i class="fx-heat" style="${box(760,470,560,120)};--t:8s;--d:5.5s"></i>`
  +fxDust({seed:7,count:6,areas:[[900,560,650,220]],kind:'dry',rise:[-50,-10],drift:[-190,-90],time:[9,14],size:[6,10]})
  +fxLeaves([[1560,150,-110,430,12,0],[1290,300,-70,330,14,5],[60,60,120,330,13,8.5]])
  +fxStream({seed:11,x:92,y:296,w:78,h:186,count:5})
  +fxStream({seed:12,x:118,y:520,w:120,h:60,count:4,time:1.1})
  +fxStream({seed:13,x:412,y:512,w:62,h:52,count:3,time:1})
  +fxGlints([[205,612],[395,596],[105,650],[300,640]],{seed:3})
  +eyes
  +(inspected?`<div class="fx-moist-group ${moist!==null?'fx-arrive':''}" style="--el:${moist!==null?num(moist):0}s">${fxGlints([[548,524],[602,502],[660,489],[722,507],[588,602],[640,578],[786,532]],{seed:5,cls:'fx-moist',size:1.9})}</div>`:'');
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
export function chamberFx({now=0,collected=false,elapsed=null}={}){
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
  +fly;
 return fxLayer(content,{now,elapsed,cover:true,name:'fx-chamber'});
}

// Episode 4 is wholly realistic; earlier episode histories are immutable here.
export const MORNING_STAGES=['morning-opening','morning-pressure','morning-method','morning-sources','morning-preserve','morning-clock','morning-timeline','morning-model','morning-responses','morning-privacy','morning-publish','morning-complete'];
export const MORNING_DOCS={opening:['allegation'],method:['ruth'],sources:['camera','stockSource','receiptSource','collage'],preserve:['custody'],clock:['calibration'],timeline:['inventory','transport','receipt'],model:['inspection'],responses:['manager','editor','mara'],privacy:['consent']};
export const SOURCE_MODEL={camera:'independent',stockSource:'independent',receiptSource:'independent',collage:'derived'};
export const CLAIM_MODEL={clip:'box',stock:'later',safe:'found'};
export const PRIVACY_MODEL={times:'publish',seal:'publish',neighbours:'mask',message:'omit',address:'omit'};
export const PRESERVE_ORDER=['copy','compare','log'];
export const MORNING_ORDER=['clip','stock','move','safe'];
export function initialMorning(){return {read:[],pressure:null,dissented:false,method:null,methodChecked:false,sources:{camera:null,stockSource:null,receiptSource:null,collage:null},sourcesChecked:false,preserve:[null,null,null],preserved:false,time:null,scope:null,clockChecked:false,timeline:[null,null,null,null],timelineChecked:false,model:{clip:null,stock:null,safe:null},modelChecked:false,privacy:{times:null,seal:null,neighbours:null,message:null,address:null},naming:null,privacyChecked:false,revised:false,groupCorrected:false,published:false};}
const matches=(a,b)=>Object.entries(b).every(([k,v])=>a[k]===v);
const ordered=(a,b)=>b.every((id,i)=>a[i]===id);
const docsRead=(c,phase)=>(MORNING_DOCS[phase]||[]).every(id=>c.read.includes(id));
export const morningSourcesCorrect=c=>docsRead(c,'sources')&&matches(c.sources,SOURCE_MODEL);
export const morningPreserveCorrect=c=>docsRead(c,'preserve')&&ordered(c.preserve,PRESERVE_ORDER);
export const morningClockCorrect=c=>docsRead(c,'clock')&&c.time==='1810'&&c.scope==='interval';
export const morningTimelineCorrect=c=>docsRead(c,'timeline')&&ordered(c.timeline,MORNING_ORDER);
export const morningModelCorrect=c=>docsRead(c,'model')&&matches(c.model,CLAIM_MODEL);
export const morningPrivacyCorrect=c=>docsRead(c,'privacy')&&matches(c.privacy,PRIVACY_MODEL)&&['name','anonymous'].includes(c.naming);
export function morningReady(c,phase){return {opening:docsRead(c,'opening'),pressure:c.dissented,method:c.methodChecked,sources:c.sourcesChecked,preserve:c.preserved,clock:c.clockChecked,timeline:c.timelineChecked,model:c.modelChecked,responses:docsRead(c,'responses'),privacy:c.privacyChecked,publish:c.published,complete:true}[phase]===true;}
export function reduceMorning(s,a){
 const n=structuredClone(s),c=n.morning,o=s.morning,i=MORNING_STAGES.indexOf(s.stage),phase=s.stage.slice(8);
 if(a.type==='MORNING_START'){if(s.stage==='eco-complete')n.stage=MORNING_STAGES[0];return n;}
 if(i<0)return n;
 switch(a.type){
 case 'MORNING_READ':if((MORNING_DOCS[phase]||[]).includes(a.id)&&!o.read.includes(a.id))c.read.push(a.id);break;
 case 'MORNING_PICK':{
  const choices={pressure:['open','direct'],method:['original','reposts'],time:['1720','1810','1900'],scope:['interval','always'],naming:['name','anonymous']};
  const allowed={pressure:['pressure',false],method:['method',o.methodChecked],time:['clock',o.clockChecked],scope:['clock',o.clockChecked],naming:['privacy',o.privacyChecked]};
  if(allowed[a.id]&&phase===allowed[a.id][0]&&!allowed[a.id][1]&&choices[a.id].includes(a.value)&&!(a.id==='pressure'&&o.dissented))c[a.id]=a.value;
  const groups={sources:[SOURCE_MODEL,['independent','derived'],'sourcesChecked'],model:[CLAIM_MODEL,['box','later','found'],'modelChecked'],privacy:[PRIVACY_MODEL,['publish','mask','omit'],'privacyChecked']};
  const g=groups[phase];if(g&&Object.hasOwn(g[0],a.id)&&!o[g[2]]&&g[1].includes(a.value))c[phase][a.id]=a.value;
  break;
 }
 case 'MORNING_DISSENT':if(phase==='pressure'&&o.pressure)c.dissented=true;break;
 case 'MORNING_ORDER':{
  const ids=phase==='preserve'?PRESERVE_ORDER:phase==='timeline'?MORNING_ORDER:null;
  const field=phase==='preserve'?'preserved':'timelineChecked';
  if(ids&&!o[field]&&Number.isInteger(a.index)&&a.index>=0&&a.index<ids.length&&ids.includes(a.id)){c[phase]=c[phase].map(id=>id===a.id?null:id);c[phase][a.index]=a.id;}break;
 }
 case 'MORNING_CHECK':{
  const checks={method:['methodChecked',docsRead(o,'method')&&o.method==='original'],sources:['sourcesChecked',morningSourcesCorrect(o)],preserve:['preserved',morningPreserveCorrect(o)],clock:['clockChecked',morningClockCorrect(o)],timeline:['timelineChecked',morningTimelineCorrect(o)],model:['modelChecked',morningModelCorrect(o)],privacy:['privacyChecked',morningPrivacyCorrect(o)]};
  const check=checks[phase];if(check&&check[1])c[check[0]]=true;break;
 }
 case 'MORNING_REVISE':if(phase==='publish')c.revised=true;break;
 case 'MORNING_GROUP':if(phase==='publish'&&o.revised)c.groupCorrected=true;break;
 case 'MORNING_PUBLISH':if(phase==='publish'&&o.revised&&o.groupCorrected)c.published=true;break;
 case 'MORNING_NEXT':if(i<11&&morningReady(o,phase))n.stage=MORNING_STAGES[i+1];break;
 case 'HINT':n.hints[s.stage]=Math.min(3,(s.hints[s.stage]||0)+1);break;
 }
 return n;
}
export function validateMorning(input,stage){
 const c=initialMorning(),empty=initialMorning(),bad=()=>{throw Error('Der Morgenfall überspringt eine notwendige Handlung.');};
 if(!input||typeof input!=='object')bad();
 for(const [key,value] of Object.entries(c))if(typeof value==='boolean'){if(typeof input[key]!=='boolean')bad();c[key]=input[key];}
 const allDocs=Object.values(MORNING_DOCS).flat();if(!Array.isArray(input.read)||input.read.some(id=>!allDocs.includes(id))||new Set(input.read).size!==input.read.length)bad();c.read=[...input.read];
 for(const [key,ids] of Object.entries({pressure:['open','direct'],method:['original','reposts'],time:['1720','1810','1900'],scope:['interval','always'],naming:['name','anonymous']})){if(![null,...ids].includes(input[key]))bad();c[key]=input[key];}
 for(const [key,model,ids] of [['sources',SOURCE_MODEL,['independent','derived']],['model',CLAIM_MODEL,['box','later','found']],['privacy',PRIVACY_MODEL,['publish','mask','omit']]]){if(!input[key]||typeof input[key]!=='object')bad();for(const id of Object.keys(model)){if(![null,...ids].includes(input[key][id]))bad();c[key][id]=input[key][id];}}
 for(const [key,ids] of [['preserve',PRESERVE_ORDER],['timeline',MORNING_ORDER]]){const v=input[key];if(!Array.isArray(v)||v.length!==ids.length||v.some(id=>id!==null&&!ids.includes(id))||new Set(v.filter(Boolean)).size!==v.filter(Boolean).length)bad();c[key]=[...v];}
 const i=MORNING_STAGES.indexOf(stage);if(i<0){if(JSON.stringify(c)!==JSON.stringify(empty))bad();return c;}
 const fields=[[],['pressure','dissented'],['method','methodChecked'],['sources','sourcesChecked'],['preserve','preserved'],['time','scope','clockChecked'],['timeline','timelineChecked'],['model','modelChecked'],[],['privacy','naming','privacyChecked'],['revised','groupCorrected','published']];
 fields.forEach((keys,index)=>{if(i<index&&keys.some(key=>JSON.stringify(c[key])!==JSON.stringify(empty[key])))bad();});
 for(const [phase,ids] of Object.entries(MORNING_DOCS))if(MORNING_STAGES.indexOf('morning-'+phase)>i&&ids.some(id=>c.read.includes(id)))bad();
 if((c.dissented&&!c.pressure)||(c.methodChecked&&(!docsRead(c,'method')||c.method!=='original'))||(c.sourcesChecked&&!morningSourcesCorrect(c))||(c.preserved&&!morningPreserveCorrect(c))||(c.clockChecked&&!morningClockCorrect(c))||(c.timelineChecked&&!morningTimelineCorrect(c))||(c.modelChecked&&!morningModelCorrect(c))||(c.privacyChecked&&!morningPrivacyCorrect(c))||(c.groupCorrected&&!c.revised)||(c.published&&(!c.revised||!c.groupCorrected)))bad();
 for(let p=0;p<i;p++)if(!morningReady(c,MORNING_STAGES[p].slice(8)))bad();
 return c;
}

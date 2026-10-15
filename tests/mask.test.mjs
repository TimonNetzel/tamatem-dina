import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,reduce,validateState,VERSION} from '../dist/state.js';
import {MASK_STAGES,MASK_DOCS,MASK_ORDER,MASK_CLAIMS,MASK_PROOF,MASK_CHOICES,initialMask,maskCheck} from '../dist/mask-state.js';
import {MASK_COPY} from '../dist/mask-copy.js';
import {maskMeta,maskHint,maskView,maskDocument,maskNotebook,maskArticle,maskCorrection,maskDiagram} from '../dist/mask-ui.js';
import {morningNotebook} from '../dist/morning-ui.js';
import {ecoNotebook} from '../dist/eco-ui.js';
import {caseNotebook} from '../dist/case-ui.js';
import {setLanguage} from '../dist/i18n.js';
import {MESSAGES} from '../dist/messages.js';
import {levelOne,finishCase,finishEco,finishMorning,finishMask} from './support.mjs';
const step=(s,type,rest={})=>reduce(s,{type,...rest});
const round=s=>assert.deepEqual(validateState(JSON.parse(JSON.stringify(s))),s);
const history=s=>Object.fromEntries(Object.entries(s).filter(([key])=>!['version','stage','mask','hints'].includes(key)));
const before=finishMorning(finishEco(finishCase(levelOne())));
const snapshots={};finishMask(before,'public','role','boundary',s=>{snapshots[s.stage]??=s;});
const at=p=>structuredClone(snapshots['mask-'+p]);
const recover=s=>assert.equal(finishMask(s).stage,'mask-complete');
const product=(values,count)=>count?product(values,count-1).flatMap(t=>values.map(v=>[...t,v])):[[]];

test('Version 7 exact historical fields migrate at every old action; morning-complete enters Level 5 without reset',()=>{
 const oldStates=[initialState()],collect=s=>oldStates.push(s);
 const end=finishMorning(finishEco(finishCase(levelOne('research','directions',collect),'anonymous','document',collect),'doubt','visit',collect),'direct','anonymous',collect);
 for(const s of oldStates){const old={...s,version:7};delete old.mask;const copy=structuredClone(old);assert.deepEqual(validateState(old),s);assert.deepEqual(old,copy);}
 const old={...end,version:7};delete old.mask;const next=step(validateState(old),'MASK_START');assert.equal(next.stage,'mask-opening');assert.deepEqual(history(next),history(old));assert.equal(VERSION,9);
 assert.deepEqual(step(finishEco(finishCase(levelOne())),'MASK_START'),finishEco(finishCase(levelOne())));
 for(const version of [1,2,3,4,5,6,7])for(const stage of MASK_STAGES)assert.throws(()=>validateState({...at('complete'),stage,version}));
});

test('All 2048 combinations of eight inherited and three new decisions preserve all four histories and save every action',()=>{
 for(const a of ['fear','research'])for(const b of ['ask','directions'])for(const d of ['name','anonymous'])for(const e of ['omit','document'])for(const f of ['error','doubt'])for(const g of ['warning','visit'])for(const pressure of ['open','direct'])for(const naming of ['name','anonymous']){
  const start=finishMorning(finishEco(finishCase(levelOne(a,b),d,e),f,g),pressure,naming),past=history(start);
  for(const approach of ['public','quiet'])for(const name of ['name','role'])for(const crowd of ['talk','boundary']){
   const end=finishMask(start,approach,name,crowd,s=>{round(s);assert.deepEqual(history(s),past);});
   assert.equal(end.stage,'mask-complete');assert.equal(end.mask.approach,approach);assert.equal(end.mask.naming,name);assert.equal(end.mask.crowd,crowd);
   for(const notes of [caseNotebook,ecoNotebook,morningNotebook])assert.equal(notes(end,x=>x),notes(start,x=>x));
   for(const type of ['MASK_START','MASK_PICK','MASK_REPOST','MORNING_GROUP','ECO_ACCUSE','CASE_CONSENT'])assert.deepEqual(step(end,type,{id:'caption',value:'destroy'}),end);
  }
 }
});

test('Every partial crop, viewpoint and caption selection requires sources and remains recoverable',()=>{
 for(const [p,fields,flag] of [['archive',['provenance','naming'],'archiveChecked'],['crop',['crop'],'cropChecked'],['perspective',['view','observation'],'perspectiveChecked'],['caption',['caption'],'captionChecked'],['mirror',['credit'],'mirrorChecked'],['return',['crowd','kit'],'returnChecked']]){
  const combine=fields.reduce((rows,key)=>rows.flatMap(row=>[null,...MASK_CHOICES[key]].map(value=>({...row,[key]:value}))),[{}]);
  for(const values of combine)for(const read of [false,true]){
   const s=at(p);Object.assign(s.mask,values);if(read)s.mask.read.push(...MASK_DOCS[p]);round(s);
   const next=step(s,'MASK_CHECK');assert.equal(next.mask[flag],maskCheck(s.mask,p));recover(next);
  }
 }
});

test('All 209 partial distribution orders retain unique slots; all missing-source subsets block checking',()=>{
 let count=0;
 for(const vals of product([null,...MASK_ORDER],4)){
  const used=vals.filter(Boolean);if(new Set(used).size!==used.length)continue;count++;
  const s=at('network');s.mask.read.push('ledger','reply');s.mask.network=vals;round(s);
  assert.equal(step(s,'MASK_CHECK').mask.networkChecked,vals.join()===MASK_ORDER.join());recover(s);
 }
 assert.equal(count,209);
 let s=at('network');s=step(s,'MASK_ORDER',{index:0,id:'photo'});s=step(s,'MASK_ORDER',{index:1,id:'photo'});assert.deepEqual(s.mask.network,[null,'photo',null,null]);round(s);
 for(const p of ['archive','network','mirror'])for(let bits=0;bits<(1<<MASK_DOCS[p].length)-1;bits++){
  const s=at(p);s.mask.read.push(...MASK_DOCS[p].filter((_,i)=>bits&(1<<i)));
  if(p==='archive')Object.assign(s.mask,{provenance:'original',naming:'name'});if(p==='network')s.mask.network=[...MASK_ORDER];if(p==='mirror')s.mask.credit='shared';
  assert.equal(maskCheck(s.mask,p),false);recover(s);
 }
});

test('All 24 complete correction/read combinations and 128 partial/read claim classifications; admission, delivery, Dina and publication cannot be skipped',()=>{
 for(const frame of ['tight','full'])for(const angle of ['front','side'])for(const caption of ['destroy','lift','always'])for(const read of [false,true]){
  const s=at('correction');s.mask.proof={frame,angle,caption};if(read)s.mask.read.push('receipt');round(s);
  assert.equal(step(s,'MASK_CHECK').mask.proofChecked,read&&frame==='full'&&angle==='side'&&caption==='lift');recover(s);
 }
 for(const vals of product([null,'observed','documented','open'],3))for(const read of [false,true]){
  const s=at('publish');if(read)s.mask.read.push('response');s.mask.claims=Object.fromEntries(Object.keys(MASK_CLAIMS).map((key,i)=>[key,vals[i]]));round(s);
  assert.equal(step(s,'MASK_CHECK').mask.publishChecked,read&&vals.join()==='observed,documented,open');recover(s);
 }
 let s=at('correction');for(const type of ['MASK_ADMIT','MASK_REPOST','MASK_NEXT'])assert.deepEqual(step(s,type),s);
 s.mask.read.push('receipt');s.mask.proof={...MASK_PROOF};s=step(s,'MASK_CHECK');assert.deepEqual(step(s,'MASK_REPOST'),s);assert.deepEqual(step(s,'MASK_NEXT'),s);s=step(s,'MASK_ADMIT');assert.deepEqual(step(s,'MASK_NEXT'),s);s=step(s,'MASK_REPOST');assert.equal(step(s,'MASK_NEXT').stage,'mask-mirror');
 s=at('publish');for(const type of ['MASK_APPROVE','MASK_PUBLISH','MASK_NEXT'])assert.deepEqual(step(s,type),s);s.mask.read.push('response');s.mask.claims={...MASK_CLAIMS};s=step(s,'MASK_CHECK');assert.deepEqual(step(s,'MASK_PUBLISH'),s);s=step(s,'MASK_APPROVE');assert.deepEqual(step(s,'MASK_NEXT'),s);s=step(s,'MASK_PUBLISH');assert.equal(step(s,'MASK_NEXT').stage,'mask-complete');
});

test('Validation rejects future progress, skipped sources and false old histories at every station',()=>{
 for(const stage of MASK_STAGES)assert.throws(()=>validateState({...initialState(),stage}));
 for(const [stage,s] of Object.entries(snapshots)){
  round(s);for(const next of MASK_STAGES.slice(MASK_STAGES.indexOf(stage)+1))assert.throws(()=>validateState({...s,stage:next}));
  assert.throws(()=>validateState({...s,morning:{...s.morning,groupCorrected:false}}));assert.throws(()=>validateState({...s,eco:{...s.eco,published:false}}));assert.throws(()=>validateState({...s,case:{...s.case,corrected:false}}));
 }
 const end=at('complete');
 for(const [key,value] of Object.entries(initialMask()))if(typeof value==='boolean')assert.throws(()=>validateState({...end,mask:{...end.mask,[key]:false}}),key);
 for(const id of Object.values(MASK_DOCS).flat())assert.throws(()=>validateState({...end,mask:{...end.mask,read:end.mask.read.filter(v=>v!==id)}}),id);
 for(const patch of [{published:true},{approach:'public'},{read:['receipt']},{proof:{...MASK_PROOF}},{network:['photo','photo',null,null]}])assert.throws(()=>validateState({...at('opening'),mask:{...initialMask(),...patch}}));
 assert.throws(()=>validateState({...end,stage:'morning-complete'}));
});

test('Every text, preview, hint and saved notebook works in three languages, with visible correction and scoped sources',()=>{
 for(const [key,entry] of Object.entries(MASK_COPY)){assert.equal(entry.length,3,key);for(const text of entry)assert.ok(text.trim(),key);assert.match(entry[2],/[\u0600-\u06ff]/,key);const slots=s=>[...s.matchAll(/\{\w+\}/g)].map(m=>m[0]).sort();assert.deepEqual(slots(entry[0]),slots(entry[1]));assert.deepEqual(slots(entry[0]),slots(entry[2]));}
 assert.ok(MESSAGES['Die Maskenstadt überspringt eine notwendige Handlung.']['ar-EG']);
 for(const locale of ['de','en','ar-EG']){setLanguage(locale);for(const stage of MASK_STAGES){const s=snapshots[stage];assert.ok(maskMeta(stage)[1]);for(let n=1;n<=3;n++)assert.ok(maskHint(stage,n));assert.ok(maskView(s,{button:(a,label)=>label,actor:()=>'',scene:()=>'',esc:x=>x,feedback:''}));for(const notes of [maskNotebook,morningNotebook,ecoNotebook,caseNotebook])assert.ok(notes(s,x=>x));for(let i=0,state=s;i<4;i++){state=step(state,'HINT');assert.equal(state.hints[stage],Math.min(3,i+1));}}
  for(const id of Object.values(MASK_DOCS).flat())assert.ok(maskDocument(id).text);
  for(const naming of ['name','role'])for(const text of [maskArticle({...at('complete').mask,naming}),maskCorrection({...at('complete').mask,naming})])if(naming==='role')assert.ok(!text.includes(locale==='ar-EG'?'ليلى':'Leila'));
  const s=at('correction');s.mask.proof={...MASK_PROOF};s.mask.proofChecked=true;s.mask.admitted=true;s.mask.reposted=true;assert.ok(maskView(s,{button:(a,label)=>label,actor:()=>'',scene:()=>'',esc:x=>x,feedback:''}).includes('<del>'));
  assert.match(maskDiagram('frame','tight',x=>x),/110 0 120 110/);assert.match(maskDiagram('frame','full',x=>x),/0 0 340 110/);
 }setLanguage('de');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,reduce,validateState,VERSION} from '../dist/state.js';
import {MORNING_STAGES,MORNING_DOCS,SOURCE_MODEL,CLAIM_MODEL,PRIVACY_MODEL,PRESERVE_ORDER,MORNING_ORDER,initialMorning} from '../dist/morning-state.js';
import {MORNING_COPY} from '../dist/morning-copy.js';
import {morningMeta,morningHint,morningView,morningDocument,morningNotebook,morningArticle} from '../dist/morning-ui.js';
import {caseNotebook} from '../dist/case-ui.js';
import {ecoNotebook} from '../dist/eco-ui.js';
import {setLanguage} from '../dist/i18n.js';
import {MESSAGES} from '../dist/messages.js';
import {levelOne,finishCase,finishEco,finishMorning} from './support.mjs';
const step=(s,type,rest={})=>reduce(s,{type,...rest});
const round=s=>assert.deepEqual(validateState(JSON.parse(JSON.stringify(s))),s);
const history=s=>Object.fromEntries(Object.entries(s).filter(([key])=>!['version','stage','morning','hints'].includes(key)));
const snapshots={};finishMorning(finishEco(finishCase(levelOne())),'open','anonymous',s=>{snapshots[s.stage]??=s;});
const at=phase=>structuredClone(snapshots['morning-'+phase]);
const recover=s=>assert.equal(finishMorning(s).stage,'morning-complete');
const product=(values,count)=>count?product(values,count-1).flatMap(t=>values.map(v=>[...t,v])):[[]];

test('Version 6 migration at every old action preserves all three levels; eco-complete continues without restart',()=>{
 const states=[initialState()],end=finishEco(finishCase(levelOne('research','directions',s=>states.push(s)),'name','document',s=>states.push(s)),'doubt','visit',s=>states.push(s));
 for(const s of states){const old={...s,version:6};delete old.morning;const before=structuredClone(old);assert.deepEqual(validateState(old),s);assert.deepEqual(old,before);}
 const old={...end,version:6};delete old.morning;const next=step(validateState(old),'MORNING_START');assert.equal(next.stage,'morning-opening');assert.deepEqual(history(next),history(old));assert.equal(VERSION,8);
 assert.deepEqual(step(finishCase(levelOne()),'MORNING_START'),finishCase(levelOne()));
 for(const version of [1,2,3,4,5,6])for(const stage of MORNING_STAGES)assert.throws(()=>validateState({...at('complete'),stage,version}));
});

test('All 256 combinations of eight decisions remain saveable after every Level 4 action, with immutable past',()=>{
 for(const a of ['fear','research'])for(const b of ['ask','directions'])for(const d of ['name','anonymous'])for(const e of ['omit','document'])for(const f of ['error','doubt'])for(const g of ['warning','visit'])for(const pressure of ['open','direct'])for(const naming of ['name','anonymous']){
  const start=finishEco(finishCase(levelOne(a,b),d,e),f,g),before=structuredClone(start);
  const end=finishMorning(start,pressure,naming,s=>{round(s);assert.deepEqual(history(s),history(start));});
  assert.equal(end.stage,'morning-complete');assert.equal(end.morning.pressure,pressure);assert.equal(end.morning.naming,naming);assert.deepEqual(start,before);
  assert.equal(ecoNotebook(end,x=>x),ecoNotebook(start,x=>x));assert.equal(caseNotebook(end,x=>x),caseNotebook(start,x=>x));
  for(const type of ['MORNING_START','MORNING_REVISE','MORNING_READ','MORNING_PICK','MORNING_PUBLISH','ECO_ACCUSE','CASE_CONSENT'])assert.deepEqual(step(end,type,{id:'name'}),end);
 }
});

test('All 256 source read/classification combinations: repeated clips are not independent evidence',()=>{
 const ids=Object.keys(SOURCE_MODEL);
 for(let mask=0;mask<16;mask++)for(const vals of product(['independent','derived'],4)){
  const s=at('sources');s.morning.read.push(...ids.filter((_,i)=>mask&(1<<i)));s.morning.sources=Object.fromEntries(ids.map((id,i)=>[id,vals[i]]));round(s);
  const next=step(s,'MORNING_CHECK');assert.equal(next.morning.sourcesChecked,mask===15&&vals.join()==='independent,independent,independent,derived');recover(next);
 }
});

test('All 34 preservation and 209 timeline partial orders are editable and recoverable',()=>{
 for(const [phase,ids,flag,expected] of [['preserve',PRESERVE_ORDER,'preserved',34],['timeline',MORNING_ORDER,'timelineChecked',209]]){
  let count=0;
  for(const vals of product([null,...ids],ids.length)){
   const used=vals.filter(Boolean);if(new Set(used).size!==used.length)continue;count++;
   const s=at(phase);s.morning.read.push(...MORNING_DOCS[phase]);s.morning[phase]=vals;round(s);
   const next=step(s,'MORNING_CHECK');assert.equal(next.morning[flag],vals.join()===ids.join());recover(next);
  }assert.equal(count,expected);
 }
 let s=at('timeline');s=step(s,'MORNING_ORDER',{index:0,id:'stock'});s=step(s,'MORNING_ORDER',{index:1,id:'stock'});assert.deepEqual(s.morning.timeline,[null,'stock',null,null]);round(s);
});

test('Clock needs two observed pairs and limited scope; models need the current inspection',()=>{
 for(const time of [null,'1720','1810','1900'])for(const scope of [null,'interval','always'])for(const read of [false,true]){
  const s=at('clock');s.morning.time=time;s.morning.scope=scope;if(read)s.morning.read.push('calibration');round(s);
  assert.equal(step(s,'MORNING_CHECK').morning.clockChecked,read&&time==='1810'&&scope==='interval');recover(s);
 }
 for(const vals of product([null,'box','later','found'],3)){
  const s=at('model');s.morning.model=Object.fromEntries(Object.keys(CLAIM_MODEL).map((id,i)=>[id,vals[i]]));
  assert.ok(!step(s,'MORNING_CHECK').morning.modelChecked);s.morning.read.push('inspection');round(s);
  assert.equal(step(s,'MORNING_CHECK').morning.modelChecked,vals.join()==='box,later,found');recover(s);
 }
});

test('All 486 publication classifications and both naming permissions; private material cannot be published',()=>{
 for(const naming of ['name','anonymous'])for(const vals of product(['publish','mask','omit'],5)){
  const s=at('privacy');s.morning.read.push('consent');s.morning.naming=naming;s.morning.privacy=Object.fromEntries(Object.keys(PRIVACY_MODEL).map((id,i)=>[id,vals[i]]));round(s);
  const next=step(s,'MORNING_CHECK');assert.equal(next.morning.privacyChecked,vals.join()==='publish,publish,mask,omit,omit');recover(next);
 }
 let s=at('publish');assert.deepEqual(step(s,'MORNING_GROUP'),s);assert.deepEqual(step(s,'MORNING_PUBLISH'),s);assert.deepEqual(step(s,'MORNING_NEXT'),s);
 s=step(s,'MORNING_REVISE');assert.deepEqual(step(s,'MORNING_PUBLISH'),s);s=step(s,'MORNING_GROUP');assert.deepEqual(step(s,'MORNING_NEXT'),s);s=step(s,'MORNING_PUBLISH');round(s);assert.equal(step(s,'MORNING_NEXT').stage,'morning-complete');
});

test('Every checkpoint rejects skipped prerequisites, future progress and broken old histories',()=>{
 for(const stage of MORNING_STAGES)assert.throws(()=>validateState({...initialState(),stage}));
 for(const [stage,s] of Object.entries(snapshots)){
  round(s);
  const ahead=MORNING_STAGES.slice(MORNING_STAGES.indexOf(stage)+1);
  for(const next of ahead)assert.throws(()=>validateState({...s,stage:next}));
  assert.throws(()=>validateState({...s,eco:{...s.eco,published:false}}));assert.throws(()=>validateState({...s,case:{...s.case,corrected:false}}));
 }
 const end=at('complete');
 for(const key of ['dissented','methodChecked','sourcesChecked','preserved','clockChecked','timelineChecked','modelChecked','privacyChecked','revised','groupCorrected','published'])assert.throws(()=>validateState({...end,morning:{...end.morning,[key]:false}}),key);
 for(const id of Object.values(MORNING_DOCS).flat())assert.throws(()=>validateState({...end,morning:{...end.morning,read:end.morning.read.filter(v=>v!==id)}}),id);
 for(const patch of [{published:true},{pressure:'open'},{read:['consent']},{time:'1810'},{preserve:['copy','copy',null]},{read:['allegation','allegation']}])assert.throws(()=>validateState({...at('opening'),morning:{...initialMorning(),...patch}}));
 assert.throws(()=>validateState({...end,stage:'eco-complete'}));
});

test('All texts, documents, hints, live views and inherited notebooks work in three languages',()=>{
 for(const [key,entry] of Object.entries(MORNING_COPY)){assert.equal(entry.length,3,key);for(const text of entry)assert.ok(text.trim(),key);assert.match(entry[2],/[\u0600-\u06ff]/,key);const fields=s=>[...s.matchAll(/\{\w+\}/g)].map(m=>m[0]).sort();assert.deepEqual(fields(entry[0]),fields(entry[1]));assert.deepEqual(fields(entry[0]),fields(entry[2]));}
 assert.ok(MESSAGES['Der Morgenfall überspringt eine notwendige Handlung.']['ar-EG']);
 for(const locale of ['de','en','ar-EG']){setLanguage(locale);for(const stage of MORNING_STAGES){const s=snapshots[stage];assert.ok(morningMeta(stage)[1]);for(let n=1;n<=3;n++)assert.ok(morningHint(stage,n));assert.ok(morningView(s,{button:(a,label)=>label,actor:()=>'',scene:()=>'',esc:x=>x,feedback:''}));assert.ok(morningNotebook(s,x=>x));assert.ok(ecoNotebook(s,x=>x));assert.ok(caseNotebook(s,x=>x));for(let n=0,state=s;n<4;n++){state=step(state,'HINT');assert.equal(state.hints[stage],Math.min(n+1,3));}}
  for(const id of Object.values(MORNING_DOCS).flat())assert.ok(morningDocument(id).text);
  for(const naming of ['name','anonymous']){const article=morningArticle({...at('complete').morning,naming});assert.ok(article.includes('18:14'));if(naming==='anonymous')assert.ok(!article.includes(locale==='ar-EG'?'مارا':'Mara'));}
 }setLanguage('de');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,reduce,validateState,VERSION} from '../dist/state.js';
import {ECO_STAGES,SAMPLE_IDS,ECO_MODEL,STOP_ORDER,initialEco} from '../dist/eco-state.js';
import {ECO_COPY} from '../dist/eco-copy.js';
import {ecoHint,ecoMeta,ecoView,ecoNotebook,ecoDocument} from '../dist/eco-ui.js';
import {caseNotebook} from '../dist/case-ui.js';
import {setLanguage} from '../dist/i18n.js';
import {levelOne,finishCase,finishEco} from './support.mjs';
const step=(s,type,extra={})=>reduce(s,{type,...extra});
const round=s=>assert.deepEqual(validateState(JSON.parse(JSON.stringify(s))),s);
const checkpoints={};finishEco(finishCase(levelOne()),'error','warning',s=>{checkpoints[s.stage]??=s;});
const at=stage=>structuredClone(checkpoints['eco-'+stage]);
const history=s=>Object.fromEntries(Object.entries(s).filter(([key])=>!['version','stage','eco','hints'].includes(key)));

test('Version 5: every previous scene migrates without mutation; completed case starts Level 3 directly',()=>{
 const snapshots=[initialState()];const end=levelOne('research','directions',s=>snapshots.push(s));finishCase(end,'name','document',s=>snapshots.push(s));
 for(const s of snapshots){const legacy={...s,version:5};delete legacy.eco;const original=structuredClone(legacy);assert.deepEqual(validateState(legacy),s);assert.deepEqual(legacy,original);}
 const old={...finishCase(end),version:5};delete old.eco;
 const next=step(validateState(old),'ECO_START');assert.equal(next.stage,'eco-opening');assert.deepEqual(history(next),history(old));assert.equal(VERSION,8);
 assert.deepEqual(step(levelOne(),'ECO_START'),levelOne());
 for(const stage of ECO_STAGES)assert.throws(()=>validateState({...at('complete'),stage,version:5}));
});

test('All 64 combinations of previous and new choices preserve history and save after every action',()=>{
 for(const choice of ['fear','research'])for(const owl of ['ask','directions'])for(const consent of ['name','anonymous'])for(const withdrawal of ['omit','document'])for(const reflection of ['error','doubt'])for(const approach of ['warning','visit']){
  const start=finishCase(levelOne(choice,owl),consent,withdrawal),before=structuredClone(start);
  const end=finishEco(start,reflection,approach,s=>{round(s);assert.deepEqual(history(s),history(start));});
  assert.equal(end.stage,'eco-complete');assert.equal(end.eco.reflection,reflection);assert.equal(end.eco.approach,approach);assert.deepEqual(start,before);assert.equal(caseNotebook(end,x=>x),caseNotebook(start,x=>x));
  for(const type of ['ECO_START','ECO_APOLOGIZE','ECO_RESTORE','CASE_CONSENT','CASE_PRINT'])assert.deepEqual(step(end,type,{id:'name'}),end);
 }
});

test('All 384 partial sample comparisons: colour alone and missing observations never confirm; every failure recoverable',()=>{
 for(let mask=0;mask<64;mask++)for(const rise of ['a','b','c'])for(const window of ['morning','all']){
  let s=at('samples');s.eco.samples=SAMPLE_IDS.filter((_,i)=>mask&(1<<i));s.eco.rise=rise;s.eco.window=window;round(s);
  const next=step(s,'ECO_COMPARE');assert.equal(next.eco.compared,mask===63&&rise==='b'&&window==='morning');
  assert.equal(step(next,'ECO_INTERVIEWS').stage,next.eco.compared?'eco-interviews':'eco-samples');assert.equal(finishEco(next).stage,'eco-complete');
 }
});

test('Dina must read all logs and distinguish gate from valve; every partial causal model remains editable',()=>{
 for(let mask=0;mask<8;mask++)for(const contradiction of ['dyer','gate','valve']){
  const s=at('interviews');s.eco.interviews=['dyer','gate','valve'].filter((_,i)=>mask&(1<<i));s.eco.contradiction=contradiction;round(s);
  assert.equal(step(s,'ECO_CHECK_INTERVIEW').eco.interviewChecked,mask===7&&contradiction==='valve');assert.equal(finishEco(s).stage,'eco-complete');
 }
 for(const load of [null,'depot','source','unproven'])for(const mist of [null,'depot','source','unproven'])for(const blue of [null,'depot','source','unproven']){
  const s=at('model');s.eco.model={load,mist,blue};round(s);assert.equal(step(s,'ECO_LINK').eco.linked,load==='depot'&&mist==='source'&&blue==='unproven');assert.equal(finishEco(s).stage,'eco-complete');
 }
});

test('Accusation and public correction have playable consequences; apology and responses cannot be skipped',()=>{
 let s=at('spark');assert.deepEqual(step(s,'ECO_ACCUSE'),s);s=step(s,'ECO_SAMPLE');s=step(s,'ECO_ACCUSE');assert.equal(s.stage,'eco-keeper');assert.ok(s.eco.accused);
 s=at('correction');assert.deepEqual(step(s,'ECO_APOLOGIZE'),s);assert.deepEqual(step(s,'ECO_RESPONSE'),s);
 for(const value of ['harmless','intent']){const wrong=step(s,'ECO_PICK',{id:'replacement',value});assert.deepEqual(step(wrong,'ECO_REPOST'),wrong);assert.equal(finishEco(wrong).stage,'eco-complete');}
 s=step(s,'ECO_PICK',{id:'replacement',value:'evidence'});s=step(s,'ECO_REPOST');assert.deepEqual(step(s,'ECO_RESPONSE'),s);s=step(s,'ECO_APOLOGIZE');assert.equal(step(s,'ECO_RESPONSE').stage,'eco-response');
 const response=at('response');assert.deepEqual(step(response,'ECO_STOP_START'),response);
});

test('All 34 partial intervention orders and both spring inlets; neither repair substitutes for the other',()=>{
 let count=0;
 for(const a of [null,...STOP_ORDER])for(const b of [null,...STOP_ORDER])for(const c of [null,...STOP_ORDER]){
  const order=[a,b,c],used=order.filter(Boolean);if(new Set(used).size!==used.length)continue;count++;
  const s=at('stop');s.eco.order=order;round(s);assert.equal(step(s,'ECO_STOP').eco.stopped,JSON.stringify(order)===JSON.stringify(STOP_ORDER));assert.equal(finishEco(s).stage,'eco-complete');
 }assert.equal(count,34);
 let s=at('source');assert.ok(s.eco.stopped);assert.ok(!s.eco.restored);assert.deepEqual(step(s,'ECO_VERIFY'),s);assert.deepEqual(step(s,'ECO_CLEAR'),s);
 s=step(s,'ECO_INSPECT');s=step(s,'ECO_CLEAR');s=step(s,'ECO_PICK',{id:'inlet',value:'depot'});assert.deepEqual(step(s,'ECO_RESTORE'),s);round(s);
 s=step(s,'ECO_PICK',{id:'inlet',value:'clean'});s=step(s,'ECO_RESTORE');assert.ok(s.eco.restored);round(s);
 s=step(s,'ECO_VERIFY');assert.deepEqual(step(s,'ECO_PUBLISH'),s);s=step(s,'ECO_READ',{id:'water'});assert.deepEqual(step(s,'ECO_PUBLISH'),s);s=step(s,'ECO_READ',{id:'roots'});s=step(s,'ECO_PUBLISH');assert.equal(step(s,'ECO_FINISH').stage,'eco-complete');
});

test('Manufactured future progress, missing past research and incomplete interventions are rejected',()=>{
 for(const stage of ECO_STAGES)assert.throws(()=>validateState({...initialState(),stage}));
 const opening=at('opening'),end=at('complete');
 for(const patch of [{samples:['a6']},{accused:true},{apologized:true},{stopped:true},{restored:true},{checks:['water']},{published:true},{samples:['a6','a6']},{model:{...ECO_MODEL}},{order:['close','close',null]}])assert.throws(()=>validateState({...opening,eco:{...initialEco(),...patch}}));
 for(const field of ['briefed','sampleSeen','accused','compared','interviewChecked','linked','reposted','apologized','stopped','inspected','cleared','restored','published'])assert.throws(()=>validateState({...end,eco:{...end.eco,[field]:false}}),field);
 assert.throws(()=>validateState({...end,case:{...end.case,corrected:false}}));assert.throws(()=>validateState({...end,eco:{...end.eco,checks:['water']}}));assert.throws(()=>validateState({...levelOne(),eco:end.eco}));
 for(const stage of ['intro','case-opening','case-complete'])assert.throws(()=>validateState({...end,stage}));
});

test('All episode text, hints, dynamic views and both earlier notebooks remain available in all three languages',()=>{
 for(const [key,entry] of Object.entries(ECO_COPY)){assert.equal(entry.length,3,key);entry.forEach(text=>assert.ok(text.trim(),key));assert.match(entry[2],/[\u0600-\u06ff]/,key);const fields=v=>[...v.matchAll(/\{\w+\}/g)].map(m=>m[0]).sort();assert.deepEqual(fields(entry[0]),fields(entry[1]));assert.deepEqual(fields(entry[0]),fields(entry[2]));}
 for(const locale of ['de','en','ar-EG']){setLanguage(locale);for(const stage of ECO_STAGES){const s=checkpoints[stage];assert.ok(ecoMeta(stage)[1]);for(let level=1;level<=3;level++)assert.ok(ecoHint(stage,level));assert.ok(ecoView(s,{button:(a,label)=>label,actor:()=>'',scene:()=>'',esc:x=>x,feedback:''}));assert.ok(ecoNotebook(s,x=>x));assert.ok(caseNotebook(s,x=>x));let n=s;for(let i=0;i<4;i++)n=step(n,'HINT');assert.equal(n.hints[stage],3);}for(const id of [...SAMPLE_IDS,'brief','dyer','gate','valve','depot','salma','water','roots'])assert.ok(ecoDocument(id).text);}
 setLanguage('de');
});

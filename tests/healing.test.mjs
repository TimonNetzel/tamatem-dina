import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,reduce,validateState,VERSION} from '../dist/state.js';
import {HEALING_STAGES,HEALING_PHASES,HEALING_DOCS,HEALING_OPTIONS,HEALING_SOLUTIONS,HEALING_ORDER,initialHealing,healingCheck} from '../dist/healing-state.js';
import {HEALING_COPY} from '../dist/healing-copy.js';
import {healingText,healingMeta,healingView,healingDocument,healingHint,healingNotebook,healingArticle} from '../dist/healing-ui.js';
import {maskNotebook} from '../dist/mask-ui.js';
import {morningNotebook} from '../dist/morning-ui.js';
import {ecoNotebook} from '../dist/eco-ui.js';
import {caseNotebook} from '../dist/case-ui.js';
import {MESSAGES} from '../dist/messages.js';
import {setLanguage} from '../dist/i18n.js';
import {levelOne,finishCase,finishEco,finishMorning,finishMask,finishHealing} from './support.mjs';
const round=s=>assert.deepEqual(validateState(JSON.parse(JSON.stringify(s))),s);
const step=(s,type,rest={})=>reduce(s,{type,...rest});
const base=()=>finishMask(finishMorning(finishEco(finishCase(levelOne()))));
const snaps={};const end=finishHealing(base(),'doubt','written',s=>{snaps[s.stage]??=s;round(s);});
const at=p=>structuredClone(snaps['healing-'+p]);
const history=s=>Object.fromEntries(Object.entries(s).filter(([k])=>!['healing','stage','hints','version'].includes(k)));
const product=(entries)=>entries.reduce((rows,[key,values])=>rows.flatMap(row=>values.map(v=>({...row,[key]:v}))),[{}]);

test('Version 8 exact field sets migrate after every old action without reset, including all mask partial states',()=>{
 const states=[initialState()],collect=s=>states.push(s);
 const oldEnd=finishMask(finishMorning(finishEco(finishCase(levelOne('research','directions',collect),'anonymous','document',collect),'doubt','visit',collect),'direct','anonymous',collect),'quiet','name','talk',collect);
 for(const s of states){const old=structuredClone(s);old.version=8;delete old.healing;const copy=structuredClone(old);assert.deepEqual(validateState(old),s);assert.deepEqual(old,copy);}
 const old={...oldEnd,version:8};delete old.healing;const next=step(validateState(old),'HEALING_START');assert.equal(next.stage,'healing-opening');assert.deepEqual(history(next),history(old));assert.equal(VERSION,9);
 assert.deepEqual(step(initialState(),'HEALING_START'),initialState());
 for(const version of [1,2,3,4,5,6,7,8])for(const stage of HEALING_STAGES)assert.throws(()=>validateState({...end,version,stage}));
});

test('All four new decision combinations preserve histories for 32 varied inherited decision profiles and save each action',()=>{
 for(let bits=0;bits<32;bits++){
  const choose=(a,b,i)=>bits&(1<<i)?a:b;
  const old=finishMask(finishMorning(finishEco(finishCase(levelOne(choose('fear','research',0),choose('ask','directions',1)),choose('name','anonymous',2),choose('omit','document',3)),choose('error','doubt',4),choose('warning','visit',0)),choose('open','direct',1),choose('name','anonymous',2)),choose('quiet','public',3),choose('name','role',4),choose('talk','boundary',0));
  for(const approach of ['doubt','together'])for(const responseMode of ['written','meeting']){
   const result=finishHealing(old,approach,responseMode,round);assert.equal(result.stage,'healing-complete');assert.deepEqual(history(result),history(old));assert.equal(result.healing.picks.approach,approach);assert.equal(result.healing.picks.responseMode,responseMode);
   for(const type of ['HEALING_START','HEALING_PICK','HEALING_PUBLISH','MASK_ADMIT','MORNING_GROUP','ECO_ACCUSE','CASE_CONSENT'])assert.deepEqual(step(result,type,{id:'wording',value:'cure'}),result);
  }
 }
});

test('All partial option combinations require matching documents; failed attempts remain completable',()=>{
 for(const [p,fields] of Object.entries(HEALING_OPTIONS))for(const picks of product(Object.entries(fields).map(([id,values])=>[id,[null,...values]])))for(const read of [false,true]){
  const s=at(p);for(const [id,value] of Object.entries(picks))if(value!==null)s.healing.picks[id]=value;
  if(read)s.healing.read.push(...HEALING_DOCS[p]);round(s);
  const next=step(s,'HEALING_CHECK');assert.equal(next.healing.checked.includes(p),healingCheck(s.healing,p));assert.equal(finishHealing(next).stage,'healing-complete');
 }
});

test('Every proper document subset blocks confirmation even with correct selections',()=>{
 for(const p of HEALING_PHASES)for(let mask=0;mask<(1<<HEALING_DOCS[p].length)-1;mask++){
  const s=at(p);s.healing.read.push(...HEALING_DOCS[p].filter((_,i)=>mask&(1<<i)));
  for(const [id,v] of Object.entries(HEALING_SOLUTIONS[p]||{}))s.healing.picks[id]=Array.isArray(v)?v[0]:v;
  if(p==='chain')s.healing.order=[...HEALING_ORDER];round(s);assert.equal(healingCheck(s.healing,p),false);assert.deepEqual(step(s,'HEALING_CHECK'),s);assert.equal(finishHealing(s).stage,'healing-complete');
 }
});

test('209 partial unique chronologies; source discussion, meeting, revision and publication cannot be skipped',()=>{
 let count=0;
 const enumerate=(slots=[])=>{if(slots.length===4){if(new Set(slots.filter(Boolean)).size!==slots.filter(Boolean).length)return;count++;const s=at('chain');s.healing.read.push(...HEALING_DOCS.chain);s.healing.order=slots;round(s);assert.equal(step(s,'HEALING_CHECK').healing.checked.includes('chain'),slots.join()===HEALING_ORDER.join());assert.equal(finishHealing(s).stage,'healing-complete');return;}for(const id of [null,...HEALING_ORDER])enumerate([...slots,id]);};enumerate();assert.equal(count,209);
 let s=at('chain');s=step(s,'HEALING_ORDER',{index:0,id:'effective'});s=step(s,'HEALING_ORDER',{index:1,id:'effective'});assert.deepEqual(s.healing.order,[null,'effective',null,null]);
 for(const [p,action,flag] of [['protect','HEALING_PROTECT','protected'],['chain','HEALING_MEET','met'],['revise','HEALING_REVISE','revised'],['publish','HEALING_APPROVE','approved']]){
  const pending=at(p);assert.deepEqual(step(pending,action),pending);assert.deepEqual(step(pending,'HEALING_NEXT'),pending);
  let checked=structuredClone(end);checked.stage='healing-'+p; // use a real in-phase snapshot collected below, not future fields
  finishHealing(at(p),'doubt','written',point=>{if(point.stage==='healing-'+p&&point.healing.checked.includes(p)&&!point.healing[flag])checked=point;});
  round(checked);assert.deepEqual(step(checked,'HEALING_NEXT'),checked);assert.equal(step(checked,action).healing[flag],true);
  if(p==='publish'){assert.deepEqual(step(checked,'HEALING_PUBLISH'),checked);checked=step(checked,action);assert.deepEqual(step(checked,'HEALING_NEXT'),checked);}
 }
});

test('Forged future progress, invalid fields, skipped source protection and broken old histories are rejected',()=>{
 for(const stage of HEALING_STAGES)assert.throws(()=>validateState({...initialState(),stage}));
 for(const [stage,s] of Object.entries(snaps)){round(s);for(const future of HEALING_STAGES.slice(HEALING_STAGES.indexOf(stage)+1))assert.throws(()=>validateState({...s,stage:future}));}
 for(const flag of ['protected','met','revised','approved','published'])assert.throws(()=>validateState({...end,healing:{...end.healing,[flag]:false}}));
 for(const p of HEALING_PHASES)assert.throws(()=>validateState({...end,healing:{...end.healing,checked:end.healing.checked.filter(id=>id!==p)}}));
 for(const id of Object.values(HEALING_DOCS).flat())assert.throws(()=>validateState({...end,healing:{...end.healing,read:end.healing.read.filter(v=>v!==id)}}));
 for(const patch of [{protected:true},{read:['risk']},{picks:{available:'forty'}},{picks:{unknown:'yes'}},{order:['ordered','ordered',null,null]},{checked:['opening']}])assert.throws(()=>validateState({...at('opening'),healing:{...initialHealing(),...patch}}));
 for(const [field,flag] of [['case','published'],['eco','published'],['morning','published'],['mask','reposted']])assert.throws(()=>validateState({...end,[field]:{...end[field],[flag]:false}}));
});

test('Every document, option, feedback and all 36 hints render in three languages; five earlier notebooks remain',()=>{
 for(const [key,entry] of Object.entries(HEALING_COPY)){assert.equal(entry.length,3,key);for(const s of entry)assert.ok(s.trim(),key);assert.match(entry[2],/[\u0600-\u06ff]/,key);const slots=s=>[...s.matchAll(/\{\w+\}/g)].map(m=>m[0]).sort();assert.deepEqual(slots(entry[0]),slots(entry[1]),key);assert.deepEqual(slots(entry[0]),slots(entry[2]),key);}
 for(const language of ['de','en','ar-EG']){setLanguage(language);for(const stage of HEALING_STAGES){const s=snaps[stage];assert.ok(healingMeta(stage)[1]);for(let n=1;n<=3;n++)assert.ok(healingHint(stage,n));assert.ok(healingView(s,{button:(a,l)=>l,actor:()=>'',scene:()=>'',esc:x=>x,feedback:''}));for(const notes of [healingNotebook,maskNotebook,morningNotebook,ecoNotebook,caseNotebook])assert.ok(notes(s,x=>x));}
  for(const id of Object.values(HEALING_DOCS).flat())assert.ok(healingDocument(id).text);
  for(const id of ['permission','origin','withdrawal','risk'])assert.ok(!healingArticle().includes(healingDocument(id).text));assert.ok(healingText('correction'));
 }
 setLanguage('de');assert.ok(MESSAGES['Die Heilungsrecherche überspringt eine notwendige Handlung.']);
});

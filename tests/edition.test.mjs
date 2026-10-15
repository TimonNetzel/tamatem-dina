import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,reduce,validateState,VERSION} from '../dist/state.js';
import {EDITION_PHASES,EDITION_STAGES,EDITION_DOCS,EDITION_OPTIONS,EDITION_ORDER,editionSolutions,editionConsequences,editionCheck,initialEdition} from '../dist/edition-state.js';
import {EDITION_COPY} from '../dist/edition-copy.js';
import {editionText,editionView,editionDocument,editionHint,editionMeta,editionNotebook,editionArticle,editionPlans,editionConsequencesText} from '../dist/edition-ui.js';
import {healingNotebook} from '../dist/healing-ui.js';
import {maskNotebook} from '../dist/mask-ui.js';
import {morningNotebook} from '../dist/morning-ui.js';
import {ecoNotebook} from '../dist/eco-ui.js';
import {caseNotebook} from '../dist/case-ui.js';
import {setLanguage} from '../dist/i18n.js';
import {levelOne,finishCase,finishEco,finishMorning,finishMask,finishHealing,finishEdition} from './support.mjs';
const base=()=>finishHealing(finishMask(finishMorning(finishEco(finishCase(levelOne())))));
const step=(s,type,rest={})=>reduce(s,{type,...rest});
const round=s=>assert.deepEqual(validateState(JSON.parse(JSON.stringify(s))),s);
const history=s=>Object.fromEntries(Object.entries(s).filter(([k])=>!['edition','stage','hints','version'].includes(k)));
const snaps={},end=finishEdition(base(),{},s=>{snaps[s.stage]??=s;round(s);});
const at=p=>structuredClone(snaps['edition-'+p]);
const product=entries=>entries.reduce((rows,[id,values])=>rows.flatMap(row=>values.map(v=>({...row,[id]:v}))),[{}]);

test('Exact v9 field sets migrate after every old action, retain all six histories and offer direct finale entry',()=>{
 const states=[initialState()],collect=s=>states.push(s);
 const one=levelOne('research','directions',collect),two=finishCase(one,'anonymous','document',collect),three=finishEco(two,'doubt','visit',collect),four=finishMorning(three,'direct','anonymous',collect),five=finishMask(four,'quiet','role','boundary',collect),six=finishHealing(five,'together','meeting',collect);
 for(const s of states){const old=structuredClone(s);old.version=9;delete old.edition;const before=structuredClone(old);assert.deepEqual(validateState(old),s);assert.deepEqual(old,before);}
 assert.equal(step(validateState({...six,version:9,edition:undefined}),'EDITION_START').stage,'edition-opening');assert.equal(VERSION,10);
 assert.deepEqual(step(initialState(),'EDITION_START'),initialState());
 for(const version of [1,2,3,4,5,6,7,8,9])for(const stage of EDITION_STAGES)assert.throws(()=>validateState({...end,version,stage}));
});

test('4096 complete runs: every combination of eight consequential earlier choices and four independent new choices',()=>{
 const outcomes=new Set();
 for(let bits=0;bits<256;bits++){
  const pick=(i,a,b)=>bits&(1<<i)?a:b;
  const one=levelOne(pick(0,'fear','research'));
  const two=finishCase(one,pick(1,'name','anonymous'));
  const four=finishMorning(finishEco(two),pick(2,'open','direct'));
  const five=finishMask(four,pick(3,'public','quiet'),pick(4,'name','role'),pick(5,'talk','boundary'));
  const old=finishHealing(five,pick(6,'doubt','together'),pick(7,'written','meeting'));
  const f=editionConsequences(old);assert.equal(f.tenantRoute,bits&2?'introduction':'mediator');assert.equal(f.archiveRoute,bits&16?'appointment':'desk');assert.equal(f.sourceRoute,bits&128?'letter':'visit');assert.equal(editionSolutions(old,'agreement').reviewMode,bits&4?'publicReview':'writtenHandover');
  for(const choices of product(Object.entries({start:['questions','crosscheck'],dinaGoal:['collective','ownArchive'],cooperation:['scheduled','separate'],tamatemGoal:['local','mobile']}))){
   const result=finishEdition(old,choices,round);assert.equal(result.stage,'edition-complete');assert.deepEqual(history(result),history(old));assert.deepEqual(Object.fromEntries(Object.keys(choices).map(id=>[id,result.edition.picks[id]])),choices);
   outcomes.add([f.memory,f.tenantRoute,f.archiveRoute,f.sourceRoute,f.workflow,f.audience,f.question,f.doubt,JSON.stringify(choices)].join('|'));
   for(const type of ['EDITION_START','EDITION_PICK','EDITION_PUBLISH','HEALING_REVISE','MASK_ADMIT','MORNING_GROUP','ECO_ACCUSE','CASE_CONSENT'])assert.deepEqual(step(result,type,{id:'revision',value:'total'}),result);
  }
 }
 assert.equal(outcomes.size,4096);
});

test('All partial choice combinations and missing document subsets block invalid checks and remain recoverable',()=>{
 for(const [p,fields] of Object.entries(EDITION_OPTIONS))for(const picks of product(Object.entries(fields).map(([id,values])=>[id,[null,...values]])))for(const read of [false,true]){
  const s=at(p);for(const [id,value] of Object.entries(picks))if(value!==null)s.edition.picks[id]=value;
  if(read)s.edition.read.push(...EDITION_DOCS[p]);round(s);
  assert.equal(step(s,'EDITION_CHECK').edition.checked.includes(p),editionCheck(s,p));assert.equal(finishEdition(s).stage,'edition-complete');
 }
 for(const p of EDITION_PHASES)for(let mask=0;mask<(1<<EDITION_DOCS[p].length)-1;mask++){
  const s=at(p);s.edition.read.push(...EDITION_DOCS[p].filter((_,i)=>mask&(1<<i)));
  for(const [id,v] of Object.entries(editionSolutions(s,p)))s.edition.picks[id]=Array.isArray(v)?v[0]:v;
  if(p==='chain')s.edition.order=[...EDITION_ORDER];round(s);assert.equal(editionCheck(s,p),false);assert.deepEqual(step(s,'EDITION_CHECK'),s);assert.equal(finishEdition(s).stage,'edition-complete');
 }
});

test('209 partial chronologies and distinct source protection, meeting, signatures, approval and publication obligations',()=>{
 let count=0;const enumerate=(slots=[])=>{if(slots.length===4){if(new Set(slots.filter(Boolean)).size!==slots.filter(Boolean).length)return;count++;const s=at('chain');s.edition.read.push(...EDITION_DOCS.chain);s.edition.order=slots;round(s);assert.equal(step(s,'EDITION_CHECK').edition.checked.includes('chain'),slots.join()===EDITION_ORDER.join());assert.equal(finishEdition(s).stage,'edition-complete');return;}for(const id of [null,...EDITION_ORDER])enumerate([...slots,id]);};enumerate();assert.equal(count,209);
 const moved=step(step(at('chain'),'EDITION_ORDER',{index:0,id:'amendment'}),'EDITION_ORDER',{index:1,id:'amendment'});assert.deepEqual(moved.edition.order,[null,'amendment',null,null]);
 for(const [p,action,flag] of [['sources','PROTECT','protected'],['chain','MEET','met'],['agreement','SIGN','dinaSigned'],['future','AUTHOR','authored'],['publish','APPROVE','approved']]){
  const pending=at(p);assert.deepEqual(step(pending,'EDITION_'+action),pending);assert.deepEqual(step(pending,'EDITION_NEXT'),pending);
  let checked;finishEdition(at(p),{},s=>{if(s.stage==='edition-'+p&&s.edition.checked.includes(p)&&!s.edition[flag])checked=s;});
  round(checked);assert.deepEqual(step(checked,'EDITION_NEXT'),checked);assert.equal(step(checked,'EDITION_'+action).edition[flag],true);
  if(p==='publish'){assert.deepEqual(step(checked,'EDITION_PUBLISH'),checked);assert.deepEqual(step(step(checked,'EDITION_APPROVE'),'EDITION_NEXT'),step(checked,'EDITION_APPROVE'));}
 }
});

test('Forged old histories, mismatched inherited routes, future progress and skipped obligations are rejected',()=>{
 for(const stage of EDITION_STAGES)assert.throws(()=>validateState({...initialState(),stage}));
 for(const [stage,s] of Object.entries(snaps))for(const future of EDITION_STAGES.slice(EDITION_STAGES.indexOf(stage)+1))assert.throws(()=>validateState({...s,stage:future}));
 for(const flag of ['protected','met','dinaSigned','authored','approved','published'])assert.throws(()=>validateState({...end,edition:{...end.edition,[flag]:false}}));
 for(const p of EDITION_PHASES)assert.throws(()=>validateState({...end,edition:{...end.edition,checked:end.edition.checked.filter(id=>id!==p)}}));
 for(const id of Object.values(EDITION_DOCS).flat())assert.throws(()=>validateState({...end,edition:{...end.edition,read:end.edition.read.filter(v=>v!==id)}}));
 for(const patch of [{read:['keys']},{picks:{printCost:'2000'}},{picks:{unknown:'yes'}},{order:['bill','bill',null,null]},{checked:['opening']},{dinaSigned:true}])assert.throws(()=>validateState({...at('opening'),edition:{...initialEdition(),...patch}}));
 for(const [field,flag] of [['case','published'],['eco','published'],['morning','published'],['mask','reposted'],['healing','protected']])assert.throws(()=>validateState({...end,[field]:{...end[field],[flag]:false}}));
 for(const [id,value] of [['tenantRoute','introduction'],['archiveRoute','appointment'],['sourceRoute','visit'],['reviewMode','writtenHandover']])assert.throws(()=>validateState({...end,edition:{...end.edition,picks:{...end.edition.picks,[id]:value}}}));
});

test('Three complete languages, 36 hints, six earlier notebooks, public boundaries and genuinely different endings',()=>{
 for(const [key,e] of Object.entries(EDITION_COPY)){assert.equal(e.length,3,key);for(const text of e)assert.ok(text.trim(),key);assert.match(e[2],/[\u0600-\u06ff]/,key);const slots=text=>[...text.matchAll(/\{\w+\}/g)].map(m=>m[0]).sort();assert.deepEqual(slots(e[0]),slots(e[1]),key);assert.deepEqual(slots(e[0]),slots(e[2]),key);}
 for(const language of ['de','en','ar-EG']){
  setLanguage(language);
  for(const stage of EDITION_STAGES){const s=snaps[stage];assert.ok(editionMeta(stage)[1]);for(let n=1;n<=3;n++)assert.ok(editionHint(stage,n));assert.ok(editionView(s,{button:(a,l)=>l,actor:()=>'',scene:()=>'',esc:x=>x,feedback:''}));for(const notes of [editionNotebook,healingNotebook,maskNotebook,morningNotebook,ecoNotebook,caseNotebook])assert.ok(notes(s,x=>x));}
  for(const id of Object.values(EDITION_DOCS).flat())assert.ok(editionDocument(id,end).text);
  assert.ok(editionDocument('tenant',end).text.includes(editionText('mediatorNote')));assert.ok(editionDocument('archivist',end).text.includes(editionText('deskNote')));assert.ok(editionDocument('register',end).text.includes(editionText('letterNote')));
  assert.ok(!editionArticle().includes(editionText('old')));assert.ok(!editionArticle().includes(editionDocument('permission',end).text));assert.equal(editionConsequencesText(end).length,7);
  const changed=finishEdition(base(),{dinaGoal:'ownArchive',cooperation:'separate',tamatemGoal:'mobile'});assert.notEqual(editionPlans(changed),editionPlans(end));assert.ok(editionPlans(changed).includes(editionText('ownArchive')));assert.ok(editionPlans(changed).includes(editionText('mobile')));
 }
 setLanguage('de');
});

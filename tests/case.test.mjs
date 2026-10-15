import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {initialState,reduce,validateState,VERSION,STAGES} from '../dist/state.js';
import {CASE_STAGES,RECORD_IDS,initialCase} from '../dist/case-state.js';
import {CASE_COPY} from '../dist/case-copy.js';
import {caseHint,caseText,caseMeta,caseNotebook,caseView} from '../dist/case-ui.js';
import {setLanguage} from '../dist/i18n.js';
import {MESSAGES} from '../dist/messages.js';
import {levelOne,finishCase} from './support.mjs';
const step=(s,type,other={})=>reduce(s,{type,...other});
const round=s=>assert.deepEqual(validateState(JSON.parse(JSON.stringify(s))),s);
const history=s=>Object.fromEntries(Object.entries(s).filter(([key])=>!['version','case','stage','hints'].includes(key)));
const at=stage=>{let result;finishCase(levelOne(),'anonymous','omit',s=>{if(s.stage===stage&&!result)result=s;});return result;};

test('Version 4: jeder Level-1-Schritt migriert verlustfrei; Abschluss öffnet Level 2 ohne Neustart',()=>{
 const snapshots=[initialState()];const last=levelOne('research','directions',s=>snapshots.push(s));
 for(const s of snapshots){const old={...s,version:4};delete old.case;const copy=structuredClone(old),v=validateState(old);assert.deepEqual(v,s);assert.deepEqual(old,copy);}
 const old={...last,version:4};delete old.case;
 const next=step(validateState(old),'CASE_START');assert.equal(next.stage,'case-opening');assert.deepEqual(history(next),history(last));
 assert.deepEqual(step(initialState(),'CASE_START'),initialState());
 assert.throws(()=>validateState({...next,version:4}));assert.equal(VERSION,5);
});

test('Alle 16 Kombinationen alter und neuer Entscheidungen: jede Handlung speicherbar und abgeschlossene Vergangenheit unverändert',()=>{
 for(const choice of ['fear','research'])for(const owl of ['ask','directions'])for(const consent of ['name','anonymous'])for(const withdrawal of ['omit','document']){
  const start=levelOne(choice,owl),original=structuredClone(start),check=s=>{round(s);assert.deepEqual(history(s),history(start));};
  const end=finishCase(start,consent,withdrawal,check);assert.equal(end.stage,'case-complete');assert.equal(end.case.consent,consent);assert.equal(end.case.withdrawal,withdrawal);assert.ok(end.case.published);assert.deepEqual(start,original);
  for(const type of ['CASE_START','CASE_CONSENT','CASE_WITHDRAW','CASE_ORDER','CASE_CLAIM','CASE_PRINT'])assert.deepEqual(step(end,type,{id:'name',index:0,value:'open'}),end);
 }
});

test('Adressrätsel prüft alle 16 Auswahlen, ungelesene Karten und Fortsetzbarkeit nach jedem Fehlversuch',()=>{
 let base=at('case-records');assert.deepEqual(step(base,'CASE_SELECT',{id:'letter'}),base);
 for(const id of RECORD_IDS)base=step(base,'CASE_READ',{id});
 for(let mask=0;mask<16;mask++){
  let s=base;for(let i=0;i<4;i++)if(mask&(1<<i))s=step(s,'CASE_SELECT',{id:RECORD_IDS[i]});
  round(s);const checked=step(s,'CASE_ADDRESS');assert.equal(checked.case.addressChecked,mask===7);assert.equal(step(checked,'CASE_INTERVIEWS').stage,mask===7?'case-interviews':'case-records');
  assert.equal(finishCase(checked).stage,'case-complete');
 }
});

test('Dinas Einverständnis und Widerrufsentscheidung können nicht übersprungen werden',()=>{
 let s=at('case-interviews');for(const type of ['CASE_NORA','CASE_MEET','CASE_WITHDRAW','CASE_EDITOR','CASE_PRINT'])assert.deepEqual(step(s,type,{id:'document'}),s);
 s=step(s,'CASE_CONSENT',{id:'anonymous'});s=step(s,'CASE_NORA');assert.deepEqual(step(s,'CASE_CONSENT',{id:'name'}),s);
 s=step(s,'CASE_EMIL');assert.equal(step(s,'CASE_MEET').stage,'case-interviews');
 s=step(s,'CASE_WITHDRAW',{id:'omit'});assert.deepEqual(step(s,'CASE_WITHDRAW',{id:'document'}),s);assert.equal(step(s,'CASE_MEET').stage,'case-timeline');
});

test('Alle gültigen partiellen Zeitachsen und alle 64 redaktionellen Einstufungen bleiben lösbar',()=>{
 const timeline=at('case-timeline');let count=0;
 for(const a of [null,'sale','rent','complaint'])for(const b of [null,'sale','rent','complaint'])for(const c of [null,'sale','rent','complaint']){
  const order=[a,b,c],nonempty=order.filter(Boolean);if(new Set(nonempty).size!==nonempty.length)continue;
  const s={...timeline,case:{...timeline.case,order}};round(s);count++;const checked=step(s,'CASE_LINK');assert.equal(checked.case.linked,a==='sale'&&b==='rent'&&c==='complaint');assert.equal(finishCase(s).stage,'case-complete');
 }
 assert.equal(count,34);
 const editorial=at('case-editor');
 for(const a of [null,'verified','open','false'])for(const b of [null,'verified','open','false'])for(const c of [null,'verified','open','false']){
  const s={...editorial,case:{...editorial.case,claims:{abduction:a,complaints:b,motive:c}}};round(s);const checked=step(s,'CASE_CHECK');assert.equal(checked.case.checked,a==='false'&&b==='verified'&&c==='open');assert.equal(finishCase(s).stage,'case-complete');
 }
 let s=finishCase(editorial);assert.ok(s.case.corrected);
 assert.deepEqual(step(editorial,'CASE_CORRECT'),editorial);assert.deepEqual(step(editorial,'CASE_PRINT'),editorial);
});

test('Manipulierte Speicherstände umgehen weder Level 1 noch Recherche, Antworten oder Korrektur',()=>{
 for(const stage of CASE_STAGES)assert.throws(()=>validateState({...initialState(),stage}));
 const opening=at('case-opening'),end=finishCase(opening);
 for(const patch of [{addressChecked:true},{selected:['letter']},{consent:'unknown'},{nora:true},{withdrawal:'omit'},{order:['sale','sale',null]},{linked:true},{responses:['owner']},{claims:{abduction:'false',complaints:'verified',motive:'open'}},{checked:true},{corrected:true},{published:true}])assert.throws(()=>validateState({...opening,case:{...initialCase(),...patch}}));
 for(const patch of [{corrected:false},{published:false},{withdrawal:null},{responses:['owner']},{consent:null},{linked:false}])assert.throws(()=>validateState({...end,case:{...end.case,...patch}}));
 assert.throws(()=>validateState({...levelOne(),case:end.case}));
});

test('Alle neuen Texte, dynamischen Anzeigen, Hilfen und Fehlermeldungen sind dreisprachig',async()=>{
 for(const [key,entry] of Object.entries(CASE_COPY)){
  assert.equal(entry.length,3,key);for(const text of entry)assert.ok(text.trim(),key);
  assert.match(entry[2],/[\u0600-\u06ff]/,key);
  const fields=v=>[...v.matchAll(/\{\w+\}/g)].map(m=>m[0]).sort();assert.deepEqual(fields(entry[0]),fields(entry[1]),key);assert.deepEqual(fields(entry[0]),fields(entry[2]),key);
 }
 const source=await readFile(new URL('../dist/case-state.js',import.meta.url),'utf8');
 for(const [,key] of source.matchAll(/throw Error\('([^']+)'\)/g))assert.ok(MESSAGES[key]?.['ar-EG']);
 const checkpoints=CASE_STAGES.map(at);
 for(const locale of ['de','en','ar-EG']){
  setLanguage(locale);
  for(const [i,stage] of CASE_STAGES.entries()){
   const s=checkpoints[i];for(let level=1;level<=3;level++)assert.ok(caseHint(stage,level));assert.ok(caseMeta(stage)[1]);
   assert.ok(caseNotebook(s,x=>x));
   assert.ok(caseView(s,{button:(a,label)=>`<button>${label}</button>`,actor:()=>'',scene:()=>'',esc:x=>x,feedback:''}));
   assert.equal(step(step(step(step(s,'HINT'),'HINT'),'HINT'),'HINT').hints[stage],3);
  }
  assert.ok(caseText('help',{number:2}).includes('2'));
 }
 setLanguage('de');assert.ok(STAGES.includes('case-complete'));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,reduce,validateState,correctResearch,readyToLeave,ITEM_IDS} from '../dist/state.js';
import {sources,hints} from '../dist/data.js';
const apply=(s,...actions)=>actions.reduce(reduce,s);
function researched(){let s=apply(initialState(),{type:'START'});for(const [slot,id] of Object.entries({property:'field',place:'travel',identity:'drawing'}))s=apply(s,{type:'READ',id},{type:'ASSIGN',slot,id});return apply(s,{type:'VERIFY'});}
function ready(choice='fear'){return apply(researched(),{type:'RESEARCH_NEXT'},{type:'TALK',id:'dina'},{type:'TALK',id:'doctor'},{type:'ILLNESS_NEXT'},{type:'CHOOSE',id:choice},{type:'RESOLVE_NEXT'},{type:'TAKE_NOTE'},...ITEM_IDS.map(id=>({type:'PACK',id})));}
test('Unbelegte oder ungelesene Quellen öffnen den nächsten Abschnitt nicht',()=>{let s=apply(initialState(),{type:'START'},{type:'ASSIGN',slot:'property',id:'field'},{type:'VERIFY'},{type:'RESEARCH_NEXT'});assert.equal(s.stage,'research');assert.equal(s.assign.property,null);s=apply(s,{type:'READ',id:'advert'},{type:'ASSIGN',slot:'property',id:'advert'},{type:'VERIFY'});assert.equal(s.committed,false);});
test('Quellen werden nicht dupliziert; ein neu zugeordneter Beleg verlässt das alte Feld',()=>{const s=apply(initialState(),{type:'START'},{type:'READ',id:'field'},{type:'READ',id:'field'},{type:'ASSIGN',slot:'property',id:'field'},{type:'ASSIGN',slot:'place',id:'field'});assert.deepEqual(s.read,['field']);assert.equal(s.assign.property,null);assert.equal(s.assign.place,'field');});
test('Korrekte Recherche wird bestätigt und gegen versehentliches Ändern geschützt',()=>{const s=researched();assert.ok(correctResearch(s));assert.ok(s.committed);assert.deepEqual(reduce(s,{type:'ASSIGN',slot:'property',id:'drawing'}),s);});
test('Die Ärztin und Dina müssen beide gehört werden',()=>{let s=apply(researched(),{type:'RESEARCH_NEXT'},{type:'TALK',id:'dina'},{type:'ILLNESS_NEXT'});assert.equal(s.stage,'illness');s=apply(s,{type:'TALK',id:'doctor'},{type:'ILLNESS_NEXT'});assert.equal(s.stage,'resolve');});
test('Ohne Karte und vollständige Ausrüstung ist kein Aufbruch möglich',()=>{let s=ready();s.noteTaken=false;assert.equal(reduce(s,{type:'DEPART'}).stage,'pack');s.noteTaken=true;s.packed.pop();assert.equal(reduce(s,{type:'DEPART'}).stage,'pack');assert.ok(readyToLeave(ready()));});
test('Alle vier Entscheidungskombinationen erreichen das Ende und überstehen einen Speicher-Rundlauf',()=>{for(const choice of ['fear','research'])for(const owlChoice of ['ask','directions']){let s=ready(choice);s=apply(s,{type:'DEPART'},{type:'OWL_CHOICE',id:owlChoice},{type:'RIVER_INSPECT'},{type:'RIVER_SCOUT'},{type:'RIVER_SLING'},{type:'RIVER_LOOP'},{type:'RIVER_ANCHOR'},{type:'RIVER_CROSS'},{type:'RIVER_PANEL'},{type:'RIVER_PANEL'});assert.equal(s.stage,'river-complete');assert.equal(s.choice,choice);assert.equal(s.owlChoice,owlChoice);assert.deepEqual(validateState(JSON.parse(JSON.stringify(s))),s);}});
test('Gegenstände werden nur einmal aufgenommen und der vorherige Zustand bleibt unverändert',()=>{const s=ready(),snapshot=structuredClone(s),next=reduce(s,{type:'PACK',id:'glass'});assert.equal(next.packed.length,4);assert.deepEqual(s,snapshot);});
test('Import prüft Format, Zukunftsversionen und unmögliche Fortschritte',()=>{assert.throws(()=>validateState({...initialState(),version:99}));assert.throws(()=>validateState({...initialState(),stage:'complete'}));assert.throws(()=>validateState({...ready(),packed:['unknown']}));assert.throws(()=>validateState({...researched(),assign:{property:'advert',place:'travel',identity:'drawing'}}));});
test('Rätselhilfen enden nach drei Stufen und sind für jeden Spielabschnitt vorhanden',()=>{let s=apply(initialState(),{type:'START'});for(let i=0;i<5;i++)s=reduce(s,{type:'HINT'});assert.equal(s.hints.research,3);for(const stage of ['research','illness','resolve','pack','threshold','river'])assert.equal(hints[stage].length,3);});
test('Alle Quellen enthalten darstellbare Inhalte; Werbung ist kein notwendiger Beleg',()=>{for(const s of Object.values(sources)){assert.ok(s.title);assert.ok(s.text.length);assert.ok(s.observation);}assert.ok(!Object.values(researched().assign).includes('advert'));});

function atRiver(){return apply(ready(),{type:'DEPART'},{type:'OWL_CHOICE',id:'ask'});}
test('Version-1-Spielstände setzen ohne Neustart am Fluss fort; Entscheidungen bleiben erhalten',()=>{
 for(const choice of ['fear','research'])for(const owlChoice of ['ask','directions']){
  const modern=apply(ready(choice),{type:'DEPART'},{type:'OWL_CHOICE',id:owlChoice});
  const legacy={...modern,version:1,stage:'complete'};delete legacy.river;
  const original=structuredClone(legacy),migrated=validateState(legacy);
  assert.equal(migrated.stage,'river');assert.equal(migrated.version,8);
  assert.equal(migrated.choice,choice);assert.equal(migrated.owlChoice,owlChoice);
  assert.deepEqual(migrated.packed,legacy.packed);assert.deepEqual(legacy,original);
 }
 const earlier={...researched(),version:1};delete earlier.river;
 assert.equal(validateState(earlier).stage,'research');
});
test('Ungesicherte Überquerung, falsche Reihenfolge und erneute Verwendung umgehen das Flussrätsel nicht',()=>{
 let s=atRiver();const snapshot=structuredClone(s);
 s=apply(s,{type:'RIVER_CROSS'},{type:'RIVER_ANCHOR'},{type:'RIVER_LOOP'});
 assert.deepEqual(s,snapshot);
 s=apply(s,{type:'RIVER_SLING'},{type:'RIVER_INSPECT'},{type:'RIVER_LOOP'});
 assert.equal(s.river.loopAttached,false);
 s=apply(s,{type:'RIVER_SCOUT'},{type:'RIVER_LOOP'},{type:'RIVER_ANCHOR'});
 assert.equal(s.river.secured,true);assert.equal(s.river.slingSelected,false);
 assert.deepEqual(apply(s,{type:'RIVER_SLING'},{type:'RIVER_ANCHOR'}),s);
 assert.deepEqual(s.packed,ITEM_IDS);assert.deepEqual(snapshot.river,{inspected:false,farBankChecked:false,slingSelected:false,loopAttached:false,secured:false,crossingPanel:0});
});
test('Jeder Rätselschritt und beide Überquerungspanels überstehen Speichern und Laden',()=>{
 let s=atRiver();
 for(const type of ['RIVER_INSPECT','RIVER_SCOUT','RIVER_SLING','RIVER_LOOP','RIVER_ANCHOR','RIVER_CROSS','RIVER_PANEL','RIVER_PANEL']){
  s=reduce(s,{type});assert.deepEqual(validateState(JSON.parse(JSON.stringify(s))),s);
 }
 assert.equal(s.stage,'river-complete');assert.equal(s.river.crossingPanel,1);
});
test('Manipulierte Fluss-Spielstände werden zurückgewiesen',()=>{
 const s=atRiver();
 for(const patch of [{secured:true},{loopAttached:true},{crossingPanel:1},{inspected:'true'}])assert.throws(()=>validateState({...s,river:{...s.river,...patch}}));
 assert.throws(()=>validateState({...s,stage:'river-crossing'}));
 assert.throws(()=>validateState({...initialState(),river:{...s.river,farBankChecked:true}}));
});

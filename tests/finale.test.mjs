import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,reduce,validateState,ITEM_IDS,STAGES} from '../dist/state.js';
import {CHANNEL_SOLUTION} from '../dist/channels.js';
const step=(s,type)=>reduce(s,{type});
function gardenComplete(choice='fear',owlChoice='ask'){
 let s=step(initialState(),'START');
 for(const [slot,id] of Object.entries({property:'field',place:'travel',identity:'drawing'})){
  s=reduce(s,{type:'READ',id});s=reduce(s,{type:'ASSIGN',slot,id});
 }
 for(const a of [{type:'VERIFY'},{type:'RESEARCH_NEXT'},{type:'TALK',id:'dina'},{type:'TALK',id:'doctor'},{type:'ILLNESS_NEXT'},{type:'CHOOSE',id:choice},{type:'RESOLVE_NEXT'},{type:'TAKE_NOTE'},...ITEM_IDS.map(id=>({type:'PACK',id})),{type:'DEPART'},{type:'OWL_CHOICE',id:owlChoice}])s=reduce(s,a);
 for(const type of ['RIVER_INSPECT','RIVER_SCOUT','RIVER_SLING','RIVER_LOOP','RIVER_ANCHOR','RIVER_CROSS','RIVER_PANEL','RIVER_PANEL','GARDEN_START','GARDEN_TALK','GARDEN_INSPECT'])s=step(s,type);
 for(let index=0;index<6;index++)while(s.garden.rotations[index]!==CHANNEL_SOLUTION[index])s=reduce(s,{type:'GARDEN_ROTATE',index});
 return step(s,'GARDEN_TEST');
}
const actions=['CHAMBER_START','BLOOM_IDENTIFY','BLOOM_COLLECT','BLOOM_GUARDIAN','RETURN_START','RETURN_PROTECT','RETURN_HOME','APP_INSERT','APP_COLLECT','APP_BIND','APP_LANTERN','APP_CALM','DINA_OBSERVE','DINA_REPORT','HEAL','MORNING'];
function apparatus(){let s=gardenComplete();for(const a of actions.slice(0,9))s=step(s,a);return s;}

test('Version 3 setzt am bewässerten Garten ohne Neustart fort und verändert den importierten Stand nicht',()=>{
 for(const choice of ['fear','research'])for(const owlChoice of ['ask','directions']){
  const current=gardenComplete(choice,owlChoice),legacy={...current,version:3};
  delete legacy.bloom;delete legacy.journey;delete legacy.finale;
  const snapshot=structuredClone(legacy),migrated=validateState(legacy);
  assert.deepEqual(legacy,snapshot);assert.deepEqual(migrated,current);
  assert.equal(step(migrated,'CHAMBER_START').stage,'chamber');
 }
 const legacy={...initialState(),version:3};delete legacy.bloom;delete legacy.journey;delete legacy.finale;
 assert.equal(validateState(legacy).stage,'intro');
 assert.throws(()=>validateState({...legacy,stage:'apparatus'}));
});

test('Alle erreichbaren neuen Zustände bleiben fortsetzbar, speicherbar und verlangen Dinas aktiven Beitrag',()=>{
 for(const choice of ['fear','research'])for(const owlChoice of ['ask','directions']){
  const start=gardenComplete(choice,owlChoice),states=[start],ids=new Map([[JSON.stringify(start),0]]),edges=[];
  for(let index=0;index<states.length;index++){
   const s=states[index];edges[index]=new Set();
   assert.deepEqual(validateState(JSON.parse(JSON.stringify(s))),s,JSON.stringify(s));
   assert.equal(s.choice,choice);assert.equal(s.owlChoice,owlChoice);assert.deepEqual(s.packed,start.packed);assert.deepEqual(s.river,start.river);assert.deepEqual(s.garden,start.garden);
   if(['healing','level-complete'].includes(s.stage)){assert.equal(s.finale.dinaConfirmed,true);assert.equal(s.finale.dinaObservation,'steady');assert.equal(s.finale.stable,true);}
   for(const type of actions){
    const next=step(s,type),key=JSON.stringify(next);
    if(!ids.has(key)){ids.set(key,states.length);states.push(next);}
    edges[index].add(ids.get(key));
   }
  }
  assert.ok(states.some(s=>s.stage==='level-complete'));
  const canFinish=new Set(states.flatMap((s,i)=>s.stage==='level-complete'?[i]:[]));
  let changed=true;while(changed){changed=false;for(let i=0;i<states.length;i++)if(!canFinish.has(i)&&[...edges[i]].some(j=>canFinish.has(j))){canFinish.add(i);changed=true;}}
  assert.equal(canFinish.size,states.length,'Kein erreichbarer Zustand darf eine Sackgasse sein');
  assert.ok(states.length>30);
 }
});

test('Frühe Laternenlösung wird sofort stabil; Dina muss danach selbst prüfen und bestätigen',()=>{
 let s=apparatus();
 assert.equal(s.stage,'apparatus');assert.equal(s.finale.collected,true);
 assert.deepEqual(step(s,'APP_LANTERN'),s,'Ungebundenen Staub nicht verdunkeln');
 s=step(step(s,'APP_BIND'),'APP_LANTERN');assert.equal(s.finale.lanternOn,false);
 s=step(s,'APP_CALM');assert.equal(s.stage,'dina');assert.equal(s.finale.stable,true);
 assert.deepEqual(step(s,'DINA_REPORT'),s);assert.deepEqual(step(s,'HEAL'),s);
 s=step(step(s,'DINA_OBSERVE'),'DINA_REPORT');assert.equal(s.stage,'finale');assert.equal(s.finale.dinaConfirmed,true);
 assert.equal(step(s,'HEAL').stage,'healing');
});

test('Regulärer Weg: Dina erkennt Störlicht und bestätigt nach Tamatems Korrektur die Stabilität',()=>{
 let s=step(step(apparatus(),'APP_BIND'),'APP_CALM');
 assert.equal(s.stage,'dina');assert.equal(s.finale.stable,false);
 s=step(step(s,'DINA_OBSERVE'),'DINA_REPORT');assert.equal(s.stage,'finale');assert.equal(s.finale.dinaObservation,'flicker');
 assert.deepEqual(step(s,'HEAL'),s);
 s=step(step(s,'APP_LANTERN'),'APP_CALM');assert.equal(s.stage,'dina');assert.equal(s.finale.stable,true);
 assert.deepEqual(step(s,'DINA_REPORT'),s,'Alte Flackerbeobachtung bestätigt kein ruhiges Licht');
 s=step(step(s,'DINA_OBSERVE'),'DINA_REPORT');assert.equal(step(s,'HEAL').stage,'healing');
});

test('Manipulierte Finalspielstände können weder Garten, Rückweg noch Dina überspringen',()=>{
 const garden=gardenComplete(),ready=apparatus();
 for(const stage of STAGES.slice(12))assert.throws(()=>validateState({...garden,stage}),'stage '+stage);
 for(const patch of [{collected:false,bound:true},{stable:true},{dinaReported:true},{lanternOn:false},{dinaObservation:'steady'},{inserted:'yes'}])assert.throws(()=>validateState({...ready,finale:{...ready.finale,...patch}}));
 assert.throws(()=>validateState({...garden,bloom:{identified:false,collected:true,guardianTalked:false}}));
 assert.throws(()=>validateState({...ready,journey:{protected:false}}));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {CHANNEL_START,CHANNEL_SOLUTION,channelOpenings,traceChannels} from '../dist/channels.js';
import {initialState,reduce,validateState,ITEM_IDS} from '../dist/state.js';
const apply=(s,...actions)=>actions.reduce(reduce,s);
function checkpoint(choice='fear',owlChoice='ask'){
 let s=reduce(initialState(),{type:'START'});
 for(const [slot,id] of Object.entries({property:'field',place:'travel',identity:'drawing'}))s=apply(s,{type:'READ',id},{type:'ASSIGN',slot,id});
 s=apply(s,{type:'VERIFY'},{type:'RESEARCH_NEXT'},{type:'TALK',id:'dina'},{type:'TALK',id:'doctor'},{type:'ILLNESS_NEXT'},{type:'CHOOSE',id:choice},{type:'RESOLVE_NEXT'},{type:'TAKE_NOTE'},...ITEM_IDS.map(id=>({type:'PACK',id})),{type:'DEPART'},{type:'OWL_CHOICE',id:owlChoice});
 for(const type of ['RIVER_INSPECT','RIVER_SCOUT','RIVER_SLING','RIVER_LOOP','RIVER_ANCHOR','RIVER_CROSS','RIVER_PANEL','RIVER_PANEL'])s=reduce(s,{type});
 return s;
}
function garden(){return apply(checkpoint(),{type:'GARDEN_START'},{type:'GARDEN_TALK'},{type:'GARDEN_INSPECT'});}
function turnTo(s,target){for(let index=0;index<6;index++)while(s.garden.rotations[index]!==target[index])s=reduce(s,{type:'GARDEN_ROTATE',index});return s;}

test('Wasser zeigt den tatsächlichen Teilweg und die erste falsche Anschlussöffnung',()=>{
 assert.deepEqual(traceChannels(CHANNEL_START),{path:[],solved:false,stop:{tile:0,side:3}});
 const rotations=[...CHANNEL_START];rotations[0]=1;
 assert.deepEqual(traceChannels(rotations),{path:[0,1],solved:false,stop:{tile:2,side:3}});
 for(let rotation=0;rotation<4;rotation++)assert.deepEqual(channelOpenings(2,[0,1,rotation,3,0,2]),[rotation,(rotation+1)%4]);
});
test('Alle 4096 Kanalstellungen: nur die acht geometrisch gleichwertigen vollständigen Wege lösen das Rätsel',()=>{
 let solutions=0;
 for(let code=0;code<4096;code++){
  const rotations=Array.from({length:6},(_,index)=>(code>>(index*2))&3);
  const expected=rotations[0]%2===1&&rotations[1]%2===1&&rotations[2]===2&&rotations[3]===1&&rotations[4]%2===1&&rotations[5]===3;
  const actual=traceChannels(rotations);assert.equal(actual.solved,expected,rotations.join(','));
  if(actual.solved){solutions++;assert.deepEqual(actual.path,[0,1,2,5,4,3]);assert.equal(actual.stop,null);}
 }
 assert.equal(solutions,8);
});
test('Version-2-Spielstände am alten Flussabschluss erreichen den Garten ohne verlorene Entscheidungen',()=>{
 for(const choice of ['fear','research'])for(const owlChoice of ['ask','directions']){
  const legacy={...checkpoint(choice,owlChoice),version:2};delete legacy.garden;
  const before=structuredClone(legacy),s=validateState(legacy);
  assert.equal(s.version,10);assert.equal(s.stage,'river-complete');assert.equal(s.choice,choice);assert.equal(s.owlChoice,owlChoice);
  assert.deepEqual(s.river,legacy.river);assert.deepEqual(s.garden.rotations,CHANNEL_START);assert.deepEqual(legacy,before);
  assert.equal(reduce(s,{type:'GARDEN_START'}).stage,'garden');
 }
});
test('Erkundung erklärt das Ziel; ungültige Handlungen umgehen weder Zugang noch Wasserprüfung',()=>{
 const s=reduce(checkpoint(),{type:'GARDEN_START'});
 for(const action of [{type:'GARDEN_ROTATE',index:0},{type:'GARDEN_TEST'},{type:'GARDEN_APPLY_PREVIEW'},{type:'GARDEN_PREVIEW'}])assert.deepEqual(reduce(s,action),s);
 const ready=garden();
 for(const index of [-1,6,1.5,'0',NaN])assert.deepEqual(reduce(ready,{type:'GARDEN_ROTATE',index}),ready);
 const failed=reduce(ready,{type:'GARDEN_TEST'});
 assert.equal(failed.stage,'garden');assert.equal(failed.garden.watered,false);assert.equal(failed.garden.tested,true);
 assert.deepEqual(reduce(failed,{type:'GARDEN_TEST'}),failed);
 assert.deepEqual(failed.packed,ready.packed);
 const changed=reduce(failed,{type:'GARDEN_ROTATE',index:0});assert.equal(changed.garden.tested,false);
});
test('Vorschau verändert nichts; erst ausdrückliche Übernahme plus Wasserprüfung schließen ab',()=>{
 let s=garden();for(let i=0;i<3;i++)s=reduce(s,{type:'HINT'});
 const before=structuredClone(s);
 s=reduce(s,{type:'GARDEN_PREVIEW'});assert.deepEqual(s.garden.rotations,before.garden.rotations);assert.equal(s.garden.watered,false);
 assert.deepEqual(validateState(JSON.parse(JSON.stringify(s))),s);
 s=reduce(s,{type:'GARDEN_HIDE_PREVIEW'});assert.equal(s.garden.solutionPreview,false);
 s=apply(s,{type:'GARDEN_PREVIEW'},{type:'GARDEN_APPLY_PREVIEW'});
 assert.deepEqual(s.garden.rotations,CHANNEL_SOLUTION);assert.equal(s.garden.tested,false);assert.equal(s.garden.watered,false);
 s=reduce(s,{type:'GARDEN_TEST'});assert.equal(s.stage,'garden-complete');assert.equal(s.garden.watered,true);
 for(const type of ['GARDEN_ROTATE','GARDEN_TEST','GARDEN_APPLY_PREVIEW','GARDEN_PREVIEW'])assert.deepEqual(reduce(s,{type,index:0}),s);
});
test('Alle Entscheidungen, manuelle frühe Lösung und jeder Garten-Zwischenstand überstehen Speichern und Laden',()=>{
 for(const choice of ['fear','research'])for(const owlChoice of ['ask','directions']){
  let s=checkpoint(choice,owlChoice);
  for(const type of ['GARDEN_START','GARDEN_INSPECT','GARDEN_TALK','GARDEN_TEST']){s=reduce(s,{type});assert.deepEqual(validateState(structuredClone(s)),s);}
  for(let index=0;index<6;index++)while(s.garden.rotations[index]!==CHANNEL_SOLUTION[index]){s=reduce(s,{type:'GARDEN_ROTATE',index});assert.deepEqual(validateState(structuredClone(s)),s);}
  s=reduce(s,{type:'GARDEN_TEST'});assert.equal(s.stage,'garden-complete');assert.equal(s.choice,choice);assert.equal(s.owlChoice,owlChoice);assert.equal(s.hints.garden,undefined);
  assert.deepEqual(validateState(JSON.parse(JSON.stringify(s))),s);
 }
});
test('Manipulierte Garten-Spielstände und unvollständige Wege sind ungültig',()=>{
 const s=garden();
 for(const patch of [{rotations:[0]},{rotations:[0,1,0,3,0,-1]},{watered:true},{tested:true,rotations:CHANNEL_SOLUTION},{solutionPreview:true},{inspected:'true'}])assert.throws(()=>validateState({...s,garden:{...s.garden,...patch}}));
 assert.throws(()=>validateState({...checkpoint(),garden:{...s.garden,inspected:true}}));
 assert.throws(()=>validateState({...s,stage:'garden-complete'}));
 assert.throws(()=>validateState({...s,river:{...s.river,crossingPanel:0}}));
 assert.throws(()=>traceChannels([0,1,0,3,0,4]));
 const solved=reduce(turnTo(s,CHANNEL_SOLUTION),{type:'GARDEN_TEST'});
 assert.throws(()=>validateState({...solved,garden:{...solved.garden,rotations:CHANNEL_START}}));
});

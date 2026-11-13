import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {CHANNEL_SOLUTION} from '../dist/channels.js';
import {initialState,reduce,validateState,ITEM_IDS} from '../dist/state.js';
import {FX_LENGTH,FX_SKIPPABLE,FX_PICTURE,fxTransition,fxSceneChange,gardenDryFx,gardenWetFx,chamberFx,workroomFx,illnessFx,thresholdFx,riverFx,morningFx} from '../dist/scene-fx.js';
const apply=(s,...actions)=>actions.reduce(reduce,s);
function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
function riverDone(){
 let s=reduce(initialState(),{type:'START'});
 for(const [slot,id] of Object.entries({property:'field',place:'travel',identity:'drawing'}))s=apply(s,{type:'READ',id},{type:'ASSIGN',slot,id});
 s=apply(s,{type:'VERIFY'},{type:'RESEARCH_NEXT'},{type:'TALK',id:'dina'},{type:'TALK',id:'doctor'},{type:'ILLNESS_NEXT'},{type:'CHOOSE',id:'fear'},{type:'RESOLVE_NEXT'},{type:'TAKE_NOTE'},...ITEM_IDS.map(id=>({type:'PACK',id})),{type:'DEPART'},{type:'OWL_CHOICE',id:'ask'});
 for(const type of ['RIVER_INSPECT','RIVER_SCOUT','RIVER_SLING','RIVER_LOOP','RIVER_ANCHOR','RIVER_CROSS','RIVER_PANEL','RIVER_PANEL'])s=reduce(s,{type});
 return s;
}
const step=(s,action)=>{const before=freeze(structuredClone(s)),after=reduce(s,action);const events=fxTransition(before,freeze(structuredClone(after)));return {after,events:events.map(event=>event.type)};};

test('Animationsauslöser folgen den Zustandswechseln, ohne den Spielstand zu verändern',()=>{
 let s=reduce(riverDone(),{type:'GARDEN_START'}),r;
 assert.deepEqual(fxTransition(s,s),[]);
 r=step(s,{type:'GARDEN_TALK'});assert.deepEqual(r.events,[]);s=r.after;
 r=step(s,{type:'GARDEN_INSPECT'});assert.deepEqual(r.events,['moist']);s=r.after;
 r=step(s,{type:'GARDEN_INSPECT'});assert.deepEqual(r.events,[]);
 r=step(s,{type:'GARDEN_ROTATE',index:2});assert.deepEqual(fxTransition(s,r.after),[{type:'turn',tiles:[2]}]);s=r.after;
 r=step(s,{type:'GARDEN_TEST'});assert.deepEqual(r.events,['flow']);s=r.after;
 r=step(s,{type:'GARDEN_TEST'});assert.deepEqual(r.events,[]);
 for(let i=0;i<3;i++)s=reduce(s,{type:'HINT'});
 r=step(apply(s,{type:'GARDEN_PREVIEW'}),{type:'GARDEN_APPLY_PREVIEW'});assert.deepEqual(r.events,['turn']);s=r.after;
 assert.deepEqual(s.garden.rotations,CHANNEL_SOLUTION);
 r=step(s,{type:'GARDEN_TEST'});assert.deepEqual(r.events,['water']);s=r.after;assert.equal(s.stage,'garden-complete');
 s=apply(s,{type:'CHAMBER_START'},{type:'BLOOM_IDENTIFY'});
 r=step(s,{type:'BLOOM_COLLECT'});assert.deepEqual(r.events,['collect']);s=r.after;
 r=step(s,{type:'BLOOM_COLLECT'});assert.deepEqual(r.events,[]);
 // The save keeps format 11 and carries no animation data.
 assert.equal(s.version,11);assert.doesNotMatch(JSON.stringify(s),/fx|anim/i);assert.deepEqual(validateState(JSON.parse(JSON.stringify(s))),s);
 assert.deepEqual(fxTransition(undefined,s),[]);assert.deepEqual(fxTransition({},{}),[]);
 for(const type of FX_SKIPPABLE)assert.ok(FX_LENGTH[type]>1.5);
});
test('Animationsebenen sind reine Dekoration: verborgen, ohne Text, ohne Bedienelemente, stabil bei erneutem Rendern',()=>{
 const layers=[workroomFx(),workroomFx({now:3,read:['field','travel','drawing'],readId:'drawing',readEl:.3,overlay:fxSceneChange('./assets/illness.png','',.2)}),workroomFx({evening:true,packed:4,packEl:.2}),illnessFx(),illnessFx({now:7}),thresholdFx(),thresholdFx({now:2,elapsed:1}),thresholdFx({storm:true}),thresholdFx({storm:true,protectedLight:true,shieldEl:.4}),riverFx(),riverFx({now:5,secured:true}),morningFx(),morningFx({now:1,elapsed:.5,nightSrc:'./assets/illness.png'}),gardenDryFx(),gardenDryFx({now:12.5,inspected:true,moist:.4}),gardenWetFx(),gardenWetFx({now:3,elapsed:1.2,drySrc:'./assets/garden-dry.png'}),chamberFx(),chamberFx({collected:true}),chamberFx({now:8,collected:true,elapsed:.5})];
 for(const html of layers){
  assert.match(html,/^<div class="scene-fx[^"]*" aria-hidden="true"/);
  assert.doesNotMatch(html,/<button|<a |data-action|tabindex|onclick|<script/);
  assert.equal(html.replace(/<[^>]*>/g,'').trim(),'');
  assert.doesNotMatch(html,/NaN|undefined|Infinity/);
 }
 assert.equal(gardenDryFx({now:4,inspected:true}),gardenDryFx({now:4,inspected:true}));
 assert.equal(gardenDryFx({now:4}).replace('--now:4s','--now:9s'),gardenDryFx({now:9}));
 // Settled pictures carry no one-shot elements; the dry picture is only layered in while the change plays.
 assert.doesNotMatch(gardenWetFx(),/fx-play|fx-fade|garden-dry/);assert.match(gardenWetFx({elapsed:0,drySrc:'x/garden-dry.png'}),/fx-play.*class="fx-fade" src="x\/garden-dry\.png" alt=""/);
 assert.doesNotMatch(chamberFx({collected:true}),/fx-play|fx-fly/);assert.match(chamberFx({collected:true}),/fx-jar/);assert.doesNotMatch(chamberFx(),/fx-jar/);
 assert.doesNotMatch(gardenDryFx(),/fx-moist/);assert.match(gardenDryFx({inspected:true}),/fx-moist/);
 for(const html of layers)assert.ok((html.match(/<i /g)||[]).length<=75,'Zu viele Animationselemente');
});
test('Animationen bewegen nur transform und opacity; reduzierte Bewegung schaltet alles ab',async()=>{
 const css=await readFile(new URL('../dist/style.css',import.meta.url),'utf8');
 const frames=[...css.matchAll(/@keyframes (fx-[\w-]+)\{((?:[^{}]*\{[^{}]*\})*)\}/g)];
 assert.ok(frames.length>=25);
 for(const [,name,body] of frames)for(const [,property] of body.matchAll(/[{;]\s*([a-z-]+)\s*:/g))assert.ok(['transform','opacity','scale','translate','rotate'].includes(property),name+': '+property);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{html\{scroll-behavior:auto\}\*\{transition:none!important;animation:none!important\}\}/);
 const app=await readFile(new URL('../dist/app.js',import.meta.url),'utf8');
 assert.match(app,/function fxNote\(before,after\)\{if\(fxReduced\(\)\)return;/);
});

test('Paket 2: Auslöser der übrigen Level-1-Szenen folgen dem Zustand und verändern ihn nicht',()=>{
 let s=reduce(initialState(),{type:'START'}),r;
 const types=action=>{r=step(s,action);s=r.after;return r.events;};
 assert.deepEqual(types({type:'READ',id:'field'}),['read']);
 assert.deepEqual(types({type:'READ',id:'field'}),[]);
 assert.deepEqual(fxTransition(reduce(initialState(),{type:'START'}),s),[{type:'read',id:'field'}]);
 for(const [slot,id] of Object.entries({property:'field',place:'travel',identity:'drawing'}))s=apply(s,{type:'READ',id},{type:'ASSIGN',slot,id});
 assert.deepEqual(types({type:'VERIFY'}),[]);
 const before=s;assert.deepEqual(types({type:'RESEARCH_NEXT'}),['scene']);assert.deepEqual(fxTransition(before,s),[{type:'scene',from:'workroom',tone:''}]);
 s=apply(s,{type:'TALK',id:'dina'},{type:'TALK',id:'doctor'});
 assert.deepEqual(types({type:'ILLNESS_NEXT'}),['scene']);
 s=reduce(s,{type:'CHOOSE',id:'research'});
 assert.deepEqual(types({type:'RESOLVE_NEXT'}),[]); // same picture, same evening tone
 s=reduce(s,{type:'TAKE_NOTE'});
 for(const id of ITEM_IDS){assert.deepEqual(types({type:'PACK',id}),['pack']);assert.deepEqual(types({type:'PACK',id}),[]);}
 assert.deepEqual(types({type:'DEPART'}),['scene','forest']);
 assert.deepEqual(types({type:'OWL_CHOICE',id:'directions'}),['scene']);
 assert.deepEqual(types({type:'RIVER_CROSS'}),[]);
 assert.deepEqual(types({type:'RIVER_INSPECT'}),['wobble']);assert.deepEqual(types({type:'RIVER_INSPECT'}),[]);
 s=apply(s,{type:'RIVER_SCOUT'},{type:'RIVER_SLING'},{type:'RIVER_LOOP'});
 assert.deepEqual(types({type:'RIVER_ANCHOR'}),['secure']);
 assert.deepEqual(types({type:'RIVER_CROSS'}),['step']);assert.deepEqual(types({type:'RIVER_PANEL'}),['step']);assert.deepEqual(types({type:'RIVER_PANEL'}),[]);
 assert.deepEqual(types({type:'GARDEN_START'}),['scene']);
 s=apply(s,{type:'GARDEN_TALK'},{type:'GARDEN_INSPECT'});
 for(let i=0;i<6;i++)while(s.garden.rotations[i]!==CHANNEL_SOLUTION[i])s=reduce(s,{type:'GARDEN_ROTATE',index:i});
 assert.deepEqual(types({type:'GARDEN_TEST'}),['water']); // the watering keeps its own cross-fade
 assert.deepEqual(types({type:'CHAMBER_START'}),['scene']);
 s=apply(s,{type:'BLOOM_IDENTIFY'},{type:'BLOOM_COLLECT'});
 assert.deepEqual(types({type:'RETURN_START'}),['scene']);
 assert.deepEqual(types({type:'RETURN_HOME'}),[]);
 assert.deepEqual(types({type:'RETURN_PROTECT'}),['shield']);assert.deepEqual(types({type:'RETURN_PROTECT'}),[]);
 assert.deepEqual(types({type:'RETURN_HOME'}),[]); // the apparatus has no scene picture
 s=apply(s,{type:'APP_INSERT'},{type:'APP_COLLECT'},{type:'APP_BIND'},{type:'APP_LANTERN'});
 assert.deepEqual(types({type:'APP_CALM'}),[]);assert.equal(s.stage,'dina');
 s=apply(s,{type:'DINA_OBSERVE'},{type:'DINA_REPORT'});
 assert.deepEqual(types({type:'HEAL'}),[]);assert.equal(s.stage,'healing');
 assert.deepEqual(types({type:'MORNING'}),['dawn']);assert.equal(s.stage,'level-complete');
 assert.deepEqual(types({type:'CASE_START'}),[]); // Level 2 and later stay untouched
 assert.equal(s.version,11);assert.doesNotMatch(JSON.stringify(s),/fx|anim/i);assert.deepEqual(validateState(JSON.parse(JSON.stringify(s))),s);
 for(const type of FX_SKIPPABLE)assert.ok(FX_LENGTH[type]>1.5);
 for(const [type,seconds] of Object.entries(FX_LENGTH))assert.ok(FX_SKIPPABLE.includes(type)||seconds<=1.5||['flow','moist'].includes(type),type);
 for(const [stage,[picture]] of Object.entries(FX_PICTURE)){assert.ok(initialState().stage==='intro'&&typeof stage==='string');assert.match(picture,/^[a-z-]+$/);}
});
test('Paket 2: Ebenen folgen dem Spielstand und ruhen ohne laufenden Ablauf',()=>{
 assert.doesNotMatch(workroomFx(),/fx-paper|fx-play|fx-fade/);
 assert.equal((workroomFx({read:['field','travel']}).match(/fx-paper/g)||[]).length,4);
 assert.match(workroomFx({read:['field'],readId:'field',readEl:.1}),/fx-shot fx-play fx-arrive/);
 assert.equal((workroomFx({evening:true,packed:3}).match(/fx-paper/g)||[]).length,3);
 assert.doesNotMatch(workroomFx({evening:true,packed:4}),/fx-fly/);assert.match(workroomFx({evening:true,packed:1,packEl:0}),/fx-fly/);
 assert.match(workroomFx({overlay:fxSceneChange('a.png','evening',.1)}),/class="fx-fade fx-quick fx-evening" src="a\.png" alt=""/);
 assert.equal(fxSceneChange('a.png','',null),'');
 assert.doesNotMatch(thresholdFx(),/fx-rain|fx-play/);assert.match(thresholdFx({elapsed:0}),/fx-play/);
 assert.equal((thresholdFx({storm:true}).match(/class="fx-rain"/g)||[]).length,26);
 assert.match(thresholdFx({storm:true}),/fx-faint/);assert.doesNotMatch(thresholdFx({storm:true}),/fx-jar"/);
 assert.match(thresholdFx({storm:true,protectedLight:true}),/class="fx-jar "/);assert.match(thresholdFx({storm:true,protectedLight:true,shieldEl:.2}),/fx-jar fx-arrive/);
 assert.notEqual(riverFx(),riverFx({secured:true}));
 assert.doesNotMatch(morningFx(),/fx-play|fx-fade|illness/);assert.match(morningFx({elapsed:0,nightSrc:'x/illness.png'}),/fx-play.*src="x\/illness\.png"/);
 assert.equal(illnessFx({now:2}),illnessFx({now:2}));
});

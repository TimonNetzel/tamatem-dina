import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {CHANNEL_SOLUTION} from '../dist/channels.js';
import {initialState,reduce,validateState,ITEM_IDS} from '../dist/state.js';
import {FX_LENGTH,FX_SKIPPABLE,fxTransition,gardenDryFx,gardenWetFx,chamberFx} from '../dist/scene-fx.js';
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
 const layers=[gardenDryFx(),gardenDryFx({now:12.5,inspected:true,moist:.4}),gardenWetFx(),gardenWetFx({now:3,elapsed:1.2,drySrc:'./assets/garden-dry.png'}),chamberFx(),chamberFx({collected:true}),chamberFx({now:8,collected:true,elapsed:.5})];
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
 assert.ok(frames.length>=15);
 for(const [,name,body] of frames)for(const [,property] of body.matchAll(/[{;]\s*([a-z-]+)\s*:/g))assert.ok(['transform','opacity','scale','translate'].includes(property),name+': '+property);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{html\{scroll-behavior:auto\}\*\{transition:none!important;animation:none!important\}\}/);
 const app=await readFile(new URL('../dist/app.js',import.meta.url),'utf8');
 assert.match(app,/function fxNote\(before,after\)\{if\(fxReduced\(\)\)return;/);
});

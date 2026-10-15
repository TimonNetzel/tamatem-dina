import {EDITION_COPY} from '../dist/edition-copy.js';
import {EDITION_STAGES} from '../dist/edition-state.js';
import {HEALING_COPY} from '../dist/healing-copy.js';
import {MASK_COPY} from '../dist/mask-copy.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import vm from 'node:vm';
import {levelOne,finishCase,finishEco,finishMorning,finishMask,finishHealing,finishEdition} from './support.mjs';
import {MORNING_COPY} from '../dist/morning-copy.js';
import {ECO_COPY} from '../dist/eco-copy.js';
import {CASE_COPY} from '../dist/case-copy.js';

test('Offline-Einzeldatei enthält alle Bilder und Sprachmodule in getrennten gültigen Modulbereichen',async()=>{
 const temporary=await mkdtemp(path.join(tmpdir(),'tamatem-export-'));
 try{
  const output=path.join(temporary,'spiel.html');
  const cwd=fileURLToPath(new URL('../',import.meta.url));
  await promisify(execFile)(process.execPath,['make-offline.mjs',output],{cwd});
  const html=await readFile(output,'utf8');
  assert.ok(!/<script[^>]+src=/.test(html));
  assert.ok(!/<link[^>]+rel="(?:stylesheet|manifest)"/.test(html));
  assert.ok(!/url\(['"]?\.\/assets\//.test(html),'CSS assets must also be embedded');
  for(const name of ['workroom','characters','illness','threshold','river','garden-dry','garden-wet','chamber','morning','case-library','case-courtyard','eco-river','eco-depot','morning-investigation','mask-city','healing-clinic','edition-newsroom']){
   const encoded=(await readFile(path.join(cwd,'dist/assets',name+'.png'))).toString('base64');
   assert.ok(html.includes('data:image/png;base64,'+encoded),name);
  }
  const scripts=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length,1);
  const script=scripts[0][1];
  assert.ok(!/^import /m.test(script));assert.ok(!/^export /m.test(script));
  for(const module of ['channels.js','case-state.js','state.js','data.js','messages.js','i18n.js','case-copy.js','case-ui.js','eco-state.js','eco-copy.js','eco-ui.js','morning-state.js','morning-copy.js','morning-ui.js','mask-state.js','mask-copy.js','mask-ui.js','healing-state.js','healing-copy.js','healing-ui.js','edition-state.js','edition-copy.js','edition-ui.js','app.js'])assert.ok(script.includes('__TD_MODULES["'+module+'"]'));
  new vm.Script(script);
  // Execute the actual embedded modules against a minimal document. This checks
  // runtime import aliases as well as syntax, without claiming a browser file:// test.
  const checkpoints={};finishCase(levelOne(),'anonymous','omit',s=>{checkpoints[s.stage]??=s;});
  finishEco(finishCase(levelOne()),'error','warning',s=>{checkpoints[s.stage]??=s;});
  finishMorning(finishEco(finishCase(levelOne())),'direct','anonymous',s=>{checkpoints[s.stage]??=s;});
  finishMask(finishMorning(finishEco(finishCase(levelOne()))),'quiet','role','talk',s=>{checkpoints[s.stage]??=s;});
  finishHealing(finishMask(finishMorning(finishEco(finishCase(levelOne())))),'together','meeting',s=>{checkpoints[s.stage]??=s;});
  finishEdition(finishHealing(finishMask(finishMorning(finishEco(finishCase(levelOne()))))),{},s=>{checkpoints[s.stage]??=s;});
  const compiled=new vm.Script(script);
  for(const [locale,stage] of [['de','intro'],['en','intro'],['ar-EG','intro'],['de','case-interviews'],['en','case-editor'],['ar-EG','case-complete'],...['de','en','ar-EG'].flatMap(locale=>[...EDITION_STAGES,'eco-samples','eco-correction','eco-source','eco-verify','eco-complete','morning-clock','morning-timeline','morning-privacy','morning-publish','morning-complete','mask-crop','mask-perspective','mask-caption','mask-correction','mask-mirror','mask-publish','mask-complete','healing-opening','healing-call','healing-study','healing-contact','healing-supply','healing-contract','healing-protect','healing-chain','healing-responses','healing-revise','healing-publish','healing-followup','healing-complete'].map(stage=>[locale,stage]))]){
   const elements=new Map();
   const element=selector=>{if(!elements.has(selector))elements.set(selector,{innerHTML:'',textContent:'',addEventListener(){},querySelectorAll(){return [];},classList:{add(){},remove(){}}});return elements.get(selector);};
   const document={activeElement:null,documentElement:{},title:'',querySelector:element,querySelectorAll:()=>[],addEventListener(){}};
   const context={document,structuredClone,localStorage:{getItem:key=>key==='tamatem-dina-language'?locale:key==='tamatem-dina-prolog-v1'&&stage!=='intro'?JSON.stringify({state:checkpoints[stage]}):null,setItem(){}},setTimeout,clearTimeout};
   compiled.runInNewContext(context,{timeout:5000});
   assert.equal(document.documentElement.lang,locale);
   assert.equal(document.documentElement.dir,locale==='ar-EG'?'rtl':'ltr');
   if(stage==='intro')assert.ok(element('#main').innerHTML.includes(locale==='de'?'Die Lumenblüte beginnen':locale==='en'?'Begin The Lumen Blossom':'ابدأ زهرة النور'));
   else if(stage.startsWith('edition-'))assert.ok(element('#main').innerHTML.includes(EDITION_COPY[stage.slice(8)][['de','en','ar-EG'].indexOf(locale)]));
   else if(stage.startsWith('healing-'))assert.ok(element('#main').innerHTML.includes(HEALING_COPY[stage.slice(8)][['de','en','ar-EG'].indexOf(locale)]));
   else if(stage.startsWith('mask-'))assert.ok(element('#main').innerHTML.includes(MASK_COPY[stage.slice(5)][['de','en','ar-EG'].indexOf(locale)]));
   else if(stage.startsWith('morning-'))assert.ok(element('#main').innerHTML.includes(MORNING_COPY[stage.slice(8)][['de','en','ar-EG'].indexOf(locale)]));
   else if(stage.startsWith('eco-'))assert.ok(element('#main').innerHTML.includes(ECO_COPY[stage.slice(4)][['de','en','ar-EG'].indexOf(locale)]));
   else assert.ok(element('#main').innerHTML.includes(CASE_COPY[{"case-interviews":"interviews","case-editor":"editor","case-complete":"complete"}[stage]][['de','en','ar-EG'].indexOf(locale)]));
   assert.ok(element('#offline-status').textContent.length>0);
  }
 }finally{await rm(temporary,{recursive:true,force:true});}
});

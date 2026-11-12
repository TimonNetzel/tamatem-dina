// Real Chromium check of the Level 2 courtyard (format 11). Not part of npm test.
// Needs a running "node server.mjs" and a Node Playwright installation with Chromium.
// Run: node tests/browser-yard.mjs [screenshot directory]   (TD_TEST_URL overrides the address)
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {reduce} from '../dist/state.js';
import {CASE_COPY} from '../dist/case-copy.js';
import {levelOne,finishCase} from './support.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const out=process.argv[2]||path.join(tmpdir(),'tamatem-yard');mkdirSync(out,{recursive:true});
// Seeds: a fresh courtyard, the address stage, and real format-10 field sets inside and after the courtyard.
const snaps={};finishCase(levelOne(),'name','document',s=>{snaps[s.stage]??=s;});
const old=s=>{const x=JSON.parse(JSON.stringify(s));x.version=10;delete x.case.yard;return x;};
let ready=snaps['case-interviews'];for(const a of [{type:'CASE_CONSENT',id:'name'},{type:'CASE_NORA'},{type:'CASE_EMIL'},{type:'CASE_WITHDRAW',id:'document'}])ready=reduce(ready,a);
const seeds={yard:snaps['case-interviews'],records:snaps['case-records'],oldReady:old(ready),oldTimeline:old(snaps['case-timeline']),oldComplete:old(snaps['case-complete'])};
const BASE=(process.env.TD_TEST_URL||'http://127.0.0.1:4173')+'/',KEY='tamatem-dina-prolog-v1';
const browser=await chromium.launch();
async function open(opts,locale,seed){
 const context=await browser.newContext(opts),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto(BASE);await page.evaluate(([k,s])=>localStorage.setItem(k,JSON.stringify({state:s,savedAt:new Date().toISOString()})),[KEY,seed]);
 await page.reload();await page.locator('.language-select').selectOption(locale);
 const i=['de','en','ar-EG'].indexOf(locale),T=key=>CASE_COPY[key][i];
 const touch=!!opts.hasTouch,hit=async l=>touch?l.tap():l.click();
 const sel=(a,id)=>`[data-action="${a}"]`+(id!==undefined?`[data-id="${id}"]`:'');
 const main=(a,id)=>hit(page.locator('#main '+sel(a,id)).first()),list=(a,id)=>hit(page.locator('#main .paper-panel '+sel(a,id)).first()),modal=(a,id)=>hit(page.locator('#modal-body '+sel(a,id)).first());
 const saved=()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)).state,KEY);
 const modalText=()=>page.locator('#modal-body').innerText(),reply=()=>page.locator('#modal-body .yard-reply').innerText();
 const close=async()=>{await hit(page.locator('#modal-body [data-action="close"]'));await page.waitForFunction(()=>!document.querySelector('#modal').open);};
 const layout=async label=>{
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),label+': horizontal overflow');
  const boxes=await page.locator('.yard-spot').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return [r.left,r.top,r.right,r.bottom];}));
  const scene=await page.locator('.yard-scene').evaluate(e=>{const r=e.getBoundingClientRect();return [r.left,r.top,r.right,r.bottom];});
  for(const [n,b] of boxes.entries()){assert.ok(b[2]-b[0]>=44&&b[3]-b[1]>=44,label+': marker too small');assert.ok(b[0]>=scene[0]-1&&b[2]<=scene[2]+1&&b[1]>=scene[1]-1&&b[3]<=scene[3]+1,label+': marker '+(n+1)+' leaves scene');
   for(const c of boxes.slice(n+1))assert.ok(b[2]<=c[0]||c[2]<=b[0]||b[3]<=c[1]||c[3]<=b[1],label+': markers overlap');}
  for(const h of await page.locator('.case-game .conversation,.case-game .button,#modal[open] .conversation,#modal[open] .choice,#modal[open] select,#modal[open] .button').evaluateAll(els=>els.map(e=>e.getBoundingClientRect().height)))assert.ok(h>=44,label+': touch target '+h);
 };
 return {context,page,errors,T,main,list,modal,saved,modalText,reply,close,layout,hit};
}
const done=async(name,x)=>{assert.deepEqual(x.errors,[],name+' console errors');await x.context.close();console.log('PASS '+name);};

// A · Laptop, Deutsch, Maus und Tastatur: Spurenweg, Fehlversuche, Hilfen, Speichern/Neuladen, Folgen, Übergang.
{const x=await open({viewport:{width:1440,height:900}},'de',seeds.yard),{page,T}=x;
 assert.equal(await page.locator('.yard-spot').count(),7);await x.layout('A start');await page.screenshot({path:out+'/a1-laptop-start.png'});
 assert.ok(await page.locator('#main [data-action="case-meet"]').isDisabled());
 await x.main('hint');assert.ok((await x.modalText()).includes(T('hYardExplore1')));await page.keyboard.press('Escape');
 // Tastatur: Marker fokussieren, Enter öffnet, Escape schließt und gibt den Fokus zurück.
 await page.locator('#main .yard-spot[data-id="board"]').focus();await page.keyboard.press('Enter');
 assert.ok((await x.modalText()).includes(T('boardIntro')));await page.screenshot({path:out+'/a2-board-detail.png'});
 await page.locator('#modal-body [data-action="yard-look"][data-id="notice"]').focus();await page.keyboard.press('Enter');
 assert.ok((await x.reply()).includes(T('noticeText'))&&(await x.reply()).includes(T('dNotice')));
 assert.equal(await page.evaluate(()=>document.activeElement.className.includes('yard-reply')),true);
 await x.modal('yard-look','edge');assert.ok((await x.reply()).includes(T('dEdge')));
 await x.modal('yard-look','pin');assert.ok((await x.reply()).includes(T('dPinHidden')));
 await page.keyboard.press('Escape');await page.waitForFunction(()=>document.activeElement.dataset.id==='board',null,{timeout:3000});
 assert.deepEqual((await x.saved()).case.yard.clues,['notice']);
 // Belegkarte: nur Bekanntes wählbar; Vermutung wird erklärt abgewiesen.
 await x.main('yard-spot','dina');
 assert.deepEqual(await page.locator('#modal-body select[data-index="1"] option').evaluateAll(o=>o.map(e=>e.value)),['','letter','notice']);
 await x.modal('yard-check');assert.ok((await x.reply()).includes(T('pEmpty')));
 await page.locator('#modal-body select[data-index="0"]').selectOption('letter');await page.locator('#modal-body select[data-index="1"]').selectOption('notice');
 assert.equal(await page.evaluate(()=>document.activeElement.dataset.index),'1');
 await x.close();
 for(const id of ['bins','door']){await x.main('yard-spot',id);assert.ok((await x.modalText()).includes(T(id==='bins'?'dBins':'dDoor')));await x.close();}
 await x.main('yard-spot','dina');await page.locator('#modal-body select[data-index="2"]').selectOption('door');await x.modal('yard-check');assert.ok((await x.reply()).includes(T('pClaim')));
 await page.locator('#modal-body select[data-index="0"]').selectOption('notice');await page.locator('#modal-body select[data-index="1"]').selectOption('letter');await x.modal('yard-check');assert.ok((await x.reply()).includes(T('pLetter')));await x.close();
 await x.main('hint');assert.ok((await x.modalText()).includes(T('hYardEvidence1')));await x.hit(page.locator('#modal-body [data-action="hint"]'));assert.ok((await x.modalText()).includes(T('hYardEvidence2')));await page.keyboard.press('Escape');
 // Perspektivwechsel über den Marker auf Tamatem.
 await x.main('yard-spot','tamatem');assert.equal((await x.saved()).case.yard.actor,'tamatem');assert.ok((await page.locator('.actor-strip').innerText()).includes('Tamatem'));
 assert.ok((await page.locator('.case-story').innerText()).includes(T('yardAsTamatem')));
 await x.main('yard-spot','bench');assert.ok((await x.modalText()).includes(T('tBench')));assert.equal(await page.locator('#modal-body [data-action="yard-ask"]').count(),0);await x.close();
 await x.main('yard-spot','board');await x.modal('yard-look','edge');assert.ok((await x.reply()).includes(T('tEdge'))&&(await x.reply()).includes(T('evPrint')));
 await x.modal('yard-look','pin');assert.ok((await x.reply()).includes(T('tPin')));await x.close();
 // Speichern und Neuladen mitten in der Sequenz.
 const mid=await x.saved();await page.reload();assert.deepEqual(await x.saved(),mid);assert.deepEqual(mid.case.yard.pocket,['print','scrap']);assert.ok((await page.locator('.paper-panel').innerText()).includes(T('evPrint')));
 await page.locator('#notebook-button').click();assert.ok((await x.modalText()).includes(T('nbPocket')));await page.keyboard.press('Escape');
 await x.main('hint');assert.ok((await x.modalText()).includes(T('hYardPass1')));await page.keyboard.press('Escape');
 await x.main('yard-spot','tamatem');await x.modal('yard-pass');assert.ok((await x.reply()).includes(T('passText')));assert.ok((await x.modalText()).includes(T('padCardWait')));await x.close();
 await x.list('yard-switch');assert.equal((await x.saved()).case.yard.actor,'dina');
 await x.main('yard-spot','dina');await page.locator('#modal-body select[data-index="1"]').selectOption('scrap');await page.locator('#modal-body select[data-index="2"]').selectOption('print');
 await x.modal('yard-check');assert.ok((await x.reply()).includes(T('pDate')));
 await page.locator('#modal-body select[data-index="1"]').selectOption('print');assert.equal(await page.locator('#modal-body select[data-index="2"]').inputValue(),'');
 await page.locator('#modal-body select[data-index="2"]').selectOption('scrap');await page.screenshot({path:out+'/a3-evidence-card.png'});
 await x.modal('yard-check');assert.ok((await x.reply()).includes(T('proofGood')));assert.ok(await page.locator('#modal-body select[data-index="0"]').isDisabled());
 await x.modal('yard-switch','word');assert.ok((await x.modalText()).includes(T('wordIntro')));
 await x.modal('yard-word','forgery');assert.ok((await x.reply()).includes(T('wordForgeryNo')));await x.modal('yard-word','destroyed');assert.ok((await x.reply()).includes(T('wordDestroyedNo')));
 assert.equal((await x.saved()).case.yard.worded,false);assert.equal(await page.locator('.yard-sheet').count(),0);
 await x.modal('yard-word','precise');await page.waitForFunction(()=>!document.querySelector('#modal').open);
 // Sichtbare Folgen: Blatt am Brett, neue Bildbeschreibung, Text, lesbarer Aushang, Nora, Emil, Notizbuch.
 assert.equal(await page.locator('.yard-sheet').count(),1);assert.equal(await page.locator('.yard-scene img').getAttribute('alt'),T('courtyardAltAfter'));assert.ok((await page.locator('.case-story').innerText()).includes(T('wordGood')));
 await page.waitForTimeout(900);await page.screenshot({path:out+'/a4-after-finding.png'});
 await x.main('yard-spot','board');await x.modal('yard-look','new');assert.ok((await x.reply()).includes(T('newText')));await page.screenshot({path:out+'/a5-board-after.png'});await x.close();
 await x.list('yard-switch');
 await x.main('yard-spot','bench');assert.ok((await x.modalText()).includes(T('noraAfter')));await x.modal('yard-consent','name');await x.modal('yard-nora');assert.ok((await x.reply()).includes(T('noraText')));
 assert.equal(await page.locator('#modal-body [data-action="yard-ask"]').count(),2);await x.close();
 assert.ok(await page.locator('#main [data-action="case-meet"]').isDisabled());
 await x.main('yard-spot','flowers');await x.modal('yard-emil');assert.ok((await x.reply()).includes(T('emilText')));await x.modal('yard-withdraw','document');assert.ok((await x.modalText()).includes(T('documentText'))&&(await x.modalText()).includes(T('emilAfter')));await x.close();
 await page.locator('#notebook-button').click();const notes=await x.modalText();for(const key of ['nbFinding','evPrint','evScrap','newText'])assert.ok(notes.includes(T(key)),key);await page.keyboard.press('Escape');
 await x.main('case-meet');assert.equal((await x.saved()).stage,'case-timeline');assert.equal(await page.locator('.yard-spot').count(),0);
 await done('A laptop de: trace route, wrong attempts, hints, reload, consequences, transition',x);}

// B · 390 px Touch, Englisch: Gesprächsweg, Offline-Neuladen, 320 px.
{const x=await open({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2},'en',seeds.yard),{page,T}=x;
 await x.layout('B 390');await page.screenshot({path:out+'/b1-phone-start.png',fullPage:true});
 await x.main('yard-spot','bench');assert.ok(await page.locator('#modal-body [data-action="yard-nora"]').isDisabled());await x.layout('B bench');
 await x.modal('yard-consent','anonymous');await x.modal('yard-nora');
 assert.equal(await page.locator('#modal-body [data-action="yard-ask"][data-id="contradiction"]').count(),0);assert.ok((await x.modalText()).includes(T('contraLocked')));
 await x.modal('yard-ask','gentle');assert.ok((await x.reply()).includes(T('gentleText')));await page.screenshot({path:out+'/b2-phone-nora.png'});await x.close();
 await x.main('yard-spot','dina');await page.locator('#modal-body select[data-index="0"]').selectOption('letter');await page.locator('#modal-body select[data-index="1"]').selectOption('photo');await page.locator('#modal-body select[data-index="2"]').selectOption('statement');
 await x.modal('yard-check');assert.ok((await x.reply()).includes(T('pClaim')));await x.layout('B card');await page.screenshot({path:out+'/b3-phone-card.png'});await x.close();
 await x.list('yard-spot','board');await x.modal('yard-look','notice');await x.layout('B board');await page.screenshot({path:out+'/b4-phone-board.png'});await x.close();
 await x.main('yard-spot','bench');assert.equal(await page.locator('#modal-body [data-action="yard-ask"][data-id="contradiction"]').count(),1);await x.close();
 // Offline: Service Worker abwarten, Netz trennen, neu laden, weiterspielen.
 await page.waitForFunction(()=>document.querySelector('#offline-status').classList.contains('ready'),null,{timeout:60000});
 await x.context.setOffline(true);await page.reload();assert.equal(await page.locator('.yard-spot').count(),7);assert.ok(await page.locator('.yard-scene img').evaluate(i=>i.complete&&i.naturalWidth>0));
 await x.main('yard-spot','dina');await page.locator('#modal-body select[data-index="0"]').selectOption('notice');await x.modal('yard-check');assert.ok((await x.reply()).includes(T('proofGood')));
 await x.modal('yard-switch','word');await x.modal('yard-word','precise');await page.waitForFunction(()=>!document.querySelector('#modal').open);
 assert.deepEqual((await x.saved()).case.yard.proof,['notice','photo','statement']);assert.equal(await page.locator('.yard-sheet').count(),1);
 await x.main('yard-spot','dina');await x.main('yard-spot','flowers');await x.modal('yard-emil');await x.modal('yard-withdraw','omit');await x.close();
 await page.setViewportSize({width:320,height:640});await x.layout('B 320');await page.screenshot({path:out+'/b5-phone-320-after.png'});
 await x.main('case-meet');assert.equal((await x.saved()).stage,'case-timeline');
 await page.reload();assert.equal((await x.saved()).stage,'case-timeline');assert.ok((await page.locator('#main').innerText()).includes(T('timelineText').slice(0,40)));
 await done('B phone en touch: conversation route, offline reload, 320 px, transition',x);}

// C · 390 px Touch, Arabisch RTL, reduzierte Bewegung: Emil zuerst, Tamatem zuerst, belegter Widerspruch, gemischte Belege.
{const x=await open({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2,reducedMotion:'reduce'},'ar-EG',seeds.yard),{page,T}=x;
 assert.equal(await page.locator('html').getAttribute('dir'),'rtl');await x.layout('C 390');
 await x.main('yard-spot','flowers');await x.modal('yard-emil');await x.modal('yard-withdraw','omit');await x.close();
 await x.main('yard-spot','tamatem');await x.main('yard-spot','board');await x.modal('yard-look','notice');await x.modal('yard-look','edge');await page.screenshot({path:out+'/c1-rtl-board.png'});await x.close();
 await x.main('yard-spot','flowers');assert.ok((await x.modalText()).includes(T('tFlowers')));await x.close();
 await x.main('yard-spot','tamatem');await x.modal('yard-pass');await x.close();await x.main('yard-spot','dina');
 await x.main('yard-spot','bench');await x.modal('yard-consent','name');await x.modal('yard-nora');await x.modal('yard-ask','contradiction');assert.ok((await x.reply()).includes(T('contraText')));await x.layout('C bench');await page.screenshot({path:out+'/c2-rtl-nora.png'});await x.close();
 await x.main('yard-spot','board');await x.modal('yard-look','pin');assert.ok((await x.reply()).includes(T('dPinFound')));await x.close();
 await x.main('yard-spot','dina');for(const [i,v] of ['notice','print','statement'].entries())await page.locator(`#modal-body select[data-index="${i}"]`).selectOption(v);
 await page.setViewportSize({width:320,height:640});await x.layout('C card 320');await page.screenshot({path:out+'/c5-rtl-card-320.png'});await page.setViewportSize({width:390,height:844});await x.layout('C card');await page.screenshot({path:out+'/c3-rtl-card.png'});await x.modal('yard-check');await x.modal('yard-switch','word');await x.layout('C word');await x.modal('yard-word','precise');
 await page.waitForFunction(()=>!document.querySelector('#modal').open);await x.layout('C after');await page.screenshot({path:out+'/c4-rtl-after.png',fullPage:true});
 for(const w of [320,768]){await page.setViewportSize({width:w,height:800});await x.layout('C '+w);}
 await x.main('case-meet');assert.equal((await x.saved()).stage,'case-timeline');
 await done('C phone ar-EG RTL reduced motion: Emil first, Tamatem first, contradiction, mixed proof',x);}

// D · Alte Spielstände (Format 10) im Browser laden: vor, im und nach dem Hof.
{const x=await open({viewport:{width:1280,height:800}},'de',seeds.oldReady),{page,T}=x;
 let s=await x.saved();assert.equal(s.stage,'case-interviews');assert.ok(await page.locator('#main [data-action="case-meet"]').isDisabled());assert.equal(await page.locator('.yard-spot').count(),7);
 await x.main('yard-spot','bench');assert.equal(await page.locator('#modal-body [data-action="yard-ask"]').count(),1);await x.close();
 await x.main('yard-spot','flowers');assert.ok(await page.locator('#modal-body [data-action="yard-withdraw"][data-id="omit"]').isDisabled());assert.ok((await x.modalText()).includes(T('documentText')));await x.close();
 await x.main('yard-spot','board');await x.modal('yard-look','notice');await x.close();s=await x.saved();assert.equal(s.version,11);assert.equal(s.case.withdrawal,'document');assert.equal(s.case.consent,'name');
 for(const [seed,stage] of [[seeds.oldTimeline,'case-timeline'],[seeds.oldComplete,'case-complete'],[seeds.records,'case-records']]){
  await page.evaluate(([k,v])=>localStorage.setItem(k,JSON.stringify({state:v,savedAt:new Date().toISOString()})),['tamatem-dina-prolog-v1',seed]);await page.reload();
  assert.ok((await page.locator('#main h1').innerText()).length>0);await x.main('hint');await page.keyboard.press('Escape');s=await x.saved();assert.equal(s.stage,stage);assert.equal(s.version,11);
  if(stage!=='case-records'){assert.equal(s.case.yard.legacy,true);await page.locator('#notebook-button').click();assert.ok(!(await x.modalText()).includes(T('nbFinding')));await page.keyboard.press('Escape');}
 }
 // Aus dem Adressabschnitt in den neuen Hof wechseln.
 for(const id of ['letter','address','sale']){await x.main('case-read',id);await x.hit(page.locator('#modal-body [data-action="case-select"]'));}
 await x.main('case-address');await x.main('case-interviews');assert.equal(await page.locator('.yard-spot').count(),7);
 await done('D legacy v10 saves: inside, after and before the courtyard',x);}
await browser.close();

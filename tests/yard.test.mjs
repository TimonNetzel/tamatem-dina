import test from 'node:test';
import assert from 'node:assert/strict';
import {reduce,validateState,VERSION} from '../dist/state.js';
import {CASE_STAGES,initialYard,yardGoal,yardKnown,yardProofCorrect,yardProofProblem,yardOpen} from '../dist/case-state.js';
import {CASE_COPY} from '../dist/case-copy.js';
import {caseHint,caseHintLevel,caseMeta,caseNotebook,caseView,caseText} from '../dist/case-ui.js';
import {setLanguage} from '../dist/i18n.js';
import {levelOne,finishCase,finishEco} from './support.mjs';
const step=(s,type,other={})=>reduce(s,{type,...other});
const run=(s,...actions)=>actions.reduce((state,a)=>typeof a==='string'?step(state,a):step(state,a[0],a[1]),s);
const round=s=>{assert.deepEqual(validateState(JSON.parse(JSON.stringify(s))),s);return s;};
const look=id=>['YARD_LOOK',{id}],proof=(...ids)=>ids.map((id,index)=>['YARD_PROOF',{index,id}]);
const at=stage=>{let result;finishCase(levelOne(),'anonymous','omit',s=>{if(s.stage===stage&&!result)result=s;});return result;};
const yard=()=>at('case-interviews');
const helpers={button:(a,label,cls,extra='')=>`<button data-action="${a}" ${extra}>${label}</button>`,actor:()=>'',scene:(image,alt,spots='')=>alt+spots,esc:x=>x,feedback:''};
// Weg A: Spuren am Brett. Tamatem findet, übergibt per Zettel, Dina belegt, Tamatem liest gegen.
const traces=s=>run(s,look('notice'),'YARD_SWITCH',look('edge'),look('pin'),'YARD_PASS','YARD_SWITCH',...proof('notice','print','scrap'),'YARD_CHECK','YARD_SWITCH',['YARD_WORD',{id:'precise'}]);
// Weg B: Gespräch. Dina klärt die Nennung, führt das Interview und fragt behutsam nach dem Brett.
const talk=s=>run(s,look('notice'),['CASE_CONSENT',{id:'name'}],'CASE_NORA',['YARD_ASK',{id:'gentle'}],...proof('notice','photo','statement'),'YARD_CHECK','YARD_SWITCH',['YARD_WORD',{id:'precise'}]);

test('Hof: beide Lösungswege führen zum selben Befund, speichern nach jedem Schritt und erreichen die Zeitachse',()=>{
 const a=traces(yard()),b=talk(yard());
 for(const s of [a,b]){round(s);assert.ok(s.case.yard.proven&&s.case.yard.worded);assert.equal(s.stage,'case-interviews');}
 assert.deepEqual(a.case.yard.proof,['notice','print','scrap']);assert.deepEqual(b.case.yard.proof,['notice','photo','statement']);
 assert.deepEqual(a.case.yard.asked,[]);assert.ok(!b.case.yard.seen.some(key=>key.startsWith('t:')));
 // Der Befund allein genügt nicht: Noras Interview und die Widerrufsentscheidung bleiben nötig.
 assert.equal(step(a,'CASE_MEET').stage,'case-interviews');assert.deepEqual(yardOpen(a.case),['openNora','openEmil']);
 for(const [s,consent,withdrawal] of [[a,'anonymous','document'],[b,'name','omit']]){
  const seen=[];const end=finishCase(s,consent,withdrawal,x=>{round(x);seen.push(x.stage);});
  assert.equal(end.stage,'case-complete');assert.equal(end.case.consent,consent);assert.equal(end.case.withdrawal,withdrawal);assert.deepEqual(end.case.yard.proof,s.case.yard.proof);assert.ok(seen.includes('case-timeline'));
  assert.equal(finishEco(end).stage,'eco-complete');
 }
});

test('Hof: Reihenfolgen sind frei; Interviews vor, zwischen oder nach der Spurensuche ändern das Ergebnis nicht',()=>{
 const blocks={nora:[['CASE_CONSENT',{id:'anonymous'}],'CASE_NORA'],emil:['CASE_EMIL',['CASE_WITHDRAW',{id:'document'}]],finding:null};
 const orders=[['nora','emil','finding'],['finding','nora','emil'],['emil','finding','nora'],['nora','finding','emil'],['finding','emil','nora'],['emil','nora','finding']];
 for(const order of orders)for(const route of [traces,talk]){
  let s=yard();
  for(const part of order){
   if(part==='finding'){if(route===talk&&!s.case.nora)s=run(s,['CASE_CONSENT',{id:'anonymous'}],'CASE_NORA');s=route(s);}
   else{if(s.case.yard.actor!=='dina')s=step(s,'YARD_SWITCH');s=run(s,...blocks[part]);}
   round(s);
  }
  assert.deepEqual(yardOpen(s.case),[]);assert.equal(s.case.consent,route===talk&&order.indexOf('finding')<order.indexOf('nora')?'anonymous':s.case.consent);
  assert.equal(step(s,'CASE_MEET').stage,'case-timeline');assert.equal(finishCase(s).stage,'case-complete');
 }
 // Einmal getroffene Interviewentscheidungen werden durch die neue Sequenz nicht doppelt angewendet oder überschrieben.
 let s=run(traces(yard()),'YARD_SWITCH',['CASE_CONSENT',{id:'name'}],'CASE_NORA','CASE_EMIL',['CASE_WITHDRAW',{id:'omit'}]);
 for(const a of [['CASE_CONSENT',{id:'anonymous'}],['CASE_WITHDRAW',{id:'document'}],['YARD_WORD',{id:'precise'}],'YARD_CHECK',...proof('letter','emil','advert'),['YARD_ASK',{id:'gentle'}],['YARD_ASK',{id:'gentle'}]])s=run(s,a);
 assert.equal(s.case.consent,'name');assert.equal(s.case.withdrawal,'omit');assert.deepEqual(s.case.yard.proof,['notice','print','scrap']);assert.deepEqual(s.case.yard.asked,['gentle']);
});

test('Hof: Wissen gehört der Figur; Tamatems Funde zählen erst nach dem Zettel, der Widerspruch erst nach dem Lesen',()=>{
 let s=yard();
 // Dina kommt weder an die Unterkante noch ohne Noras Hinweis an die Papierecke.
 s=run(s,look('edge'),look('pin'));assert.deepEqual(s.case.yard.clues,[]);
 // Ohne Interview keine Brettfragen; ohne gelesenen Aushang kein belegter Widerspruch.
 assert.deepEqual(step(s,'YARD_ASK',{id:'gentle'}),s);
 s=run(s,['CASE_CONSENT',{id:'name'}],'CASE_NORA');assert.deepEqual(step(s,'YARD_ASK',{id:'contradiction'}),s);
 s=run(s,'YARD_SWITCH');
 // Tamatem führt kein Interview und füllt nicht Dinas Karte.
 for(const a of [['YARD_ASK',{id:'gentle'}],'CASE_EMIL',['YARD_PROOF',{index:0,id:'letter'}],'YARD_CHECK'])assert.deepEqual(run(s,a),s);
 s=run(s,look('notice'),look('edge'),look('pin'),look('advert'),look('door'),look('bins'));
 assert.deepEqual(s.case.yard.pocket,['notice','print','scrap','advert']);assert.deepEqual(s.case.yard.clues,[]);assert.equal(yardGoal(s.case),'pass');
 // Vor der Übergabe kann Dina weder den Widerspruch ansprechen noch Tamatems Funde eintragen.
 let dina=step(s,'YARD_SWITCH');
 assert.deepEqual(yardKnown(dina.case),['letter']);assert.deepEqual(step(dina,'YARD_PROOF',{index:1,id:'print'}),dina);assert.deepEqual(step(dina,'YARD_ASK',{id:'contradiction'}),dina);
 assert.deepEqual(step(dina,'YARD_PASS'),dina);
 s=round(step(s,'YARD_PASS'));assert.deepEqual(s.case.yard.pocket,[]);assert.deepEqual(s.case.yard.clues,['notice','print','scrap','advert']);assert.deepEqual(step(s,'YARD_PASS'),s);
 // Jetzt kennt Dina den Aushang und kann den Widerspruch ansprechen; Nora nennt den Fundort der Papierecke.
 dina=round(run(s,'YARD_SWITCH',['YARD_ASK',{id:'contradiction'}]));assert.deepEqual(dina.case.yard.asked,['contradiction']);assert.ok(dina.case.yard.clues.includes('statement')&&!dina.case.yard.clues.includes('photo'));
 // Dieselbe Papierecke findet Dina nach Noras Hinweis auch ohne Tamatem.
 const alone=round(run(yard(),look('notice'),['CASE_CONSENT',{id:'name'}],'CASE_NORA',['YARD_ASK',{id:'contradiction'}],look('pin')));
 assert.deepEqual(alone.case.yard.clues,['notice','statement','scrap']);assert.equal(yardGoal(alone.case),'evidence');
 // Findet Tamatem etwas, das Dina schon kennt, entsteht kein doppelter Eintrag.
 const twice=run(alone,'YARD_SWITCH',look('pin'),look('notice'),look('edge'));assert.deepEqual(twice.case.yard.pocket,['print']);
 assert.equal(caseMeta('case-interviews',twice)[2],'Tamatem');assert.equal(caseMeta('case-interviews',alone)[2],'Dina');
});

test('Hof: Belegkarte nimmt jede ausreichende Kette an, weist Vermutungen zurück und erklärt, was fehlt',()=>{
 // Alles Wissen aus beiden Wegen plus Emils zurückgezogener Satz und die Ablenkungen.
 const full=round(run(yard(),look('notice'),look('advert'),look('door'),['CASE_CONSENT',{id:'name'}],'CASE_NORA',['YARD_ASK',{id:'gentle'}],'CASE_EMIL','YARD_SWITCH',look('edge'),look('pin'),'YARD_PASS','YARD_SWITCH'));
 const known=yardKnown(full.case);assert.deepEqual([...known].sort(),['advert','door','emil','letter','notice','photo','print','scrap','statement']);
 const valid=new Set(['print|scrap','print|statement','print|photo','photo|scrap','photo|statement']);let accepted=0,count=0;
 for(const a of [null,...known])for(const b of [null,...known])for(const c of [null,...known]){
  const picks=[a,b,c].filter(Boolean);if(new Set(picks).size!==picks.length)continue;count++;
  const s={...full,case:{...full.case,yard:{...full.case.yard,proof:[a,b,c]}}};round(s);
  const good=a==='notice'&&valid.has(b+'|'+c),checked=step(s,'YARD_CHECK');
  assert.equal(yardProofCorrect(s.case),good);assert.equal(checked.case.yard.proven,good);assert.equal(yardProofProblem(s.case)===null,good);
  if(good)accepted++;else{assert.ok(CASE_COPY[yardProofProblem(s.case)]);assert.deepEqual(checked,s);}
  // Kein Fehlversuch sperrt den Weg: jede Karte bleibt änderbar und der Fall abschließbar.
  assert.equal(finishCase(s).stage,'case-complete');
 }
 assert.equal(accepted,5);assert.equal(count,1+3*9+3*9*8+9*8*7);
 const problem=(...ids)=>yardProofProblem({...full.case,yard:{...full.case.yard,proof:ids}});
 assert.equal(problem('notice','print',null),'pEmpty');assert.equal(problem('notice','emil','scrap'),'pEmil');assert.equal(problem('letter','print','scrap'),'pClaim');
 assert.equal(problem('notice','letter','scrap'),'pLetter');assert.equal(problem('notice','print','door'),'pDoor');assert.equal(problem('notice','advert','scrap'),'pAdvert');
 assert.equal(problem('notice','scrap','statement'),'pDate');assert.equal(problem('notice','photo','print'),'pBefore');assert.equal(problem('print','notice','scrap'),'pClaim');
 // Zwei Behauptungen ohne datierten Beleg lösen nichts: Aushang und Brief allein reichen nie.
 const guess=run(yard(),look('notice'),...proof('notice','letter',null),'YARD_CHECK');assert.equal(guess.case.yard.proven,false);assert.equal(yardGoal(guess.case),'evidence');
 // Nach bestandener Prüfung ist die Karte fest; nur Tamatem liest gegen, und nur der tragfähige Satz gilt.
 let s=run(full,...proof('notice','photo','scrap'),'YARD_CHECK');assert.ok(s.case.yard.proven);
 assert.deepEqual(step(s,'YARD_PROOF',{index:1,id:'print'}),s);assert.deepEqual(step(s,'YARD_WORD',{id:'precise'}),s);
 s=step(s,'YARD_SWITCH');for(const id of ['forgery','destroyed','unknown'])assert.deepEqual(step(s,'YARD_WORD',{id}),s);
 s=round(step(s,'YARD_WORD',{id:'precise'}));assert.ok(s.case.yard.worded);assert.deepEqual(step(s,'YARD_WORD',{id:'precise'}),s);
});

test('Hof: gestufte Hilfen folgen dem aktuellen Teilziel und beginnen bei jedem Teilziel wieder behutsam',()=>{
 setLanguage('de');let s=yard();const hint=x=>caseHint(x.stage,caseHintLevel(x),x);
 assert.equal(yardGoal(s.case),'explore');assert.equal(caseHintLevel(s),1);
 for(const n of [1,2,3,3]){s=round(step(s,'HINT'));assert.equal(hint(s),caseText('hYardExplore'+n));}
 s=run(s,look('notice'));assert.equal(yardGoal(s.case),'evidence');assert.equal(caseHintLevel(s),1);s=step(s,'HINT');assert.equal(hint(s),caseText('hYardEvidence1'));
 s=run(s,'YARD_SWITCH',look('edge'),look('pin'));assert.equal(yardGoal(s.case),'pass');s=step(step(s,'HINT'),'HINT');assert.equal(hint(s),caseText('hYardPass2'));
 s=run(s,'YARD_PASS','YARD_SWITCH');assert.equal(yardGoal(s.case),'proof');s=step(s,'HINT');assert.equal(hint(s),caseText('hYardProof1'));
 s=run(s,...proof('notice','print','scrap'),'YARD_CHECK');assert.equal(yardGoal(s.case),'word');s=run(s,'HINT','HINT','HINT');assert.equal(hint(s),caseText('hYardWord3'));
 s=round(run(s,'YARD_SWITCH',['YARD_WORD',{id:'precise'}]));assert.equal(yardGoal(s.case),'wrap');s=step(s,'HINT');assert.equal(hint(s),caseText('hInterview1'));
 assert.deepEqual(s.case.yard.help,{explore:3,evidence:1,pass:2,proof:1,word:3,wrap:1});assert.equal(s.hints['case-interviews'],3);round(s);
 for(const goal of ['Explore','Evidence','Pass','Proof','Word'])for(const n of [1,2,3])assert.equal(CASE_COPY['hYard'+goal+n].length,3);
});

test('Hof: Folgen sind sichtbar; Ansicht, Notizbuch und Bildbeschreibung ändern sich in allen drei Sprachen',()=>{
 const before=run(yard(),look('notice')),pocket=run(before,'YARD_SWITCH',look('edge')),after=finishCase(traces(yard()),'name','document',()=>{}),done=run(traces(yard()),'YARD_SWITCH');
 for(const [index,locale] of ['de','en','ar-EG'].entries()){
  setLanguage(locale);const T=key=>CASE_COPY[key][index];
  const view=caseView(before,helpers),changed=caseView(done,helpers);
  // Sieben Bildbereiche, jeder zusätzlich als Listeneintrag erreichbar; keine Aktion braucht Hover oder Ziehen.
  assert.equal(view.match(/class="hotspot shown yard-spot/g).length,7);assert.equal(view.match(/data-action="yard-spot"/g).length,14);
  assert.ok(view.includes(T('courtyardAlt'))&&!view.includes('yard-sheet'));assert.ok(view.includes(T('openFinding'))&&view.includes(T('evNotice')));assert.match(view,/data-action="case-meet" disabled/);
  assert.ok(changed.includes(T('courtyardAltAfter'))&&changed.includes('yard-sheet')&&changed.includes(T('wordGood'))&&changed.includes(T('yardDone')));
  assert.ok(caseView(pocket,helpers).includes(T('handTamatem')));
  // Das Notizbuch trennt Dinas Wissen von Tamatems noch nicht übergebenem Fund und hält den Befund mit Belegen fest.
  const pocketNotes=caseNotebook(pocket,x=>x);assert.ok(pocketNotes.includes(T('nbPocket'))&&pocketNotes.includes(T('nbPrint'))&&pocketNotes.includes(T('noticeText')));
  const notes=caseNotebook(after,x=>x);assert.equal(after.stage,'case-complete');
  for(const key of ['nbFinding','wordPrecise','evPrint','evScrap','newText','nbScrap'])assert.ok(notes.includes(T(key)),key);
  assert.ok(!caseNotebook(before,x=>x).includes(T('nbFinding')));
 }
 setLanguage('de');
});

test('Format 11: ältere Spielstände vor, in und nach dem Hof migrieren ohne Verlust; manipulierte Hofzustände scheitern',()=>{
 assert.equal(VERSION,11);
 const old=s=>{const x=JSON.parse(JSON.stringify(s));x.version=10;delete x.case.yard;return x;};
 // Vor dem Hof und mitten im alten Hof: Sequenz beginnt frisch, alte Interviewentscheidungen bleiben.
 for(const stage of ['case-opening','case-records']){const m=validateState(old(at(stage)));assert.deepEqual(m.case.yard,initialYard());assert.equal(finishCase(m).stage,'case-complete');}
 const fresh=yard();
 for(const actions of [[],[['CASE_CONSENT',{id:'name'}]],[['CASE_CONSENT',{id:'name'}],'CASE_NORA'],['CASE_EMIL'],[['CASE_CONSENT',{id:'anonymous'}],'CASE_NORA','CASE_EMIL',['CASE_WITHDRAW',{id:'document'}]]]){
  const legacy=old(run(fresh,...actions)),copy=structuredClone(legacy),m=validateState(legacy);assert.deepEqual(legacy,copy);
  assert.equal(m.stage,'case-interviews');assert.deepEqual(m.case.yard,initialYard());assert.equal(m.case.consent,legacy.case.consent);assert.equal(m.case.withdrawal,legacy.case.withdrawal);
  // Der alte Stand „bereit zum Treffen“ ist keine Sackgasse: Der Hof wird gespielt, danach geht es weiter.
  assert.equal(step(m,'CASE_MEET').stage,'case-interviews');const end=finishCase(m);assert.equal(end.stage,'case-complete');
  if(legacy.case.nora)assert.equal(end.case.consent,legacy.case.consent);if(legacy.case.withdrawal)assert.equal(end.case.withdrawal,legacy.case.withdrawal);
 }
 // Nach dem Hof: ehrlich als „nicht gespielt“ markiert, nichts erfunden, alle späteren Abschnitte laufen weiter.
 const snapshots=[];const end=finishCase(fresh,'name','document',s=>snapshots.push(s));const later=finishEco(end);
 for(const s of [...snapshots.filter(x=>CASE_STAGES.indexOf(x.stage)>=3),later]){
  const m=validateState(old(s));assert.deepEqual(m.case.yard,{...initialYard(),legacy:true});assert.equal(m.stage,s.stage);assert.equal(m.case.consent,'name');assert.equal(m.case.withdrawal,'document');
  round(m);assert.ok(!caseNotebook(m,x=>x).includes(CASE_COPY.nbFinding[0]));
  for(const a of ['YARD_SWITCH',look('notice'),'YARD_PASS','YARD_CHECK'])assert.deepEqual(run(m,a),m);
  if(CASE_STAGES.includes(m.stage))assert.equal(finishCase(m).stage,'case-complete');
 }
 assert.equal(step(validateState(old(end)),'ECO_START').stage,'eco-opening');
 // Format 11 ohne Hofzustand, erfundene Belege und übersprungene Schritte werden abgewiesen.
 const good=traces(yard()),bad=patch=>assert.throws(()=>validateState({...good,case:{...good.case,yard:{...good.case.yard,...patch}}}),JSON.stringify(patch));
 const noYard=JSON.parse(JSON.stringify(good));delete noYard.case.yard;assert.throws(()=>validateState(noYard));
 for(const patch of [{actor:'emil'},{proven:false},{proof:['notice','print','statement']},{proof:['notice','scrap','print']},{clues:['notice','print']},{clues:['notice','print','scrap','photo']},{seen:['d:notice']},{asked:['gentle']},{pocket:['print']},{legacy:true},{help:{explore:4}},{seen:['x:notice']},{proof:['notice','print']}])bad(patch);
 assert.throws(()=>validateState({...end,case:{...end.case,yard:initialYard()}}));
 assert.throws(()=>validateState({...at('case-records'),case:{...at('case-records').case,yard:{...initialYard(),seen:['d:notice'],clues:['notice']}}}));
 assert.throws(()=>validateState({...fresh,case:{...fresh.case,yard:{...initialYard(),legacy:true}}}));
 assert.throws(()=>validateState({...fresh,case:{...fresh.case,yard:{...initialYard(),clues:['statement'],asked:['gentle']}}}));
});

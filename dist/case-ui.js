import {ecoText} from './eco-ui.js';
import {CASE_COPY} from './case-copy.js';
import {getLanguage,t} from './i18n.js';
import {CASE_STAGES,RECORD_IDS,TIMELINE,yardKnown,yardGoal,yardOpen,yardProofProblem} from './case-state.js';
export function caseText(id,values={}){const entry=CASE_COPY[id];return entry[['de','en','ar-EG'].indexOf(getLanguage())].replace(/\{(\w+)\}/g,(m,key)=>values[key]??m);}
export function caseMeta(stage,s){const i=CASE_STAGES.indexOf(stage);return [String(i+1).padStart(2,'0'),caseText(['opening','records','interviews','timeline','response','editor','print','complete'][i]),stage==='case-interviews'&&s?.case.yard.actor==='tamatem'?'Tamatem':['Dina','Tamatem','Dina','Tamatem','Dina','Dina','Dina','Tamatem'][i]];}
const titleKey={letter:'letterTitle',address:'addressTitle',sale:'saleTitle',missing:'missingTitle',rent:'rentTitle',complaint:'complaintTitle',owner:'owner',office:'office'};
const bodyKey={letter:'letterText',address:'addressText',sale:'saleText',missing:'missingText',rent:'noraText',complaint:'complaintText',owner:'ownerText',office:'officeText'};
export function caseDocument(id){return titleKey[id]?{title:caseText(titleKey[id]),text:caseText(bodyKey[id])}:null;}
export function caseView(s,h){
 const {button,actor,scene,esc,feedback}=h,c=s.case,C=caseText;
 const p=key=>`<p>${esc(C(key))}</p>`;
 const b=(action,key,enabled=true,extra='')=>button(action,C(key),'button wide',`${enabled?'':'disabled'} ${extra}`);
 const choice=(action,id,key,selected,enabled=true)=>button(action,C(key),'choice '+(selected?'selected':''),`data-id="${id}" aria-pressed="${!!selected}" ${enabled?'':'disabled'}`);
 const doc=id=>button('case-read',`<span>${esc(caseDocument(id).title)}<small>${c.read.includes(id)||c.responses.includes(id)?t('Gelesen'):t('Untersuchen')}${c.selected.includes(id)?' · '+C('selected'):''}</small></span>`,'conversation',`data-id="${id}"`);
 let story='',panel='';
 switch(s.stage){
 case 'case-opening':story=p('openingText')+p('openingTalk');panel=p('openingTask')+b('case-begin','begin');break;
 case 'case-records':
  story=p('recordsText');panel=`<div class="conversation-list">${RECORD_IDS.map(doc).join('')}</div>`+b('case-address','checkAddress');
  if(c.addressChecked)panel+=`<p class="success-line">${C('addressGood')}</p>`+b('case-interviews','toInterviews');break;
 case 'case-interviews':{
  const y=c.yard,dina=y.actor==='dina',open=yardOpen(c),hand=dina?y.clues:y.pocket;
  story=p('interviewsText')+p('yardTask')+p(dina?'yardAsDina':'yardAsTamatem')+(y.proven&&!y.worded?p('proofGood'):'')+(y.worded?p('wordGood'):'');
  panel=button('yard-switch',C(dina?'switchToT':'switchToD'),'button secondary wide')+`<h3 class="yard-h">${C('yardPlaces')}</h3><div class="conversation-list">${YARD_SPOTS.map(([id],i)=>{const [label,mark]=spotInfo(id,y);return button('yard-spot',`<span>${i+1} · ${esc(C(label))}<small>${C(spotSeen(id,y)?'seenMark':mark)}</small></span>`,'conversation',`data-id="${id}"`);}).join('')}</div>`
   +`<h3 class="yard-h">${C(dina?'handDina':'handTamatem')}</h3>${hand.length?`<ul class="yard-hand">${hand.map(id=>`<li>${esc(C(EVIDENCE[id]))}</li>`).join('')}</ul>`:`<p class="yard-muted">${C('handNone')}</p>`}`
   +(y.worded?`<p class="success-line">${C('yardDone')}</p>`:'')
   +(open.length?`<p class="yard-muted">${C('yardOpenLabel')}</p><ul class="yard-hand">${open.map(key=>`<li>${C(key)}</li>`).join('')}</ul>`:'')
   +b('case-meet','meet',!open.length);break;}
 case 'case-timeline':
  story=p('timelineText');panel=`<div class="conversation-list">${['sale','rent','complaint'].map(doc).join('')}</div><div class="case-order">${['first','second','third'].map((key,index)=>`<label><strong>${C(key)}</strong><select data-action="case-order" data-index="${index}" ${c.linked?'disabled':''}><option value="">${C('choose')}</option>${TIMELINE.map(id=>`<option value="${id}" ${c.order[index]===id?'selected':''}>${C(id+'Event')}</option>`).join('')}</select></label>`).join('')}</div>`+b('case-link','checkTimeline');
  if(c.linked)panel+=`<p class="success-line">${C('timelineGood')}</p>`+b('case-response-start','toResponse');break;
 case 'case-response':story=p('responseText');panel=`<div class="conversation-list">${['owner','office'].map(doc).join('')}</div>`+b('case-editor','toEditor',c.responses.length===2);break;
 case 'case-editor':
  story=p('editorText');panel=`<div class="case-claims">${[['abduction','claimAbduction'],['complaints','claimComplaints'],['motive','claimMotive']].map(([id,key])=>`<fieldset ${c.checked?'disabled':''}><legend>${C(key)}</legend>${['verified','open','false'].map(value=>`<label class="case-radio"><input type="radio" name="case-${id}" data-action="case-claim" data-id="${id}" value="${value}" ${c.claims[id]===value?'checked':''}> <span>${C(value)}</span></label>`).join('')}</fieldset>`).join('')}</div>`+b('case-check','checkClaims');
  if(c.checked)panel+=p('checked')+b('case-correct','correct',!c.corrected);
  if(c.corrected)story+=p('correction');panel+=b('case-print','publish',c.checked&&c.corrected);break;
 case 'case-print':
  story=`<article class="case-article"><p class="eyebrow">${C('title')}</p><h2>${C('articleTitle')}</h2>${p(c.consent==='name'?'articleNamed':'articleAnonymous')}${p('articleBody')}${p('articleSources')}${p('correctionNote')}</article>`;
  panel=p(c.withdrawal==='omit'?'omitText':'documentText')+b('case-finish','afterPrint');break;
 case 'case-complete':story=p('ending')+p('finalTalk');panel=button('eco-start',ecoText('start'),'button wide')+b('notebook','caseNotes')+button('export',t('Spielstand als Datei sichern'),'button secondary wide');break;
 }
 const m=caseMeta(s.stage,s),courtyard=['case-interviews','case-response'].includes(s.stage),yardScene=s.stage==='case-interviews'?yardSpots(c.yard,esc):'',pinned=courtyard&&c.yard.worded;
 return `<div class="chapter-heading"><div><p class="eyebrow">${C('age')}</p><h1>${m[1]}</h1></div><span class="chapter-progress">${m[0]}<span> / 08</span></span></div><div class="game-grid case-game"><section class="stage-column">${actor()}${scene(courtyard?'case-courtyard':'case-library',C(pinned?'courtyardAltAfter':courtyard?'courtyardAlt':'libraryAlt'),(pinned?YARD_SHEET:'')+yardScene,courtyard?'yard-scene':'')}<div class="scene-tools">${button('hint',t('Hinweis'),'tool-button')}</div><div class="case-story">${story}</div></section><aside class="paper-panel"><p class="chapter-label">${C('title')}</p>${panel}${feedback?`<p class="feedback" role="status">${esc(feedback)}</p>`:''}</aside></div>`;
}
export function caseNotebook(s,esc){
 if(!CASE_STAGES.includes(s.stage)&&!s.case.published)return '';
 const C=caseText,c=s.case,entry=(title,body)=>`<article><h3>${esc(title)}</h3><p>${esc(body)}</p></article>`;
 let text=`<h2>${C('caseNotes')}</h2>`+entry(C('hypothesis'),C('hypothesisText'));
 for(const id of c.read)text+=entry(C('observation')+' · '+caseDocument(id).title,caseDocument(id).text);
 if(c.addressChecked)text+=entry(C('confirmed'),C('addressGood'));
 if(c.nora)text+=entry(C(c.consent==='name'?'named':'anonymous'),C('noraText'));
 if(c.withdrawal)text+=entry(C('interviews'),C(c.withdrawal==='omit'?'omitText':'documentText'));
 const y=c.yard;
 for(const id of y.clues)text+=entry(C('nbYard')+' · '+C(EVIDENCE[id]),C(NOTES[id]));
 for(const id of y.pocket)text+=entry(C('nbPocket')+' · '+C(EVIDENCE[id]),C(NOTES[id]));
 if(y.worded)text+=entry(C('nbFinding'),C('nbFindingText',{claim:C('wordPrecise'),first:C(EVIDENCE[y.proof[1]]),second:C(EVIDENCE[y.proof[2]])}))+entry(C('subNew'),C('newText'));
 if(CASE_STAGES.indexOf(s.stage)>=3||c.published)text+=entry(C('complaintTitle'),C('complaintText'));
 if(c.linked)text+=entry(C('confirmed'),C('timelineGood'));
 for(const id of c.responses)text+=entry(caseDocument(id).title,caseDocument(id).text);
 if(c.corrected)text+=entry(C('correct'),C('correction'));
 return text;
}
// The courtyard keeps a separate help level per sub-goal, so a new step never starts with its most explicit hint.
export function caseHintLevel(s){return Math.max(1,Math.min(3,(s.stage==='case-interviews'?s.case.yard.help[yardGoal(s.case)]:s.hints[s.stage])||1));}
export function caseHint(stage,level,s){
 const goal=stage==='case-interviews'&&s?yardGoal(s.case):'wrap',n=Math.max(1,Math.min(3,level));
 if(goal!=='wrap')return caseText('hYard'+goal[0].toUpperCase()+goal.slice(1)+n);
 const prefix=['Opening','Records','Interview','Timeline','Response','Editor','Print','Complete'][CASE_STAGES.indexOf(stage)];return caseText('h'+prefix+n);
}

// ---- Courtyard (case-interviews) ----
// Marker positions are percentages of the 1672×941 illustration; the scene keeps that ratio in every layout.
const YARD_SPOTS=[['bench',24,46],['board',92,22],['tamatem',83.5,57],['bins',68,70],['door',73.5,22],['flowers',37.5,17],['dina',52,70]];
const EVIDENCE={notice:'evNotice',scrap:'evScrap',print:'evPrint',photo:'evPhoto',statement:'evStatement',letter:'evLetter',advert:'evAdvert',door:'evDoor',emil:'evEmil'};
const NOTES={notice:'noticeText',scrap:'nbScrap',print:'nbPrint',photo:'nbPhoto',statement:'nbStatement',door:'nbDoor',advert:'nbAdvert'};
const BOARD_SUBS=[['notice','subNotice'],['advert','subAdvert'],['marks','subMarks'],['edge','subEdge'],['pin','subPin']];
const YARD_SHEET='<svg class="yard-sheet" viewBox="0 0 1672 941" aria-hidden="true"><g class="yard-drop"><g transform="rotate(-5 1622 338)"><rect x="1592" y="296" width="60" height="84"/><path d="M1600 318h44M1600 330h44M1600 342h44M1600 354h30"/><circle cx="1622" cy="303" r="5"/></g></g></svg>';
// The marker on the active figure opens that figure's own notes; the marker on the other figure switches perspective.
function spotInfo(id,y){
 const dina=y.actor==='dina';
 if(id==='dina')return dina?['spotCard','openMark']:['switchToD','switchMark'];
 if(id==='tamatem')return dina?['switchToT','switchMark']:['spotPad','openMark'];
 return [{bench:'spotBench',board:'spotBoard',bins:'spotBins',door:'spotDoor',flowers:'spotFlowers'}[id],dina&&['bench','flowers'].includes(id)?'talkMark':'lookMark'];
}
const spotSeen=(id,y)=>(id==='board'?BOARD_SUBS.map(([sub])=>sub):[id]).some(sub=>y.seen.includes(y.actor[0]+':'+sub));
function yardSpots(y,esc){return YARD_SPOTS.map(([id,x,top],i)=>{const label=esc(caseText(spotInfo(id,y)[0]));return `<button class="hotspot shown yard-spot ${spotSeen(id,y)?'visited':''} ${id===y.actor?'yard-me':''}" style="--x:${x}%;--y:${top}%" data-action="yard-spot" data-id="${id}" aria-label="${i+1} · ${label}"><span>${i+1}</span><b>${label}</b></button>`;}).join('');}
function boardDrawing(y,esc){
 const dot=(n,x,top)=>`<g class="yard-num"><circle cx="${x}" cy="${top}" r="11"/><text x="${x}" y="${top+4}" text-anchor="middle">${n}</text></g>`;
 return `<svg class="yard-board" viewBox="0 0 360 236" role="img" aria-label="${esc(caseText('boardAlt')+(y.worded?' '+caseText('boardAltNew'):''))}">
 <rect x="4" y="4" width="352" height="208" rx="3" fill="#6a4a2f" stroke="#1d3033" stroke-width="3"/><rect x="14" y="14" width="332" height="188" fill="#c39a62" stroke="#1d3033" stroke-width="1.5"/>
 <g fill="#d7b783" stroke="#a98452" stroke-dasharray="4 3"><rect x="26" y="126" width="62" height="56"/><rect x="100" y="132" width="58" height="50"/><rect x="150" y="26" width="40" height="52"/><rect x="150" y="88" width="40" height="34"/></g>
 <g fill="#7b5b36"><circle cx="30" cy="130" r="1.6"/><circle cx="84" cy="130" r="1.6"/><circle cx="30" cy="178" r="1.6"/><circle cx="84" cy="178" r="1.6"/><circle cx="104" cy="136" r="1.6"/><circle cx="154" cy="136" r="1.6"/></g>
 <g stroke="#1d3033" stroke-width="1.5"><rect x="26" y="26" width="112" height="86" fill="#e3a94f"/><circle cx="112" cy="48" r="11" fill="#f6dfa2"/><path d="M38 100V70l22-16 22 16v30z" fill="#f5eddd"/><path d="M92 100V78l14-10 14 10v22z" fill="#355e5c"/><path d="M34 106h96" stroke="#f5eddd" stroke-width="3"/></g>
 <g><rect x="204" y="24" width="124" height="166" fill="#fbf7ec" stroke="#1d3033" stroke-width="1.5"/><path d="M216 42h70" stroke="#1d3033" stroke-width="3"/><path d="M216 60h100M216 72h100M216 84h88M216 104h100M216 116h100M216 128h64M216 148h100M216 160h80" stroke="#7d8684" stroke-width="2"/><path d="M216 182h34" stroke="#7d8684" stroke-width="1"/><circle cx="266" cy="30" r="3.5" fill="#355e5c" stroke="#1d3033"/></g>
 <g><path d="M306 196l26-6 6 22-20 6z" fill="#f1e8d2" stroke="#1d3033" stroke-width="1.2"/><circle cx="322" cy="196" r="4" fill="#8a4a2a" stroke="#1d3033"/></g>
 ${y.worded?`<g class="yard-drop"><g transform="rotate(-4 170 80)"><rect x="140" y="28" width="58" height="92" fill="#fbf6e6" stroke="#1d3033" stroke-width="1.5"/><path d="M148 48q8-5 14 0t14 0 14 0M148 62q8-5 14 0t14 0 14 0M148 76q8-5 14 0t14 0 14 0M148 90q8-5 14 0t14 0" fill="none" stroke="#31506b" stroke-width="1.6"/><circle cx="169" cy="34" r="4" fill="#9b533b" stroke="#1d3033"/></g></g>`:''}
 <g fill="#4f7a52" stroke="#1d3033" stroke-width="1.2"><ellipse cx="214" cy="204" rx="26" ry="12" transform="rotate(-18 214 204)"/><ellipse cx="256" cy="196" rx="28" ry="12" transform="rotate(8 256 196)"/><ellipse cx="296" cy="212" rx="26" ry="11" transform="rotate(-12 296 212)"/><ellipse cx="340" cy="218" rx="22" ry="10" transform="rotate(14 340 218)"/><ellipse cx="236" cy="222" rx="30" ry="11"/></g>
 ${dot(1,304,42)}${dot(2,38,38)}${dot(3,57,154)}${dot(4,232,182)}${dot(5,340,192)}${y.worded?dot(6,186,104):''}</svg>`;
}
// Builds one detail view. reply = text answering the last action; tone 'bad' marks a failed attempt.
function yardModal(s,area,h,reply='',tone=''){
 const {button,esc,heading}=h,C=caseText,c=s.case,y=c.yard,dina=y.actor==='dina',p=(key,cls='')=>`<p${cls?` class="${cls}"`:''}>${esc(C(key))}</p>`;
 const answer=reply?`<div class="yard-reply ${tone}" tabindex="-1" data-yard-focus role="status">${reply}</div>`:'';
 const row=(action,id,label,seen,enabled=true)=>button(action,`<span>${esc(label)}<small>${C(seen?'seenMark':'lookMark')}</small></span>`,'conversation',`data-id="${id}" ${enabled?'':'disabled'}`);
 const choice=(action,id,key,selected,enabled=true)=>button(action,esc(C(key)),'choice '+(selected?'selected':''),`data-id="${id}" aria-pressed="${!!selected}" ${enabled?'':'disabled'}`);
 const back=button('close',C('back'),'button secondary wide');
 const titles={board:'spotBoard',bench:'spotBench',flowers:'spotFlowers',bins:'spotBins',door:'spotDoor',card:'spotCard',pad:'spotPad'};
 let body='';
 switch(area){
 case 'board':
  body=boardDrawing(y,esc)+(answer||p('boardIntro'))+`<div class="conversation-list">${[...BOARD_SUBS,...(y.worded?[['new','subNew']]:[])].map(([id,key],i)=>row('yard-look',id,`${i+1} · ${C(key)}`,id!=='new'&&y.seen.includes(y.actor[0]+':'+id))).join('')}</div>`;break;
 case 'bench':
  if(!dina){body=p('tBench');break;}
  body=(y.worded?p('noraAfter'):'')+answer;
  if(!c.nora)body+=p('consentText')+`<div class="choice-list">${choice('yard-consent','name','named',c.consent==='name')}${choice('yard-consent','anonymous','anonymous',c.consent==='anonymous')}</div>`+button('yard-nora',esc(C('askNora')),'button wide',c.consent?'':'disabled')+p('noraFirst','yard-muted');
  else body+=`<p class="success-line">${C(c.consent==='name'?'named':'anonymous')}</p>`+p('boardLead')+`<div class="conversation-list">${row('yard-nora','',C('askNora'),true)}${row('yard-ask','gentle',C('askGentle'),y.asked.includes('gentle'))}${y.clues.includes('notice')?row('yard-ask','contradiction',C('askContra'),y.asked.includes('contradiction')):''}</div>`+(y.clues.includes('notice')?'':p('contraLocked','yard-muted'));
  break;
 case 'flowers':
  if(!dina){body=p('tFlowers');break;}
  body=p('dFlowers')+answer+button('yard-emil',`<span>${esc(C('askEmil'))}<small>${C(c.emil?'seenMark':'talkMark')}</small></span>`,'conversation');
  if(c.emil)body+=`<div class="choice-list">${choice('yard-withdraw','omit','omit',c.withdrawal==='omit',!c.withdrawal)}${choice('yard-withdraw','document','document',c.withdrawal==='document',!c.withdrawal)}</div>`;
  if(c.withdrawal)body+=p(c.withdrawal==='omit'?'omitText':'documentText');
  if(y.worded)body+=p('emilAfter');
  break;
 case 'bins':body=p(dina?'dBins':'tBins');break;
 case 'door':body=p(dina?'dDoor':'tDoor');break;
 case 'card':{
  const known=yardKnown(c);
  body=p('cardIntro')+`<div class="case-order">${['slot1','slot2','slot3'].map((key,index)=>`<label><strong>${C(key)}</strong><select data-action="yard-proof" data-index="${index}" ${y.proven?'disabled':''}><option value="">${C('chooseEvidence')}</option>${known.map(id=>`<option value="${id}" ${y.proof[index]===id?'selected':''}>${esc(C(EVIDENCE[id]))}</option>`).join('')}</select></label>`).join('')}</div>`+answer;
  body+=y.proven?(reply?'':`<p class="success-line">${esc(C(y.worded?'yardDone':'proofGood'))}</p>`)+(y.worded?'':button('yard-switch',C('toWord'),'button wide','data-id="word"')):button('yard-check',C('checkProof'),'button wide');
  break;}
 case 'pad':
  body=p('padIntro')+(y.pocket.length?`<ul class="yard-hand">${y.pocket.map(id=>`<li>${esc(C(EVIDENCE[id]))}</li>`).join('')}</ul>`:p('padEmpty','yard-muted'))+answer+button('yard-pass',C('pass'),'button wide',y.pocket.length?'':'disabled');
  if(y.worded)body+=`<p class="success-line">${esc(C('yardDone'))}</p>`;
  else if(y.proven)body+=p('wordIntro')+`<div class="choice-list">${['forgery','precise','destroyed'].map(id=>choice('yard-word',id,'word'+id[0].toUpperCase()+id.slice(1),false)).join('')}</div>`;
  else body+=p('padCardWait','yard-muted');
  break;
 }
 return heading(C('title'),esc(C(titles[area])))+body+back;
}
let lastSpot=null,closeBound=false;
// Handles every courtyard interaction. h supplies the app's own state access and modal helpers.
export function yardClick(a,id,h,index){
 const C=caseText,state=()=>h.state(),y=()=>state().case.yard,dina=()=>y().actor==='dina',doc=globalThis.document,esc=h.esc;
 const show=(area,reply='',tone='',focus='[data-yard-focus]')=>{h.openModal(yardModal(state(),area,h,reply,tone));doc?.querySelector('#modal-body '+focus)?.focus({preventScroll:true});};
 const text=key=>esc(C(key)),noted=(key,found)=>text(key)+(found?`<p class="success-line">${esc(C('gotNote',{title:C(EVIDENCE[found])}))}</p>`:'');
 if(doc&&!closeBound){closeBound=true;doc.querySelector('#modal')?.addEventListener('close',event=>{if(event.target.open)return;if(lastSpot)doc.querySelector(`#main [data-action="yard-spot"][data-id="${lastSpot}"]`)?.focus({preventScroll:true});lastSpot=null;});}
 switch(a){
 case 'yard-switch':h.dispatch({type:'YARD_SWITCH'});if(id==='word'){lastSpot='tamatem';show('pad');}else{lastSpot=y().actor;h.closeModal();doc?.querySelector(`#main [data-action="yard-spot"][data-id="${lastSpot}"]`)?.focus({preventScroll:true});}break;
 case 'yard-spot':
  if(id===(dina()?'tamatem':'dina')){yardClick('yard-switch','',h);break;}
  lastSpot=id;
  if(id==='dina'||id==='tamatem'){show(dina()?'card':'pad');break;}
  if(id!=='board')h.dispatch({type:'YARD_LOOK',id});
  show(id);break;
 case 'yard-look':{
  if(id==='new'){show('board',`<div class="document-sheet"><p>${text('newText')}</p></div>`);break;}
  const before=[...y().clues,...y().pocket];h.dispatch({type:'YARD_LOOK',id});
  const found=[...y().clues,...y().pocket].find(item=>!before.includes(item)),who=dina()?'d':'t';
  const key=id==='pin'&&dina()?(y().clues.includes('scrap')?'dPinFound':'dPinHidden'):who+id[0].toUpperCase()+id.slice(1);
  show('board',(id==='notice'?`<div class="document-sheet"><p>${text('noticeText')}</p></div>`:'')+noted(key,found));break;}
 case 'yard-consent':h.dispatch({type:'CASE_CONSENT',id});show('bench','','','[data-action="yard-nora"]');break;
 case 'yard-nora':h.dispatch({type:'CASE_NORA'});show('bench',state().case.nora?text('noraText'):'');break;
 case 'yard-ask':h.dispatch({type:'YARD_ASK',id});if(y().asked.includes(id))show('bench',text(id==='gentle'?'gentleText':'contraText'));break;
 case 'yard-emil':h.dispatch({type:'CASE_EMIL'});show('flowers',text('emilText'));break;
 case 'yard-withdraw':h.dispatch({type:'CASE_WITHDRAW',id});show('flowers');break;
 case 'yard-pass':if(!y().pocket.length)break;h.dispatch({type:'YARD_PASS'});h.toast(C('passToast'));show('pad',text('passText'));break;
 case 'yard-proof':h.dispatch({type:'YARD_PROOF',index,id:id||null});show('card','','',`[data-action="yard-proof"][data-index="${index}"]`);break;
 case 'yard-check':{const problem=yardProofProblem(state().case);h.dispatch({type:'YARD_CHECK'});show('card',text(problem||'proofGood'),problem?'bad':'');break;}
 case 'yard-word':
  if(id!=='precise'){show('pad',text(id==='forgery'?'wordForgeryNo':'wordDestroyedNo'),'bad');break;}
  h.dispatch({type:'YARD_WORD',id});
  if(y().worded){lastSpot='board';h.closeModal();h.toast(C('sceneChanged'));doc?.querySelector('.yard-scene')?.scrollIntoView({block:'nearest'});}
  break;
 }
}

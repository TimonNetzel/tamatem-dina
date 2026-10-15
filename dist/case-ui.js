import {ecoText} from './eco-ui.js';
import {CASE_COPY} from './case-copy.js';
import {getLanguage,t} from './i18n.js';
import {CASE_STAGES,RECORD_IDS,TIMELINE} from './case-state.js';
export function caseText(id,values={}){const entry=CASE_COPY[id];return entry[['de','en','ar-EG'].indexOf(getLanguage())].replace(/\{(\w+)\}/g,(m,key)=>values[key]??m);}
export function caseMeta(stage){const i=CASE_STAGES.indexOf(stage);return [String(i+1).padStart(2,'0'),caseText(['opening','records','interviews','timeline','response','editor','print','complete'][i]),['Dina','Tamatem','Dina','Tamatem','Dina','Dina','Dina','Tamatem'][i]];}
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
 case 'case-interviews':
  story=p('interviewsText');panel=p('consentText')+`<div class="choice-list">${choice('case-consent','name','named',c.consent==='name',!c.nora)}${choice('case-consent','anonymous','anonymous',c.consent==='anonymous',!c.nora)}</div>`+b('case-nora','askNora',!!c.consent)+b('case-emil','askEmil');
  if(c.emil){story+=p('emilText');panel+=`<div class="choice-list">${choice('case-withdraw','omit','omit',c.withdrawal==='omit',!c.withdrawal)}${choice('case-withdraw','document','document',c.withdrawal==='document',!c.withdrawal)}</div>`;}
  if(c.withdrawal)story+=p(c.withdrawal==='omit'?'omitText':'documentText');
  panel+=b('case-meet','meet',c.nora&&!!c.withdrawal);break;
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
 const m=caseMeta(s.stage),courtyard=['case-interviews','case-response'].includes(s.stage);
 return `<div class="chapter-heading"><div><p class="eyebrow">${C('age')}</p><h1>${m[1]}</h1></div><span class="chapter-progress">${m[0]}<span> / 08</span></span></div><div class="game-grid case-game"><section class="stage-column">${actor()}${scene(courtyard?'case-courtyard':'case-library',C(courtyard?'courtyardAlt':'libraryAlt'))}<div class="scene-tools">${button('hint',t('Hinweis'),'tool-button')}</div><div class="case-story">${story}</div></section><aside class="paper-panel"><p class="chapter-label">${C('title')}</p>${panel}${feedback?`<p class="feedback" role="status">${esc(feedback)}</p>`:''}</aside></div>`;
}
export function caseNotebook(s,esc){
 if(!CASE_STAGES.includes(s.stage)&&!s.case.published)return '';
 const C=caseText,c=s.case,entry=(title,body)=>`<article><h3>${esc(title)}</h3><p>${esc(body)}</p></article>`;
 let text=`<h2>${C('caseNotes')}</h2>`+entry(C('hypothesis'),C('hypothesisText'));
 for(const id of c.read)text+=entry(C('observation')+' · '+caseDocument(id).title,caseDocument(id).text);
 if(c.addressChecked)text+=entry(C('confirmed'),C('addressGood'));
 if(c.nora)text+=entry(C(c.consent==='name'?'named':'anonymous'),C('noraText'));
 if(c.withdrawal)text+=entry(C('interviews'),C(c.withdrawal==='omit'?'omitText':'documentText'));
 if(CASE_STAGES.indexOf(s.stage)>=3||c.published)text+=entry(C('complaintTitle'),C('complaintText'));
 if(c.linked)text+=entry(C('confirmed'),C('timelineGood'));
 for(const id of c.responses)text+=entry(caseDocument(id).title,caseDocument(id).text);
 if(c.corrected)text+=entry(C('correct'),C('correction'));
 return text;
}
export function caseHint(stage,level){const prefix=['Opening','Records','Interview','Timeline','Response','Editor','Print','Complete'][CASE_STAGES.indexOf(stage)];return caseText('h'+prefix+Math.max(1,Math.min(3,level)));}

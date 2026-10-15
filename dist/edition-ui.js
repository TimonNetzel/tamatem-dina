import {EDITION_STAGES,EDITION_DOCS,EDITION_OPTIONS,EDITION_ORDER,editionReady,editionConsequences} from './edition-state.js';
import {EDITION_COPY} from './edition-copy.js';
import {getLanguage,t} from './i18n.js';
export function editionText(key,values={}){const e=EDITION_COPY[key];if(!e)throw Error('Missing edition text: '+key);return e[{de:0,en:1,'ar-EG':2}[getLanguage()]??0].replace(/\{(\w+)\}/g,(_,id)=>String(values[id]??''));}
export function editionMeta(stage){const i=EDITION_STAGES.indexOf(stage);return [String(Math.min(12,i+1)).padStart(2,'0'),editionText(stage.slice(8)),['Dina','Tamatem','Dina','Tamatem','Tamatem','Dina','Tamatem','Dina','Dina','Tamatem','Dina','Tamatem','Tamatem'][i]];}
export function editionDocument(id,s){if(!Object.values(EDITION_DOCS).flat().includes(id))return null;const C=editionText,f=editionConsequences(s);let text=C(id+'Text');if(id==='tenant')text+='\n'+C(f.tenantRoute+'Note');if(id==='archivist')text+='\n'+C(f.archiveRoute+'Note');if(id==='register')text+='\n'+C(f.sourceRoute+'Note');if(id==='workplan')text+='\n'+C(f.workflow);return {title:C(id+'Title'),text};}
export function editionHint(stage,level){return editionText('h'+Math.min(11,EDITION_STAGES.indexOf(stage))+['a','b','c'][Math.max(1,Math.min(3,level))-1]);}
export function editionPlans(s){const c=s.edition.picks;return c.dinaGoal&&c.tamatemGoal&&c.cooperation?editionText('endingPlans',{dina:editionText(c.dinaGoal),tamatem:editionText(c.tamatemGoal),cooperation:editionText(c.cooperation)}):'';}
export function editionArticle(){return editionText('article');}
export function editionConsequencesText(s){const f=editionConsequences(s),C=editionText;return [C(f.tenantRoute+'Note'),C(f.archiveRoute+'Note'),C(f.sourceRoute+'Note'),C(f.workflow),C(f.audience),C(f.question),C(f.doubt)];}
export function editionView(s,h){
 const {button,actor,scene,esc,feedback}=h,C=editionText,c=s.edition,p=s.stage.slice(8),done=c.checked.includes(p),ready=editionReady(c,p),m=editionMeta(s.stage),f=editionConsequences(s);
 const para=key=>`<p>${esc(C(key))}</p>`,b=(action,key,enabled=true)=>button('edition-'+action,esc(C(key)),'button wide',enabled?'':'disabled');
 let story=para(p==='complete'?'ending':p+'Text');
 let panel=`<div class="conversation-list">${(EDITION_DOCS[p]||[]).map(id=>button('edition-read',`<span>${esc(editionDocument(id,s).title)}<small>${t(c.read.includes(id)?'Gelesen':'Untersuchen')}</small></span>`,'conversation',`data-id="${id}"`)).join('')}</div>`;
 for(const [id,values] of Object.entries(EDITION_OPTIONS[p]||{}))panel+=`<fieldset class="edition-options" ${done?'disabled':''}><legend>${esc(C(id))}</legend>${values.map(value=>`<label class="case-radio"><input type="radio" name="edition-${id}" data-action="edition-pick" data-id="${id}" value="${value}" ${c.picks[id]===value?'checked':''}><span>${esc(C(id==='sourceRoute'&&value==='letter'?'routeLetter':value))}</span></label>`).join('')}</fieldset>`;
 if(p==='chain')panel+=`<div class="case-order">${EDITION_ORDER.map((_,i)=>`<label><strong>${esc(C('position',{number:i+1}))}</strong><select data-action="edition-order" data-index="${i}" ${done?'disabled':''}><option value="">${C('choose')}</option>${EDITION_ORDER.map(id=>`<option value="${id}" ${c.order[i]===id?'selected':''}>${esc(C(id))}</option>`).join('')}</select></label>`).join('')}</div>`;
 if(p==='call'){story+=para(f.memory);if(done)story+=para(c.picks.start+'Result');}
 if(p==='funds')story+='<div class="edition-numbers" dir="ltr"><bdi>6000 − 4500 = ?</bdi><bdi>2000 ≠ R7</bdi></div>';
 if(p==='publish')story+='<div class="edition-numbers" dir="ltr"><bdi>800 × 2.50 = ?</bdi><bdi>1200 + 800 = 2000</bdi></div>';
 if(p==='agreement')story+=para(f.workflow);
 if(p==='future'||p==='complete')story+=`<article class="case-article edition-correction"><h2>${esc(C('draftTitle'))}</h2><p>${c.authored?`<del>${esc(C('old'))}</del>`:esc(C('old'))}</p>${c.authored?para('correction'):''}</article>`;
 if(p==='complete')panel+=para('endNote')+button('notebook',C('notes'),'button wide')+button('export',t('Spielstand als Datei sichern'),'button secondary wide');
 else{
  panel+=b('check','check',!done)+(done?`<p class="success-line" role="status">${esc(C('good'))}</p>`:'');
  for(const [phase,action,flag,key] of [['sources','protect','protected','protectAction'],['chain','meet','met','meet'],['agreement','sign','dinaSigned','sign'],['future','author','authored','author'],['publish','approve','approved','approve']])if(p===phase)panel+=b(action,key,done&&!c[flag]);
  if(p==='publish')panel+=b('publish','release',c.approved&&!c.published);
  panel+=b('next','next',ready);
 }
 for(const [phase,flag] of [['sources','protected'],['chain','met'],['agreement','dinaSigned'],['future','authored'],['publish','approved'],['publish','published']])if(p===phase&&c[flag]&&!(flag==='approved'&&c.published))story+=para(flag+'Note');
 if(p==='publish'||p==='complete')story+=`<article class="case-article edition-article"><h2>${C(c.published?'publishedTitle':'editionDraftTitle')}</h2>${para('article')}<p>${esc(editionPlans(s))}</p></article>`;
 if(p==='complete')story+=`<section class="edition-consequences"><h2>${C('consequences')}</h2>${editionConsequencesText(s).map(text=>`<p>${esc(text)}</p>`).join('')}</section>`;
 return `<div class="chapter-heading"><div><p class="eyebrow">${C('age')}</p><h1>${m[1]}</h1></div><span class="chapter-progress"><bdi>${m[0]} / 12</bdi></span></div><div class="game-grid edition-game"><section class="stage-column">${actor()}${scene('edition-newsroom',C('alt'))}<div class="scene-tools">${button('hint',t('Hinweis'),'tool-button')}</div><div class="case-story">${story}</div></section><aside class="paper-panel"><p class="chapter-label">${C('title')}</p>${panel}${feedback?`<p class="feedback" role="status">${esc(feedback)}</p>`:''}</aside></div>`;
}
export function editionNotebook(s,esc){
 if(!EDITION_STAGES.includes(s.stage))return '';
 const c=s.edition,C=editionText,entry=(title,text)=>`<article><h3>${esc(title)}</h3><p>${esc(text)}</p></article>`;
 let out=`<h2>${C('notes')}</h2>`;
 for(const id of c.read){const d=editionDocument(id,s);out+=entry(d.title,d.text);}
 for(const p of c.checked){out+=entry(C(p),C('good'));for(const id of Object.keys(EDITION_OPTIONS[p]||{})){const value=c.picks[id];out+=entry(C(id),C(id==='sourceRoute'&&value==='letter'?'routeLetter':value));}}
 if(c.checked.includes('chain'))out+=entry(C('chain'),c.order.map(id=>C(id)).join(' → '));
 if(c.checked.includes('call'))out+=entry(C('call'),C(c.picks.start+'Result'));
 for(const flag of ['protected','met','dinaSigned','authored','published'])if(c[flag])out+=entry(C('notes'),C(flag+'Note'));
 if(c.authored)out+=entry(C('future'),C('correction'));
 if(c.published)out+=entry(C('title'),editionArticle())+entry(C('complete'),editionPlans(s));
 out+=entry(C('consequences'),editionConsequencesText(s).join('\n'));
 return out;
}

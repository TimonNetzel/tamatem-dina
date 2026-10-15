import {editionText} from './edition-ui.js';
import {HEALING_STAGES,HEALING_DOCS,HEALING_OPTIONS,HEALING_ORDER,healingReady} from './healing-state.js';
import {HEALING_COPY} from './healing-copy.js';
import {getLanguage,t} from './i18n.js';
export function healingText(key,values={}){const entry=HEALING_COPY[key];if(!entry)throw Error('Missing healing text: '+key);return entry[{de:0,en:1,'ar-EG':2}[getLanguage()]??0].replace(/\{(\w+)\}/g,(_,id)=>String(values[id]??''));}
export function healingMeta(stage){const i=HEALING_STAGES.indexOf(stage);return [String(Math.min(12,i+1)).padStart(2,'0'),healingText(stage.slice(8)),['Dina','Tamatem','Tamatem','Dina','Tamatem','Tamatem','Dina','Tamatem','Dina','Tamatem','Dina','Tamatem','Tamatem'][i]];}
export function healingDocument(id){return Object.values(HEALING_DOCS).flat().includes(id)?{title:healingText(id+'Title'),text:healingText(id+'Text')}:null;}
export function healingHint(stage,level){return healingText('h'+Math.min(11,HEALING_STAGES.indexOf(stage))+['a','b','c'][Math.max(1,Math.min(3,level))-1]);}
export function healingArticle(){return healingText('article');}
export function healingView(s,h){
 const {button,actor,scene,esc,feedback}=h,C=healingText,c=s.healing,p=s.stage.slice(8),done=c.checked.includes(p),ready=healingReady(c,p),m=healingMeta(s.stage);
 const para=key=>`<p>${esc(C(key))}</p>`,b=(action,key,enabled=true)=>button('healing-'+action,esc(C(key)),'button wide',enabled?'':'disabled');
 let story=para(p==='complete'?'ending':p+'Text');
 let panel=`<div class="conversation-list">${(HEALING_DOCS[p]||[]).map(id=>button('healing-read',`<span>${esc(healingDocument(id).title)}<small>${t(c.read.includes(id)?'Gelesen':'Untersuchen')}</small></span>`,'conversation',`data-id="${id}"`)).join('')}</div>`;
 for(const [id,values] of Object.entries(HEALING_OPTIONS[p]||{}))panel+=`<fieldset class="healing-options" ${done?'disabled':''}><legend>${esc(C(id))}</legend>${values.map(value=>`<label class="case-radio"><input type="radio" name="healing-${id}" data-action="healing-pick" data-id="${id}" value="${value}" ${c.picks[id]===value?'checked':''}><span>${esc(C(id==='wording'&&value==='limited'?'limitedClaim':value))}</span></label>`).join('')}</fieldset>`;
 if(p==='chain')panel+=`<div class="case-order">${HEALING_ORDER.map((_,i)=>`<label><strong>${esc(C('position',{number:i+1}))}</strong><select data-action="healing-order" data-index="${i}" ${done?'disabled':''}><option value="">${C('choose')}</option>${HEALING_ORDER.map(id=>`<option value="${id}" ${c.order[i]===id?'selected':''}>${esc(C(id))}</option>`).join('')}</select></label>`).join('')}</div>`;
 if(p==='study')story+=`<div class="healing-numbers" dir="ltr"><bdi>40 / 200 = 20 %</bdi><bdi>20 / 200 = 10 %</bdi></div>`;
 if(p==='supply')story+=`<div class="healing-numbers" dir="ltr"><bdi>120 − 20 − 60 = ?</bdi></div>`;
 if(p==='contract')story+=`<div class="healing-numbers" dir="ltr"><bdi>40 × (100 + 20 + 80) − 4800 = ?</bdi></div>`;
 if(p==='revise')story+=`<article class="case-article healing-correction"><h2>${C('draftTitle')}</h2><p>${c.revised?`<del>${esc(C('old'))}</del>`:esc(C('old'))}</p>${c.revised?para('correction'):''}</article>`;
 if(p==='complete')panel+=para('endNote')+button('edition-start',esc(editionText('title')),'button wide')+button('notebook',C('notes'),'button wide')+button('export',t('Spielstand als Datei sichern'),'button secondary wide');
 else{
  panel+=b('check','check',!done)+(done?`<p class="success-line" role="status">${esc(C('good'))}</p>`:'');
  for(const [phase,action,flag,key] of [['protect','protect','protected','protectAction'],['chain','meet','met','meet'],['revise','revise','revised','reviseAction'],['publish','approve','approved','approve']])if(p===phase)panel+=b(action,key,done&&!c[flag]);
  if(p==='publish')panel+=b('publish','release',c.approved&&!c.published);
  panel+=b('next','next',ready);
 }
 if(p==='call'&&done)story+=para(c.picks.approach+'Result');
 if(p==='responses'&&done)story+=para(c.picks.responseMode+'Result');
 for(const [phase,flag] of [['protect','protected'],['chain','met'],['publish','approved'],['publish','published']])if(p===phase&&c[flag])story+=para(flag);
 if(p==='publish'||p==='complete')story+=`<article class="case-article healing-article"><h2>${C(c.published?'published':'draftTitle')}</h2>${para('article')}</article>`;
 return `<div class="chapter-heading"><div><p class="eyebrow">${C('age')}</p><h1>${m[1]}</h1></div><span class="chapter-progress"><bdi>${m[0]} / 12</bdi></span></div><div class="game-grid healing-game"><section class="stage-column">${actor()}${scene('healing-clinic',C('alt'))}<div class="scene-tools">${button('hint',t('Hinweis'),'tool-button')}</div><div class="case-story">${story}</div></section><aside class="paper-panel"><p class="chapter-label">${C('title')}</p>${panel}${feedback?`<p class="feedback" role="status">${esc(feedback)}</p>`:''}</aside></div>`;
}
export function healingNotebook(s,esc){
 if(!HEALING_STAGES.includes(s.stage)&&!s.healing.published)return '';
 const c=s.healing,C=healingText,entry=(title,text)=>`<article><h3>${esc(title)}</h3><p>${esc(text)}</p></article>`;
 let out=`<h2>${C('notes')}</h2>`;
 for(const id of c.read){const d=healingDocument(id);out+=entry(d.title,d.text);}
 for(const p of c.checked){out+=entry(C(p),C('good'));for(const id of Object.keys(HEALING_OPTIONS[p]||{})){const value=c.picks[id];out+=entry(C(id),C(id==='wording'&&value==='limited'?'limitedClaim':value));}}
 if(c.checked.includes('chain'))out+=entry(C('chain'),c.order.map(id=>C(id)).join(' → '));
 if(c.checked.includes('call'))out+=entry(C('call'),C(c.picks.approach+'Result'));
 if(c.checked.includes('responses'))out+=entry(C('responses'),C(c.picks.responseMode+'Result'));
 for(const key of ['protected','met','revised','published'])if(c[key])out+=entry(C(key==='revised'?'revise':key==='met'?'chain':key==='protected'?'protect':'publish'),C(key==='revised'?'correction':key));
 if(c.published)out+=entry(C('title'),healingArticle());
 return out;
}

import {maskText} from './mask-ui.js';
import {MORNING_STAGES,MORNING_DOCS,SOURCE_MODEL,CLAIM_MODEL,PRIVACY_MODEL,PRESERVE_ORDER,MORNING_ORDER,morningReady} from './morning-state.js';
import {MORNING_COPY} from './morning-copy.js';
import {getLanguage,t} from './i18n.js';
export function morningText(key,values={}){const entry=MORNING_COPY[key];if(!entry)throw Error('Missing morning text: '+key);return entry[{de:0,en:1,'ar-EG':2}[getLanguage()]??0].replace(/\{(\w+)\}/g,(_,name)=>String(values[name]??''));}
export function morningMeta(stage){const i=MORNING_STAGES.indexOf(stage);return [String(i+1).padStart(2,'0'),morningText(stage.slice(8)),['Dina','Tamatem','Dina','Tamatem','Dina','Tamatem','Tamatem','Tamatem','Dina','Dina','Dina','Tamatem'][i]];}
export function morningDocument(id){return Object.values(MORNING_DOCS).flat().includes(id)?{title:morningText(id+'Title'),text:morningText(id+'Text')}:null;}
export function morningHint(stage,level){return morningText('h'+MORNING_STAGES.indexOf(stage)+['a','b','c'][Math.max(1,Math.min(3,level))-1]);}
export function morningArticle(c){return morningText('article',{subject:morningText(c.naming==='name'?'subjectName':'subjectAnonymous')});}
export function morningView(s,h){
 const {button,actor,scene,esc,feedback}=h,c=s.morning,C=morningText,phase=s.stage.slice(8),ready=morningReady(c,phase);
 const p=key=>`<p>${esc(C(key))}</p>`;
 const b=(action,key,enabled=true)=>button('morning-'+action,esc(C(key)),'button wide',enabled?'':'disabled');
 const docs=(MORNING_DOCS[phase]||[]).map(id=>button('morning-read',`<span>${esc(morningDocument(id).title)}<small>${t(c.read.includes(id)?'Gelesen':'Untersuchen')}</small></span>`,'conversation',`data-id="${id}"`)).join('');
 const options=(id,title,items,value,locked=false)=>`<fieldset class="morning-options" ${locked?'disabled':''}><legend>${esc(C(title))}</legend>${items.map(([val,label])=>`<label class="case-radio"><input type="radio" name="morning-${id}" data-action="morning-pick" data-id="${id}" value="${val}" ${val===value?'checked':''}><span>${esc(C(label))}</span></label>`).join('')}</fieldset>`;
 const order=ids=>`<div class="case-order">${ids.map((_,index)=>`<label><strong><bdi>${esc(C('position',{number:index+1}))}</bdi></strong><select data-action="morning-order" data-index="${index}" ${ready?'disabled':''}><option value="">${C('choose')}</option>${ids.map(id=>`<option value="${id}" ${c[phase][index]===id?'selected':''}>${C(id)}</option>`).join('')}</select></label>`).join('')}</div>`;
 let story=p(phase==='complete'?'ending':phase+'Text'),panel=`<div class="conversation-list">${docs}</div>`;
 switch(phase){
 case 'pressure':panel+=options('pressure','reaction',[['open','open'],['direct','direct']],c.pressure,c.dissented)+b('dissent','dissent',!!c.pressure&&!c.dissented);if(c.dissented)story+=p(c.pressure+'Result');break;
 case 'method':panel+=options('method','methodQuestion',[['original','original'],['reposts','reposts']],c.method,ready);break;
 case 'sources':panel+=Object.keys(SOURCE_MODEL).map(id=>options(id,id+'Title',[['independent','independent'],['derived','derived']],c.sources[id],ready)).join('');break;
 case 'preserve':panel+=order(PRESERVE_ORDER);break;
 case 'clock':panel+=options('time','timeQuestion',[['1720','t1720'],['1810','t1810'],['1900','t1900']],c.time,ready)+options('scope','scopeQuestion',[['interval','interval'],['always','always']],c.scope,ready);break;
 case 'timeline':panel+=order(MORNING_ORDER);break;
 case 'model':panel+=Object.keys(CLAIM_MODEL).map(id=>options(id,id,Object.keys(CLAIM_MODEL).map(k=>[CLAIM_MODEL[k],CLAIM_MODEL[k]]),c.model[id],ready)).join('');break;
 case 'privacy':panel+=Object.keys(PRIVACY_MODEL).map(id=>options(id,id,[['publish','publishChoice'],['mask','mask'],['omit','omit']],c.privacy[id],ready)).join('')+options('naming','namingQuestion',[['name','name'],['anonymous','anonymous']],c.naming,ready);break;
 case 'publish':story+=`<article class="case-article">${esc(morningArticle(c))}</article>`;panel+=b('revise','revise',!c.revised)+(c.revised?p('revised'):'')+b('group','group',c.revised&&!c.groupCorrected)+(c.groupCorrected?p('groupDone'):'')+b('publish','release',c.groupCorrected&&!c.published);break;
 case 'complete':story+=p('finalTalk');panel+=button('mask-start',esc(maskText('start')),'button wide')+p('endNote')+button('notebook',C('notes'),'button wide')+button('export',t('Spielstand als Datei sichern'),'button secondary wide');break;
 }
 if(['method','sources','preserve','clock','timeline','model','privacy'].includes(phase))panel+=b('check','check',!ready)+(ready?`<p class="success-line" role="status">${esc(C('good'))}</p>`:'');
 if(phase!=='complete')panel+=b('next','next',ready);
 const m=morningMeta(s.stage);
 return `<div class="chapter-heading"><div><p class="eyebrow">${C('age')}</p><h1>${m[1]}</h1></div><span class="chapter-progress">${m[0]}<span> / 12</span></span></div><div class="game-grid morning-game"><section class="stage-column">${actor()}${scene('morning-investigation',C('alt'))}<div class="scene-tools">${button('hint',t('Hinweis'),'tool-button')}</div><div class="case-story">${story}</div></section><aside class="paper-panel"><p class="chapter-label">${C('title')}</p>${panel}${feedback?`<p class="feedback" role="status">${esc(feedback)}</p>`:''}</aside></div>`;
}
export function morningNotebook(s,esc){
 if(!MORNING_STAGES.includes(s.stage)&&!s.morning.published)return '';
 const c=s.morning,C=morningText,entry=(title,text)=>`<article><h3>${esc(title)}</h3><p>${esc(text)}</p></article>`;
 let out=`<h2>${C('notes')}</h2>`;
 for(const id of c.read){const d=morningDocument(id);out+=entry(d.title,d.text);}
 if(c.dissented)out+=entry(C('pressure'),C(c.pressure+'Result'));
 for(const [flag,key] of [['methodChecked','original'],['sourcesChecked','sourceResult'],['preserved','preserveResult'],['clockChecked','clockResult'],['timelineChecked','timelineResult'],['modelChecked','modelResult'],['privacyChecked','privacyResult'],['revised','revised'],['groupCorrected','groupDone']])if(c[flag])out+=entry(C('good'),C(key));
 if(c.privacyChecked)out+=entry(C('namingQuestion'),C(c.naming));
 if(c.published)out+=entry(C('publish'),morningArticle(c));
 return out;
}

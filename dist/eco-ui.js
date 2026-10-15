import {morningText} from './morning-ui.js';
import {ECO_STAGES,SAMPLE_IDS,INTERVIEW_IDS,ECO_MODEL,STOP_ORDER} from './eco-state.js';
import {ECO_COPY} from './eco-copy.js';
import {getLanguage,t} from './i18n.js';
export function ecoText(key,values={}){const entry=ECO_COPY[key];if(!entry)throw Error('Missing river text: '+key);return entry[{de:0,en:1,'ar-EG':2}[getLanguage()]??0].replace(/\{(\w+)\}/g,(_,name)=>String(values[name]??''));}
export function ecoMeta(stage){const i=ECO_STAGES.indexOf(stage);return [String(i+1).padStart(2,'0'),ecoText(stage.slice(4)),['Dina','Tamatem','Tamatem','Tamatem','Dina','Tamatem','Tamatem','Dina','Dina','Tamatem','Dina','Tamatem'][i]];}
export function ecoDocument(id){
 if(SAMPLE_IDS.includes(id))return {title:ecoText(id),text:ecoText('sampleDetail')};
 if(['brief','dyer','gate','valve','depot','salma','water','roots'].includes(id))return {title:ecoText(id+'Title'),text:ecoText(id+'Text')};
 return null;
}
export function ecoHint(stage,level){return ecoText('h'+ECO_STAGES.indexOf(stage)+['a','b','c'][Math.max(1,Math.min(3,level))-1]);}
export function ecoView(s,h){
 const {button,actor,scene,esc,feedback}=h,c=s.eco,C=ecoText;
 const p=key=>`<p>${esc(C(key))}</p>`;
 const b=(action,key,enabled=true)=>button('eco-'+action,esc(C(key)),'button wide',enabled?'':'disabled');
 const success=key=>`<p class="success-line" role="status">${esc(C(key))}</p>`;
 const doc=id=>{const read=id==='brief'?c.briefed:[...c.samples,...c.interviews,...c.responses,...c.checks].includes(id);return button('eco-read',`<span>${esc(ecoDocument(id).title)}<small>${t(read?'Gelesen':'Untersuchen')}</small></span>`,'conversation',`data-id="${id}"`);};
 const documents=ids=>`<div class="conversation-list">${ids.map(doc).join('')}</div>`;
 const options=(id,key,items,value,locked=false)=>`<fieldset class="eco-options" ${locked?'disabled':''}><legend>${esc(C(key))}</legend>${items.map(([val,label])=>`<label class="case-radio"><input type="radio" name="eco-${id}" data-action="eco-pick" data-id="${id}" value="${val}" ${val===value?'checked':''}><span>${esc(C(label))}</span></label>`).join('')}</fieldset>`;
 let story='',panel='';
 switch(s.stage){
 case 'eco-opening':story=p('openingText');panel=documents(['brief'])+b('begin','begin',c.briefed);break;
 case 'eco-spark':story=p('sparkText');panel=b('sample','firstSample')+(c.sampleSeen?p('singleText'):'')+b('accuse','accuse',c.sampleSeen);break;
 case 'eco-keeper':story=p('accusation')+p('keeperText');panel=options('reflection','keeper',[['error','error'],['doubt','doubt']],c.reflection)+(c.reflection?p(c.reflection==='error'?'reflectionError':'reflectionDoubt'):'')+b('compare-start','compareStart',!!c.reflection);break;
 case 'eco-samples':
  story=p('samplesText')+`<figure class="eco-map"><figcaption>${esc(C('map'))}</figcaption><div class="eco-flow" dir="ltr">${['A','B','C'].map((site,i)=>`<div data-site="${site}"><strong>${site}</strong><bdi>${esc(C('site'+site))}</bdi></div>${i<2?'<span aria-hidden="true">→</span>':''}`).join('')}</div></figure>`;
  panel=documents(SAMPLE_IDS)+options('rise','rise',[['a','siteA'],['b','siteB'],['c','siteC']],c.rise,c.compared)+options('window','window',[['morning','morning'],['all','all']],c.window,c.compared)+b('compare','compare');
  if(c.compared)panel+=success('samplesGood')+b('interviews','toInterviews');break;
 case 'eco-interviews':story=p('interviewsText');panel=documents(INTERVIEW_IDS)+options('contradiction','contradiction',INTERVIEW_IDS.map(id=>[id,id+'Title']),c.contradiction,c.interviewChecked)+b('check-interview','checkInterview');if(c.interviewChecked)panel+=success('interviewGood')+b('meet','meet');break;
 case 'eco-model':story=p('modelText');panel=Object.keys(ECO_MODEL).map(id=>options(id,id,[['depot','depot'],['source','sourceCause'],['unproven','unproven']],c.model[id],c.linked)).join('')+b('link','link');if(c.linked)panel+=success('modelGood')+b('correction','toCorrection');break;
 case 'eco-correction':story=p('correctionText');panel=options('replacement','replacement',[['evidence','evidence'],['harmless','harmless'],['intent','intent']],c.replacement,c.reposted)+b('repost','repost');if(c.reposted)panel+=success('reposted')+b('apologize','apologize',!c.apologized);if(c.apologized){story+=p('apologyText');panel+=b('response','toResponse');}break;
 case 'eco-response':story=p('responseText');panel=documents(['depot','salma'])+options('approach','approach',[['warning','warning'],['visit','visit']],c.approach)+(c.approach?p(c.approach+'Text'):'')+b('stop-start','toStop',c.responses.length===2&&!!c.approach);break;
 case 'eco-stop':
  story=p('stopText');panel=`<div class="case-order">${['first','second','third'].map((key,index)=>`<label><strong>${C(key)}</strong><select data-action="eco-order" data-index="${index}" ${c.stopped?'disabled':''}><option value="">${C('choose')}</option>${STOP_ORDER.map(id=>`<option value="${id}" ${c.order[index]===id?'selected':''}>${C(id)}</option>`).join('')}</select></label>`).join('')}</div>`+b('stop','stopAction');if(c.stopped)panel+=success('stopped')+b('source','toSource');break;
 case 'eco-source':
  story=p('sourceText');panel=b('inspect','inspect')+(c.inspected?p('inspected'):'')+b('clear','clear',c.inspected&&!c.cleared)+(c.cleared?p('cleared'):'')+options('inlet','inlet',[['clean','clean'],['depot','depot']],c.inlet,c.restored)+b('restore','restore');if(c.restored)panel+=success('restored')+b('verify','toVerify');break;
 case 'eco-verify':story=p('verifyText');panel=documents(['water','roots'])+b('publish','publish',c.checks.length===2&&!c.published);if(c.published){story+=`<article class="case-article">${p('article')}</article>`;panel+=b('finish','finish');}break;
 case 'eco-complete':story=p('ending')+p('finalTalk');panel=button('morning-start',esc(morningText('start')),'button wide')+p('endNote')+button('notebook',C('notes'),'button wide')+button('export',t('Spielstand als Datei sichern'),'button secondary wide');break;
 }
 const m=ecoMeta(s.stage),depot=['eco-interviews','eco-response','eco-stop','eco-verify'].includes(s.stage);
 return `<div class="chapter-heading"><div><p class="eyebrow">${C('age')}</p><h1>${m[1]}</h1></div><span class="chapter-progress">${m[0]}<span> / 12</span></span></div><div class="game-grid eco-game"><section class="stage-column">${actor()}${scene(depot?'eco-depot':'eco-river',C(depot?'depotAlt':'riverAlt'))}<div class="scene-tools">${button('hint',t('Hinweis'),'tool-button')}</div><div class="case-story">${story}</div></section><aside class="paper-panel"><p class="chapter-label">${C('title')}</p>${panel}${feedback?`<p class="feedback" role="status">${esc(feedback)}</p>`:''}</aside></div>`;
}
export function ecoNotebook(s,esc){
 if(!ECO_STAGES.includes(s.stage)&&!s.eco.published)return '';
 const c=s.eco,C=ecoText,entry=(title,body)=>`<article><h3>${esc(title)}</h3><p>${esc(body)}</p></article>`;
 let out=`<h2>${C('notes')}</h2>`;
 if(c.briefed)out+=entry(C('briefTitle'),C('briefText'));
 if(c.accused)out+=entry(C('hypothesis'),C('accusation'));
 if(c.reflection)out+=entry(C(c.reflection),C(c.reflection==='error'?'reflectionError':'reflectionDoubt'));
 for(const id of [...c.samples,...c.interviews,...c.responses,...c.checks]){const d=ecoDocument(id);out+=entry(C('observation')+' · '+d.title,d.text);}
 for(const [flag,key] of [['compared','samplesGood'],['interviewChecked','interviewGood'],['linked','modelGood'],['reposted','reposted'],['apologized','apologyText'],['stopped','stopped'],['restored','restored'],['published','article']])if(c[flag])out+=entry(C('confirmed'),C(key));
 if(c.approach)out+=entry(C(c.approach),C(c.approach+'Text'));
 return out;
}

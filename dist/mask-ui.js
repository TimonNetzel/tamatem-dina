import {MASK_STAGES,MASK_DOCS,MASK_ORDER,MASK_CLAIMS,maskReady} from './mask-state.js';
import {MASK_COPY} from './mask-copy.js';
import {getLanguage,t} from './i18n.js';
export function maskText(key,values={}){const entry=MASK_COPY[key];if(!entry)throw Error('Missing mask text: '+key);return entry[{de:0,en:1,'ar-EG':2}[getLanguage()]??0].replace(/\{(\w+)\}/g,(_,name)=>String(values[name]??''));}
export function maskMeta(stage){const i=MASK_STAGES.indexOf(stage);return [String(i+1).padStart(2,'0'),maskText(stage.slice(5)),['Tamatem','Tamatem','Dina','Tamatem','Dina','Tamatem','Dina','Tamatem','Dina','Tamatem','Dina','Tamatem'][i]];}
export function maskDocument(id){return Object.values(MASK_DOCS).flat().includes(id)?{title:maskText(id+'Title'),text:maskText(id+'Text')}:null;}
export function maskHint(stage,level){return maskText('h'+MASK_STAGES.indexOf(stage)+['a','b','c'][Math.max(1,Math.min(3,level))-1]);}
export function maskCorrection(c){return maskText('correctionBody',{subject:maskText(c.naming==='name'?'subjectName':'subjectRole')});}
export function maskArticle(c){return maskText('article',{subject:maskText(c.naming==='name'?'subjectName':'subjectRole')});}
// Fixed schematics: language changes labels, never the geometry. Text is equivalent evidence.
export function maskDiagram(kind,value,esc){
 const C=maskText,described=kind==='frame'?(value==='full'?'fullPreview':'narrowPreview'):kind==='angle'?(value==='side'?'sidePreview':'frontPreview'):(value==='lift'?'bridgeOpen':'bridgeClosed');
 if(!value)return `<p class="mask-preview">${esc(C('pending'))}</p>`;
 let svg;
 if(kind==='frame')svg=`<svg viewBox="${value==='tight'?'110 0 120 110':'0 0 340 110'}" aria-hidden="true"><defs><clipPath id="mask-frame-clip"><rect x="${value==='tight'?110:0}" y="0" width="${value==='tight'?120:340}" height="110"/></clipPath></defs><g clip-path="url(#mask-frame-clip)"><path d="M15 85V25H80V85M25 40h45M30 60l10-12 10 12 10-12 10 12"/><path class="mask-hand" d="M130 75l15-30 18-8 14 9 10 12-15 22Z"/><path class="mask-print" d="M170 45l30 5-6 30-29-5Z"/><path d="M260 90V20h60v70M270 20v28h16V20M298 20v35h14V20"/></g></svg>`;
 else if(kind==='angle')svg=`<svg viewBox="0 0 340 110" aria-hidden="true"><path d="M40 90V25h100v65M50 40h80M55 60l15-15 15 15 15-15 15 15"/><path class="mask-hand" d="${value==='side'?'M215 75l15-30 18-8 14 9 10 12-15 22Z':'M65 75l15-30 18-8 14 9 10 12-15 22Z'}"/><path d="${value==='side'?'M150 72h60m-8-6 8 6-8 6 M280 90h12V75h12V60h12V45':'M260 85h65l-32-35Z'}"/></svg>`;
 else svg=`<svg viewBox="0 0 340 80" aria-hidden="true"><path d="${value==='lift'?'M10 45h320M25 45v25m290-25v25M40 35h260':'M10 30l145 15 15 30 15-30 145-15M25 30v40m290-40v40'}"/></svg>`;
 const labels=kind==='frame'?`<div class="mask-map-labels" dir="ltr">${(value==='full'?['press','hand','rack']:['hand']).map(key=>`<bdi>${esc(C(key))}</bdi>`).join('')}</div>`:'';
 return `<figure class="mask-evidence" data-preview="${kind}-${value}"><figcaption>${esc(C('diagram'))}</figcaption>${svg}${labels}<p role="status">${esc(C(described))}</p></figure>`;
}
export function maskView(s,h){
 const {button,actor,scene,esc,feedback}=h,c=s.mask,C=maskText,p=s.stage.slice(5),ready=maskReady(c,p),m=maskMeta(s.stage);
 const para=key=>`<p>${esc(C(key))}</p>`,b=(action,key,enabled=true)=>button('mask-'+action,esc(C(key)),'button wide',enabled?'':'disabled');
 const opts=(id,title,values,value,locked=false)=>`<fieldset class="mask-options" ${locked?'disabled':''}><legend>${esc(C(title))}</legend>${values.map(([v,k])=>`<label class="case-radio"><input type="radio" name="mask-${id}" data-action="mask-pick" data-id="${id}" value="${v}" ${v===value?'checked':''}><span>${esc(C(k))}</span></label>`).join('')}</fieldset>`;
 const frames=[['tight','tight'],['full','full']],angles=[['front','front'],['side','side']],captions=[['destroy','destroy'],['lift','lift'],['always','always']];
 let story=para(p==='complete'?'ending':p+'Text');
 let panel=`<div class="conversation-list">${(MASK_DOCS[p]||[]).map(id=>button('mask-read',`<span>${esc(maskDocument(id).title)}<small>${t(c.read.includes(id)?'Gelesen':'Untersuchen')}</small></span>`,'conversation',`data-id="${id}"`)).join('')}</div>`;
 switch(p){
 case 'doubt':panel+=opts('approach','reaction',[['public','public'],['quiet','quiet']],c.approach,c.questioned)+b('question','question',!!c.approach&&!c.questioned);if(c.questioned)story+=para(c.approach+'Result');break;
 case 'archive':panel+=opts('provenance','sourceQuestion',[['original','original'],['repost','repost']],c.provenance,ready)+opts('naming','namingQuestion',[['name','name'],['role','role']],c.naming,ready);break;
 case 'crop':panel+=opts('crop','frame',frames,c.crop,ready);story+=maskDiagram('frame',c.crop,esc);break;
 case 'perspective':panel+=opts('view','angle',angles,c.view,ready)+opts('observation','observation',[['contact','contact'],['gap','gap'],['motive','motive']],c.observation,ready);story+=maskDiagram('angle',c.view,esc);break;
 case 'caption':panel+=opts('caption','captionQuestion',captions,c.caption,ready);story+=maskDiagram('caption',c.caption,esc);break;
 case 'network':panel+=`<div class="case-order">${MASK_ORDER.map((_,i)=>`<label><strong><bdi>${C('position',{number:i+1})}</bdi></strong><select data-action="mask-order" data-index="${i}" ${ready?'disabled':''}><option value="">${C('choose')}</option>${MASK_ORDER.map(id=>`<option value="${id}" ${c.network[i]===id?'selected':''}>${C(id)}</option>`).join('')}</select></label>`).join('')}</div>`;break;
 case 'correction':{
  const locked=c.proofChecked;
  panel+=opts('frame','frame',frames,c.proof.frame,locked)+opts('angle','angle',angles,c.proof.angle,locked)+opts('caption','captionQuestion',captions,c.proof.caption,locked);
  for(const key of ['frame','angle','caption'])story+=maskDiagram(key,c.proof[key],esc);
  story+=`<article class="case-article mask-correction"><h2>${C('oldLabel')}</h2><p class="mask-old">${c.reposted?`<del>${esc(C('oldPost'))}</del>`:esc(C('oldPost'))}</p>${c.admitted?`<h2>${C('newLabel')}</h2><p>${esc(maskCorrection(c))}</p>${para(c.reposted?'delivered':'admitted')}`:''}</article>`;
  panel+=b('check','check',!locked)+(locked?para('good'):'')+b('admit','admit',locked&&!c.admitted)+b('repost','repostAction',c.admitted&&!c.reposted);break;
 }
 case 'mirror':panel+=opts('credit','creditQuestion',[['alone','alone'],['shared','shared']],c.credit,ready);if(ready)story+=para('mirrorResult');break;
 case 'return':panel+=opts('crowd','crowdQuestion',[['talk','talk'],['boundary','boundary']],c.crowd,ready)+opts('kit','kitQuestion',[['crown','crown'],['evidence','evidence']],c.kit,ready);if(ready)story+=para(c.crowd+'Result');break;
 case 'publish':panel+=Object.keys(MASK_CLAIMS).map(id=>opts(id,id,[['observed','observed'],['documented','documented'],['open','open']],c.claims[id],c.publishChecked)).join('')+b('check','check',!c.publishChecked)+(c.publishChecked?para('good'):'')+b('approve','approve',c.publishChecked&&!c.approved)+(c.approved?para('approved'):'')+b('publish','release',c.approved&&!c.published)+(c.published?para('published'):'');story+=`<article class="case-article">${esc(maskArticle(c))}</article>`;break;
 case 'complete':story+=para('finalTalk')+`<article class="case-article"><h2>${C('newLabel')}</h2><p>${esc(maskCorrection(c))}</p><p>${esc(maskArticle(c))}</p></article>`;panel+=para('endNote')+button('notebook',C('notes'),'button wide')+button('export',t('Spielstand als Datei sichern'),'button secondary wide');break;
 }
 if(['archive','crop','perspective','caption','network','mirror','return'].includes(p))panel+=b('check','check',!ready)+(ready?`<p class="success-line" role="status">${esc(C('good'))}</p>`:'');
 if(p!=='complete')panel+=b('next','next',ready);
 return `<div class="chapter-heading"><div><p class="eyebrow">${C('age')}</p><h1>${m[1]}</h1></div><span class="chapter-progress"><bdi>${m[0]} / 12</bdi></span></div><div class="game-grid mask-game"><section class="stage-column">${actor()}${scene('mask-city',C('alt'))}<div class="scene-tools">${button('hint',t('Hinweis'),'tool-button')}</div><div class="case-story">${story}</div></section><aside class="paper-panel"><p class="chapter-label">${C('title')}</p>${panel}${feedback?`<p class="feedback" role="status">${esc(feedback)}</p>`:''}</aside></div>`;
}
export function maskNotebook(s,esc){
 if(!MASK_STAGES.includes(s.stage))return '';
 const c=s.mask,C=maskText,entry=(title,text)=>`<article><h3>${esc(title)}</h3><p>${esc(text)}</p></article>`;
 let out=`<h2>${C('notes')}</h2>`;
 for(const id of c.read){const d=maskDocument(id);out+=entry(d.title,d.text);}
 if(c.questioned)out+=entry(C('doubt'),C(c.approach+'Result'));
 for(const [flag,key] of [['archiveChecked','archiveResult'],['cropChecked','cropResult'],['perspectiveChecked','perspectiveResult'],['captionChecked','captionResult'],['networkChecked','networkResult'],['mirrorChecked','mirrorResult']])if(c[flag])out+=entry(C('good'),C(key));
 if(c.archiveChecked)out+=entry(C('namingQuestion'),C(c.naming));
 if(c.admitted)out+=entry(C('newLabel'),maskCorrection(c));if(c.reposted)out+=entry(C('correction'),C('delivered'));
 if(c.returnChecked)out+=entry(C('return'),C(c.crowd+'Result'));
 if(c.published)out+=entry(C('publish'),maskArticle(c));
 return out;
}

// Episode 2 has its own state; all Level 1 history stays in the enclosing save.
export const CASE_STAGES=['case-opening','case-records','case-interviews','case-timeline','case-response','case-editor','case-print','case-complete'];
export const RECORD_IDS=['letter','address','sale','missing'];
export const TIMELINE=['sale','rent','complaint'];
export const CLAIMS={abduction:'false',complaints:'verified',motive:'open'};
// Courtyard sequence inside case-interviews. clues = what Dina knows, pocket = what only Tamatem has noted so far.
export const YARD_LOOKS=['notice','advert','marks','edge','pin','door','bins','flowers','bench'];
export const YARD_CLUES=['notice','advert','door','scrap','print','photo','statement'];
export const YARD_POCKET=['notice','advert','scrap','print'];
export const YARD_ASKS=['gentle','contradiction'];
export const YARD_GOALS=['explore','evidence','pass','proof','word','wrap'];
const YARD_SEEN=['d','t'].flatMap(a=>YARD_LOOKS.map(id=>a+':'+id));
const YARD_DATED=['print','photo'],YARD_BEFORE=['scrap','statement','photo'];
export function initialYard(){return {actor:'dina',seen:[],clues:[],pocket:[],asked:[],proof:[null,null,null],proven:false,worded:false,legacy:false,help:{}};}
// Saves from before the courtyard rebuild: sequences already passed stay passed and are marked as not played.
export function migrateYard(stage){return {...initialYard(),legacy:CASE_STAGES.indexOf(stage)>=3};}
export const yardKnown=c=>['letter',...c.yard.clues,...(c.emil?['emil']:[])];
export const yardSufficient=items=>items.includes('notice')&&YARD_DATED.some(a=>items.includes(a)&&YARD_BEFORE.some(b=>b!==a&&items.includes(b)));
export const yardProofCorrect=c=>{const [claim,dated,before]=c.yard.proof;return claim==='notice'&&YARD_DATED.includes(dated)&&YARD_BEFORE.includes(before)&&dated!==before;};
// Explains a failed check without naming the solution. Returns a copy key.
export function yardProofProblem(c){
 const [claim,dated,before]=c.yard.proof,rest=[dated,before];
 if(!claim||!dated||!before)return 'pEmpty';
 if(c.yard.proof.includes('emil'))return 'pEmil';
 if(claim!=='notice')return 'pClaim';
 for(const [id,key] of [['letter','pLetter'],['door','pDoor'],['advert','pAdvert'],['notice','pNotice']])if(rest.includes(id))return key;
 if(!YARD_DATED.includes(dated))return 'pDate';
 if(!YARD_BEFORE.includes(before))return 'pBefore';
 return null;
}
export function yardGoal(c){
 const y=c.yard,all=[...y.clues,...y.pocket];
 if(y.worded||y.legacy)return 'wrap';
 if(y.proven)return 'word';
 if(yardSufficient(y.clues))return 'proof';
 if(yardSufficient(all))return 'pass';
 return all.includes('notice')?'evidence':'explore';
}
export const yardOpen=c=>[!c.yard.proven&&'openFinding',c.yard.proven&&!c.yard.worded&&'openWord',!c.nora&&'openNora',!c.withdrawal&&'openEmil'].filter(Boolean);
export function initialCase(){return {read:[],selected:[],addressChecked:false,consent:null,nora:false,emil:false,withdrawal:null,order:[null,null,null],linked:false,responses:[],claims:{abduction:null,complaints:null,motive:null},checked:false,corrected:false,published:false,yard:initialYard()};}
export const addressCorrect=c=>c.selected.length===3&&['letter','address','sale'].every(id=>c.selected.includes(id));
export const timelineCorrect=c=>TIMELINE.every((id,i)=>c.order[i]===id);
export const claimsCorrect=c=>Object.entries(CLAIMS).every(([id,value])=>c.claims[id]===value);
export function reduceCase(s,a){
 const n=structuredClone(s),c=n.case,old=s.case,y=c.yard,oy=old.yard,yard=s.stage==='case-interviews'&&!oy.legacy,dina=oy.actor==='dina';
 switch(a.type){
 case 'CASE_START':if(s.stage==='level-complete')n.stage='case-opening';break;
 case 'CASE_BEGIN':if(s.stage==='case-opening')n.stage='case-records';break;
 case 'CASE_READ':if(s.stage==='case-records'&&RECORD_IDS.includes(a.id)&&!old.read.includes(a.id))c.read.push(a.id);break;
 case 'CASE_SELECT':if(s.stage==='case-records'&&!old.addressChecked&&old.read.includes(a.id)){c.selected=old.selected.includes(a.id)?old.selected.filter(id=>id!==a.id):[...old.selected,a.id];}break;
 case 'CASE_ADDRESS':if(s.stage==='case-records'&&addressCorrect(old))c.addressChecked=true;break;
 case 'CASE_INTERVIEWS':if(s.stage==='case-records'&&old.addressChecked)n.stage='case-interviews';break;
 case 'CASE_CONSENT':if(s.stage==='case-interviews'&&dina&&!old.nora&&['name','anonymous'].includes(a.id))c.consent=a.id;break;
 case 'CASE_NORA':if(s.stage==='case-interviews'&&dina&&old.consent)c.nora=true;break;
 case 'CASE_EMIL':if(s.stage==='case-interviews'&&dina)c.emil=true;break;
 case 'CASE_WITHDRAW':if(s.stage==='case-interviews'&&dina&&old.emil&&!old.withdrawal&&['omit','document'].includes(a.id))c.withdrawal=a.id;break;
 case 'CASE_MEET':if(s.stage==='case-interviews'&&old.nora&&old.withdrawal&&(oy.worded||oy.legacy))n.stage='case-timeline';break;
 case 'YARD_SWITCH':if(yard)y.actor=dina?'tamatem':'dina';break;
 case 'YARD_LOOK':if(yard&&YARD_LOOKS.includes(a.id)){
   const key=oy.actor[0]+':'+a.id;if(!oy.seen.includes(key))y.seen.push(key);
   const found=dina?({notice:'notice',advert:'advert',door:'door',pin:oy.asked.includes('contradiction')?'scrap':null})[a.id]:({notice:'notice',advert:'advert',edge:'print',pin:'scrap'})[a.id];
   if(found&&!oy.clues.includes(found)&&(dina||!oy.pocket.includes(found)))(dina?y.clues:y.pocket).push(found);
   if(found&&dina)y.pocket=oy.pocket.filter(id=>id!==found);
  }break;
 case 'YARD_ASK':if(yard&&dina&&old.nora&&YARD_ASKS.includes(a.id)&&!oy.asked.includes(a.id)&&(a.id==='gentle'||oy.clues.includes('notice'))){
   y.asked.push(a.id);for(const id of a.id==='gentle'?['statement','photo']:['statement'])if(!y.clues.includes(id))y.clues.push(id);
  }break;
 case 'YARD_PASS':if(yard&&!dina&&oy.pocket.length){y.clues=[...oy.clues,...oy.pocket.filter(id=>!oy.clues.includes(id))];y.pocket=[];}break;
 case 'YARD_PROOF':if(yard&&dina&&!oy.proven&&Number.isInteger(a.index)&&a.index>=0&&a.index<3&&(a.id===null||yardKnown(old).includes(a.id))){for(let i=0;i<3;i++)if(a.id&&y.proof[i]===a.id)y.proof[i]=null;y.proof[a.index]=a.id;}break;
 case 'YARD_CHECK':if(yard&&dina&&!oy.proven&&yardProofCorrect(old))y.proven=true;break;
 case 'YARD_WORD':if(yard&&!dina&&oy.proven&&!oy.worded&&a.id==='precise')y.worded=true;break;
 case 'CASE_ORDER':if(s.stage==='case-timeline'&&!old.linked&&Number.isInteger(a.index)&&a.index>=0&&a.index<3&&TIMELINE.includes(a.id)){for(let i=0;i<3;i++)if(c.order[i]===a.id)c.order[i]=null;c.order[a.index]=a.id;}break;
 case 'CASE_LINK':if(s.stage==='case-timeline'&&timelineCorrect(old))c.linked=true;break;
 case 'CASE_RESPONSE_START':if(s.stage==='case-timeline'&&old.linked)n.stage='case-response';break;
 case 'CASE_RESPONSE':if(s.stage==='case-response'&&['owner','office'].includes(a.id)&&!old.responses.includes(a.id))c.responses.push(a.id);break;
 case 'CASE_EDITOR':if(s.stage==='case-response'&&old.responses.length===2)n.stage='case-editor';break;
 case 'CASE_CLAIM':if(s.stage==='case-editor'&&!old.checked&&Object.hasOwn(CLAIMS,a.id)&&['false','verified','open'].includes(a.value))c.claims[a.id]=a.value;break;
 case 'CASE_CHECK':if(s.stage==='case-editor'&&claimsCorrect(old))c.checked=true;break;
 case 'CASE_CORRECT':if(s.stage==='case-editor'&&old.checked)c.corrected=true;break;
 case 'CASE_PRINT':if(s.stage==='case-editor'&&old.checked&&old.corrected){c.published=true;n.stage='case-print';}break;
 case 'CASE_FINISH':if(s.stage==='case-print')n.stage='case-complete';break;
 case 'HINT':if(CASE_STAGES.includes(s.stage)){n.hints[s.stage]=Math.min(3,(s.hints[s.stage]||0)+1);if(s.stage==='case-interviews'){const goal=yardGoal(old);y.help[goal]=Math.min(3,(oy.help[goal]||0)+1);}}break;
 }
 return n;
}
export function validateCase(input,stage){
 const c=initialCase(),bad=()=>{throw Error('Der Fallzustand überspringt eine notwendige Handlung.');};
 if(!input||typeof input!=='object')bad();
 for(const [key,allowed] of [['read',RECORD_IDS],['selected',RECORD_IDS],['responses',['owner','office']]]){
  const v=input[key];if(!Array.isArray(v)||v.some(id=>!allowed.includes(id))||new Set(v).size!==v.length)bad();c[key]=[...v];
 }
 for(const key of ['addressChecked','nora','emil','linked','checked','corrected','published']){if(typeof input[key]!=='boolean')bad();c[key]=input[key];}
 for(const [key,values] of [['consent',[null,'name','anonymous']],['withdrawal',[null,'omit','document']]]){if(!values.includes(input[key]))bad();c[key]=input[key];}
 if(!Array.isArray(input.order)||input.order.length!==3||input.order.some(id=>id!==null&&!TIMELINE.includes(id))||new Set(input.order.filter(Boolean)).size!==input.order.filter(Boolean).length)bad();c.order=[...input.order];
 if(!input.claims||typeof input.claims!=='object')bad();
 for(const id of Object.keys(CLAIMS)){if(![null,'verified','open','false'].includes(input.claims[id]))bad();c.claims[id]=input.claims[id];}
 const index=CASE_STAGES.indexOf(stage),yi=input.yard,y=c.yard;
 if(!yi||typeof yi!=='object'||!['dina','tamatem'].includes(yi.actor))bad();y.actor=yi.actor;
 for(const [key,allowed] of [['seen',YARD_SEEN],['clues',YARD_CLUES],['pocket',YARD_POCKET],['asked',YARD_ASKS]]){
  const v=yi[key];if(!Array.isArray(v)||v.some(id=>!allowed.includes(id))||new Set(v).size!==v.length)bad();y[key]=[...v];
 }
 for(const key of ['proven','worded','legacy']){if(typeof yi[key]!=='boolean')bad();y[key]=yi[key];}
 if(!Array.isArray(yi.proof)||yi.proof.length!==3||yi.proof.some(id=>id!==null&&!yardKnown(c).includes(id))||new Set(yi.proof.filter(Boolean)).size!==yi.proof.filter(Boolean).length)bad();y.proof=[...yi.proof];
 if(!yi.help||typeof yi.help!=='object')bad();
 for(const goal of YARD_GOALS){const v=yi.help[goal];if(v===undefined)continue;if(!Number.isInteger(v)||v<1||v>3)bad();y.help[goal]=v;}
 if(index<0){if(JSON.stringify(c)!==JSON.stringify(initialCase()))bad();return c;}
 if((index===0&&JSON.stringify(c)!==JSON.stringify(initialCase()))||(c.selected.some(id=>!c.read.includes(id)))||(c.addressChecked&&!addressCorrect(c))||(index>=2&&!c.addressChecked))bad();
 if((index<2&&(c.consent||c.nora||c.emil||c.withdrawal))||(c.nora&&!c.consent)||(c.withdrawal&&!c.emil)||(index>=3&&(!c.nora||!c.withdrawal)))bad();
 if((index<3&&c.order.some(Boolean))||(c.linked&&(!timelineCorrect(c)||index<3))||(index>=4&&!c.linked))bad();
 const touched=JSON.stringify({...y,legacy:false})!==JSON.stringify(initialYard()),saw=(...keys)=>keys.some(key=>y.seen.includes(key));
 if((index<2&&(touched||y.legacy))||(y.legacy&&(touched||index<3))||(index>=3&&!y.legacy&&!y.worded))bad();
 if((y.worded&&!y.proven)||(y.proven&&!yardProofCorrect(c))||(y.asked.length&&!c.nora)||(y.asked.includes('contradiction')&&!y.clues.includes('notice'))||y.pocket.some(id=>y.clues.includes(id)))bad();
 if(y.clues.includes('statement')!==(y.asked.length>0)||y.clues.includes('photo')!==y.asked.includes('gentle'))bad();
 if((y.clues.includes('notice')&&!saw('d:notice','t:notice'))||(y.clues.includes('advert')&&!saw('d:advert','t:advert'))||(y.clues.includes('door')&&!saw('d:door'))||(y.clues.includes('print')&&!saw('t:edge'))||(y.clues.includes('scrap')&&!saw('t:pin')&&!(saw('d:pin')&&y.asked.includes('contradiction'))))bad();
 if((y.pocket.includes('notice')&&!saw('t:notice'))||(y.pocket.includes('advert')&&!saw('t:advert'))||(y.pocket.includes('print')&&!saw('t:edge'))||(y.pocket.includes('scrap')&&!saw('t:pin')))bad();
 if((index<4&&c.responses.length)||(index>=5&&c.responses.length!==2)||(index<5&&Object.values(c.claims).some(Boolean))||(c.checked&&(!claimsCorrect(c)||index<5))||(c.corrected&&!c.checked)||(c.published&&(!c.corrected||index<6))||(index>=6&&!c.published))bad();
 return c;
}

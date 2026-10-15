// Episode 2 has its own state; all Level 1 history stays in the enclosing save.
export const CASE_STAGES=['case-opening','case-records','case-interviews','case-timeline','case-response','case-editor','case-print','case-complete'];
export const RECORD_IDS=['letter','address','sale','missing'];
export const TIMELINE=['sale','rent','complaint'];
export const CLAIMS={abduction:'false',complaints:'verified',motive:'open'};
export function initialCase(){return {read:[],selected:[],addressChecked:false,consent:null,nora:false,emil:false,withdrawal:null,order:[null,null,null],linked:false,responses:[],claims:{abduction:null,complaints:null,motive:null},checked:false,corrected:false,published:false};}
export const addressCorrect=c=>c.selected.length===3&&['letter','address','sale'].every(id=>c.selected.includes(id));
export const timelineCorrect=c=>TIMELINE.every((id,i)=>c.order[i]===id);
export const claimsCorrect=c=>Object.entries(CLAIMS).every(([id,value])=>c.claims[id]===value);
export function reduceCase(s,a){
 const n=structuredClone(s),c=n.case,old=s.case;
 switch(a.type){
 case 'CASE_START':if(s.stage==='level-complete')n.stage='case-opening';break;
 case 'CASE_BEGIN':if(s.stage==='case-opening')n.stage='case-records';break;
 case 'CASE_READ':if(s.stage==='case-records'&&RECORD_IDS.includes(a.id)&&!old.read.includes(a.id))c.read.push(a.id);break;
 case 'CASE_SELECT':if(s.stage==='case-records'&&!old.addressChecked&&old.read.includes(a.id)){c.selected=old.selected.includes(a.id)?old.selected.filter(id=>id!==a.id):[...old.selected,a.id];}break;
 case 'CASE_ADDRESS':if(s.stage==='case-records'&&addressCorrect(old))c.addressChecked=true;break;
 case 'CASE_INTERVIEWS':if(s.stage==='case-records'&&old.addressChecked)n.stage='case-interviews';break;
 case 'CASE_CONSENT':if(s.stage==='case-interviews'&&!old.nora&&['name','anonymous'].includes(a.id))c.consent=a.id;break;
 case 'CASE_NORA':if(s.stage==='case-interviews'&&old.consent)c.nora=true;break;
 case 'CASE_EMIL':if(s.stage==='case-interviews')c.emil=true;break;
 case 'CASE_WITHDRAW':if(s.stage==='case-interviews'&&old.emil&&!old.withdrawal&&['omit','document'].includes(a.id))c.withdrawal=a.id;break;
 case 'CASE_MEET':if(s.stage==='case-interviews'&&old.nora&&old.withdrawal)n.stage='case-timeline';break;
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
 case 'HINT':if(CASE_STAGES.includes(s.stage))n.hints[s.stage]=Math.min(3,(s.hints[s.stage]||0)+1);break;
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
 const index=CASE_STAGES.indexOf(stage);
 if(index<0){if(JSON.stringify(c)!==JSON.stringify(initialCase()))bad();return c;}
 if((index===0&&JSON.stringify(c)!==JSON.stringify(initialCase()))||(c.selected.some(id=>!c.read.includes(id)))||(c.addressChecked&&!addressCorrect(c))||(index>=2&&!c.addressChecked))bad();
 if((index<2&&(c.consent||c.nora||c.emil||c.withdrawal))||(c.nora&&!c.consent)||(c.withdrawal&&!c.emil)||(index>=3&&(!c.nora||!c.withdrawal)))bad();
 if((index<3&&c.order.some(Boolean))||(c.linked&&(!timelineCorrect(c)||index<3))||(index>=4&&!c.linked))bad();
 if((index<4&&c.responses.length)||(index>=5&&c.responses.length!==2)||(index<5&&Object.values(c.claims).some(Boolean))||(c.checked&&(!claimsCorrect(c)||index<5))||(c.corrected&&!c.checked)||(c.published&&(!c.corrected||index<6))||(index>=6&&!c.published))bad();
 return c;
}

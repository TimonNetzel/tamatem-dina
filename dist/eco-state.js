// Episode 3 never mutates the history of either previous episode.
export const ECO_STAGES=['eco-opening','eco-spark','eco-keeper','eco-samples','eco-interviews','eco-model','eco-correction','eco-response','eco-stop','eco-source','eco-verify','eco-complete'];
export const SAMPLE_IDS=['a6','b6','c6','a8','b8','c8'];
export const INTERVIEW_IDS=['dyer','gate','valve'];
export const ECO_MODEL={load:'depot',mist:'source',blue:'unproven'};
export const STOP_ORDER=['close','hold','test'];
export function initialEco(){return {briefed:false,sampleSeen:false,accused:false,reflection:null,samples:[],rise:null,window:null,compared:false,interviews:[],contradiction:null,interviewChecked:false,model:{load:null,mist:null,blue:null},linked:false,replacement:null,reposted:false,apologized:false,responses:[],approach:null,order:[null,null,null],stopped:false,inspected:false,cleared:false,inlet:null,restored:false,checks:[],published:false};}
export const samplesCorrect=c=>SAMPLE_IDS.every(id=>c.samples.includes(id))&&c.rise==='b'&&c.window==='morning';
export const interviewCorrect=c=>INTERVIEW_IDS.every(id=>c.interviews.includes(id))&&c.contradiction==='valve';
export const modelCorrect=c=>Object.entries(ECO_MODEL).every(([id,value])=>c.model[id]===value);
export const stopCorrect=c=>STOP_ORDER.every((id,i)=>c.order[i]===id);
export function reduceEco(s,a){
 const n=structuredClone(s),c=n.eco,o=s.eco,at=stage=>s.stage==='eco-'+stage;
 switch(a.type){
 case 'ECO_START':if(s.stage==='case-complete')n.stage='eco-opening';break;
 case 'ECO_BRIEF':if(at('opening'))c.briefed=true;break;
 case 'ECO_BEGIN':if(at('opening')&&o.briefed)n.stage='eco-spark';break;
 case 'ECO_SAMPLE':if(at('spark'))c.sampleSeen=true;break;
 case 'ECO_ACCUSE':if(at('spark')&&o.sampleSeen){c.accused=true;n.stage='eco-keeper';}break;
 case 'ECO_REFLECT':if(at('keeper')&&['error','doubt'].includes(a.id))c.reflection=a.id;break;
 case 'ECO_COMPARE_START':if(at('keeper')&&o.reflection)n.stage='eco-samples';break;
 case 'ECO_READ':{
  const target=at('samples')?'samples':at('interviews')?'interviews':at('response')?'responses':at('verify')?'checks':null;
  const ids={samples:SAMPLE_IDS,interviews:INTERVIEW_IDS,responses:['depot','salma'],checks:['water','roots']};
  if(target&&ids[target].includes(a.id)&&!o[target].includes(a.id))c[target].push(a.id);break;
 }
 case 'ECO_PICK':{
  if(at('samples')&&!o.compared&&((a.id==='rise'&&['a','b','c'].includes(a.value))||(a.id==='window'&&['morning','all'].includes(a.value))))c[a.id]=a.value;
  if(at('interviews')&&!o.interviewChecked&&a.id==='contradiction'&&INTERVIEW_IDS.includes(a.value))c.contradiction=a.value;
  if(at('model')&&!o.linked&&Object.hasOwn(ECO_MODEL,a.id)&&['depot','source','unproven'].includes(a.value))c.model[a.id]=a.value;
  if(at('correction')&&!o.reposted&&a.id==='replacement'&&['evidence','harmless','intent'].includes(a.value))c.replacement=a.value;
  if(at('response')&&a.id==='approach'&&['warning','visit'].includes(a.value))c.approach=a.value;
  if(at('source')&&!o.restored&&a.id==='inlet'&&['clean','depot'].includes(a.value))c.inlet=a.value;
  break;
 }
 case 'ECO_COMPARE':if(at('samples')&&samplesCorrect(o))c.compared=true;break;
 case 'ECO_INTERVIEWS':if(at('samples')&&o.compared)n.stage='eco-interviews';break;
 case 'ECO_CHECK_INTERVIEW':if(at('interviews')&&interviewCorrect(o))c.interviewChecked=true;break;
 case 'ECO_MEET':if(at('interviews')&&o.interviewChecked)n.stage='eco-model';break;
 case 'ECO_LINK':if(at('model')&&modelCorrect(o))c.linked=true;break;
 case 'ECO_CORRECTION':if(at('model')&&o.linked)n.stage='eco-correction';break;
 case 'ECO_REPOST':if(at('correction')&&o.replacement==='evidence')c.reposted=true;break;
 case 'ECO_APOLOGIZE':if(at('correction')&&o.reposted)c.apologized=true;break;
 case 'ECO_RESPONSE':if(at('correction')&&o.reposted&&o.apologized)n.stage='eco-response';break;
 case 'ECO_STOP_START':if(at('response')&&o.responses.length===2&&o.approach)n.stage='eco-stop';break;
 case 'ECO_ORDER':if(at('stop')&&!o.stopped&&Number.isInteger(a.index)&&a.index>=0&&a.index<3&&STOP_ORDER.includes(a.id)){for(let i=0;i<3;i++)if(c.order[i]===a.id)c.order[i]=null;c.order[a.index]=a.id;}break;
 case 'ECO_STOP':if(at('stop')&&stopCorrect(o))c.stopped=true;break;
 case 'ECO_SOURCE':if(at('stop')&&o.stopped)n.stage='eco-source';break;
 case 'ECO_INSPECT':if(at('source'))c.inspected=true;break;
 case 'ECO_CLEAR':if(at('source')&&o.inspected)c.cleared=true;break;
 case 'ECO_RESTORE':if(at('source')&&o.stopped&&o.cleared&&o.inlet==='clean')c.restored=true;break;
 case 'ECO_VERIFY':if(at('source')&&o.restored)n.stage='eco-verify';break;
 case 'ECO_PUBLISH':if(at('verify')&&o.stopped&&o.restored&&o.checks.length===2)c.published=true;break;
 case 'ECO_FINISH':if(at('verify')&&o.published)n.stage='eco-complete';break;
 case 'HINT':if(ECO_STAGES.includes(s.stage))n.hints[s.stage]=Math.min(3,(s.hints[s.stage]||0)+1);break;
 }
 return n;
}
export function validateEco(input,stage){
 const c=initialEco(),bad=()=>{throw Error('Der Umweltfall überspringt eine notwendige Handlung.');};
 if(!input||typeof input!=='object')bad();
 for(const [key,value] of Object.entries(c))if(typeof value==='boolean'){if(typeof input[key]!=='boolean')bad();c[key]=input[key];}
 for(const [key,ids] of [['samples',SAMPLE_IDS],['interviews',INTERVIEW_IDS],['responses',['depot','salma']],['checks',['water','roots']]]){const v=input[key];if(!Array.isArray(v)||v.some(id=>!ids.includes(id))||new Set(v).size!==v.length)bad();c[key]=[...v];}
 for(const [key,ids] of [['reflection',['error','doubt']],['rise',['a','b','c']],['window',['morning','all']],['contradiction',INTERVIEW_IDS],['replacement',['evidence','harmless','intent']],['approach',['warning','visit']],['inlet',['clean','depot']]]){if(![null,...ids].includes(input[key]))bad();c[key]=input[key];}
 if(!input.model||typeof input.model!=='object')bad();for(const id of Object.keys(ECO_MODEL)){if(![null,'depot','source','unproven'].includes(input.model[id]))bad();c.model[id]=input.model[id];}
 if(!Array.isArray(input.order)||input.order.length!==3||input.order.some(id=>id!==null&&!STOP_ORDER.includes(id))||new Set(input.order.filter(Boolean)).size!==input.order.filter(Boolean).length)bad();c.order=[...input.order];
 const i=ECO_STAGES.indexOf(stage),empty=initialEco();
 if(i<0){if(JSON.stringify(c)!==JSON.stringify(empty))bad();return c;}
 // Every field has an earliest phase. Reject manufactured future progress.
 const groups=[['briefed'],['sampleSeen','accused'],['reflection'],['samples','rise','window','compared'],['interviews','contradiction','interviewChecked'],['model','linked'],['replacement','reposted','apologized'],['responses','approach'],['order','stopped'],['inspected','cleared','inlet','restored'],['checks','published']];
 groups.forEach((fields,index)=>{if(i<index&&fields.some(key=>JSON.stringify(c[key])!==JSON.stringify(empty[key])))bad();});
 if((i>=1&&!c.briefed)||(c.accused&&!c.sampleSeen)||(i>=2&&!c.accused)||(i>=3&&!c.reflection)||(c.compared&&!samplesCorrect(c))||(i>=4&&!c.compared)||(c.interviewChecked&&!interviewCorrect(c))||(i>=5&&!c.interviewChecked)||(c.linked&&!modelCorrect(c))||(i>=6&&!c.linked))bad();
 if((c.reposted&&c.replacement!=='evidence')||(c.apologized&&!c.reposted)||(i>=7&&!c.apologized)||(i>=8&&(c.responses.length!==2||!c.approach))||(c.stopped&&!stopCorrect(c))||(i>=9&&!c.stopped)||(c.cleared&&!c.inspected)||(c.restored&&(!c.cleared||c.inlet!=='clean'||!c.stopped))||(i>=10&&!c.restored)||(c.published&&c.checks.length!==2)||(i>=11&&!c.published))bad();
 return c;
}

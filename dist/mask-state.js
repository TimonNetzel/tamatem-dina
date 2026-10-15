// Local surreal rules change paper architecture, never establish guilt by magic.
export const MASK_STAGES=['opening','doubt','archive','crop','perspective','caption','network','correction','mirror','return','publish','complete'].map(p=>'mask-'+p);
export const MASK_DOCS={opening:['acclaim'],doubt:['dinaMessage'],archive:['rules','original','repost','permission'],crop:['contact'],perspective:['sites'],caption:['sequence'],network:['ledger','reply'],correction:['receipt'],mirror:['offer','authorship'],return:['crowdNote'],publish:['response']};
export const MASK_ORDER=['photo','cut','label','post'];
export const MASK_PROOF={frame:'full',angle:'side',caption:'lift'};
export const MASK_CLAIMS={image:'observed',chain:'documented',master:'open'};
export const MASK_CHOICES={approach:['public','quiet'],naming:['name','role'],provenance:['original','repost'],crop:['tight','full'],view:['front','side'],observation:['contact','gap','motive'],caption:['destroy','lift','always'],credit:['alone','shared'],crowd:['talk','boundary'],kit:['crown','evidence']};
export function initialMask(){return {read:[],approach:null,questioned:false,naming:null,provenance:null,archiveChecked:false,crop:null,cropChecked:false,view:null,observation:null,perspectiveChecked:false,caption:null,captionChecked:false,network:[null,null,null,null],networkChecked:false,proof:{frame:null,angle:null,caption:null},proofChecked:false,admitted:false,reposted:false,credit:null,mirrorChecked:false,crowd:null,kit:null,returnChecked:false,claims:{image:null,chain:null,master:null},publishChecked:false,approved:false,published:false};}
const docsRead=(c,p)=>(MASK_DOCS[p]||[]).every(id=>c.read.includes(id));
const matches=(a,b)=>Object.entries(b).every(([key,value])=>a[key]===value);
export function maskCheck(c,phase){return docsRead(c,phase)&&({archive:c.provenance==='original'&&!!c.naming,crop:c.crop==='full',perspective:c.view==='side'&&c.observation==='gap',caption:c.caption==='lift',network:MASK_ORDER.every((id,i)=>c.network[i]===id),correction:matches(c.proof,MASK_PROOF),mirror:c.credit==='shared',return:!!c.crowd&&c.kit==='evidence',publish:matches(c.claims,MASK_CLAIMS)}[phase]===true);}
export function maskReady(c,p){return {opening:docsRead(c,p),doubt:docsRead(c,p)&&c.questioned,archive:c.archiveChecked,crop:c.cropChecked,perspective:c.perspectiveChecked,caption:c.captionChecked,network:c.networkChecked,correction:c.reposted,mirror:c.mirrorChecked,return:c.returnChecked,publish:c.published,complete:true}[p]===true;}
const FLAGS={archive:'archiveChecked',crop:'cropChecked',perspective:'perspectiveChecked',caption:'captionChecked',network:'networkChecked',correction:'proofChecked',mirror:'mirrorChecked',return:'returnChecked',publish:'publishChecked'};
const FIELDS=[[],['approach','questioned'],['naming','provenance','archiveChecked'],['crop','cropChecked'],['view','observation','perspectiveChecked'],['caption','captionChecked'],['network','networkChecked'],['proof','proofChecked','admitted','reposted'],['credit','mirrorChecked'],['crowd','kit','returnChecked'],['claims','publishChecked','approved','published']];
export function reduceMask(s,a){
 const n=structuredClone(s),c=n.mask,o=s.mask,i=MASK_STAGES.indexOf(s.stage),p=s.stage.slice(5);
 if(a.type==='MASK_START'){if(s.stage==='morning-complete')n.stage=MASK_STAGES[0];return n;}
 if(i<0)return n;
 switch(a.type){
 case 'MASK_READ':if((MASK_DOCS[p]||[]).includes(a.id)&&!o.read.includes(a.id))c.read.push(a.id);break;
 case 'MASK_PICK':{
  if(!o[FLAGS[p]]&&FIELDS[i]?.includes(a.id)&&MASK_CHOICES[a.id]?.includes(a.value)&&!(a.id==='approach'&&o.questioned))c[a.id]=a.value;
  const model=p==='correction'?MASK_PROOF:p==='publish'?MASK_CLAIMS:null,field=p==='correction'?'proof':'claims';
  if(model&&Object.hasOwn(model,a.id)&&!o[FLAGS[p]]){const allowed=p==='correction'?{frame:['tight','full'],angle:['front','side'],caption:['destroy','lift','always']}[a.id]:['observed','documented','open'];if(allowed.includes(a.value))c[field][a.id]=a.value;}
  break;
 }
 case 'MASK_QUESTION':if(p==='doubt'&&docsRead(o,p)&&o.approach)c.questioned=true;break;
 case 'MASK_ORDER':if(p==='network'&&!o.networkChecked&&Number.isInteger(a.index)&&a.index>=0&&a.index<4&&MASK_ORDER.includes(a.id)){c.network=c.network.map(id=>id===a.id?null:id);c.network[a.index]=a.id;}break;
 case 'MASK_CHECK':if(FLAGS[p]&&maskCheck(o,p))c[FLAGS[p]]=true;break;
 case 'MASK_ADMIT':if(p==='correction'&&o.proofChecked)c.admitted=true;break;
 case 'MASK_REPOST':if(p==='correction'&&o.admitted)c.reposted=true;break;
 case 'MASK_APPROVE':if(p==='publish'&&o.publishChecked)c.approved=true;break;
 case 'MASK_PUBLISH':if(p==='publish'&&o.approved)c.published=true;break;
 case 'MASK_NEXT':if(i<11&&maskReady(o,p))n.stage=MASK_STAGES[i+1];break;
 case 'HINT':n.hints[s.stage]=Math.min(3,(s.hints[s.stage]||0)+1);break;
 }
 return n;
}
export function validateMask(input,stage){
 const c=initialMask(),empty=initialMask(),bad=()=>{throw Error('Die Maskenstadt überspringt eine notwendige Handlung.');};
 if(!input||typeof input!=='object')bad();
 for(const [key,value] of Object.entries(c))if(typeof value==='boolean'){if(typeof input[key]!=='boolean')bad();c[key]=input[key];}
 const all=Object.values(MASK_DOCS).flat();if(!Array.isArray(input.read)||input.read.some(id=>!all.includes(id))||new Set(input.read).size!==input.read.length)bad();c.read=[...input.read];
 for(const [key,values] of Object.entries(MASK_CHOICES)){if(![null,...values].includes(input[key]))bad();c[key]=input[key];}
 for(const [field,model] of [['proof',MASK_PROOF],['claims',MASK_CLAIMS]]){if(!input[field]||typeof input[field]!=='object')bad();for(const id of Object.keys(model)){const values=field==='proof'?{frame:['tight','full'],angle:['front','side'],caption:['destroy','lift','always']}[id]:['observed','documented','open'];if(![null,...values].includes(input[field][id]))bad();c[field][id]=input[field][id];}}
 if(!Array.isArray(input.network)||input.network.length!==4||input.network.some(id=>id!==null&&!MASK_ORDER.includes(id))||new Set(input.network.filter(Boolean)).size!==input.network.filter(Boolean).length)bad();c.network=[...input.network];
 const i=MASK_STAGES.indexOf(stage);
 if(i<0){if(JSON.stringify(c)!==JSON.stringify(empty))bad();return c;}
 FIELDS.forEach((fields,index)=>{if(i<index&&fields.some(key=>JSON.stringify(c[key])!==JSON.stringify(empty[key])))bad();});
 for(const [p,ids] of Object.entries(MASK_DOCS))if(MASK_STAGES.indexOf('mask-'+p)>i&&ids.some(id=>c.read.includes(id)))bad();
 for(const [p,flag] of Object.entries(FLAGS))if(c[flag]&&!maskCheck(c,p))bad();
 if((c.questioned&&(!c.approach||!docsRead(c,'doubt')))||(c.admitted&&!c.proofChecked)||(c.reposted&&!c.admitted)||(c.approved&&!c.publishChecked)||(c.published&&!c.approved))bad();
 for(let p=0;p<i;p++)if(!maskReady(c,MASK_STAGES[p].slice(5)))bad();
 return c;
}

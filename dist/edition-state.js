// Finale: narrow documentary claims and independent futures for both protagonists.
export const EDITION_PHASES=['opening','call','contacts','records','funds','sources','chain','responses','agreement','future','publish','followup'];
export const EDITION_STAGES=[...EDITION_PHASES.map(p=>'edition-'+p),'edition-complete'];
export const EDITION_DOCS={opening:['room','notice'],call:['rumour','worksheet'],contacts:['tenant','archivist'],records:['r7','n4'],funds:['invoice','bank','grant'],sources:['register','permission'],chain:['dates'],responses:['owner','editor','template'],agreement:['archiveOffer','workplan'],future:['jobOffer','draft'],publish:['printOffer','orders'],followup:['printReceipt','keys']};
export const EDITION_OPTIONS={call:{start:['questions','crosscheck']},contacts:{tenantRoute:['introduction','mediator'],archiveRoute:['appointment','desk']},records:{contract:['r7','all'],deadline:['thirty','twenty'],legality:['undecided','illegal']},funds:{debt:['1500','zero','3500'],grantUse:['restricted','rent']},sources:{sourceRoute:['letter','visit'],access:['extract','upload'],identity:['omit','expose']},responses:{claim:['roomClaim','mastermind'],motive:['open','revenge'],link:['unproven','sameLogo']},agreement:{reviewMode:['publicReview','writtenHandover'],dinaGoal:['collective','ownArchive'],cooperation:['scheduled','separate']},future:{tamatemGoal:['local','mobile'],revision:['bounded','total']},publish:{printCost:['2000','1200'],reserve:['zeroReserve','2000'],privacy:['protected','allNames']},followup:{copies:['printed','promised'],roomResult:['returned','saved']}};
export const EDITION_ORDER=['amendment','bill','paid','letter'];
export function editionConsequences(s){return {tenantRoute:s.case.consent==='name'?'introduction':'mediator',archiveRoute:s.mask.naming==='name'?'appointment':'desk',sourceRoute:s.healing.picks.responseMode==='written'?'letter':'visit',memory:s.choice==='fear'?'fearMemory':'researchMemory',workflow:s.morning.pressure==='open'?'publicReview':'writtenHandover',audience:s.mask.crowd==='talk'?'audienceTalk':'questionBox',question:s.mask.approach==='public'?'publicQuestion':'privateQuestion',doubt:s.healing.picks.approach==='doubt'?'spokenDoubt':'sharedCheck'};}
export function editionSolutions(s,p){const f=editionConsequences(s);return ({call:{start:['questions','crosscheck']},contacts:{tenantRoute:f.tenantRoute,archiveRoute:f.archiveRoute},records:{contract:'r7',deadline:'thirty',legality:'undecided'},funds:{debt:'1500',grantUse:'restricted'},sources:{sourceRoute:f.sourceRoute,access:'extract',identity:'omit'},responses:{claim:'roomClaim',motive:'open',link:'unproven'},agreement:{reviewMode:f.workflow,dinaGoal:['collective','ownArchive'],cooperation:['scheduled','separate']},future:{tamatemGoal:['local','mobile'],revision:'bounded'},publish:{printCost:'2000',reserve:'zeroReserve',privacy:'protected'},followup:{copies:'printed',roomResult:'returned'}})[p]||{};}
export function initialEdition(){return {read:[],picks:{},checked:[],order:[null,null,null,null],protected:false,met:false,dinaSigned:false,authored:false,approved:false,published:false};}
export function editionCheck(s,p){const c=s.edition;return EDITION_PHASES.includes(p)&&(EDITION_DOCS[p]||[]).every(id=>c.read.includes(id))&&Object.entries(editionSolutions(s,p)).every(([id,v])=>Array.isArray(v)?v.includes(c.picks[id]):c.picks[id]===v)&&(p!=='chain'||EDITION_ORDER.every((id,i)=>c.order[i]===id));}
export function editionReady(c,p){return c.checked.includes(p)&&({sources:c.protected,chain:c.met,agreement:c.dinaSigned,future:c.authored,publish:c.published}[p]??true);}
export function reduceEdition(s,a){
 const n=structuredClone(s),c=n.edition,o=s.edition,i=EDITION_STAGES.indexOf(s.stage),p=s.stage.slice(8);
 if(a.type==='EDITION_START'){if(s.stage==='healing-complete')n.stage=EDITION_STAGES[0];return n;}
 if(i<0)return n;
 switch(a.type){
 case 'EDITION_READ':if((EDITION_DOCS[p]||[]).includes(a.id)&&!o.read.includes(a.id))c.read.push(a.id);break;
 case 'EDITION_PICK':if(!o.checked.includes(p)&&EDITION_OPTIONS[p]?.[a.id]?.includes(a.value))c.picks[a.id]=a.value;break;
 case 'EDITION_ORDER':if(p==='chain'&&!o.checked.includes(p)&&Number.isInteger(a.index)&&a.index>=0&&a.index<4&&EDITION_ORDER.includes(a.id)){c.order=c.order.map(id=>id===a.id?null:id);c.order[a.index]=a.id;}break;
 case 'EDITION_CHECK':if(editionCheck(s,p)&&!o.checked.includes(p))c.checked.push(p);break;
 case 'EDITION_PROTECT':if(p==='sources'&&o.checked.includes(p))c.protected=true;break;
 case 'EDITION_MEET':if(p==='chain'&&o.checked.includes(p))c.met=true;break;
 case 'EDITION_SIGN':if(p==='agreement'&&o.checked.includes(p))c.dinaSigned=true;break;
 case 'EDITION_AUTHOR':if(p==='future'&&o.checked.includes(p))c.authored=true;break;
 case 'EDITION_APPROVE':if(p==='publish'&&o.checked.includes(p))c.approved=true;break;
 case 'EDITION_PUBLISH':if(p==='publish'&&o.approved)c.published=true;break;
 case 'EDITION_NEXT':if(i<12&&editionReady(o,p))n.stage=EDITION_STAGES[i+1];break;
 case 'HINT':n.hints[s.stage]=Math.min(3,(s.hints[s.stage]||0)+1);break;
 }
 return n;
}
export function validateEdition(input,stage,history){
 const c=initialEdition(),bad=()=>{throw Error('Der Spielstand enthält ungültige Einträge.');};
 if(!input||typeof input!=='object')bad();
 for(const key of ['protected','met','dinaSigned','authored','approved','published']){if(typeof input[key]!=='boolean')bad();c[key]=input[key];}
 for(const [key,allowed] of [['read',Object.values(EDITION_DOCS).flat()],['checked',EDITION_PHASES]]){if(!Array.isArray(input[key])||input[key].some(id=>!allowed.includes(id))||new Set(input[key]).size!==input[key].length)bad();c[key]=[...input[key]];}
 if(!input.picks||typeof input.picks!=='object'||Array.isArray(input.picks))bad();
 const options=Object.assign({},...Object.values(EDITION_OPTIONS));
 for(const [id,value] of Object.entries(input.picks)){if(!options[id]?.includes(value))bad();c.picks[id]=value;}
 if(!Array.isArray(input.order)||input.order.length!==4||input.order.some(id=>id!==null&&!EDITION_ORDER.includes(id))||new Set(input.order.filter(Boolean)).size!==input.order.filter(Boolean).length)bad();c.order=[...input.order];
 const i=EDITION_STAGES.indexOf(stage),s={...history,edition:c};
 if(i<0){if(JSON.stringify(c)!==JSON.stringify(initialEdition()))bad();return c;}
 for(const [p,ids] of Object.entries(EDITION_DOCS))if(EDITION_PHASES.indexOf(p)>i&&ids.some(id=>c.read.includes(id)))bad();
 for(const [p,fields] of Object.entries(EDITION_OPTIONS))if(EDITION_PHASES.indexOf(p)>i&&Object.keys(fields).some(id=>Object.hasOwn(c.picks,id)))bad();
 if(i<6&&c.order.some(Boolean))bad();
 for(const p of c.checked)if(EDITION_PHASES.indexOf(p)>i||!editionCheck(s,p))bad();
 for(const [flag,p] of [['protected','sources'],['met','chain'],['dinaSigned','agreement'],['authored','future'],['approved','publish'],['published','publish']])if(c[flag]&&(EDITION_PHASES.indexOf(p)>i||!c.checked.includes(p)))bad();
 if(c.published&&!c.approved)bad();
 for(let j=0;j<i;j++)if(!editionReady(c,EDITION_PHASES[j]))bad();
 return c;
}

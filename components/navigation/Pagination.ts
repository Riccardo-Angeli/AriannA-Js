import { Component, Css, Templates } from '../../core/index.ts';
const html=Templates.Template.Html;const {Rule,Stylesheet}=Css;type Stylesheet=Css.Stylesheet;
export interface PaginationOptions{total?:number;pageSize?:number;page?:number;siblings?:number;}
interface PagEntry{type:'btn'|'dots';label:string;page?:number;active?:boolean;disabled?:boolean;}
interface PaginationState{built:boolean;}
const PaginationStates=new WeakMap<HTMLElement,PaginationState>();
const PState=(host:HTMLElement):PaginationState=>{let s=PaginationStates.get(host);if(!s){s={built:false};PaginationStates.set(host,s);}return s;};

export const Styles:Stylesheet=new Stylesheet([
 new Rule('.Pagination',{'--arianna-bg':'#17181c','--arianna-bg-3':'#24262b','--arianna-text':'#e6e8eb','--arianna-muted':'#9aa0aa','--arianna-border':'#303238','--arianna-primary':'#e40c88',color:'var(--arianna-text)',display:'block',fontFamily:'var(--arianna-font,system-ui,sans-serif)'}),
 new Rule('.Pagination[theme="light"]',{'--arianna-bg':'#fff','--arianna-bg-3':'#f3f3f5','--arianna-text':'#1c1e21','--arianna-muted':'#626873','--arianna-border':'#e2e2e6'}),
 new Rule('.Pagination-Row',{display:'flex',alignItems:'center',gap:'4px',flexWrap:'wrap'}),new Rule('.Pagination-Button',{background:'var(--arianna-bg)',border:'1px solid var(--arianna-border)',borderRadius:'5px',color:'var(--arianna-text)',cursor:'pointer',font:'inherit',fontSize:'.82rem',minWidth:'34px',height:'30px',padding:'3px 8px'}),
 new Rule('.Pagination-Button:hover:not(:disabled)',{borderColor:'var(--arianna-primary)',color:'var(--arianna-primary)'}),new Rule('.Pagination-Button-Active',{background:'var(--arianna-primary)',borderColor:'var(--arianna-primary)',color:'#fff'}),new Rule('.Pagination-Button:disabled',{opacity:'.4'}),new Rule('.Pagination-Dots',{color:'var(--arianna-muted)',padding:'0 4px'})
]);
@Component('arianna-pagination',Styles,{Shadow:false,Attributes:['total','page-size','page','siblings','theme']})
export class Pagination extends HTMLElement{
 declare template:unknown;
 onCreated():void{if(this.isConnected)this.onConnected();}
 onConnected(o:PaginationOptions={}):void{
    this.classList.add('Pagination');if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');this.setAttribute('role','navigation');this.setAttribute('aria-label','Pagination');
    if(o.total!==undefined)this.total=o.total;if(o.pageSize!==undefined)this.pageSize=o.pageSize;if(o.page!==undefined)this.page=o.page;if(o.siblings!==undefined)this.siblings=o.siblings;
    PState(this).built=true;this.Render();(this as any).Sheet=Styles;
 }
 onAttributeChanged():void{if(PState(this).built)this.Render();}
 private Entries():PagEntry[]{const tp=this.totalPages;if(tp<=1)return[];const cur=Math.min(tp,Math.max(1,this.page)),sib=Math.max(0,this.siblings),out:PagEntry[]=[{type:'btn',label:'‹',page:cur-1,disabled:cur<=1}];const start=Math.max(1,cur-sib),end=Math.min(tp,cur+sib);if(start>1){out.push({type:'btn',label:'1',page:1});if(start>2)out.push({type:'dots',label:'…'});}for(let p=start;p<=end;p++)out.push({type:'btn',label:String(p),page:p,active:p===cur});if(end<tp){if(end<tp-1)out.push({type:'dots',label:'…'});out.push({type:'btn',label:String(tp),page:tp});}out.push({type:'btn',label:'›',page:cur+1,disabled:cur>=tp});return out;}
 private Render():void{if(!PState(this).built)return;const row=document.createElement('div');row.className='Pagination-Row';for(const e of this.Entries()){if(e.type==='dots'){const s=document.createElement('span');s.className='Pagination-Dots';s.textContent=e.label;row.appendChild(s);continue;}const b=document.createElement('button');b.type='button';b.className='Pagination-Button'+(e.active?' Pagination-Button-Active':'');b.disabled=!!e.disabled;b.textContent=e.label;if(e.active)b.setAttribute('aria-current','page');b.onclick=()=>{if(e.page!==undefined)this.go(e.page);};row.appendChild(b);}this.replaceChildren(row);}
 go(t:number):this{const tp=this.totalPages;t=Math.max(1,Math.min(tp,t));if(!tp||t===this.page)return this;this.page=t;this.dispatchEvent(new CustomEvent('arianna:change',{bubbles:true,detail:{page:t,totalPages:tp}}));return this;}
 next():this{return this.go(this.page+1);}prev():this{return this.go(this.page-1);}
 get totalPages(){return Math.ceil(Math.max(0,this.total)/Math.max(1,this.pageSize));}
 get total(){return Number(this.getAttribute('total')??0)||0;}set total(v:number){this.setAttribute('total',String(Math.max(0,v)));}
 get pageSize(){return Number(this.getAttribute('page-size')??10)||10;}set pageSize(v:number){this.setAttribute('page-size',String(Math.max(1,v)));}
 get page(){return Number(this.getAttribute('page')??1)||1;}set page(v:number){this.setAttribute('page',String(Math.max(1,v)));}
 get siblings(){return Number(this.getAttribute('siblings')??1)||0;}set siblings(v:number){this.setAttribute('siblings',String(Math.max(0,v)));}
 static readonly Styles=Styles;static DefaultSheet():Stylesheet{return Styles;}
}
export namespace Pagination{export namespace Interfaces{export interface Options extends PaginationOptions{}export interface PagEntryContract extends PagEntry{}}}
export default Pagination;

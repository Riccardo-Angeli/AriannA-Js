import { Component, Css, Templates } from '../../core/index.ts';
const html=Templates.Template.Html; const {Rule,Stylesheet}=Css; type Stylesheet=Css.Stylesheet;

export interface BreadcrumbItem { label:string; href?:string; icon?:string; }
export interface BreadcrumbOptions { separator?:string; items?:BreadcrumbItem[]; }
interface BreadcrumbState { items:BreadcrumbItem[]; built:boolean; }
const BreadcrumbStates=new WeakMap<HTMLElement,BreadcrumbState>();
const BState=(host:HTMLElement):BreadcrumbState=>{
    let s=BreadcrumbStates.get(host);
    if(!s){s={items:[],built:false};BreadcrumbStates.set(host,s);}
    return s;
};

export const Styles:Stylesheet=new Stylesheet([
 new Rule('.Breadcrumb',{'--arianna-bg':'#17181c','--arianna-bg-3':'#24262b','--arianna-text':'#e6e8eb','--arianna-muted':'#9aa0aa','--arianna-dim':'#6f7580','--arianna-border':'#303238','--arianna-primary':'#e40c88',display:'block',color:'var(--arianna-text)',fontFamily:'var(--arianna-font,system-ui,sans-serif)'}),
 new Rule('.Breadcrumb[theme="light"]',{'--arianna-bg':'#fff','--arianna-bg-3':'#f3f3f5','--arianna-text':'#1c1e21','--arianna-muted':'#626873','--arianna-dim':'#8a8f98','--arianna-border':'#e2e2e6'}),
 new Rule('.Breadcrumb-List',{display:'flex',flexWrap:'wrap',alignItems:'center',gap:'2px',listStyle:'none',margin:'0',padding:'0'}),
 new Rule('.Breadcrumb-Item',{display:'flex',alignItems:'center',gap:'4px',fontSize:'.82rem'}),
 new Rule('.Breadcrumb-Link',{color:'var(--arianna-primary)',textDecoration:'none',cursor:'pointer',borderRadius:'4px',padding:'2px 4px'}),
 new Rule('.Breadcrumb-Link:hover',{background:'var(--arianna-bg-3)'}),
 new Rule('.Breadcrumb-Current',{color:'var(--arianna-text)',fontWeight:'600',padding:'2px 4px'}),
 new Rule('.Breadcrumb-Separator',{color:'var(--arianna-dim)',padding:'0 2px'})
]);

@Component('arianna-breadcrumb',Styles,{Shadow:false,Attributes:['separator','theme','items'],Properties:['items']})
export class Breadcrumb extends HTMLElement {
 declare template:unknown;
 onCreated():void{if(this.isConnected)this.onConnected();}
 onConnected(options:BreadcrumbOptions={}):void{
    const s=BState(this);
    this.classList.add('Breadcrumb');
    if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');
    this.setAttribute('role','navigation');this.setAttribute('aria-label','Breadcrumb');
    if(options.items)s.items=[...options.items];
    if(options.separator)this.setAttribute('separator',options.separator);
    const a=this.getAttribute('items');
    if(!s.items.length&&a)try{const v=JSON.parse(a);if(Array.isArray(v))s.items=v;}catch{}
    s.built=true;this.Render();(this as any).Sheet=Styles;
 }
 onAttributeChanged(name:string):void{
    const s=BState(this); if(!s.built)return;
    if(name==='items'){const a=this.getAttribute('items');if(a)try{const v=JSON.parse(a);if(Array.isArray(v))s.items=v;}catch{}}
    this.Render();
 }
 private Render():void{
    const s=BState(this);if(!s.built)return;
    const list=document.createElement('ol');list.className='Breadcrumb-List';
    const sep=this.getAttribute('separator')??'/';
    s.items.forEach((item,index)=>{
        const li=document.createElement('li');li.className='Breadcrumb-Item';
        if(item.icon){const i=document.createElement('span');i.className='Breadcrumb-Icon';i.textContent=item.icon;li.appendChild(i);}
        if(index===s.items.length-1){
            const c=document.createElement('span');c.className='Breadcrumb-Current';c.setAttribute('aria-current','page');c.textContent=item.label;li.appendChild(c);
        }else{
            const a=document.createElement('a');a.className='Breadcrumb-Link';a.href=item.href??'#';a.textContent=item.label;
            a.onclick=e=>{e.preventDefault();this.dispatchEvent(new CustomEvent('arianna:click',{bubbles:true,detail:{item,index}}));};
            li.appendChild(a);
            const sp=document.createElement('span');sp.className='Breadcrumb-Separator';sp.textContent=sep;li.appendChild(sp);
        }
        list.appendChild(li);
    });
    this.replaceChildren(list);
 }
 set items(v:BreadcrumbItem[]){const s=BState(this);s.items=Array.isArray(v)?[...v]:[];this.Render();}
 get items(){return [...BState(this).items];}
 static readonly Styles=Styles;static DefaultSheet():Stylesheet{return Styles;}
}
export namespace Breadcrumb{export namespace Interfaces{export interface Item extends BreadcrumbItem{} export interface Options extends BreadcrumbOptions{}}}
export default Breadcrumb;

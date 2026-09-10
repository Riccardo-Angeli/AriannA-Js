import { Component, Css, Templates } from '../../core/index.ts';
const html=Templates.Template.Html;const {Rule,Stylesheet}=Css;type Stylesheet=Css.Stylesheet;
export interface NavRailItem{id:string;label:string;icon:string;badge?:string|number;disabled?:boolean;}
export interface NavRailOptions{items?:NavRailItem[];collapsed?:boolean;active?:string;}
interface NavRailState{items:NavRailItem[];built:boolean;}
const NavRailStates=new WeakMap<HTMLElement,NavRailState>();
const NState=(host:HTMLElement):NavRailState=>{let s=NavRailStates.get(host);if(!s){s={items:[],built:false};NavRailStates.set(host,s);}return s;};

export const Styles:Stylesheet=new Stylesheet([
 new Rule('.NavRail',{'--arianna-bg':'#17181c','--arianna-bg-3':'#24262b','--arianna-text':'#e6e8eb','--arianna-muted':'#9aa0aa','--arianna-border':'#303238','--arianna-primary':'#e40c88','--arianna-danger':'#ef5350',background:'var(--arianna-bg)',border:'1px solid var(--arianna-border)',borderRadius:'7px',boxSizing:'border-box',color:'var(--arianna-text)',display:'flex',flexDirection:'column',gap:'2px',padding:'7px 6px',transition:'width .18s ease',width:'220px',fontFamily:'var(--arianna-font,system-ui,sans-serif)',overflow:'hidden'}),
 new Rule('.NavRail[theme="light"]',{'--arianna-bg':'#fff','--arianna-bg-3':'#f3f3f5','--arianna-text':'#1c1e21','--arianna-muted':'#626873','--arianna-border':'#e2e2e6'}),
 new Rule('.NavRail[collapsed]',{width:'58px'}),new Rule('.NavRail-Toggle',{background:'transparent',border:'0',color:'var(--arianna-muted)',cursor:'pointer',height:'28px',textAlign:'right',padding:'0 8px'}),
 new Rule('.NavRail-Item',{alignItems:'center',background:'transparent',border:'1px solid transparent',borderRadius:'5px',color:'var(--arianna-muted)',cursor:'pointer',display:'flex',font:'inherit',fontSize:'.83rem',gap:'10px',minHeight:'38px',overflow:'hidden',padding:'8px 10px',textAlign:'left',whiteSpace:'nowrap',width:'100%'}),
 new Rule('.NavRail-Item:hover:not(:disabled)',{background:'var(--arianna-bg-3)',color:'var(--arianna-text)'}),new Rule('.NavRail-Item-Active',{background:'rgba(228,12,136,.13)',borderColor:'rgba(228,12,136,.34)',color:'var(--arianna-primary)',fontWeight:'700'}),new Rule('.NavRail-Item:disabled',{opacity:'.42'}),
 new Rule('.NavRail-Icon',{width:'20px',textAlign:'center'}),new Rule('.NavRail-Label',{flex:'1'}),new Rule('.NavRail[collapsed] .NavRail-Label,.NavRail[collapsed] .NavRail-Badge',{display:'none'}),new Rule('.NavRail-Badge',{background:'var(--arianna-danger)',borderRadius:'9px',color:'#fff',fontSize:'.65rem',padding:'1px 6px'})
]);
@Component('arianna-nav-rail',Styles,{Shadow:false,Attributes:['collapsed','active','theme','items'],Properties:['items']})
export class NavRail extends HTMLElement{
 declare template:unknown;
 onCreated():void{if(this.isConnected)this.onConnected();}
 onConnected(o:NavRailOptions={}):void{
    const s=NState(this);this.classList.add('NavRail');if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');
    if(o.items)s.items=[...o.items];if(o.active!==undefined)this.active=o.active;if(o.collapsed!==undefined)this.collapsed=o.collapsed;
    const a=this.getAttribute('items');if(!s.items.length&&a)try{const v=JSON.parse(a);if(Array.isArray(v))s.items=v;}catch{}
    s.built=true;this.Render();(this as any).Sheet=Styles;
 }
 onAttributeChanged(name:string):void{const s=NState(this);if(!s.built)return;if(name==='items'){const a=this.getAttribute('items');if(a)try{const v=JSON.parse(a);if(Array.isArray(v))s.items=v;}catch{}}this.Render();}
 private Render():void{
    const s=NState(this);if(!s.built)return;const f=document.createDocumentFragment();
    const t=document.createElement('button');t.type='button';t.className='NavRail-Toggle';t.textContent=this.collapsed?'▸':'◂';t.title=this.collapsed?'Expand':'Collapse';t.onclick=()=>this.toggle();f.appendChild(t);
    for(const item of s.items){
        const b=document.createElement('button');b.type='button';b.className='NavRail-Item'+(item.id===this.active?' NavRail-Item-Active':'');b.disabled=!!item.disabled;b.title=this.collapsed?item.label:'';
        const i=document.createElement('span');i.className='NavRail-Icon';i.textContent=item.icon;b.appendChild(i);
        const l=document.createElement('span');l.className='NavRail-Label';l.textContent=item.label;b.appendChild(l);
        if(item.badge!==undefined){const bd=document.createElement('span');bd.className='NavRail-Badge';bd.textContent=String(item.badge);b.appendChild(bd);}
        b.onclick=()=>{if(item.disabled)return;this.active=item.id;this.dispatchEvent(new CustomEvent('arianna:select',{bubbles:true,detail:{id:item.id,item}}));};f.appendChild(b);
    }
    this.replaceChildren(f);
 }
 toggle():this{this.collapsed=!this.collapsed;this.dispatchEvent(new CustomEvent('arianna:toggle',{bubbles:true,detail:{collapsed:this.collapsed}}));return this;}
 set items(v:NavRailItem[]){const s=NState(this);s.items=Array.isArray(v)?[...v]:[];this.Render();}get items(){return [...NState(this).items];}
 get active(){return this.getAttribute('active')??'';}set active(v:string){v?this.setAttribute('active',v):this.removeAttribute('active');}
 get collapsed(){return this.hasAttribute('collapsed');}set collapsed(v:boolean){v?this.setAttribute('collapsed',''):this.removeAttribute('collapsed');}
 static readonly Styles=Styles;static DefaultSheet():Stylesheet{return Styles;}
}
export namespace NavRail{export namespace Interfaces{export interface Item extends NavRailItem{}export interface Options extends NavRailOptions{}}}
export default NavRail;

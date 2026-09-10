import { Component, Css, Templates } from '../../core/index.ts';
const html=Templates.Template.Html;const {Rule,Stylesheet}=Css;type Stylesheet=Css.Stylesheet;
export interface SidebarItem{id:string;label:string;icon?:string;badge?:string|number;disabled?:boolean;class?:string;data?:unknown;}
export interface SidebarSection{id:string;label:string;items:SidebarItem[];open?:boolean;icon?:string;}
export interface SidebarOptions{orientation?:'left'|'right';width?:number;minWidth?:number;maxWidth?:number;collapsedWidth?:number;collapsible?:boolean;collapsed?:boolean;resizable?:boolean;searchable?:boolean;showToggle?:boolean;persist?:boolean;storageKey?:string;ariaLabel?:string;sections?:SidebarSection[];active?:string;}
interface SidebarState{sections:SidebarSection[];open:Set<string>;query:string;built:boolean;header:Node[];footer:Node[];}
const SidebarStates=new WeakMap<HTMLElement,SidebarState>();
const SState=(host:HTMLElement):SidebarState=>{let s=SidebarStates.get(host);if(!s){s={sections:[],open:new Set(),query:'',built:false,header:[],footer:[]};SidebarStates.set(host,s);}return s;};

export const Styles:Stylesheet=new Stylesheet([
 new Rule('.Sidebar',{'--arianna-bg':'#17181c','--arianna-bg-3':'#24262b','--arianna-text':'#e6e8eb','--arianna-muted':'#9aa0aa','--arianna-border':'#303238','--arianna-primary':'#e40c88',background:'var(--arianna-bg)',border:'1px solid var(--arianna-border)',boxSizing:'border-box',color:'var(--arianna-text)',display:'flex',flexDirection:'column',height:'100%',minHeight:'280px',overflow:'hidden',position:'relative',transition:'width .18s ease',fontFamily:'var(--arianna-font,system-ui,sans-serif)'}),
 new Rule('.Sidebar[theme="light"]',{'--arianna-bg':'#fff','--arianna-bg-3':'#f3f3f5','--arianna-text':'#1c1e21','--arianna-muted':'#626873','--arianna-border':'#e2e2e6'}),
 new Rule('.Sidebar-Header',{borderBottom:'1px solid var(--arianna-border)',padding:'10px 12px'}),new Rule('.Sidebar-Header:empty,.Sidebar-Footer:empty',{display:'none'}),new Rule('.Sidebar-Footer',{borderTop:'1px solid var(--arianna-border)',marginTop:'auto',padding:'9px 12px'}),
 new Rule('.Sidebar-Toggle',{background:'transparent',border:'0',color:'var(--arianna-muted)',cursor:'pointer',height:'30px',padding:'0 12px',textAlign:'right',width:'100%'}),new Rule('.Sidebar-Search-Wrap',{padding:'4px 9px 8px'}),new Rule('.Sidebar-Search',{background:'var(--arianna-bg-3)',border:'1px solid var(--arianna-border)',borderRadius:'5px',boxSizing:'border-box',color:'var(--arianna-text)',font:'inherit',padding:'6px 9px',width:'100%'}),
 new Rule('.Sidebar-List',{flex:'1',overflowY:'auto',padding:'4px 7px'}),new Rule('.Sidebar-Section',{marginBottom:'4px'}),new Rule('.Sidebar-Section-Header',{alignItems:'center',background:'transparent',border:'0',color:'var(--arianna-muted)',cursor:'pointer',display:'flex',font:'inherit',fontSize:'.7rem',fontWeight:'800',gap:'6px',padding:'6px 8px',textAlign:'left',width:'100%'}),new Rule('.Sidebar-Section-Label',{flex:'1'}),
 new Rule('.Sidebar-Items',{display:'flex',flexDirection:'column',gap:'2px'}),new Rule('.Sidebar-Item',{alignItems:'center',background:'transparent',border:'1px solid transparent',borderRadius:'5px',color:'var(--arianna-text)',cursor:'pointer',display:'flex',font:'inherit',gap:'9px',padding:'6px 9px',textAlign:'left',width:'100%'}),new Rule('.Sidebar-Item:hover:not(:disabled)',{background:'var(--arianna-bg-3)'}),new Rule('.Sidebar-Item-Active',{background:'rgba(228,12,136,.13)',borderColor:'rgba(228,12,136,.28)',color:'var(--arianna-primary)',fontWeight:'700'}),new Rule('.Sidebar-Item:disabled',{opacity:'.42'}),new Rule('.Sidebar-Item-Label',{flex:'1'}),new Rule('.Sidebar-Item-Badge',{background:'var(--arianna-primary)',borderRadius:'9px',color:'#fff',fontSize:'.65rem',padding:'1px 6px'}),
 new Rule('.Sidebar-Resize',{bottom:'0',cursor:'ew-resize',position:'absolute',top:'0',width:'6px',right:'-3px',zIndex:'3'}),new Rule('.Sidebar[orientation="right"] .Sidebar-Resize',{left:'-3px',right:'auto'}),
 new Rule('.Sidebar[collapsed] .Sidebar-Search-Wrap,.Sidebar[collapsed] .Sidebar-Section-Label,.Sidebar[collapsed] .Sidebar-Section-Arrow,.Sidebar[collapsed] .Sidebar-Item-Label,.Sidebar[collapsed] .Sidebar-Item-Badge',{display:'none'})
]);

@Component('arianna-sidebar',Styles,{Shadow:false,Attributes:['orientation','width','min-width','max-width','collapsed-width','collapsed','collapsible','resizable','searchable','show-toggle','persist','storage-key','active','aria-label','theme','sections'],Properties:['sections']})
export class Sidebar extends HTMLElement{
 declare template:unknown;
 onCreated():void{if(this.isConnected)this.onConnected();}
 onConnected(o:SidebarOptions={}):void{
    const s=SState(this);this.classList.add('Sidebar');if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');if(!this.hasAttribute('orientation'))this.setAttribute('orientation','left');
    this.setAttribute('role','navigation');if(!this.hasAttribute('aria-label'))this.setAttribute('aria-label',o.ariaLabel??'Site navigation');
    if(!s.built){const c=[...this.childNodes];s.header=c.filter(n=>n instanceof Element&&n.getAttribute('slot')==='header');s.footer=c.filter(n=>n instanceof Element&&n.getAttribute('slot')==='footer');}
    if(o.sections)this.sections=o.sections;else{const a=this.getAttribute('sections');if(!s.sections.length&&a)try{const v=JSON.parse(a);if(Array.isArray(v))this.sections=v;}catch{}}
    if(o.orientation)this.orientation=o.orientation;if(o.width!==undefined)this.width=o.width;if(o.active!==undefined)this.active=o.active;if(o.collapsed!==undefined)this.collapsed=o.collapsed;
    if(this.persist&&!this.hasAttribute('width'))try{const saved=localStorage.getItem(this.storageKey);if(saved)this.setAttribute('width',saved);}catch{}
    s.built=true;this.ApplyWidth();this.Render();(this as any).Sheet=Styles;
 }
 onAttributeChanged(name:string):void{const s=SState(this);if(!s.built)return;if(['width','collapsed','collapsed-width'].includes(name))this.ApplyWidth();if(['active','collapsed','orientation','searchable','show-toggle','resizable'].includes(name))this.Render();}
 private ApplyWidth():void{this.style.width=(this.collapsed?this.collapsedWidth:this.width)+'px';}
 private Render():void{
    const s=SState(this);if(!s.built)return;const f=document.createDocumentFragment();
    const h=document.createElement('div');h.className='Sidebar-Header';s.header.forEach(n=>h.appendChild(n));f.appendChild(h);
    if(this.showToggle){const t=document.createElement('button');t.type='button';t.className='Sidebar-Toggle';t.textContent=this.orientation==='left'?(this.collapsed?'▸':'◂'):(this.collapsed?'◂':'▸');t.onclick=()=>this.toggle();f.appendChild(t);}
    if(this.searchable&&!this.collapsed){const w=document.createElement('div');w.className='Sidebar-Search-Wrap';const i=document.createElement('input');i.className='Sidebar-Search';i.type='search';i.placeholder='Search…';i.value=s.query;i.oninput=()=>{s.query=i.value.toLowerCase().trim();this.Render();};w.appendChild(i);f.appendChild(w);}
    const list=document.createElement('div');list.className='Sidebar-List';
    for(const sec of s.sections){
        const matched=s.query?sec.items.filter(i=>i.label.toLowerCase().includes(s.query)||String(i.badge??'').toLowerCase().includes(s.query)):sec.items;if(s.query&&!matched.length)continue;
        const open=!!s.query||s.open.has(sec.id);const section=document.createElement('section');section.className='Sidebar-Section';
        const sh=document.createElement('button');sh.type='button';sh.className='Sidebar-Section-Header';
        if(sec.icon){const ic=document.createElement('span');ic.textContent=sec.icon;sh.appendChild(ic);}
        const sl=document.createElement('span');sl.className='Sidebar-Section-Label';sl.textContent=sec.label;sh.appendChild(sl);
        const ar=document.createElement('span');ar.className='Sidebar-Section-Arrow';ar.textContent=open?'▾':'▸';sh.appendChild(ar);sh.onclick=()=>this.toggleSection(sec.id);section.appendChild(sh);
        if(open){const items=document.createElement('div');items.className='Sidebar-Items';for(const item of matched){const b=document.createElement('button');b.type='button';b.className='Sidebar-Item'+(item.id===this.active?' Sidebar-Item-Active':'')+(item.class?' '+item.class:'');b.disabled=!!item.disabled;b.title=this.collapsed?item.label:'';if(item.icon){const ic=document.createElement('span');ic.textContent=item.icon;b.appendChild(ic);}const l=document.createElement('span');l.className='Sidebar-Item-Label';l.textContent=item.label;b.appendChild(l);if(item.badge!==undefined){const bd=document.createElement('span');bd.className='Sidebar-Item-Badge';bd.textContent=String(item.badge);b.appendChild(bd);}b.onclick=()=>{if(item.disabled)return;this.active=item.id;this.dispatchEvent(new CustomEvent('arianna:select',{bubbles:true,detail:{item,section:sec}}));};items.appendChild(b);}section.appendChild(items);}
        list.appendChild(section);
    }
    f.appendChild(list);const footer=document.createElement('div');footer.className='Sidebar-Footer';s.footer.forEach(n=>footer.appendChild(n));f.appendChild(footer);
    if(this.resizable&&!this.collapsed){const g=document.createElement('div');g.className='Sidebar-Resize';g.onpointerdown=e=>this.BeginResize(e,g);f.appendChild(g);}
    this.replaceChildren(f);
 }
 private BeginResize(e:PointerEvent,g:HTMLElement):void{if(e.button!==0)return;e.preventDefault();const sx=e.clientX,sw=this.width,dir=this.orientation==='left'?1:-1;g.setPointerCapture(e.pointerId);const m=(ev:PointerEvent)=>{this.width=Math.max(this.minWidth,Math.min(this.maxWidth,sw+(ev.clientX-sx)*dir));this.dispatchEvent(new CustomEvent('arianna:resize',{bubbles:true,detail:{width:this.width}}));};const u=(ev:PointerEvent)=>{g.removeEventListener('pointermove',m);g.removeEventListener('pointerup',u);g.removeEventListener('pointercancel',u);try{g.releasePointerCapture(ev.pointerId);}catch{}if(this.persist)try{localStorage.setItem(this.storageKey,String(this.width));}catch{}};g.addEventListener('pointermove',m);g.addEventListener('pointerup',u);g.addEventListener('pointercancel',u);}
 set sections(v:SidebarSection[]){const s=SState(this);s.sections=Array.isArray(v)?v.map(x=>({...x,items:[...(x.items??[])]})):[];s.open=new Set(s.sections.filter(x=>x.open!==false).map(x=>x.id));this.Render();}
 get sections(){return SState(this).sections.map(x=>({...x,items:[...x.items]}));}
 collapse():this{this.collapsed=true;this.dispatchEvent(new CustomEvent('arianna:collapse',{bubbles:true,detail:{collapsed:true}}));return this;}expand():this{this.collapsed=false;this.dispatchEvent(new CustomEvent('arianna:collapse',{bubbles:true,detail:{collapsed:false}}));return this;}toggle():this{return this.collapsed?this.expand():this.collapse();}
 openSection(id:string):this{SState(this).open.add(id);this.Render();return this;}closeSection(id:string):this{SState(this).open.delete(id);this.Render();return this;}toggleSection(id:string):this{const s=SState(this);const was=s.open.has(id);was?s.open.delete(id):s.open.add(id);this.Render();this.dispatchEvent(new CustomEvent('arianna:section-toggle',{bubbles:true,detail:{id,open:!was}}));return this;}search(q:string):this{SState(this).query=(q??'').toLowerCase().trim();this.Render();return this;}setWidth(w:number):this{this.width=w;return this;}
 get orientation(){return (this.getAttribute('orientation')??'left') as 'left'|'right';}set orientation(v:'left'|'right'){this.setAttribute('orientation',v);}
 get width(){return Number(this.getAttribute('width')??260)||260;}set width(v:number){this.setAttribute('width',String(Math.max(this.minWidth,Math.min(this.maxWidth,v))));this.ApplyWidth();}
 get minWidth(){return Number(this.getAttribute('min-width')??160)||160;}set minWidth(v:number){this.setAttribute('min-width',String(v));}
 get maxWidth(){return Number(this.getAttribute('max-width')??480)||480;}set maxWidth(v:number){this.setAttribute('max-width',String(v));}
 get collapsedWidth(){return Number(this.getAttribute('collapsed-width')??48)||48;}set collapsedWidth(v:number){this.setAttribute('collapsed-width',String(v));this.ApplyWidth();}
 get collapsed(){return this.hasAttribute('collapsed');}set collapsed(v:boolean){v?this.setAttribute('collapsed',''):this.removeAttribute('collapsed');}
 get collapsible(){return this.getAttribute('collapsible')!=='false';}set collapsible(v:boolean){this.setAttribute('collapsible',String(v));}
 get resizable(){return this.getAttribute('resizable')!=='false';}set resizable(v:boolean){this.setAttribute('resizable',String(v));}
 get searchable(){return this.getAttribute('searchable')!=='false';}set searchable(v:boolean){this.setAttribute('searchable',String(v));}
 get showToggle(){return this.getAttribute('show-toggle')!=='false'&&this.collapsible;}
 get persist(){return this.hasAttribute('persist');}set persist(v:boolean){v?this.setAttribute('persist',''):this.removeAttribute('persist');}
 get storageKey(){return this.getAttribute('storage-key')??'arianna-sidebar-w';}set storageKey(v:string){this.setAttribute('storage-key',v);}
 get active(){return this.getAttribute('active')??'';}set active(v:string){v?this.setAttribute('active',v):this.removeAttribute('active');}
 static readonly Styles=Styles;static DefaultSheet():Stylesheet{return Styles;}
}
export namespace Sidebar{export namespace Interfaces{export interface Item extends SidebarItem{}export interface Section extends SidebarSection{}export interface Options extends SidebarOptions{}}}
export default Sidebar;

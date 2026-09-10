import { Component, Css, Templates } from '../../core/index.ts';
const html=Templates.Template.Html;const {Rule,Stylesheet}=Css;type Stylesheet=Css.Stylesheet;
export interface StepperOptions{variant?:'horizontal'|'vertical';steps?:string[];current?:number;clickable?:boolean;}
interface StepperState{steps:string[];completed:Set<number>;built:boolean;}
const StepperStates=new WeakMap<HTMLElement,StepperState>();
const TState=(host:HTMLElement):StepperState=>{let s=StepperStates.get(host);if(!s){s={steps:[],completed:new Set(),built:false};StepperStates.set(host,s);}return s;};

export const Styles:Stylesheet=new Stylesheet([
 new Rule('.Stepper',{'--arianna-bg-3':'#24262b','--arianna-text':'#e6e8eb','--arianna-muted':'#9aa0aa','--arianna-border':'#303238','--arianna-primary':'#e40c88','--arianna-success':'#26a69a',color:'var(--arianna-text)',display:'flex',alignItems:'flex-start',fontFamily:'var(--arianna-font,system-ui,sans-serif)',minWidth:'0',width:'100%'}),
 new Rule('.Stepper[theme="light"]',{'--arianna-bg-3':'#f3f3f5','--arianna-text':'#1c1e21','--arianna-muted':'#626873','--arianna-border':'#e2e2e6','--arianna-success':'#168a78'}),
 new Rule('.Stepper[variant="vertical"]',{flexDirection:'column',gap:'6px'}),new Rule('.Stepper:not([variant]),.Stepper[variant="horizontal"]',{flexDirection:'row'}),
 new Rule('.Stepper-Step',{alignItems:'center',display:'flex',flex:'1',flexDirection:'column',gap:'5px',minWidth:'64px',position:'relative',textAlign:'center'}),new Rule('.Stepper-StepButton',{alignItems:'center',background:'transparent',border:'0',color:'inherit',display:'flex',flexDirection:'column',font:'inherit',gap:'5px',padding:'0'}),new Rule('.Stepper[clickable] .Stepper-StepButton',{cursor:'pointer'}),
 new Rule('.Stepper-Dot',{alignItems:'center',background:'var(--arianna-bg-3)',border:'2px solid var(--arianna-border)',borderRadius:'50%',color:'var(--arianna-muted)',display:'flex',fontSize:'.7rem',fontWeight:'700',height:'28px',justifyContent:'center',width:'28px',zIndex:'1'}),new Rule('.Stepper-Step-Active .Stepper-Dot',{background:'var(--arianna-primary)',borderColor:'var(--arianna-primary)',color:'#fff'}),new Rule('.Stepper-Step-Done .Stepper-Dot',{background:'var(--arianna-success)',borderColor:'var(--arianna-success)',color:'#fff'}),
 new Rule('.Stepper-Label',{color:'var(--arianna-muted)',fontSize:'.72rem'}),new Rule('.Stepper-Step-Active .Stepper-Label',{color:'var(--arianna-text)',fontWeight:'700'}),new Rule('.Stepper-Step:not(:last-child)::after',{background:'var(--arianna-border)',content:'""',height:'2px',left:'50%',position:'absolute',right:'-50%',top:'14px'}),new Rule('.Stepper-Step-Done:not(:last-child)::after',{background:'var(--arianna-success)'}),
 new Rule('.Stepper[variant="vertical"] .Stepper-Step',{alignItems:'flex-start',flex:'none',width:'100%'}),new Rule('.Stepper[variant="vertical"] .Stepper-StepButton',{alignItems:'center',flexDirection:'row'}),new Rule('.Stepper[variant="vertical"] .Stepper-Step:not(:last-child)::after',{display:'none'})
]);

@Component('arianna-stepper',Styles,{Shadow:false,Attributes:['variant','current','theme','steps','clickable'],Properties:['steps']})
export class Stepper extends HTMLElement{
 declare template:unknown;
 onCreated():void{if(this.isConnected)this.onConnected();}
 onConnected(o:StepperOptions={}):void{
    const s=TState(this);this.classList.add('Stepper');if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');
    if(o.steps)s.steps=[...o.steps];if(o.variant)this.variant=o.variant;if(o.current!==undefined)this.current=o.current;if(o.clickable!==undefined)this.toggleAttribute('clickable',o.clickable);
    const a=this.getAttribute('steps');if(!s.steps.length&&a)try{const v=JSON.parse(a);if(Array.isArray(v))s.steps=v.map(String);}catch{}
    s.built=true;this.Render();(this as any).Sheet=Styles;
 }
 onAttributeChanged(name:string):void{const s=TState(this);if(!s.built)return;if(name==='steps'){const a=this.getAttribute('steps');if(a)try{const v=JSON.parse(a);if(Array.isArray(v))s.steps=v.map(String);}catch{}}this.Render();}
 private Render():void{
    const s=TState(this);if(!s.built)return;const f=document.createDocumentFragment();
    s.steps.forEach((label,index)=>{
        const done=s.completed.has(index),active=index===this.current;
        const step=document.createElement('div');step.className='Stepper-Step'+(done?' Stepper-Step-Done':'')+(active?' Stepper-Step-Active':'');
        const b=document.createElement('button');b.type='button';b.className='Stepper-StepButton';b.disabled=!this.hasAttribute('clickable');
        const d=document.createElement('div');d.className='Stepper-Dot';d.textContent=done?'✓':String(index+1);
        const l=document.createElement('div');l.className='Stepper-Label';l.textContent=label;b.append(d,l);
        b.onclick=()=>{if(this.hasAttribute('clickable'))this.go(index);};step.appendChild(b);f.appendChild(step);
    });
    this.replaceChildren(f);
 }
 go(i:number):this{const s=TState(this);if(!s.steps.length)return this;i=Math.max(0,Math.min(s.steps.length-1,i));if(i===this.current)return this;this.current=i;this.dispatchEvent(new CustomEvent('arianna:change',{bubbles:true,detail:{step:i}}));return this;}
 next():this{const s=TState(this),c=this.current;if(c<s.steps.length-1){s.completed.add(c);this.go(c+1);}return this;}prev():this{return this.go(this.current-1);}
 complete(n:number=this.current):this{const s=TState(this);if(n>=0&&n<s.steps.length)s.completed.add(n);this.Render();return this;}reset():this{const s=TState(this);s.completed.clear();this.current=0;this.Render();return this;}
 set steps(v:string[]){const s=TState(this);s.steps=Array.isArray(v)?v.map(String):[];s.completed.clear();this.Render();}get steps(){return [...TState(this).steps];}
 get variant(){return (this.getAttribute('variant')??'horizontal') as 'horizontal'|'vertical';}set variant(v:'horizontal'|'vertical'){this.setAttribute('variant',v);}
 get current(){return Number(this.getAttribute('current')??0)||0;}set current(v:number){this.setAttribute('current',String(Math.max(0,v)));}
 static readonly Styles=Styles;static DefaultSheet():Stylesheet{return Styles;}
}
export namespace Stepper{export namespace Interfaces{export interface Options extends StepperOptions{}}}
export default Stepper;

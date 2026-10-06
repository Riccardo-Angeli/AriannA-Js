/**
 * @module components/project/Gantt
 * Hierarchical Gantt editor, calendar-day scheduling (inclusive end dates, UTC).
 * .tree / .setTree(ProjectTree), constructor {tree}, JSON tree attribute or the
 * same nested data-tree markup as WBS. No demo data and no remote dependencies.
 * Leaves: editable dates/progress/owner, pointer and keyboard move/resize.
 * Groups: derived child bounds/progress. Finish-to-start links are visual only.
 * Mutations emit arianna:gantt-change with a detached complete tree snapshot.
 * Barrel integration: export { Gantt } from './Gantt.ts';
 */
import { Component, Templates } from '../../core/index.ts';
import { NormalizeProjectTree, ReadProjectMarkup, ProjectNodes, ProjectDay, ProjectDate,
    ProjectElement as el, ProjectButton as button, ProjectStyles, ProjectTheme } from './WBS.ts';
import type { ProjectTree, ProjectTreeInput, ProjectNode } from './WBS.ts';
export type { ProjectTree, ProjectTreeInput, ProjectNode } from './WBS.ts';
export interface GanttOptions { tree?: ProjectTreeInput; theme?: 'dark'|'light'; title?: string; height?: number; dayWidth?: number; readonly?: boolean; }

export function NormalizeGanttTree(value: ProjectTreeInput): ProjectTree {
    const tree=NormalizeProjectTree(value), nodes=ProjectNodes(tree.nodes), byId=new Map(nodes.map(n=>[n.id,n]));
    const done=new Set<string>(), visiting=new Set<string>();
    const visit=(node:ProjectNode)=>{
        if(visiting.has(node.id))throw new TypeError('Dependency cycle: '+node.id);
        if(done.has(node.id))return;visiting.add(node.id);
        for(const id of node.dependencies??[]){const predecessor=byId.get(id);if(!predecessor)throw new TypeError('Unknown dependency '+id+' on '+node.id);visit(predecessor);}
        visiting.delete(node.id);done.add(node.id);
    };
    nodes.forEach(visit);return tree;
}
interface Span { start:number; end:number; progress:number; }
export function GanttSpan(node:ProjectNode): Span|null {
    if(node.children?.length){const spans=node.children.map(GanttSpan).filter((s):s is Span=>s!==null);if(!spans.length)return null;const total=spans.reduce((a,s)=>a+s.end-s.start+1,0);return {start:Math.min(...spans.map(s=>s.start)),end:Math.max(...spans.map(s=>s.end)),progress:spans.reduce((a,s)=>a+s.progress*(s.end-s.start+1),0)/total};}
    if(!node.start)return null;
    const start=ProjectDay(node.start),end=node.milestone?start:node.end?ProjectDay(node.end):start;
    return {start,end,progress:node.progress??0};
}
const Styles=ProjectStyles+`
.Gantt .Project-Header .Project-Button,arianna-gantt .Project-Header .Project-Button{background:linear-gradient(180deg,var(--p-panel),var(--p-input));color:var(--p-text);border:1px solid var(--p-border);border-radius:5px;min-height:28px;padding:4px 10px;box-shadow:inset 0 1px 0 #ffffff15;text-shadow:0 1px 1px #0004}
.Gantt .Project-Header .Project-Button:hover:not(:disabled),arianna-gantt .Project-Header .Project-Button:hover:not(:disabled){background:linear-gradient(180deg,#f23c9f,#c80a76);color:#fff;border-color:#ed50a8}
.Gantt .Project-Header .Project-Button:active:not(:disabled),arianna-gantt .Project-Header .Project-Button:active:not(:disabled){box-shadow:inset 0 2px 4px #0005}
.Project-Header .Project-Button:disabled{opacity:.45;cursor:default}

.Gantt-Viewport{overflow:auto;position:relative;min-height:180px}.Gantt-Canvas{position:relative}.Gantt-Row,.Gantt-Axis{display:grid;grid-template-columns:440px auto;height:38px}.Gantt-Axis{height:54px;position:sticky;top:0;z-index:5;background:var(--p-panel)}
.Gantt-Fields{position:sticky;left:0;z-index:3;display:grid;grid-template-columns:200px 88px 88px 64px;align-items:center;border-right:1px solid var(--p-border);border-bottom:1px solid var(--p-border);background:var(--p-panel);overflow:hidden}
.Gantt-Fields>div{padding:4px 7px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px}.Gantt-Name{display:flex;align-items:center;gap:4px}.Gantt-Name button{border:0;padding:0 3px;background:transparent;color:inherit;cursor:pointer}.Gantt-Name span{overflow:hidden;text-overflow:ellipsis}
.Gantt-Row[data-selected="true"] .Gantt-Fields{box-shadow:inset 3px 0 var(--p-accent);background:var(--p-input)}.Gantt-Row[data-summary="true"]{font-weight:700}.Gantt-Axis .Gantt-Fields{z-index:6;font-weight:700}
.Gantt-Ticks,.Gantt-Lane{position:relative;border-bottom:1px solid var(--p-border);background-image:linear-gradient(to right,var(--p-border) 1px,transparent 1px);background-size:var(--day-width) 100%}
.Gantt-Tick{position:absolute;height:54px;top:0;border-left:1px solid var(--p-border);padding:5px;font:10px/20px system-ui;overflow:hidden;white-space:nowrap}.Gantt-Tick b{display:block;font-size:9px;color:var(--p-muted)}
.Gantt-Weekend{position:absolute;top:0;bottom:0;background:#8193ad0d;pointer-events:none}.Gantt-Today{position:absolute;top:0;bottom:0;width:1px;background:var(--p-accent);pointer-events:none}
.Gantt-Bar{position:absolute;top:9px;height:20px;border:1px solid #ffffff40;border-radius:4px;background:var(--bar-color,#4d9de0);color:#fff;cursor:grab;touch-action:none;user-select:none;overflow:hidden;min-width:3px;padding:0;font:10px/18px system-ui}
.Gantt-Bar:focus-visible{outline:2px solid var(--p-accent);outline-offset:2px}.Gantt-Bar[data-summary="true"]{height:10px;top:14px;border-radius:1px;cursor:default}.Gantt-Bar[data-milestone="true"]{width:14px!important;height:14px;top:12px;transform:rotate(45deg);border-radius:1px;overflow:visible}
.Gantt-Fill{position:absolute;inset:0 auto 0 0;background:#0003;pointer-events:none}.Gantt-BarLabel{position:relative;padding:0 9px;white-space:nowrap;pointer-events:none}.Gantt-Handle{position:absolute;top:0;bottom:0;width:7px;cursor:ew-resize;z-index:1}.Gantt-Handle[data-edge="start"]{left:0}.Gantt-Handle[data-edge="end"]{right:0}.Gantt-Handle:hover{background:#fff6}
.Gantt-Links{position:absolute;left:440px;top:54px;pointer-events:none;z-index:2;overflow:visible}.Gantt-Links path{fill:none;stroke:var(--p-muted);stroke-width:1.3}
.Gantt-Editor{display:flex;flex-wrap:wrap;gap:10px;padding:12px;border-top:1px solid var(--p-border);background:var(--p-panel);align-items:end}.Gantt-Editor label{display:grid;gap:4px;font-size:10px;color:var(--p-muted)}.Gantt-Editor input{width:135px}.Gantt-Editor input[type="checkbox"]{width:auto}.Gantt-Editor .Gantt-Wide{width:190px}.Gantt-Error{color:#ed7777;flex-basis:100%;min-height:16px}
`;
interface GanttState { tree:ProjectTree; loaded:boolean; selected:string|null; undo:ProjectTree[]; redo:ProjectTree[]; dayWidth?:number; cancelDrag?:()=>void; }
const states=new WeakMap<HTMLElement,GanttState>();
const state=(host:HTMLElement):GanttState=>{let s=states.get(host);if(!s){s={tree:{nodes:[]},loaded:false,selected:null,undo:[],redo:[]};states.set(host,s);}return s;};

@Component('arianna-gantt',Styles,{Shadow:false,Attributes:['theme','title','height','day-width','readonly','tree'],Properties:['tree']})
export class Gantt extends HTMLElement {
    public template=Templates.Template.Html``;
    constructor(options:GanttOptions={}){super();if(options.tree)this.tree=options.tree;for(const k of ['theme','title','height','readonly'] as const)if(options[k]!==undefined)this.setAttribute(k,String(options[k]));if(options.dayWidth!==undefined)this.setAttribute('day-width',String(options.dayWidth));}
    public onCreated():void{if(this.isConnected)this.onConnected();}
    public onConnected():void{this.load();this.renderView();}
    public onDisconnected():void{state(this).cancelDrag?.();}
    public onUnmount():void{this.onDisconnected();}
    public onAttributeChanged(name:string):void{if(name==='tree'){const raw=this.getAttribute('tree');this.tree=raw?JSON.parse(raw):{nodes:[]};}else if(this.isConnected)this.renderView();}
    public get tree():ProjectTree{this.load();return structuredClone(state(this).tree);}
    public set tree(value:ProjectTreeInput){const next=NormalizeGanttTree(value),s=state(this);s.cancelDrag?.();s.tree=next;s.loaded=true;s.undo=[];s.redo=[];s.dayWidth=undefined;if(!ProjectNodes(next.nodes).some(n=>n.id===s.selected))s.selected=null;if(this.isConnected)this.renderView();}
    public setTree(value:ProjectTreeInput):this{this.tree=value;return this;}
    public getTree():ProjectTree{return this.tree;}
    public refreshFromMarkup():this{state(this).loaded=false;this.load();state(this).undo=[];state(this).redo=[];this.renderView();return this;}
    public get readOnly():boolean{const value=this.getAttribute('readonly');return value===null?state(this).tree.readonly===true:value!=='false';}
    public updateTask(id:string,patch:Partial<Omit<ProjectNode,'id'|'children'>>):this{
        this.mutate('update',id,tree=>{const node=ProjectNodes(tree.nodes).find(n=>n.id===id);if(!node)throw new RangeError('Unknown task: '+id);if(node.children?.length&&(patch.start!==undefined||patch.end!==undefined||patch.progress!==undefined||patch.milestone!==undefined))throw new TypeError('Summary dates/progress are derived from children');Object.assign(node,patch,{id,children:node.children});});return this;
    }
    public addTask(task:ProjectNode,parentId?:string):this{this.mutate('add',task.id,tree=>{const parent=parentId?ProjectNodes(tree.nodes).find(n=>n.id===parentId):null;if(parentId&&!parent)throw new RangeError('Unknown parent: '+parentId);(parent?(parent.children??=[]):tree.nodes).push(task);});return this;}
    public removeTask(id:string):this{this.mutate('remove',id,tree=>{const node=ProjectNodes(tree.nodes).find(n=>n.id===id);if(!node)throw new RangeError('Unknown task: '+id);const removed=new Set(ProjectNodes([node]).map(n=>n.id));const prune=(nodes:ProjectNode[]):ProjectNode[]=>nodes.filter(n=>!removed.has(n.id)).map(n=>({...n,dependencies:n.dependencies?.filter(d=>!removed.has(d)),children:prune(n.children??[])}));tree.nodes=prune(tree.nodes);});return this;}
    public undo():this{this.history('undo');return this;}
    public redo():this{this.history('redo');return this;}
    public expandAll(expanded=true):this{this.load();ProjectNodes(state(this).tree.nodes).forEach(n=>n.expanded=expanded);this.renderView();return this;}
    private history(direction:'undo'|'redo'):void{if(this.readOnly)return;const s=state(this),snapshot=s[direction].pop();if(!snapshot)return;s[direction==='undo'?'redo':'undo'].push(structuredClone(s.tree));s.tree=snapshot;if(!ProjectNodes(s.tree.nodes).some(n=>n.id===s.selected))s.selected=null;this.renderView();this.emit(direction,null);}
    private mutate(action:string,id:string,fn:(tree:ProjectTree)=>void):void{this.load();if(this.readOnly)throw new TypeError('Gantt is readonly');const s=state(this),next=structuredClone(s.tree);fn(next);const checked=NormalizeGanttTree(next);s.undo.push(structuredClone(s.tree));if(s.undo.length>50)s.undo.shift();s.redo=[];s.tree=checked;if(action==='add')s.selected=id;if(action==='remove')s.selected=null;this.renderView();this.emit(action,id);}
    private emit(action:string,id:string|null):void{this.dispatchEvent(new CustomEvent('arianna:gantt-change',{bubbles:true,composed:true,detail:{action,id,tree:this.tree,source:this}}));}
    private load():void{const s=state(this);if(s.loaded)return;const raw=this.getAttribute('tree'),value=raw?JSON.parse(raw):ReadProjectMarkup(this);if(value)s.tree=NormalizeGanttTree(value);s.loaded=true;}
    private select(id:string):void{state(this).selected=id;this.renderView();this.dispatchEvent(new CustomEvent('arianna:gantt-select',{bubbles:true,composed:true,detail:{id,source:this}}));}
    private drag(event:PointerEvent,node:ProjectNode,bar:HTMLElement,span:Span,dayWidth:number,origin:number):void{
        if(this.readOnly||node.children?.length||event.button!==0)return;event.preventDefault();event.stopPropagation();
        const s=state(this);s.cancelDrag?.();
        const edge=node.milestone?'move':(event.target as HTMLElement).dataset.edge||'move',x=event.clientX;
        let start=span.start,end=span.end;
        const cleanup=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',cancel);window.removeEventListener('blur',cancel);s.cancelDrag=undefined;};
        const move=(e:PointerEvent)=>{if(e.pointerId!==event.pointerId)return;const delta=Math.round((e.clientX-x)/dayWidth);start=edge==='end'?span.start:edge==='start'?Math.min(span.end,span.start+delta):span.start+delta;end=edge==='start'?span.end:edge==='end'?Math.max(span.start,span.end+delta):span.end+delta;bar.style.left=((start-origin)*dayWidth+(node.milestone?dayWidth/2-7:0))+'px';if(!node.milestone)bar.style.width=((end-start+1)*dayWidth)+'px';};
        const up=(e:PointerEvent)=>{if(e.pointerId!==event.pointerId)return;cleanup();if(start!==span.start||end!==span.end)this.updateTask(node.id,{start:ProjectDate(start),end:ProjectDate(end)});else this.select(node.id);};
        const cancel=()=>{cleanup();bar.style.left=((span.start-origin)*dayWidth+(node.milestone?dayWidth/2-7:0))+'px';if(!node.milestone)bar.style.width=((span.end-span.start+1)*dayWidth)+'px';};
        s.cancelDrag=cancel;window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);window.addEventListener('pointercancel',cancel);window.addEventListener('blur',cancel);
    }
    private editor(node:ProjectNode):HTMLElement{
        const form=el('form','Gantt-Editor'),summary=!!node.children?.length;
        const field=(label:string,name:string,type:string,value:string)=>{const wrap=el('label','',label),input=el('input','');input.name=name;input.type=type;input.value=value;wrap.append(input);form.append(wrap);return input;};
        const title=field('Task','title','text',node.title);title.required=true;title.classList.add('Gantt-Wide');
        const owner=field('Owner','owner','text',node.owner??''),start=field('Start (inclusive)','start','date',node.start??''),end=field('End (inclusive)','end','date',node.end??'');
        const progress=field('Progress %','progress','number',String(node.progress??0));progress.min='0';progress.max='100';progress.step='1';
        const dependencies=field('Predecessor IDs (comma separated)','dependencies','text',(node.dependencies??[]).join(', '));dependencies.classList.add('Gantt-Wide');
        const milestone=field('Milestone','milestone','checkbox','');milestone.checked=node.milestone===true;
        for(const input of [start,end,progress,milestone])input.disabled=summary;
        const apply=button('Apply',()=>{});apply.type='submit';form.append(apply,button('Close',()=>{state(this).selected=null;this.renderView();}));
        const error=el('div','Gantt-Error');error.setAttribute('role','alert');form.append(error);
        form.onsubmit=e=>{e.preventDefault();try{const patch:Partial<ProjectNode>={title:title.value,owner:owner.value,dependencies:dependencies.value.split(',').map(s=>s.trim()).filter(Boolean)};if(!summary)Object.assign(patch,{start:start.value||undefined,end:end.value||undefined,progress:Number(progress.value),milestone:milestone.checked});this.updateTask(node.id,patch);}catch(err){error.textContent=err instanceof Error?err.message:String(err);}};
        return form;
    }
    private renderView():void{
        if(!this.isConnected)return;const s=state(this),tree=s.tree;s.cancelDrag?.();
        const old=Array.from(this.children).find(n=>n.hasAttribute('data-gantt-ui')),oldScroll=old?.querySelector('.Gantt-Viewport');
        const focusedBar=document.activeElement?.classList.contains('Gantt-Bar')&&this.contains(document.activeElement)?(document.activeElement.closest('[data-task-id]') as HTMLElement)?.dataset.taskId:undefined;
        const root=el('section','Project-Shell');root.setAttribute('data-gantt-ui','');ProjectTheme(this,root,tree);
        const header=el('header','Project-Header'),heading=el('div','Project-Heading');heading.append(el('div','Project-Title',this.getAttribute('title')??tree.title??'Gantt'),el('div','Project-Subtitle',tree.subtitle??'Calendar days · finish-to-start links · manual scheduling'));header.append(heading);
        const dayWidth=Math.max(4,Math.min(80,Number(s.dayWidth??this.getAttribute('day-width')??tree.dayWidth??26)||26));
        header.append(button('Expand',()=>this.expandAll()),button('Collapse',()=>this.expandAll(false)),button('−',()=>{s.dayWidth=Math.max(4,dayWidth/1.4);this.renderView();}),button('+',()=>{s.dayWidth=Math.min(80,dayWidth*1.4);this.renderView();}));
        if(!this.readOnly){const add=()=>{const nodes=ProjectNodes(tree.nodes);let i=nodes.length+1;while(nodes.some(n=>n.id==='task-'+i))i++;const date=ProjectDate(Math.floor(Date.now()/86400000));this.addTask({id:'task-'+i,title:'New task',start:date,end:date},s.selected??undefined);};const undo=button('Undo',()=>this.undo()),redo=button('Redo',()=>this.redo());undo.disabled=!s.undo.length;redo.disabled=!s.redo.length;header.append(button(s.selected?'+ Child':'+ Task',add),undo,redo);if(s.selected)header.append(button('Delete selected',()=>this.removeTask(s.selected!)));}
        const rows:{node:ProjectNode;depth:number;span:Span|null}[]=[];
        const walk=(nodes:ProjectNode[],depth:number)=>nodes.forEach(node=>{rows.push({node,depth,span:GanttSpan(node)});if(node.expanded!==false)walk(node.children??[],depth+1);});walk(tree.nodes,0);
        const spans=tree.nodes.map(GanttSpan).filter((s):s is Span=>!!s),today=Math.floor(Date.now()/86400000);
        const origin=tree.start?ProjectDay(tree.start):spans.length?Math.min(...spans.map(s=>s.start))-2:today;
        const finish=tree.end?ProjectDay(tree.end):spans.length?Math.max(...spans.map(s=>s.end))+3:today+30;
        const days=Math.max(1,finish-origin+1),width=days*dayWidth;
        const viewport=el('div','Gantt-Viewport');viewport.style.maxHeight=Math.max(180,Number(this.getAttribute('height')??tree.height??480)||480)+'px';
        root.append(header,viewport);
        if(days>3660){viewport.append(el('div','Project-Empty','Timeline exceeds 3660 days. Set tree.start and tree.end to a smaller view range.'));}
        else if(!rows.length){viewport.append(el('div','Project-Empty','No tasks. Supply a tree, declarative markup or add a task.'));}
        else{
            const canvas=el('div','Gantt-Canvas');canvas.style.width=(440+width)+'px';canvas.style.setProperty('--day-width',dayWidth+'px');
            const axis=el('div','Gantt-Axis'),fields=el('div','Gantt-Fields');['Task','Start','End','Done'].forEach(v=>fields.append(el('div','',v)));
            const ticks=el('div','Gantt-Ticks');ticks.style.width=width+'px';const step=dayWidth<12?7:1;
            for(let i=0;i<days;i+=step){const date=ProjectDate(origin+i),tick=el('div','Gantt-Tick');tick.style.left=i*dayWidth+'px';tick.style.width=step*dayWidth+'px';tick.append(el('b','',date.slice(0,7)),el('span','',date.slice(8)));ticks.append(tick);}
            axis.append(fields,ticks);canvas.append(axis);
            const positions=new Map<string,{x:number;end:number;y:number}>();
            rows.forEach(({node,depth,span},index)=>{
                const row=el('div','Gantt-Row');row.dataset.selected=String(s.selected===node.id);row.dataset.summary=String(!!node.children?.length);row.dataset.taskId=node.id;
                const cells=el('div','Gantt-Fields'),name=el('div','Gantt-Name');name.style.paddingLeft=(7+depth*14)+'px';
                if(node.children?.length){const toggle=button(node.expanded===false?'▸':'▾',()=>{node.expanded=node.expanded===false;this.renderView();});toggle.setAttribute('aria-label','Toggle '+node.title);toggle.setAttribute('aria-expanded',String(node.expanded!==false));name.append(toggle);}
                const label=el('button','',node.title);label.type='button';label.title=[node.title,node.owner,node.description].filter(Boolean).join(' · ');label.onclick=()=>this.select(node.id);name.append(label);
                cells.append(name,el('div','',span?ProjectDate(span.start):'—'),el('div','',span?ProjectDate(span.end):'—'),el('div','',Math.round(span?.progress??node.progress??0)+'%'));
                const lane=el('div','Gantt-Lane');lane.style.width=width+'px';lane.style.overflow='hidden';
                const mondayOffset=(new Date(origin*86400000).getUTCDay()+6)%7;
                lane.style.backgroundImage='linear-gradient(to right,var(--p-border) 1px,transparent 1px),repeating-linear-gradient(to right,transparent 0 '+(dayWidth*5)+'px,#8193ad0d '+(dayWidth*5)+'px '+(dayWidth*7)+'px)';
                lane.style.backgroundSize=dayWidth+'px 100%,'+(dayWidth*7)+'px 100%';lane.style.backgroundPosition='0 0,'+(-mondayOffset*dayWidth)+'px 0';
                if(today>=origin&&today<=finish){const marker=el('div','Gantt-Today');marker.style.left=(today-origin)*dayWidth+'px';lane.append(marker);}
                if(span){const x=(span.start-origin)*dayWidth,end=(span.end-origin+1)*dayWidth;positions.set(node.id,{x,end,y:index*38+19});
                    const bar=el('div','Gantt-Bar');bar.tabIndex=0;bar.setAttribute('role','button');bar.setAttribute('aria-label',node.title+': '+ProjectDate(span.start)+' to '+ProjectDate(span.end)+'. Enter: edit. Arrows: move. Alt+arrows: resize end.');bar.dataset.summary=String(!!node.children?.length);bar.dataset.milestone=String(node.milestone===true&&!node.children?.length);bar.style.left=(x+(node.milestone&&!node.children?.length?dayWidth/2-7:0))+'px';bar.style.width=(end-x)+'px';if(node.color)bar.style.setProperty('--bar-color',node.color);bar.title=node.title+' · '+Math.round(span.progress)+'%';
                    const fill=el('span','Gantt-Fill');fill.style.width=span.progress+'%';bar.append(fill);if(!node.milestone&&!node.children?.length){bar.append(el('span','Gantt-BarLabel',node.title+' · '+Math.round(span.progress)+'%'));if(!this.readOnly)for(const edge of ['start','end']){const handle=el('span','Gantt-Handle');handle.dataset.edge=edge;bar.append(handle);}}
                    bar.onpointerdown=e=>this.drag(e,node,bar,span,dayWidth,origin);bar.ondblclick=()=>this.select(node.id);
                    bar.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();this.select(node.id);}if(this.readOnly||node.children?.length||!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const delta=e.key==='ArrowLeft'?-1:1;this.updateTask(node.id,{start:ProjectDate(e.altKey&&!node.milestone?span.start:span.start+delta),end:ProjectDate(e.altKey&&!node.milestone?Math.max(span.start,span.end+delta):span.end+delta)});};lane.append(bar);
                }row.append(cells,lane);canvas.append(row);
            });
            const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('Gantt-Links');svg.setAttribute('width',String(width));svg.setAttribute('height',String(rows.length*38));svg.setAttribute('aria-hidden','true');
            for(const {node} of rows){const to=positions.get(node.id);if(!to)continue;for(const id of node.dependencies??[]){const from=positions.get(id);if(!from)continue;const path=document.createElementNS(svg.namespaceURI,'path'),bend=from.end+8;path.setAttribute('d',`M ${from.end} ${from.y} H ${bend} V ${to.y} H ${to.x} m -4 -3 l 4 3 -4 3`);svg.append(path);}}
            canvas.append(svg);viewport.append(canvas);
        }
        const selected=ProjectNodes(tree.nodes).find(n=>n.id===s.selected);if(selected&&!this.readOnly)root.append(this.editor(selected));
        root.append(el('footer','Project-Status',ProjectNodes(tree.nodes).length+' tasks · '+rows.length+' visible · '+(this.readOnly?'Read only':'Select a task to edit · drag to move · drag edges to resize')));
        if(old)old.replaceWith(root);else this.appendChild(root);if(oldScroll){viewport.scrollLeft=oldScroll.scrollLeft;viewport.scrollTop=oldScroll.scrollTop;}
        if(focusedBar)Array.from(root.querySelectorAll<HTMLElement>('[data-task-id]')).find(e=>e.dataset.taskId===focusedBar)?.querySelector<HTMLElement>('.Gantt-Bar')?.focus({preventScroll:true});
    }
}
export default Gantt;

/**
 * @module components/project/WBS
 * Open hierarchical WBS viewer. No seeded data, network access or external library.
 * Input: { tree: ProjectTree } in the constructor, .tree / .setTree(), a JSON
 * tree attribute, <script type="application/json" data-tree>, or nested
 * <ul data-tree><li data-id="a" data-title="Activity"><ul>...</ul></li></ul>.
 * Host attributes override tree presentation options. Node metadata is preserved.
 * Dates are ISO calendar days; end dates are inclusive; progress is 0..100.
 * Barrel integration: export { WBS } from './WBS.ts';
 */
import { Component, Templates } from '../../core/index.ts';

export interface ProjectNode {
    id: string;
    title: string;
    children?: ProjectNode[];
    description?: string;
    owner?: string;
    status?: string;
    color?: string;
    progress?: number;
    expanded?: boolean;
    start?: string;
    end?: string;
    milestone?: boolean;
    /** Finish-to-start links, displayed by Gantt; no implicit auto-scheduling. */
    dependencies?: string[];
    metadata?: Record<string, unknown>;
    [extension: string]: unknown;
}
export interface ProjectTree {
    title?: string;
    subtitle?: string;
    theme?: 'dark' | 'light';
    height?: number;
    zoom?: number;
    view?: 'chart' | 'outline';
    readonly?: boolean;
    dayWidth?: number;
    start?: string;
    end?: string;
    nodes: ProjectNode[];
    [extension: string]: unknown;
}
export type ProjectTreeInput = ProjectTree | ProjectNode | ProjectNode[];
export interface WBSOptions { tree?: ProjectTreeInput; theme?: 'dark' | 'light'; title?: string; height?: number; zoom?: number; view?: 'chart' | 'outline'; }

export const ProjectDay = (value: string): number => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new TypeError('Expected ISO date YYYY-MM-DD: ' + value);
    const time = Date.parse(value + 'T00:00:00Z');
    if (!Number.isFinite(time) || new Date(time).toISOString().slice(0,10) !== value) throw new TypeError('Invalid date: ' + value);
    return time / 86400000;
};
export const ProjectDate = (day: number): string => new Date(day * 86400000).toISOString().slice(0,10);
export function NormalizeProjectTree(input: ProjectTreeInput): ProjectTree {
    if (!input || typeof input !== 'object') throw new TypeError('tree must be an object or node array');
    const source: ProjectTree = Array.isArray(input) ? { nodes: input } : 'nodes' in input ? input as ProjectTree : { nodes: [input as ProjectNode] };
    if (!Array.isArray(source.nodes)) throw new TypeError('tree.nodes must be an array');
    const ids = new Set<string>(), seen = new WeakSet<object>();
    let count = 0;
    const walk = (items: ProjectNode[], depth: number): ProjectNode[] => items.map(node => {
        if (!node || typeof node !== 'object' || seen.has(node)) throw new TypeError('Tree contains a cycle or shared node');
        if (depth > 64 || ++count > 5000) throw new RangeError('Tree limit: 5000 nodes / 64 levels');
        seen.add(node);
        const id = String(node.id ?? '').trim();
        if (!id || ids.has(id)) throw new TypeError('Missing or duplicate node id: ' + id);
        ids.add(id);
        if (node.children !== undefined && !Array.isArray(node.children)) throw new TypeError('children must be an array');
        const start = node.start ? ProjectDay(node.start) : undefined, end = node.end ? ProjectDay(node.end) : undefined;
        if (start !== undefined && end !== undefined && end < start) throw new RangeError('end precedes start: ' + id);
        if (node.dependencies !== undefined && (!Array.isArray(node.dependencies) || node.dependencies.some(id => typeof id !== 'string'))) throw new TypeError('dependencies must be an array of ids');
        return { ...structuredClone({ ...node, children: undefined }), id, title: String(node.title ?? id),
            progress: Math.min(100, Math.max(0, Number(node.progress) || 0)),
            children: walk(node.children ?? [], depth + 1) };
    });
    const nodes = walk(source.nodes, 0);
    if (source.start) ProjectDay(source.start);
    if (source.end) ProjectDay(source.end);
    if (source.start && source.end && ProjectDay(source.end) < ProjectDay(source.start)) throw new RangeError('tree.end precedes tree.start');
    return { ...structuredClone({ ...source, nodes: undefined }), nodes };
}
export function ReadProjectMarkup(host: HTMLElement): ProjectTreeInput | null {
    const json = Array.from(host.children).find(el => el.matches('script[type="application/json"][data-tree]'));
    if (json) return JSON.parse(json.textContent || '{"nodes":[]}');
    const root = Array.from(host.children).find(el => el.matches('ul[data-tree],ol[data-tree]')) as HTMLElement | undefined;
    if (!root) return null;
    root.hidden = true;
    const read = (list: Element): ProjectNode[] => Array.from(list.children).filter(el => el.localName === 'li').map(el => {
        const item = el as HTMLElement, d = item.dataset;
        const nested = Array.from(item.children).find(child => child.matches('ul,ol'));
        return { id: d.id || item.id, title: d.title || Array.from(item.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim(),
            description: d.description, owner: d.owner, status: d.status, color: d.color,
            start: d.start, end: d.end, progress: Number(d.progress) || 0,
            expanded: d.expanded !== 'false', milestone: d.milestone === 'true',
            dependencies: d.dependencies ? d.dependencies.split(',').map(s => s.trim()).filter(Boolean) : [],
            metadata: d.metadata ? JSON.parse(d.metadata) : undefined, children: nested ? read(nested) : [] };
    });
    return { nodes: read(root) };
}
export function ProjectNodes(nodes: ProjectNode[]): ProjectNode[] {
    return nodes.flatMap(node => [node, ...ProjectNodes(node.children ?? [])]);
}
export function ProjectElement<K extends keyof HTMLElementTagNameMap>(tag: K, cls: string, text?: string): HTMLElementTagNameMap[K] {
    const el = document.createElement(tag); el.className = cls; if (text !== undefined) el.textContent = text; return el;
}
export function ProjectButton(label: string, action: () => void): HTMLButtonElement {
    const b = ProjectElement('button', 'Project-Button', label); b.type = 'button'; b.onclick = action; return b;
}
export function ProjectTheme(host: HTMLElement, root: HTMLElement, tree: ProjectTree): void {
    root.dataset.theme = host.getAttribute('theme') || tree.theme || 'dark';
}

/** Shared scoped visual language used by both project components. */
export const ProjectStyles = `
arianna-wbs,arianna-gantt,.WBS,.Gantt{display:block;min-width:0;width:100%}
.Project-Shell{--p-bg:#202428;--p-panel:#292d31;--p-input:#171b1e;--p-border:#3b4147;--p-text:#e4e8eb;--p-muted:#9ca6af;--p-accent:#e40c88;background:var(--p-bg);color:var(--p-text);border:1px solid var(--p-border);border-radius:7px;font:12px/1.45 system-ui,sans-serif;overflow:hidden;box-sizing:border-box;width:100%}
.Project-Shell[data-theme="light"]{--p-bg:#f5f6f8;--p-panel:#fff;--p-input:#edf0f3;--p-border:#ccd2d8;--p-text:#29313a;--p-muted:#637080}
.Project-Shell *{box-sizing:border-box}
.Project-Header,.Project-Toolbar{display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--p-panel);border-bottom:1px solid var(--p-border);flex-wrap:wrap}
.Project-Heading{flex:1;min-width:100px}.Project-Title{font-weight:750;font-size:15px}.Project-Subtitle{font-size:11px;color:var(--p-muted)}
.Project-Button{background:var(--p-input);color:var(--p-text);border:1px solid var(--p-border);border-radius:4px;padding:5px 9px;cursor:pointer;font:inherit}
.Project-Button:hover{border-color:var(--p-accent)}.Project-Button:focus-visible{outline:2px solid var(--p-accent);outline-offset:2px}
.Project-Shell input,.Project-Shell select{font:inherit;color:var(--p-text);background:var(--p-input);border:1px solid var(--p-border);padding:5px;border-radius:3px;min-width:0}
.Project-Empty{padding:36px;color:var(--p-muted);text-align:center}.Project-Status{padding:7px 12px;color:var(--p-muted);font-size:11px;border-top:1px solid var(--p-border)}
.WBS-Viewport{overflow:auto;padding:28px;min-height:200px}.WBS-Forest,.WBS-Children{display:flex;align-items:flex-start;justify-content:center;gap:24px;margin:0;padding:0;list-style:none;width:max-content;min-width:100%}
.WBS-Item{display:flex;flex-direction:column;align-items:center;position:relative;list-style:none}
.WBS-Children{padding-top:28px;gap:16px}.WBS-Children>.WBS-Item:before{content:'';position:absolute;top:-14px;height:14px;border-left:1px solid var(--p-muted)}
.WBS-Children>.WBS-Item:after{content:'';position:absolute;left:-8px;right:-8px;top:-14px;border-top:1px solid var(--p-muted)}
.WBS-Children>.WBS-Item:first-child:after{left:50%}.WBS-Children>.WBS-Item:last-child:after{right:50%}
.WBS-Children:before{content:'';position:absolute;top:112px;height:14px;border-left:1px solid var(--p-muted)}
.WBS-Card{position:relative;width:196px;height:112px;padding:10px;background:var(--p-panel);border:1px solid var(--p-border);border-top:3px solid var(--node-color,var(--p-accent));border-radius:5px;overflow:hidden;cursor:pointer;box-shadow:0 3px 9px #0002}
.WBS-Card[aria-selected="true"]{outline:2px solid var(--p-accent);outline-offset:2px}.WBS-Card:focus-visible{outline:2px solid var(--p-accent)}
.WBS-Name{font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:4px 0}.WBS-Code{font:10px ui-monospace,monospace;color:var(--p-muted)}
.WBS-Meta{font-size:10px;color:var(--p-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.WBS-Progress{height:3px;background:var(--p-border);margin-top:8px}.WBS-Progress>span{display:block;height:100%;background:var(--node-color,var(--p-accent))}
.WBS-Toggle{position:absolute;right:5px;top:5px;padding:0 5px}.WBS-Outline .WBS-Forest,.WBS-Outline .WBS-Children{display:block;width:auto;min-width:0}.WBS-Outline .WBS-Children{padding:10px 0 0 24px;border-left:1px solid var(--p-border);margin-left:12px}.WBS-Outline .WBS-Item{display:block;margin-bottom:10px}.WBS-Outline .WBS-Card{width:300px}.WBS-Outline .WBS-Children:before,.WBS-Outline .WBS-Item:before,.WBS-Outline .WBS-Item:after{display:none}
`;

interface WBSState { tree: ProjectTree; loaded: boolean; selected: string | null; zoom?: number; view?: 'chart' | 'outline'; }
const states = new WeakMap<HTMLElement, WBSState>();
const state = (host: HTMLElement): WBSState => {
    let s = states.get(host); if (!s) { s = { tree: { nodes: [] }, loaded: false, selected: null }; states.set(host,s); } return s;
};

@Component('arianna-wbs', ProjectStyles, { Shadow: false, Attributes: ['theme','title','height','zoom','view','tree'], Properties: ['tree'] })
export class WBS extends HTMLElement {
    public template = Templates.Template.Html``;
    constructor(options: WBSOptions = {}) { super(); if (options.tree) this.tree = options.tree; for (const k of ['theme','title','height','zoom','view'] as const) if (options[k] !== undefined) this.setAttribute(k,String(options[k])); }
    public onCreated(): void { if (this.isConnected) this.onConnected(); }
    public onConnected(): void { this.load(); this.renderView(); }
    public onAttributeChanged(name: string): void { if (name === 'tree') { const raw=this.getAttribute('tree'); this.tree=raw ? JSON.parse(raw) : {nodes:[]}; } else if (this.isConnected) this.renderView(); }
    public get tree(): ProjectTree { this.load(); return structuredClone(state(this).tree); }
    public set tree(value: ProjectTreeInput) { const next=NormalizeProjectTree(value), s=state(this); s.tree=next; s.loaded=true; s.zoom=undefined; s.view=undefined; if (!ProjectNodes(next.nodes).some(n=>n.id===s.selected)) s.selected=null; if (this.isConnected) this.renderView(); }
    public setTree(value: ProjectTreeInput): this { this.tree=value; return this; }
    public getTree(): ProjectTree { return this.tree; }
    public refreshFromMarkup(): this { state(this).loaded=false; this.load(); this.renderView(); return this; }
    public expandAll(expanded=true): this { this.load(); ProjectNodes(state(this).tree.nodes).forEach(n=>n.expanded=expanded); this.renderView(); return this; }
    public selectNode(id: string): this { const s=state(this), node=ProjectNodes(s.tree.nodes).find(n=>n.id===id); if (!node) throw new RangeError('Unknown WBS node: '+id); s.selected=id; this.renderView(); this.dispatchEvent(new CustomEvent('arianna:wbs-select',{bubbles:true,composed:true,detail:{id,node:structuredClone(node),source:this}})); return this; }
    public toggleNode(id: string): this { const node=ProjectNodes(state(this).tree.nodes).find(n=>n.id===id); if (!node) throw new RangeError('Unknown WBS node: '+id); node.expanded=node.expanded===false; this.renderView(); this.dispatchEvent(new CustomEvent('arianna:wbs-toggle',{bubbles:true,composed:true,detail:{id,expanded:node.expanded,source:this}})); return this; }
    private load(): void { const s=state(this); if (s.loaded) return; const raw=this.getAttribute('tree'); const value=raw ? JSON.parse(raw) : ReadProjectMarkup(this); if (value) s.tree=NormalizeProjectTree(value); s.loaded=true; }
    private renderView(): void {
        if (!this.isConnected) return;
        const s=state(this), t=s.tree, old=Array.from(this.children).find(e=>e.hasAttribute('data-wbs-ui'));
        const scroll=old?.querySelector('.WBS-Viewport');
        const focusId=this.contains(document.activeElement)?(document.activeElement as HTMLElement)?.closest<HTMLElement>('[data-node-id]')?.dataset.nodeId:undefined;
        const root=ProjectElement('section','Project-Shell'); root.setAttribute('data-wbs-ui',''); ProjectTheme(this,root,t);
        const header=ProjectElement('header','Project-Header'), heading=ProjectElement('div','Project-Heading');
        heading.append(ProjectElement('div','Project-Title',this.getAttribute('title')??t.title??'Work breakdown structure'),ProjectElement('div','Project-Subtitle',t.subtitle??'Hierarchy · work packages'));
        const zoom=Math.max(.35,Math.min(2,Number(s.zoom??this.getAttribute('zoom')??t.zoom??1)||1));
        const view=s.view??this.getAttribute('view')??t.view??'chart';
        header.append(heading,ProjectButton('Expand all',()=>this.expandAll()),ProjectButton('Collapse all',()=>this.expandAll(false)),ProjectButton(view==='chart'?'Outline':'Chart',()=>{s.view=view==='chart'?'outline':'chart';this.renderView();}),ProjectButton('−',()=>{s.zoom=zoom-.1;this.renderView();}),ProjectElement('span','',Math.round(zoom*100)+'%'),ProjectButton('+',()=>{s.zoom=zoom+.1;this.renderView();}));
        const viewport=ProjectElement('div','WBS-Viewport'+(view==='outline'?' WBS-Outline':'')); viewport.style.maxHeight=Math.max(180,Number(this.getAttribute('height')??t.height??600)||600)+'px';
        const forest=ProjectElement('ul','WBS-Forest'); forest.setAttribute('role','tree'); forest.setAttribute('aria-label',t.title??'Work breakdown structure'); forest.style.setProperty('zoom',String(zoom));
        const render=(nodes:ProjectNode[],parent:HTMLElement,prefix:string,depth:number)=>nodes.forEach((node,i)=>{
            const code=prefix ? prefix+'.'+(i+1) : String(i+1), li=ProjectElement('li','WBS-Item'); li.setAttribute('role','none');
            const card=ProjectElement('div','WBS-Card'); card.tabIndex=0; card.setAttribute('role','treeitem'); card.setAttribute('aria-level',String(depth)); card.setAttribute('aria-selected',String(s.selected===node.id)); card.dataset.nodeId=node.id; card.title=node.description??node.title;
            if(node.color) card.style.setProperty('--node-color',node.color);
            card.append(ProjectElement('div','WBS-Code',code+' · '+node.id),ProjectElement('div','WBS-Name',node.title),ProjectElement('div','WBS-Meta',[node.owner,node.status].filter(Boolean).join(' · ')));
            const progress=ProjectElement('div','WBS-Progress'), fill=ProjectElement('span',''); fill.style.width=(node.progress??0)+'%'; progress.append(fill); progress.title=(node.progress??0)+'%'; card.append(progress);
            card.onclick=()=>this.selectNode(node.id);
            card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();this.selectNode(node.id);} if(e.key==='ArrowRight'&&node.expanded===false||e.key==='ArrowLeft'&&node.expanded!==false){e.preventDefault();this.toggleNode(node.id);}};
            if(node.children?.length){card.setAttribute('aria-expanded',String(node.expanded!==false));const toggle=ProjectButton(node.expanded===false?'▸':'▾',()=>this.toggleNode(node.id));toggle.classList.add('WBS-Toggle');toggle.setAttribute('aria-label','Toggle '+node.title);toggle.onclick=e=>{e.stopPropagation();this.toggleNode(node.id);};card.append(toggle);}
            li.append(card);parent.append(li);
            if(node.children?.length&&node.expanded!==false){const children=ProjectElement('ul','WBS-Children');children.setAttribute('role','group');li.append(children);render(node.children,children,code,depth+1);}
        });
        render(t.nodes,forest,'',1);viewport.append(t.nodes.length?forest:ProjectElement('div','Project-Empty','No work packages. Supply a tree or declarative markup.'));
        root.append(header,viewport,ProjectElement('footer','Project-Status',ProjectNodes(t.nodes).length+' nodes'+(s.selected?' · Selected '+s.selected:'')));
        if(old)old.replaceWith(root);else this.appendChild(root);if(scroll){viewport.scrollLeft=scroll.scrollLeft;viewport.scrollTop=scroll.scrollTop;}
        if(focusId)Array.from(root.querySelectorAll<HTMLElement>('[data-node-id]')).find(e=>e.dataset.nodeId===focusId)?.focus({preventScroll:true});
    }
}
export default WBS;

/**
 * @module components/composite/Workflow
 * @author Riccardo Angeli
 * @version 2.2.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license MIT / Commercial (dual license)
 * @description n8n-inspired schema-driven AriannA workflow editor with draggable module palette.
 */
import { Component, Css, Templates } from '../../core/index.ts';

const html = Templates.Template.Html;

export namespace NodeEditor
{
    export namespace Types
    {
        export type Theme = 'dark' | 'light';
        export type WireStatus = 'connected-ok' | 'connected-warn' | 'connected-error';
        export type RunState = 'idle' | 'running' | 'paused';
        export type TypeCheckFn = (srcType: string, dstType: string) => WireStatus | null;
    }

    export namespace Interfaces
    {
        export interface PortSpec { id: string; type: string; label?: string; }

        export interface ParamSpec
        {
            id: string;
            type: 'number' | 'string' | 'boolean' | 'enum';
            label?: string;
            default?: unknown;
            min?: number;
            max?: number;
            options?: string[];
        }

        export interface NodeSchema
        {
            type: string;
            name: string;
            category: string;
            color?: string;
            icon?: string;
            inputs: PortSpec[];
            outputs: PortSpec[];
            params?: ParamSpec[];
            description?: string;
        }

        export interface NodeInstance
        {
            id: string;
            type: string;
            x: number;
            y: number;
            schema: NodeSchema;
            params?: Record<string, unknown>;
        }

        export interface WireInstance
        {
            id: string;
            srcNodeId: string;
            srcPortId: string;
            srcType: string;
            dstNodeId: string;
            dstPortId: string;
            dstType: string;
            status: Types.WireStatus;
        }

        export interface NodeEditorOptions
        {
            schemas?: NodeSchema[];
            typeCheck?: Types.TypeCheckFn;
            theme?: Types.Theme;
            nodes?: NodeInstance[];
            wires?: WireInstance[];
        }
    }

    // No built-in node catalog: applications and Playground provide schemas explicitly.

    export const Styles = new Css.Stylesheet([
        new Css.Rule('.NodeEditor', {
            Background: '#202428', Border: '1px solid #121517', BorderRadius: '8px',
            BoxSizing: 'border-box', Color: '#e5e8ea', Display: 'block',
            FontFamily: 'var(--arianna-font,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif)',
            Height: '640px', MaxWidth: '100%', MinWidth: '0', Overflow: 'hidden', Width: '100%'
        }),
        new Css.Rule('.NodeEditor-Shell', {
            Display: 'grid', GridTemplateRows: '38px minmax(0,1fr)', Height: '100%', MinHeight: '0'
        }),
        new Css.Rule('.NodeEditor-Toolbar', {
            AlignItems: 'center', Background: 'linear-gradient(180deg,#363b40,#25292d)',
            BorderBottom: '1px solid #111417', Display: 'flex', Gap: '4px', Padding: '5px 7px', OverflowX:'auto'
        }),
        new Css.Rule('.NodeEditor-Title', { FontSize: '11px', FontWeight: '760', MarginRight: '5px' }),
        new Css.Rule('.NodeEditor-State', {
            Color: '#8d969e', Font: '9px/1 var(--arianna-font,system-ui,sans-serif)', MarginRight: 'auto'
        }),
        new Css.Rule('.NodeEditor-Button', {
            Appearance: 'none', Background: 'linear-gradient(180deg,#444a50,#30353a)',
            Border: '1px solid #15181a', BorderRadius: '3px', Color: '#dce0e3',
            Cursor: 'pointer', Font: '700 9px/1 var(--arianna-font,system-ui,sans-serif)',
            Height: '25px', Padding: '0 7px', FlexShrink:'0'
        }),
        new Css.Rule('.NodeEditor-Button:disabled', { Opacity: '.45', Cursor: 'default' }),
        new Css.Rule('.NodeEditor-Button[data-active="true"]:disabled', {Opacity:'1'}),
        new Css.Rule('.NodeEditor-Button:hover', { Background: 'linear-gradient(180deg,#51585e,#383d42)' }),
        new Css.Rule('.NodeEditor-Button[data-active="true"]', {
            Background:'linear-gradient(180deg,#ff4dad 0%,#e40c88 55%,#b90769 100%)',
            BorderColor:'#e40c88',Color:'#fff',BoxShadow:'inset 0 1px 0 #ffffff35,0 1px 3px #0004'
        }),
        new Css.Rule('.NodeEditor-Button:focus-visible,.NodeEditor-Input:focus-visible,.NodeEditor-PaletteSearch:focus-visible', {Outline:'2px solid #e40c88',OutlineOffset:'2px'}),

        /*
         * Playground-like LEFT PANE | WORKSPACE | INSPECTOR
         */
        new Css.Rule('.NodeEditor-Body', {
            Display: 'grid', GridTemplateColumns: '190px minmax(0,1fr) 190px', OverflowX:'auto', MinHeight: '0'
        }),
        new Css.Rule('.NodeEditor-Palette', {
            Background: '#1b1e22', BorderRight: '1px solid #111417', Display: 'grid',
            GridTemplateRows: '42px 39px minmax(0,1fr)', MinHeight: '0', MinWidth: '0'
        }),
        new Css.Rule('.NodeEditor-PaletteHeader', {
            AlignItems: 'center', Background: '#202429', BorderBottom: '1px solid #101316',
            Display: 'flex', Gap: '8px', Padding: '0 11px'
        }),
        new Css.Rule('.NodeEditor-PaletteTitle', {
            Color: '#c7cdd2', Font: '800 9px/1 var(--arianna-font,system-ui,sans-serif)',
            LetterSpacing: '.08em', TextTransform: 'uppercase'
        }),
        new Css.Rule('.NodeEditor-PaletteCount', {
            Background: '#111418', Border: '1px solid #343a40', BorderRadius: '9px',
            Color: '#89939c', Font: '700 8px/1 var(--arianna-font,system-ui,sans-serif)',
            MarginLeft: 'auto', MinWidth: '20px', Padding: '3px 5px', TextAlign: 'center'
        }),
        new Css.Rule('.NodeEditor-PaletteSearchWrap', {
            AlignItems: 'center', BorderBottom: '1px solid #111417', Display: 'flex', Padding: '6px 8px'
        }),
        new Css.Rule('.NodeEditor-PaletteSearch', {
            Appearance: 'none', Background: '#121519', Border: '1px solid #343a40',
            BorderRadius: '5px', BoxSizing: 'border-box', Color: '#e4e7ea',
            Font: '9px/1.2 var(--arianna-font,system-ui,sans-serif)', Height: '27px',
            Outline: 'none', Padding: '0 8px', Width: '100%'
        }),
        new Css.Rule('.NodeEditor-PaletteSearch:focus', {
            BorderColor: '#e40c88', BoxShadow: '0 0 0 2px rgba(228,12,136,.12)'
        }),
        new Css.Rule('.NodeEditor-PaletteBody', {
            MinHeight: '0', OverflowY: 'auto', Padding: '5px 6px 10px'
        }),
        new Css.Rule('.NodeEditor-PaletteCategory', { MarginTop: '4px' }),
        new Css.Rule('.NodeEditor-PaletteCategoryHeader', {
            AlignItems: 'center', Color: '#89929a', Display: 'flex',
            Font: '800 8px/1 var(--arianna-font,system-ui,sans-serif)',
            LetterSpacing: '.04em', Padding: '7px 5px 5px', TextTransform: 'uppercase'
        }),
        new Css.Rule('.NodeEditor-PaletteCategoryCount', {
            Color: '#626b73', FontWeight: '700', MarginLeft: 'auto'
        }),
        new Css.Rule('.NodeEditor-Module', {
            AlignItems: 'center', Background: '#22272c', Border: '1px solid transparent',
            BorderRadius: '5px', Cursor: 'grab', Display: 'grid', Gap: '8px',
            GridTemplateColumns: '29px minmax(0,1fr)', MarginBottom: '3px',
            Padding: '6px', UserSelect: 'none'
        }),
        new Css.Rule('.NodeEditor-Module:hover', {
            Background: '#292f34', BorderColor: '#444b52'
        }),
        new Css.Rule('.NodeEditor-Module[data-dragging="true"]', {
            BorderColor: '#e40c88', BoxShadow: '0 0 0 2px rgba(228,12,136,.12)', Opacity: '.72'
        }),
        new Css.Rule('.NodeEditor-ModuleIcon', {
            AlignItems: 'center', Background: 'var(--module-color,#e40c88)', BorderRadius: '5px',
            Color: '#fff', Display: 'flex', Font: '800 10px/1 var(--arianna-font,system-ui,sans-serif)',
            Height: '27px', JustifyContent: 'center', Overflow: 'hidden', Width: '27px'
        }),
        new Css.Rule('.NodeEditor-ModuleName', {
            Color: '#dce1e5', Font: '720 9px/1.15 var(--arianna-font,system-ui,sans-serif)',
            Overflow: 'hidden', TextOverflow: 'ellipsis', WhiteSpace: 'nowrap'
        }),
        new Css.Rule('.NodeEditor-ModuleDescription', {
            Color: '#78828b', Font: '8px/1.25 var(--arianna-font,system-ui,sans-serif)',
            MarginTop: '2px', Overflow: 'hidden', TextOverflow: 'ellipsis', WhiteSpace: 'nowrap'
        }),
        new Css.Rule('.NodeEditor-PaletteEmpty', {
            Color: '#77818a', Font: '9px/1.4 var(--arianna-font,system-ui,sans-serif)',
            Padding: '14px 8px', TextAlign: 'center'
        }),

        new Css.Rule('.NodeEditor-Workspace', {
            BackgroundColor: '#1b1f22',
            BackgroundImage: 'radial-gradient(circle,#3a4045 1px,transparent 1px)',
            BackgroundSize: '20px 20px', MinWidth: '260px', Overflow: 'auto', Position: 'relative'
        }),
        new Css.Rule('.NodeEditor-Workspace[data-drag-over="true"]', {
            BoxShadow: 'inset 0 0 0 2px #e40c88'
        }),
        new Css.Rule('.NodeEditor-Workspace::after', {
            Background: 'radial-gradient(circle at 50% 45%,transparent 0 45%,rgba(0,0,0,.18) 100%)',
            Content: '""', Inset: '0', PointerEvents: 'none', Position: 'absolute'
        }),
        new Css.Rule('.NodeEditor-Wires', {
            Height: '100%', Inset: '0', Overflow: 'visible', PointerEvents: 'none',
            Position: 'absolute', Width: '100%', ZIndex: '1'
        }),
        new Css.Rule('.NodeEditor-Wire', { Fill: 'none', Stroke: '#4eb0a5', StrokeWidth: '2',StrokeLinejoin:'round',StrokeLinecap:'round' }),
        new Css.Rule('.NodeEditor-Wire[data-status="connected-warn"]', { Stroke: '#d7aa39' }),
        new Css.Rule('.NodeEditor-Wire[data-status="connected-error"]', { Stroke: '#e45656' }),
        new Css.Rule('.NodeEditor-Node', {
            Background: '#2a2f33', Border: '1px solid #43494e', BorderRadius: '10px',
            BoxShadow: '0 7px 18px rgba(0,0,0,.28)', Width:'174px', MinWidth: '174px', BoxSizing:'border-box',
            Position: 'absolute', UserSelect: 'none', ZIndex: '2'
        }),
        new Css.Rule('.NodeEditor-Node[data-selected="true"]', {
            BorderColor: '#e40c88',
            BoxShadow: '0 0 0 2px rgba(228,12,136,.16),0 8px 20px rgba(0,0,0,.32)'
        }),
        new Css.Rule('.NodeEditor-NodeHeader', {
            AlignItems: 'center', Display: 'grid', Gap: '8px',
            GridTemplateColumns: '32px 1fr auto', Padding: '9px 10px 7px'
        }),
        new Css.Rule('.NodeEditor-NodeIcon', {
            AlignItems: 'center', Background: 'var(--node-color,#e40c88)', BorderRadius: '8px',
            BoxShadow: 'inset 0 1px 0 rgba(255,255,255,.22)', Color: '#fff',
            Display: 'flex', FontSize: '13px', Height: '30px', JustifyContent: 'center', Width: '30px'
        }),
        new Css.Rule('.NodeEditor-NodeName', { FontSize: '10px', FontWeight: '760' }),
        new Css.Rule('.NodeEditor-NodeType', { Color: '#8f979f', FontSize: '8px', MarginTop: '2px' }),
        new Css.Rule('.NodeEditor-NodeMenu', { Color: '#8f979f', FontSize: '14px' }),
        new Css.Rule('.NodeEditor-NodeBody', {
            BorderTop: '1px solid #3a4045', Color: '#aab1b7', FontSize: '8.5px',
            LineHeight: '1.35', Padding: '7px 10px 9px'
        }),
        new Css.Rule('.NodeEditor-Port', {
            AlignItems: 'center', Display: 'flex', FontSize: '8px', Gap: '5px',
            Position: 'absolute', Top: '50%', Transform: 'translateY(-50%)'
        }),
        new Css.Rule('.NodeEditor-Port[data-side="in"]', { Left: '-7px' }),
        new Css.Rule('.NodeEditor-Port[data-side="out"]', { Right: '-7px' }),
        new Css.Rule('.NodeEditor-PortDot', {
            Background: '#202428', Border: '2px solid #4eb0a5', BorderRadius: '50%',
            BoxShadow: '0 0 0 2px #1b1f22', Height: '9px', Width: '9px'
        }),
        new Css.Rule('.NodeEditor-Add', {
            AlignItems: 'center', Appearance: 'none', Background: '#2a2f33',
            Border: '1px solid #4a5056', BorderRadius: '50%', Color: '#c8ced3',
            Cursor: 'pointer', Display: 'flex', FontSize: '16px', Height: '34px',
            JustifyContent: 'center', Position: 'absolute', Width: '34px', ZIndex: '3'
        }),

        new Css.Rule('.NodeEditor-Inspector', {
            Background: '#24282c', BorderLeft: '1px solid #111417', Display: 'grid',
            GridTemplateRows: '44px 1fr', MinHeight: '0'
        }),
        new Css.Rule('.NodeEditor-InspectorHeader', {
            AlignItems: 'center', Background: 'linear-gradient(180deg,#33383d,#292d31)',
            BorderBottom: '1px solid #15181a', Display: 'flex', FontSize: '10px',
            FontWeight: '760', Padding: '0 11px'
        }),
        new Css.Rule('.NodeEditor-InspectorBody', { OverflowY: 'auto', Padding: '10px' }),
        new Css.Rule('.NodeEditor-SectionTitle', {
            Color: '#7f8890', FontSize: '8px', FontWeight: '800',
            LetterSpacing: '.09em', Margin: '9px 0 6px', TextTransform: 'uppercase'
        }),
        new Css.Rule('.NodeEditor-Info', {
            Background: '#1c2024', Border: '1px solid #353a40', BorderRadius: '6px',
            FontSize: '9px', LineHeight: '1.4', Padding: '8px'
        }),
        new Css.Rule('.NodeEditor-Param', { Display: 'grid', Gap: '4px', MarginBottom: '8px' }),
        new Css.Rule('.NodeEditor-Param label', { Color: '#8f979f', FontSize: '8px' }),
        new Css.Rule('.NodeEditor-Input', {
            Appearance: 'none', Background: '#171b1e', Border: '1px solid #40464c',
            BorderRadius: '4px', Color: '#e0e4e7',
            Font: '9px/1.2 var(--arianna-font,system-ui,sans-serif)',
            Outline: 'none', Padding: '7px'
        }),
        new Css.Rule('.NodeEditor-Input:focus', {
            BorderColor: '#e40c88', BoxShadow: '0 0 0 2px rgba(228,12,136,.13)'
        }),

        new Css.Rule('.NodeEditor[theme="light"]', {
            Background: '#eef0f2', BorderColor: '#b9bec3', Color: '#25292d'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Toolbar,.NodeEditor[theme="light"] .NodeEditor-InspectorHeader', {
            Background: 'linear-gradient(180deg,#fff,#e1e4e7)', BorderColor: '#b9bec3'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Button', {
            Background: 'linear-gradient(180deg,#f9fbfc,#e0e4e7)', BorderColor: '#b8bdc2', Color: '#25292d'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Palette', {
            Background: '#f4f5f6', BorderColor: '#bcc1c5'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-PaletteHeader', {
            Background: '#e8ebed', BorderColor: '#c6cacf'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-PaletteTitle', { Color: '#4b545c' }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-PaletteCount', {
            Background: '#fff', BorderColor: '#c6cbd0', Color: '#667079'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-PaletteSearchWrap', { BorderColor: '#c7ccd0' }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-PaletteSearch', {
            Background: '#fff', BorderColor: '#c6cbd0', Color: '#30363b'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-PaletteCategoryHeader', { Color: '#6e7881' }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Module', {
            Background: '#fff', BorderColor: '#d7dbde'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Module:hover', {
            Background: '#f7f8f9', BorderColor: '#aeb5bb'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-ModuleName', { Color: '#333a40' }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-ModuleDescription', { Color: '#7a838b' }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Workspace', {
            BackgroundColor: '#fafafa',
            BackgroundImage: 'radial-gradient(circle,#d1d5d8 1px,transparent 1px)'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Node', {
            Background: '#fff', BorderColor: '#c6cbd0', BoxShadow: '0 6px 16px rgba(0,0,0,.12)'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-NodeBody', {
            BorderTopColor: '#e2e4e6', Color: '#626970'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Inspector', {
            Background: '#e5e8ea', BorderColor: '#bcc1c5'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Info,.NodeEditor[theme="light"] .NodeEditor-Input', {
            Background: '#fff', BorderColor: '#c5cacf', Color: '#30363b'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Button[data-active="true"]', {Background:'linear-gradient(180deg,#ff4dad 0%,#e40c88 55%,#b90769 100%)',BorderColor:'#e40c88',Color:'#fff'}),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-State,.NodeEditor[theme="light"] .NodeEditor-SectionTitle,.NodeEditor[theme="light"] .NodeEditor-Param label', {Color:'#626a71'}),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-PortDot', {Background:'#fff',BoxShadow:'0 0 0 2px #eef0f2'}),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Add', {Background:'linear-gradient(180deg,#f9fbfc,#e0e4e7)',BorderColor:'#b8bdc2',Color:'#25292d'}),
        new Css.Rule('.NodeEditor[state="running"] .NodeEditor-Wire,.NodeEditor[state="paused"] .NodeEditor-Wire', {StrokeDasharray:'6 4'}),
        new Css.Rule('.NodeEditor[state="running"] .NodeEditor-Workspace', {BoxShadow:'inset 0 0 0 1px #e40c8855'})

    ]);

    @Component('arianna-node-editor', Styles, {
        Shadow: false,
        Attributes: ['theme', 'state'],
        Properties: ['schemas', 'nodes', 'wires']
    })
    export class NodeEditor extends HTMLDivElement
    {
        public static readonly Styles = Styles;
        public template = html``;

        private _schemas: Interfaces.NodeSchema[] = [];
        private _nodes: Interfaces.NodeInstance[] = [];
        private _wires: Interfaces.WireInstance[] = [];
        private _state: Types.RunState = 'idle';
        private _selected: string | null = null;
        private _typeCheck: Types.TypeCheckFn = (a, b) => a === b ? 'connected-ok' : 'connected-warn';
        private _drag: { id: string; dx: number; dy: number } | null = null;
        private _runController: AbortController | null = null;
        private _createdFrame: number | null = null;
        private _resizeObserver:ResizeObserver|null=null;

        private EnsureState(): void
        {
            if(!Array.isArray(this._schemas)) this._schemas = [];
            if(!Array.isArray(this._nodes)) this._nodes = [];
            if(!Array.isArray(this._wires)) this._wires = [];
            if(this._state !== 'idle' && this._state !== 'running' && this._state !== 'paused') this._state = 'idle';
            if(typeof this._selected !== 'string' && this._selected !== null) this._selected = null;
            if(typeof this._typeCheck !== 'function') this._typeCheck = (a, b) => a === b ? 'connected-ok' : 'connected-warn';
            if(this._drag === undefined) this._drag = null;
        }

        constructor(options: Interfaces.NodeEditorOptions = {})
        {
            super();

            if(options.theme) this.setAttribute('theme', options.theme);
            if(options.schemas) this._schemas = options.schemas;
            if(options.typeCheck) this._typeCheck = options.typeCheck;
            if(options.nodes) this._nodes = options.nodes;
            if(options.wires) this._wires = options.wires;
        }

        public onCreated(): void
        {
            if(this._createdFrame != null) cancelAnimationFrame(this._createdFrame);
            this._createdFrame = requestAnimationFrame(() =>
            {
                this._createdFrame = null;
                if(this.isConnected && !this.querySelector('.NodeEditor-Shell')) this.onConnected();
            });
        }

        public onConnected(): void
        {
            this.EnsureState();
            this.classList.add('NodeEditor');
            if(!this.hasAttribute('theme')) this.setAttribute('theme', 'dark');
            const state=this.getAttribute('state');
            if(state==='running'||state==='paused') this.setRunState(state as Types.RunState);
            this.Render();
        }

        public get schemas(): Interfaces.NodeSchema[]
        {
            this.EnsureState();
            return this._schemas;
        }

        public set schemas(value: Interfaces.NodeSchema[])
        {
            this.EnsureState();
            this._schemas = Array.isArray(value) ? value : [];
            if(this.isConnected) this.Render();
        }

        public get nodes(): Interfaces.NodeInstance[]
        {
            this.EnsureState();
            return this._nodes;
        }

        public set nodes(value: Interfaces.NodeInstance[])
        {
            this.EnsureState();
            this._nodes = Array.isArray(value) ? value : [];
            if(this.isConnected) this.Render();
        }

        public get wires(): Interfaces.WireInstance[]
        {
            this.EnsureState();
            return this._wires;
        }

        public set wires(value: Interfaces.WireInstance[])
        {
            this.EnsureState();
            this._wires = Array.isArray(value) ? value : [];
            if(this.isConnected) this.Render();
        }

        public setSchemas(schemas: Interfaces.NodeSchema[]): this
        {
            this.schemas = schemas;
            return this;
        }

        public setTypeCheck(fn: Types.TypeCheckFn): this
        {
            this.EnsureState();
            if(typeof fn === 'function') this._typeCheck = fn;
            return this;
        }

        public setRunState(state: Types.RunState): this
        {
            this.EnsureState();
            if(state !== 'idle' && state !== 'running' && state !== 'paused')
                throw new TypeError(`Invalid Workflow run state: ${state}`);
            const previous=this._state;
            if(state==='running' && (!this._runController || this._runController.signal.aborted))
                this._runController=new AbortController();
            if(state==='idle')
            {
                this._runController?.abort(new DOMException('Workflow stopped.', 'AbortError'));
                this._runController=null;
                this._drag=null;
            }
            this._state=state;
            if(this.getAttribute('state')!==state) this.setAttribute('state',state);
            this.UpdateRunControls();
            if(previous!==state) this.dispatchEvent(new CustomEvent('arianna:workflow-state', {
                bubbles:true, composed:true,
                detail:{state,previous,signal:this._runController?.signal ?? null,source:this}
            }));
            return this;
        }

        public get runState(): Types.RunState { this.EnsureState(); return this._state; }
        public get RunSignal(): AbortSignal | null { return this._runController?.signal ?? null; }
        public Run(): this { return this.setRunState('running'); }
        public Pause(): this { return this.setRunState('paused'); }
        public Stop(): this { return this.setRunState('idle'); }

        public onDisconnected(): void
        {
            if(this._createdFrame != null) cancelAnimationFrame(this._createdFrame);
            this._createdFrame=null;
            this._resizeObserver?.disconnect();this._resizeObserver=null;
            this.Stop();
        }

        public onUnmount():void {this.onDisconnected();}

        public onAttributeChanged(name: string, _old: string | null, value: string | null): void
        {
            if(name==='state')
            {
                const current=this.getAttribute('state');
                const next=current==='running'||current==='paused'?current:'idle';
                if(next!==this._state) this.setRunState(next);
            }
            else if(name==='theme' && this.isConnected) this.Render();
        }

        private UpdateRunControls(): void
        {
            const status=this.querySelector('.NodeEditor-State');
            if(status) status.textContent=`— ${this._state}`;
            for(const kind of ['run','pause','stop'])
            {
                const button=this.querySelector<HTMLButtonElement>(`.NodeEditor-Button[data-kind="${kind}"]`);
                if(!button) continue;
                button.disabled=kind==='run'?this._state==='running':kind==='pause'?this._state!=='running':this._state==='idle';
                const active=kind==='run'?this._state==='running':kind==='pause'&&this._state==='paused';
                button.dataset.active=String(active);
                if(kind==='stop')button.removeAttribute('aria-pressed');else button.setAttribute('aria-pressed',String(active));
            }
        }

        public addNode(
            type: string,
            x: number,
            y: number,
            id = `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        ): Interfaces.NodeInstance
        {
            this.EnsureState();

            const schema = this._schemas.find(candidate => candidate.type === type) ?? this._schemas[0];
            if(!schema) throw new Error('NodeEditor: no node schema available');

            const node: Interfaces.NodeInstance = {
                id,
                type: schema.type,
                x,
                y,
                schema,
                params: Object.fromEntries((schema.params ?? []).map(param => [param.id, param.default]))
            };

            this._nodes = [...this._nodes, node];
            if(this.isConnected) this.Render();
            return node;
        }

        public removeNode(id: string): void
        {
            this.EnsureState();
            this._nodes = this._nodes.filter(node => node.id !== id);
            this._wires = this._wires.filter(wire => wire.srcNodeId !== id && wire.dstNodeId !== id);
            if(this._selected === id) this._selected = null;
            if(this.isConnected) this.Render();
        }

        public addWire(
            srcNodeId: string,
            srcPortId: string,
            dstNodeId: string,
            dstPortId: string
        ): Interfaces.WireInstance | null
        {
            this.EnsureState();

            const source = this._nodes.find(node => node.id === srcNodeId);
            const destination = this._nodes.find(node => node.id === dstNodeId);
            if(!source || !destination) return null;

            const sourcePort = (source.schema.outputs ?? []).find(port => port.id === srcPortId);
            const destinationPort = (destination.schema.inputs ?? []).find(port => port.id === dstPortId);
            if(!sourcePort || !destinationPort) return null;

            const status = this._typeCheck(sourcePort.type, destinationPort.type) ?? 'connected-error';
            const wire: Interfaces.WireInstance = {
                id: `wire-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                srcNodeId,
                srcPortId,
                srcType: sourcePort.type,
                dstNodeId,
                dstPortId,
                dstType: destinationPort.type,
                status
            };

            this._wires = [...this._wires, wire];
            if(this.isConnected) this.Render();
            return wire;
        }

        public removeWire(id: string): void
        {
            this.EnsureState();
            this._wires = this._wires.filter(wire => wire.id !== id);
            if(this.isConnected) this.Render();
        }

        public export()
        {
            this.EnsureState();
            return {
                nodes: structuredClone(this._nodes),
                wires: structuredClone(this._wires),
                state: this._state
            };
        }

        private Seed(): void
        {
            this.EnsureState();
            if(this._schemas.length === 0) return;

            const positions = [
                { x: 86, y: 115 },
                { x: 330, y: 210 },
                { x: 572, y: 106 },
                { x: 786, y: 255 }
            ];

            this._nodes = this._schemas.slice(0, 4).map((schema, index) => ({
                id: `n${index + 1}`,
                type: schema.type,
                x: positions[index].x,
                y: positions[index].y,
                schema,
                params: Object.fromEntries((schema.params ?? []).map(param => [param.id, param.default]))
            }));

            this._wires = [];

            for(let index = 0; index < this._nodes.length - 1; index++)
            {
                const source = this._nodes[index];
                const destination = this._nodes[index + 1];
                const sourcePort = source.schema.outputs?.[0];
                const destinationPort = destination.schema.inputs?.[0];

                if(!sourcePort || !destinationPort) continue;

                this._wires.push({
                    id: `w${index + 1}`,
                    srcNodeId: source.id,
                    srcPortId: sourcePort.id,
                    srcType: sourcePort.type,
                    dstNodeId: destination.id,
                    dstPortId: destinationPort.id,
                    dstType: destinationPort.type,
                    status: this._typeCheck(sourcePort.type, destinationPort.type) ?? 'connected-error'
                });
            }

            this._selected = this._nodes[Math.min(2, this._nodes.length - 1)]?.id ?? null;
        }

        private CreatePalette(workspace: HTMLElement): HTMLElement
        {
            const palette = document.createElement('aside');
            palette.className = 'NodeEditor-Palette';

            const header = document.createElement('div');
            header.className = 'NodeEditor-PaletteHeader';

            const title = document.createElement('span');
            title.className = 'NodeEditor-PaletteTitle';
            title.textContent = 'Modules';

            const count = document.createElement('span');
            count.className = 'NodeEditor-PaletteCount';
            count.textContent = String(this._schemas.length);

            header.append(title, count);

            const searchWrap = document.createElement('div');
            searchWrap.className = 'NodeEditor-PaletteSearchWrap';

            const search = document.createElement('input');
            search.className = 'NodeEditor-PaletteSearch';
            search.type = 'search';
            search.placeholder = 'Filter modules…';
            search.autocomplete = 'off';
            search.spellcheck = false;

            searchWrap.appendChild(search);

            const body = document.createElement('div');
            body.className = 'NodeEditor-PaletteBody';

            const categories = new Map<string, Interfaces.NodeSchema[]>();

            for(const schema of this._schemas)
            {
                const category = schema.category || 'Other';
                const list = categories.get(category) ?? [];
                list.push(schema);
                categories.set(category, list);
            }

            for(const [categoryName, schemas] of categories)
            {
                const category = document.createElement('section');
                category.className = 'NodeEditor-PaletteCategory';
                category.dataset.category = categoryName.toLowerCase();

                const categoryHeader = document.createElement('div');
                categoryHeader.className = 'NodeEditor-PaletteCategoryHeader';

                const categoryLabel = document.createElement('span');
                categoryLabel.textContent = categoryName;

                const categoryCount = document.createElement('span');
                categoryCount.className = 'NodeEditor-PaletteCategoryCount';
                categoryCount.textContent = String(schemas.length);

                categoryHeader.append(categoryLabel, categoryCount);
                category.appendChild(categoryHeader);

                for(const schema of schemas)
                {
                    const module = document.createElement('div');
                    module.className = 'NodeEditor-Module';
                    module.draggable = true;
                    module.tabIndex = 0;
                    module.setAttribute('role', 'button');
                    module.dataset.schemaType = schema.type;
                    module.dataset.search = `${schema.name} ${schema.category} ${schema.description ?? ''}`.toLowerCase();
                    module.style.setProperty('--module-color', schema.color || '#e40c88');
                    module.title = `Drag ${schema.name} onto the workflow`;

                    const icon = document.createElement('span');
                    icon.className = 'NodeEditor-ModuleIcon';
                    icon.textContent = schema.icon || '◆';

                    const info = document.createElement('div');

                    const name = document.createElement('div');
                    name.className = 'NodeEditor-ModuleName';
                    name.textContent = schema.name;

                    const description = document.createElement('div');
                    description.className = 'NodeEditor-ModuleDescription';
                    description.textContent = schema.description || schema.category;

                    info.append(name, description);
                    module.append(icon, info);

                    module.addEventListener('dragstart', (event: DragEvent) =>
                    {
                        if(!event.dataTransfer) return;
                        event.dataTransfer.effectAllowed = 'copy';
                        event.dataTransfer.setData('application/x-arianna-workflow-node', schema.type);
                        event.dataTransfer.setData('text/plain', schema.type);
                        module.dataset.dragging = 'true';
                    });

                    module.addEventListener('dragend', () =>
                    {
                        delete module.dataset.dragging;
                        delete workspace.dataset.dragOver;
                    });

                    module.addEventListener('dblclick', () =>
                    {
                        const rect = workspace.getBoundingClientRect();
                        const x = Math.max(8, rect.width * .36 - 87);
                        const y = Math.max(8, rect.height * .28 - 26);
                        this.addNode(schema.type, x, y);
                    });

                    module.addEventListener('keydown', (event: KeyboardEvent) =>
                    {
                        if(event.key !== 'Enter' && event.key !== ' ') return;
                        event.preventDefault();
                        const rect = workspace.getBoundingClientRect();
                        this.addNode(
                            schema.type,
                            Math.max(8, rect.width * .36 - 87),
                            Math.max(8, rect.height * .28 - 26)
                        );
                    });

                    category.appendChild(module);
                }

                body.appendChild(category);
            }

            const empty = document.createElement('div');
            empty.className = 'NodeEditor-PaletteEmpty';
            empty.textContent = 'No modules match.';
            empty.hidden = true;
            body.appendChild(empty);

            search.addEventListener('input', () =>
            {
                const query = search.value.trim().toLowerCase();
                let totalVisible = 0;

                body.querySelectorAll<HTMLElement>('.NodeEditor-PaletteCategory').forEach(category =>
                {
                    let categoryVisible = 0;

                    category.querySelectorAll<HTMLElement>('.NodeEditor-Module').forEach(module =>
                    {
                        const visible = !query || (module.dataset.search ?? '').includes(query);
                        module.hidden = !visible;
                        if(visible) categoryVisible++;
                    });

                    category.hidden = categoryVisible === 0;
                    totalVisible += categoryVisible;

                    const categoryCount = category.querySelector<HTMLElement>('.NodeEditor-PaletteCategoryCount');
                    if(categoryCount) categoryCount.textContent = String(categoryVisible);
                });

                count.textContent = String(totalVisible);
                empty.hidden = totalVisible !== 0;
            });

            palette.append(header, searchWrap, body);
            return palette;
        }

        private BindWorkspaceDrop(workspace: HTMLElement): void
        {
            workspace.addEventListener('dragenter', (event: DragEvent) =>
            {
                if(!event.dataTransfer) return;
                event.preventDefault();
                workspace.dataset.dragOver = 'true';
            });

            workspace.addEventListener('dragover', (event: DragEvent) =>
            {
                if(!event.dataTransfer) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = 'copy';
                workspace.dataset.dragOver = 'true';
            });

            workspace.addEventListener('dragleave', (event: DragEvent) =>
            {
                const next = event.relatedTarget as Node | null;
                if(next && workspace.contains(next)) return;
                delete workspace.dataset.dragOver;
            });

            workspace.addEventListener('drop', (event: DragEvent) =>
            {
                event.preventDefault();
                delete workspace.dataset.dragOver;

                const type =
                    event.dataTransfer?.getData('application/x-arianna-workflow-node') ||
                    event.dataTransfer?.getData('text/plain');

                if(!type || !this._schemas.some(schema => schema.type === type)) return;

                const rect = workspace.getBoundingClientRect();
                const x = Math.max(6, Math.min(rect.width - 180, event.clientX - rect.left - 87));
                const y = Math.max(6, Math.min(rect.height - 74, event.clientY - rect.top - 28));

                const node = this.addNode(type, x, y);
                this._selected = node.id;

                this.dispatchEvent(new CustomEvent('arianna:node-drop', {
                    bubbles: true,
                    composed: true,
                    detail: { node, schema: node.schema, x, y, source: this }
                }));
            });
        }

        /** Manhattan routing: straight horizontal/vertical segments with small corner radii. */
        private WirePath(points:Array<{x:number;y:number}>,radius=8):string {
            const clean=points.filter((p,i)=>!i||p.x!==points[i-1].x||p.y!==points[i-1].y);
            if(!clean.length)return '';
            let path=`M ${clean[0].x} ${clean[0].y}`;
            for(let i=1;i<clean.length-1;i++) {
                const a=clean[i-1],b=clean[i],c=clean[i+1],before=Math.hypot(b.x-a.x,b.y-a.y),after=Math.hypot(c.x-b.x,c.y-b.y);
                const r=Math.min(radius,before/2,after/2);
                if(!r||(b.x-a.x)*(c.y-b.y)===(b.y-a.y)*(c.x-b.x)){path+=` L ${b.x} ${b.y}`;continue;}
                const start={x:b.x+(a.x-b.x)*r/before,y:b.y+(a.y-b.y)*r/before};
                const end={x:b.x+(c.x-b.x)*r/after,y:b.y+(c.y-b.y)*r/after};
                path+=` L ${start.x} ${start.y} Q ${b.x} ${b.y} ${end.x} ${end.y}`;
            }
            const last=clean[clean.length-1];return path+` L ${last.x} ${last.y}`;
        }
        private RenderWires():void {
            const workspace=this.querySelector<HTMLElement>('.NodeEditor-Workspace');
            const svg=workspace?.querySelector<SVGSVGElement>('.NodeEditor-Wires');if(!workspace||!svg)return;
            svg.replaceChildren();
            const elements=new Map(Array.from(workspace.querySelectorAll<HTMLElement>('[data-node-id]')).map(el=>[el.dataset.nodeId,el]));
            const width=Math.max(workspace.clientWidth,...this._nodes.map(node=>node.x+(elements.get(node.id)?.offsetWidth||174)+48));
            const height=Math.max(workspace.clientHeight,...this._nodes.map(node=>node.y+(elements.get(node.id)?.offsetHeight||108)+48));
            svg.style.width=width+'px';svg.style.height=height+'px';
            for(const wire of this._wires){
                const src=this._nodes.find(node=>node.id===wire.srcNodeId),dst=this._nodes.find(node=>node.id===wire.dstNodeId);if(!src||!dst)continue;
                const sourceEl=elements.get(src.id),destinationEl=elements.get(dst.id);
                const sw=sourceEl?.offsetWidth||174,sh=sourceEl?.offsetHeight||108,dh=destinationEl?.offsetHeight||108;
                const x1=src.x+sw+2,y1=src.y+sh/2,x2=dst.x-2,y2=dst.y+dh/2;
                let points:Array<{x:number;y:number}>;
                if(x2-x1>=32){const middle=(x1+x2)/2;points=[{x:x1,y:y1},{x:middle,y:y1},{x:middle,y:y2},{x:x2,y:y2}];}
                else {const bottom=Math.max(src.y+sh,dst.y+dh)+28;points=[{x:x1,y:y1},{x:x1+20,y:y1},{x:x1+20,y:bottom},{x:x2-20,y:bottom},{x:x2-20,y:y2},{x:x2,y:y2}];}
                const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',this.WirePath(points));path.setAttribute('class','NodeEditor-Wire');path.setAttribute('data-status',wire.status);path.setAttribute('data-wire-id',wire.id);svg.appendChild(path);
            }
        }

        private Render(): void
        {
            this.EnsureState();

            const shell = document.createElement('section');
            shell.className = 'NodeEditor-Shell';

            const toolbar = document.createElement('header');
            toolbar.className = 'NodeEditor-Toolbar';
            toolbar.innerHTML =
                `<div class="NodeEditor-Title">AriannA Workflow</div>` +
                `<div class="NodeEditor-State">— ${this._state}</div>`;

            const run = document.createElement('button');
            run.className = 'NodeEditor-Button';
            run.dataset.kind = 'run';
            run.textContent = '▶ Play';
            run.type='button';
            run.onclick = () => this.Run();

            const pause = document.createElement('button');
            pause.className = 'NodeEditor-Button';
            pause.type='button';
            pause.dataset.kind='pause';
            pause.textContent = 'Ⅱ Pause';
            pause.onclick = () => this.Pause();

            const stop = document.createElement('button');
            stop.className = 'NodeEditor-Button';
            stop.dataset.kind = 'stop';
            stop.textContent = '■ Stop';
            stop.type='button';
            stop.onclick = () => this.Stop();

            const clear = document.createElement('button');
            clear.type='button';clear.dataset.kind='clear';
            clear.className = 'NodeEditor-Button';
            clear.textContent = 'Clear';
            clear.onclick = () =>
            {
                this.Stop();
                this._nodes = [];
                this._wires = [];
                this._selected = null;
                this.Render();
            };

            const exportButton = document.createElement('button');
            exportButton.type='button';exportButton.dataset.kind='export';
            exportButton.className = 'NodeEditor-Button';
            exportButton.textContent = 'Export JSON';
            exportButton.onclick = () =>
                this.dispatchEvent(new CustomEvent('arianna:export', {
                    bubbles: true,
                    composed: true,
                    detail: this.export()
                }));

            toolbar.append(run, pause, stop, clear, exportButton);

            const body = document.createElement('div');
            body.className = 'NodeEditor-Body';

            const workspace = document.createElement('div');
            workspace.className = 'NodeEditor-Workspace';
            this.BindWorkspaceDrop(workspace);

            const palette = this.CreatePalette(workspace);

            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('class', 'NodeEditor-Wires');

            workspace.appendChild(svg);

            for(const node of this._nodes)
            {
                const element = document.createElement('article');
                element.className = 'NodeEditor-Node';
                element.dataset.nodeId = node.id;
                element.dataset.selected = String(node.id === this._selected);
                element.style.left = `${node.x}px`;
                element.style.top = `${node.y}px`;
                element.style.setProperty('--node-color', node.schema.color || '#e40c88');

                element.innerHTML =
                    `<header class="NodeEditor-NodeHeader">` +
                    `<span class="NodeEditor-NodeIcon">${node.schema.icon || '◆'}</span>` +
                    `<div><div class="NodeEditor-NodeName">${node.schema.name}</div>` +
                    `<div class="NodeEditor-NodeType">${node.schema.category}</div></div>` +
                    `<span class="NodeEditor-NodeMenu">⋮</span></header>` +
                    `<div class="NodeEditor-NodeBody">${node.schema.description || 'Workflow node'}</div>`;

                if((node.schema.inputs ?? []).length)
                {
                    const port = document.createElement('span');
                    port.className = 'NodeEditor-Port';
                    port.dataset.side = 'in';
                    port.innerHTML = '<span class="NodeEditor-PortDot"></span>';
                    element.appendChild(port);
                }

                if((node.schema.outputs ?? []).length)
                {
                    const port = document.createElement('span');
                    port.className = 'NodeEditor-Port';
                    port.dataset.side = 'out';
                    port.innerHTML = '<span class="NodeEditor-PortDot"></span>';
                    element.appendChild(port);
                }

                element.addEventListener('pointerdown', (event: PointerEvent) =>
                {
                    this._selected = node.id;
                    element.dataset.selected = 'true';

                    const rect = element.getBoundingClientRect();
                    this._drag = {
                        id: node.id,
                        dx: event.clientX - rect.left,
                        dy: event.clientY - rect.top
                    };

                    element.setPointerCapture(event.pointerId);
                });

                element.addEventListener('pointermove', (event: PointerEvent) =>
                {
                    if(!this._drag || this._drag.id !== node.id) return;

                    const rect = workspace.getBoundingClientRect();
                    node.x = Math.max(5, event.clientX - rect.left - this._drag.dx);
                    node.y = Math.max(5, event.clientY - rect.top - this._drag.dy);
                    element.style.left = `${node.x}px`;
                    element.style.top = `${node.y}px`;
                    this.RenderWires();
                });

                element.addEventListener('pointerup', () =>
                {
                    if(this._drag?.id !== node.id) return;
                    this._drag = null;
                    this.Render();
                });

                workspace.appendChild(element);
            }

            const add = document.createElement('button');
            add.type='button';
            add.className = 'NodeEditor-Add';
            add.textContent = '＋';
            add.title = 'Add first module';
            add.style.left = '28px';
            add.style.bottom = '26px';
            add.onclick = () =>
            {
                const schema = this._schemas[0];
                if(schema) this.addNode(schema.type, 120, 150);
            };
            workspace.appendChild(add);

            const inspector = document.createElement('aside');
            inspector.className = 'NodeEditor-Inspector';

            const inspectorHeader = document.createElement('div');
            inspectorHeader.className = 'NodeEditor-InspectorHeader';
            inspectorHeader.textContent = 'Node';

            const inspectorBody = document.createElement('div');
            inspectorBody.className = 'NodeEditor-InspectorBody';

            const selected = this._nodes.find(node => node.id === this._selected);

            if(selected)
            {
                inspectorBody.innerHTML =
                    `<div class="NodeEditor-SectionTitle">Selected node</div>` +
                    `<div class="NodeEditor-Info"><strong>${selected.schema.name}</strong><br>` +
                    `${selected.schema.description || ''}<br><br>ID: ${selected.id}</div>` +
                    `<div class="NodeEditor-SectionTitle">Parameters</div>`;

                for(const param of selected.schema.params ?? [
                    { id: 'label', type: 'string' as const, label: 'Label', default: selected.schema.name }
                ])
                {
                    const row = document.createElement('div');
                    row.className = 'NodeEditor-Param';

                    const label = document.createElement('label');
                    label.textContent = param.label || param.id;

                    const input = document.createElement('input');
                    input.className = 'NodeEditor-Input';
                    input.value = String(selected.params?.[param.id] ?? param.default ?? '');
                    input.onchange = () =>
                    {
                        (selected.params ??= {})[param.id] = input.value;
                    };

                    row.append(label, input);
                    inspectorBody.appendChild(row);
                }
            }
            else
            {
                inspectorBody.innerHTML =
                    '<div class="NodeEditor-Info">Select a node to inspect its properties.</div>';
            }

            inspector.append(inspectorHeader, inspectorBody);
            body.append(palette, workspace, inspector);
            shell.append(toolbar, body);
            this.replaceChildren(shell);
            this.UpdateRunControls();
            this.RenderWires();
            this._resizeObserver?.disconnect();
            this._resizeObserver=typeof ResizeObserver==='function'?new ResizeObserver(()=>this.RenderWires()):null;
            this._resizeObserver?.observe(workspace);
        }
    }
}

export type NodeEditorOptions = NodeEditor.Interfaces.NodeEditorOptions;
export type NodeSchema = NodeEditor.Interfaces.NodeSchema;
export type NodeInstance = NodeEditor.Interfaces.NodeInstance;
export type WireInstance = NodeEditor.Interfaces.WireInstance;
export type PortSpec = NodeEditor.Interfaces.PortSpec;
export type ParamSpec = NodeEditor.Interfaces.ParamSpec;
export type RunState = NodeEditor.Types.RunState;
export type WireStatus = NodeEditor.Types.WireStatus;
export type TypeCheckFn = NodeEditor.Types.TypeCheckFn;

/** Canonical public name for the workflow editor. The legacy NodeEditor namespace/tag remains compatible. */
export const Workflow = NodeEditor.NodeEditor;
export type WorkflowOptions = NodeEditor.Interfaces.NodeEditorOptions;

export default Workflow;

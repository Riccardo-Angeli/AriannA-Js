/** @module components/graphics/2D/Canvas2D */
import { Component, Css, Templates, Real } from '../../../core/index.ts';

const html = Templates.Template.Html;
const CanvasTemplate = html``;

export namespace Canvas2D
{
    export namespace Interfaces
    {
        export interface Vec2 { x:number; y:number; }

        export interface GridOptions
        {
            enabled:boolean;
            size:number;
            subdivisions:number;
            majorEvery:number;
            minorOpacity:number;
            majorOpacity:number;
        }

        export interface SnapOptions
        {
            enabled:boolean;
            grid:boolean;
            threshold:number;
            x:boolean;
            y:boolean;
        }

        export interface Canvas2DOptions
        {
            width?:number|string;
            height?:number|string;
            zoom?:number;
            pan?:Vec2;
            grid?:Partial<GridOptions>|boolean;
            snap?:Partial<SnapOptions>|boolean;
            theme?:'dark'|'light';
        }

        export interface ViewportState
        {
            panX:number;
            panY:number;
            zoom:number;
        }
    }

    const DEFAULT_GRID:Interfaces.GridOptions = {
        enabled:true,
        size:20,
        subdivisions:4,
        majorEvery:5,
        minorOpacity:.10,
        majorOpacity:.20
    };

    const DEFAULT_SNAP:Interfaces.SnapOptions = {
        enabled:true,
        grid:true,
        threshold:8,
        x:true,
        y:true
    };

    export const Styles = new Css.Stylesheet([
        new Css.Rule('.Canvas2D',{
            Background:'var(--arianna-surface-2,#202428)',
            Border:'1px solid var(--arianna-border,#121517)',
            BorderRadius:'8px',BoxSizing:'border-box',
            Color:'var(--arianna-text,#e5e8ea)',Display:'block',
            FontFamily:'var(--arianna-font,system-ui,sans-serif)',
            Height:'420px',MaxWidth:'100%',MinWidth:'0',Overflow:'hidden',Width:'100%'
        }),
        new Css.Rule('.Canvas2D-Shell',{
            Display:'grid',GridTemplateRows:'38px minmax(0,1fr) 24px',Height:'100%'
        }),
        new Css.Rule('.Canvas2D-Toolbar',{
            AlignItems:'center',
            Background:'linear-gradient(180deg,var(--arianna-surface-3,#363b40),var(--arianna-surface-2,#25292d))',
            BorderBottom:'1px solid var(--arianna-border,#111417)',
            Display:'flex',Gap:'4px',Padding:'5px 7px'
        }),
        new Css.Rule('.Canvas2D-Button',{
            Appearance:'none',
            Background:'linear-gradient(180deg,var(--arianna-button-top,#444a50),var(--arianna-button-bottom,#30353a))',
            Border:'1px solid var(--arianna-border,#15181a)',BorderRadius:'3px',
            Color:'var(--arianna-text,#dce0e3)',Cursor:'pointer',
            Font:'700 9px/1 var(--arianna-font,system-ui,sans-serif)',
            Height:'25px',MinWidth:'27px',Padding:'0 7px'
        }),
        new Css.Rule('.Canvas2D-Button[data-active="true"]',{
            BorderColor:'var(--arianna-accent,#e40c88)',
            Color:'var(--arianna-accent-light,#ff6dbb)'
        }),
        new Css.Rule('.Canvas2D-Zoom',{Color:'var(--arianna-text-muted,#9ea6ad)',FontSize:'9px',MarginLeft:'auto'}),
        new Css.Rule('.Canvas2D-Stage',{
            BackgroundColor:'var(--arianna-canvas-bg,#1b1f22)',
            Overflow:'hidden',Position:'relative',TouchAction:'none'
        }),
        new Css.Rule('.Canvas2D-Grid',{
            Inset:'0',PointerEvents:'none',Position:'absolute'
        }),
        new Css.Rule('.Canvas2D-Artboard',{
            Background:'var(--arianna-artboard,#f9f9f9)',
            Border:'1px solid #0e1012',BoxShadow:'0 6px 25px rgba(0,0,0,.38)',
            Height:'300px',Left:'50%',Position:'absolute',Top:'50%',
            Transform:'translate(-50%,-50%) translate(var(--pan-x,0px),var(--pan-y,0px)) scale(var(--zoom,1))',
            TransformOrigin:'50% 50%',Width:'520px'
        }),
        new Css.Rule('.Canvas2D-World',{
            Height:'100%',Left:'0',Overflow:'visible',Position:'absolute',Top:'0',Width:'100%'
        }),
        new Css.Rule('.Canvas2D-Status',{
            AlignItems:'center',Background:'var(--arianna-surface-2,#24282c)',
            BorderTop:'1px solid var(--arianna-border,#111417)',
            Color:'var(--arianna-text-muted,#8f979f)',Display:'flex',
            FontSize:'8px',Gap:'12px',Padding:'0 8px'
        }),
        new Css.Rule('.Canvas2D-Status .Canvas2D-Button',{Height:'20px'}),
        new Css.Rule('.Canvas2D[theme="light"]',{
            Background:'#eef0f2',BorderColor:'#b9bec3',Color:'#25292d'
        }),
        new Css.Rule('.Canvas2D[theme="light"] .Canvas2D-Stage',{BackgroundColor:'#eef0f2'}),
        new Css.Rule('.Canvas2D[theme="light"] .Canvas2D-Status',{
            Background:'#e4e7e9',BorderTopColor:'#c3c8cc',Color:'#626a71'
        })
    ]);

    @Component('arianna-canvas-2d',Styles,{
        Shadow:false,
        Attributes:[
            'theme','zoom',
            'show-grid','grid-size','grid-subdivisions','grid-major-every',
            'snap','snap-grid','snap-threshold'
        ],
        Properties:['grid','snap']
    })
    export class Canvas2D extends HTMLElement
    {
        public static readonly Styles=Styles;

        /*
         * Keep the Template on the prototype. AriannA can upgrade an element already
         * created from markup without running this class constructor/field initializers.
         */
        public get template(){ return CanvasTemplate; }

        private _pan!:Interfaces.Vec2;
        private _zoom!:number;
        private _grid!:Interfaces.GridOptions;
        private _snap!:Interfaces.SnapOptions;
        private _drag!:{x:number;y:number;px:number;py:number}|null;
        private _world!:HTMLElement|null;
        private _artboard!:HTMLElement|null;
        private _stage!:HTMLElement|null;
        private _gridLayer!:HTMLElement|null;
        private _status!:HTMLElement|null;
        private _zoomLabel!:HTMLElement|null;

        /**
         * AriannA upgrades markup elements in place. In that path JavaScript class
         * field initializers are not guaranteed to execute, so every public/lifecycle
         * entry point first establishes the complete instance state.
         */
        private EnsureState():void
        {
            const self=this as any;

            if(!self._pan || typeof self._pan.x!=='number' || typeof self._pan.y!=='number')
                self._pan={x:0,y:0};

            if(typeof self._zoom!=='number' || !Number.isFinite(self._zoom))
                self._zoom=1;

            if(!self._grid || typeof self._grid!=='object')
                self._grid={...DEFAULT_GRID};
            else
                self._grid={...DEFAULT_GRID,...self._grid};

            if(!self._snap || typeof self._snap!=='object')
                self._snap={...DEFAULT_SNAP};
            else
                self._snap={...DEFAULT_SNAP,...self._snap};

            if(!('_drag' in self)) self._drag=null;
            if(!('_world' in self)) self._world=null;
            if(!('_artboard' in self)) self._artboard=null;
            if(!('_stage' in self)) self._stage=null;
            if(!('_gridLayer' in self)) self._gridLayer=null;
            if(!('_status' in self)) self._status=null;
            if(!('_zoomLabel' in self)) self._zoomLabel=null;
        }

        constructor(options:Interfaces.Canvas2DOptions={})
        {
            super();
            this.EnsureState();
            if(options.theme) this.setAttribute('theme',options.theme);
            if(options.zoom!=null) this._zoom=options.zoom;
            if(options.pan) this._pan={...options.pan};

            if(typeof options.grid==='boolean') this._grid.enabled=options.grid;
            else if(options.grid) Object.assign(this._grid,options.grid);

            if(typeof options.snap==='boolean') this._snap.enabled=options.snap;
            else if(options.snap) Object.assign(this._snap,options.snap);

            if(options.width!=null)
                this.style.width=typeof options.width==='number'?`${options.width}px`:String(options.width);
            if(options.height!=null)
                this.style.height=typeof options.height==='number'?`${options.height}px`:String(options.height);
        }

        public onCreated():void
        {
            this.EnsureState();
            requestAnimationFrame(()=>{if(this.isConnected)this.onConnected();});
        }

        public onConnected():void
        {
            this.EnsureState();
            this.classList.add('Canvas2D');
            if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');

            this.ReadAttributes();
            if(!this._world) this.Build();
            this.ApplyViewport();
            this.ApplyGrid();
            this.UpdateStatus();
        }

        /** Stable world container. User objects live here and are never destroyed by viewport updates. */
        public get world():HTMLElement
        {
            this.EnsureState();
            if(!this._world) this.Build();
            return this._world!;
        }

        /** Canvas owns the drawing surface. Behaviours receive independent child layers. */
        public get drawingSurface():SVGSVGElement
        {
            const world=this.world;
            let svg=world.querySelector<SVGSVGElement>(':scope > svg[data-canvas-surface]');
            if(!svg) {
                svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
                svg.setAttribute('data-canvas-surface','');
                svg.setAttribute('viewBox','0 0 520 300');
                svg.setAttribute('preserveAspectRatio','none');
                svg.style.cssText='position:absolute;inset:0;width:100%;height:100%;overflow:visible;touch-action:none';
                world.appendChild(svg);
            }
            return svg;
        }

        /** Shared pointer surface used by mode-aware selection behaviours. */
        public get selectionSurface():SVGSVGElement{return this.drawingSurface;}

        public createDrawingLayer():SVGGElement
        {
            const layer=document.createElementNS('http://www.w3.org/2000/svg','g');
            this.drawingSurface.appendChild(layer);
            return layer;
        }

        public removeDrawingLayer(layer:SVGGElement):void
        {
            if(layer.parentNode===this.drawingSurface) layer.remove();
        }

        /** Add content to the world, attaching canvas behaviours through their public contract. */
        public add(...items:Parameters<Real['add']>):this {
            const world=this.world;
            Component.RealFacet(world).add(...items);
            for(const child of Array.from(world.children)) {
                const behaviour=child as HTMLElement & {attach?:(canvas:Canvas2D)=>unknown};
                if(typeof behaviour.attach==='function')behaviour.attach(this);
            }
            return this;
        }

        public get viewport():Interfaces.ViewportState
        {
            this.EnsureState();
            return {panX:this._pan.x,panY:this._pan.y,zoom:this._zoom};
        }

        /** Grid is enabled by default and is programmatically configurable as one object. */
        public get grid():Interfaces.GridOptions { this.EnsureState(); return {...this._grid}; }
        public set grid(value:Partial<Interfaces.GridOptions>)
        {
            this.setGrid(value);
        }

        /** Snap is enabled by default and is programmatically configurable as one object. */
        public get snap():Interfaces.SnapOptions { this.EnsureState(); return {...this._snap}; }
        public set snap(value:Partial<Interfaces.SnapOptions>)
        {
            this.setSnap(value);
        }

        public setGrid(value:Partial<Interfaces.GridOptions>|boolean):this
        {
            this.EnsureState();
            if(typeof value==='boolean') this._grid.enabled=value;
            else Object.assign(this._grid,value);

            this._grid.size=Math.max(1,Number(this._grid.size)||20);
            this._grid.subdivisions=Math.max(1,Math.round(Number(this._grid.subdivisions)||1));
            this._grid.majorEvery=Math.max(1,Math.round(Number(this._grid.majorEvery)||1));
            this.ApplyGrid();
            this.SyncToolbar();
            this.UpdateStatus();
            return this;
        }

        public getGrid():Interfaces.GridOptions { this.EnsureState(); return {...this._grid}; }

        public setSnap(value:Partial<Interfaces.SnapOptions>|boolean):this
        {
            this.EnsureState();
            if(typeof value==='boolean') this._snap.enabled=value;
            else Object.assign(this._snap,value);

            this._snap.threshold=Math.max(0,Number(this._snap.threshold)||0);
            this.SyncToolbar();
            this.UpdateStatus();
            this.dispatchEvent(new CustomEvent('arianna:snap-change',{
                bubbles:true,
                composed:true,
                detail:{...this._snap, effectiveStep:this._snap.enabled && this._snap.grid ? this._grid.size/Math.max(1,this._grid.subdivisions) : 0, source:this}
            }));
            return this;
        }

        public getSnap():Interfaces.SnapOptions { this.EnsureState(); return {...this._snap}; }

        /** Convert an arbitrary world point to the current snap target. */
        public snapPoint(point:Interfaces.Vec2):Interfaces.Vec2
        {
            this.EnsureState();
            if(!this._snap.enabled || !this._snap.grid)
                return {...point};

            const step=this._grid.size/Math.max(1,this._grid.subdivisions);
            return {
                x:this._snap.x?Math.round(point.x/step)*step:point.x,
                y:this._snap.y?Math.round(point.y/step)*step:point.y
            };
        }

        public setZoom(value:number):this
        {
            this.EnsureState();
            this._zoom=Math.max(.2,Math.min(5,Number(value)||1));
            this.ApplyViewport();
            this.UpdateStatus();
            this.EmitViewport();
            return this;
        }

        public panTo(x:number,y:number):this
        {
            this.EnsureState();
            this._pan={x,y};
            this.ApplyViewport();
            this.UpdateStatus();
            this.EmitViewport();
            return this;
        }

        public panBy(dx:number,dy:number):this{this.EnsureState();return this.panTo(this._pan.x+dx,this._pan.y+dy);}
        public zoomTo(z:number):this{return this.setZoom(z);}
        public zoomAt(z:number,_screenPt:Interfaces.Vec2):this{return this.setZoom(z);}

        public screenToWorld(point:Interfaces.Vec2):Interfaces.Vec2
        {
            this.EnsureState();
            return{x:(point.x-this._pan.x)/this._zoom,y:(point.y-this._pan.y)/this._zoom};
        }

        public worldToScreen(point:Interfaces.Vec2):Interfaces.Vec2
        {
            this.EnsureState();
            return{x:point.x*this._zoom+this._pan.x,y:point.y*this._zoom+this._pan.y};
        }

        public fitContent():this
        {
            this.EnsureState();
            this._pan={x:0,y:0};
            this._zoom=1;
            this.ApplyViewport();
            this.UpdateStatus();
            this.EmitViewport();
            return this;
        }

        public getViewport():Interfaces.ViewportState{return this.viewport;}

        private ReadAttributes():void
        {
            this.EnsureState();

            if(this.hasAttribute('zoom'))
                this._zoom=Math.max(.2,Math.min(5,Number(this.getAttribute('zoom'))||1));

            if(this.hasAttribute('show-grid'))
                this._grid.enabled=this.getAttribute('show-grid')!=='false';
            if(this.hasAttribute('grid-size'))
                this._grid.size=Math.max(1,Number(this.getAttribute('grid-size'))||20);
            if(this.hasAttribute('grid-subdivisions'))
                this._grid.subdivisions=Math.max(1,Number(this.getAttribute('grid-subdivisions'))||1);
            if(this.hasAttribute('grid-major-every'))
                this._grid.majorEvery=Math.max(1,Number(this.getAttribute('grid-major-every'))||1);

            if(this.hasAttribute('snap'))
                this._snap.enabled=this.getAttribute('snap')!=='false';
            if(this.hasAttribute('snap-grid'))
                this._snap.grid=this.getAttribute('snap-grid')!=='false';
            if(this.hasAttribute('snap-threshold'))
                this._snap.threshold=Math.max(0,Number(this.getAttribute('snap-threshold'))||0);
        }

        private Build():void
        {
            this.EnsureState();
            const preserved=[...this.children];

            const shell=document.createElement('section');
            shell.className='Canvas2D-Shell';

            const toolbar=document.createElement('header');
            toolbar.className='Canvas2D-Toolbar';

            const home=document.createElement('button');
            home.className='Canvas2D-Button';home.textContent='⌖';home.title='Reset view';
            home.onclick=()=>this.fitContent();

            const minus=document.createElement('button');
            minus.className='Canvas2D-Button';minus.textContent='−';minus.title='Zoom out';
            minus.onclick=()=>this.setZoom(this._zoom-.1);

            const plus=document.createElement('button');
            plus.className='Canvas2D-Button';plus.textContent='＋';plus.title='Zoom in';
            plus.onclick=()=>this.setZoom(this._zoom+.1);

            const gridButton=document.createElement('button');
            gridButton.className='Canvas2D-Button';gridButton.textContent='Grid';
            gridButton.title='Toggle grid';
            gridButton.dataset.role='grid';
            gridButton.onclick=()=>{this.setGrid({enabled:!this._grid.enabled});this.SyncToolbar();};

            const snapButton=document.createElement('button');
            snapButton.className='Canvas2D-Button';snapButton.textContent='Snap';
            snapButton.title='Toggle snap';
            snapButton.dataset.role='snap';
            snapButton.onclick=()=>this.setSnap({enabled:!this._snap.enabled});

            const zoom=document.createElement('div');
            zoom.className='Canvas2D-Zoom';this._zoomLabel=zoom;

            toolbar.append(home,minus,plus,gridButton,snapButton,zoom);

            const stage=document.createElement('div');
            stage.className='Canvas2D-Stage';this._stage=stage;

            const grid=document.createElement('div');
            grid.className='Canvas2D-Grid';this._gridLayer=grid;

            const artboard=document.createElement('div');
            artboard.className='Canvas2D-Artboard';this._artboard=artboard;

            const world=document.createElement('div');
            world.className='Canvas2D-World';this._world=world;
            artboard.appendChild(world);

            stage.append(grid,artboard);

            const status=document.createElement('footer');
            status.className='Canvas2D-Status';this._status=status;
            const statusText=document.createElement('span');statusText.className='Canvas2D-StatusText';
            status.appendChild(statusText);

            shell.append(toolbar,stage,status);
            this.replaceChildren(shell);

            for(const child of preserved)
                if(child!==shell) world.appendChild(child);

            stage.addEventListener('pointerdown',event=>{
                if(event.target!==stage && event.target!==grid)return;
                this._drag={x:event.clientX,y:event.clientY,px:this._pan.x,py:this._pan.y};
                stage.setPointerCapture(event.pointerId);
            });
            stage.addEventListener('pointermove',event=>{
                if(!this._drag)return;
                this._pan={
                    x:this._drag.px+(event.clientX-this._drag.x)/this._zoom,
                    y:this._drag.py+(event.clientY-this._drag.y)/this._zoom
                };
                this.ApplyViewport();this.UpdateStatus();
            });
            stage.addEventListener('pointerup',event=>{
                this._drag=null;
                try{stage.releasePointerCapture(event.pointerId);}catch{}
                this.EmitViewport();
            });
            stage.addEventListener('pointercancel',()=>{this._drag=null;});
            stage.addEventListener('wheel',event=>{
                event.preventDefault();
                this.setZoom(this._zoom*(event.deltaY>0?.92:1.08));
            },{passive:false});

            this.SyncToolbar();
        }

        private ApplyViewport():void
        {
            this.EnsureState();
            this.style.setProperty('--zoom',String(this._zoom));
            this.style.setProperty('--pan-x',`${this._pan.x}px`);
            this.style.setProperty('--pan-y',`${this._pan.y}px`);
            this.ApplyGrid();
            if(this._zoomLabel)this._zoomLabel.textContent=`${Math.round(this._zoom*100)}%`;
        }

        private ApplyGrid():void
        {
            this.EnsureState();
            if(!this._gridLayer)return;

            const minor=this._grid.size/Math.max(1,this._grid.subdivisions);
            const major=this._grid.size*Math.max(1,this._grid.majorEvery);
            this._gridLayer.style.display=this._grid.enabled?'block':'none';
            this._gridLayer.style.backgroundImage=[
                `linear-gradient(to right,rgba(151,160,169,${this._grid.minorOpacity}) 1px,transparent 1px)`,
                `linear-gradient(to bottom,rgba(151,160,169,${this._grid.minorOpacity}) 1px,transparent 1px)`,
                `linear-gradient(to right,rgba(151,160,169,${this._grid.majorOpacity}) 1px,transparent 1px)`,
                `linear-gradient(to bottom,rgba(151,160,169,${this._grid.majorOpacity}) 1px,transparent 1px)`
            ].join(',');
            this._gridLayer.style.backgroundSize=
                `${minor*this._zoom}px ${minor*this._zoom}px,`+
                `${minor*this._zoom}px ${minor*this._zoom}px,`+
                `${major*this._zoom}px ${major*this._zoom}px,`+
                `${major*this._zoom}px ${major*this._zoom}px`;
            this._gridLayer.style.backgroundPosition=
                `${this._pan.x}px ${this._pan.y}px`;
            this.SyncToolbar();
        }

        private SyncToolbar():void
        {
            this.EnsureState();
            this.querySelector<HTMLButtonElement>('[data-role="grid"]')?.setAttribute('data-active',String(this._grid.enabled));
            this.querySelector<HTMLButtonElement>('[data-role="snap"]')?.setAttribute('data-active',String(this._snap.enabled));
        }

        private UpdateStatus():void
        {
            this.EnsureState();
            if(!this._status)return;
            const statusText=this._status.querySelector('.Canvas2D-StatusText');
            if(!statusText)return;
            statusText.textContent=
                `X ${Math.round(this._pan.x)}  Y ${Math.round(this._pan.y)} · `+
                `Grid ${this._grid.enabled?`${this._grid.size}px / ${this._grid.subdivisions}`:'off'} · `+
                `Snap ${this._snap.enabled?'on':'off'}`;
        }

        private EmitViewport():void
        {
            this.EnsureState();
            this.dispatchEvent(new CustomEvent('arianna:viewport',{
                bubbles:true,composed:true,detail:this.viewport
            }));
        }
    }
}

export type Vec2=Canvas2D.Interfaces.Vec2;
export type GridOptions=Canvas2D.Interfaces.GridOptions;
export type SnapOptions=Canvas2D.Interfaces.SnapOptions;
export type Canvas2DOptions=Canvas2D.Interfaces.Canvas2DOptions;
export default Canvas2D.Canvas2D;

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
            tilt?:number;
            navigation?:'none'|'pan'|'zoom'|'tilt';
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
            tilt:number;
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
            Display:'flex',Gap:'4px',Padding:'5px 7px',OverflowX:'auto'
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
            Background:'linear-gradient(180deg,#ff4dad 0%,#e40c88 55%,#b90769 100%)',
            Color:'#ffffff',BoxShadow:'inset 0 1px 0 #ffffff35,0 1px 3px #0004'
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
            Transform:'translate(-50%,-50%) translate(var(--pan-x,0px),var(--pan-y,0px)) scale(var(--zoom,1)) rotate(var(--tilt,0deg))',
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
            'theme','zoom','tilt','navigation',
            'show-grid','grid-size','grid-subdivisions','grid-major-every',
            'snap','snap-grid','snap-threshold'
        ],
        Properties:['grid','snap','tilt','navigation']
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
        private _tilt!:number;
        private _navigation!:'none'|'pan'|'zoom'|'tilt';
        private _gridProvider!:{options?:{enabled?:boolean};configure(options:{enabled:boolean}):unknown}|null;
        private _grid!:Interfaces.GridOptions;
        private _snap!:Interfaces.SnapOptions;
        private _drag!:{x:number;y:number;px:number;py:number;pointerId:number;kind:'pan'|'zoom'|'tilt';zoom:number;tilt:number}|null;
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

            if(!Number.isFinite(self._tilt))self._tilt=0;
            if(!['none','pan','zoom','tilt'].includes(self._navigation))self._navigation='none';
            if(!('_gridProvider' in self))self._gridProvider=null;
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
            if(options.tilt!=null)this._tilt=options.tilt;
            if(options.navigation)this._navigation=options.navigation;
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

        /** Shared stage observed by independent 2D selection behaviours. */
        public get selectionSurface():HTMLElement{this.EnsureState();if(!this._stage)this.Build();return this._stage!;}
        public get tilt():number{this.EnsureState();return this._tilt;}
        public set tilt(value:number){this.setTilt(value);}
        public setTilt(value:number):this {
            if(!Number.isFinite(value))throw new TypeError('Invalid canvas tilt');this.EnsureState();this._tilt=((value+180)%360+360)%360-180;
            this.ApplyViewport();this.UpdateStatus();this.EmitViewport();return this;
        }
        public get navigation():'none'|'pan'|'zoom'|'tilt'{this.EnsureState();return this._navigation;}
        public set navigation(value:'none'|'pan'|'zoom'|'tilt'){this.setNavigation(value);}
        public setNavigation(value:'none'|'pan'|'zoom'|'tilt'):this {
            if(!['none','pan','zoom','tilt'].includes(value))throw new TypeError('Invalid canvas navigation');
            this.EnsureState();if(this._drag){try{this._stage?.releasePointerCapture(this._drag.pointerId);}catch{}this._drag=null;}
            this._navigation=value;this.SyncToolbar();if(this._stage)this._stage.style.cursor=value==='pan'?'grab':value==='zoom'?'zoom-in':value==='tilt'?'crosshair':'';
            this.dispatchEvent(new CustomEvent('arianna:navigation-change',{bubbles:true,composed:true,detail:{navigation:value,source:this}}));return this;
        }
        /** Bind an independent grid without taking ownership of its lifecycle. */
        public useGrid(provider:{options?:{enabled?:boolean};configure(options:{enabled:boolean}):unknown}|null):this {
            this.EnsureState();this._gridProvider=provider;this.ApplyGrid();return this;
        }
        public onUnmount():void{if(this._drag){try{this._stage?.releasePointerCapture(this._drag.pointerId);}catch{}}this._drag=null;}

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
            return {panX:this._pan.x,panY:this._pan.y,zoom:this._zoom,tilt:this._tilt};
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
            this.dispatchEvent(new CustomEvent('arianna:grid-change',{bubbles:true,composed:true,detail:{...this._grid,source:this}}));
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
            const x=(point.x-this._pan.x)/this._zoom,y=(point.y-this._pan.y)/this._zoom;
            return this.RotatePoint({x,y},-this._tilt);
        }

        public worldToScreen(point:Interfaces.Vec2):Interfaces.Vec2
        {
            this.EnsureState();
            const p=this.RotatePoint(point,this._tilt);return{x:p.x*this._zoom+this._pan.x,y:p.y*this._zoom+this._pan.y};
        }

        private RotatePoint(point:Interfaces.Vec2,degrees:number):Interfaces.Vec2 {
            if(degrees===0)return{...point};const cx=(this._artboard?.clientWidth||520)/2,cy=(this._artboard?.clientHeight||300)/2;
            const angle=degrees*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle),x=point.x-cx,y=point.y-cy;
            return{x:cx+x*c-y*s,y:cy+x*s+y*c};
        }
        public fitContent():this
        {
            this.EnsureState();
            this._pan={x:0,y:0};
            this._zoom=1;this._tilt=0;
            this.ApplyViewport();
            this.UpdateStatus();
            this.EmitViewport();
            return this;
        }

        public getViewport():Interfaces.ViewportState{return this.viewport;}

        private ReadAttributes():void
        {
            this.EnsureState();

            if(this.hasAttribute('tilt')){const value=Number(this.getAttribute('tilt'));if(Number.isFinite(value))this._tilt=value;}
            const navigation=this.getAttribute('navigation');if(navigation&&['none','pan','zoom','tilt'].includes(navigation))this._navigation=navigation as typeof this._navigation;
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

            const navigationButtons=['pan','zoom','tilt'].map(mode=>{
                const button=document.createElement('button');button.type='button';button.className='Canvas2D-Button';button.dataset.role=mode;
                button.textContent=mode[0].toUpperCase()+mode.slice(1);button.title=mode==='pan'?'Pan · drag view':mode==='zoom'?'Zoom · drag vertically or use wheel':'Tilt · drag horizontally to rotate view';
                button.onclick=()=>this.setNavigation(this._navigation===mode?'none':mode as 'pan'|'zoom'|'tilt');return button;
            });
            for(const button of [home,minus,plus,gridButton,snapButton])button.type='button';
            toolbar.append(home,...navigationButtons,snapButton,gridButton,minus,plus,zoom);

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

            const down=(event:PointerEvent)=>{
                if(event.button!==0||this._drag)return;
                if(this._navigation==='none'&&event.target!==stage&&event.target!==grid)return;
                this._drag={x:event.clientX,y:event.clientY,px:this._pan.x,py:this._pan.y,pointerId:event.pointerId,kind:this._navigation==='none'?'pan':this._navigation,zoom:this._zoom,tilt:this._tilt};
                stage.setPointerCapture(event.pointerId);
                if(this._navigation!=='none'){event.preventDefault();event.stopImmediatePropagation();}
            };
            stage.addEventListener('pointerdown',event=>{if(this._navigation!=='none')down(event);},true);
            stage.addEventListener('pointerdown',event=>{if(this._navigation==='none'&&!event.defaultPrevented)down(event);});
            stage.addEventListener('pointermove',event=>{
                const drag=this._drag;if(!drag||drag.pointerId!==event.pointerId)return;
                if(drag.kind==='pan'){
                    this._pan={x:drag.px+(event.clientX-drag.x)/drag.zoom,y:drag.py+(event.clientY-drag.y)/drag.zoom};
                    this.ApplyViewport();this.UpdateStatus();
                }else if(drag.kind==='zoom')this.setZoom(drag.zoom*Math.exp((drag.y-event.clientY)*.01));
                else this.setTilt(drag.tilt+(event.clientX-drag.x)*.5);
                if(this._navigation!=='none'){event.preventDefault();event.stopImmediatePropagation();}
            },true);
            const release=(event:PointerEvent)=>{
                const drag=this._drag;if(!drag||drag.pointerId!==event.pointerId)return;
                if(event.type==='pointercancel'){this._pan={x:drag.px,y:drag.py};this._zoom=drag.zoom;this._tilt=drag.tilt;this.ApplyViewport();this.UpdateStatus();}
                this._drag=null;try{stage.releasePointerCapture(event.pointerId);}catch{}this.EmitViewport();
                if(this._navigation!=='none'){event.preventDefault();event.stopImmediatePropagation();}
            };
            stage.addEventListener('pointerup',release,true);stage.addEventListener('pointercancel',release,true);
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
            this.style.setProperty('--tilt',`${this._tilt}deg`);
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
            if(this._gridProvider&&this._gridProvider.options?.enabled!==this._grid.enabled)this._gridProvider.configure({enabled:this._grid.enabled});
            this._gridLayer.style.display=this._grid.enabled&&!this._gridProvider?'block':'none';
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
            if(this._stage)this._stage.style.cursor=this._navigation==='pan'?'grab':this._navigation==='zoom'?'zoom-in':this._navigation==='tilt'?'crosshair':'';
            for(const role of ['pan','zoom','tilt','snap','grid']) {
                const active=role==='grid'?this._grid.enabled:role==='snap'?this._snap.enabled:this._navigation===role;
                const button=this.querySelector<HTMLButtonElement>('[data-role="'+role+'"]');
                button?.setAttribute('data-active',String(active));button?.setAttribute('aria-pressed',String(active));
            }
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
                `Snap ${this._snap.enabled?'on':'off'} · Tilt ${Math.round(this._tilt)}°`;
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

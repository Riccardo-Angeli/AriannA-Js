/**
 * @module components/graphics/3D/CameraViewer3D
 * @author Riccardo Angeli
 * @version 2.1.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license MIT / Commercial (dual license)
 */
import { Component, Css, Templates } from '../../../core/index.ts';
const html = Templates.Template.Html;

export namespace CameraViewer3D
{
    export namespace Types
    {
        export type PaneId = 'top' | 'front' | 'side' | 'perspective';
        export type ProjectionKind = 'orthographic' | 'perspective';
    }
    export namespace Interfaces
    {
        export interface Vec3 { x:number; y:number; z:number; }
        export interface Camera { position:Vec3; target:Vec3; zoom:number; kind:Types.ProjectionKind; }
        export interface Pane { id:Types.PaneId; label:string; surface:HTMLElement; overlay:HTMLElement; camera:Camera; }
        export interface CameraViewer3DOptions { width?:string; height?:string; showAxes?:boolean; showLabels?:boolean; theme?:'dark'|'light'; }
    }

    const DEFAULT_CAMERAS:Record<Types.PaneId,Interfaces.Camera> = {
        top:{position:{x:0,y:10,z:0},target:{x:0,y:0,z:0},zoom:1,kind:'orthographic'},
        front:{position:{x:0,y:0,z:10},target:{x:0,y:0,z:0},zoom:1,kind:'orthographic'},
        side:{position:{x:10,y:0,z:0},target:{x:0,y:0,z:0},zoom:1,kind:'orthographic'},
        perspective:{position:{x:6,y:5,z:7},target:{x:0,y:0,z:0},zoom:1,kind:'perspective'}
    };
    const LABELS:Record<Types.PaneId,string>={top:'Top Orthographic',front:'Front Orthographic',side:'Right Orthographic',perspective:'User Perspective'};

    export const Styles = new Css.Stylesheet([
        new Css.Rule('.CameraViewer3D',{Background:'#202428',Border:'1px solid #121517',BorderRadius:'8px',BoxSizing:'border-box',Color:'#e5e8ea',Display:'block',FontFamily:'var(--arianna-font,system-ui,sans-serif)',Height:'520px',MaxWidth:'100%',MinWidth:'0',Overflow:'hidden',Width:'100%'}),
        new Css.Rule('.CameraViewer3D-Toolbar',{AlignItems:'center',Background:'linear-gradient(180deg,#363b40,#25292d)',BorderBottom:'1px solid #121517',Display:'flex',Gap:'5px',Height:'38px',Padding:'0 8px'}),
        new Css.Rule('.CameraViewer3D-Brand',{Color:'#e40c88',FontSize:'10px',FontWeight:'800',LetterSpacing:'.04em',MarginRight:'7px'}),
        new Css.Rule('.CameraViewer3D-Button',{Appearance:'none',Background:'linear-gradient(180deg,#444a50,#30353a)',Border:'1px solid #15181a',BorderRadius:'4px',Color:'#dce0e3',Cursor:'pointer',Font:'600 9px/1 system-ui',Height:'25px',Padding:'0 8px'}),
        new Css.Rule('.CameraViewer3D-Button:hover,.CameraViewer3D-Button[data-active="true"]',{BorderColor:'#e40c88',Color:'#ff67b7'}),
        new Css.Rule('.CameraViewer3D-Grid',{Display:'grid',Gap:'1px',GridTemplateColumns:'1fr 1fr',GridTemplateRows:'1fr 1fr',Height:'calc(100% - 38px)',Background:'#101315'}),
        new Css.Rule('.CameraViewer3D-Grid[data-maximized="true"]',{GridTemplateColumns:'1fr',GridTemplateRows:'1fr'}),
        new Css.Rule('.CameraViewer3D-Pane',{Background:'linear-gradient(180deg,#24292e,#171b1f)',Cursor:'crosshair',MinHeight:'0',Overflow:'hidden',Position:'relative'}),
        new Css.Rule('.CameraViewer3D-Pane[data-selected="true"]',{BoxShadow:'inset 0 0 0 1px #e40c88'}),
        new Css.Rule('.CameraViewer3D-PaneLabel',{Background:'rgba(17,20,23,.72)',Border:'1px solid rgba(255,255,255,.08)',BorderRadius:'3px',Color:'#b9c0c6',Font:'700 8px/1.1 system-ui',Left:'8px',Padding:'4px 6px',Position:'absolute',Top:'8px',ZIndex:'5'}),
        new Css.Rule('.CameraViewer3D-Viewport',{Height:'100%',Overflow:'hidden',Perspective:'520px',Position:'relative',Width:'100%'}),
        new Css.Rule('.CameraViewer3D-GridPlane',{BackgroundImage:'linear-gradient(rgba(143,151,159,.14) 1px,transparent 1px),linear-gradient(90deg,rgba(143,151,159,.14) 1px,transparent 1px)',BackgroundSize:'24px 24px',Bottom:'-12%',Height:'76%',Left:'-15%',Position:'absolute',Transform:'rotateX(67deg) rotateZ(-1deg)',TransformOrigin:'center bottom',Width:'130%'}),
        new Css.Rule('.CameraViewer3D-Object',{Height:'94px',Left:'50%',Position:'absolute',Top:'49%',Transform:'translate(-50%,-50%) rotateX(-18deg) rotateY(33deg)',TransformStyle:'preserve-3d',Width:'94px'}),
        new Css.Rule('.CameraViewer3D-Face',{Background:'linear-gradient(145deg,#6d747b,#2d3338)',Border:'1px solid #939aa0',BoxShadow:'inset 0 0 14px rgba(255,255,255,.08)',Height:'72px',Left:'11px',Position:'absolute',Top:'11px',Width:'72px'}),
        new Css.Rule('.CameraViewer3D-Face[data-face="front"]',{Transform:'translateZ(36px)'}),
        new Css.Rule('.CameraViewer3D-Face[data-face="back"]',{Transform:'rotateY(180deg) translateZ(36px)'}),
        new Css.Rule('.CameraViewer3D-Face[data-face="right"]',{Transform:'rotateY(90deg) translateZ(36px)'}),
        new Css.Rule('.CameraViewer3D-Face[data-face="left"]',{Transform:'rotateY(-90deg) translateZ(36px)'}),
        new Css.Rule('.CameraViewer3D-Face[data-face="top"]',{Background:'linear-gradient(145deg,#8f969c,#3a4046)',Transform:'rotateX(90deg) translateZ(36px)'}),
        new Css.Rule('.CameraViewer3D-Face[data-face="bottom"]',{Transform:'rotateX(-90deg) translateZ(36px)'}),
        new Css.Rule('.CameraViewer3D-Wire',{Border:'1px solid #e40c88',Bottom:'17%',Left:'17%',Opacity:'.8',Position:'absolute',Right:'17%',Top:'17%',Transform:'skewY(-11deg)'}),
        new Css.Rule('.CameraViewer3D-Axes',{Bottom:'10px',Height:'48px',Position:'absolute',Right:'10px',Width:'48px'}),
        new Css.Rule('.CameraViewer3D-Axis',{Bottom:'8px',Height:'2px',Left:'21px',Position:'absolute',TransformOrigin:'left center',Width:'21px'}),
        new Css.Rule('.CameraViewer3D-Axis[data-axis="x"]',{Background:'#ef5350',Transform:'rotate(-18deg)'}),
        new Css.Rule('.CameraViewer3D-Axis[data-axis="y"]',{Background:'#66bb6a',Transform:'rotate(-92deg)'}),
        new Css.Rule('.CameraViewer3D-Axis[data-axis="z"]',{Background:'#42a5f5',Transform:'rotate(35deg)'}),
        new Css.Rule('.CameraViewer3D-CameraMeta',{Bottom:'7px',Color:'#7f888f',Font:'8px ui-monospace,monospace',Left:'8px',Position:'absolute'}),
        new Css.Rule('.CameraViewer3D[theme="light"]',{Background:'#eef0f2',BorderColor:'#b9bec3',Color:'#25292d'}),
        new Css.Rule('.CameraViewer3D[theme="light"] .CameraViewer3D-Toolbar',{Background:'linear-gradient(180deg,#f9fafb,#dfe3e6)',BorderBottomColor:'#b9bec3'}),
        new Css.Rule('.CameraViewer3D[theme="light"] .CameraViewer3D-Button',{Background:'linear-gradient(180deg,#fff,#e1e4e7)',BorderColor:'#b9bec3',Color:'#383e43'}),
        new Css.Rule('.CameraViewer3D[theme="light"] .CameraViewer3D-Grid',{Background:'#aeb4b9'}),
        new Css.Rule('.CameraViewer3D[theme="light"] .CameraViewer3D-Pane',{Background:'linear-gradient(180deg,#f7f8f9,#e2e5e7)'}),
        new Css.Rule('.CameraViewer3D[theme="light"] .CameraViewer3D-PaneLabel',{Background:'rgba(255,255,255,.82)',BorderColor:'#c8cdd1',Color:'#4b5359'}),
        new Css.Rule('.CameraViewer3D[theme="light"] .CameraViewer3D-GridPlane',{BackgroundImage:'linear-gradient(rgba(77,85,91,.15) 1px,transparent 1px),linear-gradient(90deg,rgba(77,85,91,.15) 1px,transparent 1px)'}),
        new Css.Rule('.CameraViewer3D[theme="light"] .CameraViewer3D-CameraMeta',{Color:'#667078'})
    ]);

    @Component('arianna-camera-viewer-3d', Styles, {Shadow:false,Attributes:['theme','active-pane','maximized-pane','show-axes','show-labels']})
    export class CameraViewer3D extends HTMLDivElement
    {
        public static readonly Styles=Styles;
        public template=html``;
        private _cameras:Record<Types.PaneId,Interfaces.Camera>=structuredClone(DEFAULT_CAMERAS);
        private _panes=new Map<Types.PaneId,Interfaces.Pane>();
        private _showAxes=true;
        private _showLabels=true;

        constructor(options:Interfaces.CameraViewer3DOptions={})
        {
            super();
            if(options.theme)this.setAttribute('theme',options.theme);
            if(options.width)this.style.width=options.width;
            if(options.height)this.style.height=options.height;
            if(options.showAxes===false)this._showAxes=false;
            if(options.showLabels===false)this._showLabels=false;
        }
        public onCreated():void{requestAnimationFrame(()=>{if(this.isConnected)this.onConnected();});}
        public onConnected(_opts:Interfaces.CameraViewer3DOptions={}):void{this.classList.add('CameraViewer3D');if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');this.Render();}
        public onAttributeChanged():void{if(this.isConnected)this.Render();}
        public getPane(id:Types.PaneId):Interfaces.Pane
        {
            const p=this._panes.get(id);if(!p)throw new Error(`Camera pane not mounted: ${id}`);return p;
        }
        public setCamera(pane:Types.PaneId,camera:Partial<Interfaces.Camera>):this
        {
            const current=this._cameras[pane];this._cameras[pane]={...current,...camera,position:{...current.position,...camera.position},target:{...current.target,...camera.target}};if(this.isConnected)this.Render();return this;
        }
        public getCamera(pane:Types.PaneId):Interfaces.Camera{return structuredClone(this._cameras[pane]);}
        public setActivePane(pane:Types.PaneId):this{this.setAttribute('active-pane',pane);return this;}
        public getActivePane():Types.PaneId|null{return (this.getAttribute('active-pane') as Types.PaneId)||null;}
        public maximize(pane:Types.PaneId):this{this.setAttribute('maximized-pane',pane);return this;}
        public restore():this{this.removeAttribute('maximized-pane');return this;}
        public toggleMaximize(pane:Types.PaneId):this{return this.getAttribute('maximized-pane')===pane?this.restore():this.maximize(pane);}
        public onBeforeMount(){} public onMount(){} public onBeforeUpdate(){} public onUpdate(){} public onBeforeUnmount(){} public onUnmount(){}

        private BuildPane(id:Types.PaneId):HTMLElement
        {
            const cam=this._cameras[id];const pane=document.createElement('section');pane.className='CameraViewer3D-Pane';pane.dataset.selected=String(this.getActivePane()===id);pane.addEventListener('pointerdown',()=>this.setActivePane(id));pane.addEventListener('dblclick',()=>this.toggleMaximize(id));
            const surface=document.createElement('div');surface.className='CameraViewer3D-Viewport';surface.innerHTML='<div class="CameraViewer3D-GridPlane"></div><div class="CameraViewer3D-Object"><i class="CameraViewer3D-Face" data-face="front"></i><i class="CameraViewer3D-Face" data-face="back"></i><i class="CameraViewer3D-Face" data-face="right"></i><i class="CameraViewer3D-Face" data-face="left"></i><i class="CameraViewer3D-Face" data-face="top"></i><i class="CameraViewer3D-Face" data-face="bottom"></i></div><div class="CameraViewer3D-Wire"></div>';
            const overlay=document.createElement('div');
            if(this._showLabels){const label=document.createElement('div');label.className='CameraViewer3D-PaneLabel';label.textContent=LABELS[id];overlay.append(label);}
            const meta=document.createElement('div');meta.className='CameraViewer3D-CameraMeta';meta.textContent=`${cam.kind} · ${cam.zoom.toFixed(2)}×`;overlay.append(meta);
            if(this._showAxes){const axes=document.createElement('div');axes.className='CameraViewer3D-Axes';axes.innerHTML='<i class="CameraViewer3D-Axis" data-axis="x"></i><i class="CameraViewer3D-Axis" data-axis="y"></i><i class="CameraViewer3D-Axis" data-axis="z"></i>';overlay.append(axes);}
            pane.append(surface,overlay);this._panes.set(id,{id,label:LABELS[id],surface,overlay,camera:cam});return pane;
        }
        private Render():void
        {
            this._panes.clear();const root=document.createElement('section');const tb=document.createElement('header');tb.className='CameraViewer3D-Toolbar';const brand=document.createElement('span');brand.className='CameraViewer3D-Brand';brand.textContent='3D VIEW';tb.append(brand);
            for(const id of ['perspective','front','side','top'] as Types.PaneId[]){const b=document.createElement('button');b.className='CameraViewer3D-Button';b.textContent=id[0].toUpperCase()+id.slice(1);b.dataset.active=String(this.getActivePane()===id);b.onclick=()=>this.setActivePane(id);tb.append(b);}const restore=document.createElement('button');restore.className='CameraViewer3D-Button';restore.style.marginLeft='auto';restore.textContent='Four Views';restore.onclick=()=>this.restore();tb.append(restore);
            const grid=document.createElement('div');grid.className='CameraViewer3D-Grid';const max=this.getAttribute('maximized-pane') as Types.PaneId|null;grid.dataset.maximized=String(!!max);const ids=max?[max]:['top','front','side','perspective'] as Types.PaneId[];for(const id of ids)grid.append(this.BuildPane(id));root.append(tb,grid);this.replaceChildren(root);
        }
    }
}
export type PaneId=CameraViewer3D.Types.PaneId;export type ProjectionKind=CameraViewer3D.Types.ProjectionKind;export type Vec3=CameraViewer3D.Interfaces.Vec3;export type Camera=CameraViewer3D.Interfaces.Camera;export type Pane=CameraViewer3D.Interfaces.Pane;export type CameraViewer3DOptions=CameraViewer3D.Interfaces.CameraViewer3DOptions;
export default CameraViewer3D.CameraViewer3D;

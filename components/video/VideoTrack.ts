/**
 * @module    components/video/VideoTrack
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description NLE timeline track surface used by VideoTrackEditor.
 */

import { Component, Css, Templates } from '../../core/index.ts';
import { VideoPart } from './VideoPart.ts';
import type { VideoPartOptions } from './VideoPart.ts';

export interface VideoTrackOptions
{
    name?: string;
    index?: number;
    color?: string;
    theme?: 'dark' | 'light';
    pixelsPerSecond?: number;
    snap?: number;
    locked?: boolean;
    hidden?: boolean;
    muted?: boolean;
    soloed?: boolean;
    enabled?: boolean;
    height?: number;
}

export namespace VideoTrack
{
    export const html = Templates.Template.Html;
    export const Styles = new Css.Stylesheet([
        new Css.Rule('arianna-video-track, .VideoTrack', {
            '--VideoTrack-Color': '#4f88c7',
            Background: '#23272c', BorderBottom: '1px solid #101214', BoxSizing: 'border-box', Color: '#dce1e6', Display: 'grid', FontFamily: 'var(--arianna-font,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif)', GridTemplateColumns: '138px minmax(0,1fr)', MinHeight: '74px', Width: '100%'
        }),
        new Css.Rule('.VideoTrack-Header', { AlignItems: 'center', Background: 'linear-gradient(180deg,#30353b,#262a2f)', BorderRight: '1px solid #111315', Display: 'grid', Gap: '4px', GridTemplateColumns: '5px minmax(0,1fr) auto', GridTemplateRows: 'auto auto', Padding: '5px 6px 5px 0' }),
        new Css.Rule('.VideoTrack-Color', { AlignSelf: 'stretch', Background: 'var(--VideoTrack-Color)', BorderRadius: '0 1px 1px 0', GridRow: '1 / span 2' }),
        new Css.Rule('.VideoTrack-Name', { FontSize: '10px', FontWeight: '750', MinWidth: '0', Overflow: 'hidden', PaddingLeft: '5px', TextOverflow: 'ellipsis', WhiteSpace: 'nowrap' }),
        new Css.Rule('.VideoTrack-Buttons', { Display: 'flex', Gap: '2px' }),
        new Css.Rule('.VideoTrack-Button', { Appearance: 'none', Background: 'linear-gradient(180deg,#42474c,#2d3136)', Border: '1px solid #151719', BorderRadius: '2px', Color: '#aeb6bd', Cursor: 'pointer', Font: '700 8px/1 var(--arianna-font,system-ui,sans-serif)', Height: '18px', Padding: '0', Width: '20px' }),
        new Css.Rule('.VideoTrack-Button[data-active="true"]', { Background: '#4d8fcb', BorderColor: '#26699f', Color: '#fff' }),
        new Css.Rule('.VideoTrack-Button[data-action="lock"][data-active="true"]', { Background: '#d89a38', BorderColor: '#9b671b', Color: '#19140b' }),
        new Css.Rule('.VideoTrack-Button[data-action="visible"][data-active="false"]', { Color: '#5c6269', TextDecoration: 'line-through' }),
        new Css.Rule('.VideoTrack-Meta', { Color: '#77818a', FontSize: '8px', GridColumn: '2 / span 1', PaddingLeft: '5px' }),
        new Css.Rule('.VideoTrack-Lane', { BackgroundColor: '#1d2126', BackgroundImage: 'linear-gradient(to right,rgba(150,160,170,.14) 1px,transparent 1px)', BackgroundSize: 'var(--VideoTrackEditor-Pps,36px) 100%', MinHeight: '74px', Overflow: 'hidden', Position: 'relative' }),
        new Css.Rule('arianna-video-track[hidden-track] .VideoTrack-Lane, .VideoTrack[hidden-track] .VideoTrack-Lane', { Opacity: '.28' }),
        new Css.Rule('arianna-video-track[locked] .VideoTrack-Lane, .VideoTrack[locked] .VideoTrack-Lane', { BackgroundColor: '#191d21' }),
        new Css.Rule('arianna-video-track[theme="light"], .VideoTrack[theme="light"], arianna-video-track-editor[theme="light"] .VideoTrack, .VideoTrackEditor[theme="light"] .VideoTrack', { Background: '#e5e8eb', BorderBottomColor: '#bcc2c8', Color: '#2d343b' }),
        new Css.Rule('arianna-video-track[theme="light"] .VideoTrack-Header, .VideoTrack[theme="light"] .VideoTrack-Header, arianna-video-track-editor[theme="light"] .VideoTrack-Header, .VideoTrackEditor[theme="light"] .VideoTrack-Header', { Background: 'linear-gradient(180deg,#fafbfc,#dce0e4)', BorderRightColor: '#bcc2c8' }),
        new Css.Rule('arianna-video-track[theme="light"] .VideoTrack-Button, .VideoTrack[theme="light"] .VideoTrack-Button, arianna-video-track-editor[theme="light"] .VideoTrack-Button, .VideoTrackEditor[theme="light"] .VideoTrack-Button', { Background: 'linear-gradient(180deg,#fff,#e2e5e8)', BorderColor: '#b9bfc5', Color: '#565e66' }),
        new Css.Rule('arianna-video-track[theme="light"] .VideoTrack-Lane, .VideoTrack[theme="light"] .VideoTrack-Lane, arianna-video-track-editor[theme="light"] .VideoTrack-Lane, .VideoTrackEditor[theme="light"] .VideoTrack-Lane', { BackgroundColor: '#fafbfc', BackgroundImage: 'linear-gradient(to right,#e1e4e7 1px,transparent 1px)' })
    ]);

    @Component('arianna-video-track', Styles, {
        Shadow: false,
        Attributes: ['name','index','color','theme','pixels-per-second','snap','locked','hidden-track','muted','soloed','enabled','height']
    })
    export class VideoTrack extends HTMLElement
    {
        public static readonly Styles = Styles;
        public template = html``;
        private Lane?: HTMLElement;
        private Bound?: boolean;

        constructor(options: VideoTrackOptions = {})
        {
            super();
            if(options.name) this.setAttribute('name',options.name);
            if(options.index != null) this.setAttribute('index',String(options.index));
            if(options.color) this.setAttribute('color',options.color);
            if(options.theme) this.setAttribute('theme',options.theme);
            if(options.pixelsPerSecond != null) this.setAttribute('pixels-per-second',String(options.pixelsPerSecond));
            if(options.snap != null) this.setAttribute('snap',String(options.snap));
            if(options.locked) this.setAttribute('locked','');
            if(options.hidden) this.setAttribute('hidden-track','');
            if(options.muted) this.setAttribute('muted','');
            if(options.soloed) this.setAttribute('soloed','');
            if(options.enabled === false) this.setAttribute('enabled','false');
            if(options.height != null) this.setAttribute('height',String(options.height));
        }

        public onCreated(): void { if(this.isConnected) this.onConnected(); }
        public onConnected(): void
        {
            this.classList.add('VideoTrack');
            this.style.setProperty('--VideoTrack-Color',this.getAttribute('color')||'#4f88c7');
            this.ApplyGrid(); this.Render(); this.BindControls(); this.Sync();
        }
        public onAttributeChanged(name:string):void
        {
            if(!this.isConnected)return;
            if(name==='name'){const node=this.querySelector<HTMLElement>(':scope > .VideoTrack-Header > .VideoTrack-Name');if(node)node.textContent=this.name;}
            else if(name==='color')this.style.setProperty('--VideoTrack-Color',this.getAttribute('color')||'#4f88c7');
            else if(name==='pixels-per-second'||name==='height'){this.ApplyGrid();this.querySelectorAll<HTMLElement>(':scope > .VideoTrack-Lane > arianna-video-part,:scope > .VideoTrack-Lane > .VideoPart').forEach(part=>(part as VideoPart.VideoPart).onConnected?.());}
            else this.Sync();
        }

        public get name():string{return this.getAttribute('name')||`V${this.index+1}`;}
        public set name(value:string){this.setAttribute('name',value);}
        public get index():number{const n=Number(this.getAttribute('index')??0);return Number.isFinite(n)?Math.max(0,Math.floor(n)):0;}
        public set index(value:number){this.setAttribute('index',String(Math.max(0,Math.floor(Number(value)||0))));}
        public get pixelsPerSecond():number{const n=Number(this.getAttribute('pixels-per-second')??36);return Number.isFinite(n)&&n>0?n:36;}
        public set pixelsPerSecond(value:number){this.setAttribute('pixels-per-second',String(Math.max(1,Number(value)||36)));}
        public get snap():number{const n=Number(this.getAttribute('snap')??.1);return Number.isFinite(n)&&n>0?n:.1;}
        public set snap(value:number){this.setAttribute('snap',String(Math.max(.001,Number(value)||.1)));}

        public addPart(part: VideoPart.VideoPart | VideoPartOptions): this
        {
            this.Render();
            const node = part instanceof HTMLElement ? part as VideoPart.VideoPart : new VideoPart.VideoPart(part);
            this.Lane?.appendChild(node); node.onConnected?.(); return this;
        }
        public get parts(): VideoPart.VideoPart[] { return Array.from(this.querySelectorAll<VideoPart.VideoPart>(':scope > .VideoTrack-Lane > arianna-video-part,:scope > .VideoTrack-Lane > .VideoPart')); }

        private Render():void
        {
            if(this.querySelector(':scope > .VideoTrack-Header'))return;
            const parts=Array.from(this.querySelectorAll<HTMLElement>(':scope > arianna-video-part,:scope > .VideoPart'));
            const header=document.createElement('div');header.className='VideoTrack-Header';const color=document.createElement('span');color.className='VideoTrack-Color';const name=document.createElement('span');name.className='VideoTrack-Name';name.textContent=this.name;const buttons=document.createElement('span');buttons.className='VideoTrack-Buttons';buttons.append(this.Button('V','visible'),this.Button('M','mute'),this.Button('S','solo'),this.Button('L','lock'));const meta=document.createElement('span');meta.className='VideoTrack-Meta';meta.textContent=`V${this.index+1} · VIDEO`;header.append(color,name,buttons,meta);
            this.Lane=document.createElement('div');this.Lane.className='VideoTrack-Lane';parts.forEach(part=>this.Lane?.appendChild(part));this.append(header,this.Lane);parts.forEach(part=>(part as VideoPart.VideoPart).onConnected?.());
        }
        private BindControls():void
        {
            if(this.Bound)return;this.Bound=true;
            this.addEventListener('click',event=>{const button=(event.target as Element|null)?.closest?.('.VideoTrack-Button') as HTMLButtonElement|null;if(!button||!this.contains(button))return;event.preventDefault();event.stopPropagation();const action=button.dataset.action;if(action==='visible')this.toggleAttribute('hidden-track');else if(action==='mute')this.toggleAttribute('muted');else if(action==='solo')this.toggleAttribute('soloed');else if(action==='lock')this.toggleAttribute('locked');this.Sync();this.Emit('arianna:video-track-change',{action});});
        }
        private Sync():void
        {
            this.querySelector<HTMLButtonElement>('[data-action="visible"]')?.setAttribute('data-active',String(!this.hasAttribute('hidden-track')));
            this.querySelector<HTMLButtonElement>('[data-action="mute"]')?.setAttribute('data-active',String(this.hasAttribute('muted')));
            this.querySelector<HTMLButtonElement>('[data-action="solo"]')?.setAttribute('data-active',String(this.hasAttribute('soloed')));
            this.querySelector<HTMLButtonElement>('[data-action="lock"]')?.setAttribute('data-active',String(this.hasAttribute('locked')));
        }
        private ApplyGrid():void{this.style.setProperty('--VideoTrackEditor-Pps',`${this.pixelsPerSecond}px`);const h=Number(this.getAttribute('height')??74);if(Number.isFinite(h)&&h>=40)this.style.minHeight=`${h}px`;}
        private Button(text:string,action:string):HTMLButtonElement{const b=document.createElement('button');b.type='button';b.className='VideoTrack-Button';b.dataset.action=action;b.dataset.active=action==='visible'?'true':'false';b.textContent=text;return b;}
        private Emit(type:string,detail:Record<string,unknown>={}):void{this.dispatchEvent(new CustomEvent(type,{bubbles:true,composed:true,detail:{...detail,track:this,source:this}}));}
    }
}

export const VideoTrackComponent = VideoTrack.VideoTrack;
export { VideoTrackComponent as VideoTrackElement };
export default VideoTrack.VideoTrack;

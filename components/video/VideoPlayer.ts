/**
 * @module    components/video/VideoPlayer
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description Professional HTML5 video player surface for AriannA with custom
 *              transport, Dark/Light themes, PiP and fullscreen support.
 */

import { Component, Css, Templates } from '../../core/index.ts';

export type VideoProvider = 'html5' | 'youtube' | 'vimeo' | 'unknown';
export interface VideoPlayerOptions
{
    theme?: 'dark' | 'light';
    src?: string;
    source?: string;
    poster?: string;
    title?: string;
    subtitle?: string;
    autoplay?: boolean;
    muted?: boolean;
    loop?: boolean;
    showControls?: boolean;
    volume?: number;
    current?: number;
    playbackRate?: number;
    aspectRatio?: string;
    fit?: 'contain' | 'cover' | 'fill';
}

export function detectVideoProvider(source: string): VideoProvider
{
    const value = String(source ?? '').toLowerCase();
    if(/youtube\.com|youtu\.be/.test(value)) return 'youtube';
    if(/vimeo\.com/.test(value)) return 'vimeo';
    if(/\.(mp4|webm|ogv|m4v)(?:$|[?#])/.test(value) || value.startsWith('blob:') || value.startsWith('data:')) return 'html5';
    return value ? 'html5' : 'unknown';
}

export namespace VideoPlayer
{
    export namespace Types
    {
        export type Theme = 'dark' | 'light';
        export type Provider = VideoProvider;
    }

    export namespace Interfaces
    {
        export interface Options extends VideoPlayerOptions {}
    }

    const html = Templates.Template.Html;

    export const Styles = new Css.Stylesheet([
        new Css.Rule('arianna-video-player, .AriannaVideoPlayer', {
            Background: '#0b0d10', Border: '1px solid #24282e', BorderRadius: '8px', BoxSizing: 'border-box', Color: '#edf1f5', Display: 'block', FontFamily: 'var(--arianna-font,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif)', MinWidth: '0', Overflow: 'hidden', Width: '100%'
        }),
        new Css.Rule('.VideoPlayer-Shell', { Background: '#050607', Display: 'grid', GridTemplateRows: 'minmax(180px,1fr) auto', Position: 'relative', Width: '100%' }),
        new Css.Rule('.VideoPlayer-Viewport', { AspectRatio: 'var(--VideoPlayer-Aspect,16 / 9)', Background: '#000', Overflow: 'hidden', Position: 'relative', Width: '100%' }),
        new Css.Rule('.VideoPlayer-Video', { Background: '#000', Height: '100%', ObjectFit: 'var(--VideoPlayer-Fit,contain)', Width: '100%' }),
        new Css.Rule('.VideoPlayer-Overlay', { Background: 'linear-gradient(to top,rgba(0,0,0,.58),transparent 46%)', Bottom: '0', Left: '0', PointerEvents: 'none', Position: 'absolute', Right: '0', Top: '0' }),
        new Css.Rule('.VideoPlayer-TitleBlock', { Bottom: '16px', Left: '16px', PointerEvents: 'none', Position: 'absolute', Right: '16px' }),
        new Css.Rule('.VideoPlayer-Title', { FontSize: '13px', FontWeight: '760', TextShadow: '0 1px 4px rgba(0,0,0,.7)' }),
        new Css.Rule('.VideoPlayer-Subtitle', { Color: 'rgba(255,255,255,.72)', FontSize: '9px', MarginTop: '2px', TextShadow: '0 1px 4px rgba(0,0,0,.7)' }),
        new Css.Rule('.VideoPlayer-BigPlay', { AlignItems: 'center', Appearance: 'none', Background: 'rgba(12,14,18,.72)', Border: '1px solid rgba(255,255,255,.28)', BorderRadius: '50%', Color: '#fff', Cursor: 'pointer', Display: 'flex', FontSize: '20px', Height: '56px', JustifyContent: 'center', Left: '50%', Position: 'absolute', Top: '50%', Transform: 'translate(-50%,-50%)', Width: '56px', ZIndex: '3' }),
        new Css.Rule('.VideoPlayer-BigPlay[data-playing="true"]', { Display: 'none' }),
        new Css.Rule('.VideoPlayer-Controls', { AlignItems: 'center', Background: 'linear-gradient(180deg,#24282e,#171a1e)', BorderTop: '1px solid #0d0f12', Display: 'grid', Gap: '6px', GridTemplateColumns: 'auto auto minmax(80px,1fr) auto auto auto auto auto', Padding: '7px 8px' }),
        new Css.Rule('.VideoPlayer-Button', { Appearance: 'none', Background: '#2c3137', Border: '1px solid #3a4047', BorderRadius: '4px', Color: '#dbe1e7', Cursor: 'pointer', Font: '650 10px/1 var(--arianna-font,system-ui,sans-serif)', Height: '27px', MinWidth: '28px', Padding: '0 7px' }),
        new Css.Rule('.VideoPlayer-Button:hover', { Background: '#363c43' }),
        new Css.Rule('.VideoPlayer-Time', { Color: '#aeb7c1', Font: '9px/1 ui-monospace,SFMono-Regular,Menlo,monospace', WhiteSpace: 'nowrap' }),
        new Css.Rule('.VideoPlayer-Seek', { AccentColor: '#e40c88', Cursor: 'pointer', Margin: '0', MinWidth: '0', Width: '100%' }),
        new Css.Rule('.VideoPlayer-Volume', { AccentColor: '#e40c88', Cursor: 'pointer', Margin: '0', Width: '72px' }),
        new Css.Rule('.VideoPlayer-Rate', { Appearance: 'none', Background: '#20242a', Border: '1px solid #363c44', BorderRadius: '4px', Color: '#dbe1e7', Font: '9px/1 var(--arianna-font,system-ui,sans-serif)', Height: '27px', Padding: '0 5px' }),
        new Css.Rule('.VideoPlayer-Hidden', { Display: 'none' }),

        new Css.Rule('arianna-video-player[theme="light"], .AriannaVideoPlayer[theme="light"]', { Background: '#fff', BorderColor: '#c8cdd3', Color: '#222a33' }),
        new Css.Rule('arianna-video-player[theme="light"] .VideoPlayer-Controls, .AriannaVideoPlayer[theme="light"] .VideoPlayer-Controls', { Background: 'linear-gradient(180deg,#fff,#e9ecef)', BorderTopColor: '#c8cdd3' }),
        new Css.Rule('arianna-video-player[theme="light"] .VideoPlayer-Button, .AriannaVideoPlayer[theme="light"] .VideoPlayer-Button', { Background: '#fff', BorderColor: '#c4c9cf', Color: '#38424c' }),
        new Css.Rule('arianna-video-player[theme="light"] .VideoPlayer-Time, .AriannaVideoPlayer[theme="light"] .VideoPlayer-Time', { Color: '#55616d' }),
        new Css.Rule('arianna-video-player[theme="light"] .VideoPlayer-Rate, .AriannaVideoPlayer[theme="light"] .VideoPlayer-Rate', { Background: '#fff', BorderColor: '#c6cbd1', Color: '#38424c' })
    ]);

    @Component('arianna-video-player', Styles, {
        Shadow: false,
        Attributes: ['theme','src','source','poster','title','subtitle','autoplay','muted','loop','show-controls','volume','current','playback-rate','aspect-ratio','fit']
    })
    export class VideoPlayer extends HTMLElement
    {
        public static readonly Styles = Styles;
        public template = html``;
        private Video?: HTMLVideoElement;
        private Seek?: HTMLInputElement;
        private Volume?: HTMLInputElement;
        private Time?: HTMLElement;
        private BigPlay?: HTMLButtonElement;
        private Bound?: boolean;
        private Tick?: number;

        constructor(options: Interfaces.Options = {})
        {
            super();
            if(options.theme) this.setAttribute('theme', options.theme);
            const source = options.src ?? options.source; if(source) this.setAttribute('src', source);
            if(options.poster) this.setAttribute('poster', options.poster);
            if(options.title) this.setAttribute('title', options.title);
            if(options.subtitle) this.setAttribute('subtitle', options.subtitle);
            if(options.autoplay) this.setAttribute('autoplay', '');
            if(options.muted) this.setAttribute('muted', '');
            if(options.loop) this.setAttribute('loop', '');
            if(options.showControls === false) this.setAttribute('show-controls', 'false');
            if(options.volume != null) this.setAttribute('volume', String(options.volume));
            if(options.current != null) this.setAttribute('current', String(options.current));
            if(options.playbackRate != null) this.setAttribute('playback-rate', String(options.playbackRate));
            if(options.aspectRatio) this.setAttribute('aspect-ratio', options.aspectRatio);
            if(options.fit) this.setAttribute('fit', options.fit);
        }

        public onCreated(): void { if(this.isConnected) this.onConnected(); }
        public onConnected(): void
        {
            this.classList.add('AriannaVideoPlayer');
            if(!this.hasAttribute('theme')) this.setAttribute('theme','dark');
            this.Render();
            this.Bind();
            this.SyncFromAttributes();
        }
        public onAttributeChanged(): void { if(this.isConnected) this.SyncFromAttributes(); }
        public onUnmount(): void { if(this.Tick) cancelAnimationFrame(this.Tick); }

        public get media(): HTMLVideoElement | undefined { return this.Video; }
        public get duration(): number { return Number.isFinite(this.Video?.duration) ? this.Video!.duration : 0; }
        public get currentTime(): number { return this.Video?.currentTime ?? 0; }
        public set currentTime(value: number) { if(this.Video) this.Video.currentTime = Math.max(0, Math.min(this.duration || Number.POSITIVE_INFINITY, Number(value) || 0)); this.UpdateUI(); }
        public get paused(): boolean { return this.Video?.paused ?? true; }
        public get volume(): number { return this.Video?.volume ?? this.Clamp(Number(this.getAttribute('volume') ?? 1),0,1); }
        public set volume(value: number) { const v=this.Clamp(Number(value)||0,0,1); this.setAttribute('volume',String(v)); if(this.Video) this.Video.volume=v; this.UpdateUI(); }

        public async play(): Promise<this> { await this.Video?.play(); this.UpdateUI(); return this; }
        public pause(): this { this.Video?.pause(); this.UpdateUI(); return this; }
        public toggle(): this { if(this.Video?.paused) void this.Video.play(); else this.Video?.pause(); this.UpdateUI(); return this; }
        public seek(seconds: number): this { this.currentTime = seconds; return this; }
        public setSource(source: string): this { this.setAttribute('src', source); return this; }
        public async fullscreen(): Promise<this> { const target=this.querySelector<HTMLElement>('.VideoPlayer-Viewport') ?? this; if(document.fullscreenElement) await document.exitFullscreen(); else await target.requestFullscreen?.(); return this; }
        public async pictureInPicture(): Promise<this>
        {
            const video = this.Video as HTMLVideoElement & { requestPictureInPicture?: () => Promise<unknown> };
            const doc = document as Document & { pictureInPictureElement?: Element; exitPictureInPicture?: () => Promise<void> };
            if(doc.pictureInPictureElement) await doc.exitPictureInPicture?.(); else if(video?.requestPictureInPicture) await video.requestPictureInPicture();
            return this;
        }

        private Render(): void
        {
            if(this.querySelector(':scope > .VideoPlayer-Shell')) return;
            const shell=document.createElement('div'); shell.className='VideoPlayer-Shell';
            const viewport=document.createElement('div'); viewport.className='VideoPlayer-Viewport';
            const video=document.createElement('video'); video.className='VideoPlayer-Video'; video.preload='metadata'; video.playsInline=true; this.Video=video;
            const overlay=document.createElement('div'); overlay.className='VideoPlayer-Overlay';
            const titleBlock=document.createElement('div'); titleBlock.className='VideoPlayer-TitleBlock'; const title=document.createElement('div'); title.className='VideoPlayer-Title'; const subtitle=document.createElement('div'); subtitle.className='VideoPlayer-Subtitle'; titleBlock.append(title,subtitle);
            const big=document.createElement('button'); big.type='button'; big.className='VideoPlayer-BigPlay'; big.dataset.action='toggle'; big.textContent='▶'; this.BigPlay=big;
            viewport.append(video,overlay,titleBlock,big);

            const controls=document.createElement('div'); controls.className='VideoPlayer-Controls';
            const play=this.Button('▶','toggle'); const mute=this.Button('🔊','mute');
            const seek=document.createElement('input'); seek.className='VideoPlayer-Seek'; seek.type='range'; seek.min='0'; seek.max='1'; seek.step='.01'; seek.value='0'; seek.dataset.role='seek'; this.Seek=seek;
            const time=document.createElement('span'); time.className='VideoPlayer-Time'; time.textContent='00:00 / 00:00'; this.Time=time;
            const volume=document.createElement('input'); volume.className='VideoPlayer-Volume'; volume.type='range'; volume.min='0'; volume.max='1'; volume.step='.01'; volume.value='1'; volume.dataset.role='volume'; this.Volume=volume;
            const rate=document.createElement('select'); rate.className='VideoPlayer-Rate'; rate.dataset.role='rate'; [0.5,0.75,1,1.25,1.5,2].forEach(value=>{const o=document.createElement('option');o.value=String(value);o.textContent=`${value}×`;if(value===1)o.selected=true;rate.append(o);});
            const pip=this.Button('▣','pip'); pip.title='Picture in Picture'; const full=this.Button('⛶','fullscreen'); full.title='Fullscreen';
            controls.append(play,mute,seek,time,volume,rate,pip,full);
            shell.append(viewport,controls); this.appendChild(shell);
        }

        private Bind(): void
        {
            if(this.Bound) return; this.Bound=true;
            this.addEventListener('click', event=>
            {
                const action=(event.target as Element | null)?.closest?.('[data-action]') as HTMLElement | null;
                if(!action) return;
                const type=action.dataset.action;
                if(type==='toggle') this.toggle();
                else if(type==='mute' && this.Video) { this.Video.muted=!this.Video.muted; this.toggleAttribute('muted',this.Video.muted); this.UpdateUI(); }
                else if(type==='fullscreen') void this.fullscreen();
                else if(type==='pip') void this.pictureInPicture();
            });
            this.addEventListener('input', event=>
            {
                const input=event.target as HTMLInputElement;
                if(input.dataset.role==='seek') this.currentTime=Number(input.value);
                else if(input.dataset.role==='volume') this.volume=Number(input.value);
            });
            this.addEventListener('change', event=>
            {
                const select=event.target as HTMLSelectElement;
                if(select.dataset.role==='rate' && this.Video) { this.Video.playbackRate=Number(select.value)||1; this.setAttribute('playback-rate',String(this.Video.playbackRate)); }
            });
            this.Video?.addEventListener('loadedmetadata',()=>{ const current=this.Clamp(Number(this.getAttribute('current')??0),0,this.duration||Number.POSITIVE_INFINITY); if(current) this.Video!.currentTime=current; this.UpdateUI(); this.Emit('arianna:video-ready',{duration:this.duration}); });
            this.Video?.addEventListener('play',()=>{this.StartTick();this.UpdateUI();this.Emit('arianna:video-play');});
            this.Video?.addEventListener('pause',()=>{this.UpdateUI();this.Emit('arianna:video-pause');});
            this.Video?.addEventListener('ended',()=>{this.UpdateUI();this.Emit('arianna:video-ended');});
            this.Video?.addEventListener('volumechange',()=>this.UpdateUI());
            this.StartTick();
        }

        private SyncFromAttributes(): void
        {
            const video=this.Video; if(!video) return;
            const source=this.getAttribute('src') || this.getAttribute('source') || '';
            if(source && video.getAttribute('src')!==source) { video.src=source; video.load(); }
            const poster=this.getAttribute('poster'); if(poster) video.poster=poster; else video.removeAttribute('poster');
            video.muted=this.hasAttribute('muted'); video.loop=this.hasAttribute('loop'); video.autoplay=this.hasAttribute('autoplay');
            video.volume=this.Clamp(Number(this.getAttribute('volume')??video.volume??1),0,1);
            video.playbackRate=this.Clamp(Number(this.getAttribute('playback-rate')??1),.25,4);
            this.style.setProperty('--VideoPlayer-Aspect',(this.getAttribute('aspect-ratio')||'16/9').replace('/',' / '));
            this.style.setProperty('--VideoPlayer-Fit',this.getAttribute('fit')||'contain');
            const title=this.querySelector<HTMLElement>('.VideoPlayer-Title'); if(title) title.textContent=this.getAttribute('title')||'';
            const subtitle=this.querySelector<HTMLElement>('.VideoPlayer-Subtitle'); if(subtitle) subtitle.textContent=this.getAttribute('subtitle')||'';
            const controls=this.querySelector<HTMLElement>('.VideoPlayer-Controls'); controls?.classList.toggle('VideoPlayer-Hidden',this.getAttribute('show-controls')==='false');
            const rate=this.querySelector<HTMLSelectElement>('[data-role="rate"]'); if(rate) rate.value=String(video.playbackRate);
            if(video.autoplay) void video.play().catch(()=>{});
            this.UpdateUI();
        }

        private StartTick(): void
        {
            if(this.Tick) cancelAnimationFrame(this.Tick);
            const tick=()=>{ this.UpdateUI(); if(this.isConnected) this.Tick=requestAnimationFrame(tick); };
            this.Tick=requestAnimationFrame(tick);
        }

        private UpdateUI(): void
        {
            const video=this.Video; if(!video) return;
            if(this.Seek) { this.Seek.max=String(this.duration||1); this.Seek.value=String(video.currentTime||0); }
            if(this.Volume) this.Volume.value=String(video.volume);
            if(this.Time) this.Time.textContent=`${this.Format(video.currentTime)} / ${this.Format(this.duration)}`;
            if(this.BigPlay) this.BigPlay.dataset.playing=String(!video.paused);
            const play=this.querySelector<HTMLButtonElement>('[data-action="toggle"]:not(.VideoPlayer-BigPlay)'); if(play) play.textContent=video.paused?'▶':'❚❚';
            const mute=this.querySelector<HTMLButtonElement>('[data-action="mute"]'); if(mute) mute.textContent=video.muted||video.volume===0?'🔇':'🔊';
        }

        private Button(text:string,action:string):HTMLButtonElement { const b=document.createElement('button'); b.type='button'; b.className='VideoPlayer-Button'; b.dataset.action=action; b.textContent=text; return b; }
        private Format(seconds:number):string { const safe=Number.isFinite(seconds)?Math.max(0,seconds):0; const h=Math.floor(safe/3600),m=Math.floor((safe%3600)/60),s=Math.floor(safe%60); return h>0?`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`:`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; }
        private Clamp(value:number,min:number,max:number):number { return Math.max(min,Math.min(max,value)); }
        private Emit(type:string,detail:Record<string,unknown>={}):void { this.dispatchEvent(new CustomEvent(type,{bubbles:true,composed:true,detail:{...detail,player:this,source:this}})); }
    }
}

export const VideoPlayerComponent = VideoPlayer.VideoPlayer;
export { VideoPlayerComponent as AriannaVideoPlayer };
export default VideoPlayer.VideoPlayer;

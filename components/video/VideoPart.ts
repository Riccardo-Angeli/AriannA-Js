/**
 * @module    components/video/VideoPart
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description Timeline video clip with filmstrip thumbnails, cross-track move,
 *              trim handles, snapping and keyboard edit operations.
 */

import { Component, Css, Templates } from '../../core/index.ts';

export interface VideoPartOptions
{
    id?: string;
    start?: number;
    length?: number;
    sourceStart?: number;
    src?: string;
    label?: string;
    color?: string;
    theme?: 'dark' | 'light';
    speed?: number;
    opacity?: number;
    volume?: number;
    muted?: boolean;
    locked?: boolean;
}

const FilmstripCache = new Map<string, Promise<string[]>>();

async function CaptureFilmstrip(src: string, frames = 7): Promise<string[]>
{
    const key = `${new URL(src, document.baseURI).href}|${frames}`;
    const cached = FilmstripCache.get(key);
    if(cached) return cached;

    const task = new Promise<string[]>(resolve =>
    {
        const video = document.createElement('video');
        video.preload = 'auto';
        video.muted = true;
        video.playsInline = true;
        video.crossOrigin = 'anonymous';
        video.src = src;

        const finish = (value: string[]) => { try { video.removeAttribute('src'); video.load(); } catch {} resolve(value); };
        const timer = window.setTimeout(() => finish([]), 6500);

        video.addEventListener('loadedmetadata', async () =>
        {
            try
            {
                const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 1;
                const canvas = document.createElement('canvas'); canvas.width = 160; canvas.height = 90;
                const context = canvas.getContext('2d'); if(!context) { clearTimeout(timer); finish([]); return; }
                const images: string[] = [];
                for(let i = 0; i < frames; i++)
                {
                    const target = Math.min(Math.max(.01, duration * ((i + .5) / frames)), Math.max(.01, duration - .02));
                    await new Promise<void>(done =>
                    {
                        const onSeek = () => { video.removeEventListener('seeked', onSeek); done(); };
                        video.addEventListener('seeked', onSeek, { once: true });
                        try { video.currentTime = target; } catch { done(); }
                        window.setTimeout(done, 700);
                    });
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    images.push(canvas.toDataURL('image/jpeg', .72));
                }
                clearTimeout(timer); finish(images);
            }
            catch { clearTimeout(timer); finish([]); }
        }, { once: true });
        video.addEventListener('error', () => { clearTimeout(timer); finish([]); }, { once: true });
    });

    FilmstripCache.set(key, task);
    return task;
}

export namespace VideoPart
{
    export const html = Templates.Template.Html;
    export const Styles = new Css.Stylesheet([
        new Css.Rule('arianna-video-part, .VideoPart', {
            '--VideoPart-Color': '#4f88c7',
            Background: 'color-mix(in srgb,var(--VideoPart-Color) 70%,#22272d)',
            Border: '1px solid color-mix(in srgb,var(--VideoPart-Color) 78%,#121518)',
            BorderRadius: '3px', Bottom: '5px', BoxShadow: 'inset 0 1px 0 rgba(255,255,255,.16),0 2px 4px rgba(0,0,0,.34)', BoxSizing: 'border-box', Color: '#f1f4f7', Cursor: 'grab', Left: '0', MinWidth: '10px', Overflow: 'hidden', Position: 'absolute', Top: '5px', UserSelect: 'none'
        }),
        new Css.Rule('.VideoPart-Label', { Background: 'linear-gradient(180deg,rgba(7,9,11,.75),rgba(7,9,11,.48))', Color: '#f4f7fa', Font: '700 9px/1 var(--arianna-font,system-ui,sans-serif)', Left: '0', Overflow: 'hidden', Padding: '4px 6px', Position: 'absolute', Right: '0', TextOverflow: 'ellipsis', Top: '0', WhiteSpace: 'nowrap', ZIndex: '3' }),
        new Css.Rule('.VideoPart-Filmstrip', { Bottom: '0', Display: 'flex', Gap: '1px', Left: '0', Opacity: '.96', Overflow: 'hidden', Position: 'absolute', Right: '0', Top: '18px' }),
        new Css.Rule('.VideoPart-Frame', { Background: 'linear-gradient(135deg,#303942,#1b2026)', BackgroundPosition: 'center', BackgroundSize: 'cover', Flex: '1 0 46px', MinWidth: '32px' }),
        new Css.Rule('.VideoPart-AudioBand', { Background: 'repeating-linear-gradient(to right,transparent 0 3px,rgba(255,255,255,.18) 3px 4px,transparent 4px 7px)', Bottom: '2px', Height: '8px', Left: '3px', Opacity: '.58', PointerEvents: 'none', Position: 'absolute', Right: '3px', ZIndex: '2' }),
        new Css.Rule('.VideoPart-Resize', { Bottom: '0', Cursor: 'ew-resize', Position: 'absolute', Top: '0', Width: '8px', ZIndex: '5' }),
        new Css.Rule('.VideoPart-Resize[data-side="left"]', { Left: '0' }),
        new Css.Rule('.VideoPart-Resize[data-side="right"]', { Right: '0' }),
        new Css.Rule('.VideoPart-Resize:hover', { Background: 'rgba(255,255,255,.22)' }),
        new Css.Rule('.VideoPart[selected]', { BoxShadow: 'inset 0 0 0 2px #f4f5f7,0 0 0 1px #0b0d0f,0 2px 7px rgba(0,0,0,.45)' }),
        new Css.Rule('.VideoPart[data-dragging="true"]', { Opacity: '.18' }),
        new Css.Rule('.VideoPart-DragPreview', { BorderColor: '#fff', BoxShadow: '0 0 0 2px rgba(228,12,136,.72),0 9px 22px rgba(0,0,0,.46)', Opacity: '.9', PointerEvents: 'none', ZIndex: '80' }),
        new Css.Rule('.VideoPart[locked], arianna-video-part[locked]', { Cursor: 'not-allowed', Filter: 'grayscale(.35)', Opacity: '.7' }),
        new Css.Rule('arianna-video-part[theme="light"], .VideoPart[theme="light"], arianna-video-track[theme="light"] .VideoPart, .VideoTrack[theme="light"] .VideoPart, arianna-video-track-editor[theme="light"] .VideoPart, .VideoTrackEditor[theme="light"] .VideoPart', { Background: 'color-mix(in srgb,var(--VideoPart-Color) 56%,#fff)', BorderColor: 'color-mix(in srgb,var(--VideoPart-Color) 55%,#aeb5bc)', Color: '#20262c' }),
        new Css.Rule('arianna-video-part[theme="light"] .VideoPart-Label, .VideoPart[theme="light"] .VideoPart-Label, arianna-video-track[theme="light"] .VideoPart-Label, .VideoTrack[theme="light"] .VideoPart-Label, arianna-video-track-editor[theme="light"] .VideoPart-Label, .VideoTrackEditor[theme="light"] .VideoPart-Label', { Background: 'linear-gradient(180deg,rgba(255,255,255,.88),rgba(245,247,249,.72))', Color: '#283039' })
    ]);

    @Component('arianna-video-part', Styles, {
        Shadow: false,
        Attributes: ['start','length','source-start','src','label','color','theme','speed','opacity','volume','muted','locked']
    })
    export class VideoPart extends HTMLElement
    {
        public static readonly Styles = Styles;
        public template = html``;
        private Bound?: boolean;

        constructor(options: VideoPartOptions = {})
        {
            super();
            if(options.id) this.id = options.id;
            if(options.start != null) this.setAttribute('start', String(options.start));
            if(options.length != null) this.setAttribute('length', String(options.length));
            if(options.sourceStart != null) this.setAttribute('source-start', String(options.sourceStart));
            if(options.src) this.setAttribute('src', options.src);
            if(options.label) this.setAttribute('label', options.label);
            if(options.color) this.setAttribute('color', options.color);
            if(options.theme) this.setAttribute('theme', options.theme);
            if(options.speed != null) this.setAttribute('speed', String(options.speed));
            if(options.opacity != null) this.setAttribute('opacity', String(options.opacity));
            if(options.volume != null) this.setAttribute('volume', String(options.volume));
            if(options.muted) this.setAttribute('muted', '');
            if(options.locked) this.setAttribute('locked', '');
        }

        public onCreated(): void { if(this.isConnected) this.onConnected(); }
        public onConnected(): void
        {
            this.classList.add('VideoPart');
            if(!this.hasAttribute('tabindex')) this.tabIndex = 0;
            this.style.setProperty('--VideoPart-Color', this.getAttribute('color') || '#4f88c7');
            this.Render(); this.Position(); this.BindInteraction(); void this.EnsureFilmstrip();
        }
        public onAttributeChanged(name: string): void
        {
            if(!this.isConnected) return;
            if(name === 'start' || name === 'length') this.Position();
            else if(name === 'color') this.style.setProperty('--VideoPart-Color', this.getAttribute('color') || '#4f88c7');
            else if(name === 'label') { const node=this.querySelector<HTMLElement>(':scope > .VideoPart-Label'); if(node) node.textContent=this.label; }
            else if(name === 'src') void this.EnsureFilmstrip();
        }

        public get start(): number { return this.SafeNumber(this.getAttribute('start'), 0, 0); }
        public set start(value: number) { this.setAttribute('start', String(Math.max(0, Number(value)||0))); this.Position(); }
        public get length(): number { return this.SafeNumber(this.getAttribute('length'), 4, .04); }
        public set length(value: number) { this.setAttribute('length', String(Math.max(.04, Number(value)||.04))); this.Position(); }
        public get sourceStart(): number { return this.SafeNumber(this.getAttribute('source-start'), 0, 0); }
        public set sourceStart(value: number) { this.setAttribute('source-start', String(Math.max(0, Number(value)||0))); }
        public get label(): string { return this.getAttribute('label') || 'Video'; }
        public set label(value: string) { this.setAttribute('label', value); }
        public get speed(): number { return this.SafeNumber(this.getAttribute('speed'), 1, .01); }
        public set speed(value: number) { this.setAttribute('speed', String(Math.max(.01, Number(value)||1))); }
        public get opacity(): number { return Math.max(0,Math.min(1,this.SafeNumber(this.getAttribute('opacity'),1,0))); }
        public set opacity(value: number) { this.setAttribute('opacity',String(Math.max(0,Math.min(1,Number(value)||0)))); }
        public get volume(): number { return Math.max(0,Math.min(2,this.SafeNumber(this.getAttribute('volume'),1,0))); }
        public set volume(value: number) { this.setAttribute('volume',String(Math.max(0,Math.min(2,Number(value)||0)))); }

        public snapshot(): VideoPartOptions
        {
            return { id:this.id||undefined,start:this.start,length:this.length,sourceStart:this.sourceStart,src:this.getAttribute('src')||undefined,label:this.getAttribute('label')||undefined,color:this.getAttribute('color')||undefined,theme:(this.getAttribute('theme') as 'dark'|'light'|null)||undefined,speed:this.speed,opacity:this.opacity,volume:this.volume,muted:this.hasAttribute('muted'),locked:this.hasAttribute('locked') };
        }

        public split(at: number): VideoPart | null
        {
            const cut = Math.max(this.start + .04, Math.min(this.start + this.length - .04, at));
            if(cut <= this.start || cut >= this.start + this.length) return null;
            const leftLength = cut - this.start;
            const rightLength = this.length - leftLength;
            const ctor = this.constructor as { new(options?: VideoPartOptions): VideoPart };
            const next = new ctor({ ...this.snapshot(), id: undefined, start: cut, length: rightLength, sourceStart: this.sourceStart + leftLength * this.speed, label: this.label });
            this.length = leftLength;
            this.parentElement?.appendChild(next);
            next.onConnected?.();
            this.Emit('arianna:video-part-split',{at,left:this,right:next});
            return next;
        }

        private Render(): void
        {
            if(this.querySelector(':scope > .VideoPart-Label')) return;
            const label=document.createElement('span'); label.className='VideoPart-Label'; label.textContent=this.label;
            const strip=document.createElement('span'); strip.className='VideoPart-Filmstrip'; for(let i=0;i<7;i++){const frame=document.createElement('span');frame.className='VideoPart-Frame';strip.appendChild(frame);}
            const audio=document.createElement('span'); audio.className='VideoPart-AudioBand';
            const left=document.createElement('span'); left.className='VideoPart-Resize'; left.dataset.side='left'; left.title='Trim in';
            const right=document.createElement('span'); right.className='VideoPart-Resize'; right.dataset.side='right'; right.title='Trim out';
            this.append(label,strip,audio,left,right);
        }

        private async EnsureFilmstrip(): Promise<void>
        {
            const src=this.getAttribute('src')?.trim(); const strip=this.querySelector<HTMLElement>(':scope > .VideoPart-Filmstrip'); if(!src||!strip)return;
            const token=new URL(src,document.baseURI).href; strip.dataset.source=token;
            try
            {
                const frames=await CaptureFilmstrip(src,7); if(!this.isConnected||strip.dataset.source!==token||!frames.length)return;
                const nodes=Array.from(strip.querySelectorAll<HTMLElement>('.VideoPart-Frame')); nodes.forEach((node,index)=>{node.style.backgroundImage=`url("${frames[index%frames.length]}")`;}); strip.dataset.ready='true';
            }
            catch { strip.removeAttribute('data-ready'); }
        }

        private BindInteraction(): void
        {
            if(this.Bound) return; this.Bound=true;
            type DragState={mode:'move'|'resize-left'|'resize-right';pointerId:number;x:number;start:number;length:number;sourceStart:number;grabTime:number;};
            let drag:DragState|null=null; let preview:HTMLElement|null=null; let previewLane:HTMLElement|null=null; let previewStart=0;
            const clearPreview=()=>{preview?.remove();preview=null;previewLane=null;this.removeAttribute('data-dragging');};
            const laneAt=(event:PointerEvent):HTMLElement|null=>
            {
                const editor=this.closest('arianna-video-track-editor,.VideoTrackEditor') as HTMLElement|null;
                if(!editor){const lane=this.closest('.VideoTrack-Lane') as HTMLElement|null;if(!lane)return null;const rect=lane.getBoundingClientRect();return event.clientY>=rect.top-32&&event.clientY<=rect.bottom+32?lane:null;}
                for(const element of document.elementsFromPoint(event.clientX,event.clientY)){const lane=element.closest?.('.VideoTrack-Lane') as HTMLElement|null;if(lane&&editor.contains(lane))return lane;}
                let best:HTMLElement|null=null,bestDistance=Infinity;for(const lane of Array.from(editor.querySelectorAll<HTMLElement>('.VideoTrack-Lane'))){const r=lane.getBoundingClientRect();const d=event.clientY<r.top?r.top-event.clientY:event.clientY>r.bottom?event.clientY-r.bottom:0;if(d<bestDistance){best=lane;bestDistance=d;}}return bestDistance<=32?best:null;
            };
            const ensurePreview=()=>
            {
                if(preview)return preview; preview=document.createElement('div');preview.className='VideoPart VideoPart-DragPreview';preview.style.setProperty('--VideoPart-Color',this.getAttribute('color')||'#4f88c7');const label=document.createElement('span');label.className='VideoPart-Label';label.textContent=this.label;const strip=this.querySelector<HTMLElement>(':scope > .VideoPart-Filmstrip')?.cloneNode(true) as HTMLElement|null;if(strip)preview.append(label,strip);else preview.append(label);return preview;
            };
            const updatePreview=(event:PointerEvent)=>
            {
                if(!drag||drag.mode!=='move')return;const lane=laneAt(event);if(!lane){preview?.remove();preview=null;previewLane=null;return;}const pps=this.PixelsPerSecond();const rect=lane.getBoundingClientRect();const raw=(event.clientX-rect.left)/pps-drag.grabTime;const editor=this.closest('arianna-video-track-editor,.VideoTrackEditor') as HTMLElement|null;const duration=editor?this.SafeNumber(editor.getAttribute('duration'),Math.max(drag.length,rect.width/pps),.04):Math.max(drag.length,rect.width/pps);previewStart=Math.max(0,Math.min(Math.max(0,duration-drag.length),this.Snap(raw)));previewLane=lane;const ghost=ensurePreview();ghost.style.position='absolute';ghost.style.width=`${Math.max(12,drag.length*pps)}px`;ghost.style.height=`${Math.max(12,rect.height-10)}px`;if(editor){const er=editor.getBoundingClientRect();if(ghost.parentElement!==editor)editor.appendChild(ghost);ghost.style.left=`${rect.left-er.left+previewStart*pps}px`;ghost.style.top=`${rect.top-er.top+5}px`;}else{if(ghost.parentElement!==lane)lane.appendChild(ghost);ghost.style.left=`${previewStart*pps}px`;ghost.style.top='5px';}this.dataset.dragging='true';
            };
            const move=(event:PointerEvent)=>
            {
                if(!drag||drag.pointerId!==event.pointerId)return;const pps=this.PixelsPerSecond();const delta=this.Snap((event.clientX-drag.x)/pps);
                if(drag.mode==='move'){if(this.closest('arianna-video-track-editor,.VideoTrackEditor'))updatePreview(event);else{this.start=Math.max(0,drag.start+delta);this.Emit('arianna:video-part-change',{mode:'move'});}}
                else if(drag.mode==='resize-right'){this.length=Math.max(.04,drag.length+delta);this.Emit('arianna:video-part-change',{mode:'trim-out'});}
                else{const end=drag.start+drag.length;const nextStart=Math.max(0,Math.min(end-.04,drag.start+delta));const shift=nextStart-drag.start;this.start=nextStart;this.length=Math.max(.04,end-nextStart);this.sourceStart=Math.max(0,drag.sourceStart+shift*this.speed);this.Emit('arianna:video-part-change',{mode:'trim-in'});}
            };
            const finish=(event:PointerEvent)=>
            {
                if(!drag||drag.pointerId!==event.pointerId)return;const state=drag;drag=null;window.removeEventListener('pointermove',move,true);window.removeEventListener('pointerup',finish,true);window.removeEventListener('pointercancel',finish,true);try{this.releasePointerCapture(event.pointerId);}catch{};this.style.cursor='';const cancelled=event.type==='pointercancel';if(cancelled){this.start=state.start;this.length=state.length;this.sourceStart=state.sourceStart;}else if(state.mode==='move'&&previewLane){previewLane.appendChild(this);this.start=previewStart;this.onConnected?.();this.Emit('arianna:video-part-change',{mode:'move'});}clearPreview();this.Emit('arianna:video-part-commit',{mode:state.mode,cancelled});
            };
            this.addEventListener('click',event=>{event.stopPropagation();this.Select();});
            this.addEventListener('pointerdown',event=>
            {
                if(event.button!==0||this.hasAttribute('locked')||this.closest('arianna-video-track[locked],.VideoTrack[locked]'))return;const target=event.target as HTMLElement;const handle=target.closest('.VideoPart-Resize') as HTMLElement|null;const mode:DragState['mode']=handle?.dataset.side==='left'?'resize-left':handle?.dataset.side==='right'?'resize-right':'move';const pps=this.PixelsPerSecond();const rect=this.getBoundingClientRect();drag={mode,pointerId:event.pointerId,x:event.clientX,start:this.start,length:this.length,sourceStart:this.sourceStart,grabTime:Math.max(0,(event.clientX-rect.left)/pps)};this.Select();this.style.cursor=mode==='move'?'grabbing':'ew-resize';event.preventDefault();event.stopPropagation();try{this.setPointerCapture(event.pointerId);}catch{};window.addEventListener('pointermove',move,true);window.addEventListener('pointerup',finish,true);window.addEventListener('pointercancel',finish,true);if(mode==='move'&&this.closest('arianna-video-track-editor,.VideoTrackEditor'))updatePreview(event);
            });
            this.addEventListener('keydown',event=>
            {
                const primary=event.metaKey||event.ctrlKey;if(event.key==='Delete'||event.key==='Backspace'){event.preventDefault();this.Emit('arianna:video-part-delete');}
                else if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();const direction=event.key==='ArrowLeft'?-1:1;this.start=Math.max(0,this.start+direction*this.Snap(event.shiftKey?1:.1));this.Emit('arianna:video-part-change',{mode:'nudge'});}
                else if(primary&&event.key.toLowerCase()==='b'){event.preventDefault();const editor=this.closest('arianna-video-track-editor,.VideoTrackEditor') as HTMLElement&{playhead?:number}|null;this.split(editor?.playhead??(this.start+this.length/2));}
            });
        }

        private Select(): void
        {
            const editor=this.closest('arianna-video-track-editor,.VideoTrackEditor');editor?.querySelectorAll('arianna-video-part,.VideoPart').forEach(part=>part.toggleAttribute('selected',part===this));this.setAttribute('selected','');this.focus();this.Emit('arianna:video-part-select');
        }
        private PixelsPerSecond(): number { const editor=this.closest('arianna-video-track-editor,.VideoTrackEditor');const track=this.closest('arianna-video-track,.VideoTrack');return this.SafeNumber(editor?.getAttribute('pixels-per-second')??track?.getAttribute('pixels-per-second'),36,1); }
        private Snap(value:number):number { const editor=this.closest('arianna-video-track-editor,.VideoTrackEditor');const track=this.closest('arianna-video-track,.VideoTrack');const step=this.SafeNumber(editor?.getAttribute('snap')??track?.getAttribute('snap'),.1,.001);return Math.round(value/step)*step; }
        private Position():void { const pps=this.PixelsPerSecond();this.style.left=`${this.start*pps}px`;this.style.width=`${Math.max(12,this.length*pps)}px`;this.style.opacity=String(this.opacity); }
        private SafeNumber(value:unknown,fallback:number,min=-Infinity):number { const n=Number(value);return Number.isFinite(n)?Math.max(min,n):fallback; }
        private Emit(type:string,detail:Record<string,unknown>={}):void { this.dispatchEvent(new CustomEvent(type,{bubbles:true,composed:true,detail:{...detail,part:this,source:this}})); }
    }
}

export const VideoPartComponent = VideoPart.VideoPart;
export { VideoPartComponent as VideoPartElement };
export default VideoPart.VideoPart;

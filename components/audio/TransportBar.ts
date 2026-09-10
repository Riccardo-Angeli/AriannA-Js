/**
 * @module components/audio/TransportBar
 * @version 2.0.0
 */
import { Component, Css, Templates } from '../../core/index.ts';

const html = Templates.Template.Html;

export namespace TransportBar
{
    export namespace Types
    {
        export type Theme = 'dark' | 'light';
    }

    export namespace Interfaces
    {
        export interface TransportBarOptions
        {
            duration?: number;
            current?: number;
            playing?: boolean;
            volume?: number;
            showVolume?: boolean;
            showStop?: boolean;
            showSkip?: boolean;
            theme?: Types.Theme;
            src?: string;
        }
    }

    export const Styles = new Css.Stylesheet([
        new Css.Rule('.TransportBar', {
            AlignItems: 'center', Background: '#24282d', Border: '1px solid #0b0d0f',
            BorderRadius: '5px', BoxShadow: 'inset 0 1px 0 rgba(255,255,255,.05), 0 1px 3px rgba(0,0,0,.35)',
            BoxSizing: 'border-box', Color: '#e8ebee', Display: 'flex', FontFamily: 'var(--arianna-font, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif)',
            Gap: '5px', MinHeight: '38px', Padding: '5px 7px', Width: '100%'
        }),
        new Css.Rule('.TransportBar-Button', {
            AlignItems: 'center', Appearance: 'none', Background: 'linear-gradient(180deg,#3a3f45,#272b30)',
            Border: '1px solid #111417', BorderRadius: '3px', BoxShadow: 'inset 0 1px 0 rgba(255,255,255,.08)',
            Color: '#dfe3e7', Cursor: 'pointer', Display: 'inline-flex', Font: '600 11px/1 var(--arianna-font,system-ui,sans-serif)',
            Height: '27px', JustifyContent: 'center', MinWidth: '27px', Padding: '0 7px'
        }),
        new Css.Rule('.TransportBar-Button:hover', { Background: 'linear-gradient(180deg,#474d54,#30353a)' }),
        new Css.Rule('.TransportBar-Button[data-active="true"]', {
            Background: 'linear-gradient(180deg,#5aa8f7,#327dcc)', BorderColor: '#1b5f9f', Color: '#fff'
        }),
        new Css.Rule('.TransportBar-Time', {
            Background: '#101316', Border: '1px solid #0a0c0e', BorderRadius: '3px', Color: '#d8f1ff',
            Font: '600 11px/1.1 ui-monospace, SFMono-Regular, Menlo, monospace', LetterSpacing: '.04em',
            MinWidth: '76px', Padding: '7px 8px', TextAlign: 'center'
        }),
        new Css.Rule('.TransportBar-Range', {
            AccentColor: '#4c9be8', Cursor: 'pointer', Flex: '1 1 120px', MinWidth: '72px'
        }),
        new Css.Rule('.TransportBar-VolumeWrap', {
            AlignItems: 'center', Display: 'flex', Gap: '5px', MinWidth: '92px'
        }),
        new Css.Rule('.TransportBar-VolumeIcon', { Color: '#9098a0', FontSize: '11px' }),
        new Css.Rule('.TransportBar[theme="light"]', {
            Background: '#f0f2f4', BorderColor: '#c8ccd1', BoxShadow: 'inset 0 1px 0 #fff, 0 1px 3px rgba(0,0,0,.12)', Color: '#22262a'
        }),
        new Css.Rule('.TransportBar[theme="light"] .TransportBar-Button', {
            Background: 'linear-gradient(180deg,#ffffff,#e2e5e8)', BorderColor: '#bfc4c9', Color: '#33383d'
        }),
        new Css.Rule('.TransportBar[theme="light"] .TransportBar-Button:hover', {
            Background: 'linear-gradient(180deg,#fff,#d9dde1)'
        }),
        new Css.Rule('.TransportBar[theme="light"] .TransportBar-Time', {
            Background: '#fff', BorderColor: '#c9cdd1', Color: '#1c3f56'
        })
    ]);

    @Component('arianna-transport-bar', Styles, {
        Shadow: false,
        Attributes: ['duration', 'current', 'playing', 'volume', 'show-volume', 'show-stop', 'show-skip', 'theme', 'src']
    })
    export class TransportBar extends HTMLElement
    {
        public static readonly Styles = Styles;
        public template = html``;

        private Bound = false;
        private Time?: HTMLElement;
        private Position?: HTMLInputElement;
        private Volume?: HTMLInputElement;
        private Play?: HTMLButtonElement;
        private Audio?: HTMLAudioElement;
        private Raf = 0;

        constructor(options: Interfaces.TransportBarOptions = {})
        {
            super();
            if(options.duration != null) this.setAttribute('duration', String(options.duration));
            if(options.current != null) this.setAttribute('current', String(options.current));
            if(options.playing != null) this.toggleAttribute('playing', options.playing);
            if(options.volume != null) this.setAttribute('volume', String(options.volume));
            if(options.showVolume != null) this.setAttribute('show-volume', String(options.showVolume));
            if(options.showStop != null) this.setAttribute('show-stop', String(options.showStop));
            if(options.showSkip != null) this.setAttribute('show-skip', String(options.showSkip));
            if(options.theme) this.setAttribute('theme', options.theme);
            if(options.src) this.setAttribute('src', options.src);
        }

        public onConnected(): void
        {
            this.classList.add('TransportBar');
            if(!this.hasAttribute('theme')) this.setAttribute('theme', 'dark');
            this.Render();
            this.SyncAudio();
            this.Sync();
        }

        public onAttributeChanged(name: string): void
        {
            if(!this.isConnected) return;
            if(name === 'src') this.SyncAudio();
            else if(name === 'volume' && this.Audio) this.Audio.volume = this.volume;
            this.Sync();
        }

        public get duration(): number { return Number(this.getAttribute('duration') ?? 0) || 0; }
        public set duration(value: number) { this.setAttribute('duration', String(Math.max(0, value))); this.Sync(); }
        public get current(): number { return Number(this.getAttribute('current') ?? 0) || 0; }
        public set current(value: number) { this.setAttribute('current', String(Math.max(0, value))); this.Sync(); }
        public get playing(): boolean { return this.hasAttribute('playing'); }
        public set playing(value: boolean) { this.toggleAttribute('playing', value); this.Sync(); }
        public get volume(): number { return Number(this.getAttribute('volume') ?? 1); }
        public set volume(value: number) { this.setAttribute('volume', String(Math.max(0, Math.min(1, value)))); this.Sync(); }

        private Render(): void
        {
            if(this.querySelector(':scope > .TransportBar-Time')) return;

            const previous = this.Button('⏮', 'previous', 'Previous');
            const rewind = this.Button('◀', 'rewind', 'Rewind');
            const play = this.Button('▶', 'play', 'Play / Pause');
            const stop = this.Button('■', 'stop', 'Stop');
            const forward = this.Button('▶', 'forward', 'Forward');
            const next = this.Button('⏭', 'next', 'Next');

            this.Play = play;
            this.Time = document.createElement('span');
            this.Time.className = 'TransportBar-Time';

            this.Position = document.createElement('input');
            this.Position.type = 'range';
            this.Position.className = 'TransportBar-Range';
            this.Position.min = '0';
            this.Position.step = '0.01';
            this.Position.setAttribute('aria-label', 'Timeline position');

            const volumeWrap = document.createElement('span');
            volumeWrap.className = 'TransportBar-VolumeWrap';
            const volumeIcon = document.createElement('span');
            volumeIcon.className = 'TransportBar-VolumeIcon';
            volumeIcon.textContent = 'VOL';
            this.Volume = document.createElement('input');
            this.Volume.type = 'range';
            this.Volume.className = 'TransportBar-Range';
            this.Volume.min = '0';
            this.Volume.max = '1';
            this.Volume.step = '0.01';
            this.Volume.setAttribute('aria-label', 'Volume');
            volumeWrap.append(volumeIcon, this.Volume);

            const skip = this.getAttribute('show-skip') === 'true';
            const showStop = this.getAttribute('show-stop') !== 'false';
            const showVolume = this.getAttribute('show-volume') !== 'false';

            if(skip) this.add(previous, rewind);
            this.add(play);
            if(showStop) this.add(stop);
            if(skip) this.add(forward, next);
            this.add(this.Time, this.Position);
            if(showVolume) this.add(volumeWrap);

            if(this.Bound) return;
            this.Bound = true;

            play.addEventListener('click', () =>
            {
                if(this.Audio)
                {
                    if(this.Audio.paused)
                    {
                        void this.Audio.play().catch(() => undefined);
                    }
                    else
                    {
                        this.Audio.pause();
                    }
                    return;
                }

                this.playing = !this.playing;
                this.Emit(this.playing ? 'arianna:play' : 'arianna:pause');
            });
            stop.addEventListener('click', () =>
            {
                if(this.Audio)
                {
                    this.Audio.pause();
                    try { this.Audio.currentTime = 0; } catch {}
                }
                this.playing = false;
                this.current = 0;
                this.Emit('arianna:stop');
            });
            previous.addEventListener('click', () => this.Emit('arianna:previous'));
            next.addEventListener('click', () => this.Emit('arianna:next'));
            rewind.addEventListener('click', () => this.Emit('arianna:rewind'));
            forward.addEventListener('click', () => this.Emit('arianna:forward'));
            this.Position.addEventListener('input', () =>
            {
                this.current = Number(this.Position?.value ?? 0);
                if(this.Audio)
                {
                    try { this.Audio.currentTime = this.current; } catch {}
                }
                this.Emit('arianna:seek', { current: this.current });
            });
            this.Volume.addEventListener('input', () =>
            {
                this.volume = Number(this.Volume?.value ?? 1);
                if(this.Audio) this.Audio.volume = this.volume;
                this.Emit('arianna:volume', { volume: this.volume });
            });
        }

        private SyncAudio(): void
        {
            const src = this.getAttribute('src')?.trim() ?? '';

            if(!src)
            {
                if(this.Audio)
                {
                    this.Audio.pause();
                    this.Audio.remove();
                    this.Audio = undefined;
                }
                return;
            }

            if(!this.Audio)
            {
                const audio = document.createElement('audio');
                audio.hidden = true;
                audio.preload = 'metadata';
                this.Audio = audio;
                this.add(audio);

                audio.addEventListener('loadedmetadata', () =>
                {
                    this.duration = Number.isFinite(audio.duration) ? audio.duration : 0;
                    this.current = audio.currentTime || 0;
                    audio.volume = this.volume;
                    this.Sync();
                });
                audio.addEventListener('play', () =>
                {
                    this.playing = true;
                    this.Emit('arianna:play');
                    this.TickAudio();
                });
                audio.addEventListener('pause', () =>
                {
                    this.playing = false;
                    if(this.Raf) cancelAnimationFrame(this.Raf);
                    this.Raf = 0;
                    this.Emit('arianna:pause');
                });
                audio.addEventListener('ended', () =>
                {
                    this.playing = false;
                    this.current = audio.duration || 0;
                    this.Sync();
                });
            }

            const resolved = new URL(src, document.baseURI).href;
            if(this.Audio.src !== resolved) this.Audio.src = src;
            this.Audio.volume = this.volume;
        }

        private TickAudio(): void
        {
            const audio = this.Audio;
            if(!audio || audio.paused) return;
            this.current = audio.currentTime || 0;
            if(Number.isFinite(audio.duration)) this.duration = audio.duration;
            this.Raf = requestAnimationFrame(() => this.TickAudio());
        }

        private Button(text: string, action: string, title: string): HTMLButtonElement
        {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'TransportBar-Button';
            button.dataset.action = action;
            button.title = title;
            button.textContent = text;
            return button;
        }

        private Sync(): void
        {
            if(this.Play)
            {
                this.Play.textContent = this.playing ? '❚❚' : '▶';
                this.Play.dataset.active = String(this.playing);
            }
            if(this.Time) this.Time.textContent = `${FormatTime(this.current)} / ${FormatTime(this.duration)}`;
            if(this.Position)
            {
                this.Position.max = String(Math.max(this.duration, 0.01));
                this.Position.value = String(Math.min(this.current, Math.max(this.duration, 0.01)));
            }
            if(this.Volume) this.Volume.value = String(this.volume);
        }

        public onUnmount(): void
        {
            if(this.Raf) cancelAnimationFrame(this.Raf);
            this.Raf = 0;
            this.Audio?.pause();
        }

        private Emit(type: string, detail: Record<string, unknown> = {}): void
        {
            this.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail: { ...detail, source: this } }));
        }
    }

    export function FormatTime(seconds: number): string
    {
        const safe = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
        const minutes = Math.floor(safe / 60);
        const rest = Math.floor(safe % 60);
        return `${minutes}:${String(rest).padStart(2, '0')}`;
    }

    export const fmtTime = FormatTime;
    export const FmtTime = FormatTime;
}

export default TransportBar;

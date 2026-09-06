/**
 * @module components/audio/AudioPlayer
 * @version 2.0.0
 */
import { Component, Css, Templates } from '../../core/index.ts';
import { AudioComponent as AudioComponentModule } from './AudioComponent.ts';
import { TransportBar } from './TransportBar.ts';

const html = Templates.Template.Html;

export namespace AudioPlayer
{
    export namespace Types
    {
        export type Theme = 'dark' | 'light';
    }

    export namespace Interfaces
    {
        export interface AudioPlayerOptions extends AudioComponentModule.AudioComponentOptions
        {
            src?: string;
            autoplay?: boolean;
            loop?: boolean;
            label?: string;
            theme?: Types.Theme;
        }
    }

    export const Styles = new Css.Stylesheet([
        new Css.Rule('.AudioPlayer', {
            Background: '#171a1e', Border: '1px solid #0c0e10', BorderRadius: '6px',
            BoxShadow: 'inset 0 1px 0 rgba(255,255,255,.04), 0 2px 8px rgba(0,0,0,.3)',
            BoxSizing: 'border-box', Color: '#e7eaed', Display: 'grid', Gap: '7px',
            FontFamily: 'var(--arianna-font, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif)',
            Padding: '8px', Width: '100%'
        }),
        new Css.Rule('.AudioPlayer-Header', {
            AlignItems: 'center', Display: 'flex', Gap: '8px', MinHeight: '24px', Padding: '0 3px'
        }),
        new Css.Rule('.AudioPlayer-Indicator', {
            Background: '#4c9be8', BorderRadius: '50%', BoxShadow: '0 0 0 1px rgba(255,255,255,.12)', Height: '7px', Width: '7px'
        }),
        new Css.Rule('.AudioPlayer-Label', {
            Color: '#d7dce1', Flex: '1 1 auto', FontSize: '11px', FontWeight: '650', MinWidth: '0', Overflow: 'hidden', TextOverflow: 'ellipsis', WhiteSpace: 'nowrap'
        }),
        new Css.Rule('.AudioPlayer-State', {
            Color: '#7f8992', Font: '10px/1 ui-monospace, SFMono-Regular, Menlo, monospace', TextTransform: 'uppercase'
        }),
        new Css.Rule('.AudioPlayer-Audio', { Display: 'none' }),
        new Css.Rule('.AudioPlayer[theme="light"]', {
            Background: '#f8f9fa', BorderColor: '#c9cdd1', BoxShadow: 'inset 0 1px 0 #fff, 0 2px 8px rgba(0,0,0,.10)', Color: '#24282c'
        }),
        new Css.Rule('.AudioPlayer[theme="light"] .AudioPlayer-Label', { Color: '#30353a' }),
        new Css.Rule('.AudioPlayer[theme="light"] .AudioPlayer-State', { Color: '#7a8188' })
    ]);

    @Component('arianna-audio-player', Styles, {
        Shadow: false,
        Attributes: ['src', 'autoplay', 'loop', 'label', 'theme']
    })
    export class AudioPlayer extends AudioComponentModule.AudioComponent
    {
        public static readonly Styles = Styles;
        public template = html``;
        public static readonly tag = 'arianna-audio-player';

        private Audio?: HTMLAudioElement;
        private Transport?: TransportBar.TransportBar;
        private State?: HTMLElement;
        private Source?: MediaElementAudioSourceNode;
        private Gain?: GainNode;
        private Raf = 0;

        constructor(options: Interfaces.AudioPlayerOptions = {})
        {
            super(options);
            if(options.src) this.setAttribute('src', options.src);
            if(options.autoplay) this.setAttribute('autoplay', '');
            if(options.loop) this.setAttribute('loop', '');
            if(options.label) this.setAttribute('label', options.label);
            if(options.theme) this.setAttribute('theme', options.theme);
        }

        public onConnected(): void
        {
            super.onConnected();
            this.classList.add('AudioPlayer');
            if(!this.hasAttribute('theme')) this.setAttribute('theme', 'dark');
            if(!this.hasAttribute('src')) this.setAttribute('src', '/devtools/playground/assets/audio/VivaldiSummer.mp3');
            if(!this.hasAttribute('label')) this.setAttribute('label', 'Vivaldi · Summer');
            this.Render();
            this.SyncSource();
        }

        public onCreated(): void
        {
            requestAnimationFrame(() => { if(this.isConnected) this.onConnected(); });
        }

        public onAttributeChanged(name: string): void
        {
            if(!this.isConnected) return;
            if(name === 'src' || name === 'loop' || name === 'autoplay') this.SyncSource();
            else if(name === 'label')
            {
                const label = this.querySelector<HTMLElement>(':scope > .AudioPlayer-Header .AudioPlayer-Label');
                if(label) label.textContent = this.getAttribute('label') || 'Audio';
            }
            else if(name === 'theme')
            {
                this.Transport?.setAttribute('theme', this.getAttribute('theme') ?? 'dark');
            }
        }

        protected _buildAudioGraph(): void
        {
            if(!this.Audio) return;
            try
            {
                this.Source ??= this._audioCtx.createMediaElementSource(this.Audio);
                this.Gain ??= this._audioCtx.createGain();
                this.Source.connect(this.Gain);
                this._input = this.Gain;
                this._output = this.Gain;
                this.Gain.connect(this._audioCtx.destination);
            }
            catch {}
        }

        public setSource(src: string): this
        {
            this.setAttribute('src', src);
            this.SyncSource();
            return this;
        }

        public seek(time: number): void
        {
            if(!this.Audio) return;
            this.Audio.currentTime = Math.max(0, Math.min(this.Audio.duration || time, time));
            if(this.Transport) this.Transport.current = this.Audio.currentTime;
        }

        public get duration(): number { return this.Audio?.duration ?? 0; }
        public get currentTime(): number { return this.Audio?.currentTime ?? 0; }
        public get isPlaying(): boolean { return Boolean(this.Audio && !this.Audio.paused); }

        public async play(): Promise<void>
        {
            if(!this.Audio) return;
            try { await AudioComponentModule.AudioComponent.resume(); } catch {}
            await this.Audio.play();
        }

        public pause(): void
        {
            this.Audio?.pause();
        }

        public togglePlayback(): void
        {
            if(!this.Audio) return;
            if(this.Audio.paused) void this.play().catch(() => undefined);
            else this.pause();
        }

        private Render(): void
        {
            if(this.querySelector(':scope > .AudioPlayer-Header')) return;

            const header = document.createElement('div');
            header.className = 'AudioPlayer-Header';
            const indicator = document.createElement('span');
            indicator.className = 'AudioPlayer-Indicator';
            const label = document.createElement('span');
            label.className = 'AudioPlayer-Label';
            label.textContent = this.getAttribute('label') || 'Audio';
            this.State = document.createElement('span');
            this.State.className = 'AudioPlayer-State';
            this.State.textContent = 'ready';
            header.append(indicator, label, this.State);

            this.Audio = document.createElement('audio');
            this.Audio.className = 'AudioPlayer-Audio';
            this.Audio.preload = 'metadata';
            this.Audio.loop = this.hasAttribute('loop');

            this.Transport = document.createElement('arianna-transport-bar') as TransportBar.TransportBar;
            this.Transport.setAttribute('theme', this.getAttribute('theme') ?? 'dark');
            this.Transport.setAttribute('show-skip', 'true');

            this.append(header, this.Audio, this.Transport);
            this.Bind();
        }

        private Bind(): void
        {
            if(!this.Audio || !this.Transport) return;
            const audio = this.Audio;
            const transport = this.Transport;

            transport.addEventListener('arianna:play', () => void this.play().catch(() => undefined));
            transport.addEventListener('arianna:pause', () => this.pause());
            transport.addEventListener('arianna:stop', () => { audio.pause(); audio.currentTime = 0; });
            transport.addEventListener('arianna:seek', event =>
            {
                const current = Number((event as CustomEvent<{ current?: number }>).detail?.current ?? 0);
                if(Number.isFinite(current)) audio.currentTime = current;
            });
            transport.addEventListener('arianna:volume', event =>
            {
                const volume = Number((event as CustomEvent<{ volume?: number }>).detail?.volume ?? 1);
                audio.volume = Math.max(0, Math.min(1, volume));
                if(this.Gain) this.Gain.gain.value = audio.volume;
            });
            transport.addEventListener('arianna:rewind', () => this.seek(audio.currentTime - 5));
            transport.addEventListener('arianna:forward', () => this.seek(audio.currentTime + 5));

            audio.addEventListener('loadedmetadata', () =>
            {
                transport.duration = audio.duration || 0;
                if(this.State) this.State.textContent = 'ready';
                if(!this._output) this._buildAudioGraph();
            });
            audio.addEventListener('play', () =>
            {
                transport.playing = true;
                if(this.State) this.State.textContent = 'playing';
                this.Tick();
            });
            audio.addEventListener('pause', () =>
            {
                transport.playing = false;
                if(this.State) this.State.textContent = audio.ended ? 'ended' : 'paused';
                if(this.Raf) cancelAnimationFrame(this.Raf);
            });
            audio.addEventListener('ended', () =>
            {
                transport.playing = false;
                if(this.State) this.State.textContent = 'ended';
            });
        }

        private SyncSource(): void
        {
            if(!this.Audio) return;
            const source = this.getAttribute('src') ?? '';
            if(source && this.Audio.src !== new URL(source, document.baseURI).href) this.Audio.src = source;
            this.Audio.loop = this.hasAttribute('loop');
            if(this.hasAttribute('autoplay')) void this.Audio.play().catch(() => undefined);
        }

        private Tick(): void
        {
            if(!this.Audio || !this.Transport || this.Audio.paused) return;
            this.Transport.current = this.Audio.currentTime;
            this.Transport.duration = this.Audio.duration || 0;
            this.Raf = requestAnimationFrame(() => this.Tick());
        }

        public onUnmount(): void
        {
            if(this.Raf) cancelAnimationFrame(this.Raf);
            this.Audio?.pause();
            super.onUnmount();
        }
    }
}

export default AudioPlayer;

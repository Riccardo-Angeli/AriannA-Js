/**
 * @module components/audio/AudioComponent
 * @version 2.0.0
 */
import { Component, Css, Templates } from '../../core/index.ts';

const html = Templates.Template.Html;

export namespace AudioComponent
{
    export namespace Types
    {
        export type Theme = 'dark' | 'light';
    }

    export interface AudioComponentOptions
    {
        audioContext?: AudioContext;
        theme?: Types.Theme;
    }

    export namespace Interfaces
    {
        export interface Options extends AudioComponentOptions {}
    }

    let SharedContext: AudioContext | undefined;

    export function getSharedContext(): AudioContext
    {
        if(!SharedContext)
        {
            const Constructor = window.AudioContext ||
                (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            SharedContext = new Constructor();
        }
        return SharedContext;
    }

    export const GetSharedContext = getSharedContext;

    export const Styles = new Css.Stylesheet([
        new Css.Rule('.AudioComponent', {
            Display: 'contents'
        })
    ]);

    @Component('arianna-audio-base', Styles, {
        Shadow: false,
        Attributes: ['theme']
    })
    export abstract class AudioComponent extends HTMLElement
    {
        public static readonly Styles = Styles;
        public template = html``;

        protected _audioCtx: AudioContext = undefined as unknown as AudioContext;
        protected _input?: AudioNode;
        protected _output?: AudioNode;

        private readonly Downstream = new Set<AudioNode>();
        private readonly InitialContext?: AudioContext;

        constructor(options: AudioComponentOptions = {})
        {
            super();
            this.InitialContext = options.audioContext;
            if(options.theme) this.setAttribute('theme', options.theme);
        }

        public static get context(): AudioContext { return getSharedContext(); }

        public static async resume(): Promise<void>
        {
            const context = getSharedContext();
            if(context.state === 'suspended') await context.resume();
        }

        public onConnected(): void
        {
            this.classList.add('AudioComponent');
            if(!this.hasAttribute('theme')) this.setAttribute('theme', 'dark');
            if(!this._audioCtx) this._audioCtx = this.InitialContext ?? getSharedContext();
            if(!this._input && !this._output) this._buildAudioGraph();
        }

        protected _buildAudioGraph(): void {}

        public connect(target: AudioNode | AudioComponent): this
        {
            if(!this._output) return this;
            const node = target instanceof AudioComponent ? target._input : target;
            if(!node) return this;
            this._output.connect(node);
            this.Downstream.add(node);
            return this;
        }

        public disconnect(target?: AudioNode | AudioComponent): this
        {
            if(!this._output) return this;

            if(target == null)
            {
                this._output.disconnect();
                this.Downstream.clear();
                return this;
            }

            const node = target instanceof AudioComponent ? target._input : target;
            if(!node) return this;
            try { this._output.disconnect(node); } catch {}
            this.Downstream.delete(node);
            return this;
        }

        public getOutput(): AudioNode | undefined { return this._output; }
        public getInput(): AudioNode | undefined { return this._input; }

        public onUnmount(): void
        {
            try { this._output?.disconnect(); } catch {}
            this.Downstream.clear();
        }
    }
}

export type AudioComponentOptions = AudioComponent.AudioComponentOptions;
export default AudioComponent;

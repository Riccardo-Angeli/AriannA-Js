/**
 * @module components/audio/ChannelStrip
 * @version 2.0.0
 */
import { Component, Css, Templates } from '../../core/index.ts';
import { AudioComponent as AudioComponentModule } from './AudioComponent.ts';

const html = Templates.Template.Html;

export namespace ChannelStrip
{
    export namespace Types
    {
        export type Theme = 'dark' | 'light';
    }

    export namespace Interfaces
    {
        export interface ChannelStripOptions extends AudioComponentModule.AudioComponentOptions
        {
            name?: string;
            gain?: number;
            pan?: number;
            muted?: boolean;
            soloed?: boolean;
            meter?: boolean;
            color?: string;
            theme?: Types.Theme;
            pre?: number;
            eq?: number;
            comp?: number;
            insertA?: string;
            insertB?: string;
            send?: string;
        }
    }

    export const Styles = new Css.Stylesheet([
        new Css.Rule('.ChannelStrip', {
            '--ChannelStrip-Accent': '#ef8d2f',
            Background: '#24282c', Border: '1px solid #0d0f11', BorderRadius: '4px',
            BoxShadow: 'inset 0 1px 0 rgba(255,255,255,.05), 0 2px 6px rgba(0,0,0,.35)',
            BoxSizing: 'border-box', Color: '#dfe3e7', Display: 'grid', FontFamily: 'var(--arianna-font, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif)',
            GridTemplateRows: '5px auto auto auto auto 1fr auto auto', MinHeight: '430px', Overflow: 'hidden', Width: '92px'
        }),
        new Css.Rule('.ChannelStrip-Color', { Background: 'var(--ChannelStrip-Accent)', Height: '5px' }),
        new Css.Rule('.ChannelStrip-Header', {
            Background: 'linear-gradient(180deg,#34393e,#292d31)', BorderBottom: '1px solid #14171a',
            BoxSizing: 'border-box', MinHeight: '38px', Padding: '6px 5px'
        }),
        new Css.Rule('.ChannelStrip-Name', {
            Color: '#eef1f4', FontSize: '10px', FontWeight: '700', Overflow: 'hidden', TextAlign: 'center', TextOverflow: 'ellipsis', WhiteSpace: 'nowrap'
        }),
        new Css.Rule('.ChannelStrip-Inserts', { BorderBottom: '1px solid #15181a', Display: 'grid', Gap: '2px', Padding: '4px' }),
        new Css.Rule('.ChannelStrip-Insert', {
            Background: '#171a1d', Border: '1px solid #353a3f', BorderRadius: '2px', Color: '#8e979f',
            Appearance: 'none', Cursor: 'pointer', FontSize: '8px', Height: '19px', LineHeight: '17px', Overflow: 'hidden', Padding: '0 16px 0 4px', TextOverflow: 'ellipsis', WhiteSpace: 'nowrap', Width: '100%'
        }),
        new Css.Rule('.ChannelStrip-Console', {
            BorderBottom: '1px solid #15181a', Display: 'grid', Gap: '5px', GridTemplateColumns: 'repeat(3,1fr)', Padding: '7px 5px'
        }),
        new Css.Rule('.ChannelStrip-Module', { Display: 'grid', Gap: '3px', JustifyItems: 'center' }),
        new Css.Rule('.ChannelStrip-Knob', {
            Background: 'radial-gradient(circle at 42% 38%,#71777d 0 12%,#474c51 13% 42%,#202428 43% 68%,#111315 69% 100%)',
            Border: '1px solid #090b0c', BorderRadius: '50%', BoxShadow: 'inset 0 1px 1px rgba(255,255,255,.13),0 1px 1px rgba(0,0,0,.55)', Cursor: 'ns-resize', Height: '20px', Position: 'relative', TouchAction: 'none', Width: '20px'
        }),
        new Css.Rule('.ChannelStrip-Knob::after', { Background: '#d9dde0', Content: '""', Height: '7px', Left: '9px', Position: 'absolute', Top: '2px', Transform: 'rotate(var(--ChannelStrip-KnobAngle,-135deg))', TransformOrigin: '50% 8px', Width: '1px' }),
        new Css.Rule('.ChannelStrip-ModuleLabel', { Color: '#737c84', Font: '700 7px/1 var(--arianna-font,system-ui,sans-serif)', LetterSpacing: '.03em' }),
        new Css.Rule('.ChannelStrip-PanArea', { BorderBottom: '1px solid #15181a', Display: 'grid', Gap: '4px', JustifyItems: 'center', Padding: '7px 4px' }),
        new Css.Rule('.ChannelStrip-Pan', {
            AccentColor: '#4b9ee9', Cursor: 'pointer', Height: '14px', Width: '72px'
        }),
        new Css.Rule('.ChannelStrip-PanValue', { Color: '#8d969f', Font: '9px/1 ui-monospace, SFMono-Regular, Menlo, monospace' }),
        new Css.Rule('.ChannelStrip-Main', {
            AlignItems: 'stretch', Display: 'grid', Gap: '4px', GridTemplateColumns: '12px 1fr 12px', MinHeight: '188px', Padding: '7px 5px 4px'
        }),
        new Css.Rule('.ChannelStrip-Meter', {
            Background: '#0e1113', Border: '1px solid #090a0b', BorderRadius: '2px', BoxShadow: 'inset 0 0 3px rgba(0,0,0,.8)', Overflow: 'hidden', Position: 'relative'
        }),
        new Css.Rule('.ChannelStrip-MeterFill', {
            Background: 'linear-gradient(to top,#37c851 0%,#7bd341 70%,#e4cf3c 86%,#e05945 100%)', Bottom: '0', Left: '1px', Position: 'absolute', Right: '1px', Transition: 'height .06s linear'
        }),
        new Css.Rule('.ChannelStrip-FaderWrap', {
            AlignItems: 'center', Display: 'flex', JustifyContent: 'center', Position: 'relative'
        }),
        new Css.Rule('.ChannelStrip-FaderRail', {
            Background: '#0f1113', BorderRadius: '1px', Bottom: '8px', BoxShadow: 'inset 0 0 0 1px #090a0b', Left: '50%', Position: 'absolute', Top: '8px', Transform: 'translateX(-50%)', Width: '3px'
        }),
        new Css.Rule('.ChannelStrip-Fader', {
            Appearance: 'none', Background: 'transparent', Cursor: 'pointer', Direction: 'rtl', Height: '174px', Padding: '0', Position: 'relative', WebkitAppearance: 'none', Width: '28px', WritingMode: 'vertical-lr', ZIndex: '2'
        }),
        new Css.Rule('.ChannelStrip-Fader::-webkit-slider-runnable-track', {
            Background: 'transparent', Border: '0', Height: '100%', Width: '3px'
        }),
        new Css.Rule('.ChannelStrip-Fader::-webkit-slider-thumb', {
            WebkitAppearance: 'none',
            Background: 'linear-gradient(90deg,transparent 0 46%,#676c70 46% 54%,transparent 54% 100%), linear-gradient(180deg,#f2f3f3 0%,#d8dadd 44%,#a7acb0 50%,#d9dcde 56%,#f1f2f2 100%)',
            Border: '1px solid #565b60', BorderRadius: '1px', BoxShadow: '0 1px 2px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.75)', Height: '12px', Width: '20px'
        }),
        new Css.Rule('.ChannelStrip-Fader::-moz-range-track', {
            Background: 'transparent', Border: '0', Height: '100%', Width: '3px'
        }),
        new Css.Rule('.ChannelStrip-Fader::-moz-range-thumb', {
            Background: 'linear-gradient(90deg,transparent 0 46%,#676c70 46% 54%,transparent 54% 100%), linear-gradient(180deg,#f2f3f3 0%,#d8dadd 44%,#a7acb0 50%,#d9dcde 56%,#f1f2f2 100%)',
            Border: '1px solid #565b60', BorderRadius: '1px', BoxShadow: '0 1px 2px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.75)', Height: '12px', Width: '20px'
        }),
        new Css.Rule('.ChannelStrip-GainValue', {
            Background: '#141719', Border: '1px solid #0c0e10', BorderRadius: '2px', Color: '#b9c1c8',
            Font: '9px/1 ui-monospace, SFMono-Regular, Menlo, monospace', Margin: '0 5px 5px', Padding: '5px 3px', TextAlign: 'center'
        }),
        new Css.Rule('.ChannelStrip-Buttons', { Display: 'grid', Gap: '3px', GridTemplateColumns: 'repeat(3,1fr)', Padding: '0 5px 5px' }),
        new Css.Rule('.ChannelStrip-Button', {
            Appearance: 'none', Background: 'linear-gradient(180deg,#383d42,#292d31)', Border: '1px solid #111315', BorderRadius: '2px',
            BoxShadow: 'inset 0 1px 0 rgba(255,255,255,.05)', Color: '#b9c0c6', Cursor: 'pointer', Font: '700 9px/1 var(--arianna-font,system-ui,sans-serif)', Height: '22px', Padding: '0'
        }),
        new Css.Rule('.ChannelStrip-Button[data-active="true"][data-action="mute"]', { Background: '#f0b62b', BorderColor: '#b9830d', Color: '#211a08' }),
        new Css.Rule('.ChannelStrip-Button[data-active="true"][data-action="solo"]', { Background: '#76c85c', BorderColor: '#3f8d2b', Color: '#0e2209' }),
        new Css.Rule('.ChannelStrip-Button[data-active="true"][data-action="record"]', { Background: '#d95148', BorderColor: '#9d2d27', Color: '#fff' }),
        new Css.Rule('.ChannelStrip-Footer', {
            Background: 'linear-gradient(180deg,#2c3034,#202427)', BorderTop: '1px solid #111315', Color: '#9ca4ab', FontSize: '9px', Padding: '5px', TextAlign: 'center'
        }),
        new Css.Rule('.ChannelStrip[theme="light"]', {
            Background: '#e7e9eb', BorderColor: '#aeb4ba', BoxShadow: 'inset 0 1px 0 #fff, 0 2px 6px rgba(0,0,0,.12)', Color: '#2b3035'
        }),
        new Css.Rule('.ChannelStrip[theme="light"] .ChannelStrip-Header', {
            Background: 'linear-gradient(180deg,#fafafa,#d9dde0)', BorderBottomColor: '#bfc4c8'
        }),
        new Css.Rule('.ChannelStrip[theme="light"] .ChannelStrip-Name', { Color: '#24282c' }),
        new Css.Rule('.ChannelStrip[theme="light"] .ChannelStrip-Insert', { Background: '#f6f7f8', BorderColor: '#c6cbd0', Color: '#697077' }),
        new Css.Rule('.ChannelStrip[theme="light"] .ChannelStrip-Knob', { Background: 'radial-gradient(circle at 42% 38%,#9ca2a8 0 12%,#70767c 13% 42%,#464b50 43% 68%,#2a2e32 69% 100%)', BorderColor: '#aeb4b9' }),
        new Css.Rule('.ChannelStrip[theme="light"] .ChannelStrip-ModuleLabel', { Color: '#6d747b' }),
        new Css.Rule('.ChannelStrip[theme="light"] .ChannelStrip-GainValue', { Background: '#fff', BorderColor: '#c4c9ce', Color: '#3f474e' }),
        new Css.Rule('.ChannelStrip[theme="light"] .ChannelStrip-Button', { Background: 'linear-gradient(180deg,#fff,#dfe2e5)', BorderColor: '#b8bdc2', Color: '#41474c' }),
        new Css.Rule('.ChannelStrip[theme="light"] .ChannelStrip-Footer', { Background: 'linear-gradient(180deg,#e1e4e7,#cfd3d6)', BorderTopColor: '#b8bdc2', Color: '#5d646a' })
    ]);

    @Component('arianna-channel-strip', Styles, {
        Shadow: false,
        Attributes: ['name', 'gain', 'pan', 'muted', 'soloed', 'meter', 'color', 'theme']
    })
    export class ChannelStrip extends AudioComponentModule.AudioComponent
    {
        public static readonly Styles = Styles;
        public template = html``;
        public static readonly tag = 'arianna-channel-strip';

        private GainNode?: GainNode;
        private PanNode?: StereoPannerNode;
        private Analyser?: AnalyserNode;
        private LeftMeter?: HTMLElement;
        private RightMeter?: HTMLElement;
        private Fader?: HTMLInputElement;
        private Pan?: HTMLInputElement;
        private GainReadout?: HTMLElement;
        private PanReadout?: HTMLElement;
        private ModuleValues: Record<string, number> = { PRE: .5, EQ: .5, COMP: .5 };
        private InsertValues: Record<string, string> = { 'INSERT A': 'None', 'INSERT B': 'None', SEND: 'None' };
        private InsertNodes = new Map<'INSERT A' | 'INSERT B', AudioNode>();
        private SendNode?: AudioNode;
        private SendGain?: GainNode;
        private Raf = 0;

        constructor(options: Interfaces.ChannelStripOptions = {})
        {
            super(options);
            this.EnsureState();
            if(options.name) this.setAttribute('name', options.name);
            if(options.gain != null) this.setAttribute('gain', String(options.gain));
            if(options.pan != null) this.setAttribute('pan', String(options.pan));
            if(options.muted) this.setAttribute('muted', '');
            if(options.soloed) this.setAttribute('soloed', '');
            if(options.meter != null) this.setAttribute('meter', String(options.meter));
            if(options.color) this.setAttribute('color', options.color);
            if(options.theme) this.setAttribute('theme', options.theme);
            if(options.pre != null) this.ModuleValues.PRE = this.Clamp01(options.pre);
            if(options.eq != null) this.ModuleValues.EQ = this.Clamp01(options.eq);
            if(options.comp != null) this.ModuleValues.COMP = this.Clamp01(options.comp);
            if(options.insertA) this.InsertValues['INSERT A'] = options.insertA;
            if(options.insertB) this.InsertValues['INSERT B'] = options.insertB;
            if(options.send) this.InsertValues.SEND = options.send;
        }

        public onCreated(): void
        {
            if(this.isConnected) this.onConnected();
        }

        public onConnected(): void
        {
            this.EnsureState();
            super.onConnected();
            this.classList.add('ChannelStrip');
            if(!this.hasAttribute('theme')) this.setAttribute('theme', 'dark');
            this.style.setProperty('--ChannelStrip-Accent', this.getAttribute('color') || '#ef8d2f');
            this.Render();
            this.Sync();
            if(this.getAttribute('meter') !== 'false') this.MeterLoop();
        }

        private EnsureState(): void
        {
            if(!this.ModuleValues || typeof this.ModuleValues !== 'object')
                this.ModuleValues = { PRE: .5, EQ: .5, COMP: .5 };
            if(!this.InsertValues || typeof this.InsertValues !== 'object')
                this.InsertValues = { 'INSERT A': 'None', 'INSERT B': 'None', SEND: 'None' };
            if(!(this.InsertNodes instanceof Map)) this.InsertNodes = new Map<'INSERT A' | 'INSERT B', AudioNode>();
            if(!Number.isFinite(this.Raf)) this.Raf = 0;
        }

        protected _buildAudioGraph(): void
        {
            try
            {
                this.GainNode = this._audioCtx.createGain();
                this.PanNode = this._audioCtx.createStereoPanner();
                this.Analyser = this._audioCtx.createAnalyser();
                this.Analyser.fftSize = 256;
                this.SendGain = this._audioCtx.createGain();
                this.SendGain.gain.value = 1;
                this._input = this.GainNode;
                this._output = this.Analyser;
                this.RewireAudio();
                this.SyncAudio();
            }
            catch {}
        }

        public get gain(): number { return Number(this.getAttribute('gain') ?? 1); }
        public set gain(value: number) { this.setAttribute('gain', String(Math.max(0, Math.min(2, value)))); this.Sync(); }
        public get pan(): number { return Number(this.getAttribute('pan') ?? 0); }
        public set pan(value: number) { this.setAttribute('pan', String(Math.max(-1, Math.min(1, value)))); this.Sync(); }
        public get muted(): boolean { return this.hasAttribute('muted'); }
        public set muted(value: boolean) { this.toggleAttribute('muted', value); this.Sync(); }
        public get soloed(): boolean { return this.hasAttribute('soloed'); }
        public set soloed(value: boolean) { this.toggleAttribute('soloed', value); this.Sync(); }

        public get input(): AudioNode | undefined { return this.getInput(); }
        public get output(): AudioNode | undefined { return this.getOutput(); }

        public setInsertNode(slot: 'INSERT A' | 'INSERT B', node?: AudioNode): this
        {
            this.EnsureState();
            if(node) this.InsertNodes.set(slot, node);
            else this.InsertNodes.delete(slot);
            this.RewireAudio();
            return this;
        }

        public setSendNode(node?: AudioNode, amount = 1): this
        {
            this.SendNode = node;
            if(this.SendGain) this.SendGain.gain.value = Math.max(0, Math.min(1, amount));
            this.RewireAudio();
            return this;
        }

        public setSendAmount(amount: number): this
        {
            if(this.SendGain) this.SendGain.gain.value = Math.max(0, Math.min(1, amount));
            return this;
        }

        public getModule(name: 'PRE' | 'EQ' | 'COMP'): number
        {
            this.EnsureState();
            return this.ModuleValues[name] ?? .5;
        }

        public setModule(name: 'PRE' | 'EQ' | 'COMP', value: number): this
        {
            this.EnsureState();
            const next = this.Clamp01(value);
            this.ModuleValues[name] = next;
            const knob = this.querySelector<HTMLElement>(`.ChannelStrip-Knob[data-module="${name}"]`);
            this.SyncKnob(knob, next);
            this.Emit('arianna:module', { module: name, value: next });
            return this;
        }

        public getSlot(name: 'INSERT A' | 'INSERT B' | 'SEND'): string
        {
            this.EnsureState();
            return this.InsertValues[name] ?? 'None';
        }

        public setSlot(name: 'INSERT A' | 'INSERT B' | 'SEND', value: string): this
        {
            this.EnsureState();
            this.InsertValues[name] = value || 'None';
            const select = this.querySelector<HTMLSelectElement>(`.ChannelStrip-Insert[data-slot="${name}"]`);
            if(select) select.value = this.InsertValues[name];
            this.Emit(name === 'SEND' ? 'arianna:send' : 'arianna:insert', { slot: name, value: this.InsertValues[name] });
            return this;
        }

        private Render(): void
        {
            if(this.querySelector(':scope > .ChannelStrip-Color')) return;

            const color = document.createElement('div');
            color.className = 'ChannelStrip-Color';

            const header = document.createElement('div');
            header.className = 'ChannelStrip-Header';
            const name = document.createElement('div');
            name.className = 'ChannelStrip-Name';
            name.textContent = this.getAttribute('name') || 'CHANNEL';
            header.append(name);

            const inserts = document.createElement('div');
            inserts.className = 'ChannelStrip-Inserts';
            for(const label of ['INSERT A', 'INSERT B', 'SEND'] as const)
            {
                const slot = document.createElement('select');
                slot.className = 'ChannelStrip-Insert';
                slot.dataset.slot = label;
                slot.title = label;
                const choices = label === 'SEND'
                    ? ['None', 'Reverb', 'Delay', 'Cue 1', 'Cue 2']
                    : ['None', 'Compressor', 'EQ', 'Gate', 'Saturator', 'Limiter'];
                for(const choice of choices)
                {
                    const option = document.createElement('option');
                    option.value = choice;
                    option.textContent = choice === 'None' ? label : choice;
                    slot.append(option);
                }
                slot.value = this.InsertValues[label] ?? 'None';
                slot.addEventListener('change', () => this.setSlot(label, slot.value));
                inserts.append(slot);
            }

            const consoleArea = document.createElement('div');
            consoleArea.className = 'ChannelStrip-Console';
            for(const label of ['PRE', 'EQ', 'COMP'] as const)
            {
                const module = document.createElement('span'); module.className = 'ChannelStrip-Module';
                const knob = document.createElement('span'); knob.className = 'ChannelStrip-Knob'; knob.dataset.module = label; knob.tabIndex = 0;
                this.SyncKnob(knob, this.ModuleValues[label] ?? .5);
                this.BindKnob(knob, label);
                const caption = document.createElement('span'); caption.className = 'ChannelStrip-ModuleLabel'; caption.textContent = label;
                module.append(knob, caption); consoleArea.append(module);
            }

            const panArea = document.createElement('div');
            panArea.className = 'ChannelStrip-PanArea';
            this.Pan = document.createElement('input');
            this.Pan.type = 'range';
            this.Pan.className = 'ChannelStrip-Pan';
            this.Pan.min = '-1';
            this.Pan.max = '1';
            this.Pan.step = '0.01';
            this.PanReadout = document.createElement('span');
            this.PanReadout.className = 'ChannelStrip-PanValue';
            panArea.append(this.Pan, this.PanReadout);

            const main = document.createElement('div');
            main.className = 'ChannelStrip-Main';
            this.LeftMeter = this.Meter();
            this.RightMeter = this.Meter();
            const faderWrap = document.createElement('div');
            faderWrap.className = 'ChannelStrip-FaderWrap';
            const rail = document.createElement('span');
            rail.className = 'ChannelStrip-FaderRail';
            this.Fader = document.createElement('input');
            this.Fader.type = 'range';
            this.Fader.className = 'ChannelStrip-Fader';
            this.Fader.min = '0';
            this.Fader.max = '2';
            this.Fader.step = '0.01';
            this.Fader.setAttribute('orient', 'vertical');
            faderWrap.append(rail, this.Fader);
            main.append(this.LeftMeter, faderWrap, this.RightMeter);

            this.GainReadout = document.createElement('div');
            this.GainReadout.className = 'ChannelStrip-GainValue';

            const buttons = document.createElement('div');
            buttons.className = 'ChannelStrip-Buttons';
            const mute = this.Button('M', 'mute');
            const solo = this.Button('S', 'solo');
            const record = this.Button('R', 'record');
            buttons.append(mute, solo, record);

            const footer = document.createElement('div');
            footer.className = 'ChannelStrip-Footer';
            footer.textContent = 'MAIN';

            this.append(color, header, inserts, consoleArea, panArea, main, this.GainReadout, buttons, footer);

            this.Pan.addEventListener('input', () => { this.pan = Number(this.Pan?.value ?? 0); this.Emit('arianna:pan', { pan: this.pan }); });
            this.Fader.addEventListener('input', () => { this.gain = Number(this.Fader?.value ?? 1); this.Emit('arianna:gain', { gain: this.gain }); });
            mute.addEventListener('click', () => { this.muted = !this.muted; this.Emit('arianna:mute', { muted: this.muted }); });
            solo.addEventListener('click', () => { this.soloed = !this.soloed; this.Emit('arianna:solo', { soloed: this.soloed }); });
            record.addEventListener('click', () =>
            {
                const active = record.dataset.active !== 'true';
                record.dataset.active = String(active);
                this.Emit('arianna:record', { recording: active });
            });
        }

        private Meter(): HTMLElement
        {
            const meter = document.createElement('div');
            meter.className = 'ChannelStrip-Meter';
            const fill = document.createElement('span');
            fill.className = 'ChannelStrip-MeterFill';
            fill.style.height = '0%';
            meter.append(fill);
            return meter;
        }

        private Button(text: string, action: string): HTMLButtonElement
        {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'ChannelStrip-Button';
            button.dataset.action = action;
            button.dataset.active = 'false';
            button.textContent = text;
            return button;
        }

        private Sync(): void
        {
            if(this.Fader) this.Fader.value = String(this.gain);
            if(this.Pan) this.Pan.value = String(this.pan);
            if(this.GainReadout) this.GainReadout.textContent = GainToDb(this.gain);
            if(this.PanReadout) this.PanReadout.textContent = this.pan === 0 ? 'C' : `${this.pan < 0 ? 'L' : 'R'}${Math.round(Math.abs(this.pan) * 100)}`;
            this.querySelector<HTMLButtonElement>('[data-action="mute"]')?.setAttribute('data-active', String(this.muted));
            this.querySelector<HTMLButtonElement>('[data-action="solo"]')?.setAttribute('data-active', String(this.soloed));
            this.SyncAudio();
        }

        private SyncAudio(): void
        {
            if(this.GainNode) this.GainNode.gain.value = this.muted ? 0 : this.gain;
            if(this.PanNode) this.PanNode.pan.value = this.pan;
        }

        private RewireAudio(): void
        {
            if(!this.GainNode || !this.PanNode || !this.Analyser) return;
            try { this.GainNode.disconnect(); } catch {}
            for(const node of this.InsertNodes.values()) { try { node.disconnect(); } catch {} }
            try { this.PanNode.disconnect(); } catch {}
            try { this.SendGain?.disconnect(); } catch {}

            let current: AudioNode = this.GainNode;
            for(const slot of ['INSERT A', 'INSERT B'] as const)
            {
                const node = this.InsertNodes.get(slot);
                if(!node) continue;
                current.connect(node);
                current = node;
            }
            current.connect(this.PanNode);
            this.PanNode.connect(this.Analyser);

            if(this.SendNode && this.SendGain)
            {
                this.PanNode.connect(this.SendGain);
                this.SendGain.connect(this.SendNode);
            }
        }

        private MeterLoop(): void
        {
            if(!this.isConnected) return;

            let level = 0;
            if(this.Analyser && !this.muted)
            {
                const data = new Uint8Array(this.Analyser.fftSize);
                this.Analyser.getByteTimeDomainData(data);
                let sum = 0;
                for(const value of data)
                {
                    const sample = (value - 128) / 128;
                    sum += sample * sample;
                }
                const rms = Math.sqrt(sum / Math.max(1, data.length));
                level = rms < .002 ? 0 : Math.min(1, rms * 5.25);
            }

            const leftFill = this.LeftMeter?.firstElementChild as HTMLElement | null;
            const rightFill = this.RightMeter?.firstElementChild as HTMLElement | null;
            if(leftFill) leftFill.style.height = `${level * 100}%`;
            if(rightFill) rightFill.style.height = `${level * 100}%`;
            this.Raf = requestAnimationFrame(() => this.MeterLoop());
        }

        private BindKnob(knob: HTMLElement, module: 'PRE' | 'EQ' | 'COMP'): void
        {
            let startY = 0;
            let startValue = 0;
            let pointerId = -1;

            const move = (event: PointerEvent): void =>
            {
                if(event.pointerId !== pointerId) return;
                const delta = (startY - event.clientY) / 100;
                this.setModule(module, startValue + delta);
            };
            const finish = (event: PointerEvent): void =>
            {
                if(event.pointerId !== pointerId) return;
                window.removeEventListener('pointermove', move, true);
                window.removeEventListener('pointerup', finish, true);
                window.removeEventListener('pointercancel', finish, true);
                try { knob.releasePointerCapture(pointerId); } catch {}
                pointerId = -1;
            };

            knob.addEventListener('pointerdown', event =>
            {
                if(event.button !== 0) return;
                event.preventDefault();
                pointerId = event.pointerId;
                startY = event.clientY;
                startValue = this.getModule(module);
                try { knob.setPointerCapture(pointerId); } catch {}
                window.addEventListener('pointermove', move, true);
                window.addEventListener('pointerup', finish, true);
                window.addEventListener('pointercancel', finish, true);
            });
            knob.addEventListener('wheel', event =>
            {
                event.preventDefault();
                this.setModule(module, this.getModule(module) + (event.deltaY < 0 ? .03 : -.03));
            }, { passive: false });
            knob.addEventListener('dblclick', () => this.setModule(module, .5));
            knob.addEventListener('keydown', event =>
            {
                if(event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
                event.preventDefault();
                this.setModule(module, this.getModule(module) + (event.key === 'ArrowUp' ? .02 : -.02));
            });
        }

        private SyncKnob(knob: HTMLElement | null | undefined, value: number): void
        {
            if(!knob) return;
            const normalized = this.Clamp01(value);
            const angle = -135 + normalized * 270;
            knob.style.setProperty('--ChannelStrip-KnobAngle', `${angle}deg`);
            knob.setAttribute('aria-valuenow', normalized.toFixed(2));
            knob.title = `${Math.round(normalized * 100)}%`;
        }

        private Clamp01(value: number): number
        {
            return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
        }

        private Emit(type: string, detail: Record<string, unknown>): void
        {
            this.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail: { ...detail, source: this } }));
        }

        public onUnmount(): void
        {
            if(this.Raf) cancelAnimationFrame(this.Raf);
            super.onUnmount();
        }
    }

    function GainToDb(gain: number): string
    {
        if(gain <= 0) return '-∞ dB';
        const db = 20 * Math.log10(gain);
        return `${db >= 0 ? '+' : ''}${db.toFixed(1)} dB`;
    }
}

export default ChannelStrip;

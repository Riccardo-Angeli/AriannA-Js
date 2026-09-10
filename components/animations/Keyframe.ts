/**
 * @module components/animations/Keyframe
 * @version 2.0.0
 */
import { Component, Css, Templates } from '../../core/index.ts';

const html = Templates.Template.Html;

export namespace Keyframe
{
    export namespace Types
    {
        export type Interpolation = 'constant' | 'linear' | 'bezier';
    }

    export namespace Interfaces
    {
        export interface Options
        {
            frame?: number;
            value?: number;
            interpolation?: Types.Interpolation;
            handleIn?: [number, number];
            handleOut?: [number, number];
            selected?: boolean;
            hot?: boolean;
            tooltip?: boolean;
        }
    }

    export const Styles = new Css.Stylesheet([
        new Css.Rule('.Keyframe', {
            BoxSizing: 'border-box', Display: 'block', Height: '24px',
            Position: 'absolute', Top: '50%', Transform: 'translate(-50%, -50%)',
            Width: '18px', ZIndex: '2'
        }),
        new Css.Rule('.Keyframe-Marker', {
            Background: 'var(--Animation-KeyframeColor, #4b9ee9)',
            Border: '1px solid rgba(255,255,255,.46)', BorderRadius: '50%',
            BoxShadow: '0 0 0 1px rgba(0,0,0,.35)', BoxSizing: 'border-box',
            Cursor: 'pointer', Height: '11px', Left: '50%', Position: 'absolute',
            Top: '50%', Transform: 'translate(-50%, -50%)',
            Transition: 'transform .12s ease, background .12s ease, border-color .12s ease, box-shadow .12s ease',
            Width: '11px'
        }),
        new Css.Rule('.Keyframe:hover .Keyframe-Marker', {
            Transform: 'translate(-50%, -50%) scale(1.18)'
        }),
        new Css.Rule('.Keyframe[hot] .Keyframe-Marker', {
            Background: 'var(--Animation-KeyframeHot, #e69a45)', BorderColor: '#f0b62b'
        }),
        new Css.Rule('.Keyframe[selected] .Keyframe-Marker', {
            Background: 'var(--Animation-KeyframeSelected, #ef8d2f)',
            BorderColor: '#e4cf3c',
            BoxShadow: '0 0 0 2px #202428, 0 0 0 4px #ef8d2f'
        }),
        new Css.Rule('.Keyframe-Tooltip', {
            Background: '#181b1e', Border: '1px solid #0f1113', BorderRadius: '8px',
            BoxShadow: '0 8px 24px rgba(0,0,0,.38)', Color: '#eef1f4', Display: 'none',
            FontFamily: 'var(--arianna-font, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif)',
            FontSize: '12px', Left: '50%', LineHeight: '1.55', MinWidth: '154px',
            Padding: '9px 11px', PointerEvents: 'none', Position: 'absolute',
            Top: 'calc(100% + 10px)', Transform: 'translateX(-28%)', WhiteSpace: 'nowrap', ZIndex: '20'
        }),
        new Css.Rule('.Keyframe[tooltip] .Keyframe-Tooltip, .Keyframe[selected][tooltip] .Keyframe-Tooltip', {
            Display: 'block'
        }),
        new Css.Rule('.Keyframe-Tooltip strong', { Color: '#ffffff', FontWeight: '650' }),

        /* A keyframe used by itself gets a small timeline context automatically. */
        new Css.Rule('.Keyframe.Keyframe-Standalone', {
            Background: 'linear-gradient(180deg,#24282c 0%,#171a1d 100%)',
            Border: '1px solid #15181a', BorderRadius: '8px', Height: '178px',
            Left: 'auto', MinWidth: '280px', Overflow: 'visible', Position: 'relative',
            Top: 'auto', Transform: 'none', Width: '100%'
        }),
        new Css.Rule('.Keyframe.Keyframe-Standalone::before', {
            Background: '#15181a', Content: '""', Height: '1px', Left: '7%',
            Position: 'absolute', Right: '7%', Top: '50%'
        }),
        new Css.Rule('.Keyframe.Keyframe-Standalone .Keyframe-Marker', {
            Left: 'var(--Keyframe-StandaloneX, 50%)'
        }),
        new Css.Rule('.Keyframe.Keyframe-Standalone .Keyframe-Tooltip', {
            Left: 'var(--Keyframe-StandaloneX, 50%)', Top: 'calc(50% + 18px)', Transform: 'translateX(-22%)'
        }),

        new Css.Rule('.Keyframe[theme="light"] .Keyframe-Marker, .AnimTrack[theme="light"] .Keyframe-Marker, .KeyframeEditor[theme="light"] .Keyframe-Marker', { BorderColor: 'rgba(255,255,255,.46)', BoxShadow: '0 0 0 1px rgba(0,0,0,.14)' }),
        new Css.Rule('.Keyframe[theme="light"] .Keyframe-Tooltip, .AnimTrack[theme="light"] .Keyframe-Tooltip, .KeyframeEditor[theme="light"] .Keyframe-Tooltip', { Background: '#f8f9fa', BorderColor: '#c9cdd1', BoxShadow: '0 8px 24px rgba(0,0,0,.10)', Color: '#24282c' }),
        new Css.Rule('.Keyframe[theme="light"] .Keyframe-Tooltip strong, .AnimTrack[theme="light"] .Keyframe-Tooltip strong, .KeyframeEditor[theme="light"] .Keyframe-Tooltip strong', { Color: '#30353a' }),
        new Css.Rule('.Keyframe.Keyframe-Standalone[theme="light"]', { Background: 'linear-gradient(180deg,#f9fafb 0%,#dfe3e6 100%)', BorderColor: '#b9bec3' }),
        new Css.Rule('.Keyframe.Keyframe-Standalone[theme="light"]::before', { Background: '#c8ccd0' }),
        new Css.Rule('.Keyframe[selected][theme="light"] .Keyframe-Marker, .AnimTrack[theme="light"] .Keyframe[selected] .Keyframe-Marker, .KeyframeEditor[theme="light"] .Keyframe[selected] .Keyframe-Marker', { BoxShadow: '0 0 0 2px #fafafa,0 0 0 4px #ef8d2f' }),
    ]);

    @Component('arianna-keyframe', Styles, {
        Shadow: false,
        Attributes: ['frame', 'value', 'interpolation', 'selected', 'hot', 'tooltip']
    })
    export class Keyframe extends HTMLElement
    {
        public static readonly Styles = Styles;
        public template = html``;

        private _handleIn?: [number, number];
        private _handleOut?: [number, number];
        private _bound?: boolean;

        constructor(options: Interfaces.Options = {})
        {
            super();
            if(options.frame != null) this.setAttribute('frame', String(options.frame));
            if(options.value != null) this.setAttribute('value', String(options.value));
            if(options.interpolation) this.setAttribute('interpolation', options.interpolation);
            if(options.selected != null) this.toggleAttribute('selected', options.selected);
            if(options.hot != null) this.toggleAttribute('hot', options.hot);
            if(options.tooltip != null) this.toggleAttribute('tooltip', options.tooltip);
            if(options.handleIn) this._handleIn = options.handleIn;
            if(options.handleOut) this._handleOut = options.handleOut;
        }

        public get frame(): number { return Number(this.getAttribute('frame') ?? 0) || 0; }
        public set frame(value: number) { this.setFrame(value); }
        public get value(): number { return Number(this.getAttribute('value') ?? 0) || 0; }
        public set value(value: number) { this.setValue(value); }
        public get interpolation(): Types.Interpolation
        {
            return (this.getAttribute('interpolation') as Types.Interpolation | null) ?? 'bezier';
        }
        public set interpolation(value: Types.Interpolation) { this.setInterpolation(value); }
        public get handleIn(): [number, number] { this.EnsureState(); return this._handleIn!; }
        public get handleOut(): [number, number] { this.EnsureState(); return this._handleOut!; }

        public render(): HTMLElement { return this; }

        public onConnected(): void
        {
            this.EnsureState();
            this.classList.add('Keyframe');
            this.classList.toggle('Keyframe-Standalone', !this.closest('arianna-anim-track'));
            this.Render();
        }

        public onCreated(): void
        {
            if(this.isConnected) this.onConnected();
        }

        public setFrame(frame: number): this
        {
            this.setAttribute('frame', String(frame));
            this.Position();
            this.UpdateTooltip();
            return this;
        }

        public setValue(value: number): this
        {
            this.setAttribute('value', String(value));
            this.UpdateTooltip();
            return this;
        }

        public setInterpolation(interpolation: Types.Interpolation): this
        {
            this.setAttribute('interpolation', interpolation);
            this.UpdateTooltip();
            return this;
        }

        public setHandles(input: [number, number], output: [number, number]): this
        {
            this.EnsureState();
            this._handleIn = input;
            this._handleOut = output;
            return this;
        }

        private EnsureState(): void
        {
            if(!Array.isArray(this._handleIn)) this._handleIn = [-1, 0];
            if(!Array.isArray(this._handleOut)) this._handleOut = [1, 0];
            if(typeof this._bound !== 'boolean') this._bound = false;
        }

        private Render(): void
        {
            this.EnsureState();
            if(!this.hasAttribute('frame')) this.setAttribute('frame', '0');
            if(!this.hasAttribute('value')) this.setAttribute('value', '0');
            if(!this.hasAttribute('interpolation')) this.setAttribute('interpolation', 'bezier');

            let marker = this.querySelector<HTMLElement>(':scope > .Keyframe-Marker');
            if(!marker)
            {
                marker = document.createElement('span');
                marker.className = 'Keyframe-Marker';
                marker.setAttribute('aria-hidden', 'true');
                this.appendChild(marker);
            }

            let tooltip = this.querySelector<HTMLElement>(':scope > .Keyframe-Tooltip');
            if(!tooltip)
            {
                tooltip = document.createElement('span');
                tooltip.className = 'Keyframe-Tooltip';
                this.appendChild(tooltip);
            }

            if(!this._bound)
            {
                this._bound = true;
                marker.addEventListener('click', event =>
                {
                    event.stopPropagation();
                    this.toggleAttribute('selected');
                    this.dispatchEvent(new CustomEvent('arianna:keyframe-select', {
                        bubbles: true, composed: true,
                        detail: { keyframe: this, source: this }
                    }));
                });
            }

            this.Position();
            this.UpdateTooltip();
        }

        private Position(): void
        {
            if(this.classList.contains('Keyframe-Standalone'))
            {
                const start = Number(this.getAttribute('frame-start') ?? 0) || 0;
                const end = Number(this.getAttribute('frame-end') ?? 50) || 50;
                const ratio = Math.max(0, Math.min(1, (this.frame - start) / Math.max(1, end - start)));
                this.style.setProperty('--Keyframe-StandaloneX', `${7 + ratio * 86}%`);
                return;
            }

            const track = this.closest('arianna-anim-track');
            if(!track) return;
            const start = Number(track.getAttribute('frame-start') ?? 0) || 0;
            const end = Number(track.getAttribute('frame-end') ?? 100) || 100;
            const ratio = Math.max(0, Math.min(1, (this.frame - start) / Math.max(1, end - start)));
            this.style.left = `${ratio * 100}%`;
        }

        private UpdateTooltip(): void
        {
            const tooltip = this.querySelector<HTMLElement>(':scope > .Keyframe-Tooltip');
            if(!tooltip) return;
            const interpolation = this.interpolation[0].toUpperCase() + this.interpolation.slice(1);
            tooltip.innerHTML = `<strong>Frame:</strong> ${this.frame}<br><strong>Value:</strong> ${this.value}<br><strong>Interpolation:</strong> ${interpolation}`;
        }
    }
}

export type KeyframeOptions = Keyframe.Interfaces.Options;
export type KeyframeInterpolation = Keyframe.Types.Interpolation;
export default Keyframe.Keyframe;

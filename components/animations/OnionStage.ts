/**
 * @module components/animations/OnionStage
 * @version 2.0.0
 */
import { Component, Css, Templates } from '../../core/index.ts';

const html = Templates.Template.Html;

export namespace OnionStage
{
    export namespace Types
    {
        export type SnapshotProvider = (frame: number) => HTMLElement | SVGElement | null;
    }

    export namespace Interfaces
    {
        export interface OnionStageOptions
        {
            before?: number;
            after?: number;
            step?: number;
            width?: number;
            height?: number;
            opacity?: number;
            pastColor?: string;
            futureColor?: string;
        }
    }

    export const Styles = new Css.Stylesheet([
        new Css.Rule('.OnionStage', {
            Background: '#181b1e', Border: '1px solid #15181a', BorderRadius: '8px',
            BoxSizing: 'border-box', Color: '#dde1e4', Display: 'block', MinHeight: '270px',
            MinWidth: '0', Overflow: 'hidden', Width: '100%'
        }),
        new Css.Rule('.OnionStage-Toolbar', {
            AlignItems: 'center', Background: 'linear-gradient(180deg,#363b40 0%,#25292d 100%)',
            BorderBottom: '1px solid #0f1113', Display: 'flex', Gap: '8px', Height: '38px',
            Padding: '5px 8px'
        }),
        new Css.Rule('.OnionStage-Control', {
            AlignItems: 'center', Color: '#dce0e3', Display: 'inline-flex', Font: '11px/1 var(--arianna-font, system-ui, sans-serif)', Gap: '5px'
        }),
        new Css.Rule('.OnionStage-Input', {
            Appearance: 'textfield', Background: '#171a1d', Border: '1px solid #15181a', BorderRadius: '4px',
            Color: '#ffffff', Font: '11px/1 var(--arianna-font, system-ui, sans-serif)', Height: '26px',
            Outline: 'none', Padding: '0 6px', TextAlign: 'center', Width: '42px'
        }),
        new Css.Rule('.OnionStage-Legend', {
            AlignItems: 'center', Color: '#dce0e3', Display: 'inline-flex', Font: '11px/1 var(--arianna-font, system-ui, sans-serif)', Gap: '5px', MarginLeft: 'auto'
        }),
        new Css.Rule('.OnionStage-Swatch', {
            Border: '1px solid rgba(255,255,255,.25)', Height: '15px', Width: '15px'
        }),
        new Css.Rule('.OnionStage-Swatch[data-kind="past"]', { Background: 'var(--OnionStage-PastColor, #4b9ee9)' }),
        new Css.Rule('.OnionStage-Swatch[data-kind="future"]', { Background: 'var(--OnionStage-FutureColor, #e69a45)' }),
        new Css.Rule('.OnionStage-Scene', {
            Background: 'radial-gradient(circle at 50% 30%, #24282c 0%, #202428 47%, #0b0d0f 100%)',
            Height: 'calc(100% - 38px)', MinHeight: '232px', Overflow: 'hidden', Position: 'relative'
        }),
        new Css.Rule('.OnionStage-Ground', {
            BackgroundImage: 'linear-gradient(rgba(115,124,133,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(115,124,133,.18) 1px, transparent 1px)',
            BackgroundSize: '28px 28px', Bottom: '-55px', Height: '150px', Left: '-12%',
            Position: 'absolute', Right: '-12%', Transform: 'perspective(260px) rotateX(58deg)',
            TransformOrigin: '50% 100%'
        }),
        new Css.Rule('.OnionStage-Ghost', {
            Bottom: '34px', Color: '#ffffff', Height: '122px', Left: '50%', PointerEvents: 'none',
            Position: 'absolute', Transform: 'translateX(-50%)', TransformOrigin: '50% 100%', Width: '72px'
        }),
        new Css.Rule('.OnionStage-Ghost[data-kind="past"]', { Color: 'var(--OnionStage-PastColor, #4b9ee9)' }),
        new Css.Rule('.OnionStage-Ghost[data-kind="future"]', { Color: 'var(--OnionStage-FutureColor, #e69a45)' }),
        new Css.Rule('.OnionStage-Ghost[data-kind="live"]', {
            Color: 'var(--OnionStage-LiveColor, #5aa8f7)', Filter: 'drop-shadow(0 0 8px rgba(75,158,233,.35))', ZIndex: '4'
        }),
        new Css.Rule('.OnionStage-Ghost > *', { MaxHeight: '100%', MaxWidth: '100%' }),

        /* Lightweight fallback figure used when no snapshot provider is supplied. */
        new Css.Rule('.OnionStage-Figure', { Height: '118px', Left: '50%', Position: 'absolute', Top: '2px', Transform: 'translateX(-50%)', Width: '58px' }),
        new Css.Rule('.OnionStage-FigureHead', { Background: 'currentColor', BorderRadius: '50%', Height: '22px', Left: '18px', Position: 'absolute', Top: '0', Width: '22px' }),
        new Css.Rule('.OnionStage-FigureBody', { Background: 'currentColor', BorderRadius: '12px 12px 8px 8px', Height: '50px', Left: '19px', Position: 'absolute', Top: '20px', Transform: 'rotate(var(--OnionStage-BodyAngle, 0deg))', TransformOrigin: '50% 10%', Width: '20px' }),
        new Css.Rule('.OnionStage-FigureArm, .OnionStage-FigureLeg', { Background: 'currentColor', BorderRadius: '8px', Position: 'absolute', TransformOrigin: '50% 4px' }),
        new Css.Rule('.OnionStage-FigureArm', { Height: '45px', Top: '28px', Width: '9px' }),
        new Css.Rule('.OnionStage-FigureArm[data-side="left"]', { Left: '15px', Transform: 'rotate(var(--OnionStage-ArmLeft, 28deg))' }),
        new Css.Rule('.OnionStage-FigureArm[data-side="right"]', { Left: '34px', Transform: 'rotate(var(--OnionStage-ArmRight, -28deg))' }),
        new Css.Rule('.OnionStage-FigureLeg', { Height: '53px', Top: '65px', Width: '11px' }),
        new Css.Rule('.OnionStage-FigureLeg[data-side="left"]', { Left: '19px', Transform: 'rotate(var(--OnionStage-LegLeft, 20deg))' }),
        new Css.Rule('.OnionStage-FigureLeg[data-side="right"]', { Left: '29px', Transform: 'rotate(var(--OnionStage-LegRight, -20deg))' }),

        new Css.Rule('.OnionStage[theme="light"]', { Background: '#eef0f2', BorderColor: '#b9bec3', Color: '#25292d' }),
        new Css.Rule('.OnionStage[theme="light"] .OnionStage-Toolbar', { Background: 'linear-gradient(180deg,#f9fafb,#dfe3e6)', BorderBottomColor: '#b9bec3' }),
        new Css.Rule('.OnionStage[theme="light"] .OnionStage-Control, .OnionStage[theme="light"] .OnionStage-Legend', { Color: '#5f666d' }),
        new Css.Rule('.OnionStage[theme="light"] .OnionStage-Input', { Background: '#fff', BorderColor: '#c1c6cb', Color: '#30363b' }),
        new Css.Rule('.OnionStage[theme="light"] .OnionStage-Swatch', { BorderColor: 'rgba(0,0,0,.14)' }),
        new Css.Rule('.OnionStage[theme="light"] .OnionStage-Scene', { Background: 'radial-gradient(circle at 50% 30%,#fff 0%,#f2f3f4 47%,#e4e7e9 100%)' }),
        new Css.Rule('.OnionStage[theme="light"] .OnionStage-Ground', { BackgroundImage: 'linear-gradient(#dedfe1 1px,transparent 1px),linear-gradient(90deg,#dedfe1 1px,transparent 1px)' }),
    ]);

    @Component('arianna-onion-stage', Styles, {
        Shadow: false,
        Attributes: ['before', 'after', 'step', 'width', 'height', 'opacity', 'past-color', 'future-color']
    })
    export class OnionStage extends HTMLDivElement
    {
        public static readonly Styles = Styles;
        public template = html``;

        private _provider?: Types.SnapshotProvider;
        private _frame?: number;
        private _scene?: HTMLElement;
        private _bound?: boolean;

        constructor(options: Interfaces.OnionStageOptions = {})
        {
            super();
            this.EnsureState();
            if(options.before != null) this.setAttribute('before', String(options.before));
            if(options.after != null) this.setAttribute('after', String(options.after));
            if(options.step != null) this.setAttribute('step', String(options.step));
            if(options.width != null) this.setAttribute('width', String(options.width));
            if(options.height != null) this.setAttribute('height', String(options.height));
            if(options.opacity != null) this.setAttribute('opacity', String(options.opacity));
            if(options.pastColor) this.setAttribute('past-color', options.pastColor);
            if(options.futureColor) this.setAttribute('future-color', options.futureColor);
        }

        public get ghostCount(): number
        {
            return this.Before() + this.After();
        }

        public onConnected(): void
        {
            this.EnsureState();
            this.classList.add('OnionStage');
            if(!this.hasAttribute('before')) this.setAttribute('before', '3');
            if(!this.hasAttribute('after')) this.setAttribute('after', '3');
            if(!this.hasAttribute('step')) this.setAttribute('step', '1');
            if(!this.hasAttribute('opacity')) this.setAttribute('opacity', '.4');
            if(!this.hasAttribute('past-color')) this.setAttribute('past-color', '#4b9ee9');
            if(!this.hasAttribute('future-color')) this.setAttribute('future-color', '#e69a45');
            if(!this.hasAttribute('height')) this.setAttribute('height', '300');
            this.Render();
        }

        public onCreated(): void
        {
            requestAnimationFrame(() => { if(this.isConnected) this.onConnected(); });
        }

        public setSnapshotProvider(provider: Types.SnapshotProvider): this
        {
            this.EnsureState();
            this._provider = provider;
            this.Repaint();
            return this;
        }

        public setFrame(frame: number): this
        {
            this.EnsureState();
            this._frame = Math.round(frame);
            this.Repaint();
            this.dispatchEvent(new CustomEvent('arianna:onion-frame', {
                bubbles: true, composed: true, detail: { frame: this._frame, source: this }
            }));
            return this;
        }

        public onAttributeChanged(name: string): void
        {
            if(!this.isConnected) return;
            if(name === 'width' || name === 'height' || name === 'past-color' || name === 'future-color')
            {
                this.Render();
                return;
            }
            if(name === 'before' || name === 'after' || name === 'step' || name === 'opacity') this.Repaint();
        }

        private Render(): void
        {
            const past = this.getAttribute('past-color') ?? '#4b9ee9';
            const future = this.getAttribute('future-color') ?? '#e69a45';
            this.style.setProperty('--OnionStage-PastColor', past);
            this.style.setProperty('--OnionStage-FutureColor', future);
            if(this.hasAttribute('width')) this.style.width = `${Number(this.getAttribute('width')) || 0}px`;
            this.style.height = `${Number(this.getAttribute('height') ?? 300) || 300}px`;

            const toolbar = document.createElement('div');
            toolbar.className = 'OnionStage-Toolbar';
            const before = this.Control('Before', this.Before(), value => { this.setAttribute('before', String(value)); this.Repaint(); });
            const after = this.Control('After', this.After(), value => { this.setAttribute('after', String(value)); this.Repaint(); });
            const opacity = this.Control('Opacity', this.Opacity(), value => { this.setAttribute('opacity', String(Math.max(0, Math.min(1, value)))); this.Repaint(); }, .1);

            const legend = document.createElement('span');
            legend.className = 'OnionStage-Legend';
            const pastSwatch = document.createElement('span');
            pastSwatch.className = 'OnionStage-Swatch'; pastSwatch.dataset.kind = 'past';
            const pastText = document.createElement('span'); pastText.textContent = 'Past';
            const futureSwatch = document.createElement('span');
            futureSwatch.className = 'OnionStage-Swatch'; futureSwatch.dataset.kind = 'future';
            const futureText = document.createElement('span'); futureText.textContent = 'Future';
            legend.append(pastSwatch, pastText, futureSwatch, futureText);
            toolbar.append(before, after, opacity, legend);

            const scene = document.createElement('div');
            scene.className = 'OnionStage-Scene';
            const ground = document.createElement('div');
            ground.className = 'OnionStage-Ground';
            scene.append(ground);
            this._scene = scene;

            this.replaceChildren(toolbar, scene);

            if(!this._bound)
            {
                this._bound = true;
                this.addEventListener('keydown', event =>
                {
                    if((event.target as HTMLElement | null)?.matches('input')) return;
                    if(event.key === 'ArrowLeft') { event.preventDefault(); this.setFrame((this._frame ?? 24) - this.Step()); }
                    else if(event.key === 'ArrowRight') { event.preventDefault(); this.setFrame((this._frame ?? 24) + this.Step()); }
                });
            }
            if(!this.hasAttribute('tabindex')) this.tabIndex = 0;

            let dragX: number | null = null;
            let dragFrame = this._frame ?? 24;
            scene.addEventListener('pointerdown', event =>
            {
                dragX = event.clientX;
                dragFrame = this._frame ?? 24;
                scene.setPointerCapture?.(event.pointerId);
                this.focus();
            });
            scene.addEventListener('pointermove', event =>
            {
                if(dragX == null) return;
                const delta = event.clientX - dragX;
                const frames = Math.round(delta / 24) * this.Step();
                if(frames !== 0) this.setFrame(dragFrame + frames);
            });
            const finish = (event: PointerEvent) =>
            {
                if(dragX == null) return;
                dragX = null;
                try { scene.releasePointerCapture?.(event.pointerId); } catch { /* no-op */ }
            };
            scene.addEventListener('pointerup', finish);
            scene.addEventListener('pointercancel', finish);
            scene.addEventListener('wheel', event =>
            {
                event.preventDefault();
                this.setFrame((this._frame ?? 24) + (event.deltaY > 0 ? this.Step() : -this.Step()));
            }, { passive: false });

            this.Repaint();
        }

        private Repaint(): void
        {
            this.EnsureState();
            const scene = this._scene;
            if(!scene) return;
            scene.querySelectorAll(':scope > .OnionStage-Ghost').forEach(node => node.remove());

            const before = this.Before();
            const after = this.After();
            const step = this.Step();
            const baseOpacity = this.Opacity();

            for(let distance = before; distance >= 1; distance--)
            {
                const frame = (this._frame ?? 24) - distance * step;
                const ghost = this.Ghost(frame, 'past', distance / Math.max(1, before), baseOpacity);
                scene.append(ghost);
            }

            for(let distance = after; distance >= 1; distance--)
            {
                const frame = (this._frame ?? 24) + distance * step;
                const ghost = this.Ghost(frame, 'future', distance / Math.max(1, after), baseOpacity);
                scene.append(ghost);
            }

            scene.append(this.Ghost(this._frame ?? 24, 'live', 0, 1));
        }

        private Ghost(frame: number, kind: 'past' | 'future' | 'live', distance: number, opacity: number): HTMLDivElement
        {
            const wrapper = document.createElement('div');
            wrapper.className = 'OnionStage-Ghost';
            wrapper.dataset.kind = kind;
            const offset = frame - (this._frame ?? 24);
            const scale = kind === 'live' ? 1 : .82 + (1 - distance) * .14;
            wrapper.style.transform = `translateX(calc(-50% + ${offset * 24}px)) scale(${scale})`;
            wrapper.style.opacity = String(kind === 'live' ? 1 : (opacity <= 0 ? 0 : Math.max(.02, opacity * (1 - distance * .62))));

            const snapshot = this._provider?.(frame) ?? this.Figure(frame);
            wrapper.append(snapshot.cloneNode(true));
            return wrapper;
        }

        private Figure(frame: number): HTMLElement
        {
            const figure = document.createElement('div');
            figure.className = 'OnionStage-Figure';
            const phase = frame * .72;
            const swing = Math.sin(phase) * 28;
            const body = Math.sin(phase * .5) * 4;
            figure.style.setProperty('--OnionStage-BodyAngle', `${body}deg`);
            figure.style.setProperty('--OnionStage-ArmLeft', `${swing}deg`);
            figure.style.setProperty('--OnionStage-ArmRight', `${-swing}deg`);
            figure.style.setProperty('--OnionStage-LegLeft', `${-swing * .72}deg`);
            figure.style.setProperty('--OnionStage-LegRight', `${swing * .72}deg`);

            const head = document.createElement('span'); head.className = 'OnionStage-FigureHead';
            const torso = document.createElement('span'); torso.className = 'OnionStage-FigureBody';
            const armLeft = document.createElement('span'); armLeft.className = 'OnionStage-FigureArm'; armLeft.dataset.side = 'left';
            const armRight = document.createElement('span'); armRight.className = 'OnionStage-FigureArm'; armRight.dataset.side = 'right';
            const legLeft = document.createElement('span'); legLeft.className = 'OnionStage-FigureLeg'; legLeft.dataset.side = 'left';
            const legRight = document.createElement('span'); legRight.className = 'OnionStage-FigureLeg'; legRight.dataset.side = 'right';
            figure.append(head, torso, armLeft, armRight, legLeft, legRight);
            return figure;
        }

        private Control(label: string, value: number, change: (value: number) => void, step = 1): HTMLElement
        {
            const control = document.createElement('label');
            control.className = 'OnionStage-Control';
            const text = document.createElement('span'); text.textContent = label;
            const input = document.createElement('input');
            input.className = 'OnionStage-Input'; input.type = 'number'; input.value = String(value); input.step = String(step);
            if(label === 'Before' || label === 'After') input.min = '0';
            if(label === 'Opacity') { input.min = '0'; input.max = '1'; }
            const update = () =>
            {
                const parsed = Number(input.value);
                change(Number.isFinite(parsed) ? parsed : 0);
            };
            input.addEventListener('input', update);
            input.addEventListener('change', update);
            control.append(text, input);
            return control;
        }

        private EnsureState(): void
        {
            if(typeof this._frame !== 'number' || !Number.isFinite(this._frame)) this._frame = 24;
            if(typeof this._bound !== 'boolean') this._bound = false;
        }

        private Before(): number
        {
            const value = Number(this.getAttribute('before') ?? 3);
            return Math.max(0, Number.isFinite(value) ? Math.round(value) : 3);
        }
        private After(): number
        {
            const value = Number(this.getAttribute('after') ?? 3);
            return Math.max(0, Number.isFinite(value) ? Math.round(value) : 3);
        }
        private Step(): number
        {
            const value = Number(this.getAttribute('step') ?? 1);
            return Math.max(1, Number.isFinite(value) ? value : 1);
        }
        private Opacity(): number
        {
            const value = Number(this.getAttribute('opacity') ?? .4);
            return Math.max(0, Math.min(1, Number.isFinite(value) ? value : .4));
        }
    }
}

export type OnionStageOptions = OnionStage.Interfaces.OnionStageOptions;
export type SnapshotProvider = OnionStage.Types.SnapshotProvider;
export default OnionStage.OnionStage;

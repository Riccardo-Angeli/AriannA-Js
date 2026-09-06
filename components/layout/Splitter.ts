/**
 * @module components/layout/Splitter
 * @version 2.0.0
 */

import { Component, Css, Reactivity, Templates } from '../../core/index.ts';

const html = Templates.Template.Html;

export namespace Splitter
{
    export namespace Types
    {
        export type Direction = 'horizontal' | 'vertical';
    }

    export namespace Interfaces
    {
        export interface SplitterOptions
        {
            direction?: Types.Direction;
            ratio?: number;
            minA?: number;
            minB?: number;
        }

        export interface SplitterResizeDetail
        {
            ratio: number;
            direction: Types.Direction;
            sizeA: number;
            sizeB: number;
            splitter: Splitter;
        }
    }

    export const Styles =
        new Css.Stylesheet([
            new Css.Rule('.Splitter', {
                AlignItems: 'stretch',
                BoxSizing: 'border-box',
                Display: 'flex',
                Height: '100%',
                MaxHeight: '100%',
                MaxWidth: '100%',
                MinHeight: '0',
                MinWidth: '0',
                Overflow: 'hidden',
                Position: 'relative',
                Width: '100%',
            }),

            new Css.Rule('.Splitter:not([direction]), .Splitter[direction="horizontal"]', {
                FlexDirection: 'row',
            }),

            new Css.Rule('.Splitter[direction="vertical"]', {
                FlexDirection: 'column',
            }),

            new Css.Rule('.Splitter-Pane', {
                BoxSizing: 'border-box',
                FlexGrow: '0',
                FlexShrink: '0',
                MinHeight: '0',
                MinWidth: '0',
                Overflow: 'auto',
                Position: 'relative',
            }),

            new Css.Rule('.Splitter-PaneB', {
                Flex: '1 1 0',
            }),

            new Css.Rule('.Splitter-Handle', {
                AlignItems: 'center',
                Background: 'transparent',
                Display: 'flex',
                Flex: '0 0 auto',
                JustifyContent: 'center',
                Outline: 'none',
                TouchAction: 'none',
                UserSelect: 'none',
                ZIndex: '5',
            }),

            new Css.Rule('.Splitter:not([direction]) > .Splitter-Handle, .Splitter[direction="horizontal"] > .Splitter-Handle', {
                Cursor: 'col-resize',
                Height: '100%',
                MinWidth: '10px',
                Width: '10px',
            }),

            new Css.Rule('.Splitter[direction="vertical"] > .Splitter-Handle', {
                Cursor: 'row-resize',
                Height: '10px',
                MinHeight: '10px',
                Width: '100%',
            }),

            new Css.Rule('.Splitter-Grip', {
                Background: '#454850',
                BorderRadius: '999px',
                Display: 'block',
                Transition: 'background .12s ease, box-shadow .12s ease',
            }),

            new Css.Rule('.Splitter:not([direction]) > .Splitter-Handle > .Splitter-Grip, .Splitter[direction="horizontal"] > .Splitter-Handle > .Splitter-Grip', {
                Height: '48%',
                Width: '3px',
            }),

            new Css.Rule('.Splitter[direction="vertical"] > .Splitter-Handle > .Splitter-Grip', {
                Height: '3px',
                Width: '48%',
            }),

            new Css.Rule('.Splitter-Handle:hover > .Splitter-Grip, .Splitter-Handle[data-active="true"] > .Splitter-Grip, .Splitter-Handle:focus-visible > .Splitter-Grip', {
                Background: '#e40c88',
                BoxShadow: '0 0 0 3px rgba(228,12,136,.18)',
            }),
        ]);

    @Component('arianna-splitter', Styles, {
        Shadow: false,
        Attributes: ['direction', 'ratio', 'min-a', 'min-b'],
    })
    export class Splitter extends HTMLElement
    {
        public static readonly Styles = Styles;
        public template = html``;

        private _ratioSignal?: ReturnType<typeof Reactivity.CreateSignal<number>>;
        private PaneA?: HTMLElement;
        private PaneB?: HTMLElement;
        private Handle?: HTMLDivElement;
        private Observer?: ResizeObserver;
        private Bound = false;

        constructor(options: Interfaces.SplitterOptions = {})
        {
            super();

            if(options.direction)
                this.direction = options.direction;

            if(options.ratio != null)
                this.ratio = options.ratio;

            if(options.minA != null)
                this.minA = options.minA;

            if(options.minB != null)
                this.minB = options.minB;
        }

        public get ratio$(): ReturnType<typeof Reactivity.CreateSignal<number>>
        {
            this._ratioSignal ??=
                Reactivity.CreateSignal<number>(
                    this.NormalizeRatio(
                        Number(
                            this.getAttribute('ratio') ?? 0.5
                        )
                    )
                );

            return this._ratioSignal;
        }

        public get direction(): Types.Direction
        {
            return this.getAttribute('direction') === 'vertical'
                ? 'vertical'
                : 'horizontal';
        }

        public set direction(value: Types.Direction)
        {
            this.setAttribute('direction', value);

            if(this.isConnected)
            {
                this.ConfigureHandle();
                this.Apply();
            }
        }

        public get ratio(): number
        {
            return this.NormalizeRatio(
                Number(
                    this.getAttribute('ratio') ??
                    this.ratio$.Get()
                )
            );
        }

        public set ratio(value: number)
        {
            const normalized =
                this.NormalizeRatio(value);

            this.ratio$.Set(normalized);
            this.setAttribute('ratio', String(normalized));

            if(this.isConnected)
                this.Apply();
        }

        public get minA(): number
        {
            return this.NumberAttribute('min-a', 60);
        }

        public set minA(value: number)
        {
            this.setAttribute('min-a', String(Math.max(0, value)));

            if(this.isConnected)
                this.Apply();
        }

        public get minB(): number
        {
            return this.NumberAttribute('min-b', 60);
        }

        public set minB(value: number)
        {
            this.setAttribute('min-b', String(Math.max(0, value)));

            if(this.isConnected)
                this.Apply();
        }

        public onConnected(): void
        {
            this.classList.add('Splitter');

            this.Build();
            this.Apply();

            if(!this.Observer)
            {
                this.Observer =
                    new ResizeObserver(
                        () => this.Apply()
                    );

                this.Observer.observe(this);
            }
        }

        public onDisconnected(): void
        {
            this.Observer?.disconnect();
            this.Observer = undefined;
        }

        public onAttributeChanged(name: string): void
        {
            if(!this.isConnected)
                return;

            if(
                name === 'direction' ||
                name === 'ratio' ||
                name === 'min-a' ||
                name === 'min-b'
            )
            {
                this.ConfigureHandle();
                this.Apply();
            }
        }

        private Build(): void
        {
            const panes =
                Array.from(this.children)
                    .filter(
                        element =>
                            !element.classList.contains(
                                'Splitter-Handle'
                            )
                    ) as HTMLElement[];

            if(panes.length < 2)
                return;

            this.PaneA = panes[0];
            this.PaneB = panes[1];

            this.PaneA.classList.add(
                'Splitter-Pane',
                'Splitter-PaneA'
            );

            this.PaneB.classList.add(
                'Splitter-Pane',
                'Splitter-PaneB'
            );

            let handle =
                Array.from(this.children)
                    .find(
                        element =>
                            element.classList.contains(
                                'Splitter-Handle'
                            )
                    ) as HTMLDivElement | undefined;

            if(!handle)
            {
                handle =
                    document.createElement('div');

                handle.className =
                    'Splitter-Handle';

                handle.tabIndex =
                    0;

                handle.setAttribute(
                    'role',
                    'separator'
                );

                const grip =
                    document.createElement('span');

                grip.className =
                    'Splitter-Grip';

                grip.setAttribute(
                    'aria-hidden',
                    'true'
                );

                handle.append(grip);
                this.PaneA.after(handle);
            }

            this.Handle = handle;
            this.ConfigureHandle();

            /*
             * Parser-created AriannA hosts do not necessarily execute class-field
             * initializers. Listeners are therefore closures created HERE, not
             * arrow-function fields.
             */
            if(!this.Bound)
            {
                handle.addEventListener(
                    'pointerdown',
                    event =>
                        this.PointerDown(event)
                );

                handle.addEventListener(
                    'keydown',
                    event =>
                        this.KeyDown(event)
                );

                this.Bound = true;
            }
        }

        private ConfigureHandle(): void
        {
            if(!this.Handle)
                return;

            this.Handle.setAttribute(
                'aria-orientation',
                this.direction === 'vertical'
                    ? 'horizontal'
                    : 'vertical'
            );

            this.Handle.setAttribute(
                'aria-valuemin',
                '0'
            );

            this.Handle.setAttribute(
                'aria-valuemax',
                '100'
            );

            this.Handle.setAttribute(
                'aria-valuenow',
                String(
                    Math.round(
                        this.ratio * 100
                    )
                )
            );
        }

        private Apply(): void
        {
            if(
                !this.PaneA ||
                !this.PaneB ||
                !this.Handle
            )
                return;

            const vertical =
                this.direction === 'vertical';

            const total =
                vertical
                    ? this.clientHeight
                    : this.clientWidth;

            const handleSize =
                vertical
                    ? this.Handle.offsetHeight
                    : this.Handle.offsetWidth;

            const available =
                Math.max(
                    0,
                    total - handleSize
                );

            if(available <= 0)
                return;

            const minA =
                Math.min(
                    this.minA,
                    available
                );

            const minB =
                Math.min(
                    this.minB,
                    available
                );

            const wanted =
                available *
                this.ratio;

            const maximum =
                Math.max(
                    minA,
                    available - minB
                );

            const position =
                Math.max(
                    minA,
                    Math.min(
                        maximum,
                        wanted
                    )
                );

            const actualRatio =
                position /
                available;

            this.ratio$.Set(actualRatio);

            this.PaneA.style.flex =
                `0 0 ${position}px`;

            this.PaneB.style.flex =
                '1 1 0';

            if(vertical)
            {
                this.PaneA.style.width = '100%';
                this.PaneA.style.height = 'auto';

                this.PaneB.style.width = '100%';
                this.PaneB.style.height = 'auto';
            }
            else
            {
                this.PaneA.style.height = '100%';
                this.PaneA.style.width = 'auto';

                this.PaneB.style.height = '100%';
                this.PaneB.style.width = 'auto';
            }

            this.Handle.setAttribute(
                'aria-valuenow',
                String(
                    Math.round(
                        actualRatio * 100
                    )
                )
            );
        }

        private PointerDown(
            event: PointerEvent
        ): void
        {
            if(
                event.button !== 0 ||
                !this.Handle
            )
                return;

            event.preventDefault();

            const pointerId =
                event.pointerId;

            this.Handle.dataset.active =
                'true';

            this.Emit(
                'arianna:resize-start'
            );

            this.SetFromPointer(
                event.clientX,
                event.clientY,
                true
            );

            const move =
                (
                    moveEvent: PointerEvent
                ): void =>
            {
                if(
                    moveEvent.pointerId !==
                    pointerId
                )
                    return;

                moveEvent.preventDefault();

                this.SetFromPointer(
                    moveEvent.clientX,
                    moveEvent.clientY,
                    true
                );
            };

            const end =
                (
                    endEvent: PointerEvent
                ): void =>
            {
                if(
                    endEvent.pointerId !==
                    pointerId
                )
                    return;

                window.removeEventListener(
                    'pointermove',
                    move,
                    true
                );

                window.removeEventListener(
                    'pointerup',
                    end,
                    true
                );

                window.removeEventListener(
                    'pointercancel',
                    end,
                    true
                );

                if(this.Handle)
                    delete this.Handle.dataset.active;

                this.Emit(
                    'arianna:resize-end'
                );
            };

            window.addEventListener(
                'pointermove',
                move,
                true
            );

            window.addEventListener(
                'pointerup',
                end,
                true
            );

            window.addEventListener(
                'pointercancel',
                end,
                true
            );
        }

        private SetFromPointer(
            clientX: number,
            clientY: number,
            emit: boolean
        ): void
        {
            if(!this.Handle)
                return;

            const bounds =
                this.getBoundingClientRect();

            const vertical =
                this.direction === 'vertical';

            const handleSize =
                vertical
                    ? this.Handle.offsetHeight
                    : this.Handle.offsetWidth;

            const available =
                Math.max(
                    0,
                    (
                        vertical
                            ? bounds.height
                            : bounds.width
                    ) -
                    handleSize
                );

            if(available <= 0)
                return;

            const raw =
                vertical
                    ? clientY -
                        bounds.top -
                        handleSize / 2
                    : clientX -
                        bounds.left -
                        handleSize / 2;

            const minA =
                Math.min(
                    this.minA,
                    available
                );

            const minB =
                Math.min(
                    this.minB,
                    available
                );

            const position =
                Math.max(
                    minA,
                    Math.min(
                        available - minB,
                        raw
                    )
                );

            const ratio =
                position /
                available;

            this.ratio$.Set(ratio);

            /*
             * Write the attribute directly and apply immediately. The component
             * does not depend on attribute-observer timing while dragging.
             */
            this.setAttribute(
                'ratio',
                String(ratio)
            );

            this.Apply();

            if(emit)
                this.Emit(
                    'arianna:resize'
                );
        }

        private KeyDown(
            event: KeyboardEvent
        ): void
        {
            const vertical =
                this.direction === 'vertical';

            const minus =
                vertical
                    ? event.key === 'ArrowUp'
                    : event.key === 'ArrowLeft';

            const plus =
                vertical
                    ? event.key === 'ArrowDown'
                    : event.key === 'ArrowRight';

            if(
                !minus &&
                !plus &&
                event.key !== 'Home' &&
                event.key !== 'End'
            )
                return;

            event.preventDefault();

            const step =
                event.shiftKey
                    ? 0.10
                    : 0.02;

            let next =
                this.ratio;

            if(minus)
                next -= step;
            else if(plus)
                next += step;
            else if(event.key === 'Home')
                next = 0;
            else if(event.key === 'End')
                next = 1;

            this.Emit(
                'arianna:resize-start'
            );

            this.ratio =
                next;

            this.Emit(
                'arianna:resize'
            );

            this.Emit(
                'arianna:resize-end'
            );
        }

        private Emit(
            type: string
        ): void
        {
            if(
                !this.PaneA ||
                !this.PaneB
            )
                return;

            const detail:
                Interfaces.SplitterResizeDetail =
            {
                ratio: this.ratio,
                direction: this.direction,
                sizeA:
                    this.direction === 'vertical'
                        ? this.PaneA.offsetHeight
                        : this.PaneA.offsetWidth,
                sizeB:
                    this.direction === 'vertical'
                        ? this.PaneB.offsetHeight
                        : this.PaneB.offsetWidth,
                splitter: this,
            };

            this.dispatchEvent(
                new CustomEvent(
                    type,
                    {
                        bubbles: true,
                        composed: true,
                        detail,
                    }
                )
            );
        }

        private NormalizeRatio(
            value: number
        ): number
        {
            if(!Number.isFinite(value))
                return 0.5;

            const ratio =
                value > 1
                    ? value / 100
                    : value;

            return Math.max(
                0,
                Math.min(
                    1,
                    ratio
                )
            );
        }

        private NumberAttribute(
            name: string,
            fallback: number
        ): number
        {
            const value =
                Number(
                    this.getAttribute(name)
                );

            return Number.isFinite(value)
                ? Math.max(0, value)
                : fallback;
        }
    }
}

export type SplitterOptions = Splitter.Interfaces.SplitterOptions;
export type SplitterDirection = Splitter.Types.Direction;
export type SplitterResizeDetail = Splitter.Interfaces.SplitterResizeDetail;
export default Splitter.Splitter;

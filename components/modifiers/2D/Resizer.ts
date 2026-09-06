/**
 * @module components/modifiers/2D/Resizer
 * @description Reactive eight-direction Resizer with full edge hit areas.
 */

import {
    Component,
    Css,
    Templates,
} from '../../../core/index.ts';

import * as Base from './Base.ts';

export namespace Resizer
{
    export namespace Types
    {
        export type ResizeDirection =
            'North' |
            'NorthEast' |
            'East' |
            'SouthEast' |
            'South' |
            'SouthWest' |
            'West' |
            'NorthWest';

        /** @deprecated Use ResizeDirection. */
        export type ResizeDir = ResizeDirection;
    }

    export namespace Interfaces
    {
        export interface ResizerOptions
        {
            handles?: Types.ResizeDirection[];
            minWidth?: number;
            minHeight?: number;
            maxWidth?: number;
            maxHeight?: number;
            allowCross?: boolean;
            disabled?: boolean;
        }
    }

    const html =
        Templates.Template.Html;

    const Directions:
        readonly Types.ResizeDirection[] =
    [
        'North',
        'NorthEast',
        'East',
        'SouthEast',
        'South',
        'SouthWest',
        'West',
        'NorthWest',
    ];

    const Aliases:
        Readonly<Record<string, Types.ResizeDirection>> =
    {
        n: 'North',
        north: 'North',

        ne: 'NorthEast',
        northeast: 'NorthEast',

        e: 'East',
        east: 'East',

        se: 'SouthEast',
        southeast: 'SouthEast',

        s: 'South',
        south: 'South',

        sw: 'SouthWest',
        southwest: 'SouthWest',

        w: 'West',
        west: 'West',

        nw: 'NorthWest',
        northwest: 'NorthWest',
    };

    function normalize(
        value: string
    ): Types.ResizeDirection | null
    {
        return (
            Aliases[
                value
                    .trim()
                    .replace(/[\s_-]+/g, '')
                    .toLowerCase()
            ] ??
            null
        );
    }

    function West(
        direction: Types.ResizeDirection
    ): boolean
    {
        return (
            direction === 'West' ||
            direction === 'NorthWest' ||
            direction === 'SouthWest'
        );
    }

    function East(
        direction: Types.ResizeDirection
    ): boolean
    {
        return (
            direction === 'East' ||
            direction === 'NorthEast' ||
            direction === 'SouthEast'
        );
    }

    function North(
        direction: Types.ResizeDirection
    ): boolean
    {
        return (
            direction === 'North' ||
            direction === 'NorthEast' ||
            direction === 'NorthWest'
        );
    }

    function South(
        direction: Types.ResizeDirection
    ): boolean
    {
        return (
            direction === 'South' ||
            direction === 'SouthEast' ||
            direction === 'SouthWest'
        );
    }

    /*
     * The four side handlers are full edge strips.
     * The four diagonal handlers are corner squares.
     * They are invisible by default but remain hit-testable.
     */
    export const Styles =
        new Css.Stylesheet([
            new Css.Rule('.Resizer', {
                Display: 'contents',
            }),

            new Css.Rule('.Resizer-Handle', {
                Background: 'transparent',
                Border: '0',
                BoxSizing: 'border-box',
                Opacity: '0',
                PointerEvents: 'auto',
                Position: 'absolute',
                TouchAction: 'none',
                UserSelect: 'none',
                ZIndex: '2147483646',
            }),

            new Css.Rule('.Resizer-North', {
                Cursor: 'n-resize',
                Height: '12px',
                Left: '20px',
                Right: '20px',
                Top: '0',
            }),

            new Css.Rule('.Resizer-South', {
                Bottom: '0',
                Cursor: 's-resize',
                Height: '12px',
                Left: '20px',
                Right: '20px',
            }),

            new Css.Rule('.Resizer-East', {
                Bottom: '20px',
                Cursor: 'e-resize',
                Right: '0',
                Top: '20px',
                Width: '12px',
            }),

            new Css.Rule('.Resizer-West', {
                Bottom: '20px',
                Cursor: 'w-resize',
                Left: '0',
                Top: '20px',
                Width: '12px',
            }),

            new Css.Rule('.Resizer-NorthEast', {
                Cursor: 'ne-resize',
                Height: '20px',
                Right: '0',
                Top: '0',
                Width: '20px',
            }),

            new Css.Rule('.Resizer-NorthWest', {
                Cursor: 'nw-resize',
                Height: '20px',
                Left: '0',
                Top: '0',
                Width: '20px',
            }),

            new Css.Rule('.Resizer-SouthEast', {
                Bottom: '0',
                Cursor: 'se-resize',
                Height: '20px',
                Right: '0',
                Width: '20px',
            }),

            new Css.Rule('.Resizer-SouthWest', {
                Bottom: '0',
                Cursor: 'sw-resize',
                Height: '20px',
                Left: '0',
                Width: '20px',
            }),
        ]);

    @Component(
        'arianna-resizer',
        Styles,
        {
            Shadow: false,
            Attributes:
            [
                'handles',
                'min-width',
                'min-height',
                'max-width',
                'max-height',
                'allow-cross',
                'disabled',
            ],
        }
    )
    export class Resizer
        extends Base.Modifier2D.Modifier2D
    {
        public static readonly Styles =
            Styles;

        public template =
            html``;

        protected EventName =
            'resize';

        protected applyTo(
            target: HTMLElement
        ): void
        {
            this.classList.add(
                'Resizer'
            );

            if(
                getComputedStyle(target)
                    .position === 'static'
            )
                target.style.position =
                    'relative';

            const handlesAttribute =
                this.getAttribute('handles');

            const directions =
                handlesAttribute
                    ? handlesAttribute
                        .split(',')
                        .map(normalize)
                        .filter(
                            (
                                value
                            ): value is Types.ResizeDirection =>
                                value !== null
                        )
                    : [...Directions];

            const allowCross =
                this.getAttribute(
                    'allow-cross'
                ) !== 'false';

            const minWidth =
                Number.parseInt(
                    this.getAttribute(
                        'min-width'
                    ) ??
                    (allowCross ? '0' : '40'),
                    10
                ) ||
                (allowCross ? 0 : 40);

            const minHeight =
                Number.parseInt(
                    this.getAttribute(
                        'min-height'
                    ) ??
                    (allowCross ? '0' : '40'),
                    10
                ) ||
                (allowCross ? 0 : 40);

            const maxWidth =
                Number.parseInt(
                    this.getAttribute(
                        'max-width'
                    ) ??
                    '99999',
                    10
                ) ||
                99999;

            const maxHeight =
                Number.parseInt(
                    this.getAttribute(
                        'max-height'
                    ) ??
                    '99999',
                    10
                ) ||
                99999;

            for(const direction of directions)
            {
                const handle =
                    document.createElement(
                        'div'
                    );

                handle.className =
                    `Resizer-Handle Resizer-${direction}`;

                handle.dataset.resizeDirection =
                    direction;

                handle.setAttribute(
                    'aria-hidden',
                    'true'
                );

                target.appendChild(
                    handle
                );

                let pointerId = -1;
                let startX = 0;
                let startY = 0;
                let startLeft = 0;
                let startTop = 0;
                let startWidth = 0;
                let startHeight = 0;

                const onMove =
                    (
                        event: PointerEvent
                    ): void =>
                {
                    if(
                        event.pointerId !==
                            pointerId ||
                        !this.isEnabled
                    )
                        return;

                    const dx =
                        event.clientX -
                        startX;

                    const dy =
                        event.clientY -
                        startY;

                    let left =
                        startLeft;

                    let top =
                        startTop;

                    let width =
                        startWidth;

                    let height =
                        startHeight;

                    if(East(direction))
                        width =
                            startWidth + dx;

                    if(South(direction))
                        height =
                            startHeight + dy;

                    if(West(direction))
                    {
                        width =
                            startWidth - dx;

                        left =
                            startLeft + dx;
                    }

                    if(North(direction))
                    {
                        height =
                            startHeight - dy;

                        top =
                            startTop + dy;
                    }

                    if(!allowCross)
                    {
                        if(width < minWidth)
                        {
                            if(West(direction))
                                left -=
                                    minWidth -
                                    width;

                            width =
                                minWidth;
                        }

                        if(height < minHeight)
                        {
                            if(North(direction))
                                top -=
                                    minHeight -
                                    height;

                            height =
                                minHeight;
                        }
                    }

                    width =
                        Math.min(
                            maxWidth,
                            Math.max(
                                allowCross
                                    ? 0
                                    : minWidth,
                                width
                            )
                        );

                    height =
                        Math.min(
                            maxHeight,
                            Math.max(
                                allowCross
                                    ? 0
                                    : minHeight,
                                height
                            )
                        );

                    const parent =
                        target.parentElement;

                    if(parent)
                    {
                        left =
                            Math.max(
                                0,
                                left
                            );

                        top =
                            Math.max(
                                0,
                                top
                            );

                        width =
                            Math.min(
                                width,
                                Math.max(
                                    0,
                                    parent.clientWidth -
                                    left
                                )
                            );

                        height =
                            Math.min(
                                height,
                                Math.max(
                                    0,
                                    parent.clientHeight -
                                    top
                                )
                            );
                    }

                    left =
                        Math.round(left);

                    top =
                        Math.round(top);

                    width =
                        Math.round(width);

                    height =
                        Math.round(height);

                    target.style.left =
                        `${left}px`;

                    target.style.top =
                        `${top}px`;

                    target.style.width =
                        `${width}px`;

                    target.style.height =
                        `${height}px`;

                    target.setAttribute(
                        'x',
                        String(left)
                    );

                    target.setAttribute(
                        'y',
                        String(top)
                    );

                    target.setAttribute(
                        'width',
                        String(width)
                    );

                    target.setAttribute(
                        'height',
                        String(height)
                    );

                    this.Change({
                        direction,
                        x: left,
                        y: top,
                        width,
                        height,
                        pointerId,
                    });
                };

                const onUp =
                    (
                        event: PointerEvent
                    ): void =>
                {
                    if(
                        event.pointerId !==
                        pointerId
                    )
                        return;

                    try
                    {
                        handle
                            .releasePointerCapture(
                                pointerId
                            );
                    }
                    catch
                    {
                    }

                    handle.removeEventListener(
                        'pointermove',
                        onMove
                    );

                    handle.removeEventListener(
                        'pointerup',
                        onUp
                    );

                    handle.removeEventListener(
                        'pointercancel',
                        onUp
                    );

                    this.End({
                        direction,
                        x: target.offsetLeft,
                        y: target.offsetTop,
                        width: target.offsetWidth,
                        height: target.offsetHeight,
                        pointerId,
                    });

                    pointerId = -1;
                };

                const onDown =
                    (
                        event: PointerEvent
                    ): void =>
                {
                    if(
                        !this.isEnabled ||
                        event.button !== 0
                    )
                        return;

                    event.preventDefault();
                    event.stopPropagation();

                    pointerId =
                        event.pointerId;

                    startX =
                        event.clientX;

                    startY =
                        event.clientY;

                    startLeft =
                        target.offsetLeft;

                    startTop =
                        target.offsetTop;

                    startWidth =
                        target.offsetWidth;

                    startHeight =
                        target.offsetHeight;

                    try
                    {
                        handle
                            .setPointerCapture(
                                pointerId
                            );
                    }
                    catch
                    {
                    }

                    handle.addEventListener(
                        'pointermove',
                        onMove
                    );

                    handle.addEventListener(
                        'pointerup',
                        onUp
                    );

                    handle.addEventListener(
                        'pointercancel',
                        onUp
                    );

                    this.Start({
                        direction,
                        x: startLeft,
                        y: startTop,
                        width: startWidth,
                        height: startHeight,
                        pointerId,
                    });
                };

                handle.addEventListener(
                    'pointerdown',
                    onDown
                );

                this.cleanups.push(
                    () =>
                    {
                        handle.removeEventListener(
                            'pointerdown',
                            onDown
                        );

                        handle.remove();
                    }
                );
            }
        }
    }
}

export type ResizeDirection =
    Resizer.Types.ResizeDirection;

export type ResizerOptions =
    Resizer.Interfaces.ResizerOptions;

export default Resizer.Resizer;

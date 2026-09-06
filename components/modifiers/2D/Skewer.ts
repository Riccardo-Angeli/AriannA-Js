/**
 * @module components/modifiers/2D/Skewer
 */

import { Component, Templates } from '../../../core/index.ts';
import * as Base from './Base.ts';

export namespace Skewer
{
    export namespace Types
    {
        export type Axis = 'x' | 'y' | 'both';
    }

    export namespace Interfaces
    {
        export interface SkewerOptions
        {
            axis?: Types.Axis;
            maxAngle?: number;
            handleColor?: string;
            disabled?: boolean;
        }
    }

    const html = Templates.Template.Html;

    @Component('arianna-skewer', {}, {
        Shadow: false,
        Attributes: [
            'axis',
            'max-angle',
            'handle-color',
            'disabled',
        ],
    })
    export class Skewer
        extends Base.Modifier2D.Modifier2D
    {
        public template = html``;
        protected EventName = 'skew';

        #skew: [number, number] =
            [0, 0];

        protected applyTo(target: HTMLElement): void
        {
            if(getComputedStyle(target).position === 'static')
                target.style.position = 'relative';

            const axis =
                (this.getAttribute('axis') ?? 'both') as
                    | 'x'
                    | 'y'
                    | 'both';

            const max =
                Number.parseFloat(
                    this.getAttribute('max-angle') ?? '45'
                ) || 45;

            const color =
                this.getAttribute('handle-color') ??
                'var(--arianna-primary, #1f6feb)';

            const handle =
                document.createElement('div');

            handle.className =
                'ar-skewer-handle';

            handle.style.cssText =
                `position:absolute;bottom:-10px;right:-10px;width:10px;height:10px;background:${color};border-radius:50%;cursor:crosshair;z-index:9999;touch-action:none;`;

            target.appendChild(handle);

            let pointerId = -1;

            const onDown =
                (event: PointerEvent): void =>
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

                const startX =
                    event.clientX;

                const startY =
                    event.clientY;

                const [startSkewX, startSkewY] =
                    this.#skew;

                this.Start({
                    skewX: startSkewX,
                    skewY: startSkewY,
                    pointerId,
                });

                const onMove =
                    (
                        moveEvent: PointerEvent
                    ): void =>
                {
                    if(
                        moveEvent.pointerId !==
                        pointerId
                    )
                        return;

                    const dx =
                        (
                            moveEvent.clientX -
                            startX
                        ) /
                        4;

                    const dy =
                        (
                            moveEvent.clientY -
                            startY
                        ) /
                        4;

                    const skewX =
                        axis !== 'y'
                            ? Math.max(
                                -max,
                                Math.min(
                                    max,
                                    startSkewX + dx
                                )
                            )
                            : startSkewX;

                    const skewY =
                        axis !== 'x'
                            ? Math.max(
                                -max,
                                Math.min(
                                    max,
                                    startSkewY + dy
                                )
                            )
                            : startSkewY;

                    this.#skew =
                        [skewX, skewY];

                    target.style.transform =
                        `skew(${skewX}deg,${skewY}deg)`;

                    this.Change({
                        skewX,
                        skewY,
                        pointerId,
                    });
                };

                const onUp =
                    (
                        upEvent: PointerEvent
                    ): void =>
                {
                    if(
                        upEvent.pointerId !==
                        pointerId
                    )
                        return;

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
                        skewX: this.#skew[0],
                        skewY: this.#skew[1],
                        pointerId,
                    });

                    pointerId = -1;
                };

                try
                {
                    handle.setPointerCapture(
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

        public reset(): this
        {
            if(this.target)
            {
                this.Start({
                    skewX: this.#skew[0],
                    skewY: this.#skew[1],
                    programmatic: true,
                });

                this.#skew =
                    [0, 0];

                this.target.style.transform = '';

                this.Change({
                    skewX: 0,
                    skewY: 0,
                    programmatic: true,
                });

                this.End({
                    skewX: 0,
                    skewY: 0,
                    programmatic: true,
                });
            }

            return this;
        }

        public getSkew(): readonly [number, number]
        {
            return [...this.#skew] as [number, number];
        }
    }
}

export type SkewerAxis = Skewer.Types.Axis;
export type SkewerOptions = Skewer.Interfaces.SkewerOptions;

export default Skewer.Skewer;

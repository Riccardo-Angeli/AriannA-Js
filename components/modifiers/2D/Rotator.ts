/**
 * @module components/modifiers/2D/Rotator
 */

import { Component, Templates } from '../../../core/index.ts';
import * as Base from './Base.ts';

export namespace Rotator
{
    export namespace Interfaces
    {
        export interface RotatorOptions
        {
            handleOffset?: number;
            handleColor?: string;
            handleSize?: number;
            snap?: number;
            disabled?: boolean;
        }
    }

    const html = Templates.Template.Html;

    @Component('arianna-rotator', {}, {
        Shadow: false,
        Attributes: [
            'handle-offset',
            'handle-color',
            'handle-size',
            'snap',
            'disabled',
        ],
    })
    export class Rotator
        extends Base.Modifier2D.Modifier2D
    {
        public template = html``;
        protected EventName = 'rotate';

        #angle = 0;

        protected applyTo(target: HTMLElement): void
        {
            if(getComputedStyle(target).position === 'static')
                target.style.position = 'relative';

            const offset =
                Number.parseInt(
                    this.getAttribute('handle-offset') ?? '24',
                    10
                ) || 24;

            const size =
                Number.parseInt(
                    this.getAttribute('handle-size') ?? '10',
                    10
                ) || 10;

            const color =
                this.getAttribute('handle-color') ??
                'var(--arianna-primary, #1f6feb)';

            const snap =
                Number.parseFloat(
                    this.getAttribute('snap') ?? '0'
                ) || 0;

            const line =
                document.createElement('div');

            line.className =
                'ar-rotator-line';

            line.style.cssText =
                `position:absolute;top:-${offset}px;left:50%;width:1px;height:${offset}px;background:${color};transform-origin:bottom;pointer-events:none;z-index:9998;`;

            target.appendChild(line);

            const handle =
                document.createElement('div');

            handle.className =
                'ar-rotator-handle';

            handle.style.cssText =
                `position:absolute;top:-${offset + size}px;left:50%;transform:translateX(-50%);width:${size}px;height:${size}px;background:${color};border-radius:50%;cursor:grab;z-index:9999;touch-action:none;`;

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

                const rect =
                    target.getBoundingClientRect();

                const centerX =
                    rect.left +
                    rect.width / 2;

                const centerY =
                    rect.top +
                    rect.height / 2;

                const startAngle =
                    this.#angle;

                const startMouse =
                    Math.atan2(
                        event.clientY - centerY,
                        event.clientX - centerX
                    ) *
                    180 /
                    Math.PI;

                this.Start({
                    angle: startAngle,
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

                    const current =
                        Math.atan2(
                            moveEvent.clientY -
                                centerY,
                            moveEvent.clientX -
                                centerX
                        ) *
                        180 /
                        Math.PI;

                    let angle =
                        startAngle +
                        current -
                        startMouse;

                    if(snap > 0)
                        angle =
                            Math.round(
                                angle / snap
                            ) *
                            snap;

                    this.#angle =
                        angle;

                    target.style.transform =
                        `rotate(${angle}deg)`;

                    this.Change({
                        angle,
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
                        angle: this.#angle,
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
                    line.remove();
                }
            );
        }

        public setAngle(angle: number): this
        {
            if(this.target)
            {
                this.Start({
                    angle: this.#angle,
                    programmatic: true,
                });

                this.#angle = angle;

                this.target.style.transform =
                    `rotate(${angle}deg)`;

                this.Change({
                    angle,
                    programmatic: true,
                });

                this.End({
                    angle,
                    programmatic: true,
                });
            }

            return this;
        }

        public getAngle(): number
        {
            return this.#angle;
        }
    }
}

export type RotatorOptions = Rotator.Interfaces.RotatorOptions;

export default Rotator.Rotator;

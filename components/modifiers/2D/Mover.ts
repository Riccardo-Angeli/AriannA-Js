/**
 * @module components/modifiers/2D/Mover
 */

import { Component, Templates } from '../../../core/index.ts';
import * as Base from './Base.ts';

export namespace Mover
{
    export namespace Types
    {
        export type Axis = 'x' | 'y' | 'both';
        export type Bounds = 'none' | 'parent' | 'viewport';
    }

    export namespace Interfaces
    {
        export interface MoverOptions
        {
            handleSelector?: string;
            axis?: Types.Axis;
            bounds?: Types.Bounds;
            disabled?: boolean;
        }
    }

    const html = Templates.Template.Html;

    @Component('arianna-mover', {}, {
        Shadow: false,
        Attributes: ['handle-selector', 'axis', 'bounds', 'disabled'],
    })
    export class Mover extends Base.Modifier2D.Modifier2D
    {
        public template = html``;
        protected EventName = 'move';

        protected applyTo(target: HTMLElement): void
        {
            if(getComputedStyle(target).position === 'static')
                target.style.position = 'absolute';

            const handleSelector =
                this.getAttribute('handle-selector');

            const axis =
                (this.getAttribute('axis') ?? 'both') as
                    | 'x'
                    | 'y'
                    | 'both';

            const bounds =
                (this.getAttribute('bounds') ?? 'none') as
                    | 'none'
                    | 'parent'
                    | 'viewport';

            let pointerId = -1;
            let startPointerX = 0;
            let startPointerY = 0;
            let startLeft = 0;
            let startTop = 0;

            const isOnHandle =
                (element: EventTarget | null): boolean =>
            {
                if(!handleSelector)
                    return true;

                if(!(element instanceof HTMLElement))
                    return false;

                let current: HTMLElement | null =
                    element;

                while(current && current !== target)
                {
                    if(current.matches(handleSelector))
                        return true;

                    current =
                        current.parentElement;
                }

                return false;
            };

            const onMove =
                (event: PointerEvent): void =>
            {
                if(
                    event.pointerId !== pointerId ||
                    !this.isEnabled
                )
                    return;

                let x =
                    startLeft +
                    event.clientX -
                    startPointerX;

                let y =
                    startTop +
                    event.clientY -
                    startPointerY;

                if(axis === 'x')
                    y = startTop;

                if(axis === 'y')
                    x = startLeft;

                if(
                    bounds === 'parent' &&
                    target.parentElement
                )
                {
                    const parent =
                        target.parentElement;

                    const maxX =
                        Math.max(
                            0,
                            parent.clientWidth -
                            target.offsetWidth
                        );

                    const maxY =
                        Math.max(
                            0,
                            parent.clientHeight -
                            target.offsetHeight
                        );

                    x =
                        Math.max(
                            0,
                            Math.min(maxX, x)
                        );

                    y =
                        Math.max(
                            0,
                            Math.min(maxY, y)
                        );
                }
                else if(bounds === 'viewport')
                {
                    const maxX =
                        Math.max(
                            0,
                            window.innerWidth -
                            target.offsetWidth
                        );

                    const maxY =
                        Math.max(
                            0,
                            window.innerHeight -
                            target.offsetHeight
                        );

                    x =
                        Math.max(
                            0,
                            Math.min(maxX, x)
                        );

                    y =
                        Math.max(
                            0,
                            Math.min(maxY, y)
                        );
                }

                x = Math.round(x);
                y = Math.round(y);

                target.style.left = `${x}px`;
                target.style.top = `${y}px`;

                target.setAttribute('x', String(x));
                target.setAttribute('y', String(y));

                this.Change({
                    x,
                    y,
                    pointerId,
                });
            };

            const onUp =
                (event: PointerEvent): void =>
            {
                if(event.pointerId !== pointerId)
                    return;

                try
                {
                    target.releasePointerCapture(
                        pointerId
                    );
                }
                catch
                {
                }

                target.removeEventListener(
                    'pointermove',
                    onMove
                );

                target.removeEventListener(
                    'pointerup',
                    onUp
                );

                target.removeEventListener(
                    'pointercancel',
                    onUp
                );

                const x =
                    target.offsetLeft;

                const y =
                    target.offsetTop;

                this.End({
                    x,
                    y,
                    pointerId,
                });

                pointerId = -1;
            };

            const onDown =
                (event: PointerEvent): void =>
            {
                if(
                    !this.isEnabled ||
                    event.button !== 0 ||
                    !isOnHandle(event.target)
                )
                    return;

                const eventTarget =
                    event.target;

                if(eventTarget instanceof HTMLElement)
                {
                    const interactive =
                        eventTarget.closest(
                            'input, textarea, select, button, [contenteditable="true"]'
                        );

                    if(
                        interactive &&
                        interactive !== target &&
                        !handleSelector
                    )
                        return;
                }

                event.preventDefault();

                pointerId =
                    event.pointerId;

                startPointerX =
                    event.clientX;

                startPointerY =
                    event.clientY;

                startLeft =
                    target.offsetLeft;

                startTop =
                    target.offsetTop;

                try
                {
                    target.setPointerCapture(
                        pointerId
                    );
                }
                catch
                {
                }

                target.addEventListener(
                    'pointermove',
                    onMove
                );

                target.addEventListener(
                    'pointerup',
                    onUp
                );

                target.addEventListener(
                    'pointercancel',
                    onUp
                );

                this.Start({
                    x: startLeft,
                    y: startTop,
                    pointerId,
                });
            };

            target.addEventListener(
                'pointerdown',
                onDown
            );

            target.style.cursor =
                handleSelector
                    ? ''
                    : 'move';

            this.cleanups.push(
                () =>
                {
                    target.removeEventListener(
                        'pointerdown',
                        onDown
                    );

                    target.style.cursor = '';
                }
            );
        }
    }
}

export type MoverAxis = Mover.Types.Axis;
export type MoverBounds = Mover.Types.Bounds;
export type MoverOptions = Mover.Interfaces.MoverOptions;

export default Mover.Mover;

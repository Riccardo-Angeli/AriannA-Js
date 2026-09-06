/**
 * @module components/modifiers/2D/Rounder
 */

import { Component, Templates } from '../../../core/index.ts';
import * as Base from './Base.ts';

export namespace Rounder
{
    export namespace Types
    {
        export type Corner =
            'top-left' |
            'top-right' |
            'bottom-left' |
            'bottom-right';
    }

    export type Corner = Types.Corner;

    export namespace Interfaces
    {
        export interface RounderOptions
        {
            r?: number;
            radius?: number;
            topLeft?: number;
            topRight?: number;
            bottomLeft?: number;
            bottomRight?: number;
            max?: number;
            handleColor?: string;
            corners?: Types.Corner[];
            disabled?: boolean;
        }
    }

    const html = Templates.Template.Html;

    function cornerPosition(
        corner: Corner
    ): string
    {
        const offset = '6px';

        switch(corner)
        {
            case 'top-left':
                return `top:${offset};left:${offset};cursor:nwse-resize;`;

            case 'top-right':
                return `top:${offset};right:${offset};cursor:nesw-resize;`;

            case 'bottom-left':
                return `bottom:${offset};left:${offset};cursor:nesw-resize;`;

            case 'bottom-right':
                return `bottom:${offset};right:${offset};cursor:nwse-resize;`;
        }
    }

    @Component('arianna-rounder', {}, {
        Shadow: false,
        Attributes: [
            'r',
            'radius',
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right',
            'max',
            'handle-color',
            'corners',
            'disabled',
        ],
    })
    export class Rounder
        extends Base.Modifier2D.Modifier2D
    {
        public template = html``;
        protected EventName = 'round';

        #state: Record<Corner, number> =
        {
            'top-left': 0,
            'top-right': 0,
            'bottom-left': 0,
            'bottom-right': 0,
        };

        protected applyTo(target: HTMLElement): void
        {
            if(getComputedStyle(target).position === 'static')
                target.style.position = 'relative';

            const uniform =
                Number.parseFloat(
                    this.getAttribute('r') ??
                    this.getAttribute('radius') ??
                    '0'
                ) || 0;

            const max =
                Number.parseFloat(
                    this.getAttribute('max') ?? '100'
                ) || 100;

            const color =
                this.getAttribute('handle-color') ??
                'var(--arianna-primary, #1f6feb)';

            const names: Corner[] =
            [
                'top-left',
                'top-right',
                'bottom-left',
                'bottom-right',
            ];

            let perCorner = false;

            for(const corner of names)
            {
                const value =
                    this.getAttribute(corner);

                if(value !== null)
                    perCorner = true;

                this.#state[corner] =
                    value !== null
                        ? Number.parseFloat(value)
                        : uniform;
            }

            this.Render(target);

            if(perCorner)
            {
                const selected =
                    this.getAttribute('corners')
                        ?.split(',')
                        .map(value => value.trim())
                        .filter(
                            (value): value is Corner =>
                                names.includes(
                                    value as Corner
                                )
                        ) ??
                    names;

                for(const corner of selected)
                    this.AddCorner(
                        target,
                        corner,
                        color,
                        max
                    );
            }
            else
                this.AddUniform(
                    target,
                    color,
                    max
                );
        }

        private Render(target: HTMLElement): void
        {
            target.style.borderRadius =
                `${this.#state['top-left']}px ${this.#state['top-right']}px ${this.#state['bottom-right']}px ${this.#state['bottom-left']}px`;
        }

        private AddUniform(
            target: HTMLElement,
            color: string,
            max: number
        ): void
        {
            const handle =
                document.createElement('div');

            handle.className =
                'ar-rounder-handle';

            handle.style.cssText =
                `position:absolute;top:6px;left:6px;width:10px;height:10px;background:${color};border-radius:50%;cursor:ew-resize;z-index:9999;touch-action:none;`;

            target.appendChild(handle);

            let pointerId = -1;
            let startX = 0;
            let startRadius = 0;

            const onMove =
                (event: PointerEvent): void =>
            {
                if(event.pointerId !== pointerId)
                    return;

                const radius =
                    Math.max(
                        0,
                        Math.min(
                            max,
                            startRadius +
                            (
                                event.clientX -
                                startX
                            ) /
                            2
                        )
                    );

                for(const corner of Object.keys(this.#state) as Corner[])
                    this.#state[corner] = radius;

                this.Render(target);

                this.Change({
                    radius,
                    corner: 'all',
                    pointerId,
                });
            };

            const onUp =
                (event: PointerEvent): void =>
            {
                if(event.pointerId !== pointerId)
                    return;

                handle.removeEventListener('pointermove', onMove);
                handle.removeEventListener('pointerup', onUp);
                handle.removeEventListener('pointercancel', onUp);

                this.End({
                    radius: this.#state['top-left'],
                    corner: 'all',
                    pointerId,
                });

                pointerId = -1;
            };

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

                pointerId = event.pointerId;
                startX = event.clientX;
                startRadius = this.#state['top-left'];

                this.Start({
                    radius: startRadius,
                    corner: 'all',
                    pointerId,
                });

                try
                {
                    handle.setPointerCapture(pointerId);
                }
                catch
                {
                }

                handle.addEventListener('pointermove', onMove);
                handle.addEventListener('pointerup', onUp);
                handle.addEventListener('pointercancel', onUp);
            };

            handle.addEventListener('pointerdown', onDown);

            this.cleanups.push(
                () =>
                {
                    handle.removeEventListener('pointerdown', onDown);
                    handle.remove();
                }
            );
        }

        private AddCorner(
            target: HTMLElement,
            corner: Corner,
            color: string,
            max: number
        ): void
        {
            const handle =
                document.createElement('div');

            handle.className =
                'ar-rounder-handle';

            handle.dataset.corner =
                corner;

            handle.style.cssText =
                `position:absolute;width:10px;height:10px;background:${color};border-radius:50%;z-index:9999;touch-action:none;${cornerPosition(corner)}`;

            target.appendChild(handle);

            let pointerId = -1;
            let startY = 0;
            let startRadius = 0;

            const onMove =
                (event: PointerEvent): void =>
            {
                if(event.pointerId !== pointerId)
                    return;

                const radius =
                    Math.max(
                        0,
                        Math.min(
                            max,
                            startRadius +
                            (
                                event.clientY -
                                startY
                            ) /
                            2
                        )
                    );

                this.#state[corner] =
                    radius;

                this.Render(target);

                this.Change({
                    radius,
                    corner,
                    pointerId,
                });
            };

            const onUp =
                (event: PointerEvent): void =>
            {
                if(event.pointerId !== pointerId)
                    return;

                handle.removeEventListener('pointermove', onMove);
                handle.removeEventListener('pointerup', onUp);
                handle.removeEventListener('pointercancel', onUp);

                this.End({
                    radius: this.#state[corner],
                    corner,
                    pointerId,
                });

                pointerId = -1;
            };

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

                pointerId = event.pointerId;
                startY = event.clientY;
                startRadius = this.#state[corner];

                this.Start({
                    radius: startRadius,
                    corner,
                    pointerId,
                });

                try
                {
                    handle.setPointerCapture(pointerId);
                }
                catch
                {
                }

                handle.addEventListener('pointermove', onMove);
                handle.addEventListener('pointerup', onUp);
                handle.addEventListener('pointercancel', onUp);
            };

            handle.addEventListener('pointerdown', onDown);

            this.cleanups.push(
                () =>
                {
                    handle.removeEventListener('pointerdown', onDown);
                    handle.remove();
                }
            );
        }

        public setRadius(radius: number): this
        {
            if(this.target)
            {
                const max =
                    Number.parseFloat(
                        this.getAttribute('max') ?? '100'
                    ) || 100;

                const value =
                    Math.max(
                        0,
                        Math.min(max, radius)
                    );

                this.Start({
                    radius: this.#state['top-left'],
                    corner: 'all',
                    programmatic: true,
                });

                for(const corner of Object.keys(this.#state) as Corner[])
                    this.#state[corner] = value;

                this.Render(this.target);

                this.Change({
                    radius: value,
                    corner: 'all',
                    programmatic: true,
                });

                this.End({
                    radius: value,
                    corner: 'all',
                    programmatic: true,
                });
            }

            return this;
        }

        public getCorners(): Readonly<Record<Corner, number>>
        {
            return { ...this.#state };
        }
    }
}

export type RounderCorner = Rounder.Types.Corner;
export type RounderOptions = Rounder.Interfaces.RounderOptions;

export default Rounder.Rounder;

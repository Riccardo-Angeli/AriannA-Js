/**
 * @module components/modifiers/2D/Reflector
 */

import { Component, Templates } from '../../../core/index.ts';
import * as Base from './Base.ts';

export namespace Reflector
{
    export namespace Types
    {
        export type Axis = 'x' | 'y' | 'both';
    }

    export namespace Interfaces
    {
        export interface ReflectorOptions
        {
            axis?: Types.Axis;
            handleColor?: string;
            animate?: boolean;
            disabled?: boolean;
        }
    }

    const html = Templates.Template.Html;

    @Component('arianna-reflector', {}, {
        Shadow: false,
        Attributes: [
            'axis',
            'handle-color',
            'animate',
            'disabled',
        ],
    })
    export class Reflector
        extends Base.Modifier2D.Modifier2D
    {
        public template = html``;
        protected EventName = 'reflect';

        #state =
        {
            x: false,
            y: false,
        };

        protected applyTo(target: HTMLElement): void
        {
            if(getComputedStyle(target).position === 'static')
                target.style.position = 'relative';

            const axis =
                this.getAttribute('axis') ?? 'x';

            const color =
                this.getAttribute('handle-color') ??
                'var(--arianna-primary, #1f6feb)';

            if(this.getAttribute('animate') !== 'false')
                target.style.transition = 'transform 0.2s ease';

            const makeButton =
                (
                    label: string,
                    position: string
                ): HTMLButtonElement =>
            {
                const button =
                    document.createElement('button');

                button.type = 'button';
                button.textContent = label;
                button.className = 'ar-reflector-btn';

                button.style.cssText =
                    `position:absolute;${position}background:${color};color:#fff;border:none;border-radius:4px;width:22px;height:22px;cursor:pointer;font-size:10px;font-weight:700;z-index:9999;`;

                target.appendChild(button);

                return button;
            };

            if(axis === 'x' || axis === 'both')
            {
                const horizontal =
                    makeButton(
                        'H',
                        'right:-28px;top:50%;transform:translateY(-50%);'
                    );

                const onHorizontal =
                    (): void =>
                {
                    if(!this.isEnabled)
                        return;

                    this.Perform(
                        target,
                        'x'
                    );
                };

                horizontal.addEventListener(
                    'click',
                    onHorizontal
                );

                this.cleanups.push(
                    () =>
                    {
                        horizontal.removeEventListener(
                            'click',
                            onHorizontal
                        );

                        horizontal.remove();
                    }
                );
            }

            if(axis === 'y' || axis === 'both')
            {
                const vertical =
                    makeButton(
                        'V',
                        'top:-28px;left:50%;transform:translateX(-50%);'
                    );

                const onVertical =
                    (): void =>
                {
                    if(!this.isEnabled)
                        return;

                    this.Perform(
                        target,
                        'y'
                    );
                };

                vertical.addEventListener(
                    'click',
                    onVertical
                );

                this.cleanups.push(
                    () =>
                    {
                        vertical.removeEventListener(
                            'click',
                            onVertical
                        );

                        vertical.remove();
                    }
                );
            }
        }

        private Perform(
            target: HTMLElement,
            axis: 'x' | 'y',
            programmatic = false
        ): void
        {
            this.Start({
                x: this.#state.x,
                y: this.#state.y,
                axis,
                programmatic,
            });

            this.#state[axis] =
                !this.#state[axis];

            target.style.transform =
                `scale(${this.#state.x ? -1 : 1},${this.#state.y ? -1 : 1})`;

            const data =
            {
                x: this.#state.x,
                y: this.#state.y,
                axis,
                programmatic,
            };

            this.Change(data);
            this.End(data);
        }

        public flipX(): this
        {
            if(this.target)
                this.Perform(
                    this.target,
                    'x',
                    true
                );

            return this;
        }

        public flipY(): this
        {
            if(this.target)
                this.Perform(
                    this.target,
                    'y',
                    true
                );

            return this;
        }

        public reset(): this
        {
            if(this.target)
            {
                this.Start({
                    ...this.#state,
                    programmatic: true,
                });

                this.#state =
                {
                    x: false,
                    y: false,
                };

                this.target.style.transform = '';

                this.Change({
                    ...this.#state,
                    programmatic: true,
                });

                this.End({
                    ...this.#state,
                    programmatic: true,
                });
            }

            return this;
        }

        public getState(): { x: boolean; y: boolean }
        {
            return { ...this.#state };
        }
    }
}

export type ReflectorAxis = Reflector.Types.Axis;
export type ReflectorOptions = Reflector.Interfaces.ReflectorOptions;

export default Reflector.Reflector;

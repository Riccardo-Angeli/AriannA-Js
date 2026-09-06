/**
 * @module components/modifiers/2D/Base
 * @description Common reactive/event contract for every AriannA Modifier2D.
 */

import { Component, Reactivity, Templates } from '../../../core/index.ts';

export namespace Modifier2D
{
    export namespace Types
    {
        export type Phase = 'idle' | 'start' | 'change' | 'end';
    }

    export namespace Interfaces
    {
        export interface ModifierContext
        {
            target: HTMLElement | null;
            modifier: Modifier2D;
            active: boolean;
            phase: Types.Phase;
            data: Readonly<Record<string, unknown>>;
        }
    }

    const html = Templates.Template.Html;

    export function ResolveTargets(
        input:
            | string
            | HTMLElement
            | { render(): unknown }
            | Array<string | HTMLElement | { render(): unknown }>
    ): HTMLElement[]
    {
        const inputs = Array.isArray(input)
            ? input
            : [input];

        const result: HTMLElement[] = [];

        for(const candidate of inputs)
        {
            if(typeof candidate === 'string')
            {
                document
                    .querySelectorAll<HTMLElement>(candidate)
                    .forEach(element => result.push(element));
            }
            else if(candidate instanceof HTMLElement)
                result.push(candidate);
            else if(
                candidate &&
                typeof candidate === 'object' &&
                'render' in candidate &&
                typeof candidate.render === 'function'
            )
            {
                const element = candidate.render();

                if(element instanceof HTMLElement)
                    result.push(element);
            }
        }

        return result;
    }

    @Component('arianna-modifier-2d', {}, {
        Shadow: false,
        Attributes: ['enabled', 'disabled'],
    })
    export class Modifier2D extends HTMLElement
    {
        public template = html``;

        /** Currently attached cleanup callbacks. */
        protected cleanups: Array<() => void> = [];

        /** Element modified by this modifier. Defaults to parentElement. */
        public target: HTMLElement | null = null;

        /**
         * Reactive state common to ALL Modifier2D implementations.
         *
         * State.Get() can be read by Effects/Templates.
         * State updates at interaction start, every movement/change, and end.
         */
        public readonly State =
            new Reactivity.Signal<Interfaces.ModifierContext>({
                target: null,
                modifier: this,
                active: false,
                phase: 'idle',
                data: Object.freeze({}),
            });

        /** Event stem supplied by concrete modifiers: move, resize, rotate... */
        protected EventName = 'modifier';

        protected resolveTarget(): HTMLElement | null
        {
            return this.parentElement;
        }

        protected applyTo(_target: HTMLElement): void
        {
        }

        public enable(): this
        {
            this.removeAttribute('disabled');
            return this;
        }

        public disable(): this
        {
            this.setAttribute('disabled', '');
            return this;
        }

        public get isEnabled(): boolean
        {
            return !this.hasAttribute('disabled');
        }

        public get enabled(): boolean
        {
            return this.isEnabled;
        }

        public set enabled(value: boolean)
        {
            value
                ? this.removeAttribute('disabled')
                : this.setAttribute('disabled', '');
        }

        /** Current immutable reactive snapshot. */
        public get StateValue(): Interfaces.ModifierContext
        {
            return this.State.Get();
        }

        protected Start(data: Record<string, unknown> = {}): void
        {
            this.Publish('start', true, data);
        }

        protected Change(data: Record<string, unknown> = {}): void
        {
            this.Publish('change', true, data);
        }

        protected End(data: Record<string, unknown> = {}): void
        {
            this.Publish('end', false, data);
        }

        private Publish(
            phase: Exclude<Types.Phase, 'idle'>,
            active: boolean,
            data: Record<string, unknown>
        ): void
        {
            const frozen =
                Object.freeze({ ...data });

            const state: Interfaces.ModifierContext =
            {
                target: this.target,
                modifier: this,
                active,
                phase,
                data: frozen,
            };

            this.State.Set(state);

            const suffix =
                phase === 'start'
                    ? '-start'
                    : phase === 'end'
                        ? '-end'
                        : '';

            const event =
                new CustomEvent(
                    `arianna:${this.EventName}${suffix}`,
                    {
                        bubbles: true,
                        composed: true,
                        detail:
                        {
                            ...frozen,
                            target: this.target,
                            modifier: this,
                            state,
                        },
                    }
                );

            /*
             * Existing Modifier2D events historically originate from target.
             * Preserve that API and make them composed/bubbling.
             */
            (this.target ?? this).dispatchEvent(event);
        }

        public onMount(): void
        {
            this.style.display = 'contents';

            queueMicrotask(
                () =>
                {
                    this.target =
                        this.resolveTarget();

                    this.State.Set({
                        target: this.target,
                        modifier: this,
                        active: false,
                        phase: 'idle',
                        data: Object.freeze({}),
                    });

                    if(this.target)
                        this.applyTo(this.target);
                }
            );
        }

        public onUnmount(): void
        {
            for(const cleanup of this.cleanups)
            {
                try
                {
                    cleanup();
                }
                catch(error)
                {
                    console.warn(
                        '[Modifier2D] cleanup error',
                        error
                    );
                }
            }

            this.cleanups = [];
            this.target = null;

            this.State.Set({
                target: null,
                modifier: this,
                active: false,
                phase: 'idle',
                data: Object.freeze({}),
            });
        }
    }
}

export const ResolveTargets = Modifier2D.ResolveTargets;
export const Modifier2DClass = Modifier2D.Modifier2D;
export type ModifierPhase = Modifier2D.Types.Phase;
export type ModifierContext = Modifier2D.Interfaces.ModifierContext;

export default Modifier2D.Modifier2D;

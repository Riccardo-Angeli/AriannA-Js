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

        export type TargetLike =
            | string
            | HTMLElement
            | { render(): unknown }
            | { valueOf(): unknown };

        export type TargetInput =
            | TargetLike
            | TargetLike[];
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

    export function ResolveTargets(input: Types.TargetInput): HTMLElement[]
    {
        const inputs = Array.isArray(input) ? input : [input];
        const result: HTMLElement[] = [];

        for(const candidate of inputs)
        {
            if(typeof candidate === 'string')
            {
                if(typeof document !== 'undefined')
                    document.querySelectorAll<HTMLElement>(candidate).forEach(element => result.push(element));
                continue;
            }

            if(candidate instanceof HTMLElement)
            {
                result.push(candidate);
                continue;
            }

            if(!candidate || typeof candidate !== 'object')
                continue;

            let value: unknown = null;

            if('render' in candidate && typeof candidate.render === 'function')
                value = candidate.render();
            else if('valueOf' in candidate && typeof candidate.valueOf === 'function')
                value = candidate.valueOf();

            if(value instanceof HTMLElement)
                result.push(value);
        }

        return [...new Set(result)];
    }

    @Component('arianna-modifier-2d', {}, {
        Shadow: false,
        Attributes: ['enabled', 'disabled'],
    })
    export class Modifier2D extends HTMLElement
    {
        public template = html``;

        protected cleanups: Array<() => void> = [];

        /** First target, kept for compatibility with the original public surface. */
        public target: HTMLElement | null = null;

        /** Every target attached through the constructor / attach(). */
        public targets: HTMLElement[] = [];

        public readonly State =
            new Reactivity.Signal<Interfaces.ModifierContext>({
                target: null,
                modifier: this,
                active: false,
                phase: 'idle',
                data: Object.freeze({}),
            });

        protected EventName = 'modifier';

        protected resolveTarget(): HTMLElement | null
        {
            /*
             * Markup fold:
             *   <arianna-mover><div>...</div></arianna-mover>
             * modifies the wrapped child. If there is no wrapped child, keep the
             * historical sibling/parent fold and modify the parent.
             */
            const child = this.firstElementChild;
            if(child instanceof HTMLElement)
                return child;

            return this.parentElement;
        }

        /** Container used for parent-bounds math when the modifier is a display:contents wrapper. */
        protected containerFor(target: HTMLElement): HTMLElement | null
        {
            return target.parentElement === this
                ? this.parentElement
                : target.parentElement;
        }

        protected applyTo(_target: HTMLElement): void
        {
        }

        /** Attach this modifier to one or more DOM / Real targets. */
        public attach(input: Types.TargetInput): this
        {
            for(const target of ResolveTargets(input))
            {
                if(this.targets.includes(target))
                    continue;

                this.targets.push(target);
                this.target ??= target;
                this.applyTo(target);
            }

            this.State.Set({
                target: this.target,
                modifier: this,
                active: false,
                phase: 'idle',
                data: Object.freeze({}),
            });

            return this;
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
            value ? this.removeAttribute('disabled') : this.setAttribute('disabled', '');
        }

        public get StateValue(): Interfaces.ModifierContext
        {
            return this.State.Get();
        }

        protected Start(data: Record<string, unknown> = {}, target?: HTMLElement | null): void
        {
            this.Publish('start', true, data, target ?? this.target);
        }

        protected Change(data: Record<string, unknown> = {}, target?: HTMLElement | null): void
        {
            this.Publish('change', true, data, target ?? this.target);
        }

        protected End(data: Record<string, unknown> = {}, target?: HTMLElement | null): void
        {
            this.Publish('end', false, data, target ?? this.target);
        }

        private Publish(
            phase: Exclude<Types.Phase, 'idle'>,
            active: boolean,
            data: Record<string, unknown>,
            target: HTMLElement | null
        ): void
        {
            const frozen = Object.freeze({ ...data });
            const state: Interfaces.ModifierContext = {
                target,
                modifier: this,
                active,
                phase,
                data: frozen,
            };

            this.target = target ?? this.target;
            this.State.Set(state);

            const suffix = phase === 'start' ? '-start' : phase === 'end' ? '-end' : '';
            const event = new CustomEvent(
                `arianna:${this.EventName}${suffix}`,
                {
                    bubbles: true,
                    composed: true,
                    detail: {
                        ...frozen,
                        target,
                        modifier: this,
                        state,
                    },
                }
            );

            (target ?? this).dispatchEvent(event);
        }

        /** Remove handles and listeners without removing or reverting the modified target. */
        public destroy(): this
        {
            for(const cleanup of this.cleanups.splice(0))
            {
                try
                {
                    cleanup();
                }
                catch(error)
                {
                    console.warn('[Modifier2D] cleanup error', error);
                }
            }

            this.targets = [];
            this.target = null;

            this.State.Set({
                target: null,
                modifier: this,
                active: false,
                phase: 'idle',
                data: Object.freeze({}),
            });

            return this;
        }

        public onMount(): void
        {
            this.style.display = 'contents';

            queueMicrotask(() =>
            {
                if(this.targets.length)
                    return;

                const target = this.resolveTarget();
                if(target)
                    this.attach(target);
            });
        }

        public onUnmount(): void
        {
            this.destroy();
        }
    }
}

export const ResolveTargets = Modifier2D.ResolveTargets;
export const Modifier2DClass = Modifier2D.Modifier2D;
export type ModifierPhase = Modifier2D.Types.Phase;
export type ModifierTarget = Modifier2D.Types.TargetLike;
export type ModifierTargetInput = Modifier2D.Types.TargetInput;
export type ModifierContext = Modifier2D.Interfaces.ModifierContext;

export default Modifier2D.Modifier2D;

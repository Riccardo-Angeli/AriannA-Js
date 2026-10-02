/**
 * @module components/graphics/2D/modifiers/Base
 * @description Common reactive/event contract for every AriannA Modifier2D.
 */

import { Component, Css, Reactivity, Templates } from '../../../../core/index.ts';
import { WindowComponent } from '../../../layout/Window.ts';

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


    interface RuntimeState
    {
        cleanups: Array<() => void>;
        target: HTMLElement | null;
        targets: HTMLElement[];
        signal?: Reactivity.Signal<Interfaces.ModifierContext>;
    }

    const RuntimeStates = new WeakMap<HTMLElement, RuntimeState>();

    function Runtime(owner: HTMLElement): RuntimeState
    {
        let state = RuntimeStates.get(owner);
        if(!state)
        {
            state = { cleanups: [], target: null, targets: [] };
            RuntimeStates.set(owner, state);
        }
        return state;
    }

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


    export namespace Parameters
    {
        export type ControlKind = 'number' | 'range' | 'select' | 'checkbox' | 'color' | 'text' | 'button';

        export interface Option
        {
            label: string;
            value: string;
        }

        export interface Definition<T = unknown>
        {
            key: string;
            label: string;
            kind?: ControlKind;
            get?: () => T;
            set?: (value: T) => void;
            action?: () => void;
            min?: number;
            max?: number;
            step?: number;
            options?: Array<string | Option>;
            hint?: string;
        }

        export type ParameterWindow = WindowComponent.WindowComponent & {
            /** Per-window stylesheet requested by the public Parameters contract. */
            Style: Css.Stylesheet;
        };

        export interface Bag
        {
            Window: ParameterWindow;
            Refresh(): void;
            Theme: 'dark' | 'light';
            [key: string]: unknown;
        }
    }

    const ParameterBags = new WeakMap<HTMLElement, Parameters.Bag>();

    const ParameterWindowStyles = () => new Css.Stylesheet([
        new Css.Rule('.ModifierParametersWindow', {
            Height:'auto', MinHeight:'120px', Width:'258px', MinWidth:'238px',
            Background:'#202226', Color:'#e5e8ed', Border:'1px solid #44474e', BoxShadow:'0 12px 32px #0006',
            BorderRadius:'8px', Overflow:'hidden', ZIndex:'35',
        }),
        new Css.Rule('.ModifierParametersWindow.WindowComponent.Windows .WindowComponent-Titlebar', {
            Height:'32px', MinHeight:'32px', Padding:'0 8px', Background:'#2a2d32', Color:'#e5e8ed', BorderBottom:'1px solid #44474e',
        }),
        new Css.Rule('.ModifierParametersWindow.WindowComponent.Windows .WindowComponent-Title', {
            FontSize:'10px', FontWeight:'800', LetterSpacing:'.01em',
        }),
        new Css.Rule('.ModifierParametersWindow.WindowComponent.Windows .WindowComponent-Traffic, .ModifierParametersWindow.WindowComponent.Windows .WindowComponent-Chrome-Btn-Maximize, .ModifierParametersWindow.WindowComponent.Windows .WindowComponent-Chrome-Btn-Close', {
            Display:'none',
        }),
        new Css.Rule('.ModifierParametersWindow.WindowComponent.Windows .WindowComponent-Body', {
            Padding:'8px', Overflow:'auto', MinHeight:'0', Flex:'1 1 auto', Background:'#202226',
        }),
        new Css.Rule('.ModifierParametersWindow.WindowComponent.Windows .WindowComponent-Chrome', {
            Display:'flex', Gap:'0', Background:'transparent',
        }),
        new Css.Rule('.ModifierParametersWindow.WindowComponent.Windows .WindowComponent-Chrome-Btn-Minimize', {
            Background:'transparent',Color:'inherit',Border:'1px solid #555961',BorderRadius:'4px',Width:'24px',Height:'22px',Padding:'0',FontSize:'12px',
        }),
        new Css.Rule('.ModifierParametersWindow.WindowComponent.Windows', {Background:'#202226',Color:'#e5e8ed',Border:'1px solid #44474e',BorderRadius:'8px'}),
        new Css.Rule('.ModifierParametersWindow.WindowComponent.Windows .WindowComponent-Titlebar', {Background:'#2a2d32',Color:'#e5e8ed',BorderBottom:'1px solid #44474e'}),
        new Css.Rule('.ModifierParametersWindow.WindowComponent[minimized]', {MinWidth:'170px',MinHeight:'36px'}),
        new Css.Rule('.ModifierParametersWindow.WindowComponent.Windows[data-theme="light"]', {Background:'#f1f2f4',Color:'#30343a',BorderColor:'#bfc3c9'}),
        new Css.Rule('.ModifierParametersWindow.WindowComponent.Windows[data-theme="light"] .WindowComponent-Titlebar', {Background:'#e5e7eb',Color:'#30343a',BorderBottomColor:'#bfc3c9'}),
        new Css.Rule('.ModifierParametersWindow-Form', {
            Display:'grid', Gap:'6px',
        }),
        new Css.Rule('.ModifierParametersWindow-Row', {
            AlignItems:'center', Display:'grid', Gap:'8px',
            GridTemplateColumns:'86px minmax(0,1fr)',
        }),
        new Css.Rule('.ModifierParametersWindow-Label', {
            Color:'#9aa3ab', FontSize:'8px', FontWeight:'700',
        }),
        new Css.Rule('.ModifierParametersWindow-Control', {
            Appearance:'none', Background:'#171b1e', Border:'1px solid #3b4146',
            BorderRadius:'3px', BoxSizing:'border-box', Color:'#e7ebee',
            Font:'9px system-ui,sans-serif', Height:'26px', MinWidth:'0', Padding:'4px 6px', Width:'100%',
        }),
        new Css.Rule('.ModifierParametersWindow-Control[type="checkbox"]', {
            Height:'14px', JustifySelf:'start', Width:'14px',
        }),
        new Css.Rule('.ModifierParametersWindow-Control[type="color"]', {
            Padding:'2px',
        }),
        new Css.Rule('.ModifierParametersWindow-Action', {
            Appearance:'none', Background:'linear-gradient(180deg,#41474c,#2d3237)',
            Border:'1px solid #15181a', BorderRadius:'3px', Color:'#d3d9dd',
            Cursor:'pointer', Font:'700 9px/1 system-ui', Height:'26px', Padding:'0 8px', Width:'100%',
        }),
        new Css.Rule('.ModifierParametersWindow[data-theme="light"]', {
            Background:'#f0f2f4', BorderColor:'#b9bec3', Color:'#25292d',
        }),
        new Css.Rule('.ModifierParametersWindow.WindowComponent.Windows[data-theme="light"] .WindowComponent-Titlebar', {
            Background:'linear-gradient(180deg,#fff,#e1e4e7)', BorderBottom:'1px solid #b9bec3', Color:'#25292d',
        }),
        new Css.Rule('.ModifierParametersWindow.WindowComponent.Windows[data-theme="light"] .WindowComponent-Body', {
            Background:'#f4f5f6', Color:'#25292d',
        }),
        new Css.Rule('.ModifierParametersWindow[data-theme="light"] .ModifierParametersWindow-Label', {
            Color:'#626b72',
        }),
        new Css.Rule('.ModifierParametersWindow[data-theme="light"] .ModifierParametersWindow-Control', {
            Background:'#fff', BorderColor:'#c1c7cc', Color:'#30373d',
        }),
        new Css.Rule('.ModifierParametersWindow[data-theme="light"] .ModifierParametersWindow-Action', {
            Background:'linear-gradient(180deg,#fff,#e2e5e8)', BorderColor:'#bec4c9', Color:'#394149',
        }),
    ]);

    /**
     * Build the canonical Parameters object shared by every concrete Modifier2D.
     *
     * Public contract:
     *   modifier.Parameters.MyParameter = value;
     *   modifier.Parameters.Window.Style = new Css.Stylesheet(...);
     *   stage.append(modifier.Parameters.Window);
     *
     * The Window is deliberately lazy so AriannA's in-place custom-element upgrade
     * does not depend on constructor / field initialisers having executed.
     */
    const StyledWindows=new WeakSet<HTMLElement>();
    /** Reuse the modifier skin for independent 2D inspector windows. */
    export function StyleWindow(window:Parameters.ParameterWindow,theme:'dark'|'light'='dark'):Parameters.ParameterWindow
    {
        window.dataset.theme=theme;
        if(StyledWindows.has(window))return window;
        StyledWindows.add(window);
        window.classList.add('ModifierParametersWindow');
        window.setAttribute('variant', 'windows');
        window.setAttribute('resizable', 'true');
        window.setAttribute('min-width','238');
        window.setAttribute('min-height','120');
        window.dataset.theme = theme;
        window.addEventListener('click', event => {
            const target=event.target as Element|null;
            const button=target?.closest<HTMLButtonElement>('.WindowComponent-Chrome-Btn-Minimize');
            if(!button)return;
            event.preventDefault();event.stopImmediatePropagation();
            if(window.hasAttribute('minimized')) {
                window.restore();window.setAttribute('resizable','true');
                button.textContent='─';button.title='Minimize';button.setAttribute('aria-label','Minimize');
            } else {
                window.minimize();window.setAttribute('resizable','false');
                button.textContent='▣';button.title='Restore';button.setAttribute('aria-label','Restore');
            }
        },true);

        let windowStyle = ParameterWindowStyles();
        Object.defineProperty(window, 'Style', {
            enumerable: true,
            configurable: true,
            get: () => windowStyle,
            set: (value: Css.Stylesheet) => {
                if(value === windowStyle) return;
                windowStyle.Dispose();
                windowStyle = value;
            },
        });

        return window;
    }

    export function CreateParameters<T extends Record<string, unknown>>(
        owner: Modifier2D,
        title: string,
        definitions: Parameters.Definition[]
    ): T & Parameters.Bag
    {
        const existing = ParameterBags.get(owner);
        if(existing)
            return existing as T & Parameters.Bag;

        const window = new WindowComponent.WindowComponent() as Parameters.ParameterWindow;
        StyleWindow(window);
        window.setAttribute('title', `${title} Parameters`);

        const form = document.createElement('div');
        form.className = 'ModifierParametersWindow-Form';
        form.setAttribute('slot', 'body');
        window.appendChild(form);

        const controls = new Map<string, HTMLInputElement | HTMLSelectElement | HTMLButtonElement>();
        const bag = {} as T & Parameters.Bag;
        let theme: 'dark' | 'light' = 'dark';

        /*
         * Visual parameters are also declarative attributes.  Keeping the attribute
         * in sync before the concrete setter runs is important: setters commonly
         * call refreshAttachments(), whose applyTo()/syncAttributes() pass otherwise
         * reads the stale attribute and restores the previous glyph colour.
         */
        const parameterAttribute = (key:string):string =>
            key.replace(/([a-z0-9])([A-Z])/g,'$1-$2').toLowerCase();

        const assign = (definition:Parameters.Definition,value:unknown):void =>
        {
            if(definition.kind === 'color')
                owner.setAttribute(parameterAttribute(definition.key),String(value));
            definition.set?.(value as never);
        };

        const convert = (definition: Parameters.Definition, control: HTMLInputElement | HTMLSelectElement): unknown =>
        {
            if(definition.kind === 'checkbox' && control instanceof HTMLInputElement)
                return control.checked;
            if(definition.kind === 'number' || definition.kind === 'range')
            {
                if(control instanceof HTMLInputElement && Number.isFinite(control.valueAsNumber))
                    return control.valueAsNumber;
                return Number(control.value) || 0;
            }
            return control.value;
        };

        for(const definition of definitions)
        {
            const row = document.createElement('label');
            row.className = 'ModifierParametersWindow-Row';
            if(definition.hint) row.title = definition.hint;

            const label = document.createElement('span');
            label.className = 'ModifierParametersWindow-Label';
            label.textContent = definition.label;
            row.appendChild(label);

            if(definition.kind === 'button')
            {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'ModifierParametersWindow-Action';
                button.textContent = definition.label;
                label.textContent = '';
                button.onclick = () => {
                    definition.action?.();
                    bag.Refresh();
                };
                row.appendChild(button);
                form.appendChild(row);
                controls.set(definition.key, button);
                continue;
            }

            let control: HTMLInputElement | HTMLSelectElement;
            if(definition.kind === 'select')
            {
                const select = document.createElement('select');
                for(const option of definition.options ?? [])
                {
                    const normalized = typeof option === 'string' ? {label:option,value:option} : option;
                    const element = document.createElement('option');
                    element.value = normalized.value;
                    element.textContent = normalized.label;
                    select.appendChild(element);
                }
                control = select;
            }
            else
            {
                const input = document.createElement('input');
                input.type = definition.kind === 'checkbox' ? 'checkbox' :
                    definition.kind === 'color' ? 'color' :
                    definition.kind === 'range' ? 'range' :
                    definition.kind === 'text' ? 'text' : 'number';
                if(definition.min !== undefined) input.min = String(definition.min);
                if(definition.max !== undefined) input.max = String(definition.max);
                if(definition.step !== undefined) input.step = String(definition.step);
                control = input;
            }

            control.classList.add('ModifierParametersWindow-Control');
            const update = () => {
                assign(definition,convert(definition, control));
                bag.Refresh();
            };
            control.addEventListener('input', update);
            control.addEventListener('change', update);
            row.appendChild(control);
            form.appendChild(row);
            controls.set(definition.key, control);

            Object.defineProperty(bag, definition.key, {
                enumerable: true,
                configurable: false,
                get: () => definition.get?.(),
                set: (value: unknown) => {
                    assign(definition,value);
                    bag.Refresh();
                },
            });
        }

        Object.defineProperty(bag, 'Window', {
            enumerable: true,
            configurable: false,
            writable: false,
            value: window,
        });

        Object.defineProperty(bag, 'Theme', {
            enumerable: true,
            configurable: false,
            get: () => theme,
            set: (value: 'dark' | 'light') => {
                theme = value === 'light' ? 'light' : 'dark';
                window.dataset.theme = theme;
            },
        });

        bag.Refresh = () => {
            for(const definition of definitions)
            {
                const control = controls.get(definition.key);
                if(!control || control instanceof HTMLButtonElement || !definition.get)
                    continue;
                const value = definition.get();
                if(control instanceof HTMLInputElement && control.type === 'checkbox')
                    control.checked = Boolean(value);
                else
                    control.value = value == null ? '' : String(value);
            }
        };

        ParameterBags.set(owner, bag);
        bag.Refresh();
        return bag;
    }

    export function RefreshParameters(owner: HTMLElement): void
    {
        ParameterBags.get(owner)?.Refresh();
    }

    @Component('arianna-modifier-2d', {}, {
        Shadow: false,
        Attributes: ['enabled', 'disabled'],
    })
    export class Modifier2D extends HTMLElement
    {
        public static StyleWindow(window:Parameters.ParameterWindow,theme:'dark'|'light'='dark'):Parameters.ParameterWindow { return StyleWindow(window,theme); }

        public template = html``;

        /**
         * IMPORTANT: AriannA may upgrade existing markup in-place without running the
         * JavaScript constructor / class-field initialisers. Keep all base runtime
         * state lazy so markup-created modifiers behave exactly like `new Modifier()`.
         */
        protected get cleanups(): Array<() => void>
        {
            return Runtime(this).cleanups;
        }

        protected set cleanups(value: Array<() => void>)
        {
            Runtime(this).cleanups = value;
        }

        /** First target, kept for compatibility with the original public surface. */
        public get target(): HTMLElement | null
        {
            return Runtime(this).target;
        }

        public set target(value: HTMLElement | null)
        {
            Runtime(this).target = value;
        }

        /** Every target attached through the constructor / attach(). */
        public get targets(): HTMLElement[]
        {
            return Runtime(this).targets;
        }

        public set targets(value: HTMLElement[])
        {
            Runtime(this).targets = Array.isArray(value) ? value : [];
        }

        public get State(): Reactivity.Signal<Interfaces.ModifierContext>
        {
            const runtime = Runtime(this);
            runtime.signal ??= new Reactivity.Signal<Interfaces.ModifierContext>({
                target: runtime.target,
                modifier: this,
                active: false,
                phase: 'idle',
                data: Object.freeze({}),
            });
            return runtime.signal;
        }

        protected get EventName(): string { return 'modifier'; }

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


        /** Re-install modifier handles/listeners while preserving the current targets. */
        public refreshAttachments(): this
        {
            const current = [...this.targets];
            for(const cleanup of this.cleanups.splice(0))
            {
                try { cleanup(); } catch(error) { console.warn('[Modifier2D] cleanup error', error); }
            }
            this.targets = [];
            this.target = null;
            if(current.length)
                this.attach(current);
            RefreshParameters(this);
            return this;
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
            RefreshParameters(this);

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

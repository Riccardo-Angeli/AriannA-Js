/**
 * @module      core/Jsx
 * @description AriannA native JSX runtime, root renderer, automatic runtime exports and React-source converter.
 * @author      Riccardo Angeli
 * @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 * @license     MIT / Commercial (dual license)
 */
import { Services } from '../kernel/Services.ts';
import Real         from '../dom/Real.ts';
import Virtual      from './Virtual.ts';

import type { Types }      from '../definitions/Types.ts';
import type { Interfaces } from '../definitions/Interfaces.ts';

/** @name        Jsx
 *  @public
 *  @type        {namespace}
 *  @description Groups the Jsx contracts and runtime surface.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Jsx
{
    /** @name        Mode
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Mode.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Mode            = Types.Jsx.Mode;
    /** @name        Key
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Key.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Key             = Types.Jsx.Key;
    /** @name        Primitive
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Primitive.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Primitive       = Types.Jsx.Primitive;
    /** @name        ElementType
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ElementType.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ElementType     = Types.Jsx.ElementType;
    /** @name        Node
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Node.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Node            = Types.Jsx.Node;
    /** @name        Children
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Children.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Children                 = Types.Jsx.Children;
    /** @name        Props
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Props.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Props                    = Types.Jsx.Props;
    /** @name        Fragment
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Fragment.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Fragment                 = Interfaces.Jsx.Fragment;
    /** @name        Ref
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Ref.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Ref<T = unknown>         = Interfaces.Jsx.Ref<T>;
    /** @name        Component
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Component.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Component<P = Props>     = Interfaces.Jsx.Component<P>;
    /** @name        ComponentType
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ComponentType.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ComponentType<P = Props> = Interfaces.Jsx.ComponentType<P>;
    /** @name        RootContract
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for RootContract.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type RootContract             = Interfaces.Jsx.Root;
    /** @name        ConvertOptions
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ConvertOptions.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ConvertOptions           = Interfaces.Jsx.ConvertOptions;
    /** @name        ConvertResult
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ConvertResult.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ConvertResult            = Interfaces.Jsx.ConvertResult;
    /** @name        ServiceContract
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ServiceContract.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ServiceContract          = Interfaces.Jsx.Service;

    const FragmentType = Symbol.for('AriannA.JSX.Fragment');

    /** @class       Root
     *  @public
     *  @memberof    Jsx
     *  @description Owns one mounted JSX tree and supports render, update and deterministic unmount.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Root implements RootContract
    {
        readonly #container: Element;
        #nodes: globalThis.Node[] = [];
        #mounted = false;

        constructor(container: Element)
        {
            this.#container = container;
        }

        get Container(): Element
        {
            return this.#container;
        }

        get Mounted(): boolean
        {
            return this.#mounted;
        }

        Render(node: Children): this
        {
            this.Unmount();
            this.#nodes = Runtime.ToNodes(node);

            const fragment = Real.CreateFragment();

            for(const child of this.#nodes)
            {
                Real.Append(fragment, child);
            }

            Real.Append(this.#container, fragment);
            this.#mounted = true;

            return this;
        }

        Update(node: Children): this
        {
            return this.Render(node);
        }

        Unmount(): void
        {
            for(const node of this.#nodes)
            {
                Real.Remove(node);
            }

            this.#nodes = [];
            this.#mounted = false;
        }
    }

    /** @class       Runtime
     *  @public
     *  @memberof    Jsx
     *  @description Canonical AriannA JSX owner. It creates Real or Virtual nodes, components, fragments and roots.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Runtime
    {
        static #mode: Mode = 'real';

        static Mode(mode?: Mode): Mode
        {
            if(mode)
            {
                Runtime.#mode = mode;
            }

            return Runtime.#mode;
        }

        static Fragment(...children: Children[]): Fragment
        {
            return Object.freeze
            (
                {
                    __ariannaFragment : true,
                    Children          : Runtime.Flatten(children)
                }
            );
        }

        static H
        (
            type       : ElementType,
            props      : Props | null = null,
            ...children: Children[]
        ): Node
        {
            const merged = Runtime.Flatten
            (
                [props?.children, ...children]
            );

            if(type === FragmentType)
            {
                return Runtime.Fragment(...merged);
            }

            if(typeof type === 'function')
            {
                return Runtime.Component(type, { ...(props ?? {}), children: merged });
            }

            if(typeof type === 'symbol')
            {
                throw new TypeError('[arianna] Unknown JSX symbol type.');
            }

            return Runtime.#mode === 'virtual'
                ? Runtime.Virtual(type, props, merged)
                : Runtime.Real(type, props, merged);
        }

        static CreateRoot(container: Element | string): Root
        {
            const target =
                typeof container === 'string'
                    ? document.querySelector(container)
                    : container;

            if(!(target instanceof Element))
            {
                throw new TypeError('[arianna] JSX root container was not found.');
            }

            return new Root(target);
        }

        static Render(node: Children, container: Element | string): Root
        {
            return Runtime
                .CreateRoot(container)
                .Render(node);
        }

        static ToNodes(source: Children): globalThis.Node[]
        {
            const output: globalThis.Node[] = [];

            for(const child of Runtime.Flatten([source]))
            {
                if(child === null || child === undefined || child === false || child === true)
                {
                    continue;
                }

                if(child instanceof Real || child instanceof Virtual)
                {
                    output.push(child.render());
                    continue;
                }

                if(child instanceof globalThis.Node)
                {
                    output.push(child);
                    continue;
                }

                if(Runtime.IsFragment(child))
                {
                    output.push(...Runtime.ToNodes(child.Children));
                    continue;
                }

                output.push(Real.CreateText(String(child)));
            }

            return output;
        }

        static ConvertReact(source: string, options: ConvertOptions = {}): ConvertResult
        {
            const mode = options.Mode ?? 'real';
            const runtime = options.RuntimeImport ?? '@arianna/core/Jsx';
            const warnings: string[] = [];

            let converted =
                source
                    .replace
                    (
                        /React\.Fragment/g,
                        'Jsx.Fragment'
                    )
                    .replace
                    (
                        /React\.createElement/g,
                        'Jsx.Runtime.Jsx'
                    )
                    .replace
                    (
                        /createRoot\s*\(/g,
                        'Jsx.Runtime.CreateRoot('
                    )
                    .replace
                    (
                        /import\s+React(?:\s*,\s*\{[^}]*\})?\s+from\s+['"]react['"];?/g,
                        ''
                    )
                    .replace
                    (
                        /import\s+\{[^}]*\}\s+from\s+['"]react['"];?/g,
                        ''
                    );

            const unsupported =
                [
                    'useLayoutEffect',
                    'useImperativeHandle',
                    'useTransition',
                    'useDeferredValue',
                    'Suspense',
                    'React.lazy',
                    'createPortal'
                ];

            for(const token of unsupported)
            {
                if(source.includes(token))
                {
                    warnings.push(`Manual migration required for ${token}.`);
                }
            }

            if(!/\bimport\s+Jsx\s+from\b/.test(converted))
            {
                converted =
                    `import Jsx from '${runtime}';\n` +
                    converted.trimStart();
            }

            converted =
                `Jsx.Runtime.Mode('${mode}');\n` +
                converted;

            return {
                Source   : converted,
                Warnings : Object.freeze(warnings),
                Mode     : mode
            };
        }

        static Flatten(children: readonly unknown[]): Node[]
        {
            const output: Node[] = [];

            const visit = (value: unknown): void =>
            {
                if(Array.isArray(value))
                {
                    value.forEach(visit);
                    return;
                }

                if(Runtime.IsFragment(value))
                {
                    value.Children.forEach(visit);
                    return;
                }

                output.push(value as Node);
            };

            children.forEach(visit);

            return output;
        }

        static IsFragment(value: unknown): value is Fragment
        {
            return Boolean
            (
                value &&
                typeof value === 'object' &&
                (value as Partial<Fragment>).__ariannaFragment === true
            );
        }

        static Component<P extends Props>
        (
            component: ComponentType<P> | (new (props: P) => Component<P>),
            props    : P
        ): Node
        {
            const prototype = (component as { prototype?: object }).prototype;

            if(prototype && 'Render' in prototype)
            {
                const instance = new (component as new (props: P) => Component<P>)(props);
                const node = Runtime.First(instance.Render());
                queueMicrotask(() => instance.Mounted?.());
                return node;
            }

            return Runtime.First((component as ComponentType<P>)(props));
        }

        static First(children: Children): Node
        {
            const nodes = Runtime.Flatten([children]);

            if(nodes.length === 0)
            {
                return null;
            }

            if(nodes.length === 1)
            {
                return nodes[0];
            }

            return Runtime.Fragment(...nodes);
        }

        static Real(tag: string, props: Props | null, children: readonly Node[]): Real
        {
            const node = new Real(tag);
            Runtime.Apply(node, props);
            node.add(...Runtime.ToNodes(children));
            return node;
        }

        static Virtual(tag: string, props: Props | null, children: readonly Node[]): Virtual
        {
            const attributes: Record<string, string | number | boolean | null> = {};
            const events: Array<[string, EventListener]> = [];

            Runtime.Entries(props).forEach
            (
                ([name, value]) =>
                {
                    const event = Runtime.EventName(name);

                    if(event && typeof value === 'function')
                    {
                        events.push([event, value as EventListener]);
                    }
                    else if(!Runtime.Reserved(name))
                    {
                        attributes[name] = value as string | number | boolean | null;
                    }
                }
            );

            const normalized = children.map(Runtime.ToVirtualChild);
            const node = Virtual.Create(tag, attributes, ...normalized);
            events.forEach(([name, listener]) => node.on(name, listener));
            Runtime.AssignRef(props?.ref, node);
            return node;
        }


        static ToVirtualChild(child: Node): Virtual | string | number | boolean | null | undefined
        {
            if(child instanceof Virtual)
            {
                return child;
            }

            if(child instanceof Real)
            {
                return Virtual.Create(child.render());
            }

            if(child instanceof globalThis.Node)
            {
                return Virtual.Create(child);
            }

            if(Runtime.IsFragment(child))
            {
                const fragment = Real.CreateFragment();

                for(const node of Runtime.ToNodes(child.Children))
                {
                    Real.Append(fragment, node);
                }

                return Virtual.Create(fragment);
            }

            return child;
        }

        static Apply(node: Real, props: Props | null): void
        {
            for(const [name, value] of Runtime.Entries(props))
            {
                const event = Runtime.EventName(name);

                if(event && typeof value === 'function')
                {
                    node.on(event, value as EventListener);
                }
                else if(name === 'className')
                {
                    node.set('class', value);
                }
                else if(name === 'style' && value && typeof value === 'object')
                {
                    for(const [property, content] of Object.entries(value))
                    {
                        node.style(property, String(content));
                    }
                }
                else if(!Runtime.Reserved(name))
                {
                    node.set(name, value);
                }
            }

            Runtime.AssignRef(props?.ref, node);
        }

        static Entries(props: Props | null): [string, unknown][]
        {
            return Object.entries(props ?? {});
        }

        static Reserved(name: string): boolean
        {
            return name === 'children' || name === 'key' || name === 'ref';
        }

        static EventName(name: string): string | null
        {
            if(name.startsWith('$') && name.length > 1)
            {
                return name.slice(1).toLowerCase();
            }

            if(/^on[A-Z]/.test(name))
            {
                return name.slice(2).toLowerCase();
            }

            return null;
        }

        static AssignRef(ref: Ref | undefined, value: unknown): void
        {
            if(typeof ref === 'function')
            {
                ref(value);
            }
            else if(ref && typeof ref === 'object')
            {
                ref.Current = value;
            }
        }

        static Jsx
        (
            type  : ElementType,
            props : Props | null,
            key?  : Key
        ): Node
        {
            return Runtime.H
            (
                type,
                key === undefined
                    ? props
                    : {
                        ...(props ?? {}),
                        key
                    }
            );
        }

        static Jsxs
        (
            type  : ElementType,
            props : Props | null,
            key?  : Key
        ): Node
        {
            return Runtime.Jsx(type, props, key);
        }

        static JsxDEV
        (
            type  : ElementType,
            props : Props | null,
            key?  : Key
        ): Node
        {
            return Runtime.Jsx(type, props, key);
        }
    }

    const Service = new Services.Service<ServiceContract>
    (
        'jsx',
        {
            Mode(mode?: Mode): Mode
            {
                return Runtime.Mode(mode);
            },

            H(type: ElementType, props?: Props | null, ...children: Children[]): Node
            {
                return Runtime.H(type, props, ...children);
            },

            CreateRoot(container: Element | string): Root
            {
                return Runtime.CreateRoot(container);
            },

            Render(node: Children, container: Element | string): Root
            {
                return Runtime.Render(node, container);
            },

            ConvertReact(source: string, options?: ConvertOptions): ConvertResult
            {
                return Runtime.ConvertReact(source, options);
            }
        }
    );

    export const Fragment = FragmentType;
}

export default Jsx;

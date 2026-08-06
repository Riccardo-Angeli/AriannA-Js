/**
 * @module      core/Jsx
 * @description AriannA native JSX runtime, root renderer, automatic runtime exports and React-source converter.
 * @author      Riccardo Angeli
 * @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 * @license     MIT / Commercial (dual license)
 */

import { Services } from './Service.ts';
import Real         from './Real.ts';
import Virtual      from './Virtual.ts';

import type { Types as SchemaTypes }           from './schema/Types.ts';
import type { Interfaces as SchemaInterfaces } from './schema/Interfaces.ts';

export namespace Jsx
{
    export type Mode            = SchemaTypes.Jsx.Mode;
    export type Key             = SchemaTypes.Jsx.Key;
    export type Primitive       = SchemaTypes.Jsx.Primitive;
    export type ElementType     = SchemaTypes.Jsx.ElementType;
    export type Node            = SchemaTypes.Jsx.Node;
    export type Children        = SchemaTypes.Jsx.Children;
    export type Props           = SchemaTypes.Jsx.Props;
    export type Fragment        = SchemaInterfaces.Jsx.Fragment;
    export type Ref<T = unknown> = SchemaInterfaces.Jsx.Ref<T>;
    export type Component<P = Props> = SchemaInterfaces.Jsx.Component<P>;
    export type ComponentType<P = Props> = SchemaInterfaces.Jsx.ComponentType<P>;
    export type RootContract    = SchemaInterfaces.Jsx.Root;
    export type ConvertOptions  = SchemaInterfaces.Jsx.ConvertOptions;
    export type ConvertResult   = SchemaInterfaces.Jsx.ConvertResult;
    export type ServiceContract = SchemaInterfaces.Jsx.Service;

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

            const fragment = document.createDocumentFragment();

            for(const child of this.#nodes)
            {
                fragment.appendChild(child);
            }

            this.#container.appendChild(fragment);
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
                node.parentNode?.removeChild(node);
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

                output.push(document.createTextNode(String(child)));
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
                const fragment = document.createDocumentFragment();

                for(const node of Runtime.ToNodes(child.Children))
                {
                    fragment.appendChild(node);
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

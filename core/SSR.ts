/**
 * @module    core/SSR
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description Isomorphic SSR, streaming, islands and hydration for AriannA. SSR consumes Virtual-compatible
 *              nodes, State, Context, Workers and Router through structural contracts.
 */

import { Contexts } from './Context.ts';
import { Routers }  from './Router.ts';
import { Services } from './Service.ts';
import { States }   from './State.ts';

import type { Types as SchemaTypes }           from './schema/Types.ts';
import type { Interfaces as SchemaInterfaces } from './schema/Interfaces.ts';

/** @name        SSR
 *  @public
 *  @type        {namespace}
 *  @description Groups the SSR contracts and runtime surface.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace SSR
{
    /** @name        IslandMode
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for IslandMode.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type IslandMode       = SchemaTypes.SSR.IslandMode;
    /** @name        RenderOptions
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for RenderOptions.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type RenderOptions    = SchemaInterfaces.SSR.RenderOptions;
    /** @name        HydrateOptions
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for HydrateOptions.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type HydrateOptions   = SchemaInterfaces.SSR.HydrateOptions;
    /** @name        NodeContract
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for NodeContract.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type NodeContract     = SchemaInterfaces.SSR.Node;
    /** @name        WorkerBridge
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for WorkerBridge.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type WorkerBridge     = SchemaInterfaces.SSR.WorkerBridge;
    /** @name        Application
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Application.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Application      = SchemaInterfaces.SSR.Application;
    /** @name        RenderResult
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for RenderResult.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type RenderResult     = SchemaInterfaces.SSR.RenderResult;
    /** @name        ServiceContract
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ServiceContract.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ServiceContract  = SchemaInterfaces.SSR.Service;

    /** @class       Island
     *  @public
     *  @description Declarative selective-hydration island.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Island
    {
        readonly Mode: IslandMode;
        readonly Id: string;
        readonly Node: NodeContract;

        constructor
        (
            mode : IslandMode,
            id   : string,
            node : NodeContract
        )
        {
            this.Mode = mode;
            this.Id   = id;
            this.Node = node;
        }

        static Static
        (
            id   : string,
            node : NodeContract
        ): Island
        {
            return new Island('static', id, node);
        }

        static Interactive
        (
            id   : string,
            node : NodeContract
        ): Island
        {
            return new Island('interactive', id, node);
        }

        static Lazy
        (
            id   : string,
            node : NodeContract
        ): Island
        {
            return new Island('lazy', id, node);
        }
    }

    /** @class       Renderer
     *  @public
     *  @description Stateful fluent SSR renderer. One renderer can bind State, Context, Router and Workers before
     *               producing strings, streams, hydration payloads.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Renderer
    {
        static readonly #Void  = new Set
        (
            [
                'area',
                'base',
                'br',
                'col',
                'embed',
                'hr',
                'img',
                'input',
                'link',
                'meta',
                'param',
                'source',
                'track',
                'wbr'
            ]
        );

        static readonly #Boolean= new Set
        (
            [
                'allowfullscreen', 'async', 'autofocus', 'autoplay', 'checked',
                'controls', 'default', 'defer', 'disabled', 'formnovalidate',
                'hidden', 'ismap', 'loop', 'multiple', 'muted', 'nomodule',
                'novalidate', 'open', 'readonly', 'required', 'reversed', 'selected'
            ]
        );

        readonly #options: Required<RenderOptions>;
        #state: States.State<unknown> | null = null;
        #context: Contexts.Context<unknown> | null = null;
        #router: Routers.Router | null = null;
        #worker: WorkerBridge | null = null;

        constructor(options?: RenderOptions)
        {
            this.#options =
                {
                    Hydration : options?.Hydration ?? true,
                    Indent    : options?.Indent ?? 0,
                    Doctype   : options?.Doctype ?? false,
                    State     : options?.State ?? true,
                    Context   : options?.Context ?? true
                };
        }

        static Create(options?: RenderOptions): Renderer
        {
            return new Renderer(options);
        }

        /** @name        RenderToString
         *  @public
         *  @static
         *  @param       {NodeContract | Island} node Node or selective-hydration island.
         *  @param       {RenderOptions} [options] Renderer options.
         *  @returns     {string} Rendered HTML.
         *  @description Render a node directly to HTML through a short-lived Renderer. Use an instance when State,
         *               Context, Router, or Workers have already been attached to a configured renderer.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static RenderToString
        (
            node     : NodeContract | Island,
            options? : RenderOptions
        ): string
        {
            return Renderer
                .Create(options)
                .Render(node)
                .Html;
        }

        /** @name        HydrateRoot
         *  @public
         *  @static
         *  @param       {NodeContract} node Hydration definition.
         *  @param       {ParentNode} root Existing rendered root.
         *  @param       {HydrateOptions} [options] Hydration options.
         *  @returns     {void}
         *  @description Hydrate an existing rendered tree through a short-lived Renderer. The distinct name avoids
         *               colliding with the stateful instance `Hydrate()` method.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static HydrateRoot
        (
            node     : NodeContract,
            root     : ParentNode,
            options? : HydrateOptions
        ): void
        {
            Renderer
                .Create()
                .Hydrate(node, root, options);
        }

        State<T>(state: States.State<T>): this
        {
            this.#state = state as States.State<unknown>;

            return this;
        }

        Context<T>(context: Contexts.Context<T>): this
        {
            this.#context = context as Contexts.Context<unknown>;

            return this;
        }

        Router(router: Routers.Router): this
        {
            this.#router = router;

            return this;
        }

        Worker(worker: WorkerBridge): this
        {
            this.#worker = worker;

            return this;
        }

        async Resolve(url: string): Promise<this>
        {
            if(this.#router)
            {
                await this.#router.Resolve(url);
            }

            return this;
        }

        Render(node: NodeContract | Island): RenderResult
        {
            const html =
                this.#RenderNode(node, 0);

            const payload =
                this.#Payload();

            return {
                Html    : `${this.#options.Doctype ? '<!DOCTYPE html>' : ''}${html}${payload}`,
                State   : this.#state?.Serialize('json') ?? null,
                Context : this.#context?.Value ?? null
            };
        }

        async RenderAsync(node: NodeContract | Island): Promise<RenderResult>
        {
            if(this.#worker)
            {
                return this.#worker
                    .Task<RenderResult>('SSR.Render')
                    .With
                    (
                        {
                            Node    : Renderer.#Plain(node),
                            Options : this.#options,
                            State   : this.#state?.Serialize('json') ?? null,
                            Context : this.#context?.Value ?? null
                        }
                    )
                    .Run();
            }

            return this.Render(node);
        }

        async *Stream(node: NodeContract | Island): AsyncGenerator<string>
        {
            if(this.#options.Doctype)
            {
                yield '<!DOCTYPE html>';
            }

            yield* this.#StreamNode(node, 0);

            const payload =
                this.#Payload();

            if(payload)
            {
                yield payload;
            }
        }

        Hydrate
        (
            node    : NodeContract,
            root    : ParentNode,
            options : HydrateOptions = {}
        ): void
        {
            const selector =
                options.Selector ?? '[data-arianna-id]';

            const elements =
                Array.from(root.querySelectorAll<HTMLElement>(selector));

            const index =
                new Map
                (
                    elements.map
                    (
                        element =>
                            [element.dataset.ariannaId ?? '', element]
                    )
                );

            Renderer.#Walk
            (
                node,
                item =>
                {
                    const id =
                        item.Id ?? '';

                    if(!id)
                    {
                        return;
                    }

                    const element =
                        index.get(id);

                    if(element)
                    {
                        element.dataset.ariannaHydrated = 'true';
                    }
                }
            );

            if(options.State && this.#state)
            {
                this.#state.Deserialize(options.State, 'json');
            }
        }

        static EscapeHtml(value: string): string
        {
            return value
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        #RenderNode
        (
            source : NodeContract | Island,
            depth  : number
        ): string
        {
            if(source instanceof Island)
            {
                const content =
                    this.#RenderNode(source.Node, depth);

                return `<arianna-island data-island="${Renderer.EscapeHtml(source.Id)}" data-mode="${source.Mode}">${content}</arianna-island>`;
            }

            const node =
                Renderer.#Node(source);

            const pad =
                this.#options.Indent > 0
                    ? '\n' + ' '.repeat(this.#options.Indent * depth)
                    : '';

            const attributes =
                this.#Attributes(node.Attributes, node.Id);

            if(Renderer.#Void.has(node.Tag))
            {
                return `${pad}<${node.Tag}${attributes}>`;
            }

            const open =
                `${pad}<${node.Tag}${attributes}>`;

            const close =
                `${this.#options.Indent > 0 ? '\n' + ' '.repeat(this.#options.Indent * depth) : ''}</${node.Tag}>`;

            if(node.Html !== undefined)
            {
                return `${open}${node.Html}${close}`;
            }

            if(node.Text)
            {
                return `${open}${Renderer.EscapeHtml(node.Text)}${close}`;
            }

            const children =
                node.Children
                    .map(child => this.#RenderNode(child, depth + 1))
                    .join('');

            return `${open}${children}${close}`;
        }

        async *#StreamNode
        (
            source : NodeContract | Island,
            depth  : number
        ): AsyncGenerator<string>
        {
            if(source instanceof Island)
            {
                yield `<arianna-island data-island="${Renderer.EscapeHtml(source.Id)}" data-mode="${source.Mode}">`;
                yield* this.#StreamNode(source.Node, depth + 1);
                yield '</arianna-island>';

                return;
            }

            const node =
                Renderer.#Node(source);

            const pad =
                this.#options.Indent > 0
                    ? '\n' + ' '.repeat(this.#options.Indent * depth)
                    : '';

            yield `${pad}<${node.Tag}${this.#Attributes(node.Attributes, node.Id)}>`;

            if(Renderer.#Void.has(node.Tag))
            {
                return;
            }

            if(node.Html !== undefined)
            {
                yield node.Html;
            }
            else if(node.Text)
            {
                yield Renderer.EscapeHtml(node.Text);
            }
            else
            {
                for(const child of node.Children)
                {
                    yield* this.#StreamNode(child, depth + 1);
                }
            }

            yield `</${node.Tag}>`;
        }

        #Attributes
        (
            attributes : Record<string, unknown>,
            id?        : string
        ): string
        {
            const output: string[] = [];

            for(const [key, value] of Object.entries(attributes))
            {
                if(value === null || value === undefined || value === false)
                {
                    continue;
                }

                if(Renderer.#Boolean.has(key.toLowerCase()) && value === true)
                {
                    output.push(key);

                    continue;
                }

                output.push
                (
                    `${Renderer.EscapeHtml(key)}="${Renderer.EscapeHtml(String(value))}"`
                );
            }

            if(this.#options.Hydration && id)
            {
                output.push(`data-arianna-id="${Renderer.EscapeHtml(id)}"`);
            }

            return output.length > 0
                ? ` ${output.join(' ')}`
                : '';
        }

        #Payload(): string
        {
            const payload: Record<string, unknown> = {};

            if(this.#options.State && this.#state)
            {
                payload.State = JSON.parse(this.#state.Serialize('json'));
            }

            if(this.#options.Context && this.#context)
            {
                payload.Context = this.#context.Value;
            }

            if(Object.keys(payload).length === 0)
            {
                return '';
            }

            const json =
                JSON.stringify(payload)
                    .replace(/</g, '\\u003c');

            return `<script type="application/json" id="arianna-ssr">${json}</script>`;
        }

        static #Node(source: NodeContract): Required<Omit<NodeContract, 'Id' | 'Html'>> & Pick<NodeContract, 'Id' | 'Html'>
        {
            return {
                Tag        : source.Tag ?? 'div',
                Attributes : source.Attributes ?? {},
                Children   : source.Children ?? [],
                Text       : source.Text ?? '',
                Id         : source.Id,
                Html       : source.Html
            };
        }

        static #Plain(source: NodeContract | Island): unknown
        {
            if(source instanceof Island)
            {
                return {
                    Island : source.Id,
                    Mode   : source.Mode,
                    Node   : Renderer.#Plain(source.Node)
                };
            }

            return {
                Tag        : source.Tag,
                Attributes : source.Attributes,
                Children   : (source.Children ?? []).map(Renderer.#Plain),
                Text       : source.Text,
                Html       : source.Html,
                Id         : source.Id
            };
        }

        static #Walk
        (
            node  : NodeContract,
            visit : (node: NodeContract) => void
        ): void
        {
            visit(node);

            for(const child of node.Children ?? [])
            {
                Renderer.#Walk(child, visit);
            }
        }

    }

    /** @name        Service
     *  @private
     *  @constant
     *  @type        {Services.Service<ServiceContract>}
     *  @description Registers the canonical SSR service. Rendering, streaming, hydration, and escaping remain
     *               implemented by `Renderer`; the service exposes only the contract declared in Schema.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    const Service = new Services.Service<ServiceContract>
    (
        'ssr',
        {
            Create
            (
                options?: RenderOptions
            ): Renderer
            {
                return Renderer.Create(options);
            },

            RenderToString
            (
                node     : NodeContract | Island,
                options? : RenderOptions
            ): string
            {
                return Renderer.RenderToString
                (
                    node,
                    options
                );
            },

            Hydrate
            (
                node     : NodeContract,
                root     : ParentNode,
                options? : HydrateOptions
            ): void
            {
                Renderer.HydrateRoot
                (
                    node,
                    root,
                    options
                );
            },

            EscapeHtml
            (
                value: string
            ): string
            { return Renderer.EscapeHtml(value); }
        }
    );
}

export default SSR;

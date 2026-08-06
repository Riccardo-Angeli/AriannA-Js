/**
 * @module    core/Template
 * @author    Riccardo Angeli
 * @version   4.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description Compiled reactive templates for AriannA. Templates are immutable definitions; TemplateInstance
 *              owns mounted nodes and disposers. The compiler supports text interpolation, attribute/event
 *              bindings and structural directives.
 */

import { Core }       from './Core.ts';
import { Reactivity } from './Reactive.ts';

import type { Types as SchemaTypes }           from './schema/Types.ts';
import type { Interfaces as SchemaInterfaces } from './schema/Interfaces.ts';

/** @name        Templates
 *  @public
 *  @type        {namespace}
 *  @description Groups the Templates contracts and runtime surface.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Templates
{
    /** @name        Binding
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Binding.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Binding          = SchemaInterfaces.Template.Binding;
    /** @name        Options
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Options.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Options          = SchemaInterfaces.Template.Options;
    /** @name        Scope
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Scope.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Scope            = SchemaInterfaces.Template.Scope;
    /** @name        Mount
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Mount.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Mount            = SchemaInterfaces.Template.Mount;
    /** @name        ServiceContract
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ServiceContract.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ServiceContract  = SchemaInterfaces.Template.Service;

    /** @name        Template
     *  @public
     *  @type        {typeof Template}
     *  @description Runtime class responsible for the Template capability.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Template
    {
        static readonly #Cache = new Map<string, Template>();

        readonly #source: string;
        readonly #node: HTMLTemplateElement;
        readonly #bindings: readonly Binding[];

        constructor(source: string)
        {
            this.#source = source;
            this.#node   = document.createElement('template');
            this.#node.innerHTML = source;

            const bindings: Binding[] = [];
            Template.#Compile(this.#node.content, [], bindings);
            this.#bindings = bindings;
        }

        get Source(): string
        {
            return this.#source;
        }

        get Node(): HTMLTemplateElement
        {
            return this.#node;
        }

        get Bindings(): readonly Binding[]
        {
            return this.#bindings;
        }

        static Create(source: string): Template
        {
            const cached = Template.#Cache.get(source);

            if(cached)
            {
                return cached;
            }

            const template = new Template(source);
            Template.#Cache.set(source, template);

            return template;
        }

        Mount
        (
            host    : ParentNode,
            scope   : Scope,
            options : Options = {}
        ): Mount
        {
            const fragment =
                this.#node.content.cloneNode(true) as DocumentFragment;

            const disposers: Array<() => void> = [];

            for(const binding of this.#bindings)
            {
                const node = Template.#At(fragment, binding.Path);
                if(!node) continue;

                if(binding.Kind === 'event' && node instanceof Element && binding.Name)
                {
                    const evaluated = Template.#Evaluate(binding.Expression, scope);
                    const candidate = typeof evaluated === 'function' ? evaluated : scope[binding.Expression];
                    if(typeof candidate === 'function')
                    {
                        const listener = candidate.bind(options.Owner ?? scope) as EventListener;
                        node.addEventListener(binding.Name, listener);
                        disposers.push(() => node.removeEventListener(binding.Name!, listener));
                    }
                    continue;
                }

                const effect = new Reactivity.Effect
                (
                    () => Template.#Apply(node, binding, scope, options)
                );
                disposers.push(() => effect.Dispose());
            }

            const nodes =
                Array.from(fragment.childNodes);

            host.appendChild(fragment);

            return {
                Nodes   : nodes,
                Dispose :
                () =>
                {
                    for(const dispose of disposers)
                    {
                        dispose();
                    }

                    for(const node of nodes)
                    {
                        node.parentNode?.removeChild(node);
                    }
                }
            };
        }


        static #Compile
        (
            node : Node,
            path : number[],
            out  : Binding[]
        ): void
        {
            if(node.nodeType === Node.TEXT_NODE)
            {
                const source = node.textContent ?? '';

                if(/\{\{[\s\S]+?\}\}/.test(source))
                {
                    out.push
                    (
                        {
                            Kind       : 'text',
                            Path       : [...path],
                            Expression : source
                        }
                    );
                }

                return;
            }

            if(node instanceof Element)
            {
                for(const attribute of Array.from(node.attributes))
                {
                    if(attribute.name.startsWith(':'))
                    {
                        out.push
                        (
                            {
                                Kind       : 'attribute',
                                Path       : [...path],
                                Name       : attribute.name.slice(1),
                                Expression : attribute.value
                            }
                        );

                        node.removeAttribute(attribute.name);
                    }
                    else if(attribute.name.startsWith('@'))
                    {
                        out.push
                        (
                            {
                                Kind       : 'event',
                                Path       : [...path],
                                Name       : attribute.name.slice(1),
                                Expression : attribute.value
                            }
                        );

                        node.removeAttribute(attribute.name);
                    }
                    else if(attribute.name === 'a-if')
                    {
                        out.push
                        (
                            {
                                Kind       : 'if',
                                Path       : [...path],
                                Expression : attribute.value
                            }
                        );

                        node.removeAttribute(attribute.name);
                    }
                }
            }

            Array.from(node.childNodes).forEach
            (
                (child, index) =>
                    Template.#Compile(child, [...path, index], out)
            );
        }

        static #At
        (
            root : Node,
            path : readonly number[]
        ): Node | null
        {
            let node: Node | null = root;

            for(const index of path)
            {
                node = node?.childNodes[index] ?? null;
            }

            return node;
        }

        static #Apply
        (
            node    : Node,
            binding : Binding,
            scope   : Scope,
            options : Options
        ): void
        {
            const evaluate =
                Template.#Evaluate(binding.Expression, scope);

            switch(binding.Kind)
            {
                case 'text':
                {
                    node.textContent =
                        binding.Expression.replace
                        (
                            /\{\{\s*([\s\S]+?)\s*\}\}/g,
                            (_, expression: string) =>
                                String(Template.#Evaluate(expression, scope) ?? '')
                        );

                    break;
                }

                case 'attribute':
                {
                    if(!(node instanceof Element) || !binding.Name)
                    {
                        break;
                    }

                    if(evaluate === false || evaluate === null || evaluate === undefined)
                    {
                        node.removeAttribute(binding.Name);
                    }
                    else
                    {
                        node.setAttribute(binding.Name, String(evaluate));
                    }

                    break;
                }
                case 'event':
                {
                    /* Event bindings are installed once by Mount() and removed by its disposer. */
                    break;
                }


                case 'if':
                {
                    if(node instanceof HTMLElement)
                    {
                        node.hidden = !Boolean(evaluate);
                    }

                    break;
                }
            }
        }

        static #Evaluate
        (
            expression : string,
            scope      : Scope
        ): unknown
        {
            const path =
                expression.trim().split('.');

            let value: unknown = scope;

            for(const key of path)
            {
                if(value === null || value === undefined)
                {
                    return undefined;
                }

                value =
                    (value as Record<string, unknown>)[key];
            }

            return typeof value === 'function'
                ? (value as Function).call(scope)
                : value;
        }

        static Html
        (
            strings   : TemplateStringsArray,
            ...values : unknown[]
        ): Template
        {
            let source = '';

            strings.forEach
            (
                (part, index) =>
                {
                    source += part;

                    if(index < values.length)
                    {
                        source += String(values[index] ?? '');
                    }
                }
            );

            return Template.Create(source);
        }

        static Css
        (
            strings   : TemplateStringsArray,
            ...values : unknown[]
        ): Template
        {
            return Template.Html(strings, ...values);
        }
    }

    const Service = new Core.Services.Service<ServiceContract>
    (
        'template',
        {
            Compile(source: string): Template
            {
                return Template.Create(source);
            },

            Html
            (
                strings   : TemplateStringsArray,
                ...values : unknown[]
            ): Template
            {
                let source = '';

                strings.forEach
                (
                    (part, index) =>
                    {
                        source += part;

                        if(index < values.length)
                        {
                            source += String(values[index] ?? '');
                        }
                    }
                );

                return Template.Create(source);
            },

            Css
            (
                strings   : TemplateStringsArray,
                ...values : unknown[]
            ): Template
            {
                return Template.Css(strings, ...values);
            }
        }
    );
}

export default Templates;

/**
 * @module    core/Template
 * @author    Riccardo Angeli
 * @version   4.2.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA unified Template runtime with direct DOM primitives, compiled list sinks, keyed reconciliation and durability-ready reactive control flow. The `Templates` namespace exposes the public `Template`
 *              abstraction, the compiler-facing `CompiledInterface` contract and the `Compiled` execution
 *              class. Dynamic templates preserve the reflective runtime path, while compiler-generated
 *              templates use the compiled fast path through the same `Template` surface. All compiled
 *              helpers, caches, DOM operations and lifecycle logic are owned by `Compiled`; no operational
 *              compiler runtime code is scattered in the namespace.
 */
import type { Interfaces } from '../definitions/Interfaces.ts';

import { Reactive }   from '../reactivity/Reactive.ts';
import { Primitives } from './Primitives.ts';
import { Services }   from '../kernel/Services.ts';

type ReactionLike =
{
    Track(operation: () => void): void;
    Dispose(): void;
};

type ReactiveRuntimeLike =
{
    CreateEffect?: (operation: () => void, options?: unknown) => unknown;
    CreateReaction?: (invalidate: () => void, options?: unknown) => ReactionLike;
};

const RuntimeReactivity = (): ReactiveRuntimeLike =>
    (Services.Resolve<ReactiveRuntimeLike>('reactivity') ?? Reactive) as ReactiveRuntimeLike;

/** @name        Templates
 *  @public
 *  @type        {namespace}
 *  @description Groups the AriannA dynamic and compiler-generated Template contracts and runtime surface.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Templates
{
    /** @name        Binding
     *  @public
     *  @type        {type alias}
     *  @description Canonical Template binding contract imported from Schema.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Binding = Interfaces.Template.Binding;

    /** @name        Options
     *  @public
     *  @type        {type alias}
     *  @description Canonical Template mount options imported from Schema.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Options = Interfaces.Template.Options;

    /** @name        Scope
     *  @public
     *  @type        {type alias}
     *  @description Canonical Template evaluation scope imported from Schema.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Scope = Interfaces.Template.Scope;

    /** @name        Mount
     *  @public
     *  @type        {type alias}
     *  @description Canonical Template mount result imported from Schema.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Mount = Interfaces.Template.Mount;

    /** @name        ServiceContract
     *  @public
     *  @type        {type alias}
     *  @description Canonical Template service contract imported from Schema.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ServiceContract = Interfaces.Template.Service;

    /** @name        CompiledExpression
     *  @private
     *  @type        {type alias}
     *  @description Compiler-generated expression function evaluated against an owner and lexical Scope.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    type CompiledExpression = (context: unknown, scope: Scope) => unknown;

    /** @name        CompiledBase
     *  @private
     *  @type        {interface}
     *  @description Shared path contract implemented by every compiled operation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    interface CompiledBase
    {
        p: number[];

        /** Optional compiler-emitted static dependency keys for direct sinks.
         *  When present, a row property mutation patches only the sinks that
         *  declared that key. Absence preserves the conservative all-sink path. */
        d?: readonly PropertyKey[];
    }

    /** @name        CompiledText
     *  @private
     *  @type        {interface}
     *  @description Compiled text-node patch operation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    interface CompiledText extends CompiledBase
    {
        k: 'text';
        e: CompiledExpression;
    }

    /** @name        CompiledAttribute
     *  @private
     *  @type        {interface}
     *  @description Compiled attribute/property patch operation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    interface CompiledAttribute extends CompiledBase
    {
        k: 'attr';
        n: string;
        e: CompiledExpression;
    }

    /** @name        CompiledHtml
     *  @private
     *  @type        {interface}
     *  @description Compiled inner-HTML patch operation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    interface CompiledHtml extends CompiledBase
    {
        k: 'html';
        e: CompiledExpression;
    }

    /** @name        CompiledEvent
     *  @private
     *  @type        {interface}
     *  @description Compiled DOM event binding operation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    interface CompiledEvent extends CompiledBase
    {
        k: 'event';
        n: string;
        e: CompiledExpression;
    }

    /** @name        CompiledIf
     *  @private
     *  @type        {interface}
     *  @description Compiled conditional block operation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    interface CompiledIf extends CompiledBase
    {
        k: 'if';
        e: CompiledExpression;
        c: CompiledInterface;
    }

    /** @name        CompiledFor
     *  @private
     *  @type        {interface}
     *  @description Compiled keyed or positional iteration block operation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    interface CompiledFor extends CompiledBase
    {
        k: 'for';
        e: CompiledExpression;
        item: string;
        index?: string;
        key?: CompiledExpression;
        c: CompiledInterface;
    }

    /** @name        CompiledOperation
     *  @private
     *  @type        {type alias}
     *  @description Union of every executable compiler operation understood by Compiled.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    type CompiledOperation =
        CompiledText |
        CompiledAttribute |
        CompiledHtml |
        CompiledEvent |
        CompiledIf |
        CompiledFor;

    /** @name        CompiledInterface
     *  @public
     *  @type        {interface}
     *  @description Compiler/runtime boundary produced by Generator and consumed by Template/Compiled.
     *               The HTML string is immutable structural source; Ops are pre-analysed executable patches;
     *               Static marks definitions that require no runtime binding work.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export interface CompiledInterface
    {
        html: string;
        ops?: CompiledOperation[];
        /** Compact event-type metadata retained even when row ops are compiled away. */
        delegated?: readonly string[];
        static?: boolean;
        /** Compiler proves that this definition materialises exactly one top-level Element. */
        singleRoot?: boolean;

        /** Compiler-generated execution plan consumed directly by the runtime. */
        plan?:
        {
            patches: readonly number[];
            events: readonly number[];
        };

        /** Compiler-generated allocation-neutral target resolver. */
        resolve?: (root: ParentNode, out: Array<Node | null>) => void;

        /** Compiler-generated direct delegated-event wiring. */
        wire?: (
            root: ParentNode,
            context: unknown,
            scope: Scope,
            register: (target: Element, type: string, context: unknown, scope: Scope, expression: CompiledExpression) => void
        ) => void;

        /** Compiler-generated direct flat-row closure binder. */
        bind?: (
            root: ParentNode,
            context: unknown,
            scope: Scope,
            primitives: typeof Primitives
        ) => ((key?: PropertyKey) => void) | null;


        /** Compiler-generated single-root row materializer. */
        row?: (
            source: Node,
            context: unknown,
            scope: Scope,
            value: unknown,
            index: number,
            primitives: typeof Primitives,
            register: (target: Element, type: string, context: unknown, scope: Scope, expression: CompiledExpression) => void
        ) => CompiledListRecord;
    }

    /** @name        StopLike
     *  @private
     *  @type        {type alias}
     *  @description Normalised disposable shapes accepted by Compiled.Stop.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    type StopLike =
        { Stop?(): void; Dispose?(): void } |
        (() => void) |
        void;


    /** @name        CompiledListRecord
     *  @private
     *  @type        {interface}
     *  @description Lightweight record used by the compiler-generated `a-for` fast path. Unlike a nested
     *               Compiled instance it owns only stable top-level nodes, direct operation targets and one
     *               mutable lexical Scope. No per-row Effect, refresher closure or disposer array is allocated.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    interface CompiledListRecord
    {
        /** Single-root compiled rows store the node directly; multi-root rows use an array. */
        Nodes    : Node | Node[];
        Targets  : Array<Node | null> | null;
        Scope    : Scope;
        Value    : unknown;
        Index    : number;
        Key?     : unknown;
        DirectInvalidate : ((key?: PropertyKey) => void) | null;
    }

    /** @name        DelegatedEvent
     *  @private
     *  @type        {interface}
     *  @description Event metadata stored weakly on compiled list targets so one listener per event type can
     *               serve the complete list without allocating one native listener closure per row.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    interface DelegatedEvent
    {
        Type       : string;
        Context    : unknown;
        Scope      : Scope;
        Expression : CompiledExpression;
    }

    /** Precompiled flat-row sink descriptor shared by every row of one compiled list. */
    interface CompiledListPatch
    {
        Target       : number;
        Kind         : 'text' | 'attr' | 'html';
        Name?        : string;
        Evaluate     : CompiledExpression;
        Dependencies : readonly PropertyKey[] | null;
    }

    /** Cached execution plan / row factory metadata for one compiler-generated list row. */
    interface CompiledListRuntime
    {
        Template       : HTMLTemplateElement;
        /** Hoisted source root for allocation-minimal single-root clone. */
        Root           : Node | null;
        PatchOps       : readonly number[];
        EventOps       : readonly number[];
        Patches        : CompiledListPatch[];
        GenericPatches : number[];
        KeyedPatches   : Map<PropertyKey, number[]>;
    }

    /** @class       Compiled
     *  @public
     *  @description Runtime instance for one mounted compiler-generated Template definition. Owns the shared
     *               parsed-template cache, all compiled DOM helpers, binding execution, keyed reconciliation,
     *               effect disposal and node disposal. Every helper is available both statically and through
     *               an instance convenience method; instance variants delegate to the canonical static method.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Compiled
    {
        /** @name        #Nodes
         *  @private
         *  @static
         *  @type        {WeakMap<object, HTMLTemplateElement>}
         *  @description One parsed HTMLTemplateElement for each compiler-generated interface identity.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static readonly #Nodes = new WeakMap<object, HTMLTemplateElement>();

        /** @name        #ListNodes
         *  @private
         *  @static
         *  @readonly
         *  @type        {WeakMap<object, HTMLTemplateElement>}
         *  @description Row-template cache with compiler text markers replaced by native Text nodes once.
         *               Every list record clones this already-normalised structure, avoiding per-row marker
         *               insertion and text-node allocation through document.createTextNode.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static readonly #ListNodes =
            new WeakMap<object, HTMLTemplateElement>();

        /** Delegated metadata is attached to AriannA-owned DOM nodes.
         *  This removes one WeakMap entry/get/set per event target. */
        static readonly #Delegated =
            Symbol('arianna.template.delegated');

        /** One compact list runtime plan per compiled child interface. */
        static readonly #ListRuntimes =
            new WeakMap<object, CompiledListRuntime>();

        /** @name        #DelegateRoots
         *  @private
         *  @static
         *  @readonly
         *  @type        {WeakMap<EventTarget, Map<string, EventListener>>}
         *  @description One delegated native listener per mounted list parent and event type.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static readonly #DelegateRoots =
            new WeakMap<EventTarget, Map<string, EventListener>>();

                /** @name        Interface
         *  @public
         *  @readonly
         *  @type        {CompiledInterface}
         *  @description Compiler-generated interface mounted by this instance.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly Interface: CompiledInterface;

        /** @name        Context
         *  @public
         *  @readonly
         *  @type        {unknown}
         *  @description Component or owner context used by generated expressions and event handlers.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly Context: unknown;

        /** @name        Scope
         *  @public
         *  @readonly
         *  @type        {Scope}
         *  @description Lexical evaluation Scope for this compiled instance.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly Scope: Scope;

        /** @name        Reactive
         *  @public
         *  @readonly
         *  @type        {boolean}
         *  @description Whether this instance owns reactive effects and removable event listeners.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly Reactive: boolean;

        /** @name        Fragment
         *  @public
         *  @readonly
         *  @type        {DocumentFragment}
         *  @description Cloned DOM fragment ready to be inserted into its host.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly Fragment: DocumentFragment;

        /** @name        Nodes
         *  @public
         *  @readonly
         *  @type        {Node[]}
         *  @description Stable top-level node references owned by this compiled instance.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly Nodes: Node[];

        /** @name        #disposers
         *  @private
         *  @readonly
         *  @type        {Array<() => void>}
         *  @description Effect, listener and child-block cleanup callbacks owned by this instance.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly #disposers: Array<() => void> = [];

        /** @name        #refreshers
         *  @private
         *  @readonly
         *  @type        {Array<() => void>}
         *  @description Direct compiled patch operations reused by non-reactive child blocks during reconciliation.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly #refreshers: Array<() => void> = [];

        /** @name        constructor
         *  @public
         *  @param       {CompiledInterface} compiled Compiler-generated Template interface.
         *  @param       {unknown} context Owner context.
         *  @param       {Scope} scope Lexical evaluation scope.
         *  @param       {boolean} [reactive] Enable reactive subscriptions and explicit listener cleanup.
         *  @description Clone one compiled definition and bind all pre-generated operations.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor
        (
            compiled : CompiledInterface,
            context  : unknown,
            scope    : Scope,
            reactive : boolean = true
        )
        {
            this.Interface = compiled;
            this.Context   = context;
            this.Scope     = scope;
            this.Reactive  = reactive;
            this.Fragment  = Compiled.Node(compiled).content.cloneNode(true) as DocumentFragment;
            this.Nodes     = Array.from(this.Fragment.childNodes);

            this.Bind();
        }

        /** @name        Stop
         *  @public
         *  @static
         *  @param       {StopLike} value Disposable value.
         *  @returns     {void}
         *  @description Canonically dispose an Effect-like, function-like or Disposable-like value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Stop(value: StopLike): void
        {
            if(typeof value === 'function')
            {
                value();
            }
            else if(value && typeof value.Stop === 'function')
            {
                value.Stop();
            }
            else if(value && typeof value.Dispose === 'function')
            {
                value.Dispose();
            }
        }

        /** @name        Stop
         *  @public
         *  @param       {StopLike} value Disposable value.
         *  @returns     {void}
         *  @description Instance convenience over Compiled.Stop.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Stop(value: StopLike): void
        {
            Compiled.Stop(value);
        }

        /** @name        Effect
         *  @public
         *  @static
         *  @param       {() => void} operation Reactive operation.
         *  @returns     {() => void} Canonical disposer.
         *  @description Create one AriannA Effect and normalise its disposal surface.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Effect(operation: () => void): () => void
        {
            const effect = (RuntimeReactivity().CreateEffect?.(operation) ?? Reactive.CreateEffect(operation)) as unknown as StopLike;

            return () => Compiled.Stop(effect);
        }

        /** @name        Effect
         *  @public
         *  @param       {() => void} operation Reactive operation.
         *  @returns     {() => void} Canonical disposer.
         *  @description Instance convenience over Compiled.Effect.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Effect(operation: () => void): () => void
        {
            return Compiled.Effect(operation);
        }

        /** @name        At
         *  @public
         *  @static
         *  @param       {Node} root Root node.
         *  @param       {readonly number[]} path Child-node path.
         *  @returns     {Node | null} Node at path or null.
         *  @description Resolve a compiler-generated child-node path without selector parsing.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static At
        (
            root : Node,
            path : readonly number[]
        ): Node | null
        {
            if(path.length === 0) return root;

            const a = root.childNodes[path[0]] ?? null;
            if(path.length === 1 || !a) return a;

            const b = a.childNodes[path[1]] ?? null;
            if(path.length === 2 || !b) return b;

            const c = b.childNodes[path[2]] ?? null;
            if(path.length === 3 || !c) return c;

            const d = c.childNodes[path[3]] ?? null;
            if(path.length === 4 || !d) return d;

            let node: Node | null = d;

            for(let depth = 4; depth < path.length; depth++)
            {
                node = node?.childNodes[path[depth]] ?? null;
            }

            return node;
        }

        /** @name        At
         *  @public
         *  @param       {Node} root Root node.
         *  @param       {readonly number[]} path Child-node path.
         *  @returns     {Node | null} Node at path or null.
         *  @description Instance convenience over Compiled.At.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        At
        (
            root : Node,
            path : readonly number[]
        ): Node | null
        {
            return Compiled.At(root, path);
        }

        /** @name        Set
         *  @public
         *  @static
         *  @param       {Element} element Target element.
         *  @param       {string} name Attribute/property name.
         *  @param       {unknown} value New value.
         *  @returns     {void}
         *  @description Apply the compiled attribute/property fast path.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Set
        (
            element : Element,
            name    : string,
            value   : unknown
        ): void
        {
            if(name === 'class')
            {
                (element as HTMLElement).className = value == null ? '' : String(value);

                return;
            }

            if(name === 'style' && typeof value === 'string')
            {
                Primitives.CssText(element as HTMLElement, value);

                return;
            }

            if
            (
                name in element &&
                (name === 'checked' || name === 'disabled' || name === 'value' || name === 'selected')
            )
            {
                (element as unknown as Record<string, unknown>)[name] = value;

                if(typeof value === 'boolean')
                {
                    value
                        ? Primitives.Attribute(element, name, '')
                        : Primitives.Attribute(element, name, null);
                }

                return;
            }

            if(value === false || value === null || value === undefined)
            {
                Primitives.Attribute(element, name, null);
            }
            else if(value === true)
            {
                Primitives.Attribute(element, name, '');
            }
            else
            {
                Primitives.Attribute(element, name, String(value));
            }
        }

        /** @name        Set
         *  @public
         *  @param       {Element} element Target element.
         *  @param       {string} name Attribute/property name.
         *  @param       {unknown} value New value.
         *  @returns     {void}
         *  @description Instance convenience over Compiled.Set.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Set
        (
            element : Element,
            name    : string,
            value   : unknown
        ): void
        {
            Compiled.Set(element, name, value);
        }

        /** @name        ChildScope
         *  @public
         *  @static
         *  @param       {Scope} parent Parent scope.
         *  @param       {string} item Item alias.
         *  @param       {unknown} value Item value.
         *  @param       {string | undefined} indexName Optional index alias.
         *  @param       {number} index Current position.
         *  @returns     {Scope} Child lexical scope.
         *  @description Create the lightweight prototype-linked scope used by compiled iteration blocks.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static ChildScope
        (
            parent    : Scope,
            item      : string,
            value     : unknown,
            indexName : string | undefined,
            index     : number
        ): Scope
        {
            const scope = Object.create(parent || null) as Scope;
            const record = scope as Record<string, unknown>;

            record[item] = value;

            if(indexName)
            {
                record[indexName] = index;
            }

            record.$index = index;

            return scope;
        }

        /** @name        ChildScope
         *  @public
         *  @param       {Scope} parent Parent scope.
         *  @param       {string} item Item alias.
         *  @param       {unknown} value Item value.
         *  @param       {string | undefined} indexName Optional index alias.
         *  @param       {number} index Current position.
         *  @returns     {Scope} Child lexical scope.
         *  @description Instance convenience over Compiled.ChildScope.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        ChildScope
        (
            parent    : Scope,
            item      : string,
            value     : unknown,
            indexName : string | undefined,
            index     : number
        ): Scope
        {
            return Compiled.ChildScope(parent, item, value, indexName, index);
        }

        /** @name        Node
         *  @public
         *  @static
         *  @param       {CompiledInterface} compiled Compiler-generated interface.
         *  @returns     {HTMLTemplateElement} Shared parsed template node.
         *  @description Retrieve or parse the structural template exactly once per interface identity.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Node(compiled: CompiledInterface): HTMLTemplateElement
        {
            let node = Compiled.#Nodes.get(compiled as object);

            if(node)
            {
                return node;
            }

            node = Primitives.CreateTemplate();
            Primitives.Html(node, compiled.html);

            Compiled.#Nodes.set(compiled as object, node);

            return node;
        }

        /** @name        Node
         *  @public
         *  @param       {CompiledInterface} compiled Compiler-generated interface.
         *  @returns     {HTMLTemplateElement} Shared parsed template node.
         *  @description Instance convenience over Compiled.Node.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Node(compiled?: CompiledInterface): HTMLTemplateElement
        {
            return Compiled.Node(compiled ?? this.Interface);
        }


        /** @name        ListNode
         *  @private
         *  @static
         *  @param       {CompiledInterface} compiled Child row interface.
         *  @returns     {HTMLTemplateElement} Shared row template with direct Text targets.
         *  @description Normalise compiler text markers once per row-interface identity. Replacing the comment
         *               marker preserves child-node indices, so compiler paths remain valid after cloning.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private static ListNode(compiled: CompiledInterface): HTMLTemplateElement
        {
            let template = Compiled.#ListNodes.get(compiled as object);

            if(template)
            {
                return template;
            }

            template =
                Compiled.Node(compiled).cloneNode(true) as HTMLTemplateElement;

            for(const operation of compiled.ops ?? [])
            {
                if(operation.k !== 'text')
                {
                    continue;
                }

                const node =
                    Compiled.At(template.content, operation.p);

                if(node?.nodeType === globalThis.Node.COMMENT_NODE)
                {
                    Primitives.Replace
                    (
                        node,
                        Primitives.CreateText('')
                    );
                }
            }

            Compiled.#ListNodes.set(compiled as object, template);

            return template;
        }

        /** Resolve invariant flat-row runtime work once per compiled interface. */
        private static ListRuntime(compiled: CompiledInterface): CompiledListRuntime
        {
            let runtime =
                Compiled.#ListRuntimes.get(compiled as object);

            if(runtime)
            {
                return runtime;
            }

            const patchOps = compiled.plan?.patches ?? [];
            const eventOps = compiled.plan?.events ?? [];

            const patches: CompiledListPatch[] = [];
            const genericPatches: number[] = [];
            const keyedPatches = new Map<PropertyKey, number[]>();

            /*
             * Compiler-owned sink plan.
             *
             * A generated binder already contains target addressing, evaluation,
             * dependency routing and DOM writes. Building the generic descriptor
             * plan in that case duplicated compiler work at runtime and kept ops
             * interpretation on cold mount. Preserve the descriptor plan only for
             * legacy/dynamic compiled interfaces that do not expose bind().
             */
            if(!compiled.bind)
            {
                for(let targetIndex = 0; targetIndex < patchOps.length; targetIndex++)
                {
                    const operation = compiled.ops?.[patchOps[targetIndex]];

                    if(!operation) continue;

                    if(operation.k !== 'text' && operation.k !== 'attr' && operation.k !== 'html')
                    {
                        continue;
                    }

                    const patchIndex = patches.length;
                    const dependencies = operation.d && operation.d.length
                        ? operation.d
                        : null;

                    patches.push
                    ({
                        Target       : targetIndex,
                        Kind         : operation.k,
                        Name         : operation.k === 'attr' ? operation.n : undefined,
                        Evaluate     : operation.e,
                        Dependencies : dependencies
                    });

                    if(!dependencies)
                    {
                        genericPatches.push(patchIndex);
                        continue;
                    }

                    for(let dependencyIndex = 0; dependencyIndex < dependencies.length; dependencyIndex++)
                    {
                        const key = dependencies[dependencyIndex];
                        let indexes = keyedPatches.get(key);

                        if(!indexes)
                        {
                            indexes = [];
                            keyedPatches.set(key, indexes);
                        }

                        indexes.push(patchIndex);
                    }
                }
            }

            const template = Compiled.ListNode(compiled);

            runtime =
            {
                Template       : template,
                Root           : compiled.singleRoot ? template.content.firstChild : null,
                PatchOps       : patchOps,
                EventOps       : eventOps,
                Patches        : patches,
                GenericPatches : genericPatches,
                KeyedPatches   : keyedPatches
            };

            Compiled.#ListRuntimes.set(compiled as object, runtime);

            return runtime;
        }

        /** @name        IsSimpleList
         *  @private
         *  @static
         *  @param       {CompiledInterface} compiled Child row interface.
         *  @returns     {boolean} True when the row can use the allocation-minimal list record.
         *  @description Structural child blocks fall back to nested Compiled instances; flat text, attribute,
         *               HTML and event rows use the direct-target fast path.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private static IsSimpleList(compiled: CompiledInterface): boolean
        {
            if(compiled.row) return true;

            for(const operation of compiled.ops ?? [])
            {
                if
                (
                    operation.k !== 'text' &&
                    operation.k !== 'attr' &&
                    operation.k !== 'html' &&
                    operation.k !== 'event'
                )
                {
                    return false;
                }
            }

            return true;
        }

        /** @name        EventView
         *  @private
         *  @static
         *  @param       {Event} event Native delegated event.
         *  @param       {Element} currentTarget Logical compiled current target.
         *  @returns     {Event} Proxy preserving native Event methods while exposing the logical currentTarget.
         *  @description Delegation is an internal runtime optimisation and must preserve normal handler semantics.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private static EventView
        (
            event         : Event,
            currentTarget : Element
        ): Event
        {
            return new Proxy
            (
                event,
                {
                    get(target, property)
                    {
                        if(property === 'currentTarget')
                        {
                            return currentTarget;
                        }

                        const value = Reflect.get(target, property, target);

                        return typeof value === 'function'
                            ? value.bind(target)
                            : value;
                    }
                }
            );
        }

        /** @name        RegisterDelegated
         *  @private
         *  @static
         *  @param       {Element} target Event target.
         *  @param       {string} type DOM event type.
         *  @param       {unknown} context Owner context.
         *  @param       {Scope} scope Row scope.
         *  @param       {CompiledExpression} expression Compiler-generated event expression.
         *  @returns     {void}
         *  @description Register weak row-event metadata without installing a native listener. This is safe while
         *               the row still belongs to a DocumentFragment and avoids the initial-render direct-listener
         *               fallback that previously allocated one native listener closure per row/event binding.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private static RegisterDelegated
        (
            target     : Element,
            type       : string,
            context    : unknown,
            scope      : Scope,
            expression : CompiledExpression
        ): void
        {
            const binding: DelegatedEvent =
            {
                Type       : type,
                Context    : context,
                Scope      : scope,
                Expression : expression
            };

            const targetRecord =
                target as unknown as Record<
                    symbol,
                    DelegatedEvent | Map<string, DelegatedEvent> | undefined
                >;
            const current =
                targetRecord[Compiled.#Delegated];

            if(!current)
            {
                // Normal list row: one event target, one type. Store it directly.
                targetRecord[Compiled.#Delegated] = binding;
                return;
            }

            if(current instanceof Map)
            {
                current.set(type, binding);
                return;
            }

            if(current.Type === type)
            {
                targetRecord[Compiled.#Delegated] = binding;
                return;
            }

            // Allocate a Map only for the uncommon multi-event same-element case.
            const bindings = new Map<string, DelegatedEvent>();
            bindings.set(current.Type, current);
            bindings.set(type, binding);
            targetRecord[Compiled.#Delegated] = bindings;
        }

        /** @name        EnsureDelegation
         *  @private
         *  @static
         *  @param       {EventTarget} root Mounted Template host.
         *  @param       {string} type DOM event type.
         *  @returns     {void}
         *  @description Lazily install one bubbling native listener for one event type on the mounted Template
         *               host. Row targets remain weakly described in #Delegated, so no per-row native listener
         *               or listener disposer is allocated by the compiled list fast path.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private static EnsureDelegation
        (
            root : EventTarget,
            type : string
        ): void
        {
            let roots = Compiled.#DelegateRoots.get(root);

            if(!roots)
            {
                roots = new Map<string, EventListener>();
                Compiled.#DelegateRoots.set(root, roots);
            }

            if(roots.has(type))
            {
                return;
            }

            const listener: EventListener = (event: Event): void =>
            {
                let cursor = event.target as Node | null;

                while(cursor && cursor !== root)
                {
                    if(cursor instanceof Element)
                    {
                        const metadata =
                            (cursor as unknown as Record<
                                symbol,
                                DelegatedEvent | Map<string, DelegatedEvent> | undefined
                            >)[Compiled.#Delegated];

                        const binding =
                            metadata instanceof Map
                                ? metadata.get(type)
                                : metadata?.Type === type
                                    ? metadata
                                    : undefined;

                        if(binding)
                        {
                            const candidate =
                                binding.Expression(binding.Context, binding.Scope);

                            if(typeof candidate === 'function')
                            {
                                candidate.call
                                (
                                    binding.Context,
                                    Compiled.EventView(event, cursor)
                                );
                            }

                            return;
                        }
                    }

                    cursor = cursor.parentNode;
                }
            };

            root.addEventListener(type, listener);
            roots.set(type, listener);
        }

        /** @name        DelegatedTypes
         *  @private
         *  @static
         *  @param       {CompiledInterface} compiled Compiler-generated Template interface.
         *  @param       {Set<string>} [types] Accumulator reused during recursive traversal.
         *  @returns     {Set<string>} Event types owned by simple compiled list rows in this Template tree.
         *  @description Discover the delegated event surface once per mounted compiled Template. Only events
         *               belonging to allocation-minimal simple `a-for` rows are included; ordinary compiled
         *               event operations retain their existing direct-listener semantics and cannot double-fire.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private static DelegatedTypes
        (
            compiled : CompiledInterface,
            types    : Set<string> = new Set<string>()
        ): Set<string>
        {
            for(const type of compiled.delegated ?? [])
            {
                types.add(type);
            }

            for(const operation of compiled.ops ?? [])
            {
                if(operation.k === 'for' || operation.k === 'if')
                {
                    /*
                     * Recurse into the compiled child regardless of whether
                     * the row is a simple single-root factory or a canonical nested
                     * compiled block.
                     *
                     * Single-root row factories intentionally compile away c.ops,
                     * but retain compact c.delegated metadata. Recursing here lets
                     * the child contribute that metadata and preserves the legacy
                     * ops scan for non-flat/nested children.
                     */
                    Compiled.DelegatedTypes(operation.c, types);
                }
            }

            return types;
        }

        /** @name        MountDelegation
         *  @public
         *  @static
         *  @param       {EventTarget} root Mounted Template host.
         *  @param       {CompiledInterface} compiled Compiler-generated Template interface.
         *  @returns     {void}
         *  @description Activate delegated list events after the Template fragment has been inserted into its
         *               real host. Initial rows therefore never fall back to per-row native listeners merely
         *               because binding occurred while the Template was still inside a DocumentFragment.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static MountDelegation
        (
            root     : EventTarget,
            compiled : CompiledInterface
        ): void
        {
            for(const type of Compiled.DelegatedTypes(compiled))
            {
                Compiled.EnsureDelegation(root, type);
            }
        }

        /** @name        MountDelegation
         *  @public
         *  @param       {EventTarget} root Mounted Template host.
         *  @returns     {void}
         *  @description Instance convenience over Compiled.MountDelegation.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        MountDelegation(root: EventTarget): void
        {
            Compiled.MountDelegation(root, this.Interface);
        }

        /** @name        CreateListRecord
         *  @private
         *  @static
         *  @param       {CompiledInterface} compiled Child row interface.
         *  @param       {unknown} context Owner context.
         *  @param       {Scope} scope Mutable row scope.
         *  @param       {unknown} value Row value.
         *  @param       {number} index Row index.
         *  @returns     {CompiledListRecord} Allocation-minimal compiled row record.
         *  @description Clone the shared row template once, resolve operation paths once and install delegated
         *               event metadata. Subsequent updates patch the resolved targets directly.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private static CreateListRecord
        (
            compiled : CompiledInterface,
            runtime  : CompiledListRuntime,
            context  : unknown,
            scope    : Scope,
            value    : unknown,
            index    : number
        ): CompiledListRecord
        {
            /*
             * Compiler-generated single-root materializer.
             * One generated call replaces the runtime clone/wire/bind/record sequence.
             */
            if(compiled.row && runtime.Root)
            {
                const record = compiled.row
                (
                    runtime.Root,
                    context,
                    scope,
                    value,
                    index,
                    Primitives,
                    Compiled.RegisterDelegated
                );

                const directTarget =
                    value && typeof value === 'object'
                        ? Reactive.ToRaw(value as object)
                        : null;

                if(directTarget && record.DirectInvalidate)
                {
                    Reactive.AttachDirectInvalidator
                    (
                        directTarget,
                        record.DirectInvalidate as (key?: PropertyKey) => void
                    );
                }

                return record;
            }

            const singleRoot = compiled.singleRoot && runtime.Root;
            const materialized: Node =
                singleRoot
                    ? runtime.Root!.cloneNode(true)
                    : runtime.Template.content.cloneNode(true);

            const resolverRoot = materialized as ParentNode;
            const nodes: Node | Node[] =
                singleRoot
                    ? materialized
                    : (() =>
                    {
                        const fragment = materialized as DocumentFragment;
                        const first = fragment.firstChild;
                        return first && !first.nextSibling
                            ? first
                            : Array.from(fragment.childNodes);
                    })();

            const patchCount = runtime.PatchOps.length;
            const eventCount = runtime.EventOps.length;
            const directBinder = compiled.bind;
            const operations = compiled.ops ?? [];

            /*
             * Closure-binding path:
             * patch sinks are captured directly by compiler-generated code and therefore
             * need no Targets[] slots. Only delegated event targets remain in the array.
             */
            let targets: Array<Node | null> | null = null;

            if(directBinder && compiled.wire)
            {
                compiled.wire
                (
                    resolverRoot,
                    context,
                    scope,
                    Compiled.RegisterDelegated
                );
            }
            else
            {
                targets = new Array<Node | null>(directBinder ? eventCount : patchCount + eventCount);

                if(directBinder)
                {
                    for(let eventIndex = 0; eventIndex < eventCount; eventIndex++)
                    {
                        const operation = operations[runtime.EventOps[eventIndex]];
                        targets[eventIndex] = Compiled.At
                        (
                            resolverRoot,
                            singleRoot ? operation.p.slice(1) : operation.p
                        );
                    }
                }
                else if(compiled.resolve)
                {
                    compiled.resolve(resolverRoot, targets);
                }
                else
                {
                    for(let targetIndex = 0; targetIndex < patchCount; targetIndex++)
                    {
                        const operation = operations[runtime.PatchOps[targetIndex]];
                        targets[targetIndex] = Compiled.At
                        (
                            resolverRoot,
                            singleRoot ? operation.p.slice(1) : operation.p
                        );
                    }

                    for(let eventIndex = 0; eventIndex < eventCount; eventIndex++)
                    {
                        const operation = operations[runtime.EventOps[eventIndex]];
                        targets[patchCount + eventIndex] = Compiled.At
                        (
                            resolverRoot,
                            singleRoot ? operation.p.slice(1) : operation.p
                        );
                    }
                }

                for(let eventIndex = 0; eventIndex < eventCount; eventIndex++)
                {
                    const operation = operations[runtime.EventOps[eventIndex]];
                    const node = targets[directBinder ? eventIndex : patchCount + eventIndex];

                    if(operation.k === 'event' && node instanceof Element)
                    {
                        Compiled.RegisterDelegated(node, operation.n, context, scope, operation.e);
                    }
                }
            }

            const directTarget =
                value && typeof value === 'object'
                    ? Reactive.ToRaw(value as object)
                    : null;

            const directInvalidate =
                directBinder
                    ? directBinder(resolverRoot, context, scope, Primitives)
                    : null;

            const record: CompiledListRecord =
            {
                Nodes            : nodes,
                Targets          : targets,
                Scope            : scope,
                Value            : value,
                Index            : index,
                DirectInvalidate : directInvalidate
            };

            if(!directBinder)
            {
                Compiled.PatchListRecord(compiled, runtime, context, record);

                record.DirectInvalidate =
                    (key?: PropertyKey): void =>
                        key === undefined
                            ? Compiled.PatchListRecord(compiled, runtime, context, record)
                            : Compiled.PatchListRecordKey(runtime, context, record, key);
            }

            if(directTarget && record.DirectInvalidate)
            {
                Reactive.AttachDirectInvalidator
                (
                    directTarget,
                    record.DirectInvalidate as (key?: PropertyKey) => void
                );
            }

            return record;
        }

        /** @name        PatchListRecord
         *  @private
         *  @static
         *  @param       {CompiledInterface} compiled Child row interface.
         *  @param       {unknown} context Owner context.
         *  @param       {CompiledListRecord} record Row record.
         *  @returns     {void}
         *  @description Execute flat compiler operations directly against pre-resolved row targets.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private static PatchListRecord
        (
            compiled : CompiledInterface,
            runtime  : CompiledListRuntime,
            context  : unknown,
            record   : CompiledListRecord
        ): void
        {
            /*
             * Compiler-owned direct row sinks are authoritative for both
             * generated binders and generated row materializers. Positional
             * reconciliation reuses the mounted DOM record and changes its
             * scope/value, so the direct invalidator must repaint that record
             * regardless of which compiler materialization strategy created it.
             */
            if(record.DirectInvalidate && (compiled.bind || compiled.row))
            {
                record.DirectInvalidate(undefined);
                return;
            }

            for(let patchIndex = 0; patchIndex < runtime.Patches.length; patchIndex++)
            {
                Compiled.PatchListRecordAt(runtime, context, record, patchIndex);
            }
        }

        /** Execute only the precompiled sinks that depend on one row property. */
        private static PatchListRecordKey
        (
            runtime : CompiledListRuntime,
            context : unknown,
            record  : CompiledListRecord,
            key     : PropertyKey
        ): void
        {
            for(let index = 0; index < runtime.GenericPatches.length; index++)
            {
                Compiled.PatchListRecordAt(runtime, context, record, runtime.GenericPatches[index]);
            }

            const keyed = runtime.KeyedPatches.get(key);
            if(!keyed) return;

            for(let index = 0; index < keyed.length; index++)
            {
                Compiled.PatchListRecordAt(runtime, context, record, keyed[index]);
            }
        }

        /** Apply one shared row-factory sink descriptor to one row target. */
        private static PatchListRecordAt
        (
            runtime    : CompiledListRuntime,
            context    : unknown,
            record     : CompiledListRecord,
            patchIndex : number
        ): void
        {
            const patch = runtime.Patches[patchIndex];
            const node = record.Targets?.[patch.Target] ?? null;
            const next = patch.Evaluate(context, record.Scope);

            if(patch.Kind === 'text' && node?.nodeType === globalThis.Node.TEXT_NODE)
            {
                Primitives.Text(node as Text, next == null ? '' : String(next));
            }
            else if(patch.Kind === 'attr' && node instanceof Element)
            {
                Compiled.Set(node, patch.Name!, next);
            }
            else if(patch.Kind === 'html' && node instanceof Element)
            {
                Primitives.Html(node, next == null ? '' : String(next));
            }
        }

        /** @name        RemoveRecord
         *  @private
         *  @static
         *  @param       {CompiledListRecord} record Row record.
         *  @returns     {void}
         *  @description Detach one lightweight record without per-row disposer work.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private static FirstRecordNode(record: CompiledListRecord): Node
        {
            return Array.isArray(record.Nodes) ? record.Nodes[0] : record.Nodes;
        }

        private static LastRecordNode(record: CompiledListRecord): Node
        {
            return Array.isArray(record.Nodes)
                ? record.Nodes[record.Nodes.length - 1]
                : record.Nodes;
        }

        /** True while a freshly-created record is still owned by its clone fragment. */
        private static IsFreshRecord(record: CompiledListRecord): boolean
        {
            const parent = Compiled.FirstRecordNode(record).parentNode;
            return parent === null || parent instanceof DocumentFragment;
        }

        /** Move cloned row nodes into a bulk fragment without retaining the clone fragment. */
        private static AppendRecord(record: CompiledListRecord, parent: Node): void
        {
            if(Array.isArray(record.Nodes))
            {
                for(let index = 0; index < record.Nodes.length; index++)
                {
                    Primitives.Append(parent, record.Nodes[index]);
                }
                return;
            }

            Primitives.Append(parent, record.Nodes);
        }

        private static DisposeRecordBindings(record: CompiledListRecord): void
        {
            const directTarget =
                record.Value && typeof record.Value === 'object'
                    ? Reactive.ToRaw(record.Value as object)
                    : null;

            if(directTarget && record.DirectInvalidate)
            {
                Reactive.DetachDirectInvalidator(directTarget, record.DirectInvalidate);
            }

            record.DirectInvalidate = null;
            if(record.Targets) record.Targets.length = 0;
        }

        private static DisposeRecords(records: readonly CompiledListRecord[]): void
        {
            for(let index = 0; index < records.length; index++)
            {
                Compiled.DisposeRecordBindings(records[index]);
            }
        }

        private static RemoveRecord(record: CompiledListRecord): void
        {
            Compiled.DisposeRecordBindings(record);

            if(Array.isArray(record.Nodes))
            {
                for(let index = 0; index < record.Nodes.length; index++)
                {
                    Primitives.Remove(record.Nodes[index]);
                }
                record.Nodes.length = 0;
            }
            else
            {
                Primitives.Remove(record.Nodes);
            }

        }

        /** @name        MoveRecord
         *  @private
         *  @static
         *  @description Move one retained keyed record as a stable DOM group. */
        private static MoveRecord
        (
            record : CompiledListRecord,
            parent : Node,
            anchor : Node
        ): void
        {
            if(Array.isArray(record.Nodes))
            {
                for(let index = 0; index < record.Nodes.length; index++)
                {
                    Primitives.Before(parent, record.Nodes[index], anchor);
                }
                return;
            }

            Primitives.Before(parent, record.Nodes, anchor);
        }

        /** @name        Lis
         *  @private
         *  @static
         *  @param       {readonly number[]} values Previous indices in new order; -1 marks new records.
         *  @returns     {Set<number>} New-order positions belonging to the longest increasing subsequence.
         *  @description Standard O(n log n) keyed move minimisation. Retained rows on the LIS never move.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private static Lis(values: readonly number[]): Uint8Array
        {
            const length = values.length;
            const predecessors = new Int32Array(length);
            const tails = new Int32Array(length);
            const tailValues = new Int32Array(length);
            predecessors.fill(-1);

            let size = 0;
            for(let index = 0; index < length; index++)
            {
                const value = values[index];
                if(value < 0) continue;

                let low = 0, high = size;
                while(low < high)
                {
                    const middle = (low + high) >>> 1;
                    if(tailValues[middle] < value) low = middle + 1;
                    else high = middle;
                }

                if(low > 0) predecessors[index] = tails[low - 1];
                tails[low] = index;
                tailValues[low] = value;
                if(low === size) size++;
            }

            const stable = new Uint8Array(length);
            let cursor = size ? tails[size - 1] : -1;
            while(cursor >= 0)
            {
                stable[cursor] = 1;
                cursor = predecessors[cursor];
            }
            return stable;
        }

        /** @name        ClearRange
         *  @private
         *  @static
         *  @param       {Comment} start Start marker.
         *  @param       {Comment} end End marker.
         *  @returns     {void}
         *  @description Bulk-delete all list DOM between the structural markers in one native Range operation.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private static ClearRange
        (
            start : Comment,
            end   : Comment
        ): void
        {
            const parent = start.parentNode;
            if(parent !== end.parentNode || !parent) return;

            const range = document.createRange();
            range.setStartAfter(start);
            range.setEndBefore(end);
            range.deleteContents();
            range.detach?.();
        }

        /** @name        Bind
         *  @private
         *  @returns     {void}
         *  @description Bind every generated operation to this cloned fragment.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private Bind(): void
        {
            for(const operation of this.Interface.ops ?? [])
            {
                const node = this.At(this.Fragment, operation.p);

                if(!node)
                {
                    continue;
                }

                if(operation.k === 'event' && node instanceof Element)
                {
                    const candidate = operation.e(this.Context, this.Scope);

                    if(typeof candidate === 'function')
                    {
                        const listener = candidate.bind(this.Context) as EventListener;

                        node.addEventListener(operation.n, listener);

                        if(this.Reactive)
                        {
                            this.#disposers.push
                            (
                                () => node.removeEventListener(operation.n, listener)
                            );
                        }
                    }

                    continue;
                }

                if(operation.k === 'text' && node.nodeType === globalThis.Node.COMMENT_NODE)
                {
                    const text = Primitives.CreateText('');
                    const update = () =>
                    {
                        const value = operation.e(this.Context, this.Scope);

                        Primitives.Text(text, value == null ? '' : String(value));
                    };

                    node.parentNode && Primitives.Before(node.parentNode, text, node.nextSibling);
                    update();
                    this.#refreshers.push(update);

                    if(this.Reactive)
                    {
                        this.#disposers.push(this.Effect(update));
                    }

                    continue;
                }

                if(operation.k === 'attr' && node instanceof Element)
                {
                    const update = () =>
                        this.Set(node, operation.n, operation.e(this.Context, this.Scope));

                    update();
                    this.#refreshers.push(update);

                    if(this.Reactive)
                    {
                        this.#disposers.push(this.Effect(update));
                    }

                    continue;
                }

                if(operation.k === 'html' && node instanceof Element)
                {
                    const update = () =>
                    {
                        const value = operation.e(this.Context, this.Scope);

                        Primitives.Html(node, value == null ? '' : String(value));
                    };

                    update();
                    this.#refreshers.push(update);

                    if(this.Reactive)
                    {
                        this.#disposers.push(this.Effect(update));
                    }

                    continue;
                }

                if(operation.k === 'if' && node.nodeType === globalThis.Node.COMMENT_NODE)
                {
                    let child: Compiled | null = null;

                    const update = () =>
                    {
                        const visible = Boolean(operation.e(this.Context, this.Scope));

                        if(visible && !child)
                        {
                            child = new Compiled
                            (
                                operation.c,
                                this.Context,
                                this.Scope,
                                this.Reactive
                            );

                            node.parentNode && Primitives.Before(node.parentNode, child.Fragment, node.nextSibling);
                        }
                        else if(visible && child)
                        {
                            child.Refresh();
                        }
                        else if(!visible && child)
                        {
                            child.DisposeNodes();
                            child = null;
                        }
                    };

                    update();
                    this.#refreshers.push(update);

                    if(this.Reactive)
                    {
                        this.#disposers.push(this.Effect(update));
                    }

                    this.#disposers.push
                    (
                        () =>
                        {
                            child?.DisposeNodes();
                            child = null;
                        }
                    );

                    continue;
                }

                if(operation.k === 'for' && node.nodeType === globalThis.Node.COMMENT_NODE)
                {
                    const start = node as Comment;
                    const end = Primitives.CreateComment('ar:e');
                    const simple = Compiled.IsSimpleList(operation.c);
                    const keyed = typeof operation.key === 'function';

                    start.parentNode && Primitives.Before(start.parentNode, end, start.nextSibling);

                    if(simple)
                    {
                        let order: CompiledListRecord[] = [];
                        const records = new Map<unknown, CompiledListRecord>();
                        const scratchScope = this.ChildScope
                        (
                            this.Scope,
                            operation.item,
                            undefined,
                            operation.index,
                            0
                        );
                        let collectionTarget: object | null = null;
                        const listRuntime =
                            Compiled.ListRuntime(operation.c);
                        let collectionDispose: (() => void) | null = null;
                        let collectionChanged:
                            Reactive.CollectionPrimitiveSink | null = null;
                        let pendingKeyedSet:
                        {
                            Index    : number;
                            OldValue : unknown;
                            NewValue : unknown;
                            Token    : number;
                        } | null = null;
                        let pendingKeyedSetToken = 0;

                        const syncRecord =
                        (
                            record : CompiledListRecord,
                            value  : unknown,
                            index  : number
                        ): void =>
                        {
                            const scope =
                                record.Scope as Record<string, unknown>;

                            scope[operation.item] = value;

                            if(operation.index)
                            {
                                scope[operation.index] = index;
                            }

                            scope.$index = index;

                            const previousDirectTarget =
                                record.Value && typeof record.Value === 'object'
                                    ? Reactive.ToRaw(record.Value as object)
                                    : null;
                            const nextDirectTarget =
                                value && typeof value === 'object'
                                    ? Reactive.ToRaw(value as object)
                                    : null;

                            if(nextDirectTarget !== previousDirectTarget && record.DirectInvalidate)
                            {
                                if(previousDirectTarget)
                                {
                                    Reactive.DetachDirectInvalidator
                                    (
                                        previousDirectTarget,
                                        record.DirectInvalidate
                                    );
                                }

                                if(nextDirectTarget)
                                {
                                    Reactive.AttachDirectInvalidator
                                    (
                                        nextDirectTarget,
                                        record.DirectInvalidate
                                    );
                                }
                            }

                            record.Value = value;
                            record.Index = index;

                            Compiled.PatchListRecord
                                        (
                                            operation.c,
                                            listRuntime,
                                            this.Context,
                                record
                            );
                        };

                        const update = () =>
                        {
                            const parentNode = start.parentNode;

                            if(!parentNode)
                            {
                                return;
                            }

                            const source = operation.e(this.Context, this.Scope) ?? [];
                            const nextCollectionTarget =
                                source && typeof source === 'object'
                                    ? Reactive.ToRaw(source as object)
                                    : null;

                            const collectionReplaced =
                                nextCollectionTarget !== collectionTarget;

                            if(collectionReplaced)
                            {
                                collectionDispose?.();
                                collectionDispose = null;
                                collectionTarget = nextCollectionTarget;

                                if(collectionTarget && collectionChanged)
                                {
                                    collectionDispose =
                                        Reactive.RegisterCollectionPrimitive
                                        (
                                            collectionTarget,
                                            collectionChanged
                                        );
                                }
                            }

                            const values = Array.isArray(collectionTarget)
                                ? collectionTarget as unknown[]
                                : Array.from(source as Iterable<unknown>);
                            const previousLength = order.length;

                            /*
                             * Empty-list fast path: one native range deletion, then drop every
                             * strong runtime reference at once. No per-row remove/dispose loop.
                             */
                            if(values.length === 0)
                            {
                                if(previousLength)
                                {
                                    Compiled.DisposeRecords(order);
                                    Compiled.ClearRange(start, end);
                                    order.length = 0;
                                    records.clear();
                                }

                                return;
                            }

                            /*
                             * Full replacement fast path. When a Signal swaps the Array object and
                             * every incoming key is disjoint from the mounted keyed rows, there is no
                             * retained identity to reconcile. Drop the old DOM in one Range operation,
                             * build the new rows once and mount one Fragment. This avoids old-record
                             * removal loops, nextOrder/oldIndices/LIS allocation and a second Map.
                             */
                            if(keyed && collectionReplaced && previousLength > 0)
                            {
                                const nextKeys = new Array<unknown>(values.length);
                                const seen = new Set<unknown>();
                                const scratch = scratchScope as Record<string, unknown>;
                                let disjoint = true;

                                for(let index = 0; index < values.length; index++)
                                {
                                    scratch[operation.item] = values[index];
                                    if(operation.index) scratch[operation.index] = index;
                                    scratch.$index = index;

                                    const key = operation.key!(this.Context, scratchScope);
                                    nextKeys[index] = key;

                                    if(records.has(key) || seen.has(key))
                                    {
                                        disjoint = false;
                                        break;
                                    }

                                    seen.add(key);
                                }

                                if(disjoint)
                                {
                                    Compiled.DisposeRecords(order);
                                    Compiled.ClearRange(start, end);
                                    order.length = 0;
                                    records.clear();

                                    const batch = Primitives.CreateFragment();
                                    order = new Array<CompiledListRecord>(values.length);

                                    for(let index = 0; index < values.length; index++)
                                    {
                                        const value = values[index];
                                        const scope = this.ChildScope
                                        (
                                            this.Scope,
                                            operation.item,
                                            value,
                                            operation.index,
                                            index
                                        );
                                        const record = Compiled.CreateListRecord
                                        (
                                            operation.c,
                                            listRuntime,
                                            this.Context,
                                            scope,
                                            value,
                                            index
                                        );

                                        record.Key = nextKeys[index];
                                        order[index] = record;
                                        records.set(record.Key, record);
                                        Compiled.AppendRecord(record, batch);
                                    }

                                    Primitives.Before(parentNode, batch, end);
                                    return;
                                }
                            }

                            /*
                             * Positional lists never need a Map. Existing row DOM stays in place,
                             * changed values patch direct targets, new rows are appended in one
                             * DocumentFragment and shrinking removes only the tail.
                             */
                            if(!keyed)
                            {
                                const common = Math.min(previousLength, values.length);

                                for(let index = 0; index < common; index++)
                                {
                                    const record = order[index];
                                    const value = values[index];
                                    const changedValue = record.Value !== value;
                                    const changedIndex =
                                        Boolean(operation.index) &&
                                        record.Index !== index;
                                    const scope =
                                        record.Scope as Record<string, unknown>;

                                    scope[operation.item] = value;

                                    if(operation.index)
                                    {
                                        scope[operation.index] = index;
                                    }

                                    scope.$index = index;
                                    record.Value = value;
                                    record.Index = index;

                                    if(changedValue || changedIndex)
                                    {
                                        Compiled.PatchListRecord
                                        (
                                            operation.c,
                                            listRuntime,
                                            this.Context,
                                            record
                                        );
                                    }
                                }

                                if(values.length > previousLength)
                                {
                                    const batch = Primitives.CreateFragment();
                                    order.length = values.length;

                                    for(let index = previousLength; index < values.length; index++)
                                    {
                                        const value = values[index];
                                        const scope = this.ChildScope
                                        (
                                            this.Scope,
                                            operation.item,
                                            value,
                                            operation.index,
                                            index
                                        );
                                        const record = Compiled.CreateListRecord
                                        (
                                            operation.c,
                                            listRuntime,
                                            this.Context,
                                            scope,
                                            value,
                                            index
                                        );

                                        order[index] = record;
                                        Compiled.AppendRecord(record, batch);
                                    }

                                    Primitives.Before(parentNode, batch, end);
                                }
                                else if(values.length < previousLength)
                                {
                                    for(let index = previousLength - 1; index >= values.length; index--)
                                    {
                                        Compiled.RemoveRecord(order[index]);
                                    }

                                    order.length = values.length;
                                }

                                return;
                            }

                            /*
                             * Keyed specialisations handle structurally provable low-cost cases.
                             * All other key/order changes fall through to the canonical reconciler.
                             */
                            const scratch =
                                scratchScope as Record<string, unknown>;

                            /*
                             * Initial keyed materialization does not need the
                             * general reconciliation scratch arrays, LIS input or a second Map.
                             * Compute each key once, create each row once, register it directly in
                             * the canonical order/records structures and mount one DocumentFragment.
                             */
                            if(previousLength === 0)
                            {
                                const batch = Primitives.CreateFragment();
                                order = new Array<CompiledListRecord>(values.length);

                                for(let index = 0; index < values.length; index++)
                                {
                                    const value = values[index];

                                    scratch[operation.item] = value;

                                    if(operation.index)
                                    {
                                        scratch[operation.index] = index;
                                    }

                                    scratch.$index = index;

                                    const key =
                                        operation.key!(this.Context, scratchScope);
                                    const scope = this.ChildScope
                                    (
                                        this.Scope,
                                        operation.item,
                                        value,
                                        operation.index,
                                        index
                                    );
                                    const record = Compiled.CreateListRecord
                                    (
                                        operation.c,
                                        listRuntime,
                                        this.Context,
                                        scope,
                                        value,
                                        index
                                    );

                                    record.Key = key;
                                    order[index] = record;
                                    records.set(key, record);
                                    Compiled.AppendRecord(record, batch);
                                }

                                Primitives.Before(parentNode, batch, end);

                                return;
                            }

                            /*
                             * Pure append: unchanged retained prefix by object identity. Only the
                             * appended suffix needs key calculation, row creation and one bulk DOM
                             * insertion. This avoids Map/LIS allocation for the common append case.
                             */
                            if(previousLength > 0 && values.length > previousLength)
                            {
                                let pureAppend = true;

                                for(let index = 0; index < previousLength; index++)
                                {
                                    if(order[index].Value !== values[index])
                                    {
                                        pureAppend = false;

                                        break;
                                    }
                                }

                                if(pureAppend)
                                {
                                    const appendKeys =
                                        new Array<unknown>(values.length - previousLength);
                                    const localKeys =
                                        new Set<unknown>();

                                    for(let index = previousLength; index < values.length; index++)
                                    {
                                        scratch[operation.item] = values[index];

                                        if(operation.index)
                                        {
                                            scratch[operation.index] = index;
                                        }

                                        scratch.$index = index;

                                        const key =
                                            operation.key!(this.Context, scratchScope);

                                        if(records.has(key) || localKeys.has(key))
                                        {
                                            pureAppend = false;

                                            break;
                                        }

                                        localKeys.add(key);
                                        appendKeys[index - previousLength] = key;
                                    }

                                    if(pureAppend)
                                    {
                                        const batch =
                                            Primitives.CreateFragment();

                                        for(let index = previousLength; index < values.length; index++)
                                        {
                                            const value = values[index];
                                            const key = appendKeys[index - previousLength];
                                            const scope = this.ChildScope
                                            (
                                                this.Scope,
                                                operation.item,
                                                value,
                                                operation.index,
                                                index
                                            );
                                            const record = Compiled.CreateListRecord
                                        (
                                            operation.c,
                                            listRuntime,
                                            this.Context,
                                                scope,
                                                value,
                                                index
                                            );

                                            record.Key = key;
                                            records.set(key, record);
                                            order.push(record);
                                            Compiled.AppendRecord(record, batch);
                                        }

                                        Primitives.Before(parentNode, batch, end);

                                        return;
                                    }
                                }
                            }

                            /*
                             * Exact two-row swap: detect two identity mismatches and move the two
                             * retained DOM groups directly. Arbitrary reorders fall through to LIS.
                             */
                            if(values.length === previousLength)
                            {
                                let first = -1;
                                let second = -1;
                                let many = false;

                                for(let index = 0; index < values.length; index++)
                                {
                                    if(order[index].Value === values[index])
                                    {
                                        continue;
                                    }

                                    if(first < 0)
                                    {
                                        first = index;
                                    }
                                    else if(second < 0)
                                    {
                                        second = index;
                                    }
                                    else
                                    {
                                        many = true;

                                        break;
                                    }
                                }

                                if
                                (
                                    !many &&
                                    first >= 0 &&
                                    second >= 0 &&
                                    order[first].Value === values[second] &&
                                    order[second].Value === values[first]
                                )
                                {
                                    const firstRecord = order[first];
                                    const secondRecord = order[second];
                                    const afterSecond =
                                        Compiled.LastRecordNode(secondRecord).nextSibling ?? end;

                                    Compiled.MoveRecord
                                    (
                                        secondRecord,
                                        parentNode,
                                        Compiled.FirstRecordNode(firstRecord)
                                    );

                                    Compiled.MoveRecord
                                    (
                                        firstRecord,
                                        parentNode,
                                        afterSecond
                                    );

                                    order[first] = secondRecord;
                                    order[second] = firstRecord;
                                    secondRecord.Index = first;
                                    firstRecord.Index = second;

                                    if(operation.index)
                                    {
                                        const firstScope =
                                            firstRecord.Scope as Record<string, unknown>;
                                        const secondScope =
                                            secondRecord.Scope as Record<string, unknown>;

                                        firstScope[operation.index] = second;
                                        firstScope.$index = second;
                                        secondScope[operation.index] = first;
                                        secondScope.$index = first;

                                        Compiled.PatchListRecord
                                        (
                                            operation.c,
                                            listRuntime,
                                            this.Context,
                                            firstRecord
                                        );

                                        Compiled.PatchListRecord
                                        (
                                            operation.c,
                                            listRuntime,
                                            this.Context,
                                            secondRecord
                                        );
                                    }

                                    return;
                                }
                            }

                            /*
                             * General keyed reconciliation remains canonical for arbitrary key/order changes.
                             */
                            const nextOrder =
                                new Array<CompiledListRecord>(values.length);
                            const oldIndices =
                                new Array<number>(values.length);
                            const nextRecords =
                                new Map<unknown, CompiledListRecord>();

                            for(let index = 0; index < values.length; index++)
                            {
                                const value = values[index];

                                scratch[operation.item] = value;

                                if(operation.index)
                                {
                                    scratch[operation.index] = index;
                                }

                                scratch.$index = index;

                                const key =
                                    operation.key!(this.Context, scratchScope);
                                let record = records.get(key);

                                if(record)
                                {
                                    const oldIndex = record.Index;

                                    const changedValue = record.Value !== value;
                                    const changedIndex =
                                        Boolean(operation.index) &&
                                        record.Index !== index;
                                    const scope =
                                        record.Scope as Record<string, unknown>;

                                    scope[operation.item] = value;

                                    if(operation.index)
                                    {
                                        scope[operation.index] = index;
                                    }

                                    scope.$index = index;
                                    record.Value = value;
                                    record.Index = index;

                                    if(changedValue || changedIndex)
                                    {
                                        Compiled.PatchListRecord
                                        (
                                            operation.c,
                                            listRuntime,
                                            this.Context,
                                            record
                                        );
                                    }

                                    oldIndices[index] = oldIndex;
                                }
                                else
                                {
                                    const scope = this.ChildScope
                                    (
                                        this.Scope,
                                        operation.item,
                                        value,
                                        operation.index,
                                        index
                                    );

                                    record = Compiled.CreateListRecord
                                        (
                                            operation.c,
                                            listRuntime,
                                            this.Context,
                                        scope,
                                        value,
                                        index
                                    );

                                    oldIndices[index] = -1;
                                }

                                nextOrder[index] = record;
                                record.Key = key;
                                nextRecords.set(key, record);
                            }

                            /*
                             * Remove keyed records that are no longer present in the next collection.
                             */
                            for(const [key, record] of records)
                            {
                                if(!nextRecords.has(key))
                                {
                                    Compiled.RemoveRecord(record);
                                }
                            }

                            /*
                             * First create and pure append are bulk DOM operations.
                             */
                            if(previousLength === 0)
                            {
                                const batch = Primitives.CreateFragment();

                                for(const record of nextOrder)
                                {
                                    Compiled.AppendRecord(record, batch);
                                }

                                Primitives.Before(parentNode, batch, end);
                            }
                            else
                            {
                                /*
                                 * Standard LIS-based keyed reconciliation. Retained rows already
                                 * in increasing old-index order never move; only actual reorder
                                 * points are inserted from right to left. A two-row swap therefore
                                 * performs two DOM moves instead of walking/moving the middle span.
                                 */
                                const stable = Compiled.Lis(oldIndices);

                                for(let index = nextOrder.length - 1; index >= 0; index--)
                                {
                                    const record = nextOrder[index];
                                    const anchor =
                                        index + 1 < nextOrder.length
                                            ? Compiled.FirstRecordNode(nextOrder[index + 1])
                                            : end;

                                    if(Compiled.IsFreshRecord(record))
                                    {
                                        const batch = Primitives.CreateFragment();
                                        Compiled.AppendRecord(record, batch);
                                        Primitives.Before(parentNode, batch, anchor);
                                    }
                                    else if(!stable[index])
                                    {
                                        Compiled.MoveRecord(record, parentNode, anchor);
                                    }
                                }
                            }

                            records.clear();

                            for(const [key, record] of nextRecords)
                            {
                                records.set(key, record);
                            }

                            order = nextOrder;
                        };

                        collectionChanged =
                            (
                                mutation     : Reactive.ArrayOperation,
                                mutationIndex: number | undefined,
                                mutationDeleteCount: number | undefined,
                                mutationAdded: readonly unknown[],
                                mutationRemoved: readonly unknown[]
                            ): void =>
                            {
                                if(!collectionTarget) return;

                                const values =
                                    Array.isArray(collectionTarget)
                                        ? collectionTarget as unknown[]
                                        : null;

                                if(!values)
                                {
                                    update();
                                    return;
                                }

                                if(mutation === 'clear')
                                {
                                    if(order.length)
                                    {
                                        /*
                                         * Whole-list clear:
                                         * dispose row bindings, remove the owned DOM interval in one
                                         * native range operation, then release keyed bookkeeping.
                                         */
                                        Compiled.DisposeRecords(order);
                                        Compiled.ClearRange(start, end);
                                        order.length = 0;
                                        records.clear();
                                    }

                                    return;
                                }

                                if(mutation === 'update')
                                {
                                    const index = mutationIndex;

                                    if(typeof index === 'number' && index >= 0 && index < order.length && index < values.length)
                                    {
                                        syncRecord(order[index], values[index], index);
                                        return;
                                    }

                                    update();
                                    return;
                                }

                                /*
                                 * Direct keyed append. Append is not splice: no removed slice/Set,
                                 * no created scratch arrays and no order.splice. Only the appended
                                 * suffix is keyed, created and mounted in one Fragment.
                                 */
                                if
                                (
                                    keyed &&
                                    mutation === 'push' &&
                                    (mutationIndex ?? order.length) === order.length &&
                                    (mutationDeleteCount ?? 0) === 0
                                )
                                {
                                    const startIndex = order.length;
                                    const batch = Primitives.CreateFragment();
                                    const scratch = scratchScope as Record<string, unknown>;

                                    for(let cursor = startIndex; cursor < values.length; cursor++)
                                    {
                                        const value = values[cursor];
                                        scratch[operation.item] = value;
                                        if(operation.index) scratch[operation.index] = cursor;
                                        scratch.$index = cursor;

                                        const key = operation.key!(this.Context, scratchScope);
                                        const scope = this.ChildScope
                                        (
                                            this.Scope,
                                            operation.item,
                                            value,
                                            operation.index,
                                            cursor
                                        );
                                        const record = Compiled.CreateListRecord
                                        (
                                            operation.c,
                                            listRuntime,
                                            this.Context,
                                            scope,
                                            value,
                                            cursor
                                        );

                                        record.Key = key;
                                        records.set(key, record);
                                        order.push(record);
                                        Compiled.AppendRecord(record, batch);
                                    }

                                    start.parentNode && Primitives.Before(start.parentNode, batch, end);
                                    return;
                                }

                                if
                                (
                                    mutation === 'pop' ||
                                    mutation === 'shift' ||
                                    mutation === 'unshift' ||
                                    mutation === 'splice'
                                )
                                {
                                    const index = mutationIndex ?? 0;
                                    const removeCount = mutationDeleteCount ?? 0;
                                    const addCount = mutationAdded.length;

                                    /*
                                     * Direct full keyed replacement. Build and validate incoming records in one pass.
                                     * Correct keyed reuse is preserved: any duplicate new key or
                                     * overlap with a retained old key disposes the provisional records and
                                     * falls through to the canonical reconciler.
                                     */
                                    if
                                    (
                                        keyed &&
                                        mutation === 'splice' &&
                                        index === 0 &&
                                        removeCount === order.length &&
                                        addCount === values.length
                                    )
                                    {
                                        const batch = Primitives.CreateFragment();
                                        const nextOrder = new Array<CompiledListRecord>(values.length);
                                        const seen = new Set<unknown>();
                                        const scratch = scratchScope as Record<string, unknown>;
                                        let disjoint = true;
                                        let createdCount = 0;

                                        for(let cursor = 0; cursor < values.length; cursor++)
                                        {
                                            const value = values[cursor];
                                            scratch[operation.item] = value;
                                            if(operation.index) scratch[operation.index] = cursor;
                                            scratch.$index = cursor;

                                            const key = operation.key!(this.Context, scratchScope);

                                            if(seen.has(key) || records.has(key))
                                            {
                                                disjoint = false;
                                                break;
                                            }

                                            seen.add(key);

                                            const scope = this.ChildScope
                                            (
                                                this.Scope,
                                                operation.item,
                                                value,
                                                operation.index,
                                                cursor
                                            );
                                            const record = Compiled.CreateListRecord
                                            (
                                                operation.c,
                                                listRuntime,
                                                this.Context,
                                                scope,
                                                value,
                                                cursor
                                            );

                                            record.Key = key;
                                            nextOrder[cursor] = record;
                                            createdCount++;
                                            Compiled.AppendRecord(record, batch);
                                        }

                                        if(disjoint)
                                        {
                                            if(order.length)
                                            {
                                                Compiled.DisposeRecords(order);
                                                Compiled.ClearRange(start, end);
                                            }
                                            records.clear();

                                            for(let cursor = 0; cursor < nextOrder.length; cursor++)
                                            {
                                                const record = nextOrder[cursor];
                                                records.set(record.Key, record);
                                            }

                                            order = nextOrder;
                                            start.parentNode && Primitives.Before(start.parentNode, batch, end);
                                            return;
                                        }

                                        /* Provisional rows were never mounted. Dispose their direct
                                         * invalidators and detached nodes before canonical reconciliation. */
                                        for(let cursor = 0; cursor < createdCount; cursor++)
                                        {
                                            Compiled.RemoveRecord(nextOrder[cursor]);
                                        }
                                    }

                                    if(!keyed)
                                    {
                                        const previousLength = order.length;
                                        const nextLength = values.length;
                                        const common = Math.min(previousLength, nextLength);

                                        for
                                        (
                                            let cursor = Math.min(index, common);
                                            cursor < common;
                                            cursor++
                                        )
                                        {
                                            if(order[cursor].Value !== values[cursor] || operation.index)
                                            {
                                                syncRecord(order[cursor], values[cursor], cursor);
                                            }
                                        }

                                        if(nextLength > previousLength)
                                        {
                                            const batch = Primitives.CreateFragment();
                                            order.length = nextLength;

                                            for(let cursor = previousLength; cursor < nextLength; cursor++)
                                            {
                                                const value = values[cursor];
                                                const scope = this.ChildScope
                                                (
                                                    this.Scope,
                                                    operation.item,
                                                    value,
                                                    operation.index,
                                                    cursor
                                                );
                                                const record = Compiled.CreateListRecord
                                        (
                                            operation.c,
                                            listRuntime,
                                            this.Context,
                                                    scope,
                                                    value,
                                                    cursor
                                                );

                                                order[cursor] = record;
                                                Compiled.AppendRecord(record, batch);
                                            }

                                            start.parentNode && Primitives.Before(start.parentNode, batch, end);
                                        }
                                        else if(nextLength < previousLength)
                                        {
                                            for(let cursor = previousLength - 1; cursor >= nextLength; cursor--)
                                            {
                                                Compiled.RemoveRecord(order[cursor]);
                                            }

                                            order.length = nextLength;
                                        }

                                        return;
                                    }

                                    const removedRecords =
                                        order.slice(index, index + removeCount);
                                    const removedKeys =
                                        new Set(removedRecords.map(record => record.Key));
                                    const created: CompiledListRecord[] = [];
                                    const createdKeys: unknown[] = [];
                                    let canApply = true;
                                    const scratch =
                                        scratchScope as Record<string, unknown>;

                                    for(let offset = 0; offset < addCount; offset++)
                                    {
                                        const cursor = index + offset;
                                        const value = values[cursor];

                                        scratch[operation.item] = value;

                                        if(operation.index)
                                        {
                                            scratch[operation.index] = cursor;
                                        }

                                        scratch.$index = cursor;

                                        const key =
                                            operation.key!(this.Context, scratchScope);

                                        if(records.has(key) && !removedKeys.has(key))
                                        {
                                            canApply = false;
                                            break;
                                        }

                                        const scope = this.ChildScope
                                        (
                                            this.Scope,
                                            operation.item,
                                            value,
                                            operation.index,
                                            cursor
                                        );
                                        const record = Compiled.CreateListRecord
                                        (
                                            operation.c,
                                            listRuntime,
                                            this.Context,
                                            scope,
                                            value,
                                            cursor
                                        );

                                        record.Key = key;
                                        created.push(record);
                                        createdKeys.push(key);
                                    }

                                    if(!canApply)
                                    {
                                        for(const record of created)
                                        {
                                            Compiled.RemoveRecord(record);
                                        }

                                        update();
                                        return;
                                    }

                                    const anchor =
                                        order[index + removeCount] ? Compiled.FirstRecordNode(order[index + removeCount]) : end;

                                    for(const record of removedRecords)
                                    {
                                        if(record.Key !== undefined)
                                        {
                                            records.delete(record.Key);
                                        }

                                        Compiled.RemoveRecord(record);
                                    }

                                    const batch = Primitives.CreateFragment();

                                    for(let offset = 0; offset < created.length; offset++)
                                    {
                                        const record = created[offset];
                                        records.set(createdKeys[offset], record);
                                        Compiled.AppendRecord(record, batch);
                                    }

                                    start.parentNode && Primitives.Before(start.parentNode, batch, anchor);
                                    order.splice(index, removeCount, ...created);

                                    if(operation.index)
                                    {
                                        for(let cursor = index; cursor < order.length; cursor++)
                                        {
                                            const record = order[cursor];

                                            if(record.Index !== cursor)
                                            {
                                                syncRecord(record, values[cursor], cursor);
                                            }
                                        }
                                    }

                                    return;
                                }

                                if
                                (
                                    mutation === 'set' ||
                                    mutation === 'add'
                                )
                                {
                                    const index = mutationIndex;

                                    if(typeof index !== 'number')
                                    {
                                        update();
                                        return;
                                    }

                                    if(!keyed && index < order.length)
                                    {
                                        syncRecord(order[index], values[index], index);
                                        return;
                                    }

                                    if(keyed && mutation === 'set' && index < order.length)
                                    {
                                        const oldValue = mutationRemoved[0];
                                        const newValue = mutationAdded[0];
                                        const pending = pendingKeyedSet;

                                        if(pending)
                                        {
                                            pendingKeyedSet = null;
                                            pendingKeyedSetToken++;

                                            if
                                            (
                                                pending.Index !== index &&
                                                pending.OldValue === newValue &&
                                                pending.NewValue === oldValue
                                            )
                                            {
                                                const low = Math.min(pending.Index, index);
                                                const high = Math.max(pending.Index, index);
                                                const lowRecord = order[low];
                                                const highRecord = order[high];
                                                const afterHigh =
                                                    Compiled.LastRecordNode(highRecord).nextSibling ?? end;

                                                Compiled.MoveRecord
                                                (
                                                    highRecord,
                                                    start.parentNode!,
                                                    Compiled.FirstRecordNode(lowRecord)
                                                );
                                                Compiled.MoveRecord
                                                (
                                                    lowRecord,
                                                    start.parentNode!,
                                                    afterHigh
                                                );

                                                order[low] = highRecord;
                                                order[high] = lowRecord;
                                                highRecord.Index = low;
                                                lowRecord.Index = high;

                                                if(operation.index)
                                                {
                                                    const highScope = highRecord.Scope as Record<string, unknown>;
                                                    const lowScope = lowRecord.Scope as Record<string, unknown>;
                                                    highScope[operation.index] = low;
                                                    highScope.$index = low;
                                                    lowScope[operation.index] = high;
                                                    lowScope.$index = high;
                                                    Compiled.PatchListRecord(operation.c, listRuntime, this.Context, highRecord);
                                                    Compiled.PatchListRecord(operation.c, listRuntime, this.Context, lowRecord);
                                                }

                                                return;
                                            }

                                            // A second, non-reciprocal structural set arrived in the same
                                            // turn. Reconcile the final Array once rather than once per set.
                                            update();
                                            return;
                                        }

                                        const token = ++pendingKeyedSetToken;
                                        pendingKeyedSet =
                                        {
                                            Index    : index,
                                            OldValue : oldValue,
                                            NewValue : newValue,
                                            Token    : token
                                        };

                                        queueMicrotask
                                        (() =>
                                        {
                                            if
                                            (
                                                pendingKeyedSet &&
                                                pendingKeyedSet.Token === token
                                            )
                                            {
                                                pendingKeyedSet = null;
                                                update();
                                            }
                                        });

                                        return;
                                    }

                                    update();
                                    return;
                                }

                                if(mutation === 'truncate')
                                {
                                    const nextLength = values.length;

                                    if(nextLength === 0)
                                    {
                                        if(order.length)
                                        {
                                            Compiled.ClearRange(start, end);
                                            order.length = 0;
                                            records.clear();
                                        }

                                        return;
                                    }

                                    if(nextLength < order.length)
                                    {
                                        for(let cursor = order.length - 1; cursor >= nextLength; cursor--)
                                        {
                                            const record = order[cursor];

                                            if(keyed && record.Key !== undefined)
                                            {
                                                records.delete(record.Key);
                                            }

                                            Compiled.RemoveRecord(record);
                                        }

                                        order.length = nextLength;
                                        return;
                                    }
                                }

                                update();
                            };

                        update();

                        this.#disposers.push
                        (
                            () =>
                            {
                                collectionDispose?.();
                                collectionDispose = null;
                                collectionChanged = null;
                            }
                        );

                        this.#refreshers.push(update);

                        if(this.Reactive)
                        {
                            /*
                             * Source reaction. The list expression itself is tracked,
                             * but row sink evaluation and Array structure are not. Structural
                             * mutations arrive through RegisterCollectionPrimitive; replacing
                             * a Signal-backed collection retriggers this one-shot reaction.
                             */
                            let sourceReaction: ReactionLike | null = null;

                            const trackSource = (): void =>
                            {
                                sourceReaction?.Track
                                (
                                    () =>
                                    {
                                        operation.e(this.Context, this.Scope);
                                    }
                                );
                            };

                            sourceReaction = (RuntimeReactivity().CreateReaction ?? Reactive.CreateReaction)
                            (
                                () =>
                                {
                                    update();
                                    trackSource();
                                },
                                { Schedule: 'sync' }
                            );

                            trackSource();

                            this.#disposers.push
                            (
                                () =>
                                {
                                    sourceReaction?.Dispose();
                                    sourceReaction = null;
                                }
                            );
                        }

                        this.#disposers.push
                        (
                            () =>
                            {
                                if(order.length)
                                {
                                    Compiled.ClearRange(start, end);
                                }

                                order.length = 0;
                                records.clear();
                                Primitives.Remove(end);
                            }
                        );
                    }
                    else
                    {
                        /*
                         * Structural row templates retain the fully general nested Compiled
                         * implementation. This path prioritises semantic completeness over the
                         * allocation-minimal flat-row fast path.
                         */
                        type RecordInterface =
                        {
                            Compiled : Compiled;
                            Scope    : Scope;
                            Value    : unknown;
                            Index    : number;
                        };

                        const records = new Map<unknown, RecordInterface>();

                        const update = () =>
                        {
                            const parent = start.parentNode;

                            if(!parent)
                            {
                                return;
                            }

                            const raw = operation.e(this.Context, this.Scope) ?? [];
                            const values = Array.isArray(raw)
                                ? raw
                                : Array.from(raw as Iterable<unknown>);
                            const next = new Map<unknown, RecordInterface>();

                            for(let index = 0; index < values.length; index++)
                            {
                                const value = values[index];
                                const temporaryScope = this.ChildScope
                                (
                                    this.Scope,
                                    operation.item,
                                    value,
                                    operation.index,
                                    index
                                );
                                const key = keyed
                                    ? operation.key!(this.Context, temporaryScope)
                                    : index;
                                let record = records.get(key);

                                if(!record)
                                {
                                    record =
                                    {
                                        Compiled : new Compiled
                                        (
                                            operation.c,
                                            this.Context,
                                            temporaryScope,
                                            false
                                        ),
                                        Scope : temporaryScope,
                                        Value : value,
                                        Index : index
                                    };
                                }
                                else
                                {
                                    const changedValue = record.Value !== value;
                                    const changedIndex =
                                        Boolean(operation.index) &&
                                        record.Index !== index;
                                    const recordScope =
                                        record.Scope as Record<string, unknown>;

                                    recordScope[operation.item] = value;

                                    if(operation.index)
                                    {
                                        recordScope[operation.index] = index;
                                    }

                                    recordScope.$index = index;
                                    record.Value = value;
                                    record.Index = index;

                                    if(changedValue || changedIndex)
                                    {
                                        record.Compiled.Refresh();
                                    }
                                }

                                next.set(key, record);
                            }

                            for(const [key, record] of records)
                            {
                                if(!next.has(key))
                                {
                                    record.Compiled.DisposeNodes();
                                }
                            }

                            let anchor: Node = end;

                            for(const record of Array.from(next.values()).reverse())
                            {
                                const nodes = record.Compiled.Nodes;

                                if(!nodes.length)
                                {
                                    continue;
                                }

                                if(nodes[nodes.length - 1].nextSibling !== anchor)
                                {
                                    for(let index = nodes.length - 1; index >= 0; index--)
                                    {
                                        Primitives.Before(parent, nodes[index], anchor);
                                        anchor = nodes[index];
                                    }
                                }
                                else
                                {
                                    anchor = nodes[0];
                                }
                            }

                            records.clear();

                            for(const [key, record] of next)
                            {
                                records.set(key, record);
                            }
                        };

                        update();
                        this.#refreshers.push(update);

                        if(this.Reactive)
                        {
                            this.#disposers.push(this.Effect(update));
                        }

                        this.#disposers.push
                        (
                            () =>
                            {
                                for(const record of records.values())
                                {
                                    record.Compiled.DisposeNodes();
                                }

                                records.clear();
                                Primitives.Remove(end);
                            }
                        );
                    }
                }            }
        }

        /** @name        Refresh
         *  @public
         *  @returns     {void}
         *  @description Re-run direct compiler-generated patch operations without allocating Effects or rebuilding
         *               the structural DOM. Used by keyed and positional reconciliation when a retained record
         *               receives a new value or a tracked loop index changes.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Refresh(): void
        {
            for(const refresh of this.#refreshers)
            {
                refresh();
            }
        }

        /** @name        DisposeOnly
         *  @public
         *  @returns     {void}
         *  @description Dispose bindings/listeners while leaving currently mounted nodes untouched.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        DisposeOnly(): void
        {
            while(this.#disposers.length)
            {
                this.#disposers.pop()?.();
            }

            this.#refreshers.length = 0;
        }

        /** @name        DisposeNodes
         *  @public
         *  @returns     {void}
         *  @description Dispose bindings/listeners and detach every owned top-level node.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        DisposeNodes(): void
        {
            this.DisposeOnly();

            for(const node of this.Nodes)
            {
                Primitives.Remove(node);
            }
        }
    }

    /** @class       Template
     *  @public
     *  @description Unified AriannA Template abstraction. A Template may own runtime-parsed dynamic bindings
     *               or one compiler-generated CompiledInterface. Both forms expose identical Create/Compiled,
     *               Mount, Html and Css entry points so compiler optimisation remains transparent to components.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Template
    {
        /** @name        #Cache
         *  @private
         *  @static
         *  @readonly
         *  @type        {Map<string, Template>}
         *  @description Dynamic Template cache keyed by exact source string.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static readonly #Cache = new Map<string, Template>();

        /** @name        #source
         *  @private
         *  @readonly
         *  @type        {string}
         *  @description Canonical source HTML for this Template.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly #source: string;

        /** @name        #node
         *  @private
         *  @readonly
         *  @type        {HTMLTemplateElement | null}
         *  @description Runtime-parsed dynamic template node; null for compiler-generated templates.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly #node: HTMLTemplateElement | null;

        /** @name        #bindings
         *  @private
         *  @readonly
         *  @type        {readonly Binding[]}
         *  @description Dynamic runtime bindings; empty for compiler-generated templates.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly #bindings: readonly Binding[];

        /** @name        #compiled
         *  @private
         *  @readonly
         *  @type        {CompiledInterface | null}
         *  @description Compiler-generated interface or null for dynamic templates.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly #compiled: CompiledInterface | null;

        /** @name        constructor
         *  @public
         *  @param       {string | CompiledInterface} source Dynamic source or compiler-generated interface.
         *  @description Construct either the dynamic or compiled representation behind one Template surface.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(source: string | CompiledInterface)
        {
            if(typeof source === 'string')
            {
                this.#source   = source;
                this.#compiled = null;
                this.#node     = Primitives.CreateTemplate();
                Primitives.Html(this.#node, source);

                const bindings: Binding[] = [];

                Template.#Compile(this.#node.content, [], bindings);

                this.#bindings = bindings;
            }
            else
            {
                this.#source   = source.html;
                this.#compiled = source;
                this.#node     = null;
                this.#bindings = [];

                Compiled.Node(source);
            }
        }

        /** @name        Source
         *  @public
         *  @readonly
         *  @type        {string}
         *  @description Canonical HTML source.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get Source(): string
        {
            return this.#source;
        }

        /** @name        Node
         *  @public
         *  @readonly
         *  @type        {HTMLTemplateElement | null}
         *  @description Dynamic parsed template node or null for compiler-generated templates.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get Node(): HTMLTemplateElement | null
        {
            return this.#node;
        }

        /** @name        Bindings
         *  @public
         *  @readonly
         *  @type        {readonly Binding[]}
         *  @description Runtime binding metadata for dynamic templates.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get Bindings(): readonly Binding[]
        {
            return this.#bindings;
        }

        /** @name        IsCompiled
         *  @public
         *  @readonly
         *  @type        {boolean}
         *  @description True when this Template was created from a CompiledInterface.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get IsCompiled(): boolean
        {
            return this.#compiled !== null;
        }

        /** @name        Create
         *  @public
         *  @static
         *  @param       {string} source Dynamic HTML source.
         *  @returns     {Template} Cached dynamic Template.
         *  @description Create or retrieve a runtime Template by exact source identity.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
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

        /** @name        Compiled
         *  @public
         *  @static
         *  @param       {CompiledInterface} compiled Compiler-generated interface.
         *  @returns     {Template} Compiled Template wrapper.
         *  @description Compiler entry point. Generator hoists and shares interface identity automatically.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Compiled(compiled: CompiledInterface): Template
        {
            return new Template(compiled);
        }

        /** @name        Mount
         *  @public
         *  @param       {ParentNode} host Mount host.
         *  @param       {Scope} scope Evaluation scope.
         *  @param       {Options} [options] Mount options.
         *  @returns     {Mount} Mounted node/disposal contract.
         *  @description Mount either the compiled fast path or the dynamic runtime path transparently.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Mount
        (
            host    : ParentNode,
            scope   : Scope,
            options : Options = {}
        ): Mount
        {
            if(this.#compiled)
            {
                const context =
                    ((options as unknown as { Owner?: unknown }).Owner ?? scope);
                const compiled = new Compiled(this.#compiled, context, scope);

                Primitives.Append(host, compiled.Fragment);
                compiled.MountDelegation(host);

                return {
                    Nodes   : compiled.Nodes,
                    Dispose : () => compiled.DisposeNodes()
                } as Mount;
            }

            const fragment = this.#node!.content.cloneNode(true) as DocumentFragment;
            const disposers: Array<() => void> = [];

            for(const binding of this.#bindings)
            {
                const node = Template.#At(fragment, binding.Path);

                if(!node)
                {
                    continue;
                }

                if(binding.Kind === 'event' && node instanceof Element && binding.Name)
                {
                    const evaluated = Template.#Evaluate(binding.Expression, scope);
                    const candidate = typeof evaluated === 'function'
                        ? evaluated
                        : scope[binding.Expression];

                    if(typeof candidate === 'function')
                    {
                        const owner = (options as unknown as { Owner?: unknown }).Owner ?? scope;
                        const listener = candidate.bind(owner) as EventListener;

                        node.addEventListener(binding.Name, listener);
                        disposers.push
                        (
                            () => node.removeEventListener(binding.Name!, listener)
                        );
                    }

                    continue;
                }

                const dispose = Compiled.Effect
                (
                    () => Template.#Apply(node, binding, scope, options)
                );

                disposers.push(dispose);
            }

            const nodes = Array.from(fragment.childNodes);

            Primitives.Append(host, fragment);

            return {
                Nodes   : nodes,
                Dispose : () =>
                {
                    for(const dispose of disposers)
                    {
                        dispose();
                    }

                    for(const node of nodes)
                    {
                        Primitives.Remove(node);
                    }
                }
            };
        }

        /** @name        #Compile
         *  @private
         *  @static
         *  @param       {Node} node Current node.
         *  @param       {number[]} path Current child-node path.
         *  @param       {Binding[]} out Binding accumulator.
         *  @returns     {void}
         *  @description Runtime fallback compiler for dynamic templates.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static #Compile
        (
            node : Node,
            path : number[],
            out  : Binding[]
        ): void
        {
            if(node.nodeType === globalThis.Node.TEXT_NODE)
            {
                const source = node.textContent ?? '';

                if(/\{\{[\s\S]+?\}\}/.test(source))
                {
                    out.push
                    ({
                        Kind       : 'text',
                        Path       : [...path],
                        Expression : source
                    });
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
                        ({
                            Kind       : 'attribute',
                            Path       : [...path],
                            Name       : attribute.name.slice(1),
                            Expression : attribute.value
                        });

                        Primitives.Attribute(node, attribute.name, null);
                    }
                    else if(attribute.name.startsWith('@'))
                    {
                        out.push
                        ({
                            Kind       : 'event',
                            Path       : [...path],
                            Name       : attribute.name.slice(1),
                            Expression : attribute.value
                        });

                        Primitives.Attribute(node, attribute.name, null);
                    }
                    else if(attribute.name === 'a-if')
                    {
                        out.push
                        ({
                            Kind       : 'if',
                            Path       : [...path],
                            Expression : attribute.value
                        });

                        Primitives.Attribute(node, attribute.name, null);
                    }
                }
            }

            Array.from(node.childNodes).forEach
            (
                (child, index) => Template.#Compile(child, [...path, index], out)
            );
        }

        /** @name        #At
         *  @private
         *  @static
         *  @param       {Node} root Root node.
         *  @param       {readonly number[]} path Child-node path.
         *  @returns     {Node | null} Node at path or null.
         *  @description Resolve one dynamic binding path.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
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

        /** @name        #Apply
         *  @private
         *  @static
         *  @param       {Node} node Bound node.
         *  @param       {Binding} binding Binding metadata.
         *  @param       {Scope} scope Evaluation scope.
         *  @param       {Options} options Mount options.
         *  @returns     {void}
         *  @description Apply one dynamic fallback binding.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static #Apply
        (
            node     : Node,
            binding  : Binding,
            scope    : Scope,
            _options : Options
        ): void
        {
            const evaluate = Template.#Evaluate(binding.Expression, scope);

            switch(binding.Kind)
            {
                case 'text':
                {
                    Primitives.Content(node, binding.Expression.replace
                    (
                        /\{\{\s*([\s\S]+?)\s*\}\}/g,
                        (_, expression: string) =>
                            String(Template.#Evaluate(expression, scope) ?? '')
                    ));

                    break;
                }

                case 'attribute':
                {
                    if(node instanceof Element && binding.Name)
                    {
                        Compiled.Set(node, binding.Name, evaluate);
                    }

                    break;
                }

                case 'event':
                {
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

        /** @name        #Evaluate
         *  @private
         *  @static
         *  @param       {string} expression Dot-path expression.
         *  @param       {Scope} scope Evaluation scope.
         *  @returns     {unknown} Resolved value.
         *  @description Resolve the conservative dynamic fallback expression grammar.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static #Evaluate
        (
            expression : string,
            scope      : Scope
        ): unknown
        {
            const path = expression.trim().split('.');
            let value: unknown = scope;

            for(const key of path)
            {
                if(value === null || value === undefined)
                {
                    return undefined;
                }

                value = (value as Record<string, unknown>)[key];
            }

            return typeof value === 'function'
                ? (value as Function).call(scope)
                : value;
        }

        /** @name        Html
         *  @public
         *  @static
         *  @param       {TemplateStringsArray} strings Template literal strings.
         *  @param       {...unknown} values Dynamic substitutions.
         *  @returns     {Template} Dynamic Template.
         *  @description Runtime tagged-template fallback used when build-time compilation is not applicable.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
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

        /** @name        Css
         *  @public
         *  @static
         *  @param       {TemplateStringsArray} strings Template literal strings.
         *  @param       {...unknown} values Dynamic substitutions.
         *  @returns     {Template} Template wrapper over CSS source.
         *  @description CSS tagged-template companion sharing the Template dynamic fallback implementation.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Css
        (
            strings   : TemplateStringsArray,
            ...values : unknown[]
        ): Template
        {
            return Template.Html(strings, ...values);
        }
    }

    /** @name        Service
     *  @private
     *  @type        {Services.Service<ServiceContract>}
     *  @description Template service registration exposing the canonical dynamic Compile/Html/Css surface.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    const Service = new Services.Service<ServiceContract>
    (
        'template',
        {
            Compile(source: string): Template
            {
                return Template.Create(source);
            },

            Html(strings: TemplateStringsArray, ...values: unknown[]): Template
            {
                return Template.Html(strings, ...values);
            },

            Css(strings: TemplateStringsArray, ...values: unknown[]): Template
            {
                return Template.Css(strings, ...values);
            }
        }
    );
}

export default Templates;

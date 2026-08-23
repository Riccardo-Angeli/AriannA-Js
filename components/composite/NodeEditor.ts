/**
 * @module    components/composite/NodeEditor
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA NodeEditor component module.
 */

import { Component, Css, Reactivity, Templates } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/definitions/Interfaces.ts';

/** @name        html
 *  @public
 *  @type        {inferred}
 *  @description Compiler-visible AriannA Template tag used by imperative and behavior-only components.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
const html = Templates.Template.Html;

/** @namespace   NodeEditor
 *  @public
 *  @description Namespace containing NodeEditor contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace NodeEditor
{
    /** @namespace   Types
     *  @public
     *  @description Namespace containing Types contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Types
    {
        /** @name        Signal
         *  @public
         *  @type        {SchemaInterfaces.Reactivity.Signal<T>}
         *  @description Type alias for Signal.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Signal<T> = SchemaInterfaces.Reactivity.Signal<T>;

        /** @name        Rule
         *  @public
         *  @type        {Css.Rule}
         *  @description Type alias for Rule.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Rule = Css.Rule;

        /** @name        Stylesheet
         *  @public
         *  @type        {Css.Stylesheet}
         *  @description Type alias for Stylesheet.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Stylesheet = Css.Stylesheet;

        /** @name        WireStatus
         *  @public
         *  @type        {'connected-ok' | 'connected-warn' | 'connected-error'}
         *  @description Type alias for WireStatus.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type WireStatus = 'connected-ok' | 'connected-warn' | 'connected-error';

        /** @name        RunState
         *  @public
         *  @type        {'idle' | 'running' | 'paused'}
         *  @description Type alias for RunState.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type RunState = 'idle' | 'running' | 'paused';

        /** @name        TypeCheckFn
         *  @public
         *  @type        {(srcType: string, dstType: string) => NodeEditor.Types.WireStatus | null}
         *  @description Type alias for TypeCheckFn.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type TypeCheckFn = (srcType: string, dstType: string) => Types.WireStatus | null;
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   PortSpec
         *  @public
         *  @description PortSpec contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface PortSpec
        {
            /** @name        id
             *  @public
             *  @type        {string}
             *  @description Component member for id.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            id: string;

            /** @name        type
             *  @public
             *  @type        {string}
             *  @description Component member for type.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            type: string;

            /** @name        label
             *  @public
             *  @type        {string}
             *  @description Component member for label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            label?: string;
        }

        /** @interface   ParamSpec
         *  @public
         *  @description ParamSpec contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ParamSpec
        {
            /** @name        id
             *  @public
             *  @type        {string}
             *  @description Component member for id.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            id: string;

            /** @name        type
             *  @public
             *  @type        {'number' | 'string' | 'boolean' | 'enum'}
             *  @description Component member for type.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            type: 'number' | 'string' | 'boolean' | 'enum';

            /** @name        label
             *  @public
             *  @type        {string}
             *  @description Component member for label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            label?: string;

            /** @name        default
             *  @public
             *  @type        {unknown}
             *  @description Component member for default.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            default?: unknown;

            /** @name        min
             *  @public
             *  @type        {number}
             *  @description Component member for min.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            min?: number;

            /** @name        max
             *  @public
             *  @type        {number}
             *  @description Component member for max.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            max?: number;

            /** @name        options
             *  @public
             *  @type        {string[]}
             *  @description Component member for options.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            options?: string[];
        }

        /** @interface   NodeSchema
         *  @public
         *  @description NodeSchema contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface NodeSchema
        {
            /** @name        type
             *  @public
             *  @type        {string}
             *  @description Component member for type.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            type: string;

            /** @name        name
             *  @public
             *  @type        {string}
             *  @description Component member for name.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            name: string;

            /** @name        category
             *  @public
             *  @type        {string}
             *  @description Component member for category.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            category: string;

            /** @name        color
             *  @public
             *  @type        {string}
             *  @description Component member for color.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            color?: string;

            /** @name        icon
             *  @public
             *  @type        {string}
             *  @description Component member for icon.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            icon?: string;

            /** @name        inputs
             *  @public
             *  @type        {NodeEditor.Interfaces.PortSpec[]}
             *  @description Component member for inputs.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            inputs: Interfaces.PortSpec[];

            /** @name        outputs
             *  @public
             *  @type        {NodeEditor.Interfaces.PortSpec[]}
             *  @description Component member for outputs.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            outputs: Interfaces.PortSpec[];

            /** @name        params
             *  @public
             *  @type        {NodeEditor.Interfaces.ParamSpec[]}
             *  @description Component member for params.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            params?: Interfaces.ParamSpec[];

            /** @name        description
             *  @public
             *  @type        {string}
             *  @description Component member for description.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            description?: string;
        }

        /** @interface   NodeInstance
         *  @public
         *  @description NodeInstance contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface NodeInstance
        {
            /** @name        id
             *  @public
             *  @type        {string}
             *  @description Component member for id.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            id: string;

            /** @name        type
             *  @public
             *  @type        {string}
             *  @description Component member for type.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            type: string;

            /** @name        x
             *  @public
             *  @type        {number}
             *  @description Component member for x.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            x: number;

            /** @name        y
             *  @public
             *  @type        {number}
             *  @description Component member for y.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            y: number;

            /** @name        schema
             *  @public
             *  @type        {NodeEditor.Interfaces.NodeSchema}
             *  @description Component member for definitions.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            schema: Interfaces.NodeSchema;

            /** @name        params
             *  @public
             *  @type        {Record<string, unknown>}
             *  @description Component member for params.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            params?: Record<string, unknown>;
        }

        /** @interface   WireInstance
         *  @public
         *  @description WireInstance contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface WireInstance
        {
            /** @name        id
             *  @public
             *  @type        {string}
             *  @description Component member for id.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            id: string;

            /** @name        srcNodeId
             *  @public
             *  @type        {string}
             *  @description Component member for src Node Id.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            srcNodeId: string;

            /** @name        srcPortId
             *  @public
             *  @type        {string}
             *  @description Component member for src Port Id.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            srcPortId: string;

            /** @name        srcType
             *  @public
             *  @type        {string}
             *  @description Component member for src Type.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            srcType: string;

            /** @name        dstNodeId
             *  @public
             *  @type        {string}
             *  @description Component member for dst Node Id.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            dstNodeId: string;

            /** @name        dstPortId
             *  @public
             *  @type        {string}
             *  @description Component member for dst Port Id.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            dstPortId: string;

            /** @name        dstType
             *  @public
             *  @type        {string}
             *  @description Component member for dst Type.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            dstType: string;

            /** @name        status
             *  @public
             *  @type        {NodeEditor.Types.WireStatus}
             *  @description Component member for status.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            status: Types.WireStatus;
        }

        /** @interface   NodeEditorOptions
         *  @public
         *  @description NodeEditorOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface NodeEditorOptions
        {
            /** @name        schemas
             *  @public
             *  @type        {NodeEditor.Interfaces.NodeSchema[]}
             *  @description Component member for schemas.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            schemas?: Interfaces.NodeSchema[];

            /** @name        typeCheck
             *  @public
             *  @type        {NodeEditor.Types.TypeCheckFn}
             *  @description Component member for type Check.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            typeCheck?: Types.TypeCheckFn;
        }
    }
    /* Reactive.ts replaced Observables, and it is not a rename: the factory is `CreateSignal`, the
       members went PascalCase (`Get` / `Set`), and `CreateEffect` returns an Effect OBJECT where the old
       `effect` returned its own disposer — hence the wrapper. The type alias points at the CONTRACT and
       not at `Reactivity.Signal`, which is the richer class the module also exports: `CreateSignal`
       returns the contract, so aliasing the class yields "Type 'Signal<T>' is missing … Source, Mutate,
       Map, Effect" with the same name printed twice. */
    /** @name        signal
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned signal value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const signal = Reactivity.CreateSignal;

    /** @name        effect
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned effect value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const effect = (fn: () => void): (() => void) => {
        /** @name        e
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned e value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const e = Reactivity.CreateEffect(fn);
        return () => e.Stop();
    };

    /** @name        { Rule, Stylesheet }
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned { Rule, Stylesheet } value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const { Rule, Stylesheet } = Css;

    /** @name        SVG_NS
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned SVG_NS value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const SVG_NS = 'http://www.w3.org/2000/svg';

    /** @name        NODE_WIDTH
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned NODE_WIDTH value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const NODE_WIDTH = 180;

    /** @name        PORT_HEIGHT
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned PORT_HEIGHT value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const PORT_HEIGHT = 18;

    /** @class       NodeEditor
     *  @public
     *  @description AriannA NodeEditor component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-node-editor', {}, {
        Attributes: [],
    })
    export class NodeEditor extends HTMLElement
    {
        /** @name        template
         *  @public
         *  @type        {unknown}
         *  @description Shared compiler-promotable Template shell. The component keeps its existing imperative
         *               or behavior-only rendering logic while participating in the compiled Template fast path.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        template = html``;

        /** @name        schemas$
         *  @public
         *  @readonly
         *  @type        {NodeEditor.Types.Signal<NodeEditor.Interfaces.NodeSchema[]>}
         *  @description Component member for schemas$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly schemas$: Types.Signal<Interfaces.NodeSchema[]> = signal<Interfaces.NodeSchema[]>([]);

        /** @name        nodes$
         *  @public
         *  @readonly
         *  @type        {NodeEditor.Types.Signal<NodeEditor.Interfaces.NodeInstance[]>}
         *  @description Component member for nodes$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly nodes$: Types.Signal<Interfaces.NodeInstance[]> = signal<Interfaces.NodeInstance[]>([]);

        /** @name        wires$
         *  @public
         *  @readonly
         *  @type        {NodeEditor.Types.Signal<NodeEditor.Interfaces.WireInstance[]>}
         *  @description Component member for wires$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly wires$: Types.Signal<Interfaces.WireInstance[]> = signal<Interfaces.WireInstance[]>([]);

        /** @name        runState$
         *  @public
         *  @readonly
         *  @type        {NodeEditor.Types.Signal<NodeEditor.Types.RunState>}
         *  @description Component member for run State$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly runState$: Types.Signal<Types.RunState> = signal<Types.RunState>('idle' as Types.RunState);

        /** @name        #typeCheck
         *  @public
         *  @type        {NodeEditor.Types.TypeCheckFn}
         *  @description Component member for type Check.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #typeCheck: Types.TypeCheckFn = (srcType, dstType) => (srcType === dstType || srcType === 'any' || dstType === 'any') ? 'connected-ok' : 'connected-error';

        /** @name        #palette
         *  @public
         *  @type        {HTMLDivElement}
         *  @description Component member for palette.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #palette?: HTMLDivElement;

        /** @name        #canvas
         *  @public
         *  @type        {HTMLDivElement}
         *  @description Component member for canvas.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #canvas?: HTMLDivElement;

        /** @name        #svg
         *  @public
         *  @type        {SVGSVGElement}
         *  @description Component member for svg.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #svg?: SVGSVGElement;

        /** @name        #idCounter
         *  @public
         *  @type        {unknown}
         *  @description Component member for id Counter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #idCounter = 0;

        /** @name        constructor
         *  @public
         *  @type        {constructor}
         *  @description Constructs the component for constructor.
         *  @param       {NodeEditor.Interfaces.NodeEditorOptions} opts Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(opts: Interfaces.NodeEditorOptions = {})
        {
            super();
            if (opts.schemas)
                this.schemas$.Set(opts.schemas);
            if (opts.typeCheck)
                this.#typeCheck = opts.typeCheck;
        }

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(): void
        {
            /** @name        self
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned self value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const self = this as unknown as {
                /** @name        render
                 *  @public
                 *  @type        {HTMLElement}
                 *  @description Component member for render.
                 *  @returns     {HTMLElement} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                render(): HTMLElement;

                /** @name        fire
                 *  @public
                 *  @type        {void}
                 *  @description Component member for fire.
                 *  @param       {string} t Parameter.
                 *  @param       {CustomEventInit} init Parameter.
                 *  @returns     {void} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                fire(t: string, init?: CustomEventInit): void;

                /** @name        Sheet
                 *  @public
                 *  @type        {NodeEditor.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            };

            /** @name        root
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned root value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const root = self.render();
            if (root.querySelector('.ne-wrap'))
                return;

            /** @name        wrap
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned wrap value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const wrap = document.createElement('div');
            wrap.className = 'ne-wrap';
            // Palette
            /** @name        palette
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned palette value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const palette = document.createElement('div');
            palette.className = 'ne-palette';
            this.#palette = palette;
            // Canvas
            /** @name        canvas
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned canvas value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const canvas = document.createElement('div');
            canvas.className = 'ne-canvas';
            this.#canvas = canvas;

            /** @name        svg
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned svg value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const svg = document.createElementNS(SVG_NS, 'svg') as SVGSVGElement;
            svg.setAttribute('class', 'ne-svg');
            canvas.appendChild(svg);
            this.#svg = svg;
            wrap.append(palette, canvas);
            root.appendChild(wrap);
            // Render palette
            effect(() => this.#renderPalette());
            // Render nodes
            effect(() => { this.nodes$.Get(); this.#renderNodes(); this.#renderWires(); });
            // Render wires
            effect(() => { this.wires$.Get(); this.#renderWires(); });
            // Drop on canvas → spawn node
            canvas.addEventListener('dragover', e => e.preventDefault());
            canvas.addEventListener('drop', (e: DragEvent) => {
                e.preventDefault();

                /** @name        type
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned type value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const type = e.dataTransfer?.getData('arianna/node-definitions');
                if (!type)
                    return;

                /** @name        r
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned r value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const r = canvas.getBoundingClientRect();
                this.addNode(type, e.clientX - r.left, e.clientY - r.top);
            });
            self.Sheet = NodeEditor.DefaultSheet();
        }

        /** @name        #renderPalette
         *  @public
         *  @type        {void}
         *  @description Component member for render Palette.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #renderPalette(): void
        {
            /** @name        palette
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned palette value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const palette = this.#palette;
            if (!palette)
                return;
            palette.innerHTML = '';

            /** @name        schemas
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned schemas value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const schemas = this.schemas$.Get();
            // Group by category
            /** @name        groups
             *  @public
             *  @type        {Record<string, NodeEditor.Interfaces.NodeSchema[]>}
             *  @description Namespace-owned groups value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const groups: Record<string, Interfaces.NodeSchema[]> = {};
            for (const s of schemas)
            {
                (groups[s.category] ??= []).push(s);
            }
            for (const cat of Object.keys(groups))
            {
                /** @name        h
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned h value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const h = document.createElement('div');
                h.className = 'ne-pal-cat';
                h.textContent = cat;
                palette.appendChild(h);
                for (const s of groups[cat] ?? [])
                {
                    /** @name        it
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned it value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const it = document.createElement('div');
                    it.className = 'ne-pal-item';
                    it.draggable = true;
                    if (s.color)
                        it.style.borderLeftColor = s.color;
                    if (s.description)
                        it.title = s.description;

                    /** @name        icon
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned icon value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const icon = document.createElement('span');
                    icon.className = 'ne-pal-icon';
                    icon.textContent = s.icon ?? '';
                    if (s.color)
                        icon.style.background = s.color;

                    /** @name        name
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned name value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const name = document.createElement('span');
                    name.className = 'ne-pal-name';
                    name.textContent = s.name;
                    it.append(icon, name);
                    it.addEventListener('dragstart', (e: DragEvent) => {
                        e.dataTransfer?.setData('arianna/node-definitions', s.type);
                    });
                    palette.appendChild(it);
                }
            }
        }

        /** @name        #renderNodes
         *  @public
         *  @type        {void}
         *  @description Component member for render Nodes.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #renderNodes(): void
        {
            /** @name        canvas
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned canvas value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const canvas = this.#canvas;

            /** @name        svg
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned svg value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const svg = this.#svg;
            if (!canvas || !svg)
                return;
            Array.from(canvas.querySelectorAll('.ne-node')).forEach(n => n.remove());

            /** @name        self
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned self value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const self = this as unknown as {
                /** @name        fire
                 *  @public
                 *  @type        {void}
                 *  @description Component member for fire.
                 *  @param       {string} t Parameter.
                 *  @param       {CustomEventInit} init Parameter.
                 *  @returns     {void} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                fire(t: string, init?: CustomEventInit): void;
            };
            for (const n of this.nodes$.Peek())
            {
                /** @name        div
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned div value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const div = document.createElement('div');
                div.className = 'ne-node';
                div.style.left = n.x + 'px';
                div.style.top = n.y + 'px';
                div.dataset.nodeId = n.id;
                if (n.schema.color)
                    div.style.borderTopColor = n.schema.color;
                // Header
                /** @name        hdr
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned hdr value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const hdr = document.createElement('div');
                hdr.className = 'ne-node-hdr';
                if (n.schema.color)
                    hdr.style.background = n.schema.color;

                /** @name        icon
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned icon value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const icon = document.createElement('span');
                icon.className = 'ne-node-icon';
                icon.textContent = n.schema.icon ?? '';

                /** @name        name
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned name value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const name = document.createElement('span');
                name.className = 'ne-node-name';
                name.textContent = n.schema.name;

                /** @name        close
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned close value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const close = document.createElement('button');
                close.type = 'button';
                close.className = 'ne-node-close';
                close.textContent = '×';
                close.addEventListener('click', e => {
                    e.stopPropagation();
                    this.removeNode(n.id);
                });
                hdr.append(icon, name, close);
                // Body — inputs (left), outputs (right), params
                /** @name        body
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned body value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const body = document.createElement('div');
                body.className = 'ne-node-body';

                /** @name        ports
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned ports value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const ports = document.createElement('div');
                ports.className = 'ne-node-ports';

                /** @name        inCol
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned inCol value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const inCol = document.createElement('div');
                inCol.className = 'ne-node-col ne-node-col-in';
                for (const p of n.schema.inputs)
                {
                    /** @name        row
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned row value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const row = this.#buildPortRow(n, p, 'in');
                    inCol.appendChild(row);
                }

                /** @name        outCol
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned outCol value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const outCol = document.createElement('div');
                outCol.className = 'ne-node-col ne-node-col-out';
                for (const p of n.schema.outputs)
                {
                    /** @name        row
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned row value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const row = this.#buildPortRow(n, p, 'out');
                    outCol.appendChild(row);
                }
                ports.append(inCol, outCol);

                /** @name        params
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned params value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const params = document.createElement('div');
                params.className = 'ne-node-params';
                for (const sp of (n.schema.params ?? []))
                {
                    /** @name        row
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned row value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const row = this.#buildParamRow(n, sp);
                    params.appendChild(row);
                }
                body.append(ports, params);
                div.append(hdr, body);
                // Drag node
                /** @name        dragX
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned dragX value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                let dragX = 0, dragY = 0, origX = 0, origY = 0;
                hdr.addEventListener('pointerdown', (e: PointerEvent) => {
                    hdr.setPointerCapture(e.pointerId);
                    dragX = e.clientX;
                    dragY = e.clientY;
                    origX = n.x;
                    origY = n.y;
                });
                hdr.addEventListener('pointermove', (e: PointerEvent) => {
                    if (e.buttons === 0)
                        return;
                    n.x = Math.max(0, origX + (e.clientX - dragX));
                    n.y = Math.max(0, origY + (e.clientY - dragY));
                    div.style.left = n.x + 'px';
                    div.style.top = n.y + 'px';
                    this.#renderWires();
                });
                hdr.addEventListener('pointerup', (e: PointerEvent) => {
                    hdr.releasePointerCapture(e.pointerId);
                    self.fire('arianna:graph-change', { detail: { source: this }, bubbles: true });
                });
                canvas.appendChild(div);
            }
        }

        /** @name        #buildPortRow
         *  @public
         *  @type        {HTMLDivElement}
         *  @description Component member for build Port Row.
         *  @param       {NodeEditor.Interfaces.NodeInstance} node Parameter.
         *  @param       {NodeEditor.Interfaces.PortSpec} port Parameter.
         *  @param       {'in' | 'out'} side Parameter.
         *  @returns     {HTMLDivElement} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #buildPortRow(node: Interfaces.NodeInstance, port: Interfaces.PortSpec, side: 'in' | 'out'): HTMLDivElement
        {
            /** @name        row
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned row value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const row = document.createElement('div');
            row.className = 'ne-port-row ne-port-' + side;

            /** @name        dot
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned dot value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const dot = document.createElement('span');
            dot.className = 'ne-port-dot';
            dot.dataset.nodeId = node.id;
            dot.dataset.portId = port.id;
            dot.dataset.portSide = side;
            dot.dataset.portType = port.type;

            /** @name        lbl
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned lbl value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const lbl = document.createElement('span');
            lbl.className = 'ne-port-label';
            lbl.textContent = port.label ?? port.id;
            if (side === 'in')
                row.append(dot, lbl);
            else
                row.append(lbl, dot);
            // Wire creation: drag from out → in
            if (side === 'out')
            {
                dot.addEventListener('pointerdown', (e: PointerEvent) => {
                    e.stopPropagation();
                    this.#startWireDrag(node, port, e);
                });
            }
            return row;
        }

        /** @name        #buildParamRow
         *  @public
         *  @type        {HTMLDivElement}
         *  @description Component member for build Param Row.
         *  @param       {NodeEditor.Interfaces.NodeInstance} node Parameter.
         *  @param       {NodeEditor.Interfaces.ParamSpec} sp Parameter.
         *  @returns     {HTMLDivElement} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #buildParamRow(node: Interfaces.NodeInstance, sp: Interfaces.ParamSpec): HTMLDivElement
        {
            /** @name        row
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned row value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const row = document.createElement('div');
            row.className = 'ne-param-row';

            /** @name        lbl
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned lbl value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const lbl = document.createElement('label');
            lbl.className = 'ne-param-label';
            lbl.textContent = sp.label ?? sp.id;

            /** @name        input
             *  @public
             *  @type        {HTMLInputElement | HTMLSelectElement}
             *  @description Namespace-owned input value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let input: HTMLInputElement | HTMLSelectElement;
            node.params ??= {};

            /** @name        cur
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cur value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cur = node.params[sp.id] ?? sp.default;
            if (sp.type === 'enum' && sp.options)
            {
                input = document.createElement('select');
                for (const o of sp.options)
                {
                    /** @name        opt
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned opt value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const opt = document.createElement('option');
                    opt.value = o;
                    opt.textContent = o;
                    input.appendChild(opt);
                }
                input.value = String(cur ?? '');
            }
            else if (sp.type === 'boolean')
            {
                input = document.createElement('input');
                input.type = 'checkbox';
                (input as HTMLInputElement).checked = !!cur;
            }
            else if (sp.type === 'number')
            {
                input = document.createElement('input');
                input.type = 'number';
                if (sp.min != null)
                    (input as HTMLInputElement).min = String(sp.min);
                if (sp.max != null)
                    (input as HTMLInputElement).max = String(sp.max);
                input.value = String(cur ?? '');
            }
            else
            {
                input = document.createElement('input');
                input.type = 'text';
                input.value = String(cur ?? '');
            }
            input.className = 'ne-param-input';
            input.addEventListener('change', () => {
                /** @name        self
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned self value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const self = this as unknown as {
                    /** @name        fire
                     *  @public
                     *  @type        {void}
                     *  @description Component member for fire.
                     *  @param       {string} t Parameter.
                     *  @param       {CustomEventInit} init Parameter.
                     *  @returns     {void} Result.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    fire(t: string, init?: CustomEventInit): void;
                };

                /** @name        v
                 *  @public
                 *  @type        {unknown}
                 *  @description Namespace-owned v value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const v: unknown = sp.type === 'boolean' ? (input as HTMLInputElement).checked
                    : sp.type === 'number' ? parseFloat(input.value)
                        : input.value;
                node.params![sp.id] = v;
                self.fire('arianna:node-param-edit', { detail: { node, paramId: sp.id, value: v, source: this }, bubbles: true });
            });
            row.append(lbl, input);
            return row;
        }

        /** @name        #startWireDrag
         *  @public
         *  @type        {void}
         *  @description Component member for start Wire Drag.
         *  @param       {NodeEditor.Interfaces.NodeInstance} srcNode Parameter.
         *  @param       {NodeEditor.Interfaces.PortSpec} srcPort Parameter.
         *  @param       {PointerEvent} startEv Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #startWireDrag(srcNode: Interfaces.NodeInstance, srcPort: Interfaces.PortSpec, startEv: PointerEvent): void
        {
            /** @name        canvas
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned canvas value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const canvas = this.#canvas, svg = this.#svg;
            if (!canvas || !svg)
                return;

            /** @name        path
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned path value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const path = document.createElementNS(SVG_NS, 'path');
            path.setAttribute('class', 'ne-wire ne-wire-dragging');
            svg.appendChild(path);

            /** @name        r
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned r value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const r = canvas.getBoundingClientRect();

            /** @name        srcDot
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned srcDot value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const srcDot = canvas.querySelector<HTMLElement>(`.ne-port-dot[data-node-id="${srcNode.id}"][data-port-id="${srcPort.id}"][data-port-side="out"]`);

            /** @name        srcRect
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned srcRect value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const srcRect = srcDot?.getBoundingClientRect();
            if (!srcRect)
            {
                path.remove();
                return;
            }

            /** @name        sx
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sx value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sx = srcRect.left - r.left + srcRect.width / 2;

            /** @name        sy
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sy value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sy = srcRect.top - r.top + srcRect.height / 2;

            /** @name        onMove
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned onMove value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const onMove = (e: PointerEvent) => {
                /** @name        tx
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned tx value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const tx = e.clientX - r.left;

                /** @name        ty
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned ty value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const ty = e.clientY - r.top;
                path.setAttribute('d', this.#manhattan(sx, sy, tx, ty));
            };

            /** @name        onUp
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned onUp value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const onUp = (e: PointerEvent) => {
                window.removeEventListener('pointermove', onMove);
                window.removeEventListener('pointerup', onUp);
                path.remove();

                /** @name        tgt
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned tgt value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const tgt = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
                if (tgt?.classList.contains('ne-port-dot') && tgt.dataset.portSide === 'in')
                {
                    this.addWire(srcNode.id, srcPort.id, tgt.dataset.nodeId ?? '', tgt.dataset.portId ?? '');
                }
            };
            window.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
            onMove(startEv);
        }

        /** @name        #renderWires
         *  @public
         *  @type        {void}
         *  @description Component member for render Wires.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #renderWires(): void
        {
            /** @name        canvas
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned canvas value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const canvas = this.#canvas, svg = this.#svg;
            if (!canvas || !svg)
                return;
            Array.from(svg.querySelectorAll('.ne-wire:not(.ne-wire-dragging)')).forEach(w => w.remove());

            /** @name        r
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned r value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const r = canvas.getBoundingClientRect();
            for (const w of this.wires$.Peek())
            {
                /** @name        sDot
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned sDot value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const sDot = canvas.querySelector<HTMLElement>(`.ne-port-dot[data-node-id="${w.srcNodeId}"][data-port-id="${w.srcPortId}"][data-port-side="out"]`);

                /** @name        tDot
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned tDot value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const tDot = canvas.querySelector<HTMLElement>(`.ne-port-dot[data-node-id="${w.dstNodeId}"][data-port-id="${w.dstPortId}"][data-port-side="in"]`);
                if (!sDot || !tDot)
                    continue;

                /** @name        sR
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned sR value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const sR = sDot.getBoundingClientRect();

                /** @name        tR
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned tR value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const tR = tDot.getBoundingClientRect();

                /** @name        sx
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned sx value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const sx = sR.left - r.left + sR.width / 2;

                /** @name        sy
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned sy value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const sy = sR.top - r.top + sR.height / 2;

                /** @name        tx
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned tx value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const tx = tR.left - r.left + tR.width / 2;

                /** @name        ty
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned ty value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const ty = tR.top - r.top + tR.height / 2;

                /** @name        path
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned path value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const path = document.createElementNS(SVG_NS, 'path');
                path.setAttribute('d', this.#manhattan(sx, sy, tx, ty));
                path.setAttribute('class', 'ne-wire ne-wire-' + w.status);
                path.addEventListener('dblclick', () => this.removeWire(w.id));
                svg.appendChild(path);
            }
        }

        /** @name        #manhattan
         *  @public
         *  @type        {string}
         *  @description Component member for manhattan.
         *  @param       {number} sx Parameter.
         *  @param       {number} sy Parameter.
         *  @param       {number} tx Parameter.
         *  @param       {number} ty Parameter.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #manhattan(sx: number, sy: number, tx: number, ty: number): string
        {
            /** @name        dx
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned dx value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const dx = tx - sx;

            /** @name        mx
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned mx value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const mx = sx + dx * 0.5;
            return `M ${sx} ${sy} L ${mx} ${sy} L ${mx} ${ty} L ${tx} ${ty}`;
        }
        // ── Public API ────────────────────────────────────────────────────────
        /** @name        setSchemas
         *  @public
         *  @type        {this}
         *  @description Component member for set Schemas.
         *  @param       {NodeEditor.Interfaces.NodeSchema[]} s Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setSchemas(s: Interfaces.NodeSchema[]): this { this.schemas$.Set(s); return this; }

        /** @name        addNode
         *  @public
         *  @type        {NodeEditor.Interfaces.NodeInstance}
         *  @description Component member for add Node.
         *  @param       {string} type Parameter.
         *  @param       {number} x Parameter.
         *  @param       {number} y Parameter.
         *  @param       {string} id Parameter.
         *  @returns     {NodeEditor.Interfaces.NodeInstance} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        addNode(type: string, x: number, y: number, id?: string): Interfaces.NodeInstance
        {
            /** @name        schema
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned definitions value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const schema = this.schemas$.Peek().find((s: any) => s.type === type);
            if (!schema)
                throw new Error(`Unknown node schema: ${type}`);

            /** @name        node
             *  @public
             *  @type        {NodeEditor.Interfaces.NodeInstance}
             *  @description Namespace-owned node value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const node: Interfaces.NodeInstance = {
                id: id ?? this.#nextId('n'),
                type,
                x, y,
                schema,
                params: {},
            };
            // Defaults
            for (const sp of (schema.params ?? []))
            {
                if (sp.default != null)
                    node.params![sp.id] = sp.default;
            }
            this.nodes$.Set([...this.nodes$.Peek(), node]);

            /** @name        self
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned self value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const self = this as unknown as {
                /** @name        fire
                 *  @public
                 *  @type        {void}
                 *  @description Component member for fire.
                 *  @param       {string} t Parameter.
                 *  @param       {CustomEventInit} init Parameter.
                 *  @returns     {void} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                fire(t: string, init?: CustomEventInit): void;
            };
            self.fire('arianna:node-add', { detail: { node, source: this }, bubbles: true });
            self.fire('arianna:graph-change', { detail: { source: this }, bubbles: true });
            return node;
        }

        /** @name        removeNode
         *  @public
         *  @type        {void}
         *  @description Component member for remove Node.
         *  @param       {string} id Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        removeNode(id: string): void
        {
            /** @name        node
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned node value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const node = this.nodes$.Peek().find((n: any) => n.id === id);
            if (!node)
                return;
            // Remove dependent wires
            /** @name        remainingWires
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned remainingWires value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const remainingWires = this.wires$.Peek().filter((w: any) => w.srcNodeId !== id && w.dstNodeId !== id);
            this.wires$.Set(remainingWires);
            this.nodes$.Set(this.nodes$.Peek().filter((n: any) => n.id !== id));

            /** @name        self
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned self value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const self = this as unknown as {
                /** @name        fire
                 *  @public
                 *  @type        {void}
                 *  @description Component member for fire.
                 *  @param       {string} t Parameter.
                 *  @param       {CustomEventInit} init Parameter.
                 *  @returns     {void} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                fire(t: string, init?: CustomEventInit): void;
            };
            self.fire('arianna:node-remove', { detail: { node, source: this }, bubbles: true });
            self.fire('arianna:graph-change', { detail: { source: this }, bubbles: true });
        }

        /** @name        addWire
         *  @public
         *  @type        {NodeEditor.Interfaces.WireInstance | null}
         *  @description Component member for add Wire.
         *  @param       {string} srcNodeId Parameter.
         *  @param       {string} srcPortId Parameter.
         *  @param       {string} dstNodeId Parameter.
         *  @param       {string} dstPortId Parameter.
         *  @returns     {NodeEditor.Interfaces.WireInstance | null} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        addWire(srcNodeId: string, srcPortId: string, dstNodeId: string, dstPortId: string): Interfaces.WireInstance | null
        {
            /** @name        src
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned src value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const src = this.nodes$.Peek().find((n: any) => n.id === srcNodeId);

            /** @name        dst
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned dst value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const dst = this.nodes$.Peek().find((n: any) => n.id === dstNodeId);
            if (!src || !dst)
                return null;

            /** @name        sPort
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sPort value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sPort = src.schema.outputs.find((p: any) => p.id === srcPortId);

            /** @name        dPort
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned dPort value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const dPort = dst.schema.inputs.find((p: any) => p.id === dstPortId);
            if (!sPort || !dPort)
                return null;

            /** @name        status
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned status value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const status = this.#typeCheck(sPort.type, dPort.type) ?? 'connected-error';
            // Disconnect any existing wire on the destination port (single-in semantics)
            /** @name        existing
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned existing value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const existing = this.wires$.Peek().filter((w: any) => !(w.dstNodeId === dstNodeId && w.dstPortId === dstPortId));

            /** @name        wire
             *  @public
             *  @type        {NodeEditor.Interfaces.WireInstance}
             *  @description Namespace-owned wire value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const wire: Interfaces.WireInstance = {
                id: this.#nextId('w'),
                srcNodeId, srcPortId, srcType: sPort.type,
                dstNodeId, dstPortId, dstType: dPort.type,
                status,
            };
            this.wires$.Set([...existing, wire]);

            /** @name        self
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned self value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const self = this as unknown as {
                /** @name        fire
                 *  @public
                 *  @type        {void}
                 *  @description Component member for fire.
                 *  @param       {string} t Parameter.
                 *  @param       {CustomEventInit} init Parameter.
                 *  @returns     {void} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                fire(t: string, init?: CustomEventInit): void;
            };
            self.fire('arianna:wire-add', { detail: { wire, source: this }, bubbles: true });
            self.fire('arianna:graph-change', { detail: { source: this }, bubbles: true });
            return wire;
        }

        /** @name        removeWire
         *  @public
         *  @type        {void}
         *  @description Component member for remove Wire.
         *  @param       {string} id Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        removeWire(id: string): void
        {
            /** @name        w
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned w value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const w = this.wires$.Peek().find((x: any) => x.id === id);
            if (!w)
                return;
            this.wires$.Set(this.wires$.Peek().filter((x: any) => x.id !== id));

            /** @name        self
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned self value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const self = this as unknown as {
                /** @name        fire
                 *  @public
                 *  @type        {void}
                 *  @description Component member for fire.
                 *  @param       {string} t Parameter.
                 *  @param       {CustomEventInit} init Parameter.
                 *  @returns     {void} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                fire(t: string, init?: CustomEventInit): void;
            };
            self.fire('arianna:wire-remove', { detail: { wire: w, source: this }, bubbles: true });
            self.fire('arianna:graph-change', { detail: { source: this }, bubbles: true });
        }

        /** @name        setRunState
         *  @public
         *  @type        {this}
         *  @description Component member for set Run State.
         *  @param       {NodeEditor.Types.RunState} s Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setRunState(s: Types.RunState): this
        {
            this.runState$.Set(s);

            /** @name        self
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned self value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const self = this as unknown as {
                /** @name        fire
                 *  @public
                 *  @type        {void}
                 *  @description Component member for fire.
                 *  @param       {string} t Parameter.
                 *  @param       {CustomEventInit} init Parameter.
                 *  @returns     {void} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                fire(t: string, init?: CustomEventInit): void;
            };
            self.fire('arianna:run-state', { detail: { state: s, source: this }, bubbles: true });
            return this;
        }

        /** Export graph as JSON. */
        export():
        {
            /** @name        nodes
             *  @public
             *  @type        {NodeEditor.Interfaces.NodeInstance[]}
             *  @description Component member for nodes.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            nodes: Interfaces.NodeInstance[];

            /** @name        wires
             *  @public
             *  @type        {NodeEditor.Interfaces.WireInstance[]}
             *  @description Component member for wires.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            wires: Interfaces.WireInstance[];
        } {
            return { nodes: this.nodes$.Peek(), wires: this.wires$.Peek() };
        }

        /** Load graph from JSON (schemas must already be set). */
        import(g: {
            /** @name        nodes
             *  @public
             *  @type        {NodeEditor.Interfaces.NodeInstance[]}
             *  @description Component member for nodes.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            nodes: Interfaces.NodeInstance[];

            /** @name        wires
             *  @public
             *  @type        {NodeEditor.Interfaces.WireInstance[]}
             *  @description Component member for wires.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            wires: Interfaces.WireInstance[];
        }): this {
            this.nodes$.Set(g.nodes);
            this.wires$.Set(g.wires);

            /** @name        self
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned self value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const self = this as unknown as {
                /** @name        fire
                 *  @public
                 *  @type        {void}
                 *  @description Component member for fire.
                 *  @param       {string} t Parameter.
                 *  @param       {CustomEventInit} init Parameter.
                 *  @returns     {void} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                fire(t: string, init?: CustomEventInit): void;
            };
            self.fire('arianna:graph-change', { detail: { source: this }, bubbles: true });
            return this;
        }

        /** Override the wire compatibility checker. */
        setTypeCheck(fn: Types.TypeCheckFn): this { this.#typeCheck = fn; return this; }

        /** @name        #nextId
         *  @public
         *  @type        {string}
         *  @description Component member for next Id.
         *  @param       {string} prefix Parameter.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #nextId(prefix: string): string { return `${prefix}-${++this.#idCounter}-${Date.now().toString(36)}`; }

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {NodeEditor.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {NodeEditor.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    background: 'var(--ar-bg, #0d0d0d)',
                    border: '1px solid var(--ar-border, #2a2a2a)',
                    borderRadius: 'var(--ar-radius, 5px)',
                    color: 'var(--ar-text, #e0e0e0)',
                    display: 'block',
                    font: 'var(--ar-font-size, 13px) var(--ar-font, ui-monospace, monospace)',
                    height: '480px',
                    overflow: 'hidden',
                    position: 'relative',
                }),
                new Rule(':host .ne-wrap', {
                    display: 'grid',
                    gridTemplateColumns: '180px 1fr',
                    height: '100%',
                }),
                new Rule(':host .ne-palette', {
                    background: 'var(--ar-bg2, #161616)',
                    borderRight: '1px solid var(--ar-border, #2a2a2a)',
                    overflow: 'auto',
                    padding: '6px',
                }),
                new Rule(':host .ne-pal-cat', {
                    color: 'var(--ar-muted, #888)',
                    fontSize: '0.66rem',
                    letterSpacing: '0.1em',
                    marginBottom: '4px',
                    marginTop: '8px',
                    textTransform: 'uppercase',
                }),
                new Rule(':host .ne-pal-item', {
                    alignItems: 'center',
                    background: 'var(--ar-bg3, #1e1e1e)',
                    border: '1px solid var(--ar-border, #2a2a2a)',
                    borderLeft: '3px solid var(--ar-muted, #888)',
                    borderRadius: 'var(--ar-radius-sm, 3px)',
                    cursor: 'grab',
                    display: 'flex',
                    fontSize: '0.74rem',
                    gap: '6px',
                    marginBottom: '4px',
                    padding: '5px 6px',
                }),
                new Rule(':host .ne-pal-icon', {
                    alignItems: 'center',
                    background: 'var(--ar-muted, #888)',
                    borderRadius: '2px',
                    color: '#000',
                    display: 'inline-flex',
                    fontSize: '0.74rem',
                    height: '18px',
                    justifyContent: 'center',
                    width: '18px',
                }),
                new Rule(':host .ne-canvas', {
                    background: `radial-gradient(circle, var(--ar-border, #2a2a2a) 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                    overflow: 'auto',
                    position: 'relative',
                }),
                new Rule(':host .ne-svg', {
                    height: '100%',
                    left: '0',
                    pointerEvents: 'none',
                    position: 'absolute',
                    top: '0',
                    width: '100%',
                }),
                new Rule(':host .ne-node', {
                    background: 'var(--ar-bg2, #161616)',
                    border: '1px solid var(--ar-border, #2a2a2a)',
                    borderRadius: 'var(--ar-radius, 5px)',
                    borderTop: '3px solid var(--ar-primary, #7eb8f7)',
                    boxShadow: 'var(--ar-shadow, 0 2px 8px rgba(0,0,0,.4))',
                    minWidth: NODE_WIDTH + 'px',
                    position: 'absolute',
                }),
                new Rule(':host .ne-node-hdr', {
                    alignItems: 'center',
                    background: 'var(--ar-primary, #7eb8f7)',
                    color: '#000',
                    cursor: 'move',
                    display: 'flex',
                    gap: '6px',
                    padding: '4px 8px',
                    userSelect: 'none',
                }),
                new Rule(':host .ne-node-icon', { fontSize: '0.85rem' }),
                new Rule(':host .ne-node-name', {
                    flex: '1',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                }),
                new Rule(':host .ne-node-close', {
                    background: 'transparent',
                    border: '0',
                    borderRadius: '2px',
                    color: '#000',
                    cursor: 'pointer',
                    font: 'inherit',
                    fontSize: '0.95rem',
                    lineHeight: '1',
                    padding: '0 4px',
                }),
                new Rule(':host .ne-node-close:hover', { background: 'rgba(0,0,0,0.15)' }),
                new Rule(':host .ne-node-body', { padding: '6px' }),
                new Rule(':host .ne-node-ports', {
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                }),
                new Rule(':host .ne-node-col', { display: 'flex', flexDirection: 'column', gap: '2px' }),
                new Rule(':host .ne-node-col-out', { alignItems: 'flex-end' }),
                new Rule(':host .ne-port-row', {
                    alignItems: 'center',
                    display: 'flex',
                    fontSize: '0.72rem',
                    gap: '4px',
                    height: PORT_HEIGHT + 'px',
                }),
                new Rule(':host .ne-port-out', { justifyContent: 'flex-end' }),
                new Rule(':host .ne-port-dot', {
                    background: 'var(--ar-bg3, #1e1e1e)',
                    border: '2px solid var(--ar-primary, #7eb8f7)',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'inline-block',
                    height: '10px',
                    width: '10px',
                }),
                new Rule(':host .ne-port-label', { color: 'var(--ar-muted, #aaa)' }),
                new Rule(':host .ne-node-params', { display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }),
                new Rule(':host .ne-param-row', { display: 'flex', flexDirection: 'column', gap: '2px' }),
                new Rule(':host .ne-param-label', { color: 'var(--ar-muted, #888)', fontSize: '0.65rem' }),
                new Rule(':host .ne-param-input', {
                    background: 'var(--ar-bg3, #1e1e1e)',
                    border: '1px solid var(--ar-border, #2a2a2a)',
                    borderRadius: 'var(--ar-radius-sm, 3px)',
                    color: 'var(--ar-text, #e0e0e0)',
                    font: 'inherit',
                    fontSize: '0.72rem',
                    padding: '2px 4px',
                }),
                new Rule(':host .ne-wire', {
                    fill: 'none',
                    pointerEvents: 'stroke',
                    strokeWidth: '2',
                }),
                new Rule(':host .ne-wire-connected-ok', { stroke: 'var(--ar-success, #4caf50)' }),
                new Rule(':host .ne-wire-connected-warn', { stroke: 'var(--ar-warning, #ff9800)' }),
                new Rule(':host .ne-wire-connected-error', { stroke: 'var(--ar-danger,  #f44336)' }),
                new Rule(':host .ne-wire-dragging', {
                    stroke: 'var(--ar-primary, #7eb8f7)',
                    strokeDasharray: '4 3',
                }),
            ]);
        }
    }
}
export default NodeEditor;

export type NodeEditorOptions = NodeEditor.Interfaces.NodeEditorOptions;
export type NodeSchema = NodeEditor.Interfaces.NodeSchema;
export type NodeInstance = NodeEditor.Interfaces.NodeInstance;
export type WireInstance = NodeEditor.Interfaces.WireInstance;
export type PortSpec = NodeEditor.Interfaces.PortSpec;
export type ParamSpec = NodeEditor.Interfaces.ParamSpec;
export type RunState = NodeEditor.Types.RunState;
export type WireStatus = NodeEditor.Types.WireStatus;
export type TypeCheckFn = NodeEditor.Types.TypeCheckFn;

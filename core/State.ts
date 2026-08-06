/**
 * @module    core/State
 * @author    Riccardo Angeli
 * @version   3.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA State runtime. A State may own a primitive value, an object, an array, or the complete
 *              JSON-compatible application graph. It is available through both `States.State.Create(value)` and
 *              `new States.State(value)`. The runtime provides fluent mutation, named snapshots, history,
 *              JSON/XML serialisation, import/export and a structural Worker bridge without publishing globals.
 */

import type { Types as SchemaTypes }           from './schema/Types.ts';
import type { Interfaces as SchemaInterfaces } from './schema/Interfaces.ts';

import { Core }       from './Core.ts';
import { Reactivity } from './Reactive.ts';

export namespace States
{
    export type Format          = SchemaTypes.State.Format;
    export type HistoryKind     = SchemaTypes.State.HistoryKind;
    export type Options         = SchemaInterfaces.State.Options;
    export type HistoryEntry<T> = SchemaInterfaces.State.HistoryEntry<T>;
    export type Snapshot<T>     = SchemaInterfaces.State.Snapshot<T>;
    export type Serializer      = SchemaInterfaces.State.Serializer;
    export type WorkerBridge    = SchemaInterfaces.State.WorkerBridge;
    export type ChangeEvent<T>  = SchemaInterfaces.State.ChangeEvent<T>;
    export type ServiceContract = SchemaInterfaces.State.Service;

    /** @class       JsonSerializer
     *  @public
     *  @implements  {Serializer}
     *  @description Canonical JSON serializer for State values and snapshots. Values are encoded with the native
     *               JSON data model; non-JSON values must be normalised by the caller before serialisation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class JsonSerializer implements Serializer
    {
        /** @name        Format
         *  @public
         *  @readonly
         *  @type        {Format}
         *  @description Serializer format identifier.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly Format: Format = 'json';

        /** @name        Serialize
         *  @public
         *  @param       {unknown} value Value to serialise.
         *  @param       {boolean} [pretty=false] Whether to indent the output.
         *  @returns     {string} JSON text.
         *  @description Serialise a value with native JSON semantics.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Serialize
        (
            value  : unknown,
            pretty : boolean = false
        ): string
        {
            return JSON.stringify(value, null, pretty ? 4 : 0);
        }

        /** @name        Deserialize
         *  @public
         *  @template    T
         *  @param       {string} source JSON text.
         *  @returns     {T} Parsed value.
         *  @description Parse JSON text into the requested value type.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Deserialize<T>(source: string): T
        {
            return JSON.parse(source) as T;
        }
    }

    /** @class       XmlSerializer
     *  @public
     *  @implements  {Serializer}
     *  @description Deterministic XML serializer for JSON-compatible State values. Objects become named child
     *               elements, arrays become repeated `Item` elements, and primitives are escaped text nodes.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class XmlSerializer implements Serializer
    {
        /** @name        Format
         *  @public
         *  @readonly
         *  @type        {Format}
         *  @description Serializer format identifier.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly Format: Format = 'xml';

        /** @name        Serialize
         *  @public
         *  @param       {unknown} value Value to serialise.
         *  @param       {boolean} [pretty=false] Whether to indent the output.
         *  @returns     {string} XML text.
         *  @description Serialise a JSON-compatible graph below a canonical `State` root.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Serialize
        (
            value  : unknown,
            pretty : boolean = false
        ): string
        {
            const body = XmlSerializer.#Encode('Value', value, pretty, 1);
            const gap  = pretty ? '\n' : '';

            return `<?xml version="1.0" encoding="UTF-8"?>${gap}<State>${gap}${body}${gap}</State>`;
        }

        /** @name        Deserialize
         *  @public
         *  @template    T
         *  @param       {string} source XML text.
         *  @returns     {T} Parsed value.
         *  @description Parse XML produced by this serializer. DOMParser is required in the current realm.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Deserialize<T>(source: string): T
        {
            if(typeof DOMParser === 'undefined')
            {
                throw new Error
                (
                    '[arianna] XML deserialisation requires DOMParser in the current runtime.'
                );
            }

            const document =
                new DOMParser().parseFromString(source, 'application/xml');

            const error =
                document.querySelector('parsererror');

            if(error)
            {
                throw new SyntaxError(error.textContent ?? 'Invalid XML State document.');
            }

            const value =
                document.documentElement.firstElementChild;

            return XmlSerializer.#Decode(value) as T;
        }

        /** @name        #Encode
         *  @private
         *  @static
         *  @param       {string} name Element name.
         *  @param       {unknown} value Value to encode.
         *  @param       {boolean} pretty Whether indentation is enabled.
         *  @param       {number} depth Current indentation depth.
         *  @returns     {string} Encoded XML fragment.
         *  @description Recursively encode primitives, arrays and objects.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static #Encode
        (
            name   : string,
            value  : unknown,
            pretty : boolean,
            depth  : number
        ): string
        {
            const pad   = pretty ? '    '.repeat(depth) : '';
            const child = pretty ? '\n' : '';
            const close = pretty ? `\n${pad}` : '';

            if(value === null)
            {
                return `${pad}<${name} Type="null"/>`;
            }

            if(Array.isArray(value))
            {
                const items =
                    value
                        .map(item => XmlSerializer.#Encode('Item', item, pretty, depth + 1))
                        .join(child);

                return `${pad}<${name} Type="array">${child}${items}${close}</${name}>`;
            }

            if(typeof value === 'object')
            {
                const entries =
                    Object.entries(value as Record<string, unknown>)
                        .map
                        (
                            ([key, item]) =>
                                XmlSerializer.#Encode
                                (
                                    XmlSerializer.#Name(key),
                                    item,
                                    pretty,
                                    depth + 1
                                )
                        )
                        .join(child);

                return `${pad}<${name} Type="object">${child}${entries}${close}</${name}>`;
            }

            const type =
                typeof value;

            return `${pad}<${name} Type="${type}">${XmlSerializer.#Escape(String(value))}</${name}>`;
        }

        /** @name        #Decode
         *  @private
         *  @static
         *  @param       {Element | null} element XML value element.
         *  @returns     {unknown} Decoded value.
         *  @description Recursively decode XML generated by #Encode.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static #Decode(element: Element | null): unknown
        {
            if(!element)
            {
                return undefined;
            }

            const type =
                element.getAttribute('Type');

            switch(type)
            {
                case 'null':
                    return null;

                case 'array':
                    return Array.from(element.children).map(XmlSerializer.#Decode);

                case 'object':
                {
                    const object: Record<string, unknown> = {};

                    for(const child of Array.from(element.children))
                    {
                        object[child.tagName] = XmlSerializer.#Decode(child);
                    }

                    return object;
                }

                case 'boolean':
                    return element.textContent === 'true';

                case 'number':
                    return Number(element.textContent);

                case 'undefined':
                    return undefined;

                default:
                    return element.textContent ?? '';
            }
        }

        /** @name        #Escape
         *  @private
         *  @static
         *  @param       {string} value Text to escape.
         *  @returns     {string} XML-safe text.
         *  @description Escape the five XML-sensitive characters.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static #Escape(value: string): string
        {
            return value
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');
        }

        /** @name        #Name
         *  @private
         *  @static
         *  @param       {string} value Object key.
         *  @returns     {string} XML-compatible element name.
         *  @description Preserve readable keys while replacing characters that cannot appear in an XML name.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static #Name(value: string): string
        {
            const safe =
                value.replace(/[^A-Za-z0-9_.-]/g, '_');

            return /^[A-Za-z_]/.test(safe)
                ? safe
                : `_${safe}`;
        }
    }

    /** @class       State
     *  @public
     *  @template    T
     *  @description Reactive State for any value, from one primitive to a complete application graph. A State
     *               owns one canonical Signal, named snapshots, immutable history entries and serializers.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class State<T = unknown> extends EventTarget
    {
        /** @name        #Serializers
         *  @private
         *  @static
         *  @type        {Map<Format, Serializer>}
         *  @description Canonical serializer registry shared by every State.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static readonly #Serializers =
            new Map<Format, Serializer>
            (
                [
                    ['json', new JsonSerializer()],
                    ['xml',  new XmlSerializer()]
                ]
            );

        /** @name        #signal
         *  @private
         *  @type        {Reactivity.Signal<T>}
         *  @description Canonical reactive storage for the current State value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly #signal: Reactivity.Signal<T>;

        /** @name        #snapshots
         *  @private
         *  @type        {Map<string, Snapshot<T>>}
         *  @description Named immutable snapshots.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly #snapshots =
            new Map<string, Snapshot<T>>();

        /** @name        #history
         *  @private
         *  @type        {HistoryEntry<T>[]}
         *  @description Ordered State mutation history.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly #history: HistoryEntry<T>[] = [];

        /** @name        #name
         *  @private
         *  @type        {string}
         *  @description Human-readable State name used by events and Worker messages.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly #name: string;

        /** @name        #historyLimit
         *  @private
         *  @type        {number}
         *  @description Maximum retained history entries; zero disables retention.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly #historyLimit: number;

        /** @name        constructor
         *  @public
         *  @param       {T} source Initial State value.
         *  @param       {Options} [options] State configuration.
         *  @description Build a State from any value. Objects and arrays are cloned at snapshot boundaries, while
         *               the live current value remains exactly the value held by the Signal.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor
        (
            source   : T,
            options? : Options
        )
        {
            super();

            this.#name         = options?.Name ?? 'State';
            this.#historyLimit = Math.max(0, options?.HistoryLimit ?? 1_000);
            this.#signal       = new Reactivity.Signal<T>(source);

            this.#Record('create', undefined, source);
        }

        /** @name        Name
         *  @public
         *  @readonly
         *  @type        {string}
         *  @description Human-readable State name.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get Name(): string
        {
            return this.#name;
        }

        /** @name        Value
         *  @public
         *  @type        {T}
         *  @description Current reactive State value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get Value(): T
        {
            return this.#signal.Value;
        }

        set Value(value: T)
        {
            this.Set(value);
        }

        /** @name        Signal
         *  @public
         *  @readonly
         *  @type        {Reactivity.Signal<T>}
         *  @description Canonical Signal owned by this State.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get Signal(): Reactivity.Signal<T>
        {
            return this.#signal;
        }

        /** @name        History
         *  @public
         *  @readonly
         *  @type        {readonly HistoryEntry<T>[]}
         *  @description Immutable view of the ordered mutation history.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get History(): readonly HistoryEntry<T>[]
        {
            return this.#history;
        }

        /** @name        Snapshots
         *  @public
         *  @readonly
         *  @type        {ReadonlyMap<string, Snapshot<T>>}
         *  @description Immutable view of named snapshots.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get Snapshots(): ReadonlyMap<string, Snapshot<T>>
        {
            return this.#snapshots;
        }

        /** @name        Create
         *  @public
         *  @static
         *  @template    T
         *  @param       {T} source Initial State value.
         *  @param       {Options} [options] State configuration.
         *  @returns     {State<T>} A new State.
         *  @description Static factory equivalent of `new States.State(source, options)`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Create<T>
        (
            source   : T,
            options? : Options
        ): State<T>
        {
            return new State<T>(source, options);
        }

        /** @name        RegisterSerializer
         *  @public
         *  @static
         *  @param       {Serializer} serializer Serializer implementation.
         *  @returns     {typeof State} State constructor.
         *  @description Register or replace a serializer by format.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static RegisterSerializer(serializer: Serializer): typeof State
        {
            State.#Serializers.set(serializer.Format, serializer);

            return State;
        }

        /** @name        Get
         *  @public
         *  @returns     {T} Current State value.
         *  @description Read the current value and participate in Reactivity tracking.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Get(): T
        {
            return this.#signal.Get();
        }

        /** @name        Peek
         *  @public
         *  @returns     {T} Current State value.
         *  @description Read the current value without Reactivity tracking.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Peek(): T
        {
            return this.#signal.Peek();
        }

        /** @name        Set
         *  @public
         *  @param       {T | ((previous: T) => T)} value New value or updater.
         *  @returns     {State<T>} This State.
         *  @description Replace the current value and emit one canonical State change event.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Set(value: T | ((previous: T) => T)): this
        {
            const previous =
                this.#signal.Peek();

            const next =
                typeof value === 'function'
                    ? (value as (previous: T) => T)(previous)
                    : value;

            if(Object.is(previous, next))
            {
                return this;
            }

            this.#signal.Set(next);
            this.#Record('set', previous, next);
            this.#Emit(previous, next, 'set');

            return this;
        }

        /** @name        Update
         *  @public
         *  @param       {(value: T) => T | void} updater State updater.
         *  @returns     {State<T>} This State.
         *  @description Update primitives immutably or mutate object/array values in place. In-place mutations
         *               call Signal.Touch so dependent Effects still rerun.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Update(updater: (value: T) => T | void): this
        {
            const previous =
                State.#Clone(this.#signal.Peek());

            const current =
                this.#signal.Peek();

            const result =
                updater(current);

            if(result === undefined)
            {
                this.#signal.Touch();
                this.#Record('update', previous, current);
                this.#Emit(previous, current, 'update');

                return this;
            }

            return this.Set(result as T);
        }

        /** @name        Patch
         *  @public
         *  @param       {Partial<T>} patch Partial object patch.
         *  @returns     {State<T>} This State.
         *  @description Merge a partial patch into an object State. Primitive and null States are rejected.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Patch(patch: Partial<T>): this
        {
            const current =
                this.#signal.Peek();

            if
            (
                current === null ||
                typeof current !== 'object' ||
                Array.isArray(current)
            )
            {
                throw new TypeError
                (
                    '[arianna] State.Patch() requires a non-array object value.'
                );
            }

            return this.Update
            (
                value =>
                {
                    Object.assign
                    (
                        value as object,
                        patch
                    );
                }
            );
        }

        /** @name        Snapshot
         *  @public
         *  @param       {string} name Snapshot name.
         *  @returns     {State<T>} This State.
         *  @description Capture the current value under a stable name.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Snapshot(name: string): this
        {
            this.#snapshots.set
            (
                name,
                {
                    Name      : name,
                    Value     : State.#Clone(this.#signal.Peek()),
                    Timestamp : Date.now()
                }
            );

            return this;
        }

        /** @name        Restore
         *  @public
         *  @param       {string} name Snapshot name.
         *  @returns     {State<T>} This State.
         *  @description Restore a named snapshot.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Restore(name: string): this
        {
            const snapshot =
                this.#snapshots.get(name);

            if(!snapshot)
            {
                throw new Error
                (
                    `[arianna] Unknown State snapshot '${name}'.`
                );
            }

            const previous =
                this.#signal.Peek();

            const next =
                State.#Clone(snapshot.Value);

            this.#signal.Set(next);
            this.#Record('restore', previous, next, name);
            this.#Emit(previous, next, 'restore', name);

            return this;
        }

        /** @name        RemoveSnapshot
         *  @public
         *  @param       {string} name Snapshot name.
         *  @returns     {State<T>} This State.
         *  @description Remove a named snapshot.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        RemoveSnapshot(name: string): this
        {
            this.#snapshots.delete(name);

            return this;
        }

        /** @name        Serialize
         *  @public
         *  @param       {Format} [format='json'] Output format.
         *  @param       {boolean} [pretty=false] Whether to indent output.
         *  @returns     {string} Serialised current value.
         *  @description Serialise the current State value through the registered serializer.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Serialize
        (
            format : Format  = 'json',
            pretty : boolean = false
        ): string
        {
            return State.#Serializer(format).Serialize
            (
                this.#signal.Peek(),
                pretty
            );
        }

        /** @name        Deserialize
         *  @public
         *  @param       {string} source Serialised State value.
         *  @param       {Format} [format='json'] Input format.
         *  @returns     {State<T>} This State.
         *  @description Parse and replace the current State value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Deserialize
        (
            source : string,
            format : Format = 'json'
        ): this
        {
            return this.Set
            (
                State.#Serializer(format).Deserialize<T>(source)
            );
        }

        /** @name        Send
         *  @public
         *  @param       {WorkerBridge} worker Worker or WorkerPool structural bridge.
         *  @param       {string} [message='State'] Nominal Worker message.
         *  @param       {Format} [format='json'] Transport format.
         *  @returns     {State<T>} This State.
         *  @description Send a serialised State through the Workers fluent message surface without importing the
         *               Workers module and creating a circular dependency.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Send
        (
            worker  : WorkerBridge,
            message : string = 'State',
            format  : Format = 'json'
        ): this
        {
            worker
                .Send(message)
                .With
                (
                    {
                        Name   : this.#name,
                        Format : format,
                        Value  : this.Serialize(format)
                    }
                )
                .Post();

            return this;
        }

        /** @name        OnChange
         *  @public
         *  @param       {(event: ChangeEvent<T>) => void} handler State change handler.
         *  @returns     {State<T>} This State.
         *  @description Subscribe to canonical `State-Changed` events.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        OnChange(handler: (event: ChangeEvent<T>) => void): this
        {
            this.addEventListener
            (
                'State-Changed',
                event =>
                    handler
                    (
                        (event as CustomEvent<ChangeEvent<T>>).detail
                    )
            );

            return this;
        }

        /** @name        ClearHistory
         *  @public
         *  @returns     {State<T>} This State.
         *  @description Remove all retained history entries.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        ClearHistory(): this
        {
            this.#history.length = 0;

            return this;
        }

        /** @name        Dispose
         *  @public
         *  @returns     {void}
         *  @description Clear snapshots and history. The Signal remains ordinary garbage-collectable state.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Dispose(): void
        {
            this.#snapshots.clear();
            this.#history.length = 0;
        }

        /** @name        #Serializer
         *  @private
         *  @static
         *  @param       {Format} format Requested format.
         *  @returns     {Serializer} Registered serializer.
         *  @description Resolve one serializer or throw a precise error.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static #Serializer(format: Format): Serializer
        {
            const serializer =
                State.#Serializers.get(format);

            if(!serializer)
            {
                throw new Error
                (
                    `[arianna] No State serializer is registered for '${format}'.`
                );
            }

            return serializer;
        }

        /** @name        #Clone
         *  @private
         *  @static
         *  @template    T
         *  @param       {T} value Value to clone.
         *  @returns     {T} Cloned value where possible.
         *  @description Clone snapshot/history boundaries with structuredClone, falling back to JSON for plain
         *               serialisable values and identity for unsupported runtime objects.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static #Clone<T>(value: T): T
        {
            if(typeof structuredClone === 'function')
            {
                try
                {
                    return structuredClone(value);
                }
                catch
                {
                }
            }

            try
            {
                return JSON.parse(JSON.stringify(value)) as T;
            }
            catch
            {
                return value;
            }
        }

        /** @name        #Record
         *  @private
         *  @param       {HistoryKind} kind Mutation kind.
         *  @param       {T | undefined} previous Previous value.
         *  @param       {T} value Current value.
         *  @param       {string} [snapshot] Related snapshot name.
         *  @returns     {void}
         *  @description Append one immutable history entry and enforce the configured retention limit.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #Record
        (
            kind      : HistoryKind,
            previous  : T | undefined,
            value     : T,
            snapshot? : string
        ): void
        {
            if(this.#historyLimit === 0)
            {
                return;
            }

            this.#history.push
            (
                {
                    Kind      : kind,
                    Previous  : State.#Clone(previous),
                    Value     : State.#Clone(value),
                    Snapshot  : snapshot,
                    Timestamp : Date.now()
                }
            );

            if(this.#history.length > this.#historyLimit)
            {
                this.#history.splice
                (
                    0,
                    this.#history.length - this.#historyLimit
                );
            }
        }

        /** @name        #Emit
         *  @private
         *  @param       {T} previous Previous value.
         *  @param       {T} value Current value.
         *  @param       {HistoryKind} kind Mutation kind.
         *  @param       {string} [snapshot] Related snapshot name.
         *  @returns     {void}
         *  @description Emit one canonical State change event.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #Emit
        (
            previous  : T,
            value     : T,
            kind      : HistoryKind,
            snapshot? : string
        ): void
        {
            const detail: ChangeEvent<T> =
                {
                    Type      : 'State-Changed',
                    Name      : this.#name,
                    Previous  : previous,
                    Value     : value,
                    Kind      : kind,
                    Snapshot  : snapshot,
                    Timestamp : Date.now()
                };

            this.dispatchEvent
            (
                new CustomEvent<ChangeEvent<T>>
                (
                    detail.Type,
                    {
                        detail
                    }
                )
            );
        }
    }

    /** @name        Runtime
     *  @private
     *  @type        {Core.Services.Service}
     *  @description Registers the canonical State service while keeping the service implementation inside the
     *               States namespace.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    const Service = new Core.Services.Service<ServiceContract>
    (
        'state',
        {
            /** @name        Create
             *  @public
             *  @template    T
             *  @param       {T} source Initial State value.
             *  @param       {Options} [options] State options.
             *  @returns     {State<T>} A new State.
             *  @description Create a State through the Core service.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Create<T>
            (
                source   : T,
                options? : Options
            ): State<T>
            {
                return State.Create(source, options);
            },

            /** @name        Parse
             *  @public
             *  @template    T
             *  @param       {string} source Serialised value.
             *  @param       {Format} [format='json'] Input format.
             *  @param       {Options} [options] State options.
             *  @returns     {State<T>} Parsed State.
             *  @description Parse serialised data into a new State.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Parse<T>
            (
                source   : string,
                format   : Format = 'json',
                options? : Options
            ): State<T>
            {
                return State
                    .Create<T>(undefined as T, options)
                    .Deserialize(source, format);
            },

            /** @name        RegisterSerializer
             *  @public
             *  @param       {Serializer} serializer Serializer implementation.
             *  @returns     {Service} This service.
             *  @description Register a custom State serializer.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            RegisterSerializer(serializer: Serializer): ServiceContract
            {
                State.RegisterSerializer(serializer);

                return this;
            }
        }
    );
}

export default States.State;

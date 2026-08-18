import type { Types as SchemaTypes } from './schema/Types.ts';
import type { Interfaces as SchemaInterfaces } from './schema/Interfaces.ts';
import { Core } from './Core.ts';

/** @name        Observers
 *  @public
 *  @type        {namespace}
 *  @description Groups the Observers contracts and runtime surface.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Observers
{
    /** @name        ServiceContract
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ServiceContract.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ServiceContract = SchemaInterfaces.Observers.Service;

    /** @class       Observer
     *  @memberof    Core
     *  @classdesc   MutationObserver wrapper that drives the upgrade pipeline. Two boot phases via the
     *               single-phase eager: known Custom nodes upgrade on visit and are cached in `#visited`; hyphenated tags
     *               with no descriptor yet are left for a later visit. The first instance auto-registers as the global (`Observers`).
     *               Adds lifecycle events, an EAGER synchronous pump (`drain` / `drainAll`), and legacy
     *               connect/state accessors.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export class Observer
    {
        /** @name        Observers
         *  @private
         *  @static
         *  @readonly
         *  @memberof    Core.Observer
         *  @type        {Set<Observer>}
         *  @description Every live Observer, registered by the constructor. Membership only — it is NOT a
         *               boot guard: which observer the framework put on the document is `AriannA`'s
         *               business and lives on a field it owns. Reading a count here to decide whether the
         *               framework is wired is exactly how two boot paths end up each thinking the other did
         *               the work.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static readonly Observers : Set<Observer> = new Set();

        /** @name        #pending
         *  @private
         *  @static
         *  @readonly
         *  @type        {WeakSet<Element>}
         *  @description The tree as it stood BEFORE this observer started — filled once by the initial
         *               sweep, read from then on. Everything already in the document at startup is cached
         *               here, so the childList callback only ever has to reason about genuinely new nodes
         *               and never re-walks a subtree per mutation. Written before observe(), never after:
         *               once the observer is live, MutationObserver is the only source of truth.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static readonly #pending : WeakSet<Element> = new WeakSet();

        /** @name        #added
         *  @private
         *  @static
         *  @readonly
         *  @type        {WeakSet<Element>}
         *  @description Nodes currently tracked as present in the observed tree — inserted on a
         *               childList addition or by the initial sweep. Membership set only (GC-friendly:
         *               detached/collected nodes drop out on their own).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static readonly #added   : WeakSet<Element> = new WeakSet();

        /** @name        #removed
         *  @private
         *  @static
         *  @readonly
         *  @type        {WeakSet<Element>}
         *  @description Nodes seen leaving the observed tree (childList removals). Lets a consumer
         *               tell a genuine removal from a node that was never tracked.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static readonly #removed : WeakSet<Element> = new WeakSet();

        /** Reentrancy guards for lifecycle delivery. */
        static readonly #adding   : WeakSet<Element> = new WeakSet();
        static readonly #removing : WeakSet<Element> = new WeakSet();

        static #lifecycle(node: Element, type: 'NodeAdded' | 'NodeRemoved'): void
        {
            const guard =
                type === 'NodeAdded'
                    ? Observer.#adding
                    : Observer.#removing;

            if(guard.has(node))
            {
                return;
            }

            guard.add(node);

            try
            {
                const events = Core.Services.Events;

                if(events)
                {
                    events.Fire(node, { Type: type, Detail: { node }, Propagation: true });

                    if(type === 'NodeRemoved' && typeof document !== 'undefined')
                    {
                        events.Fire(document, { Type: type, Detail: { node } });
                    }
                }
                else
                {
                    node.dispatchEvent
                    (
                        new CustomEvent(type, { detail: { node }, bubbles: true })
                    );

                    if(type === 'NodeRemoved' && typeof document !== 'undefined')
                    {
                        document.dispatchEvent
                        (
                            new CustomEvent(type, { detail: { node } })
                        );
                    }
                }
            }
            finally
            {
                guard.delete(node);
            }
        }


        /** @name        #events
         *  @private
         *  @static
         *  @type        {{ Fire(t: EventTarget, e: { Type: string; Detail?: unknown }): boolean } | undefined}
         *  @description Optional event service resolved from the registry. When present its Fire() is
         *               used to emit; when absent the emitter falls back to native dispatchEvent.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static get #events():
        {
            Fire(t: EventTarget, d: { Type: string; Detail?: unknown }): void;
            Has?(type: string): boolean;
        } | undefined
        {
            return Core.Services.Events as
            {
                Fire(t: EventTarget, d: { Type: string; Detail?: unknown }): void;
                Has?(type: string): boolean;
            } | undefined;
        }

        static readonly #ManagedNode =
            Symbol.for('arianna.template.managed');

        /** @name        #fire
         *  @private
         *  @static
         *  @type        {(target: EventTarget, type: string, detail: unknown) => void}
         *  @description Emit an event on a target: through the event service when available, otherwise
         *               a native bubbling CustomEvent. Defined once (not per callback invocation).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static readonly #fire = (target: EventTarget, type: string, detail: unknown): void =>
        {
            if (Observer.#events) Observer.#events.Fire(target, { Type: type, Detail: detail });   // engine Events
            else                  target.dispatchEvent(new CustomEvent(type, { detail, bubbles: true }));   // fallback nativo
        };

        /** @name        #observer
         *  @private
         *  @readonly
         *  @type        {MutationObserver}
         *  @description The underlying native MutationObserver this class wraps and extends.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        #observer      : MutationObserver;
        /** @name        #element
         *  @private
         *  @type        {Node}
         *  @description Root node currently being observed (defaults to the document element).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        #element       : Node;
        /** @name        #configuration
         *  @private
         *  @type        {MutationObserverInit}
         *  @description Active observe() options (childList, subtree, attributes, …).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        #configuration : MutationObserverInit;
        /** @name        #callback
         *  @private
         *  @type        {Function}
         *  @description Swappable handler invoked with each batch of MutationRecords. Exposed as an
         *               assignable property so this class stays a thin, reusable wrapper around the
         *               native MutationObserver: the default handler simply normalises raw records
         *               into higher-level events and dispatches them, and consumers can replace it
         *               with their own logic without subclassing. The handler itself performs no
         *               side effects on observed nodes beyond emitting events — inspection and
         *               reaction are left entirely to the listeners.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        #callback      : MutationCallback;
        /** @name        #connected
         *  @private
         *  @type        {boolean}
         *  @description Whether observe() is currently active on #element. Tracked so reconnect /
         *               configuration changes can disconnect and re-observe only when live.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        #connected     : boolean = false;
        /** @name        #draining
         *  @private
         *  @type        {boolean}
         *  @description Re-entrancy latch, PER INSTANCE. Draining RUNS the callback, and the callback upgrades
         *               nodes — which writes to the DOM, which queues fresh records on this very observer.
         *               Without the latch a drain reached from inside that work would drain on top of itself,
         *               each pass producing the mutations the next one flushes: not a deep stack, an endless
         *               one.
         *
         *               Per instance and not static because the queue is per instance: `takeRecords()` empties
         *               THIS observer, so guarding the whole loop would have let one flush anywhere lock out
         *               every observer on the page. And it makes `DrainAll` safe for free — a callback that
         *               calls it finds each observer already latched, and the walk ends on its own.
         *
         *               Released in a `finally`, so a callback that throws does not leave draining wedged shut
         *               for the rest of the session.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        #draining      : boolean = false;

        /** @name        constructor
         *  @public
         *  @description Build an observer (childList + subtree + attributes by default), wire its handler,
         *               and auto-register into `Observers` (§6) — the first instance becomes the global.
         *  @param       {Partial<MutationObserverInit>=} configuration Option overrides.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        constructor(configuration?: Partial<MutationObserverInit>)
        {
            this.#element       = typeof document !== 'undefined' ? document.documentElement : (null as unknown as Node);
            this.#configuration = { childList: true, subtree: true, attributes: true, attributeOldValue: true, ...configuration };
            this.#callback      = function(mutations: MutationRecord[])
            {
                for(let mutationIndex = 0; mutationIndex < mutations.length; mutationIndex++)
                {
                    const m = mutations[mutationIndex];

                    if(m.type === 'attributes' && m.target instanceof Element)
                    {
                        const attributes = m.target.attributes;
                        const attribute  = attributes.getNamedItem(m.attributeName ?? '');

                        if(attribute)
                        {
                            const lower = /^(\w+)/.exec(attribute.name)?.[1]?.toLowerCase();
                            const name  = lower ?? attribute.name;
                            Observer.#fire
                            (
                                m.target,
                                `${name}-changed`,
                                {
                                    element: m.target,
                                    attribute
                                }
                            );
                        }
                    }

                    if(m.type !== 'childList') continue;

                    const events = Observer.#events;
                    const nodeAddedObserved   = events?.Has?.('NodeAdded')   === true;
                    const nodeRemovedObserved = events?.Has?.('NodeRemoved') === true;

                    for(let nodeIndex = 0; nodeIndex < m.addedNodes.length; nodeIndex++)
                    {
                        const node = m.addedNodes[nodeIndex];
                        if(!(node instanceof Element)) continue;

                        const managed =
                            (node as unknown as Record<symbol, unknown>)[Observer.#ManagedNode] === true;

                        // Internally-managed standard nodes need no lifecycle bookkeeping at all
                        // when that lifecycle is unobserved. R5 skipped dispatch but still paid two
                        // WeakSet operations per node; bulk create/clear therefore still scaled with rows.
                        if(managed && !nodeAddedObserved) continue;

                        Observer.#added.add(node);
                        Observer.#removed.delete(node);

                        Observer.#lifecycle(node, 'NodeAdded');
                    }

                    for(let nodeIndex = 0; nodeIndex < m.removedNodes.length; nodeIndex++)
                    {
                        const node = m.removedNodes[nodeIndex];
                        if(!(node instanceof Element)) continue;

                        const managed =
                            (node as unknown as Record<symbol, unknown>)[Observer.#ManagedNode] === true;

                        // Same rule on removal: if no AriannA lifecycle consumer exists, the
                        // framework's own row teardown must not re-enter Observer bookkeeping.
                        if(managed && !nodeRemovedObserved) continue;

                        Observer.#added.delete(node);
                        Observer.#removed.add(node);

                        Observer.#lifecycle(node, 'NodeRemoved');
                    }
                }
            };
            this.#observer      = new MutationObserver(this.#callback as MutationCallback);
            Observer.Observers.add(this);
        }

        /** @name        Create
         *  @public
         *  @static
         *  @memberof    Core.Observer
         *  @returns     {Observer} A fresh Observer, disconnected.
         *  @description Build an Observer with the default callback and configuration, watching nothing
         *               yet. The zero-argument form is the one to reach for when the caller intends to
         *               `Connect` later — or never, as under SSR.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static Create(): Observer;

        /** @name        Create
         *  @public
         *  @static
         *  @memberof    Core.Observer
         *  @param       {MutationCallback} callback Invoked with each batch the browser delivers.
         *  @returns     {Observer} A fresh Observer, disconnected, carrying the given callback.
         *  @description Build an Observer that reports to YOUR callback instead of the default one. Set at
         *               construction and not through the accessor, which is not the same thing: the setter
         *               has to tear down the live MutationObserver and rebuild it, and only re-observes
         *               when the instance is already connected. Passing it here skips that entirely.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static Create(callback: MutationCallback): Observer;

        /** @name        Create
         *  @public
         *  @static
         *  @memberof    Core.Observer
         *  @param       {MutationCallback} callback Invoked with each batch the browser delivers.
         *  @param       {Partial<MutationObserverInit>} configuration Merged over the defaults —
         *               `{ childList: true, subtree: true, attributes: true, attributeOldValue: true }`.
         *  @returns     {Observer} A fresh Observer, disconnected, carrying both.
         *  @description Build an Observer that watches only what you ask for. MERGED and not replaced, so
         *               `{ attributes: false }` narrows the defaults instead of leaving a config with a
         *               single key — which the platform would read as "childList off" too, and the
         *               observer would silently report nothing.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static Create(callback: MutationCallback, configuration: Partial<MutationObserverInit>): Observer;

        /** @name        Create
         *  @public
         *  @static
         *  @memberof    Core.Observer
         *  @param       {MutationCallback} callback Invoked with each batch the browser delivers.
         *  @param       {Partial<MutationObserverInit>} configuration Merged over the defaults.
         *  @param       {Node} element The root to watch.
         *  @returns     {Observer} A CONNECTED Observer, already watching `element`.
         *  @description Build and connect in one call. The only form that returns a live Observer, which is
         *               why the root comes last: everything before it configures, and adding it is what
         *               starts the watching. Note the ORDER — callback first, then configuration, then
         *               root: the callback must be in place before `observe` runs, or the first batch is
         *               delivered to the default one.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static Create(callback: MutationCallback, configuration: Partial<MutationObserverInit>, element: Node): Observer;

        /** @name        Create
         *  @public
         *  @static
         *  @memberof    Core.Observer
         *  @param       {MutationCallback} [callback] Optional callback; the default one is kept when omitted.
         *  @param       {Partial<MutationObserverInit>} [configuration] Optional config, merged over the defaults.
         *  @param       {Node} [element] Optional root; passing it CONNECTS the observer.
         *  @returns     {Observer} The Observer — connected only when `element` was given.
         *  @description Implementation behind the four overloads. Applies what it was given, in the order
         *               that matters: callback, then configuration, then connection. Each argument is
         *               applied only when present, so the defaults survive rather than being overwritten
         *               with `undefined`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static Create(callback?: MutationCallback, configuration?: Partial<MutationObserverInit>, element?: Node): Observer
        {
            const observer = new Observer();

            if (callback) observer.Callback = callback;

            if (configuration) observer.Configuration = { ...observer.Configuration, ...configuration };

            if (element) observer.connect(element);

            return observer;
        }

        /** @name        DrainAll
         *  @public
         *  @static
         *  @description Drain every registered Observer (each flushes its own pending records through
         *               its own #callback). Neutral — no node logic here.
         *  @returns     {void}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static DrainAll(): void
        {
            for (const observer of Observer.Observers) observer.drain();
        }

        /** @name Connected @public @type {boolean} @description Observing state; setting `true` connects, `false` disconnects. @author Riccardo Angeli @copyright Riccardo Angeli 2012-2026 All Rights Reserved @license MIT / Commercial (dual license) */
        get Connected(): boolean { return this.#connected; }
        set Connected(v: boolean)
        { if (typeof v === 'boolean' && v !== this.#connected) (v ? this.connect() : this.disconnect()); }

        /** @name Disconnected @public @type {boolean} @description Inverse of `Connected`; setting `true` disconnects. @author Riccardo Angeli @copyright Riccardo Angeli 2012-2026 All Rights Reserved @license MIT / Commercial (dual license) */
        get Disconnected(): boolean { return !this.#connected; }
        set Disconnected(v: boolean)
        { if (typeof v === 'boolean' && v !== !this.#connected) (v ? this.disconnect() : this.connect()); }

        /** @name State @public @type {'Connected' | 'Disconnected'} @description String view of the connection state; accepts case-insensitive 'CONNECTED'/'DISCONNECTED'. @author Riccardo Angeli @copyright Riccardo Angeli 2012-2026 All Rights Reserved @license MIT / Commercial (dual license) */
        get State(): 'Connected' | 'Disconnected' { return this.#connected ? 'Connected' : 'Disconnected'; }
        set State(s: string)
        {
            const v = String(s).toUpperCase();
            if (v === 'CONNECTED' && !this.#connected)        this.connect();
            else if (v === 'DISCONNECTED' && this.#connected) this.disconnect();
        }

        /** @name Configuration @public @type {MutationObserverInit} @description Observer options; assigning re-observes with the new config if connected. @author Riccardo Angeli @copyright Riccardo Angeli 2012-2026 All Rights Reserved @license MIT / Commercial (dual license) */
        get Configuration(): MutationObserverInit { return this.#configuration; }
        set Configuration(c: MutationObserverInit)
        {
            if (c && typeof c === 'object')
            {
                this.#configuration = { ...c };
                if (this.#connected)
                {
                    this.#observer.disconnect();
                    this.#observer.observe(this.#element, this.#configuration);
                }
            }
        }

        /** @name Element @public @type {Node} @description Observed root; assigning re-observes the new root if connected. @author Riccardo Angeli @copyright Riccardo Angeli 2012-2026 All Rights Reserved @license MIT / Commercial (dual license) */
        get Element(): Node { return this.#element; }
        set Element(el: Node)
        {
            if (el instanceof Node)
            {
                this.#element = el;
                if (this.#connected)
                {
                    this.#observer.disconnect();
                    this.#observer.observe(this.#element, this.#configuration);
                }
            }
        }

        /** @name        Callback
         *  @public
         *  @type        {MutationCallback}
         *  @description The handler currently invoked with each batch of MutationRecords. Reading it
         *               returns the active handler; assigning swaps it in. When observation is live,
         *               the setter re-binds the underlying MutationObserver to the new handler and
         *               resumes on the same target and options, so the change takes effect at once.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        get Callback(): MutationCallback { return this.#callback; }
        set Callback(callback: MutationCallback)
        {
            if (callback instanceof Function)
            {
                this.#callback = callback;
                if (this.#connected)
                {
                    this.#observer.disconnect();
                    this.#observer = new MutationObserver(this.#callback);
                    if (this.#connected)
                    {
                        this.#observer.observe(this.#element, this.#configuration);
                    }
                }
            }
        }

        /** @name        Connect
         *  @public
         *  @description Start observing. `element` defaults to <html>; `configuration` merges into the current one.
         *  @param       {Node=} element Root to observe.
         *  @param       {Partial<MutationObserverInit>=} configuration Option overrides.
         *  @returns     {this} This observer (chainable).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        connect(element?: Node, configuration?: Partial<MutationObserverInit>): this
        {
            if (element instanceof Node) this.#element = element;
            if (configuration && typeof configuration === 'object')
            {
                Object.assign(this.#configuration, configuration);
            }
            this.#observer.observe(this.#element, this.#configuration);
            this.#connected = true;
            return this;
        }

        /** @name        Disconnect
         *  @public
         *  @description Stop observing.
         *  @returns     {this} This observer (chainable).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        disconnect(): this
        {
            this.#observer.disconnect();
            this.#connected = false;
            Observer.Observers.delete(this);
            return this;
        }

        /** @name        on
         *  @public
         *  @description Subscribe a listener to an event on a target. Routes through the 'events'
         *               service when registered (engine: brokers/phases), otherwise native
         *               addEventListener. Service is resolved per call, so it starts using the engine
         *               the moment it loads. Chainable.
         *  @param       {EventTarget} target Target to listen on.
         *  @param       {string} type Event type/name.
         *  @param       {EventListener} handler Listener.
         *  @param       {AddEventListenerOptions=} options Native/engine listener options.
         *  @returns     {this}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        on(target: EventTarget, type: string, handler: EventListener, options?: AddEventListenerOptions): this
        {
            const events = Core.Services.Resolve('events') as
                { On?(t: EventTarget, types: string, h: EventListener, o?: AddEventListenerOptions): unknown } | undefined;
            if (events && typeof events.On === 'function') events.On(target, type, handler, options);
            else                                            target.addEventListener(type, handler, options);
            return this;
        }

        /** @name        off
         *  @public
         *  @description Unsubscribe a listener from an event on a target. Routes through the 'events'
         *               service when it exposes Off, otherwise native removeEventListener. Service is
         *               resolved per call. Chainable.
         *  @param       {EventTarget} target Target the listener was bound to.
         *  @param       {string} type Event type/name.
         *  @param       {EventListener} handler The same listener reference passed to on().
         *  @returns     {this}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        off(target: EventTarget, type: string, handler: EventListener): this
        {
            const events = Core.Services.Resolve('events') as
                { Off?(t: EventTarget, types: string, h: EventListener): unknown } | undefined;
            if (events && typeof events.Off === 'function') events.Off(target, type, handler);
            else                                            target.removeEventListener(type, handler);
            return this;
        }

        /** @name        drain
         *  @public
         *  @description Force-process any MutationRecords the native observer has queued but not yet
         *               delivered, by flushing takeRecords() through the active #callback. Neutral:
         *               it only runs the same event pipeline synchronously, no side effects on nodes
         *               beyond what the callback already does.
         *  @returns     {this}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        drain(): this
        {
            if (this.#draining) return this;

            const records = this.#observer.takeRecords();

            if (!records.length) return this;

            this.#draining = true;

            try   { this.#callback(records, this.#observer); }
            finally { this.#draining = false; }

            return this;
        }

        /** @name        sweep
         *  @public
         *  @description Emit NodeAdded for elements ALREADY present under `root` before this observer
         *               began watching (the native observer is blind to the pre-existing tree). Neutral:
         *               it only fires events — it performs no descriptor lookup and no upgrade. Kept
         *               targeted (see param) so it never walks the whole document blindly.
         *  @param       {ParentNode&Element=} root Subtree root (defaults to the observed element).
         *  @param       {string[]=} tags Optional tag whitelist — when given, only elements of these
         *               tags are visited (getElementsByTagName, C-fast), avoiding an O(N) full walk.
         *  @returns     {this}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        sweep(root?: ParentNode & Element, tags?: string[]): this
        {
            const scope = root ?? (this.#element as ParentNode & Element);
            const emit  = (element: Element): void =>
            {
                if (Observer.#added.has(element)) return;                 // già noto → skip
                Observer.#added.add(element);
                Observer.#removed.delete(element);
                element.dispatchEvent
                (
                    new CustomEvent('NodeAdded', { detail: { node: element }, bubbles: true })
                );
            };

            if (tags && tags.length)
            {
                for(let tagIndex = 0; tagIndex < tags.length; tagIndex++)
                {
                    const elements = scope.getElementsByTagName(tags[tagIndex]);
                    for(let elementIndex = 0; elementIndex < elements.length; elementIndex++)
                        emit(elements[elementIndex]);
                }
                return this;
            }

            for (const el of Array.from(scope.querySelectorAll('*'))) emit(el);               // full (diagnostica)
            return this;
        }

        /** @name        (static block)
         *  @private @static
         *  @description Self-install on `window` so `new Observer()` is reachable globally (like Real / State);
         *               guarded + SSR-safe (§7).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static
        {
            const h = !Object.prototype.hasOwnProperty.call(window, 'Observer');
            if (typeof window !== 'undefined' && h)
            {
                Object.defineProperty
                (
                    window, 'Observer',
                    {
                        enumerable: true,
                        configurable: false,
                        writable: false,
                        value: Observer
                    }
                );
            }
        }
    }

    /** @name        Service
     *  @private
     *  @memberof    Core.Observer
     *  @type        {Core.Services.Service}
     *  @description Registers the ONE `'observer'` service on the kernel, matching
     *               `Core.Services.Types.ObserverService` exactly: `Create` + `DrainAll`.
     *
     *               Without it `Core.Services.Observer` stayed `undefined` forever, and
     *               `AriannA.Initialize()` bailed at its `if (!service) return;` guard — so the
     *               global MutationObserver was never built and the whole upgrade-on-append path
     *               was dead. A node produced by `document.createElement('mytag')` and appended
     *               to the document never got promoted: no error, no warning, just an
     *               HTMLUnknownElement that stayed that way. Every other module in the core
     *               registers its service this way; this file was the only one that did not.
     *
     *               EXPORTED on purpose, like `contextService` / `directivesService` / `pluginsService`.
     *               A bare `const Service = new …` at module top level is an unused binding and a
     *               prime tree-shaking target: it survives an unbundled ESM load and can be dropped
     *               by the bundler, which is the worst possible failure mode — the dev build works,
     *               the release build silently has no observer. An export cannot be elided.
     *
     *               Thin delegations, no state: the statics remain the single source of truth
     *               and the service can never drift from them.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const Service = new Core.Services.Service<ServiceContract>
    (
        'observer',
        {
            Create
            (
                callback?: MutationCallback,
                configuration?: Partial<MutationObserverInit>,
                element?: Node
            ): unknown
            {
                return Observer.Create
                (
                    callback as MutationCallback,
                    configuration as Partial<MutationObserverInit>,
                    element as Node
                );
            },

            DrainAll(): void
            {
                Observer.DrainAll();
            },
        }
    );
}

export default Observers;

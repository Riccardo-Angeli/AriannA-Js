/**
 * @module    core/Core
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * Core is the AriannA kernel behavior layer.
 * Type aliases live exclusively in definitions/Types.ts.
 * Structural contracts and descriptors live exclusively in definitions/Interfaces.ts.
 * Services live exclusively in core/Services.ts.
 */
import { Services }   from "./Services.ts";

import type { Observers }            from '../dom/Observer.ts';
import type { Types }      from "../definitions/Types.ts";
import type { Interfaces } from "../definitions/Interfaces.ts";

/**
 * @namespace Core
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description Type-only contracts for the Namespace data root: the runtime
 *              registry descriptors (`Namespace.Descriptors`) and the
 *              serializable IR model (`Namespace.IR`).
 *
 *              The data root imports nothing — `Element`, `Map`, `Record` are
 *              ambient (lib.dom / lib.es), so the "Namespace imports nothing"
 *              invariant holds. Both sub-namespaces contain only types and
 *              therefore erase at compile time (zero runtime footprint); never
 *              place a `const` or function here, or TypeScript will emit the
 *              namespace object.
 */
export namespace Core {
    /** Constants Block */
    /** @name        Scopes
     *  @public
     *  @type        {Readonly<Record<string, { configurable: boolean; enumerable: boolean; writable: boolean }>>}
     *  @description Reusable `Object.defineProperty` descriptor templates (sealed by default):
     *               `Private`, `Readonly`, `Writable`, `Configurable`. Spread one into a descriptor
     *               and add the `value`.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     *  @example     Object.defineProperty(obj, 'k', { ...Core.Scopes.Readonly, value: 42 });
     */
    export const Scopes: Readonly<Record<string, {
        configurable: boolean;
        enumerable: boolean;
        writable: boolean;
    }>> = Object.freeze({
        Private: { configurable: false, enumerable: false, writable: false },
        Readonly: { configurable: false, enumerable: true, writable: false },
        Writable: { configurable: false, enumerable: true, writable: true },
        Configurable: { configurable: true, enumerable: true, writable: false },
    });
    /** @name        Text
     *  @public
     *  @type        {namespace}
     *  @description Groups the Text contracts and runtime surface.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */

    /** Classes Block */
    /** @namespace   Boot
     *  @memberof    Core
     *  @description Boot subsystem (replaces the former `Boot` class). Groups the boot state and the
     *               multi-mode bundle loader. State lives in two `Property` instances (`Initialized`,
     *               `Booted`) — hard-private inside the Property, exposed read-only via
     *               `Core.Initialized` / `Core.Booted`, and transitioned only by `AriannA()`. The
     *               single entry `AriannA(mode)` folds the old two-phase boot; `Ready()` awaits the
     *               `Booted` flag. Lifecycle notifications ride the `arianna-ready` DOM event,
     *               fired through the `'events'` service registry (no direct Events import).
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export class AriannA {
        /** @name        Configuration
         *  @public
         *  @description Static framework configuration: the semantic version and its JSON projection.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static Configuration = {
            /** @name        version
             *  @public
             *  @memberof    Core.Configuration
             *  @type        {{ major: number; minor: number; patch: number; string: string }}
             *  @description Semantic version components plus a computed `string` accessor.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            version: {
                /** @name        major
                 *  @public
                 *  @memberof    Core.Configuration.version
                 *  @type        {number}
                 *  @description Major version component.
                 *  @default     1
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license)
                 */
                major: 1,
                /** @name        minor
                 *  @public
                 *  @memberof    Core.Configuration.version
                 *  @type        {number}
                 *  @description Minor version component.
                 *  @default     0
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license)
                 */
                minor: 0,
                /** @name        patch
                 *  @public
                 *  @memberof    Core.Configuration.version
                 *  @type        {number}
                 *  @description Patch version component.
                 *  @default     0
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license)
                 */
                patch: 0,
                /** @name        string
                 *  @public
                 *  @readonly
                 *  @memberof    Core.Configuration.version
                 *  @type        {string}
                 *  @description Computed `"major.minor.patch"` version string.
                 *  @returns     {string} The dotted version.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license)
                 */
                get string() { return `${this.major}.${this.minor}.${this.patch}`; },
            },
            /** @name        nativePatch
             *  @public
             *  @memberof    Core.Configuration
             *  @type        {boolean}
             *  @description Feature-flag: when `true` (default) the framework wraps native
             *               element constructors (`window.HTMLDivElement`, `SVGElement`, …) in
             *               `Namespace.Initialize()`, so `super()` inside an AriannA subclass
             *               returns a real, correctly-tagged element. Set to `false` to leave
             *               the global native constructors untouched (opt-out for hosts that
             *               forbid monkey-patching, or for SSR / spec-only runs).
             *  @default     true
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            nativePatch: true,
            /** @name        debug
             *  @public
             *  @memberof    Core.Configuration
             *  @type        {boolean}
             *  @description Feature-flag: when `true`, otherwise-silent recovery `catch`
             *               blocks emit a coded diagnostic via `Core.warn(code, …)`. Default
             *               `false` keeps production quiet; flip on in development to surface
             *               swallowed failures. Does not change control flow.
             *  @default     false
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            debug: false,
            /** @name        toJSON
             *  @public
             *  @memberof    Core.Configuration
             *  @description Serializer — projects the configuration to a plain `{ version }` object.
             *  @returns     {{ version: string }} JSON projection.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            get JSON() { return { version: this.version.string }; },
            load(json: object) { }
        };
        /** @name        #ready
         *  @private
         *  @static
         *  @memberof    Core.Boot.AriannA
         *  @type        {Promise<void> | null}
         *  @description The one boot promise, memoised. `Ready` hands this back rather than building a new
         *               Promise per read — two reads would otherwise mean two promises and two listeners,
         *               and neither would be the one `Boot()` actually produced, so a boot that threw would
         *               leave every waiter hanging instead of rejecting. Null until the first read or the
         *               first construction, whichever comes first.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static #ready: Promise<void> | null = null;
        /** @name        #initialized
         *  @private
         *  @static
         *  @memberof    Core.Boot.AriannA
         *  @type        {boolean}
         *  @description True once `Initialize()` has completed. A REPORT, not a guard — what actually keeps
         *               initialization idempotent is `#observer`, because it names the thing that must exist
         *               rather than asserting that it does. Read through `Initialized`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static #initialized: boolean = false;
        /** @name        #booted
         *  @private
         *  @static
         *  @memberof    Core.Boot.AriannA
         *  @type        {boolean}
         *  @description True once `Boot()` has started pulling the optional bundles. Set BEFORE the first
         *               `await`, not after: two callers landing in the same tick would both clear a flag
         *               raised afterwards, and both would import. Read through `Booted`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static #booted: boolean = false;
        /** @name        #observer
         *  @private
         *  @static
         *  @memberof    Core.Boot.AriannA
         *  @type        {Observer | null}
         *  @description The observer this class put on the document, and the only guard that decides whether
         *               `Initialize()` has work left. Private on purpose: the previous guard counted entries
         *               in the shared observer registry, which ANY observer created for any reason
         *               satisfies — so the second boot path read the count, concluded the job was done, and
         *               silently skipped the wiring it was carrying. A field nobody else can set cannot be
         *               satisfied by accident.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static #observer: Observers.Observer | null = null;
        /** @name        #globals
         *  @private
         *  @static
         *  @memberof    Core.Boot.AriannA
         *  @type        {Set<string>}
         *  @description Global names a mirrored export must not clobber. Anything in here is published
         *               prefixed — a bundle exporting `Math` lands on `AriannAMath`, not over the runtime's.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static readonly #globals = new Set<string>(['Math', 'Date', /* … */]);
        /** @name        constructor
         *  @public
         *  @memberof    Core.Boot.AriannA
         *  @param       {Types.Core.Packages} [packages={}] Which optional bundles to pull and whether to mirror
         *               their exports. Left out, it reaches `#packages` as `{}` — the same thing a bare
         *               `new AriannA()` asks for, which today resolves to no URLs at all.
         *  @description Bring the framework up: seed the namespaces and start the observer synchronously,
         *               then let the bundles load in the background. Two phases and not one, because the
         *               observer has to be watching while the imports are still in flight — everything
         *               added in that window would otherwise never be promoted.
         *
         *               Repeating it is free. Every step guards on its own static, so a second `new` finds
         *               the observer already placed and the boot already started, and hands back an instance
         *               whose `Ready` is the SAME promise the first one got. That is what `??=` buys: not a
         *               shortcut, but the guarantee that every caller waits on the boot that actually
         *               happened, errors included.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(packages?: Types.Core.Packages) {
            AriannA.Initialize();
            AriannA.#ready ??= AriannA.Boot(packages);
        }
        /** @name        Ready
         *  @public
         *  @readonly
         *  @memberof    Core.Boot.AriannA
         *  @returns     {Promise<void>} The boot promise — the same one every caller gets.
         *  @description Await the boot from an instance. Hands back the memoised promise rather than
         *               building a fresh one per read, which matters for two reasons: two reads would mean
         *               two promises and two listeners, and neither would be the promise `Boot()` actually
         *               returned — so a boot that threw would leave every waiter hanging instead of
         *               rejecting. Reading it without ever having constructed starts the boot, which is the
         *               sensible reading of "are you ready?" asked of something nobody has started.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get Ready(): Promise<void> {
            return AriannA.#ready ??= AriannA.Boot();
        }
        /** @name        #packages
         *  @private
         *  @static
         *  @memberof    Core.Boot.AriannA
         *  @param       {Types.Core.Packages} spec The package specification.
         *  @returns     {{ urls: string[]; mirror: boolean }} Module URLs to import, and whether to mirror.
         *  @description Resolve a package spec to a list of bundle URLs. STUB: returns no URLs at all, so
         *               `Boot` currently imports nothing and `#mirror` never runs.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static #packages(spec: Types.Core.Packages): {
            urls: string[];
            mirror: boolean;
        } {
            void spec;
            return { urls: [], mirror: true };
        }
        /** @name        #mirror
         *  @private
         *  @static
         *  @memberof    Core.Boot.AriannA
         *  @param       {Record<string, unknown>} mod A loaded bundle's exports.
         *  @returns     {void}
         *  @description Publish a bundle's exports onto the global scope, prefixing anything that would
         *               shadow a built-in. STUB: computes the name and defines nothing.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static #mirror(mod: Record<string, unknown>): void {
            if (typeof window === 'undefined')
                return;
            for (const k of Object.keys(mod)) {
                const name = AriannA.#globals.has(k) ? 'AriannA' + k : k;
                void name; /* defineProperty… */
            }
        }
        /** @name        Initialized
         *  @public
         *  @static
         *  @readonly
         *  @memberof    Core.Boot.AriannA
         *  @returns     {boolean} True once `Initialize()` has completed.
         *  @description Whether phase one has run: namespaces seeded, observer placed. A report for
         *               diagnostics, not something to branch on — `Initialize()` guards itself on
         *               `#observer`, and code that gates on this flag instead is how two boot paths end up
         *               each trusting the other.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static get Initialized() { return this.#initialized; }
        /** @name        Booted
         *  @public
         *  @static
         *  @readonly
         *  @memberof    Core.Boot.AriannA
         *  @returns     {boolean} True once `Boot()` has started pulling the optional bundles.
         *  @description Whether phase two has begun. Note STARTED, not finished: the flag is raised before
         *               the first `await`, so that two callers in the same tick cannot both get past it. To
         *               wait for completion, await `Ready` — this is a probe, not a barrier.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static get Booted() { return this.#booted; }
        /** @name        Ready
         *  @public
         *  @static
         *  @readonly
         *  @memberof    Core.Boot.AriannA
         *  @returns     {Promise<void>} The boot promise — the same one the instance accessor returns.
         *  @description Await the boot without holding an instance. Same promise, same memo: `AriannA.Ready`
         *               and `new AriannA().Ready` are interchangeable by construction, so a caller that only
         *               ever imported the class is never waiting on a different boot than the one that ran.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static get Ready(): Promise<void> {
            return AriannA.#ready ??= AriannA.Boot();
        }
        /** @name        Boot
         *  @public
         *  @static
         *  @memberof    Core.Boot.AriannA
         *  @param       {Types.Core.Packages} [spec] Which optional bundles to pull and whether to mirror their
         *               exports onto the global scope.
         *  @returns     {Promise<void>} Settles once the bundles are in and 'arianna-ready' has fired.
         *  @description Phase two: pull the optional bundles and announce readiness. Runs at most once.
         *               `Initialize()` is called FIRST and synchronously, before the first `await` — the
         *               observer has to be live while the imports are still in flight, not after them, or
         *               every node added in between is missed. The flag is set BEFORE the await too: two
         *               callers arriving in the same tick would otherwise both pass the guard and import.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static async Boot(spec?: Types.Core.Packages): Promise<void> {
            AriannA.Initialize();
            if (AriannA.#booted || typeof document === 'undefined')
                return;
            AriannA.#booted = true;
            const { urls, mirror } = AriannA.#packages(spec ?? {});
            const mods = await Promise.all(urls.map(u => import(/* @vite-ignore */ u).catch(() => null)));
            if (mirror) {
                for (const m of mods) {
                    if (m)
                        AriannA.#mirror(m as Record<string, unknown>);
                }
            }
            Services.Events?.Fire(document, {
                Type: 'arianna-ready',
                Detail: { version: AriannA.Configuration.version.string },
            });
        }
        /** @name        Initialize
         *  @public
         *  @static
         *  @memberof    Core.Boot.AriannA
         *  @returns     {void}
         *  @description Phase one, synchronous: seed the standard namespaces and put the single global
         *               observer on the document, so define and upgrade run eagerly from the first tick.
         *               Idempotent through `#observer`, a field this class OWNS — a count over the shared
         *               observer registry is satisfied by anyone's observer, which is how two boot paths
         *               end up each believing the other did the work.
         *
         *               Observed root is `document.body`, never `documentElement`: `<head>` is where every
         *               Promote injects its scoped `<style>` and where every `new Css.Stylesheet` appends a
         *               `<link>` and a `<style>` from its own constructor, so watching it feeds the
         *               framework's own CSS writes straight back into this callback.
         *
         *               The upgrade rides the observer callback and NOT the 'NodeAdded' event, so it needs
         *               neither bubbling nor a listener. It runs BEFORE the original callback, so whoever
         *               does listen receives a node already promoted. Order is load-bearing: the `Callback`
         *               setter only re-binds the live MutationObserver when the observer is already
         *               connected, so Connect comes first and the callback second — the other way round the
         *               swap is silently ignored. The sweep comes last, into a pipeline already whole.
         *
         *               The guard is `instanceof HTMLUnknownElement` and nothing else, because it is the
         *               only native interface that STOPS matching once the type prototype is spliced on: it
         *               switches itself off. `HTMLElement` and `SVGElement` stay true after promotion and
         *               would re-patch the same node forever.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static Initialize(): void {
            if (typeof document === 'undefined')
                return;
            const namespaces = Services.Namespaces;
            if (!namespaces)
                return;
            if (!namespaces.Has('html'))
                AriannA.Install();
            if (typeof globalThis !== 'undefined') {
                (globalThis as {
                    Core?: unknown;
                }).Core ??= Core;
            }
            if (AriannA.#observer)
                return;
            const service = Services.Observer;
            if (!service)
                return;
            const stage = document.body ?? document.documentElement;
            const observer = Services.Observer?.Create() as Observers.Observer;
            const base = observer.Callback!;
            observer?.connect(stage);
            observer.Callback = function (mutations: MutationRecord[], observer: MutationObserver): void {
                for (const m of mutations) {
                    if (m.type !== 'childList')
                        continue;
                    for (const node of m.addedNodes) {
                        if (!(node instanceof Element))
                            continue;
                        const d = namespaces.Resolve(node);
                        if (!d || !d.Custom || !d.Defined)
                            continue;
                        if (Object.getPrototypeOf(node) === d.Prototype)
                            continue;
                        namespaces.Upgrade(node, d);
                    }
                }
                base.call(this, mutations, observer);
            };
            /*
             * FIRST-PAINT PATH
             * ----------------
             * The observer is already connected, so no mutation occurring from
             * this point onward can be lost. The expensive initial full-tree
             * sweep is therefore not part of synchronous framework boot.
             *
             * Existing DOM is reconciled when the browser has had an
             * opportunity to paint. New DOM created meanwhile is handled by the
             * live MutationObserver above.
             *
             * requestIdleCallback is preferred because it is explicitly outside
             * the rendering critical path. setTimeout is the portable fallback.
             */
            const sweep = (): void => {
                if (!stage.isConnected)
                    return;
                observer.sweep(stage);
            };
            if (typeof globalThis !== 'undefined' &&
                'requestIdleCallback' in globalThis &&
                typeof (globalThis as typeof globalThis & {
                    requestIdleCallback?: (callback: IdleRequestCallback) => number;
                }).requestIdleCallback === 'function') {
                (globalThis as typeof globalThis & {
                    requestIdleCallback: (callback: IdleRequestCallback) => number;
                }).requestIdleCallback(() => sweep());
            }
            else {
                globalThis.setTimeout(sweep, 0);
            }
            AriannA.#observer = observer as Observers.Observer;
            AriannA.#initialized = true;
        }
        /** @name        Install
         *  @public
         *  @memberof    Core
         *  @description Install the optional native namespace pack through the Services seam. The kernel owns no
         *               HTML/SVG/MathML/X3D metadata; full distributions register that data from dom/Natives.ts,
         *               while slim runtimes can omit the pack and let Real fall back to native DOM creation.
         *  @returns     {{ html: Namespace; svg: Namespace; mathML: Namespace; x3d: Namespace }} The four
         *               built-in namespace instances.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static Install(): Partial<
        {
            html   : Interfaces.Namespaces.Runtime;
            svg    : Interfaces.Namespaces.Runtime;
            mathML : Interfaces.Namespaces.Runtime;
            x3d    : Interfaces.Namespaces.Runtime;
        }>
        {
            const platform = Services.Resolve<
            {
                Install(): Partial<
                {
                    html   : Interfaces.Namespaces.Runtime;
                    svg    : Interfaces.Namespaces.Runtime;
                    mathML : Interfaces.Namespaces.Runtime;
                    x3d    : Interfaces.Namespaces.Runtime;
                }>;
            }>('natives');

            return platform?.Install() ?? {};
        }
    }
    /** Functions Block */
    export const Initialize = AriannA.Initialize;
    /** @name        UUID
     *  @public
     *  @memberof    Core
     *  @returns     {string} A fresh identifier.
     *  @description Generate an RFC-shaped identifier. A FUNCTION and not a property, unlike the accessor
     *               it replaces: every call returns a different value, and `Core.UUID()` says that out
     *               loud while `Core.UUID` read like a stable field and invited being used as one.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export function UUID(): string {
        const b: string[] = [];
        for (let i = 0; i < 9; i++) {
            b.push((Math.floor(1 + Math.random() * 0x10000)).toString(16).slice(1));
        }
        return `${b[1]}${b[2]}-${b[3]}-${b[4]}-${b[5]}-${b[6]}${b[7]}${b[8]}`;
    }
    /** @name        Root
     *  @public
     *  @memberof    Core
     *  @returns     {Element | null} The document's root element, or `null` off-DOM.
     *  @description The DOCUMENT root — `<html>` — not the observed one: the observer watches
     *               `document.body`, because `<head>` is where the framework injects its own stylesheets
     *               and watching it would feed those writes back into its own callback.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export function Root(): Element | null {
        return typeof document !== 'undefined' ? document.documentElement : null;
    }
    /** @name        Equals
     *  @public
     *  @description Deep equality across primitives, plain objects, arrays, RegExp, Date, and class
     *               instances. Pass 2+ arguments, or a single array of elements. Objects compare by
     *               own enumerable keys; functions by source string.
     *  @param       {...unknown} args Elements to compare (or one array of elements).
     *  @returns     {boolean} `true` when all elements are deeply equal.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     *  @example     Core.Equals({a:1}, {a:1})  // true
     */
    export function Equals(...args: unknown[]): boolean {
        let elements = args;
        if (args.length === 1 && Array.isArray(args[0]))
            elements = args[0] as unknown[];
        if (elements.length < 2)
            return true;
        for (let i = elements.length - 1; i > 0; i--) {
            const x = elements[i];
            const y = elements[i - 1];
            if (Object.is(x, y))
                continue;
            if ((x === null || x === undefined) && (y === null || y === undefined))
                continue;
            if (x === null || y === null || x === undefined || y === undefined)
                return false;
            const tx = typeof x, ty = typeof y;
            if (tx !== ty)
                return false;
            if (tx === 'object') {
                if (x instanceof Date && y instanceof Date) {
                    if (x.getTime() !== y.getTime())
                        return false;
                    continue;
                }
                if (x instanceof RegExp && y instanceof RegExp) {
                    if (x.toString() !== y.toString())
                        return false;
                    continue;
                }
                if (Array.isArray(x) || Array.isArray(y)) {
                    if (!Array.isArray(x) || !Array.isArray(y))
                        return false;
                    if (x.length !== y.length)
                        return false;
                    for (let k = 0; k < x.length; k++)
                        if (!Equals(x[k], y[k]))
                            return false;
                    continue;
                }
                const xo = x as Record<string, unknown>;
                const yo = y as Record<string, unknown>;
                const xk = Object.keys(xo);
                const yk = Object.keys(yo);
                if (xk.length !== yk.length)
                    return false;
                for (const k of xk) {
                    if (!Object.prototype.hasOwnProperty.call(yo, k))
                        return false;
                    if (!Equals(xo[k], yo[k]))
                        return false;
                }
                continue;
            }
            if (tx === 'function') {
                if ((x as () => unknown).toString() !== (y as () => unknown).toString())
                    return false;
                continue;
            }
            return false;
        }
        return true;
    }
    /** @name        Empty
     *  @public
     *  @description True when an object has no own enumerable properties. Non-objects
     *               (null / undefined / primitives) → `true`.
     *  @param       {unknown} value Subject under test.
     *  @returns     {boolean} `true` when empty (or not an object).
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export function Empty(value: unknown): boolean {
        if (value === null || value === undefined || typeof value !== 'object')
            return true;
        for (const _ in value as object)
            return false;
        return true;
    }
    /** @name        Has
     *  @public
     *  @description Check whether `target` has all the specified members. For an HTMLElement the
     *               members are checked against attributes (`getAttribute`); otherwise against `in`
     *               (own or inherited). An empty member list → `true`; a non-object target → `false`.
     *  @param       {object | null | undefined} target Subject.
     *  @param       {...string} members Member / attribute names required.
     *  @returns     {boolean} `true` when all members are present.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export function Has(target: object | null | undefined, ...members: string[]): boolean {
        if (!target || typeof target !== 'object')
            return false;
        if (members.length === 0)
            return true;
        const isElement = typeof HTMLElement !== 'undefined' && target instanceof HTMLElement;
        for (const m of members) {
            if (isElement) {
                if ((target as HTMLElement).getAttribute(m) === null)
                    return false;
            }
            else {
                if (!(m in (target as Record<string, unknown>)))
                    return false;
            }
        }
        return true;
    }
    /** @name        Clone
     *  @public
     *  @template    T
     *  @description Deep-clone a value: primitives (string / number / boolean / symbol / bigint)
     *               return as-is; functions are wrapped without runtime code generation and own keys copied; a Node
     *               is `cloneNode(true)`; Date / RegExp / Array / plain Object are cloned recursively.
     *  @param       {T} value Value to clone.
     *  @returns     {T} The clone.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export function Clone<T>(value: T): T {
        if (value === null || value === undefined)
            return value;
        const t = typeof value;
        if (t === 'string' || t === 'number' || t === 'boolean' || t === 'symbol' || t === 'bigint')
            return value;
        if (t === 'function') {
            const fn = value as unknown as (...args: unknown[]) => unknown;
            const out = function(this: unknown, ...args: unknown[]): unknown
            {
                return new.target
                    ? Reflect.construct(fn, args, new.target)
                    : Reflect.apply(fn, this, args);
            };
            const fnRec = fn as unknown as Record<string, unknown>;
            const outRec = out as unknown as Record<string, unknown>;
            for (const k of Object.keys(fnRec))
                outRec[k] = fnRec[k];
            return out as unknown as T;
        }
        if (typeof Node !== 'undefined' && value instanceof Node)
            return value.cloneNode(true) as unknown as T;
        if (value instanceof Date)
            return new Date(value.getTime()) as unknown as T;
        if (value instanceof RegExp)
            return new RegExp(value.source, value.flags) as unknown as T;
        if (Array.isArray(value))
            return value.map(v => Clone(v)) as unknown as T;
        if (t === 'object') {
            const obj = value as Record<string, unknown>;
            const out: Record<string, unknown> = {};
            for (const k of Object.keys(obj))
                out[k] = Clone(obj[k]);
            return out as unknown as T;
        }
        return value;
    }
    /** @name        Assign
     *  @public
     *  @template    T
     *  @description Mix own enumerable properties from `sources` into `target`. Special-cases ES
     *               classes: copies prototype methods onto `target.prototype` (skipping `constructor`),
     *               and, when the class is constructable with no args, its instance fields onto the
     *               prototype's parent. `null` / `undefined` sources are skipped.
     *  @param       {T} target Destination object.
     *  @param       {...unknown} sources Sources (plain objects or ES classes).
     *  @returns     {T} The mutated `target`.
     *  @throws      {TypeError} When `target` is `null` / `undefined`.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export function Assign<T extends object>(target: T, ...sources: unknown[]): T {
        if (target === null || target === undefined)
            throw new TypeError('Cannot convert first argument to object');
        const to = Object(target) as Record<string, unknown>;
        for (const source of sources) {
            if (source === null || source === undefined)
                continue;
            if (typeof source === 'function' && /^\s*class[\s{]/.test(Function.prototype.toString.call(source))) {
                const ctor = source as new () => object;
                const targetCtor = target as unknown as {
                    prototype?: Record<string, unknown>;
                };
                if (!targetCtor.prototype)
                    continue;
                for (const k of Object.getOwnPropertyNames(ctor.prototype)) {
                    if (k !== 'constructor')
                        targetCtor.prototype[k] = (ctor.prototype as Record<string, unknown>)[k];
                }
                try {
                    const instance = new ctor() as Record<string, unknown>;
                    const proto = Object.getPrototypeOf(targetCtor.prototype) as Record<string, unknown> | null;
                    if (proto)
                        for (const k of Object.getOwnPropertyNames(instance))
                            if (k !== 'constructor')
                                proto[k] = instance[k];
                }
                catch { /* class with required ctor args — skip */ }
                continue;
            }
            const src = Object(source) as Record<string, unknown>;
            for (const k of Object.keys(src)) {
                const desc = Object.getOwnPropertyDescriptor(src, k);
                if (desc?.enumerable)
                    to[k] = src[k];
            }
        }
        return target;
    }
    /** @name        Extends
     *  @public
     *  @description Mixin-style runtime class extension. Variadic: `Extends(A, B, C)` makes `A` extend
     *               `B` and `B` extend `C` (left-to-right), via `setPrototypeOf` on both the prototype
     *               and the constructor. SSR-safe; native built-ins that resist re-parenting are
     *               skipped. Fewer than 2 args returns the first (or `undefined`).
     *  @param       {...unknown} classes Constructors, from subclass to superclass.
     *  @returns     {unknown} The first (most-derived) class.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     *  @example     Core.Extends(A, B);  // A inherits B's prototype
     */
    export function Extends(...classes: unknown[]): unknown {
        if (classes.length < 2)
            return classes[0];
        for (let i = 0; i < classes.length - 1; i++) {
            const Sub = classes[i];
            const Super = classes[i + 1];
            if (typeof Sub !== 'function' || typeof Super !== 'function')
                continue;
            const SubF = Sub as unknown as {
                prototype: object;
            };
            const SuperF = Super as unknown as {
                prototype: object;
            };
            if (!SubF.prototype || !SuperF.prototype)
                continue;
            try {
                Object.setPrototypeOf(SubF.prototype, SuperF.prototype);
                Object.setPrototypeOf(SubF, SuperF);
            }
            catch { /* native built-ins may resist — skip */ }
        }
        return classes[0];
    }
}

export default Core;

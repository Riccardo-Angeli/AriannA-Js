import { Core } from "./Core.ts";

export namespace Namespaces
{
    /** @namespace   Types
     *  @memberof    Core
     *  @description Shared structural type aliases used across the kernel — the
     *               constructor/interface shapes that the descriptors and `Define`
     *               rely on. Names are distinct from the descriptor's field names
     *               (`Constructor`/`Interface`) to avoid self-referential overlap.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export namespace Types
    {

    }

    /** @namespace Descriptors
     *  @memberof  Namespace
     *  @author    Riccardo Angeli
     *  @copyright Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license MIT / Commercial (dual license)
     *  @description Runtime registry descriptors — the shapes stored in the live
     *               registry maps and read on the hot path.
     */
    export namespace Descriptors
    {
        /** URL schema/spec (in html coincide con Uri) */
        export interface Namespace
        {
            /** @name        Name
             *  @public
             *  @type        {string}
             *  @description Namespace name: 'html' | 'svg' | 'mathML' | 'x3d' | ….
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Name          : string;
            /** @name        Uri
             *  @public
             *  @type        {string}
             *  @description URI used by `createElementNS` (e.g.
             *               'http://www.w3.org/2000/svg').
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Uri           : string;
            /** @name        NS
             *  @public
             *  @type        {boolean}
             *  @description Namespaced flag: `true` → `createElementNS(Uri, tag)`,
             *               `false` → `createElement` (html).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            NS            : boolean;
            /** @name        Base
             *  @public
             *  @type        {(new (...args: unknown[]) => Element) | null}
             *  @description Native base constructor (HTMLElement, SVGElement,
             *               MathMLElement, …); `null` when none applies.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Base          : (new (...args: unknown[]) => Element) | null;
            /** @name        Schema
             *  @public
             *  @type        {string}
             *  @description Schema/spec URL (coincides with `Uri` for html).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Schema        : string;
            /** @name        Documentation
             *  @public
             *  @type        {{ w3c: string }}
             *  @description Reference documentation links for the namespace.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Documentation : { w3c: string };
            /** @name        Types
             *  @public
             *  @type        {{ Standard: Record<string, { Tags: string[] }>; Custom: Record<string, { Tags: string[] }> }}
             *  @description Declarative seed of the namespace's types, split in two: `Standard`
             *               (pre-registered native interfaces → their tags, e.g.
             *               { HTMLDivElement: { Tags: ['div'] }, … }) and `Custom` (user-defined
             *               types, empty at seed time). Serializable config/identity — the live
             *               materialized registry (Interfaces/Tags of descriptors) lives on the
             *               Namespace class, not here.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Types         :
                {
                    /** @name        Standard
                     *  @public
                     *  @namespace   Descriptor
                     *  @memberOf    Namespace
                     *  @type        {{ Interfaces: Record<string, Descriptors.Type>; Tags: Record<string, Descriptors.Type> }}
                     *  @description Built-in namespace interfaces, materialized at construction
                     *               from the descriptor seed. `Interfaces`: interface name →
                     *               descriptor; `Tags`: tag → descriptor.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license)
                     */
                    Standard : { Interfaces: Record<string, { Tags : string[] } >; Tags: Record<string, string> };
                    /** @name        Custom
                     *  @public
                     *  @namespace   Descriptor
                     *  @memberOf    Namespace
                     *  @type        {{ Interfaces: Record<string, Descriptors.Type>; Tags: Record<string, Descriptors.Type> }}
                     *  @description User-defined types registered at runtime via Define. Empty
                     *               at construction; same shape as `Standard`.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license)
                     */
                    Custom   : { Constructors: Record<string, { Tags : string[] } >; Tags: Record<string, string> };
                };
            /** @name        Enabled
             *  @public
             *  @type        {boolean}
             *  @description Operational flag: the namespace is active and serving Create/Update/Define.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Enabled       : boolean,
            /** @name        Disabled
             *  @public
             *  @type        {boolean}
             *  @description Operational flag: the namespace is inactive. Inverse of `Enabled`.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Disabled      : boolean,
            /** @name        State
             *  @public
             *  @type        {boolean}
             *  @description Validity of the namespace descriptor itself (`true` = healthy/usable),
             *               analogous to `Type.State`; distinct from the operational `Enabled`/`Disabled`.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            State         : boolean,
            /** @name        Loading
             *  @public
             *  @type        {boolean}
             *  @description Async-load status — `true` while this namespace's deferred
             *               resources (e.g. its component ESM modules) are being
             *               fetched and registered. The *in-progress* edge: pairs with
             *               `Loaded` (the *completed* edge). Both are `false` before any
             *               load starts. Orthogonal to `Enabled` (operational/serving).
             *  @default     false
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Loading     : boolean;
            /** @name        Loaded
             *  @public
             *  @type        {boolean}
             *  @description Async-load status — `true` once this namespace's deferred
             *               resources have finished loading and registering. The
             *               *completed* edge, distinct from `Loading` (in progress).
             *               Also distinct from `Enabled`: a namespace can be `Loaded`
             *               yet `Disabled` (loaded but not serving Create/Upgrade/Define).
             *  @default     false
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Loaded      : boolean;
            /** @name        Root
             *  @public
             *  @type        {Element | null}
             *  @description Root element under which this namespace mounts and observes
             *               its elements; `null` when unbound (e.g. SSR before attach,
             *               or document-wide observation). Per-namespace — distinct from
             *               the facade's `Core.Root`, which is the whole document root
             *               (`document.documentElement`).
             *  @default     null
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Root        : Window | null
        }

        /** @author    Riccardo Angeli
         *  @copyright Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license MIT / Commercial (dual license)
         *  @interface Type
         *  @memberof  Core.Descriptors
         *  @description Descriptor of a type in the namespace registry (formerly
         *               `TypeDescriptor`).
         *
         *               It carries two independent, complementary status axes:
         *               `State` concerns the descriptor itself — the outcome of its
         *               construction/registration (intact, degraded, unusable) — while
         *               `Supported`/`Defined` concern the type relative to its
         *               namespace (native interface present in the environment / type
         *               registered).
         *
         *               The optional triplet `Slot`/`Properties`/`Methods` appears only
         *               for fragile native forms (those with internal slots) and
         *               travels together: the presence of any one marks the type as
         *               fragile; their absence means a direct native extension.
         */
        export interface Type
        {
            /** @name        Name
             *  @public
             *  @type        {string}
             *  @description Identifying name of the type — the DOM interface name for
             *               standard types, the custom name otherwise.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Name        : string,
            /** @name        Tags
             *  @public
             *  @type        {string[]}
             *  @description Tags that instantiate this type. A type may own several
             *               (e.g. `h1`…`h6` all map to HTMLHeadingElement).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Tags        : string[],
            /** @name        Namespace
             *  @public
             *  @type        {Namespace}
             *  @description Owning namespace (identity: html / svg / mathML / x3d / …).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Namespace   : string,
            /** @name        Constructor
             *  @public
             *  @type        {Constructor | null}
             *  @description Effective constructor used to instantiate the type — a class
             *               or a function. Its return is NOT necessarily an `Element`
             *               (it may yield a wrapper, a Real, any object). `null` when
             *               unresolved.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Constructor : Core.Types.Constructor | null,
            /** @name        Interface
             *  @public
             *  @type        {Interface | null}
             *  @description Reference native DOM interface (HTMLDivElement, SVGSVGElement,
             *               …) — always an `Element` constructor. `null` when absent from
             *               the environment.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Interface   : Core.Types.Constructor | false |null,
            /** @name        Base
             *  @public
             *  @type        {Core.Types.Constructor | false | null}
             *  @description The base as DECLARED at Define time, which is not always the native
             *               `Interface`. When the declared super is a user class — `class Base
             *               extends HTMLDivElement`, or a multi-level L1→L2→L3 chain — the two
             *               diverge: `Interface` is the first patched IDL found by climbing
             *               (what the element is minted from, since only a native tag can be
             *               created), while `Base` is the constructor the user actually named
             *               (what the prototype must be grafted onto).
             *
             *               They were the same field before, and `Promote` grafted a FUNCTION
             *               constructor straight onto `Interface.prototype` — skipping every
             *               intermediate user class, so their methods silently vanished from the
             *               element. A CLASS was unaffected, since its own chain already carries
             *               them and `Prototype` records it whole.
             *
             *               `false`/`null` when the declared base IS the native interface, in
             *               which case `Interface` alone is the answer.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Base        : Core.Types.Constructor | false | null,
            /** @name        Prototype
             *  @public
             *  @type        {object | null}
             *  @description Prototype captured at registration, used for the prototype
             *               splice during upgrade; `null` when not available.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Prototype   : object | null,
            /** @name        Supported
             *  @public
             *  @type        {boolean}
             *  @description Type status within the namespace: the native interface is
             *               supported by the environment.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Supported   : boolean,
            /** @name        Defined
             *  @public
             *  @type        {boolean}
             *  @description Type status within the namespace: the type is registered /
             *               defined.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Defined     : boolean,
            /** @name        Patched
             *  @public
             *  @type        {boolean}
             *  @description Whether this type's native constructor has been wrapped by
             *               `_patchNative` (super()-capable). Distinct from `Defined`,
             *               which only marks the type as registered and is `true` for
             *               every supported native regardless of patching — so it can't
             *               gate the patch. Idempotency marker: the patch pass skips a
             *               native whose `Patched` is already `true`. Live runtime field,
             *               not emitted by the serializer.
             *  @default     false
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Patched     : boolean,
            /** @name        Upgraded
             *  @public
             *  @type        {boolean}
             *  @description Whether this type's native constructor has been wrapped by
             *               `_patchNative` (super()-capable). Distinct from `Defined`,
             *               which only marks the type as registered and is `true` for
             *               every supported native regardless of patching — so it can't
             *               gate the patch. Idempotency marker: the patch pass skips a
             *               native whose `Patched` is already `true`. Live runtime field,
             *               not emitted by the serializer.
             *  @default     false
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Upgraded    : boolean,
            /** @name        Declaration
             *  @public
             *  @type        {'FUNCTION' | 'CLASS' | 'CUSTOM'}
             *  @description Declaration form: function, class with `extends`, or custom
             *               element.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Declaration : Core.Types.Declaration,
            /** @name        Type
             *  @public
             *  @type        {'STANDARD' | 'CUSTOM'}
             *  @description Type category: a namespace standard or a user custom type.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Type        : 'STANDARD' | 'CUSTOM',
            /** @name        Standard
             *  @public
             *  @type        {boolean}
             *  @description Convenience boolean: `true` for a namespace standard
             *               (mirrors `Type === 'STANDARD'`).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Standard    : boolean,
            /** @name        Custom
             *  @public
             *  @type        {boolean}
             *  @description Convenience boolean: `true` for a user custom type (mirrors
             *               `Type === 'CUSTOM'`).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Custom      : boolean,
            /** @name        Component
             *  @public
             *  @type        {boolean}
             *  @description Convenience boolean: `true` when this custom type was defined through the
             *               Component (Layer 2) factory. Orthogonal to both `Type` and `Declaration`:
             *               a Component is `Type: 'CUSTOM'`, `Declaration: 'CLASS'`, `Component: true`
             *               — the flag carries the layer distinction WITHOUT extending either enum
             *               (no `'COMPONENT'` Type value, no Component Declaration form, mirroring how
             *               a class is a `Declaration` not a `Type`). COEXISTS with `Custom`: a
             *               Component descriptor has BOTH `Custom: true` and `Component: true`; plain
             *               customs have `Component: false`. Set by the Component factory after Reserve
             *               (`descriptor.Component = true`), before Promote.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Component   : boolean,
            /** @name        Css
             *  @public
             *  @type        {string}
             *  @description Compiled CSS for this type — the single source of truth for its
             *               styling (replaces the former flat `Style` map). Holds everything:
             *               flat declarations, `@media`, `@keyframes`, pseudo-states, nested
             *               selectors. Applied by injecting a `<style>` block. `''` when the
             *               type has no style (standard natives fall back to UA styles). The
             *               merge of base + custom styles happens upstream in `Define`, before
             *               compilation, so the descriptor always holds the final fused text.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Stylesheet  : string | null;
            /** @name        Methods
             *  @public
             *  @type        {string[]=}
             *  @description Names of methods forwarded to the inner native element
             *               (fragile forms only).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Shadow?     : { Mode: 'open'|'closed', Setting?: any, Css?: boolean, DelegatesFocus?: boolean },
            /** @name        Methods
             *  @public
             *  @type        {string[]=}
             *  @description Names of methods forwarded to the inner native element
             *               (fragile forms only).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Template?   : { Ref?: string, Html?: string, Mode?: 'clone'|'compile' } | null,
            /** @name        Native
             *  @public
             *  @type        {boolean}
             *  @description Registration path: `true` via the browser-native
             *               `customElements.define`, `false` via the AriannA registry.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Native      : boolean,
            /** @name        Chain
             *  @public
             *  @type        {Map<string, unknown>}
             *  @description Prototype chain captured at registration (name → constructor).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Chain?      : string[],
            /** @name        Slot
             *  @public
             *  @type        {'Internal' | 'External'=}
             *  @description Placement of the backing native for forms with internal
             *               slots: `Internal` → inside a shadow root (isolated;
             *               presentational: canvas/img/video/audio), `External` → in
             *               light DOM (participates in form/label/AOM:
             *               input/select/textarea). Absent ⟹ the type is not fragile
             *               (it extends the native directly). The install logic
             *               (compose inner native + forward) lives in Real / an IoC
             *               installer, not here.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Slot?       : 'Internal' | 'External' | null,
            /** @name        State
             *  @public
             *  @type        {'Fail' | 'Warn' | 'Success'}
             *  @description Status of the descriptor itself (construction/registration
             *               outcome): `Success` intact, `Warn` degraded but usable,
             *               `Fail` unusable. Orthogonal to `Supported`/`Defined`, which
             *               describe the type within its namespace.
             *  @default     'Success'
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            State       : 'Fail' | 'Warn' | 'Success' | 'Pending' | null,
            /** @name        Properties
             *  @public
             *  @type        {string[]=}
             *  @description Names of properties forwarded to the inner native element
             *               (fragile forms only).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Attributes? : string[] | null,
            /** @name        Properties
             *  @public
             *  @type        {string[]=}
             *  @description Names of properties forwarded to the inner native element
             *               (fragile forms only).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Render?     : string[] | null,
            /** @name        Properties
             *  @public
             *  @type        {string[]=}
             *  @description Names of properties forwarded to the inner native element
             *               (fragile forms only).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Properties? : string[] | null,
            /** @name        Methods
             *  @public
             *  @type        {string[]=}
             *  @description Names of methods forwarded to the inner native element
             *               (fragile forms only).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Methods?    : string[] | null
            /** @name        Properties
             *  @public
             *  @type        {string[]=}
             *  @description Names of properties forwarded to the inner native element
             *               (fragile forms only).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Brokers?    : string[] | null,
        }
    }

    /** @class       Namespace
     *  @memberof    Core
     *  @classdesc   Per-namespace registry engine (html / svg / mathML / x3d / …). Holds the
     *               namespace identity (`Name` / `Uri` / `NS` / `Base` / `Schema`) and the live,
     *               runtime-mutable type tables (`Types.Standard` / `Types.Custom`, plus the flat
     *               `Tags` mirror), and owns the per-namespace operations: `GetDescriptor`, `Create`
     *               (createElement vs createElementNS), `Define` (register a Custom type), `Upgrade`
     *               (prototype splice), and `Initialize` (native patching + Supported back-fill).
     *               Self-registers into `Core.Namespaces` in its constructor (§6). The serializable
     *               snapshot is the computed `Descriptor` getter.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export class Namespace
    {
        /** @name        Namespaces
         *  @public
         *  @type        {Record<string, Namespace>}
         *  @description Live registry of installed namespaces, keyed by name (html / svg / mathML /
         *               x3d / …). Populated by `Install()` and by each `new Namespace(...)`; scanned by
         *               `GetDescriptor` and the `Get*` helpers.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static readonly Namespaces : Record<string, Namespace> = {};

        /** @name        #pending
         *  @private
         *  @static
         *  @readonly
         *  @type        {WeakSet<Element>}
         *  @description Nodes with an upgrade IN FLIGHT. Reentrancy guard: the user body, a lifecycle hook
         *               or a mutation observer can reach Upgrade again on the same node while the first call
         *               is still inside it, and without this the second pass would splice and run everything
         *               a second time. Added on entry, removed in a `finally`, so a body that throws does
         *               not leave the node locked out forever.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static readonly #pending   : WeakSet<Element> = new WeakSet();

        /** @name        #upgraded
         *  @private
         *  @static
         *  @readonly
         *  @type        {WeakSet<Element>}
         *  @description Nodes whose lifecycle has already run. Per-INSTANCE state, so it cannot live on the
         *               descriptor: `Upgraded` there is per-type and the first promoted node would silence
         *               every other one. Membership set only, and GC-friendly — a node that leaves the
         *               document drops out on its own, with nothing to clean up. Guards the lifecycle
         *               alone; the prototype splice keeps its own structural check, which is a different
         *               question and a cheaper one.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static readonly #upgraded  : WeakSet<Element> = new WeakSet();

        /** @name        Name
         *  @public
         *  @readonly
         *  @type        {string}
         *  @description Short namespace identifier — 'html' | 'svg' | 'mathML' |
         *               'x3d' | 'latex' | … . Key under which the namespace is
         *               registered in the module-private `namespaces` registry.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        readonly Name: string;

        /** @name        Uri
         *  @public
         *  @readonly
         *  @type        {string}
         *  @description Namespace URI passed to `createElementNS` (e.g.
         *               'http://www.w3.org/2000/svg'); empty for plain html.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        readonly Uri: string;

        /** @name        NS
         *  @public
         *  @readonly
         *  @type        {boolean}
         *  @description Namespaced flag: `true` → instantiate via
         *               `createElementNS(Uri, tag)`, `false` → via `createElement`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        readonly NS: boolean;

        /** @name        Base
         *  @public
         *  @readonly
         *  @type        {new (...args: never[]) => Element}
         *  @description Root native constructor of this namespace (HTMLElement,
         *               SVGElement, MathMLElement, …); the `super()` target for
         *               class-form extensions.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        readonly Base: new (...a: never[]) => Element;

        /** @name        Types
         *  @public
         *  @readonly
         *  @type        {{ Standard: { Interfaces: Record<string, Descriptors.Type>; Tags: Record<string, Descriptors.Type> }; Custom: { Interfaces: Record<string, Descriptors.Type>; Tags: Record<string, Descriptors.Type> } }}
         *  @description Live materialized registry of this namespace's types, split
         *               into `Standard` and `Custom`. Runtime-mutable mirror; the
         *               serializable seed lives in the descriptor's `Types`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        readonly Types :
        {
            /** @name        Standard
             *  @public
             *  @type        {{ Interfaces: Map<string, Descriptors.Type>; Tags: Map<string, Descriptors.Type> }}
             *  @memberof    Namespace.Types
             *  @namespace   Core
             *  @description Built-in namespace interfaces, materialized at construction
             *               from the descriptor seed. `Interfaces`: interface name →
             *               descriptor; `Tags`: tag → the SAME descriptor (shared ref).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Standard : { Interfaces: Map<string, Descriptors.Type>; Tags: Map<string, Descriptors.Type> };
            /** @name        Custom
             *  @public
             *  @type        {{ Interfaces: Map<string, Descriptors.Type>; Tags: Map<string, Descriptors.Type> }}
             *  @memberof    Namespace.Types
             *  @namespace   Core
             *  @description User-defined types registered at runtime via `Define`. Empty
             *               at construction; same shape as `Standard` (`Interfaces` + `Tags`,
             *               shared-ref descriptors).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Custom   : { Interfaces: Map<string, Descriptors.Type>; Tags: Map<string, Descriptors.Type> };
        }

        /** @name        #typeStyles
         *  @private
         *  @type        {Map<string, HTMLStyleElement>}
         *  @description Tag → the single injected type-level `<style>` node this namespace
         *               owns for that tag. Lets `Define` replace (redefine) or rewrite a
         *               tag's type CSS by holding a direct reference — no `data-*` marker on
         *               the node and no DOM scan. Ownership lives here precisely so the
         *               `<style>` stays an anonymous `<style>`: a marker attribute would make
         *               `GetDescriptor` mis-resolve it as an instance of the tag and the
         *               Observer would "upgrade" it. Hard-private; mutated only by `Define`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        readonly #typeStyles = new Map<string, HTMLStyleElement>();

        /** @name        Schema
         *  @public
         *  @readonly
         *  @type        {string}
         *  @description Schema/spec URL of the namespace (coincides with `Uri` for
         *               html); used for documentation and validation references.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        readonly Schema: string;

        /** @name        Documentation
         *  @public
         *  @readonly
         *  @type        {{ w3c?: string }}
         *  @description Reference documentation pointers for the namespace.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        readonly Documentation : { w3c?: string };

        /** @name        Enabled
         *  @public
         *  @readonly
         *  @type        {boolean}
         *  @description Operational flag: the namespace is active and serving
         *               Create / Upgrade / Define.
         *  @default     true
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        readonly Enabled  = true;

        /** @name        Disabled
         *  @public
         *  @readonly
         *  @type        {boolean}
         *  @description Operational flag: the namespace is inactive. Inverse of
         *               `Enabled`.
         *  @default     false
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        readonly Disabled = false;

        /** @name        State
         *  @public
         *  @readonly
         *  @type        {'enabled'}
         *  @description Legacy operational-state literal, retained for back-compat.
         *               Distinct from the descriptor's `State` (a boolean validity
         *               flag); these two are pending reconciliation.
         *  @default     'enabled'
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        readonly State = 'enabled' as const;

        /** @name        Tags
         *  @public
         *  @readonly
         *  @type        {Record<string, Descriptors.Type>}
         *  @description Flat tag → descriptor mirror combining `Types.Standard.Tags`
         *               and `Types.Custom.Tags` for fast single-lookup resolution.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        readonly Tags : Record<string, Descriptors.Type> = {};

        /** @name        _initialized
         *  @private
         *  @type        {boolean}
         *  @description Internal guard: `true` once `Initialize()` has run, so
         *               re-initialisation (native patching + Supported back-fill)
         *               is idempotent.
         *  @default     false
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        private _initialized = false;

        /** @name        Descriptor
         *  @public
         *  @readonly
         *  @type        {Descriptors.Namespace}
         *  @description Computed on access: serialises the live registry into a
         *               plain, serializable `Descriptors.Namespace` — `Types` as
         *               seed maps, `Tags`/`Interfaces` as string refs (§8). The
         *               canonical replacement for `toDescriptor()`.
         *  @returns     {Descriptors.Namespace} Serializable snapshot of this namespace.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        get Descriptor() : Descriptors.Namespace
        {
            const standard = Object.fromEntries
            (
                [...this.Types.Standard.Interfaces.entries()].map
                (
                    ([k, d]): [string, { Tags: string[] }] => [k, { Tags: [...d.Tags] }]
                )
            );

            const custom = Object.fromEntries
            (
                [...this.Types.Custom.Interfaces.entries()].map
                (
                    ([k, d]): [string, { Tags: string[] }] => [k, { Tags: [...d.Tags] }]
                )
            );

            const tags = Object.fromEntries
            (
                Object.entries(this.Tags).map(([k, d]): [string, string] => [k, d.Name])
            );

            const interfaces = Object.fromEntries
            (
                [
                    ...this.Types.Standard.Interfaces.entries(),
                    ...this.Types.Custom.Interfaces.entries(),
                ].map(([k, d]): [string, string] => [k, d.Name])
            );

            return {
                Name: this.Name,
                Uri: this.Uri,
                NS: this.NS,
                Base: this.Base as (new (...args: unknown[]) => Element) | null,
                Types: {Standard: standard, Custom: custom},
                Schema: this.Schema,
                Documentation: {w3c: this.Documentation.w3c ?? ''},
                Tags: tags,
                Interfaces: interfaces,
                Enabled: this.Enabled,
                Disabled: this.Disabled,
                State: this.Enabled,
                Loading: false,
                Loaded: this._initialized,
                Root: window
            } as unknown as Descriptors.Namespace;
        }

        static get Services() :  Map<string, Record<string, unknown>>
        {
            return Namespace.Services;
        }

        /** @name        Resolve
         *  @public
         *  @static
         *  @memberof    Namespaces.Namespace
         *  @param       {string | Types.Base | Node | object} query What to look up: a tag name, a constructor,
         *               a live Node, or a `{ Tag }` bag. A string is lower-cased before use; a Node is asked for
         *               `data-arianna-tag`, then `is`, then its own `nodeName`, in that order — the attributes
         *               come first because a customised built-in is a real `<button>` whose nodeName says
         *               nothing about which type it carries.
         *  @returns     {Descriptors.Type | false} The first descriptor that answers, or `false`.
         *  @description Resolve a descriptor across EVERY installed namespace — the cross-namespace counterpart
         *               of the instance method. `namespace.GetDescriptor(q)` asks one registry, this asks them
         *               all and returns the first hit, which is why it is static: it belongs to the class, not
         *               to any one instance of it.
         *
         *               Order matters inside each namespace: Standard tags, Standard interfaces, Custom tags,
         *               Custom interfaces. STANDARD FIRST, and not by accident — a Custom descriptor also
         *               matches on `Interface`, the native base it extends, so searching Custom first would let
         *               `Resolve(HTMLDivElement)` return some custom type that merely derives from it instead of
         *               the interface itself, and every consumer walking a base chain would follow the wrong
         *               link.
         *
         *               The constructor sweep runs only for a function argument, and only after the keyed
         *               lookups miss: matching on `Constructor` or `Interface` identity is a scan, and it earns
         *               its cost only when the name did not resolve on its own.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static Resolve(query: string | Core.Types.Base | Node | object): Descriptors.Type | false
        {
            if (!query) return false;

            const t = typeof query;

            let key : string;

            if (t === 'string')
            {
                key = (query as string).trim().toLowerCase();
            }
            else if (t === 'function')
            {
                key = (query as { name: string }).name.toLowerCase();
            }
            else if (query instanceof Node)
            {
                const el = query instanceof Element ? query : null;

                key = String
                (
                    el?.getAttribute?.('data-arianna-tag') ||
                    el?.getAttribute?.('is') ||
                    query.nodeName
                ).toLowerCase();
            }
            else
            {
                const o   = query as Record<string, unknown>;
                const tag = Object.keys(o).find(k => k.toUpperCase() === 'TAG');

                if (!tag) return false;

                key = String(o[tag]).toLowerCase();
            }

            if (!key) return false;

            for (const name of Object.keys(Namespace.Namespaces))
            {
                const ns  = Namespace.Namespaces[name];
                const std = ns.Types.Standard;
                const cst = ns.Types.Custom;

                const found = std.Tags.get(key)
                    ?? std.Interfaces.get(key)
                    ?? cst.Tags.get(key)
                    ?? cst.Interfaces.get(key);

                if (found) return found;

                if (t === 'function')
                {
                    for (const [k, d] of std.Interfaces)
                    {
                        if (k.toLowerCase() === key || d.Constructor === query || d.Interface === query) return d;
                    }

                    for (const [k, d] of cst.Interfaces)
                    {
                        if (k.toLowerCase() === key || d.Constructor === query || d.Interface === query) return d;
                    }
                }
            }

            return false;
        }

        /** @name        Owner
         *  @public
         *  @static
         *  @memberof    Namespaces.Namespace
         *  @param       {string | Core.Types.Base | Node | object} query What to resolve.
         *  @returns     {Namespace} The namespace that owns it, falling back to `html`.
         *  @description Which registry owns a type. The fallback is not a guess: a tag nobody has claimed is
         *               an HTML tag, because that is the namespace a bare `document.createElement` mints in.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static Owner(query: string | Core.Types.Base | Node | object): Namespace
        {
            if (typeof query === 'string' && Namespace.Namespaces[query]) return Namespace.Namespaces[query];

            let d = Namespace.Resolve(query);

            /* A user class is not registered, so Resolve returns false for it and the fallback
             * below hands back `html` — which is right only by accident when the class happens to
             * derive from an HTML interface. For `class Base extends MathMLElement` it picked the
             * WRONG namespace, and Reserve then looked MathMLElement up in the HTML Standard
             * interfaces, got `undefined`, and crashed on `ic.Supported` — a hard throw, not a
             * rejection. Climb to the nearest ancestor that IS registered: that constructor's
             * namespace is the owner. Same walk GetNativeInterface performs. */
            if (!d && typeof query === 'function')
            {
                for
                (
                    let c: unknown = Object.getPrototypeOf(query);
                    typeof c === 'function' && c !== Function.prototype;
                    c = Object.getPrototypeOf(c)
                )
                {
                    d = Namespace.Resolve(c as Core.Types.Base);
                    if (d) break;
                }
            }

            return (d && Namespace.Namespaces[d.Namespace]) || Namespace.Namespaces['html'];
        }

        /** @name        Create
         *  @public
         *  @static
         *  @memberof    Namespaces.Namespace
         *  @param       {string | Core.Types.Base} tag Tag or constructor to instantiate.
         *  @param       {unknown[]} [args] Arguments for the type's own code.
         *  @returns     {Element | false} The live node, or false.
         *  @description Cross-namespace entry point: resolves the owner, then delegates to its instance
         *               method. STATIC because picking the namespace is the question — once you have an
         *               instance you already answered it, and `namespace.Create(tag)` is the right call.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static Create(tag: string | Core.Types.Base, args: unknown[] = []): Element | false
        {
            return Namespace.Owner(tag).Create(tag, args);
        }

        /** @name        Define
         *  @public
         *  @static
         *  @memberof    Namespaces.Namespace
         *  @description Cross-namespace registration: the owner is chosen from the BASE — explicit third
         *               argument, or the constructor's own `extends` — because that is what decides which
         *               registry the type belongs in, not the tag.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static Define
        (
            tag: string,
            constructor: Core.Types.Constructor,
            baseOrOptions?: Core.Types.Constructor | Core.Types.TypeOptions,
            maybeOptions?: Core.Types.TypeOptions
        ): Core.Types.Constructor | false
        {
            /* Resolve the base to pick the owning namespace: explicit arg, or the constructor's own extends */
            const b3 = baseOrOptions as { prototype?: unknown } | undefined;
            const ee = typeof baseOrOptions === 'function' && b3?.prototype instanceof Element;

            const proto = (constructor as { prototype?: object }).prototype;

            let inherited: Core.Types.Constructor | undefined = undefined;

            if (proto)
            {
                const sp  = Object.getPrototypeOf(proto) as { constructor?: Core.Types.Constructor };
                inherited = sp?.constructor;
            }

            const base  = ee ? (baseOrOptions as Core.Types.Constructor) : inherited;
            const owner = Namespace.Owner(base as string | Core.Types.Base | Node | object);

            return owner ? owner.Define(tag, constructor, baseOrOptions, maybeOptions) : false;
        }

        /** @name        Upgrade
         *  @public
         *  @static
         *  @memberof    Namespaces.Namespace
         *  @description Cross-namespace promotion: resolves the node's owner and hands it over. Non-elements
         *               and unresolved nodes come back untouched.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static Upgrade(node: Node, hint?: Descriptors.Type): Node
        {
            if (!(node instanceof Element)) return node;

            const d = hint ?? Namespace.Resolve(node);

            if (!d) return node;

            const owner = Namespace.Namespaces[d.Namespace];

            return owner ? ((owner.Upgrade(node, d) as Element | undefined) ?? node) : node;
        }

        /** @name        constructor
         *  @public
         *  @description Constructs and **registers** the namespace in one step:
         *               materialises the `Standard` seed into live type descriptors,
         *               writes the descriptor into the module-private `namespaces`
         *               registry, and self-initialises (native patching + Supported
         *               back-fill). No external Register / Initialize ceremony.
         *  @param       {string} name — namespace identifier ('html', 'svg', …).
         *  @param       {Partial<Core.Descriptors.Namespace>} [options] — seed config;
         *               every field optional, defaults applied per field.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        constructor(name: string, options: Partial<Core.Descriptors.Namespace> = {})
        {
            this.Name           = name;
            this.Uri            = options.Uri    ?? '';
            this.NS             = options.NS     ?? false;
            this.Base           = options.Base   ?? HTMLElement;
            this.Schema         = options.Schema ?? options.Uri ?? '';
            this.Documentation  = options.Documentation ?? { w3c : '' };
            this.Types          =
                {
                    Standard :
                        {
                            Interfaces : new Map<string, Core.Descriptors.Type>(),
                            Tags       : new Map<string, Core.Descriptors.Type>()
                        },
                    Custom   :
                        {
                            Interfaces : new Map<string, Core.Descriptors.Type>(),
                            Tags       : new Map<string, Core.Descriptors.Type>()
                        }
                }

            if (options.Types?.Standard && options.Types?.Standard.Interfaces)
            {
                const std= this.Types.Standard;
                const interfaces = options.Types.Standard.Interfaces;
                const names                         = Object.keys(interfaces);
                const length                        = names.length;
                const g                                     = globalThis as Record<string, unknown>;

                for (let i = 0; i < length; i++)
                {
                    const name      = names[i];
                    const tags     = interfaces[name].Tags ?? [];          // per chiave
                    const resolved= g[name];
                    const constructor = typeof resolved === 'function' ? resolved as Core.Types.Constructor : null;
                    const parent      = constructor ? Object.getPrototypeOf(constructor) as Core.Types.IDL | null : null;

                    const d : Core.Descriptors.Type =
                        {
                            Name        : name,
                            Tags        : tags,
                            Namespace   : this.Name,
                            Constructor : constructor,
                            Interface   : parent,
                            /* Native seed: the declared base IS the native parent, so there is
                               nothing extra to record. */
                            Base        : null,
                            Prototype   : constructor ? constructor.prototype : null,
                            Supported   : constructor !== null,
                            Defined     : false,
                            Upgraded    : false,
                            Patched     : false,
                            Declaration : 'IDL',
                            Type        : 'STANDARD',
                            Standard    : true,
                            Custom      : false,
                            Component   : false,
                            Stylesheet  : '',
                            Native      : true,
                            Chain       : constructor ? Core.GetPrototypeChain(constructor) : [],
                            State       : 'Success',
                            Slot        : 'External',
                            Properties  : [],
                            Methods     : [],
                            Brokers     : null
                        };
                    std.Interfaces.set(names[i], d);

                    for(let t = 0; t < d.Tags.length; t++)
                    {
                        this.Types.Standard.Tags.set(d.Tags[t], d);
                    }
                }
            }

            Namespace.Namespaces[this.Name] = this;
            this.Initialize();
        }

        /** @name        GetDescriptor
         *  @public
         *  @description Resolve a type descriptor within this namespace from any of
         *               three query forms — a tag string, a constructor, or a live
         *               Element. Strings and Elements resolve by (lower-cased) tag
         *               against the Standard/Custom Tag and Interface registries; a
         *               constructor is matched by interface name, `Constructor`, or
         *               `Interface`, searching Custom first then Standard.
         *  @param       {string | (new () => Element) | Element} query — tag name,
         *               constructor, or element instance to resolve.
         *  @returns     {Descriptors.Type | false} The matching descriptor, or `false`
         *               when the query is empty or unresolved.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        GetDescriptor(query: string | Core.Types.Base | Element): Descriptors.Type | false
        {
            if (!query) return false;

            let key: string;

            if (typeof query === 'string')
            { key = query.trim().toLowerCase(); }
            else if (query instanceof Node)
            { key = (query as Element).tagName?.toLowerCase() ?? ''; }
            else if (typeof query === 'function')
            {
                const nk = (query as { name?: string }).name?.toLowerCase() ?? '';

                for (const d of this.Types.Standard.Interfaces.values())
                {
                    let ic = d.Constructor === query
                    let ii = d.Interface   === query;
                    if (d.Name.toLowerCase() === nk || ic || ii)
                    {
                        return d;
                    }
                }

                for (const d of this.Types.Custom.Interfaces.values())
                {
                    let ic = d.Constructor === query
                    let ii = d.Interface   === query;
                    if (d.Name.toLowerCase() === nk || ic || ii)
                    {
                        return d;
                    }
                }

                return false;
            }
            else { return false; }

            return this.Types.Standard.Tags.get(key)
                ?? this.Types.Custom.Tags.get(key)
                ?? this.Types.Standard.Interfaces.get(key)
                ?? this.Types.Custom.Interfaces.get(key)
                ?? false;
        }

        /** @name        GetDeclaration
         *  @public
         *  @description Classify a constructor into its declaration form: `'IDL'` for a native DOM
         *               interface (Element, Node, HTMLElement, HTML*Element…), `'CLASS'` for a user
         *               `class`, `'FUNCTION'` for a constructible function. Checks IDL first (a native
         *               interface is a function whose source is `[native code]` and whose prototype
         *               descends from EventTarget), then CLASS, else FUNCTION.
         *  @param       {unknown} value Constructor / class / function to classify.
         *  @returns     {'CLASS' | 'FUNCTION' | 'IDL'}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        GetDeclaration(value: unknown): Core.Types.Declaration
        {
            if (Core.Is(value as object, 'idl'))   return 'IDL';
            if (Core.Is(value as object, 'idl-patched'))   return 'IDL';
            if (Core.Is(value as object, 'class')) return 'CLASS';
            return 'FUNCTION';
        }

        /** @name        #mirror
         *  @private
         *  @param       {Descriptors.Type} d The Success descriptor to mirror into customElements.
         *  @returns     {void}
         *  @description Registers a native customElements mirror for a Custom type, but ONLY when the
         *               tag is a valid HTML autonomous custom element AND the author opts in via
         *               `Constructor.CE === true`. The mirror is a thin `HTMLElement` subclass whose
         *               reactive callbacks forward to the user element and whose constructor upgrades
         *               the instance through `Upgrade` — idempotent by Upgrade's structural guard, so
         *               no depth counter is needed. The mirror class is stored on `d.Native` (distinct
         *               from `d.Constructor`, the user class). No-op off-DOM, for non-HTML namespaces,
         *               for tags that don't opt in, or when the tag is already registered by someone
         *               else (logged). Only the `html` namespace mirrors: SVG/MathML customs render
         *               via createElementNS, not via customElements.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        RegisterNativeCustomElement(d: Descriptors.Type): void
        {
            const t                      = d.Tags[0];
            const b   = d.Interface;
            const h= globalThis.HTMLElement;

            /* Opt-in + HTML-compliance gate: html namespace, autonomous custom tag, base is HTMLElement, CE===true */
            const compliant = this.Name === 'html' && !this.NS
                && typeof customElements !== 'undefined'
                && typeof h === 'function'
                && b === (h as unknown as Core.Types.Constructor)
                && t.includes('-') && /^[a-z][a-z0-9._-]*$/.test(t)
                && (d.Constructor as { CE?: boolean } | null)?.CE === true;
            if (!compliant) return;

            /* Already registered elsewhere → warn if it isn't our own mirror, then leave it */
            const already = customElements.get(t);
            if (already)
            {
                if (already !== (d as { Native?: unknown }).Native)
                    console.warn(`[arianna] <${t}> already registered in customElements by another constructor.`); return; }

            try
            {
                const ns = this;
                const Native = class extends h
                {
                    /* Structural idempotency in Upgrade makes a depth counter unnecessary */
                    constructor() { super(); ns.Upgrade(this, d); }
                    connectedCallback()    { (this as { onConnected?: () => void }).onConnected?.(); }
                    disconnectedCallback() { (this as { onDisconnected?: () => void }).onDisconnected?.(); }
                    adoptedCallback()      { (this as { onAdopted?: () => void }).onAdopted?.(); }
                    attributeChangedCallback(n: string, o: string | null, v: string | null)
                    { (this as { onAttributeChanged?: (n: string, o: string | null, v: string | null) => void }).onAttributeChanged?.(n, o, v); }
                    static get observedAttributes(): string[] { return (d as { ObservedAttributes?: string[] }).ObservedAttributes ?? []; }
                };
                customElements.define(t, Native as unknown as CustomElementConstructor);
                (d as { Native?: unknown }).Native = Native;
            }
            catch (e) { console.warn(`[arianna] customElements mirror skipped for <${t}>:`, e); }
        }

        /** @name        patch
         *  @private
         *  @param       {string} name The native interface name to wrap on `window` (e.g. `'HTMLDivElement'`).
         *  @param       {Descriptors.Type} descriptor The Standard descriptor whose tag/prototype the wrapper mints.
         *  @returns     {void}
         *  @description Wraps a native IDL constructor on `window` so `super()` inside an AriannA subclass
         *               mints a real, correctly-tagged element instead of throwing. The wrapper reads the
         *               subclass from `new.target` (the class the `new` was issued against — during
         *               `super()` that is the user class), mints under the resolved tag, and splices the
         *               user prototype. No global scan, no descriptor mutation, no cached binding.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         *  @memberof    Namespace
         *  @namespace   Core
         */
        private PatchIDL(name: string, descriptor: Descriptors.Type): void
        {
            const win = window as unknown as Record<string, unknown>;
            const idl = win[name] as (new () => Element) | undefined;
            const tag = descriptor.Tags[0];

            if(idl && tag)
            {
                /* Closure captures: native prototype + this namespace's minting context */
                const np  = (idl as { prototype: object }).prototype;
                const ns  = this;
                const nsd = this.NS;
                const uri = this.Uri;
                const nx  = idl as unknown;

                const wrapped = function(this: Element): Element
                {
                    /* new.target is the user class during super(); falls back to the native tag/proto */
                    const nt = new.target as unknown;
                    const x  = nt as Core.Types.IDL | undefined;
                    const xw = (x && (x as unknown) !== (wrapped as unknown));
                    const xd =  xw && (x as unknown) !== nx;

                    let t: string = tag;
                    let p: object = np;

                    if(xd)
                    {
                        /* Splice the most-derived user prototype; climb to the nearest ancestor owning a
                           Custom tag so HTML mints under it (SVG/MathML always mint the native base tag) */
                        const xc = x as new (...a: unknown[]) => Element;
                        p = xc.prototype ?? np;

                        if(!nsd && name === 'HTMLElement')
                        {
                            for(let c: unknown = xc; c && c !== nx; c = Object.getPrototypeOf(c))
                            {
                                const cd = ns.GetDescriptor(c as Core.Types.Base);
                                if(cd && cd.Custom && cd.Tags[0])
                                { t = cd.Tags[0]; break; }
                            }
                        }
                    }

                    const ao = (x as unknown as { Adopt?: Element } | undefined)?.Adopt;
                    const cs = document.createElementNS.bind(document);
                    const ce = document.createElement.bind(document);
                    const el = (nsd && uri) ? cs(uri, t) : ce(t);

                    /** @description Install the type class on the freshly minted element.
                     *
                     *  The stylesheet Reserve compiles for a Custom type is scoped on
                     *  `.ConstructorName` — that class is the hook, and it is the ONLY
                     *  path-independent one: `Create` mints the native base tag and splices,
                     *  so a custom type comes out as a real <DIV> and the tag cannot serve.
                     *
                     *  It used to be installed in exactly two places — `Upgrade` (markup) and
                     *  the FUNCTION branch of `Create` — so a type declared with `class` was
                     *  styled from markup and NOWHERE else: not through Create, Real, Virtual
                     *  or `new Constructor()`. The CSS compiled correctly and simply matched
                     *  nothing, with no error on any layer.
                     *
                     *  Here is the one funnel every construction crosses. `new.target` during
                     *  `super()` is the most-derived user class, whichever route reached it —
                     *  `new MyClass()` directly, `Reflect.construct` from Create's CLASS branch,
                     *  or Real/Virtual on top of that. Only Custom descriptors get a class;
                     *  a bare `new HTMLDivElement()` leaves `xd` false and is untouched.
                     *  classList (not className) because on SVG/MathML the latter is a
                     *  read-only SVGAnimatedString. */
                    const mark = (node: Element): Element =>
                    {
                        if(xd)
                        {
                            const md = ns.GetDescriptor(x as Core.Types.Base);

                            if(md && md.Custom && md.Name && node.classList)
                            {
                                node.classList.add(md.Name);
                            }
                        }

                        return node;
                    };

                    if(ao)
                    {
                        return mark(Object.setPrototypeOf(ao, p) as Element);
                    }

                    return mark(Object.setPrototypeOf(el, p) as Element);
                };

                const nd = { value: name, configurable: true };
                const pd =
                {
                    value: np,
                    writable: false,
                    enumerable: false,
                    configurable: false
                };

                Object.defineProperty(wrapped, 'name',      nd);
                Object.defineProperty(wrapped, 'prototype', pd);

                descriptor.Patched = true;

                try
                {
                    Object.defineProperty
                    (
                        win,
                        name,
                        {
                            value: wrapped,
                            writable: true,
                            configurable: true,
                            enumerable: true
                        }
                    );
                }
                catch
                {
                    try { win[name] = wrapped; }
                    catch(e)
                    {
                        console.warn(`[arianna] could not patch ${name}:`, e);
                    }
                }
            }
        }

        /** @name        Create
         *  @public
         *  @memberof    Core.Namespace
         *  @param       {string | Types.Base} TagOrConstructor The type to instantiate. A string is trimmed
         *               and lower-cased before resolution, so `' DIV '` and `'div'` reach the same
         *               descriptor; a constructor is resolved to its own descriptor and then to the
         *               canonical `Tags[0]`, which is why passing a class never carries a tag alias while
         *               passing a string can. Types.Base and not Types.IDL: a FUNCTION-form type is a plain
         *               function with no construct signature, and it has to be accepted here just as much
         *               as a class does.
         *  @param       {unknown[]} [args] Arguments for the type's own code, defaulting to an empty array.
         *               Both custom forms receive them — a CLASS through `Reflect.construct`, a FUNCTION
         *               through the `apply` on its body. Only a standard tag drops them, having no code of
         *               its own to run.
         *  @returns     {Element | false} The live node, with its prototype spliced and its body run when
         *               the type carries one. `false` has two causes: nothing in this namespace answers to
         *               the argument, or what answers carries no tag to mint.
         *  @description The single instantiation entry point — Real, Virtual and the module-level Core.Create
         *               all end up here. Three paths, all plain standards-compliant JS: no regex, no
         *               Function-string evaluation.
         *
         *               A custom CLASS is built through its own constructor with `Reflect.construct`, which
         *               runs the user's class body natively. Its `super()` lands in the patched IDL, which
         *               mints a real node with the right tag and namespace, splices the user prototype and
         *               returns it — so calling the constructor IS the mint, and nothing further is done to
         *               it here.
         *
         *               A custom FUNCTION cannot be `new`-ed into a node at all: a plain function hands back
         *               an ordinary object whose spliced chain reaches Node.prototype but which owns no
         *               internal slots, so the first native setter it touches rejects it. It is minted as a
         *               node first, then the prototype is spliced, the type's class is added — the hook its
         *               CSS is scoped on — and the body is invoked with `apply`, legal because a FUNCTION,
         *               unlike a class constructor, can be run without `new`. Note what this deliberately
         *               does NOT do: it does not go through `Upgrade`, so `build()` runs on the markup path
         *               and not on this one. Construction and discovery are two different lifecycles here,
         *               by design and not by omission.
         *
         *               A standard tag is minted and returned as it is. Upgrade would not touch it anyway,
         *               and a custom already mirrored into `customElements` ran its own registered
         *               constructor during `createElement` — hence `Custom && !Native`, which is the exact
         *               set of nodes nobody has touched yet.
         *
         *               Two namespace rules. Which of createElement / createElementNS to use is read from the
         *               `NS` flag, never from the namespace name: the flag is declared for exactly this and
         *               keeps working for x3d and anything registered later, and the registry key stays the
         *               raw `Namespace` because `mathML` carries an inner capital. And for a custom SVG /
         *               MathML / X3D type the node is minted under the BASE tag, not the custom one — the
         *               layout engine only renders nodes whose nodeName belongs to the recognised W3C set for
         *               that namespace — while the custom prototype is still spliced on, so identity survives
         *               even though the wire name does not carry it.
         *
         *               The tag minted is the one the caller asked for, falling back to the canonical
         *               `Tags[0]`, so a descriptor answering to several tags returns the one requested.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Create(TagOrConstructor : string | Core.Types.Base, args: unknown[] = []) : Element | false
        {
            if(TagOrConstructor)
            {
                const a  : string | Core.Types.Base = TagOrConstructor;
                const ts = typeof a === 'string';
                const tf = typeof a === 'function';
                const d  = (ts || tf) ? this.GetDescriptor(a) : false;
                const t  = ts ? a.trim().toLowerCase() : '';

                if(d && d.Tags[0])
                {
                    const ns = Namespace.Namespaces[d.Namespace];

                    if(ns)
                    {
                        const cu = d.Custom;
                        const dl = d.Declaration;
                        const dn = d.Native;
                        const dp = d.Prototype;
                        const di = d.Interface;
                        const c  = d.Constructor;
                        const cf = typeof c === 'function';

                        if(cu && dl === 'CLASS' && cf)
                        {
                            const el = Reflect.construct(c, args);
                            return el instanceof Element ? el : false;
                        }

                        let tag = t || d.Tags[0];

                        if(cu && typeof di === 'function')
                        {
                            const bd = ns.GetDescriptor(di);

                            if(bd && bd.Tags[0] && (ns.NS || bd.Name !== 'HTMLElement'))
                            {
                                tag = bd.Tags[0];
                            }
                        }

                        if(tag)
                        {
                            const el = ns.NS && ns.Uri ?
                                document.createElementNS(ns.Uri, tag) :
                                document.createElement(tag);

                            if (cu && !dn && dl === 'FUNCTION' && dp && cf)
                            {
                                Object.setPrototypeOf(el, dp);
                                el.classList.add(d.Name);
                                const ac = (dp as { constructor?: unknown }).constructor;

                                if(typeof ac === 'function')
                                {
                                    (ac as (this: Element, ...a: unknown[]) => void).apply(el, args);
                                }
                            }

                            return el;
                        }
                    }
                }
            }

            return false;
        }

        /** @name        Reserve
         *  @public
         *  @param       {string} Tag The custom element tag to register (trimmed and lower-cased).
         *  @param       {Types.Constructor} Constructor The user class/function backing the type.
         *  @param       {Types.Constructor} Base The native interface the type extends (must be an IDL).
         *  @param       {Types.TypeOptions} Options Authoring configuration (css, attrs, shadow, bus, render, template, slot).
         *  @returns     {Descriptors.Type | false} The committed Pending descriptor, or `false` when any guard rejects.
         *  @description The sole write point into the type registry, and the first half of the
         *               Reserve → Promote lifecycle. Builds a COMPLETE descriptor minus the two fields
         *               that depend on the live class — `Prototype` and `Chain`, left `null`/`[]` for
         *               Promote to fill — commits it under both the Interfaces (by name) and Tags (by
         *               tag) indices, and returns it in State `'Pending'` (`Defined: false`). Does NOT
         *               splice prototypes, register a customElements mirror, or touch the DOM: that is
         *               Promote's runtime work. Every guard must pass or the whole call yields `false`,
         *               gracefully, with nothing written:
         *                 • name — the constructor has a real, identifier-shaped name (not empty,
         *                   not `'anonymous'`), so anonymous classes can't collapse onto one key;
         *                 • registry — neither the tag nor the constructor is already registered;
         *                 • kind — the base IS a native IDL and the constructor is NOT (a custom
         *                   class, not a bare interface);
         *                 • prototype — base and constructor prototypes exist, differ, and are not in
         *                   an ancestor relationship (no cycle when Promote later splices the chain).
         *               `Options` is normalized into the descriptor's runtime shapes here: `Css` is
         *               compiled via the css service, a `Shadow` string becomes a `{ Mode }` object,
         *               single `Render`/`Bus` values become one-element arrays.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         *  @memberof    Namespace
         *  @namespace   Core
         */
        private Reserve
        (
            Tag:string,
            Constructor:Core.Types.Constructor,
            Base: Core.Types.Constructor,
            Options:Core.Types.TypeOptions
        ):Descriptors.Type | false
        {
            const t: string            = Tag.trim().toLowerCase();
            const c: Core.Types.Constructor = Constructor;
            const b: Core.Types.Constructor = Base;
            const o: Core.Types.TypeOptions = Options;

            if(t && c && b)
            {
                /* Constructor name guards */
                const n  = c.name?.trim();
                const nv = !n || n === 'anonymous';
                const nr = !/^[A-Za-z_$-][\w$]*$/.test(n);

                if(!nv && !nr)
                {
                    /* Type guards */
                    const et = this.GetDescriptor(t);
                    const ec = this.GetDescriptor(c);

                    if(!et && !ec)
                    {
                        /* Prototype definitions */
                        /* The base must REACH a patched IDL, not BE one.
                         *
                         * `Core.Is(b,'idl-patched')` is true only for a registered Standard
                         * interface, so any user class used as a super — `class Base extends
                         * HTMLDivElement`, a multi-level L1→L2→L3 chain, a MathML-derived base —
                         * failed this guard, the whole body was skipped and Reserve returned
                         * `false`. Define propagated it, nothing was registered, and the symptom
                         * surfaced far away: `Resolve(tag)` came back `false`, so `Resolve(tag)
                         * .Constructor` read as `undefined` and `createElement(tag)` produced an
                         * HTMLUnknownElement. Silent on every layer.
                         *
                         * GetNativeInterface already walks the constructor chain and returns the
                         * first patched IDL, which is exactly the question being asked here — and
                         * it is the same lookup used below to pick the interface. It stays strict:
                         * a constructor that never reaches a registered native interface is still
                         * rejected, so a plain object or an unrelated class cannot slip through.
                         * It is also correct for `Element` itself, which `prototype instanceof
                         * Element` would wrongly reject.
                         *
                         * Nothing here touches the prototype splice, so `instanceof` is unaffected:
                         * the element still receives the most-derived user prototype, whose chain
                         * runs up through every intermediate class to the native one. */
                        const bi = this.GetNativeInterface(b) !== false;
                        const ci = Core.Is(c, 'idl-patched');

                        if(bi && !ci)
                        {
                            const bp = (b as { prototype?: object }).prototype;
                            const cp = (c as { prototype?: object }).prototype;

                            if(bp && cp && bp !== cp)
                            {
                                /* Prototype guards */
                                const bx   = bp.isPrototypeOf(cp);
                                const cx   = cp.isPrototypeOf(bp);
                                const dl   = this.GetDeclaration(c);
                                const dc   = dl === 'CLASS';
                                const df   = dl === 'FUNCTION'
                                const vp   = dc ? bx && !cx : df ? !bx && !cx : false;

                                if(vp)
                                {
                                    const ni = this.GetNativeInterface(b);

                                    if(ni)
                                    {
                                        /* Was `…get(ni.name)!`. The non-null assertion silences the
                                         * compiler but not reality: when Reserve runs on a namespace
                                         * that does not own `ni` the lookup returns undefined and the
                                         * code crashed further down on `ic.Supported` — a throw out of
                                         * Define, with a message naming a field nobody could trace back
                                         * to the namespace mismatch. Owner() no longer mispicks, so this
                                         * should not trigger; if it ever does, it now rejects like every
                                         * other guard here and says which interface and where. */
                                        const ic = this.Types.Standard.Interfaces.get(ni.name);

                                        if(!ic)
                                        {
                                            console.warn
                                            (
                                                `[arianna] <${t}>: interface ${ni.name} is not part of ` +
                                                `namespace '${this.Name}'.`
                                            );

                                            return false;
                                        }

                                        const cssInput =
                                            o.Css;

                                        const hasCss =
                                            cssInput !== undefined &&
                                            cssInput !== null;

                                        const escapedName =
                                            typeof CSS !== 'undefined' &&
                                            typeof CSS.escape === 'function'
                                                ? CSS.escape(n)
                                                : n;

                                        const selector =
                                            `.${escapedName}`;

                                        const css =
                                            hasCss
                                                ? Core.Services.Css?.Compile
                                                (
                                                    cssInput,
                                                    selector
                                                )
                                                : false;

                                        if
                                        (
                                            hasCss &&
                                            !css
                                        )
                                        {
                                            console.warn
                                            (
                                                `[arianna] CSS compilation failed for <${t}>.`
                                            );

                                            return false;
                                        }

                                        const shadowInput =
                                            o.Shadow;

                                        const shadow =
                                            shadowInput === 'open' ||
                                            shadowInput === 'closed'
                                                ? {
                                                    Mode: shadowInput
                                                }
                                                : shadowInput &&
                                                typeof shadowInput === 'object'
                                                    ? shadowInput
                                                    : null;

                                        const render =
                                            o.Render == null
                                                ? null
                                                : Array.isArray(o.Render)
                                                    ? o.Render
                                                    : [o.Render];

                                        const brokers =
                                            o.Bus == null
                                                ? null
                                                : Array.isArray(o.Bus)
                                                    ? o.Bus
                                                    : [o.Bus];

                                        type sht = Descriptors.Type['Shadow'];
                                        type tpt = Descriptors.Type['Template'];
                                        type slt = Descriptors.Type['Slot'];
                                        type att = Descriptors.Type['Attributes'];
                                        type rdt = Descriptors.Type['Render'];
                                        type brt = Descriptors.Type['Brokers'];

                                        const descriptor: Descriptors.Type =
                                            {
                                                Name        : n,
                                                Tags        : [t],
                                                Namespace   : this.Name,
                                                Declaration : dl,
                                                Constructor : c,
                                                Interface   : ni,
                                                /* The base the user actually named. Only worth
                                                   recording when it is NOT the native interface —
                                                   i.e. a user class super, which Promote must graft
                                                   onto so its members survive on the element. */
                                                Base        : (b !== ni ? b : null),

                                                /*
                                                 * Reserve non deve ancora salvare il prototype definitivo.
                                                 * Lo completa Promote dopo lo splice della chain.
                                                 */
                                                Prototype   : null,
                                                Chain       : [],

                                                Supported   : ic.Supported,
                                                Defined     : false,
                                                Upgraded    : false,
                                                Patched     : false,

                                                Type        : 'CUSTOM',
                                                Standard    : false,
                                                Custom      : true,
                                                Component   : false,
                                                Native      : false,

                                                State       : 'Pending',

                                                Stylesheet  : css || null,
                                                Shadow      : shadow as sht,
                                                Template    : (o.Template ?? null) as tpt,
                                                Slot        : (o.Slot ?? null) as slt,
                                                Attributes  : (o.Attrs ?? null) as att,
                                                Render      : render as rdt,
                                                Brokers     : brokers as brt,

                                                Properties  : null,
                                                Methods     : null
                                            };

                                        this.Types.Custom.Interfaces.set(n, descriptor);
                                        this.Types.Custom.Tags.set(t, descriptor);

                                        return descriptor;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return false;
        }

        /** @name        #Promote
         *  @private
         *  @param       {Descriptors.Type} d The Pending descriptor produced by `#Reserve`.
         *  @returns     {Descriptors.Type | false} The completed descriptor (State 'Success'), or
         *               `false` when the descriptor is not promotable or the class chain is invalid.
         *  @description Second phase of `Define`, and the ONLY side-effecting one: everything that
         *               touches the DOM lives here, so `#Reserve` stays pure and SSR-safe. Splices the
         *               user prototype onto the native base (CLASS forms are validated in place,
         *               FUNCTION forms are grafted), fills what Reserve left empty — `Prototype` and
         *               `Chain` — flips `State` 'Pending' → 'Success' and `Defined` false → true, then
         *               performs the go-live effects: registers the customElements mirror, injects the
         *               compiled `Css` as a scoped `<style>`, retro-upgrades matching nodes already in
         *               the document, and fires 'Defined'.
         *
         *               CONTRACT: `#Reserve` has already rejected cycles and ancestor relationships
         *               between base and constructor prototypes. That check is NOT repeated here — the
         *               only chain work left is the CLASS-form walk, which is a strictly finer test
         *               (the full prototype chain, not just the direct relation).
         *
         *               Idempotent: a descriptor already 'Success' is returned untouched.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         *  @memberof    Namespace
         *  @namespace   Core
         */
        private Promote(d: Descriptors.Type): Descriptors.Type | false
        {
            if(!d) return false;
            if(d.State === 'Success') return d;
            if (d.State !== 'Pending' || !d.Constructor || !d.Interface) { return false; }

            const c  = d.Constructor;
            /* Graft target: the DECLARED base when there is one, the native interface otherwise.
             *
             * These are the same constructor in the ordinary case, and differ only when the user
             * named a class of their own as super. Grafting onto `Interface` unconditionally —
             * which is what this line used to do — jumped straight to the native prototype and
             * skipped every intermediate user class, so a FUNCTION-declared type lost their
             * methods with no error: `this.sayHi()` simply became "not a function" at runtime.
             * A CLASS was unharmed, since its own chain already links them and `Prototype`
             * records it whole; only the FUNCTION graft below needed the distinction. */
            const b  = (d.Base || d.Interface) as Core.Types.Constructor;
            const t  = d.Tags[0];
            const cp = c.prototype;
            const bp = b.prototype;
            const em = `[arianna] <${t}>`;

            if(!t || !cp || !bp) { return false; }

            if(d.Declaration === 'CLASS')
            {
                let cm = false;

                for ( let p: object | null = cp; p; p = Object.getPrototypeOf(p))
                {
                    if(p === bp)
                    {
                        cm = true;
                        break;
                    }
                }

                if(!cm)
                {
                    console.warn(em + ` class not compatible with its base.`);
                    return false;
                }
            }
            else if(d.Declaration === 'FUNCTION')
            {
                if(Object.getPrototypeOf(cp) !== bp)
                {
                    try
                    {
                        Object.setPrototypeOf(cp, bp);
                    }
                    catch(e)
                    {
                        console.warn(em + ` function prototype could not be grafted.`, e);
                        return false;
                    }
                }

                const owner = this;

                const wrapper = function (...a: unknown[]): Element
                {
                    const el = owner.Create(t, a);

                    if(!el)
                    {
                        throw new TypeError(em + ` could not be constructed.`);
                    }

                    return el;
                };

                Object.defineProperty(wrapper, 'name', { value: c.name, configurable: true });

                wrapper.prototype = cp;

                d.Constructor = wrapper as unknown as typeof d.Constructor;
            }
            else
            {
                console.warn(em + ` unsupported declaration:`, d.Declaration);
                return false;
            }

            d.Prototype = cp;
            d.Chain     = Core.GetPrototypeChain(c);
            d.State     = 'Success';
            d.Defined   = true;

            /* ── EVENT HELPER ─────────────────────────────────────────────────────────── */
            const fire = (type: string, detail: unknown): void =>
            {
                if (typeof document === 'undefined') return;

                if (Core.Services.Events)
                {
                    try
                    {
                        Core.Services.Events.Fire
                        (
                            document,
                            {
                                Type       : type,
                                Detail     : detail,
                                Cancelable : false
                            }
                        );
                    }
                    catch (e) { console.warn(em + ` event failed for <${t}>:`, e); }
                    return;
                }

                const CE =
                    document.defaultView?.CustomEvent ??
                    globalThis.CustomEvent;

                if (typeof CE === 'function')
                {
                    try
                    {
                        document.dispatchEvent
                        (
                            new CE
                            (
                                type,
                                {
                                    detail,
                                    bubbles    : true,
                                    cancelable : false
                                }
                            )
                        );
                    }
                    catch (e) { console.warn(em + ` event failed for <${t}>:`, e); }
                }
            };

            /* ── NATIVE CUSTOM-ELEMENT MIRROR ───────────────────────────────────────────
             * PatchIDL remains the construction mechanism.
             * RegisterNativeCustomElement only mirrors descriptors that explicitly opt in.
             */
            this.RegisterNativeCustomElement(d);

            /* ── DOM GO-LIVE ──────────────────────────────────────────────────────────── */
            if (typeof document !== 'undefined')
            {
                /* One scoped stylesheet per custom tag. */
                if (d.Stylesheet)
                {
                    try
                    {
                        this.#typeStyles.get(t)?.remove();
                        const style = document.createElement('style');
                        style.setAttribute( 'data-arianna-style', t);
                        style.textContent = d.Stylesheet;
                        (
                            document.head ??
                            document.documentElement
                        )?.appendChild(style);
                        this.#typeStyles.set(t, style);
                    }
                    catch {}
                }

                const nodes = document.getElementsByTagName(t);

                for (const node of Array.from(nodes)) { this.Upgrade(node, d) };
            }

            /* ── DEFINED EVENT ────────────────────────────────────────────────────────── */
            fire('Defined', { Descriptor: d } );

            return d;
        }

        /** @name        Define
         *  @public
         *  @param       {string} tag The custom element tag to register (lowercased vocabulary name).
         *  @param       {Types.Constructor} constructor The user class or function backing the type.
         *  @param       {Types.Constructor | Types.TypeOptions} [baseOrOptions] Two forms, discriminated at
         *               runtime per §4.3: the EXPLICIT base — a constructor whose `.prototype instanceof
         *               Element` — or, when it is not such a constructor, the OPTIONS object (in which case
         *               the base is read from the constructor's own `extends`).
         *  @param       {Types.TypeOptions} [maybeOptions] The options object, supplied only in the explicit
         *               form (when arg 3 is the base).
         *  @returns     {Types.Constructor | false} The user constructor, now promoted and live, or `false`
         *               when Reserve rejects the type (a guard fails) or no base can be resolved.
         *  @description The thin composition at the heart of the lifecycle: `Promote(Reserve(...))`. Define
         *               owns no registration logic of its own — it parses the two documented overloads,
         *               resolves the base, and hands off. Reserve builds and commits the Pending descriptor
         *               (the sole registry write, all guards); Promote completes it (prototype splice, Chain,
         *               State → Success, DOM go-live, `Defined` event). The overload split: a third argument
         *               that is a function with an Element prototype is the explicit base, and arg 4 is the
         *               options; otherwise arg 3 is the options and the base is the constructor's own super,
         *               read via `Object.getPrototypeOf(constructor.prototype).constructor`. Returns the user
         *               constructor verbatim — the v2 model wraps nothing, so callers get back exactly what
         *               they passed, now defined. NOTE: this is the plain-custom path (`Component: false`);
         *               the Component (Layer 2) factory composes the same Reserve/Promote pair but flips
         *               `descriptor.Component = true` between the two calls.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         *  @memberof    Namespace
         *  @namespace   Core
         */
        Define
        (
            tag: string,
            constructor: Core.Types.Constructor,
            baseOrOptions?: Core.Types.Constructor | Core.Types.TypeOptions,
            maybeOptions?: Core.Types.TypeOptions
        ): Core.Types.Constructor | false
        {
            if(typeof tag !== 'string' || typeof constructor !== 'function')
            {
                return false;
            }

            const t  = tag.trim().toLowerCase();
            /* Overload discrimination: is argument 3 a BASE or the options bag?
             *
             * Same widening as Reserve's guard, and it must match it or the two disagree:
             * with the narrow `idl-patched` test a user-class base like `Base extends
             * HTMLDivElement` was not recognised as a base, so it fell through to `v` and was
             * read as the options bag — while the real base silently became the constructor's
             * own (Object-rooted) super. A function that reaches a patched IDL is a base; an
             * options bag is a plain object and never does. */
            const bi = typeof baseOrOptions === 'function' &&
                       this.GetNativeInterface(baseOrOptions as Core.Types.Base) !== false;
            const cp  = constructor.prototype;
            const gc = cp ? Object.getPrototypeOf(cp) : null;
            const sc = gc?.constructor as Core.Types.Constructor | undefined;
            const b  = bi ? baseOrOptions as Core.Types.Constructor : sc;
            const v  = (bi ? maybeOptions : baseOrOptions);

            /* Positional-CSS compatibility.
             *
             * The legacy signature was Define(tag, ctor, base, style) — the CSS as the
             * fourth POSITIONAL argument. The current one is Define(tag, ctor, base, Options),
             * where the CSS lives under Options.Css. Passing the old shape to the new
             * signature dropped the styles in COMPLETE SILENCE: the raw CSS object landed in
             * `o`, no TypeOptions key matched, Reserve compiled nothing, and the element
             * upgraded correctly but unstyled.
             *
             * So: an object argument carrying NONE of the seven TypeOptions keys cannot be
             * an options bag — it is a style source. Wrap it as { Css }. Non-plain values
             * (a Css.Rule / Css.Stylesheet instance, an array of Rules, a raw CSS string)
             * are style sources too and take the same route. Reserve hands whatever this is
             * to Css.Compile, which already accepts every one of those shapes.
             *
             * An empty object stays an (empty) options bag: `{}` says "no options", not
             * "empty stylesheet", and treating it as CSS would be a pointless compile. */
            const OPTION_KEYS = ['Css', 'Attrs', 'Shadow', 'Bus', 'Render', 'Template', 'Slot'];

            const isOptions =
                v !== null &&
                typeof v === 'object' &&
                Object.getPrototypeOf(v) === Object.prototype &&
                !Array.isArray(v) &&
                (Object.keys(v).length === 0 || OPTION_KEYS.some(k => k in (v as object)));

            const o =
                v === undefined || v === null
                    ? {}
                    : isOptions
                        ? (v as Core.Types.TypeOptions)
                        : ({ Css: v } as unknown as Core.Types.TypeOptions);

            if(!t || !b) { return false; }

            const d = this.Reserve(t, constructor, b, o) as Descriptors.Type;

            if(!d) { return false; }

            const p = d && this.Promote(d);

            if (!p)
            {
                this.Types.Custom.Interfaces.delete(d.Name);
                this.Types.Custom.Tags.delete(d.Tags[0]);

                return false;
            }

            return p ? p.Constructor as Core.Types.Constructor : false;
        }

        /** @name        Upgrade
         *  @public
         *  @param       {Element} node The node to promote. Anything that is not an Element is handed back
         *               untouched, so callers may pass whatever a MutationObserver gave them.
         *  @param       {Descriptors.Type} [descriptor] The type to promote it to. Resolved from the node's
         *               own tag when omitted — pass it when you already have it, which every internal caller
         *               does, to skip the registry lookup.
         *  @returns     {Element} The SAME node, always. Upgrade never substitutes: whatever came in is what
         *               goes out, promoted in place.
         *  @description Promote a node that already exists to its custom type. One flow, no recursive
         *               substitution — the legacy model. The node's prototype is spliced to the type's, the
         *               type's class is added (the hook its CSS is scoped on), and for a FUNCTION form the
         *               user body is run ON the node, which is legal because a plain function can be invoked
         *               without `new`.
         *
         *               A CLASS form gets the prototype and nothing else. Its constructor is NOT re-run here
         *               and cannot be: an ES class constructor has no legal way to take an object that
         *               already exists as its `this`. Construction and discovery are two different
         *               lifecycles, and this is the discovery one.
         *
         *               The body is read from the prototype's own `constructor`, never from the descriptor's
         *               `Constructor` — Promote replaces that with a factory that mints a fresh element, so
         *               calling it here would build a second node and run the body on the wrong one.
         *
         *               MARKUP WINS. Attributes and inner HTML are captured BEFORE the body runs and put
         *               back after, so what the author wrote in the document survives what the type writes
         *               to itself. The attribute capture must be a copy: `node.attributes` is a live
         *               NamedNodeMap, and holding it would hand back the body's own values instead of the
         *               author's. Inner HTML is restored only when there was some, so a body filling an
         *               empty element is not wiped by its own emptiness.
         *
         *               Two guards, for two different things. The prototype splice is skipped when the node
         *               already carries the type's prototype — structural, cheap, and correct even for a
         *               node this Namespace has never seen. The lifecycle is skipped when the node has been
         *               through here before, which is per-instance state and therefore lives in a WeakSet,
         *               not on the descriptor: without it an element built by Create and then discovered by
         *               the observer would run `build()` twice.
         *
         *               `onCreated` and `build` are both called, in that order — not one or the other. They
         *               are skipped only when they are literally the same function, which happens when a
         *               type defines just one of them and inherits the other.
         *
         *               LIMIT, by design of the DOM and not of this method: a node cannot gain internal
         *               slots. Splicing HTMLButtonElement.prototype onto a node the parser built as
         *               HTMLUnknownElement makes `type` findable but not usable — the native setter still
         *               rejects it. A custom type deriving from a specific built-in works when it is
         *               CONSTRUCTED, where the wire tag can be chosen, and not when it is discovered in
         *               markup written under the custom tag.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         *  @memberof    Namespace
         *  @namespace   Core
         */
        Upgrade(node: Element, descriptor?: Descriptors.Type): Element | false
        {
            if(!(node instanceof Element)) return node;
            if(Namespace.#pending.has(node)) return node;

            const d = descriptor ?? this.GetDescriptor(node);

            if(!d || !d.Custom) return node;

            Namespace.#pending.add(node);

            try
            {
                if(!(node instanceof Element)) return node;
                if(!d || !d.Custom) return node;

                const ip = (d.Interface as { prototype?: object });
                const pr = (d.Prototype ?? ip.prototype);
                const ap = Object.getPrototypeOf(node) === pr;

                if(!ap && pr)
                {
                    const na = Array.from(node.attributes, a => [a.name, a.value] as const);
                    const nh = node.innerHTML;

                    Object.setPrototypeOf(node, pr);

                    if(node.classList)
                    {
                        node.classList.add(d.Name);
                    }

                    const bf = (pr as { constructor?: unknown }).constructor;

                    if(d.Declaration === 'FUNCTION' && typeof bf === 'function')
                    {
                        try
                        {
                            (bf as (this: Element) => void).call(node);
                        }
                        catch(e)
                        {
                            console.warn(`[arianna] FUNCTION body failed for <${d.Tags[0]}>:`, e);
                        }
                    }
                    else if(d.Declaration === 'CLASS' && typeof d.Constructor === 'function')
                    {
                        const nt = function Adopted() { } as unknown as Core.Types.IDL & { Adopt: Element };

                        nt.prototype = pr;
                        nt.Adopt     = node;

                        try
                        {
                            Reflect.construct(d.Constructor, [], nt);
                        }
                        catch(e)
                        {
                            console.warn(`[arianna] CLASS constructor failed for <${d.Tags[0]}>:`, e);
                        }
                    }

                    for(const [n, v] of na)
                    {
                        node.setAttribute(n, v);
                    }

                    if(nh)
                    {
                        node.innerHTML = nh;
                    }
                }

                if(!Namespace.#upgraded.has(node))
                {
                    Namespace.#upgraded.add(node);

                    const hook = node as Element &
                        {
                            onCreated?: () => void;
                            build?: () => void;
                        };

                    try
                    {
                        hook.onCreated?.call(node);
                    }
                    catch(e)
                    {
                        console.warn(`[arianna] onCreated failed for <${d.Tags[0]}>:`, e);
                    }

                    if(hook.build !== hook.onCreated)
                    {
                        try
                        {
                            hook.build?.call(node);
                        }
                        catch(e)
                        {
                            console.warn(`[arianna] build failed for <${d.Tags[0]}>:`, e);
                        }
                    }

                    d.Upgraded = true;
                }

                return node;
            }
            finally { Namespace.#pending.delete(node); }
            return false;
        }

        /** @name        Initialize
         *  @public
         *  @description Materialise this namespace against the live environment (runs once, guarded by
         *               `_initialized`; no-op off-DOM). For each Standard interface: back-fills the
         *               descriptor with the real native constructor / interface / prototype and marks it
         *               Supported + Defined; indexes every tag → descriptor in both `Types.Standard.Tags`
         *               and the flat `Tags` mirror; and patches the native constructor once (idempotent
         *               via `descriptor.Patched`).
         *  @returns     {void}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        Initialize(): void
        {
            if (this._initialized) return;
            this._initialized = true;
            if (typeof window === 'undefined') return;

            const win = window as unknown as Record<string, unknown>;

            for (const [name, descriptor] of this.Types.Standard.Interfaces)
            {
                const native = win[name] as (new () => Element) | undefined;

                if (native && typeof native === 'function')
                {
                    descriptor.Supported   = true;
                    descriptor.Defined     = true;
                    descriptor.Constructor = native;
                    descriptor.Interface   = native;
                    descriptor.Prototype   = (native as { prototype: object }).prototype;
                    if(!descriptor.Patched)
                    {
                        this.PatchIDL(name, descriptor);
                        descriptor.Patched = true;
                    }
                }

                for (const tag of descriptor.Tags)
                {
                    this.Types.Standard.Tags.set(tag, descriptor);
                    this.Tags[tag] = descriptor;
                }
            }
        }

        /** @name        IsStandard
         *  @public
         *  @param       {type} type  Tag, constructor, IDL or node to test.
         *  @returns     {boolean} `true` when the resolved type is a namespace standard.
         *  @description Resolves the descriptor and mirrors its `Standard` facet. Absent
         *               descriptor ⟹ `false` (an unknown type is never standard).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         *  @memberof    Namespace
         *  @namespace   Core
         */
        IsStandard(type: string | Core.Types.Base): boolean
        {
            const descriptor = this.GetDescriptor(type);
            return descriptor ? descriptor.Standard : false;
        }

        /** @name        IsCustom
         *  @public
         *  @param       {type} type  Tag, constructor, IDL or node to test.
         *  @returns     {boolean} `true` when the resolved type is a user custom type.
         *  @description Resolves the descriptor and mirrors its `Custom` facet. Absent
         *               descriptor ⟹ `false`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         *  @memberof    Namespace
         *  @namespace   Core
         */
        IsCustom(type: string | Core.Types.Base): boolean
        {
            const descriptor = this.GetDescriptor(type);
            return descriptor ? descriptor.Custom : false;
        }

        /** @name        IsClass
         *  @public
         *  @param       {type} type  Tag, constructor, IDL or node to test.
         *  @returns     {boolean} `true` when the type was declared as a class.
         *  @description Reads `Declaration` from the descriptor — the single source of
         *               truth. Does NOT re-run `Function.prototype.toString`: the form
         *               was decided once, at Define time.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         *  @memberof    Namespace
         *  @namespace   Core
         */
        IsClass(type: string | Core.Types.Base): boolean
        {
            const descriptor = this.GetDescriptor(type);
            return descriptor ? descriptor.Declaration === 'CLASS' : false;
        }

        /** @name        IsIDL
         *  @public
         *  @param       {type} type  Tag, constructor, IDL or node to test.
         *  @returns     {boolean} `true` when the type is a native IDL declaration.
         *  @description Reads `Declaration === 'IDL'`. Orthogonal to `Standard`: every
         *               IDL is standard, but a standard may be registered from a
         *               function/class shim on environments lacking the native.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         *  @memberof    Namespace
         *  @namespace   Core
         */
        IsIDL(type: string | Core.Types.Base): boolean
        {
            const descriptor = this.GetDescriptor(type);
            return descriptor ? descriptor.Declaration === 'IDL' : false;
        }

        /** @name        IsInterface
         *  @public
         *  @param       {type} type  Tag, constructor, IDL or node to test.
         *  @returns     {boolean} `true` when the argument IS its own reference interface.
         *  @description Distinguishes a native DOM interface (HTMLDivElement resolves to a
         *               descriptor whose `Interface` is itself) from a wrapper minted by
         *               `Define` (whose `Interface` points at the base it extends).
         *               Identity, not category: `IsIDL` asks how the type was declared,
         *               `IsInterface` asks whether this very constructor is the reference.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         *  @memberof    Namespace
         *  @namespace   Core
         */
        IsInterface(type: string | Core.Types.Base): boolean
        {
            const descriptor = this.GetDescriptor(type);
            if (!descriptor || !descriptor.Interface) return false;

            return typeof type === 'function' && descriptor.Interface === type;
        }

        /** @name        IsNamespace
         *  @public
         *  @param       {string} NamespaceName  Namespace identity to compare (html / svg / …).
         *  @returns     {boolean} `true` when this namespace carries that identity.
         *  @description Case-insensitive identity check against `this.Name`. Compares the
         *               namespace's own identity, not a URI: two namespaces never share a
         *               name within a Core.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         *  @memberof    Namespace
         *  @namespace   Core
         */
        IsNamespace(NamespaceName: string): boolean
        {
            if (typeof NamespaceName !== 'string') return false;

            return this.Name.toLowerCase() === NamespaceName.toLowerCase();
        }

        /** @name        GetNativeInterface
         *  @public
         *  @param       {Types.Base} Constructor  Constructor (or IDL) to walk up from.
         *  @returns     {Types.IDL | false}  The nearest native DOM interface in the
         *                                    constructor chain, or `false` if none.
         *  @description Walks the CONSTRUCTOR chain — `Object.getPrototypeOf` applied to
         *               the constructor itself, which climbs the `extends` links, NOT the
         *               prototype chain used for instances — from `Constructor` upward, and
         *               returns the first link that is a native IDL interface. From
         *               `class MyButton extends HTMLButtonElement` it returns
         *               `HTMLButtonElement`, the native base the custom type sits on; from a
         *               deeper `class X extends Y extends HTMLElement` it skips `Y` and
         *               returns `HTMLElement`, however many custom levels sit above the
         *               native one. An IDL passed in is returned unchanged; a chain with no
         *               native ancestor (a plain non-DOM class) yields `false`. "Native" is
         *               decided by `Core.Is(x, 'idl')` — the same `[native code]` +
         *               `Element`-in-chain test used to resolve `Declaration` — so this
         *               never drifts out of step with the rest of the type system.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         *  @memberof    Namespace
         *  @namespace   Core
         */
        GetNativeInterface(Constructor: Core.Types.Base): Core.Types.IDL | false
        {
            for
            (
                let c: unknown = Constructor;
                typeof c === 'function' && c !== Function.prototype;
                c = Object.getPrototypeOf(c)
            )
            { if (Core.Is(c, 'idl-patched')) return c as Core.Types.IDL; }
            return false;
        }
    }
}
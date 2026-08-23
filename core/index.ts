/**
 * @module      core
 * @description Canonical AriannA Core package entry point for Architecture 2.0. The barrel exposes one stable
 *              binding per module across Definitions, Kernel, Reactivity, DOM, Components and Platform,
 *              boots the kernel once, and avoids compatibility aliases already owned by their modules.
 * @author      Riccardo Angeli
 * @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 * @license     MIT / Commercial (dual license)
 */

import { Core }       from './kernel/Core.ts';
import { Namespaces } from './dom/Namespaces.ts';
import Component      from './components/Components.ts';

/*
 * Observer is a value import by design: evaluating the module registers the observer service before
 * `Core.AriannA` starts the kernel.
 */
import './dom/Observer.ts';

/* Full distribution native/DOM metadata packs. Slim runtime profiles intentionally omit these imports. */
import './dom/Natives.ts';

export type { Types }      from './definitions/Types.ts';
export type { Interfaces } from './definitions/Interfaces.ts';

export { Core }       from './kernel/Core.ts';
export { Services }   from './kernel/Services.ts';

export { Reactive }   from './reactivity/Reactive.ts';
export { Reactivity } from './reactivity/Reactivity.ts';
export { Events }     from './reactivity/Events.ts';
export { States }     from './reactivity/State.ts';
export { Contexts }   from './reactivity/Context.ts';

export { Css }        from './dom/Css.ts';
export { Namespaces } from './dom/Namespaces.ts';
export { Observers }  from './dom/Observer.ts';
export { Reals }      from './dom/Real.ts';
export { Templates }  from './dom/Template.ts';
export { Shadows }    from './dom/Shadow.ts';

export { Virtuals }   from './components/Virtual.ts';
export { Components } from './components/Components.ts';
export { Directives } from './components/Directives.ts';
export { Jsx }        from './components/Jsx.ts';
export { Properties } from './components/Properties.ts';

export { Routers }    from './platform/Router.ts';
export { SSR }        from './platform/SSR.ts';
export { Workers }    from './platform/Workers.ts';
export { Wasm }       from './platform/Wasm.ts';
export { Plugins }    from './platform/Plugins.ts';
export { Natives }    from './dom/Natives.ts';


export { default as State }      from './reactivity/State.ts';
export { default as Context }    from './reactivity/Context.ts';
export { default as Router }     from './platform/Router.ts';
export { default as Template }   from './dom/Template.ts';
export { default as Shadow }     from './dom/Shadow.ts';
export { default as Renderer }   from './platform/SSR.ts';
export { default as Worker }     from './platform/Workers.ts';
export { default as Real }       from './dom/Real.ts';
export { default as Virtual }    from './components/Virtual.ts';
export { default as Component }  from './components/Components.ts';
export { default as Directive }  from './components/Directives.ts';
export { default as JSX }        from './components/Jsx.ts';
export { default as Plugin }     from './platform/Plugins.ts';
export { default as Property }   from './components/Properties.ts';

/** @name        AriannA
 *  @public
 *  @constant
 *  @type        {Core.AriannA}
 *  @description The single Core kernel instance created by the package entry point.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export const AriannA = new Core.AriannA();

/** @name        Html
 *  @public
 *  @constant
 *  @description Live HTML namespace installed by the kernel.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export const Html   = Namespaces.Namespace.Namespaces['html'];

/** @name        Svg
 *  @public
 *  @constant
 *  @description Live SVG namespace installed by the kernel.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export const Svg    = Namespaces.Namespace.Namespaces['svg'];

/** @name        MathML
 *  @public
 *  @constant
 *  @description Live MathML namespace installed by the kernel.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export const MathML = Namespaces.Namespace.Namespaces['mathML'];

/** @name        X3D
 *  @public
 *  @constant
 *  @description Live X3D namespace installed by the kernel.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export const X3D    = Namespaces.Namespace.Namespaces['x3d'];

/**
 * @name        Component
 * @public
 * @default
 * @description Default package export. Components bundles import the package default and therefore receive the
 *              callable Component decorator/factory rather than the AriannA kernel instance.
 * @author      Riccardo Angeli
 * @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 * @license     MIT / Commercial (dual license)
 */
export default Component;

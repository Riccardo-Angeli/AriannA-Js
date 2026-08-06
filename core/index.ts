/**
 * @module      core
 * @description Canonical AriannA Core package entry point. The barrel exposes one stable binding per module,
 *              boots the kernel once, and avoids compatibility aliases already owned by their modules.
 * @author      Riccardo Angeli
 * @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 * @license     MIT / Commercial (dual license)
 */

import { Core }       from './Core.ts';
import { Namespaces } from './Namespaces.ts';
import Component      from './Components.ts';

/*
 * Observer is a value import by design: evaluating the module registers the observer service before
 * `Core.AriannA` starts the kernel.
 */
import './Observer.ts';

export { Core }         from './Core.ts';
export { Css }          from './Css.ts';
export { Reactivity }   from './Reactive.ts';
export { Namespaces }   from './Namespaces.ts';
export { Events }       from './Events.ts';
export { Services }     from './Service.ts';
export { States }       from './State.ts';
export { Contexts }     from './Context.ts';
export { Routers }      from './Router.ts';
export { Templates }    from './Template.ts';
export { Shadows }      from './Shadow.ts';
export { SSR }          from './SSR.ts';
export { Workers }      from './Workers.ts';
export { Reals }        from './Real.ts';
export { Virtuals }     from './Virtual.ts';
export { Components }   from './Components.ts';
export { Directives }   from './Directives.ts';
export { Jsx }          from './Jsx.ts';
export { Plugins }      from './Plugins.ts';
export { Properties }   from './Properties.ts';

export { default as State }      from './State.ts';
export { default as Context }    from './Context.ts';
export { default as Router }     from './Router.ts';
export { default as Template }   from './Template.ts';
export { default as Shadow }     from './Shadow.ts';
export { default as Renderer }   from './SSR.ts';
export { default as Worker }     from './Workers.ts';
export { default as Real }       from './Real.ts';
export { default as Virtual }    from './Virtual.ts';
export { default as Component }  from './Components.ts';
export { default as Directive }  from './Directives.ts';
export { default as JSX }        from './Jsx.ts';
export { default as Plugin }     from './Plugins.ts';
export { default as Property }   from './Properties.ts';

/** @name        AriannA
 *  @public
 *  @constant
 *  @type        {Core.AriannA}
 *  @description The single Core kernel instance created by the package entry point.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export const AriannA =
    new Core.AriannA();

/** @name        Html
 *  @public
 *  @constant
 *  @description Live HTML namespace installed by the kernel.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export const Html =
    Namespaces.Namespace.Namespaces['html'];

/** @name        Svg
 *  @public
 *  @constant
 *  @description Live SVG namespace installed by the kernel.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export const Svg =
    Namespaces.Namespace.Namespaces['svg'];

/** @name        MathML
 *  @public
 *  @constant
 *  @description Live MathML namespace installed by the kernel.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export const MathML =
    Namespaces.Namespace.Namespaces['mathML'];

/** @name        X3D
 *  @public
 *  @constant
 *  @description Live X3D namespace installed by the kernel.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export const X3D =
    Namespaces.Namespace.Namespaces['x3d'];

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

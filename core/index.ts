/**
 * @module      core
 * @description Canonical AriannA Core package entry point for Architecture 2.0.
 *              The browser bootstrap lives here too: the built arianna.js bundle is
 *              therefore self-starting and needs no separate bootstrap.ts entry.
 * @author      Riccardo Angeli
 * @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 * @license     MIT / Commercial (dual license)
 */

import { Core } from './kernel/Core.ts';
import { Services }   from './kernel/Services.ts';

import { Reactive }   from './reactivity/Reactive.ts';
import { Reactivity } from './reactivity/Reactivity.ts';
import { Events }     from './reactivity/Events.ts';
import State, { States }       from './reactivity/State.ts';
import Context, { Contexts }   from './reactivity/Context.ts';

import { Css }        from './dom/Css.ts';
import { Namespaces } from './dom/Namespaces.ts';
import { Observers }  from './dom/Observer.ts';
import Real, { Reals }          from './dom/Real.ts';
import { Templates } from './dom/Template.ts';
const Template = Templates.Template;
import Shadow, { Shadows }      from './dom/Shadow.ts';
import { Natives }    from './dom/Natives.ts';

import Virtual, { Virtuals }    from './components/Virtual.ts';
import Component, { Components } from './components/Components.ts';
import Directive, { Directives } from './components/Directives.ts';
import JSX, { Jsx }              from './components/Jsx.ts';
import Property, { Properties }  from './components/Properties.ts';

import Application, { Applications } from './platform/Application.ts';
import Router, { Routers }       from './platform/Router.ts';
import { SSR } from './platform/SSR.ts';
const Renderer = SSR.Renderer;
import Worker, { Workers }       from './platform/Workers.ts';
import { Wasm }                  from './platform/Wasm.ts';
import { WebSockets }            from './platform/WebSocket.ts';
import { GraphQL }               from './platform/GraphQL.ts';
import Plugin, { Plugins }       from './platform/Plugins.ts';

/* Full distribution metadata + observer service are installed by the imports above. */

export type { Types }      from './definitions/Types.ts';
export type { Interfaces } from './definitions/Interfaces.ts';

export {
    Core, Services,
    Reactive, Reactivity, Events, States, Contexts,
    Css, Namespaces, Observers, Reals, Templates, Shadows, Natives,
    Virtuals, Components, Directives, Jsx, Properties,
    Applications, Routers, SSR, Workers, Wasm, WebSockets, GraphQL, Plugins,
    Application, State, Context, Router, Template, Shadow, Renderer, Worker,
    Real, Virtual, Component, Directive, JSX, Plugin, Property
};

/** The single Core kernel instance. Construction initializes the synchronous DOM layer only. */
export const AriannA = new Core.AriannA();

/** Live built-in namespace handles. */
export const Html   = Namespaces.Namespace.Namespaces['html'];
export const Svg    = Namespaces.Namespace.Namespaces['svg'];
export const MathML = Namespaces.Namespace.Namespaces['mathML'];
export const X3D    = Namespaces.Namespace.Namespaces['x3d'];

let bootstrapPromise: Promise<void> | null = null;

/**
 * @name Bootstrap
 * @public
 * @description Publish the Core browser API once, then start the canonical companion-bundle boot.
 *              Idempotent. The distribution calls this automatically; applications may also await
 *              Bootstrap() explicitly when they need the ready barrier.
 */
export function Bootstrap(): Promise<void>
{
    if(bootstrapPromise) return bootstrapPromise;

    if(typeof globalThis === 'undefined')
    {
        return bootstrapPromise = Promise.resolve();
    }

    const API: Record<string, unknown> =
    {
        Core, Services,
        Reactive, Reactivity, Events, States, Contexts,
        Css, Namespaces, Observers, Reals, Templates, Shadows, Natives,
        Virtuals, Components, Directives, Jsx, Properties,
        Applications, Routers, SSR, Workers, Wasm, WebSockets, GraphQL, Plugins,
        Application, State, Context, Router, Template, Shadow, Renderer, Worker,
        Real, Virtual, Component, Directive, JSX, Plugin, Property,
        AriannA, Html, Svg, MathML, X3D,
        Bootstrap
    };

    if(!('__ARIANNA_CORE__' in globalThis))
    {
        Object.defineProperty
        (
            globalThis,
            '__ARIANNA_CORE__',
            {
                value        : API,
                writable     : false,
                configurable : true,
                enumerable   : false
            }
        );
    }

    for(const [key, value] of Object.entries(API))
    {
        if(key in globalThis) continue;

        try
        {
            Object.defineProperty
            (
                globalThis,
                key,
                {
                    value,
                    writable     : false,
                    configurable : true,
                    enumerable   : false
                }
            );
        }
        catch {}
    }

    if(!('Namespace' in globalThis))
    {
        Object.defineProperty
        (
            globalThis,
            'Namespace',
            {
                value        : Namespaces.Namespace,
                writable     : false,
                configurable : true,
                enumerable   : false
            }
        );
    }

    /*
     * Globals exist before companion decorators evaluate. This ordering is the
     * browser bootstrap invariant: publish Core -> load Additionals/Components.
     */
    bootstrapPromise = AriannA.Ready;

    if(!('__ARIANNA_BOOTSTRAP__' in globalThis))
    {
        Object.defineProperty
        (
            globalThis,
            '__ARIANNA_BOOTSTRAP__',
            {
                value        : bootstrapPromise,
                writable     : false,
                configurable : true,
                enumerable   : false
            }
        );
    }

    return bootstrapPromise;
}

/* Browser distribution: one <script type="module" src=".../arianna.js"></script> is enough. */
if(typeof document !== 'undefined')
{
    void Bootstrap();
}

export default Component;

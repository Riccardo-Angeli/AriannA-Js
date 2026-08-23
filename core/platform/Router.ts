/**
 * @module    core/Router
 * @author    Riccardo Angeli
 * @version   1.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description Isomorphic AriannA router. Router owns nominal routes, parameter matching, guards, loaders,
 *              State/Context integration, Worker preloading and SSR route resolution.
 */

import { Core }     from '../kernel/Core.ts';
import { Services } from '../kernel/Services.ts';
import { Contexts } from '../reactivity/Context.ts';
import { States }   from '../reactivity/State.ts';

import type { Types }      from '../definitions/Types.ts';
import type { Interfaces } from '../definitions/Interfaces.ts';

/** @name        Routers
 *  @public
 *  @type        {namespace}
 *  @description Groups the Routers contracts and runtime surface.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Routers
{
    /** @name        Method
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Method.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Method          = Types.Router.Method;
    /** @name        Status
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Status.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Status          = Types.Router.Status;
    /** @name        Mode
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Mode.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Mode            = Types.Router.Mode;
    /** @name        Route
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Route.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Route           = Interfaces.Router.Route;
    /** @name        Match
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Match.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Match           = Interfaces.Router.Match;
    /** @name        Navigation
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Navigation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Navigation      = Interfaces.Router.Navigation;
    /** @name        Guard
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Guard.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Guard           = Interfaces.Router.Guard;
    /** @name        Loader
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Loader.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Loader          = Interfaces.Router.Loader;
    /** @name        WorkerBridge
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for WorkerBridge.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type WorkerBridge    = Interfaces.Router.WorkerBridge;
    /** @name        Options
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Options.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Options         = Interfaces.Router.Options;
    /** @name        ServiceContract
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ServiceContract.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ServiceContract = Interfaces.Router.Service;

    /** @class       Router
     *  @public
     *  @description Isomorphic nominal router with fluent route registration and navigation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Router extends EventTarget
    {
        readonly #routes: Route[] = [];
        readonly #state: States.State<Navigation>;
        readonly #context: Contexts.Context<Navigation>;
        readonly #options: Options;
        #started = false;
        #sequence = 0;
        #navigation: AbortController | null = null;
        #popstate: (() => void) | null = null;

        constructor(options?: Options)
        {
            super();

            this.#options =
            {
                Base    : options?.Base ?? '/',
                Mode    : options?.Mode ?? 'history',
                NotFound: options?.NotFound
            };

            const initialController = new AbortController();
            const initial: Navigation =
            {
                Id         : 0,
                Signal     : initialController.signal,
                Url        : '/',
                Path       : '/',
                Query      : {},
                Parameters : {},
                Status     : 'idle',
                Timestamp  : Date.now()
            };

            this.#state   = new States.State(initial, { Name: 'Router' });
            this.#context = new Contexts.Context('Router', this.#state, { Scope: 'route' });
        }

        get State(): States.State<Navigation>
        {
            return this.#state;
        }

        get Context(): Contexts.Context<Navigation>
        {
            return this.#context;
        }

        static Create(options?: Options): Router
        {
            return new Router(options);
        }

        Route(route: Route): this
        {
            if(this.#routes.some(item => item.Name === route.Name))
            {
                throw new Error(`[arianna] Duplicate route '${route.Name}'.`);
            }

            this.#routes.push
            (
                {
                    ...route,
                    Method: route.Method ?? 'GET'
                }
            );

            return this;
        }

        Get
        (
            name    : string,
            path    : string,
            handler : Route['Handler']
        ): this
        {
            return this.Route
            (
                {
                    Name    : name,
                    Path    : path,
                    Method  : 'GET',
                    Handler : handler
                }
            );
        }

        Guard
        (
            name  : string,
            guard : Guard
        ): this
        {
            const route = this.#Find(name);
            route.Guards = [...(route.Guards ?? []), guard];

            return this;
        }

        Load
        (
            name   : string,
            loader : Loader
        ): this
        {
            this.#Find(name).Loader = loader;

            return this;
        }

        Worker
        (
            name   : string,
            worker : WorkerBridge,
            task   : string = 'Route'
        ): this
        {
            const route = this.#Find(name);

            route.Loader =
                async navigation =>
                    worker
                        .Task(task)
                        .With
                        (
                            {
                                Route      : name,
                                Navigation : navigation
                            }
                        )
                        .Run();

            return this;
        }

        Match(url: string, method: Method = 'GET'): Match | null
        {
            const parsed = new URL(url, 'http://arianna.local');

            for(const route of this.#routes)
            {
                if((route.Method ?? 'GET') !== method)
                {
                    continue;
                }

                const result = Router.#Match(route.Path, parsed.pathname);

                if(result)
                {
                    return {
                        Route      : route,
                        Parameters : result,
                        Query      : Object.fromEntries(parsed.searchParams)
                    };
                }
            }

            return null;
        }

        async Navigate
        (
            url     : string,
            method  : Method = 'GET',
            replace : boolean = false
): Promise<Navigation>
        {
            this.#navigation?.abort(new DOMException('Superseded navigation.', 'AbortError'));
            const controller = new AbortController();
            this.#navigation = controller;
            const id = ++this.#sequence;
            const match =
                this.Match(url, method);

            if(!match)
            {
                const missing: Navigation =
                {
                    Id         : id,
                    Signal     : controller.signal,
                    Url        : url,
                    Path       : new URL(url, 'http://arianna.local').pathname,
                    Query      : {},
                    Parameters : {},
                    Status     : 'not-found',
                    Timestamp  : Date.now()
                };

                this.#state.Set(missing);

                if(this.#options.NotFound)
                {
                    await this.#options.NotFound(missing);
                }

                return missing;
            }

            const navigation: Navigation =
            {
                Id         : id,
                Signal     : controller.signal,
                Url        : url,
                Path       : match.Route.Path,
                RouteName  : match.Route.Name,
                Query      : match.Query,
                Parameters : match.Parameters,
                Status     : 'loading',
                Timestamp  : Date.now()
            };

            this.#state.Set(navigation);

            for(const guard of match.Route.Guards ?? [])
            {
                const allowed = await guard(navigation);
                if(controller.signal.aborted || id !== this.#sequence) return { ...navigation, Status: 'cancelled', Timestamp: Date.now() };

                if(!allowed)
                {
                    const blocked =
                    {
                        ...navigation,
                        Status    : 'blocked' as const,
                        Timestamp : Date.now()
                    };

                    this.#state.Set(blocked);

                    return blocked;
                }
            }

            if(match.Route.Loader)
            {
                navigation.Data = await match.Route.Loader(navigation);
                if(controller.signal.aborted || id !== this.#sequence) return { ...navigation, Status: 'cancelled', Timestamp: Date.now() };
            }

            if(match.Route.Handler)
            {
                navigation.Result = await match.Route.Handler(navigation);
                if(controller.signal.aborted || id !== this.#sequence) return { ...navigation, Status: 'cancelled', Timestamp: Date.now() };
            }

            navigation.Status    = 'ready';
            navigation.Timestamp = Date.now();

            this.#state.Set({...navigation});

            if(typeof history !== 'undefined' && this.#options.Mode === 'history')
            {
                const operation = replace ? 'replaceState' : 'pushState';
                history[operation]({}, '', url);
            }

            this.dispatchEvent
            (
                new CustomEvent
                (
                    'Router-Navigated',
                    {
                        detail: navigation
                    }
                )
            );

            return navigation;
        }

        Start(): this
        {
            if(this.#started)
            {
                return this;
            }

            this.#started = true;

            if(typeof window !== 'undefined' && this.#options.Mode === 'history')
            {
                this.#popstate = () => { void this.Navigate(location.href, 'GET', true); };
                window.addEventListener('popstate', this.#popstate);
            }

            return this;
        }

        Dispose(): void
        {
            this.#navigation?.abort(new DOMException('Router disposed.', 'AbortError'));
            this.#navigation = null;
            if(this.#popstate && typeof window !== 'undefined') window.removeEventListener('popstate', this.#popstate);
            this.#popstate = null;
            this.#started = false;
        }

        Resolve(url: string, method: Method = 'GET'): Promise<Navigation>
        {
            return this.Navigate(url, method, true);
        }


        #Find(name: string): Route
        {
            const route =
                this.#routes.find(item => item.Name === name);

            if(!route)
            {
                throw new Error(`[arianna] Unknown route '${name}'.`);
            }

            return route;
        }

        static #Match
        (
            pattern : string,
            path    : string
        ): Record<string, string> | null
        {
            const names: string[] = [];

            const expression =
                pattern
                    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                    .replace
                    (
                        /\\:([A-Za-z0-9_]+)/g,
                        (_, name: string) =>
                        {
                            names.push(name);

                            return '([^/]+)';
                        }
                    );

            const match =
                new RegExp(`^${expression}/?$`).exec(path);

            if(!match)
            {
                return null;
            }

            return Object.fromEntries
            (
                names.map
                (
                    (name, index) =>
                        [name, decodeURIComponent(match[index + 1])]
                )
            );
        }
    }

    const Service = new Services.Service<ServiceContract>
    (
        'router',
        {
            Create(options?: Options): Router
            {
                return Router.Create(options);
            }
        }
    );
}

export default Routers.Router;

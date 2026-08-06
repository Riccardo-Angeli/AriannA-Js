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

import { Core }     from './Core.ts';
import { Contexts } from './Context.ts';
import { States }   from './State.ts';

import type { Types as SchemaTypes }           from './schema/Types.ts';
import type { Interfaces as SchemaInterfaces } from './schema/Interfaces.ts';

export namespace Routers
{
    export type Method          = SchemaTypes.Router.Method;
    export type Status          = SchemaTypes.Router.Status;
    export type Mode            = SchemaTypes.Router.Mode;
    export type Route           = SchemaInterfaces.Router.Route;
    export type Match           = SchemaInterfaces.Router.Match;
    export type Navigation      = SchemaInterfaces.Router.Navigation;
    export type Guard           = SchemaInterfaces.Router.Guard;
    export type Loader          = SchemaInterfaces.Router.Loader;
    export type WorkerBridge    = SchemaInterfaces.Router.WorkerBridge;
    export type Options         = SchemaInterfaces.Router.Options;
    export type ServiceContract = SchemaInterfaces.Router.Service;

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

        constructor(options?: Options)
        {
            super();

            this.#options =
            {
                Base    : options?.Base ?? '/',
                Mode    : options?.Mode ?? 'history',
                NotFound: options?.NotFound
            };

            const initial: Navigation =
            {
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
            const match =
                this.Match(url, method);

            if(!match)
            {
                const missing: Navigation =
                {
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
            }

            if(match.Route.Handler)
            {
                navigation.Result = await match.Route.Handler(navigation);
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
                window.addEventListener
                (
                    'popstate',
                    () =>
                    {
                        void this.Navigate(location.href, 'GET', true);
                    }
                );
            }

            return this;
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

    const Service = new Core.Services.Service<ServiceContract>
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

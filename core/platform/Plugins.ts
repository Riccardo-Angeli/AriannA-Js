/**
 * @module      core/Plugins
 * @description AriannA plugin registry, lifecycle manager and the canonical AriannA API passed to plugins.
 * @author      Riccardo Angeli
 * @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 * @license     MIT / Commercial (dual license)
 */

import { Services } from '../kernel/Services.ts';

import type { Types }      from '../definitions/Types.ts';
import type { Interfaces } from '../definitions/Interfaces.ts';

/** @name        Plugins
 *  @public
 *  @type        {namespace}
 *  @description Groups the Plugins contracts and runtime surface.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Plugins
{
    /** @name        Name
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Name.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Name            = Types.Plugins.Name;
    /** @name        State
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for State.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type State           = Types.Plugins.State;
    /** @name        Options
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Options.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Options         = Types.Plugins.Options;
    /** @name        Cleanup
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Cleanup.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Cleanup         = Types.Plugins.Cleanup;
    /** @name        Installer
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Installer.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Installer       = Types.Plugins.Installer;
    /** @name        Definition
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Definition.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Definition      = Interfaces.Plugins.Definition;
    /** @name        RecordContract
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for RecordContract.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type RecordContract  = Interfaces.Plugins.Record;
    /** @name        APIContract
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for APIContract.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type APIContract     = Interfaces.Plugins.AriannAAPI;
    /** @name        ServiceContract
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ServiceContract.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ServiceContract = Interfaces.Plugins.Service;

    /** @class       AriannAAPI
     *  @public
     *  @memberof    Plugins
     *  @description Stable capability facade supplied to every plugin installer. Plugins depend on this API rather
     *               than importing Core modules directly.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class AriannAAPI implements APIContract
    {
        readonly Name = 'AriannA API' as const;
        readonly Version: string;

        constructor(version = '2.0.0')
        {
            this.Version = version;
        }

        get Services(): readonly string[]
        {
            return Object.freeze(Services.Providers());
        }

        HasService(name: string): boolean
        {
            return Services.Resolve(name) !== undefined;
        }

        Resolve<T extends object = object>(name: string): T | undefined
        {
            return Services.Resolve(name) as T | undefined;
        }

        Call<R = unknown>(name: string, method: string, ...args: unknown[]): R | undefined
        {
            return Services.Call<R>(name, method, ...args);
        }
    }

    /** @class       Plugin
     *  @public
     *  @memberof    Plugins
     *  @description Declarative plugin definition with fluent registration and installation methods.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Plugin implements Definition
    {
        readonly Name: Name;
        readonly Version?: string;
        readonly Description?: string;
        readonly Dependencies?: readonly Name[];
        readonly Install: Installer;

        constructor(definition: Definition);
        constructor(name: Name, install: Installer);
        constructor(definitionOrName: Definition | Name, install?: Installer)
        {
            const definition: Definition =
                typeof definitionOrName === 'string'
                    ? {
                        Name    : definitionOrName,
                        Install : install ?? (() => undefined)
                    }
                    : definitionOrName;

            Plugin.Validate(definition);

            this.Name         = definition.Name;
            this.Version      = definition.Version;
            this.Description  = definition.Description;
            this.Dependencies = definition.Dependencies
                ? Object.freeze([...definition.Dependencies])
                : undefined;
            this.Install      = definition.Install;
        }

        register(): this
        {
            Registry.Register(this);
            return this;
        }

        async use(options: Options = {}): Promise<this>
        {
            Registry.Register(this);
            await Registry.Install(this.Name, options);
            return this;
        }

        async uninstall(): Promise<this>
        {
            await Registry.Uninstall(this.Name);
            return this;
        }

        static Create(definition: Definition): Plugin
        {
            return new Plugin(definition);
        }

        static Register(definition: Definition): Plugin
        {
            return Registry.Register(definition);
        }

        static Use(definition: Definition, options: Options = {}): Promise<Plugin>
        {
            return Registry.Use(definition, options);
        }

        static Validate(definition: Definition): void
        {
            if(!definition || typeof definition !== 'object')
            {
                throw new TypeError('[arianna] Plugin definition must be an object.');
            }

            if(!definition.Name || typeof definition.Name !== 'string')
            {
                throw new TypeError('[arianna] Plugin Name must be a non-empty string.');
            }

            if(typeof definition.Install !== 'function')
            {
                throw new TypeError(`[arianna] Plugin '${definition.Name}' requires an Install function.`);
            }
        }
    }

    /** @class       Registry
     *  @public
     *  @memberof    Plugins
     *  @description Owns registration, dependency resolution, installation, disabling and cleanup for all plugins.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Registry
    {
        static readonly API = new AriannAAPI();
        static readonly #records = new Map<Name, RecordContract>();

        static Register(definition: Definition): Plugin
        {
            const plugin =
                definition instanceof Plugin
                    ? definition
                    : new Plugin(definition);

            const existing = Registry.#records.get(plugin.Name);

            if(existing)
            {
                if(existing.Definition === plugin)
                {
                    return plugin;
                }

                throw new Error(`[arianna] Plugin '${plugin.Name}' is already registered.`);
            }

            Registry.#records.set
            (
                plugin.Name,
                {
                    Definition : plugin,
                    State      : 'registered',
                    Options    : Object.freeze({}),
                    Cleanup    : null,
                    Error      : null,
                    InstalledAt: null
                }
            );

            return plugin;
        }

        static async Install(name: Name, options: Options = {}, stack: readonly Name[] = []): Promise<Plugin>
        {
            const record = Registry.#records.get(name);

            if(!record)
            {
                throw new Error(`[arianna] Plugin '${name}' is not registered.`);
            }

            if(record.State === 'installed')
            {
                return record.Definition as Plugin;
            }

            if(stack.includes(name))
            {
                throw new Error(`[arianna] Circular plugin dependency: ${[...stack, name].join(' -> ')}.`);
            }

            record.State = 'installing';
            record.Options = Object.freeze({ ...options });
            record.Error = null;

            try
            {
                for(const dependency of record.Definition.Dependencies ?? [])
                {
                    await Registry.Install(dependency, {}, [...stack, name]);
                }

                const cleanup =
                    await record.Definition.Install(Registry.API, record.Options);

                record.Cleanup = typeof cleanup === 'function' ? cleanup : null;
                record.State = 'installed';
                record.InstalledAt = Date.now();

                return record.Definition as Plugin;
            }
            catch(error)
            {
                record.State = 'failed';
                record.Error = error;
                throw error;
            }
        }

        static async Use(definition: Definition, options: Options = {}): Promise<Plugin>
        {
            const plugin = Registry.Register(definition);
            return Registry.Install(plugin.Name, options);
        }

        static async Uninstall(name: Name): Promise<boolean>
        {
            const record = Registry.#records.get(name);

            if(!record)
            {
                return false;
            }

            if(record.Cleanup)
            {
                await record.Cleanup();
            }

            record.Cleanup = null;
            record.State = 'uninstalled';
            record.InstalledAt = null;

            return true;
        }

        static async Disable(name: Name): Promise<boolean>
        {
            const changed = await Registry.Uninstall(name);
            const record = Registry.#records.get(name);

            if(record)
            {
                record.State = 'disabled';
            }

            return changed;
        }

        static async Enable(name: Name): Promise<boolean>
        {
            const record = Registry.#records.get(name);

            if(!record)
            {
                return false;
            }

            await Registry.Install(name, record.Options);
            return true;
        }

        static Has(name: Name): boolean
        {
            return Registry.#records.has(name);
        }

        static Get(name: Name): RecordContract | undefined
        {
            return Registry.#records.get(name);
        }

        static List(): readonly RecordContract[]
        {
            return Object.freeze([...Registry.#records.values()]);
        }
    }

    const Service = new Services.Service<ServiceContract>
    (
        'plugins',
        {
            get API(): AriannAAPI
            {
                return Registry.API;
            },

            Register(definition: Definition): Plugin
            {
                return Registry.Register(definition);
            },

            Install(name: string, options?: Options): Promise<Plugin>
            {
                return Registry.Install(name, options);
            },

            Use(definition: Definition, options?: Options): Promise<Plugin>
            {
                return Registry.Use(definition, options);
            },

            Uninstall(name: string): Promise<boolean>
            {
                return Registry.Uninstall(name);
            },

            Enable(name: string): Promise<boolean>
            {
                return Registry.Enable(name);
            },

            Disable(name: string): Promise<boolean>
            {
                return Registry.Disable(name);
            },

            Has(name: string): boolean
            {
                return Registry.Has(name);
            },

            Get(name: string): RecordContract | undefined
            {
                return Registry.Get(name);
            },

            List(): readonly RecordContract[]
            {
                return Registry.List();
            }
        }
    );
}

export default Plugins.Plugin;

/**
 * @module    Plugin
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 *
 * Plugin — one self-contained class for AriannA's plugin system.
 *
 * Mirrors the Property pattern: a single class you can `new`, with its types
 * nested under the class name (Plugin.Definition, Plugin.CoreApi) via namespace
 * merging — type-only, so no extra runtime code — and the installed-plugin
 * registry held as a `private static` member.
 *
 * Lives outside Core (the frozen, zero-import kernel cannot own a mutable
 * registry nor import anything); this is the one module allowed to import Core
 * and pass it to each plugin's install().
 *
 * @example
 *   // instance form
 *   new Plugin('router', (core, opts) => {
 *       core.Events.On(window, 'popstate', opts!.handler as EventListener);
 *   }).use({ handler: myHandler });
 *
 *   // object form
 *   Plugin.use({ name: 'i18n', install(core) { ... } });
 *
 *   Plugin.list();   // ['router', 'i18n']
 */

import Core from './Core.ts';

export class Plugin
{
    /** Unique name — guards against double-installation. */
    public readonly name    : string;
    /** Called once, with the Core singleton and the options passed to use(). */
    public readonly install : (core: Plugin.CoreApi, options?: Record<string, unknown>) => void;

    constructor(name: string, install: Plugin['install'])
    {
        this.name    = name;
        this.install = install;
    }

    /**
     * Install THIS plugin into Core. Idempotent, chainable.
     * @example new Plugin('router', fn).use({ routes });
     */
    use(options: Record<string, unknown> = {}): this
    {
        Plugin.use(this, options);
        return this;
    }

    // ── Static registry ───────────────────────────────────────────────────────

    /** Installed-plugin names (mutable — the reason Plugin lives outside Core). */
    private static _installed = new Set<string>();

    /**
     * Install a plugin — a Plugin instance or a plain { name, install } object.
     * Idempotent: a second call with the same name is ignored with a warning.
     * @example Plugin.use(new Plugin('i18n', fn));
     */
    static use(plugin: Plugin | Plugin.Definition, options: Record<string, unknown> = {}): void
    {
        if (!plugin || typeof plugin.install !== 'function' || typeof plugin.name !== 'string') {
            console.warn('Plugin.use: expected a Plugin or { name, install } object.');
            return;
        }
        if (Plugin._installed.has(plugin.name)) {
            console.warn(`Plugin.use: '${plugin.name}' is already installed.`);
            return;
        }
        plugin.install(Core, options);
        Plugin._installed.add(plugin.name);
    }

    /** True if a plugin with this name is installed. */
    static has(name: string): boolean
    {
        return Plugin._installed.has(name);
    }

    /** Names of all currently installed plugins. */
    static list(): string[]
    {
        return Array.from(Plugin._installed);
    }

    /** Pin the constructor name (bundler renames the colliding local to `_Plugin`)
     *  and expose the class on `window`. Runs once at class-eval. */
    static #Build(): void
    {
        try { Object.defineProperty(this, 'name', { value: 'Plugin', configurable: true }); } catch { /* frozen */ }
        if (typeof window !== 'undefined' && !Object.prototype.hasOwnProperty.call(window, 'Plugin'))
            Object.defineProperty(window, 'Plugin', { enumerable: true, configurable: false, writable: false, value: this });
    }

    static { this.#Build(); }
}

/**
 * Type members of Plugin, grouped under the class name via declaration merging.
 * Types only — emits no runtime code.
 */
export namespace Plugin
{
    /** The Core public API surface handed to every plugin's install(). */
    export type CoreApi = typeof Core;

    /** Plain-object plugin shape accepted by Plugin.use(). */
    export interface Definition
    {
        name    : string;
        install : (core: CoreApi, options?: Record<string, unknown>) => void;
    }
}

export default Plugin;

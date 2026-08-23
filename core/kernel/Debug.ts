/**
 * @module kernel/Debug
 * @version 2.0.0
 * @description Optional diagnostics facade. Kept outside the minimal kernel hot path.
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license MIT / Commercial (dual license)
 */
import { Core } from './Core.ts';

export namespace Debug {
        /** @name        warn
         *  @public
         *  @memberof    Core
         *  @description Coded diagnostic sink for otherwise-silent recovery `catch` blocks.
         *               No-op unless `Configuration.debug` is `true`; never throws, never
         *               alters control flow. Callers keep running their fallback afterwards.
         *  @param       {string} code Short stable diagnostic code (e.g. `'SET_ATTR'`).
         *  @param       {...unknown} args Contextual payload (error object, tag, …).
         *  @returns     {void}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export function warn(code: string, ...args: unknown[]): void {
            if (Core.AriannA.Configuration.debug && typeof console !== 'undefined')
                console.warn(`[arianna:${code}]`, ...args);
        }
    }

export default Debug;

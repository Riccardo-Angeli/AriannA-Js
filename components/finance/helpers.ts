/** @namespace   helpers
 *  @public
 *  @description Namespace containing helpers contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
/**
 * @module    components/finance/helpers
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA helpers component module.
 */

export namespace helpers
{
    export function _svg(tag: string, attributes: Record<string, string | number>, inner: string = ''): string {
        /** @name        a
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned a value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const a = Object.entries(attributes)
            .map(([k, v]) => `${k}="${v}"`)
            .join(' ');
        return inner ? `<${tag} ${a}>${inner}</${tag}>` : `<${tag} ${a}/>`;
    }
    export function _fmt(n: number, dec: number = 2): string { return n.toFixed(dec); }
    export function _fmtK(n: number): string {
        /** @name        abs
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned abs value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const abs = Math.abs(n);
        if (abs >= 1e9)
            return `${(n / 1e9).toFixed(1)}B`;
        if (abs >= 1e6)
            return `${(n / 1e6).toFixed(1)}M`;
        if (abs >= 1e3)
            return `${(n / 1e3).toFixed(1)}K`;
        return String(n);
    }

    /** Escape user-provided strings before placing them in SVG/HTML output. */
    export function _esc(s: string): string {
        return s.replace(/[&<>"']/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
        }[c]!));
    }
}

export const _svg = helpers._svg;
export const _fmt = helpers._fmt;
export const _fmtK = helpers._fmtK;
export const _esc = helpers._esc;

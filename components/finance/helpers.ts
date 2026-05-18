/**
 * @module    components/finance/helpers
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * @internal Shared helpers for AriannA finance widgets.
 *
 * The widgets render via stringified SVG (`a-html` slot) rather than the
 * standard html-template path, because chart geometry is highly dynamic
 * and the per-element reactive sink graph would dwarf the actual work.
 *
 *   • `_svg(tag, attrs, inner)`   builds an SVG element string with attrs
 *   • `_fmt(n, dec)`              fixed-decimal number → string
 *   • `_fmtK(n)`                  short-form (1.5K / 2.4M / etc.)
 */

export function _svg(
    tag  : string,
    attrs: Record<string, string | number>,
    inner: string = '',
): string {
    const a = Object.entries(attrs)
        .map(([k, v]) => `${k}="${v}"`)
        .join(' ');
    return inner ? `<${tag} ${a}>${inner}</${tag}>` : `<${tag} ${a}/>`;
}

export function _fmt(n: number, dec: number = 2): string { return n.toFixed(dec); }

export function _fmtK(n: number): string {
    const abs = Math.abs(n);
    if (abs >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
    if (abs >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    if (abs >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
    return String(n);
}

/** Escape user-provided strings before placing them in SVG/HTML output. */
export function _esc(s: string): string {
    return s.replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]!));
}

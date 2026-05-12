/**
 * @module    components/core
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 *
 * Foundation pieces every other component module depends on:
 *
 *   • Control   — the React-like abstract base for all controls
 *   • Theme     — design tokens (light / dark / auto) + base CSS injection
 *   • Animation — easing / loop / tween helpers used by component animations
 *
 *   import { Control, Theme } from 'arianna/components/core';
 */

export { Control } from './Control.ts';
export type { CtrlOptions, CtrlListener } from './Control.ts';

export { Theme } from './Theme.ts';
export type { ThemeMode, ThemeTokens } from './Theme.ts';

export * from './Animation.ts';

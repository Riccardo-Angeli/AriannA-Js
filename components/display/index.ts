/**
 * @module    components/display
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Barrel — atomic display components (Batch 1 of the Component 2.0 migration).
 * Importing this module side-effect-registers all 13 custom elements so the
 * tags become available in HTML markup, plus re-exports the classes for JS
 * usage.
 *
 * Tags registered:
 *   arianna-avatar, arianna-badge, arianna-banner, arianna-chip,
 *   arianna-divider, arianna-icon, arianna-list, arianna-progress-bar,
 *   arianna-progress-circular, arianna-skeleton, arianna-snackbar,
 *   arianna-tag, arianna-tooltip
 */

export { Avatar }            from './Avatar.ts';
export { Badge }             from './Badge.ts';
export { Banner }            from './Banner.ts';
export { Chip }              from './Chip.ts';
export { Divider }           from './Divider.ts';
export { Icon }              from './Icon.ts';
export { List }              from './List.ts';
export { ProgressBar }       from './ProgressBar.ts';
export { ProgressCircular }  from './ProgressCircular.ts';
export { Skeleton }          from './Skeleton.ts';
export { Snackbar }          from './Snackbar.ts';
export { Tag }               from './Tag.ts';
export { Tooltip }           from './Tooltip.ts';

export type { AvatarOptions }            from './Avatar.ts';
export type { BadgeOptions }             from './Badge.ts';
export type { BannerOptions }            from './Banner.ts';
export type { ChipOptions }              from './Chip.ts';
export type { DividerOptions }           from './Divider.ts';
export type { IconOptions }              from './Icon.ts';
export type { ListItem, ListOptions }    from './List.ts';
export type { ProgressBarOptions }       from './ProgressBar.ts';
export type { ProgressCircularOptions }  from './ProgressCircular.ts';
export type { SkeletonOptions }          from './Skeleton.ts';
export type { SnackbarOptions, SnackbarPosition } from './Snackbar.ts';
export type { TagOptions }               from './Tag.ts';
export type { TooltipOptions }           from './Tooltip.ts';

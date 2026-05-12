/**
 * @module    components/display
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 *
 * Passive presentation widgets — surfaces that show information without
 * primary user interaction: avatars, badges, banners, chips, icons, lists,
 * progress indicators, skeletons, snackbars, tags and tooltips.
 *
 * `Chip` here collides with `inputs/Chip` (the editable input chip). The
 * top-level `components/index.ts` aliases this one to `DisplayChip` and
 * keeps `inputs/Chip` as the unaliased `Chip`.
 *
 *   import { Avatar, Badge, List } from 'arianna/components/display';
 */

export { Avatar           } from './Avatar.ts';
export { Badge            } from './Badge.ts';
export { Banner           } from './Banner.ts';
export { Chip             } from './Chip.ts';
export { Divider          } from './Divider.ts';
export { Icon             } from './Icon.ts';
export { List             } from './List.ts';
export { ProgressBar      } from './ProgressBar.ts';
export { ProgressCircular } from './ProgressCircular.ts';
export { Skeleton         } from './Skeleton.ts';
export { Snackbar         } from './Snackbar.ts';
export { Tag              } from './Tag.ts';
export { Tooltip          } from './Tooltip.ts';

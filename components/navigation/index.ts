/**
 * @module    components/navigation
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Barrel — navigation components (Batch 3 of the Component 2.0 migration).
 * Importing this module side-effect-registers all 7 custom elements so the
 * tags become available in HTML markup, plus re-exports the classes for JS
 * usage.
 *
 * Tags registered:
 *   arianna-breadcrumb, arianna-header, arianna-menu, arianna-nav-rail,
 *   arianna-pagination, arianna-stepper, arianna-sidebar
 *
 * Sidebar uses `<arianna-resizer>` internally for resize, so make sure the
 * modifiers/2D barrel is imported before mounting a resizable sidebar.
 */

export { Breadcrumb } from './Breadcrumb.ts';
export { Header }     from './Header.ts';
export { Menu }       from './Menu.ts';
export { NavRail }    from './NavRail.ts';
export { Pagination } from './Pagination.ts';
export { Stepper }    from './Stepper.ts';
export { Sidebar }    from './Sidebar.ts';

export type { BreadcrumbItem, BreadcrumbOptions } from './Breadcrumb.ts';
export type { HeaderOptions }                     from './Header.ts';
export type { MenuItem, MenuOptions }             from './Menu.ts';
export type { NavRailItem, NavRailOptions }       from './NavRail.ts';
export type { PaginationOptions }                 from './Pagination.ts';
export type { StepperOptions }                    from './Stepper.ts';
export type {
    SidebarItem, SidebarSection, SidebarOptions,
} from './Sidebar.ts';

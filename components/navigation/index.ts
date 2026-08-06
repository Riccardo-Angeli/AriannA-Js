/**
 * @module    components/navigation
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Barrel — navigation components.
 */

export { Breadcrumb } from './Breadcrumb.ts';
export { Header } from './Header.ts';
export { Menu } from './Menu.ts';
export { NavRail } from './NavRail.ts';
export { Pagination } from './Pagination.ts';
export { Stepper } from './Stepper.ts';
export { Sidebar } from './Sidebar.ts';

import { Breadcrumb as BreadcrumbNamespace } from './Breadcrumb.ts';
import { Header as HeaderNamespace } from './Header.ts';
import { Menu as MenuNamespace } from './Menu.ts';
import { NavRail as NavRailNamespace } from './NavRail.ts';
import { Pagination as PaginationNamespace } from './Pagination.ts';
import { Stepper as StepperNamespace } from './Stepper.ts';
import { Sidebar as SidebarNamespace } from './Sidebar.ts';

export type BreadcrumbItem = BreadcrumbNamespace.Interfaces.BreadcrumbItem;
export type BreadcrumbOptions = BreadcrumbNamespace.Interfaces.BreadcrumbOptions;
export type HeaderOptions = HeaderNamespace.Interfaces.HeaderOptions;
export type MenuItem = MenuNamespace.Interfaces.MenuItem;
export type MenuOptions = MenuNamespace.Interfaces.MenuOptions;
export type NavRailItem = NavRailNamespace.Interfaces.NavRailItem;
export type NavRailOptions = NavRailNamespace.Interfaces.NavRailOptions;
export type PaginationOptions = PaginationNamespace.Interfaces.PaginationOptions;
export type StepperOptions = StepperNamespace.Interfaces.StepperOptions;
export type SidebarItem = SidebarNamespace.Interfaces.SidebarItem;
export type SidebarSection = SidebarNamespace.Interfaces.SidebarSection;
export type SidebarOptions = SidebarNamespace.Interfaces.SidebarOptions;

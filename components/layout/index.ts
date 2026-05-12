// components/layout/index.ts — public surface of the Layout component group.
//
// Containers and chrome that arrange other components on screen: panels,
// modals, drawers, dock launcher, and full window chrome.

// ── Pre-existing layout components ─────────────────────────────────────────
export { Accordion }      from './Accordion';
export { Card }           from './Card';
export { Drawer }         from './Drawer';
export { Modal }          from './Modal';
export { Panel }          from './Panel';
export { Splitter }       from './Splitter';
export { Table }          from './Table';
export { Tabs }           from './Tabs';

// ── New May-2026: desktop launcher + draggable window chrome ───────────────
export { Dock }   from './Dock';
export { Window } from './Window';

export type { DockStyle, DockItem, DockOptions } from './Dock';
export type { WindowStyle, WindowOptions, WindowMenuItem } from './Window';

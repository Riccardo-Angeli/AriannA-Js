# AriannA Core 2.0 Fix Bundle

Applied fixes based on the agreed architecture:

- `Core.ts` adds `IsUpgraded`, `Upgrade`, `UpgradeTree` and routes `MutationObserver` upgrades through `Upgrade()`; default Markup IR remains MO + O(1) descriptor lookup.
- `Directive.ts` removes `customElements.define` from the decorator path and routes registration through `Core.Define`. Shadow default is now `closed`; closed roots are guarded by WeakMap in the legacy decorator.
- `Component.ts` stores closed ShadowRoots on `Symbol.for('arianna.shadow.root')`; `.shadow()` now defaults to `closed`; `_applySheet()` injects into closed roots correctly.
- `Namespace.ts` uses the same shadow-root symbol helper so markup-upgraded components render templates into closed Shadow DOM consistently.

Not changed here:

- 137 component files are not rewritten in this core bundle.
- `arianna.js` compiled output is not rebuilt; rebuild with your package script after replacing the TS sources.
- SSR API is not rewritten; use `Core.UpgradeTree(root)` as explicit hydration/escape-hatch support.

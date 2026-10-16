# Install

Copy these directories without flattening them:

- `components/mobile`
- `components/watch`
- `components/tv`
- `additionals/mobile`
- `kits` when native projects are required

Preserve the existing project and all unrelated source directories. Add the following exports exactly once:

```ts
// components/index.ts
export * from './mobile/index.ts';
export * from './watch/index.ts';
export * from './tv/index.ts';

// additionals/index.ts
export * as Mobile from './mobile/index.ts';
```

Run `npm run typecheck` and `npm run build`. Replace both generated `arianna-components(.min).js` and `arianna-additionals(.min).js` variants actually selected by Playground. Reload with cache disabled.

For framework development use `Playground/Framework/devtools/playground/playground.html`. For the website use `Playground/Web/playground.html`. Do not replace Vite, Wrangler or the whole website with this patch.

The console entry `[device-kits]` must report `mobile`, `watch` and `tv` as `function`, and `services` as `true`. It also prints the exact Components bundle URL used by the page.

The native folders are integration kits, not pre-authorized device access. iOS entitlements, Android runtime permissions, ActivityResult/view-controller delegates, signing and secure CIE/PACE remain host-application responsibilities.

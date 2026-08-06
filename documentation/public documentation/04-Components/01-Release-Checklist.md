# Component Release Checklist

## Structure

- [ ] one runtime owner class;
- [ ] local Types and Interfaces in the merged namespace;
- [ ] no empty compliance-only namespace;
- [ ] no unowned helper or cache;
- [ ] primary class as default export.

## Imports

- [ ] named Core imports from `core/index.ts`;
- [ ] no legacy `html` or `escapeHtml` import;
- [ ] no source-module default externalized to the package default;
- [ ] type-only imports use `import type`.

## Runtime

- [ ] callable `Component` decorator;
- [ ] `Templates.Template.Html`;
- [ ] `SSR.Renderer.EscapeHtml`;
- [ ] effects, observers, timers, workers, object URLs and listeners disposed;
- [ ] reconnect is idempotent.

## TypeScript

- [ ] strict compile;
- [ ] declaration emit;
- [ ] no implicit `any`;
- [ ] no conflicting interface merge;
- [ ] no global `HTMLElement` augmentation.

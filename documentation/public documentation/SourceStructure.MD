# Source Structure

```text
arianna-js/
├── .github/
├── additionals/
├── components/
├── config/
├── core/
│   ├── schema/
│   │   ├── Interfaces.ts
│   │   └── Types.ts
│   ├── Compiler.ts
│   ├── Components.ts
│   ├── Context.ts
│   ├── Core.ts
│   ├── Css.ts
│   ├── Directives.ts
│   ├── Events.ts
│   ├── index.ts
│   ├── Jsx.ts
│   ├── Namespaces.ts
│   ├── Observer.ts
│   ├── Plugins.ts
│   ├── Properties.ts
│   ├── Reactive.ts
│   ├── Real.ts
│   ├── Router.ts
│   ├── Service.ts
│   ├── Shadow.ts
│   ├── SSR.ts
│   ├── State.ts
│   ├── Template.ts
│   ├── Virtual.ts
│   └── Workers.ts
├── devtools/
├── assets/
├── examples/
├── ideas/
├── legacy/
├── release/
│   ├── benchmark/
│   └── dist/
├── scripts/
│   ├── arianna-compile.mjs
│   ├── build.mjs
│   ├── check-barrel.cjs
│   └── generate-component-stubs.cjs
├── types/
├── .gitignore
├── global.d.ts
├── index.cjs
├── index.mjs
├── index.ts
├── LICENSE
├── package-lock.json
├── package.json
├── README.md
└── tsconfig.json
```

## Compiler architecture

The compiler is now unified in:

```text
core/Compiler.ts
```

and exposes:

```text
Compilers.Parser
Compilers.Analyzer
Compilers.Transform
Compilers.Optimizer
Compilers.Generator
Compilers.Compiler
```

The previous standalone compiler directory is no longer part of the source structure.

Build integration remains in:

```text
scripts/arianna-compile.mjs
scripts/build.mjs
```

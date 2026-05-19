<div align="center">

# AriannA

**Fine-grain reactive UI framework + components ecosystem**

*Dedicated with love to my daughter Arianna ♡*

[![npm version](https://img.shields.io/npm/v/arianna?color=%23e40c88&style=flat-square)](https://www.npmjs.com/package/arianna)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSES/MIT.txt)
[![Zero deps](https://img.shields.io/badge/dependencies-0-brightgreen?style=flat-square)](package.json)
[![Components](https://img.shields.io/badge/components-141-e40c88?style=flat-square)](#components)
[![Bundles](https://img.shields.io/badge/runtime-55KB%20gz-brightgreen?style=flat-square)](#bundles)

[**ariannajs.dev**](https://ariannajs.dev) · [Documentation](https://ariannajs.dev/reference.html) · [Playground](https://ariannajs.dev/playground.html) · [npm](https://www.npmjs.com/package/arianna) · [Changelog](CHANGELOG.md)

</div>

---

AriannA is a TypeScript UI framework built around **Signal+Sink fine-grain reactivity** — only the exact DOM node that depends on a signal updates. No component re-render, no VDOM diffing, zero dependencies. Around the runtime sits a 141-component design system, a CSS engine with full @-rule support, an SSR pipeline, and twelve project starters spanning browser and Tauri (macOS, Windows, Linux, iOS, Android).

## At a glance

```
┌─────────────────────────────────────────────────────────────────┐
│  arianna                  Runtime          55 KB gz   13 modules │
│  arianna/additionals      Domain libs     107 KB gz   19 modules │
│  arianna/components       Component set   202 KB gz  141 classes │
└─────────────────────────────────────────────────────────────────┘
```

| Layer | What | Size | Modules |
|-------|------|------|---------|
| **Core** | Signal+Sink runtime, Real, Virtual, Component, Stylesheet, Rule, Template, Directive, Context, State, Namespace, SSR, Workers | 55 KB gz | 13 |
| **Additionals** | AI, Two, Three, Animation, Audio, Video, Math, Geometry, Physics, Colors, Data, Finance, Latex, Midi, Network, IO, Docs, Less/Sass/Scss/Stylus | 107 KB gz | 19 |
| **Components** | 141 custom elements across 16 categories — see [Components](#components) | 202 KB gz | 141 |

---

## Performance vs Solid v1.9.3

AriannA's Signal+Sink architecture eliminates the render-phase entirely. The numbers below are measured on the standard `js-framework-benchmark` keyed suite, Chrome with 4× CPU throttle, Mac M-series.

| Benchmark | AriannA | Solid | Δ Total | Δ Script |
|-----------|---------|-------|---------|----------|
| create 1k       | 82.5 ms     | 80.6 ms   | +2%      | −2%      |
| replace 1k      | 89.3 ms     | 90.2 ms   | −1%      | −11%     |
| update 10th     | 40.5 ms     | 40.2 ms   | ≈        | **−54%** |
| **select row**  | **8.7 ms**  | 11.1 ms   | **−22%** | **−91%** |
| **swap rows**   | **30.5 ms** | 48.8 ms   | **−38%** | **−97%** |
| remove row      | 37.1 ms     | 38.1 ms   | −3%      | −85%     |
| create 10k      | 874 ms      | 839 ms    | +4%      | +23%     |
| **memory**      | **2.06 MB** | 2.64 MB   | **−22%** | —        |
| **bundle (gz)** | **1.5 KB**  | 4.5 KB    | **3× less** | —     |

Run the benchmark yourself: [github.com/Riccardo-Angeli/js-framework-benchmark](https://github.com/Riccardo-Angeli/js-framework-benchmark)

---

## Install

```bash
# From npm — full runtime + components
npm install arianna

# Scaffold a new project (interactive)
npx arianna new my-app

# Or pick a specific template
npx arianna new my-app --template counter
npx arianna new my-app --template tauri-macos
```

Or drop the pre-built bundles into any HTML file:

```html
<script type="module" src="https://unpkg.com/arianna/dist/arianna.js"></script>
<script type="module" src="https://unpkg.com/arianna/dist/arianna-additionals.js"></script>
<script type="module" src="https://unpkg.com/arianna/dist/arianna-components.js"></script>
```

When `arianna-components.js` finishes loading, it dispatches `arianna-ready` on `window`.

---

## Quick start

```ts
import { Real, signal } from 'arianna';

const count = signal(0);

new Real('button')
  .text(() => `Clicked ${count.get()} times`)
  .on('click', () => count.set(count.get() + 1))
  .append(document.body);
```

Or as a custom element:

```html
<arianna-button variant="primary" @click="onClick">Click me</arianna-button>
```

Or as a Vue-style component class:

```ts
import { Component } from 'arianna';

class Counter extends Component('arianna-counter', HTMLElement, {
    ':host': { display: 'inline-flex', padding: '8px 16px', cursor: 'pointer' },
}, { attrs: ['initial'] }) {
    template = `
        <span>Clicked {{ this.count() }} times</span>
        <button @click="this.increment">+</button>
    `;

    count = signal(0);
    increment = () => this.count.set(this.count.get() + 1);
}
```

---

## The four pillars

### 1. Signals — fine-grain reactivity

```ts
import { signal, signalMono, effect, computed, batch, sinkText } from 'arianna';

const name  = signal('AriannA');
const upper = computed(() => name.get().toUpperCase());

effect(() => console.log(upper.get())); // immediate + on every change

batch(() => {
  name.set('Hello');
  name.set('World');
}); // single flush

// Zero-allocation TextNode binding for hot paths
const mono = signalMono('initial');
sinkText(mono, myTextNode);
```

### 2. Real & Virtual — two DOM strategies, one API

`Real` writes directly to live DOM (eager, mutation-based). `Virtual` builds a tree of `VirtualNode`s and materialises on `append` / `render` (lazy, declarative). Both share the same fluent API.

```ts
import { Real, Virtual, signal } from 'arianna';

const loading = signal(false);

// Live DOM, immediate
new Real('div')
  .text(() => loading.get() ? 'Loading…' : 'Ready')
  .cls('busy', () => loading.get())
  .style('color', () => loading.get() ? '#999' : '#000')
  .append(document.body);

// Virtual DOM, deferred
new Virtual('section')
  .child(new Virtual('h1').text('Welcome'))
  .child(new Virtual('p').text('To AriannA'))
  .append('#app')
  .render();
```

### 3. Components — Web Components with Vue-style ergonomics

Two equivalent signatures: factory (for defining), constructor (for instantiating).

```ts
// Define
class Card extends Component('arianna-card', HTMLElement, {
    ':host': { display: 'block', padding: '16px', background: 'var(--arianna-bg-2)' },
    '.title': { fontSize: '20px', fontWeight: '600' },
}, { attrs: ['title'] }) {
    template = `
        <div class="title">{{ this.title }}</div>
        <slot></slot>
    `;
}

// Instantiate — six equivalent forms
const a = new Real('arianna-card').set('title', 'Hi').append('#app');
const b = new Virtual('arianna-card').set('title', 'Hi').append('#app');
const c = new Component('arianna-card', { title: 'Hi' });
const d = new Card();
const e = document.createElement('arianna-card');
// + HTML markup: <arianna-card title="Hi">…</arianna-card>
```

See [`COMPONENT_CONVENTIONS.md`](COMPONENT_CONVENTIONS.md) for the full spec — six instantiation forms, four definition forms, fifteen template directives, thirteen programmatic directives, five decorators, sheet inheritance.

### 4. Stylesheet & Rule — CSS with full @-rule support

```ts
import { Rule, Stylesheet } from 'arianna';

const sheet = new Stylesheet([
    new Rule('.btn', { background: '#e40c88', color: '#fff', padding: '6px 14px' }),
    new Rule('.btn:hover', { filter: 'brightness(1.1)' }),

    // @keyframes
    new Rule({
        Selector: { Type: '@keyframes', Name: 'fadeIn' },
        Contents: {
            From: { Opacity: '0' },
            To:   { Opacity: '1' },
        },
    }),

    // @media — fully nested
    new Rule({
        Selector: {
            Type: '@media', Media: 'screen',
            And: { MinWidth: '600px', MaxWidth: '800px' },
        },
        Rules: {
            BtnMobile: { Selector: '.btn', Rule: { width: '100%' } },
        },
    }),

    // @supports, @page, @counter-style, @font-face, @viewport,
    // @document, @import, @namespace, @charset — all supported
]);

sheet.attach();

// Less / Sass / Stylus parsers
const parsed = Stylesheet.Less(`
@primary: #e40c88;
.card {
    border-radius: 4px;
    &:hover { border-color: @primary; }
}
`);
```

---

## Components

141 custom elements across 16 categories. Every component renders fully styled out of the box via any of the six instantiation forms — the "default imperative" rule. Customise at three levels: CSS variables → individual `Rule` override → full `Stylesheet` replacement.

| Category | Count | Highlights |
|----------|-------|-----------|
| **inputs** | 16 | Button, TextField, Checkbox, Radio, Select, ColorPicker, DatePicker, RichTextEditor, Calendar, Switch, Slider, NumberInput, FileInput, SearchBox, Toggle, Stepper |
| **modifiers** | 23 | 2D + 3D mesh modifiers: Bend, Bevel, Twist, Wave, Mirror, Array, LOD, Subdivision, Decimate, Inflate, Smooth, Snap, Drag, Fade, Billboard |
| **graphics** | 16 | Canvas, SVG, GradientEditor, ShapeGradientEditor, RadialGradientEditor, BezierEditor, Layers, Groups, ColorPicker (HSL+RGB) |
| **display** | 13 | Icon, Image, Video, Avatar, Badge, Tag, Chip, Tooltip, Toast, Notification, Progress, Spinner, Skeleton |
| **finance** | 12 | CandlestickChart, Sparkline, Ticker, OrderBook, DepthChart, PortfolioView (bull/bear theme via `--arianna-bull` / `--arianna-bear`) |
| **layout** | 10 | Container, Grid, Stack, Flex, Frame, Desktop, SystemBar, Dock, Window, Pane |
| **payments** | 9 | PaymentGateway, ApplePay, GooglePay, Stripe, AliPay, Satispay, Nexi, PayPal, CreditCard |
| **navigation** | 7 | Tabs, Breadcrumbs, Pagination, Menu, ContextMenu, Sidebar, Stepper |
| **maps** | 7 | AppleMap, GoogleMap, BingMap, AzureMap, OpenStreetMap, MapLibreMap, …  |
| **audio** | 7 | AudioPlayer, AudioEditor, AudioTrackEditor, ChannelStrip, PianoRoll, TransportBar, AudioComponent |
| **shipments** | 6 | DHLTracker, UPSTracker, FedExTracker, BRTTracker, TrackingMulti |
| **animations** | 5 | Keyframe, KeyframeEditor, OnionStage (animation onion-skin via `--arianna-onion-past` / `--arianna-onion-future`) |
| **charts** | 3 | BarChart, LineChart, PieChart |
| **composite** | 3 | Chat (WhatsApp/Signal-style), CodeEditor (syntax highlight), NodeEditor (visual programming) |
| **data** | 2 | Table (sortable + paginated), TreeView |
| **video** | 2 | VideoPlayer, VideoEditor (native ↔ YouTube ↔ Vimeo ↔ Twitch) |

Browse the full catalog with live previews on [ariannajs.dev/reference.html](https://ariannajs.dev/reference.html).

---

## JSX

```json
// tsconfig.json
{ "compilerOptions": { "jsx": "react-jsx", "jsxImportSource": "arianna" } }
```

```tsx
import { signal } from 'arianna';

function App() {
  const count = signal(0);
  return (
    <div>
      <p>Count: <span>{() => count.get()}</span></p>
      <button onClick={() => count.set(count.get() + 1)}>+</button>
    </div>
  );
}
```

Note: `{() => count.get()}` keeps the JSX expression reactive (subscription wrapped in a getter). Bare `{count.get()}` reads once.

---

## SSR + hydration

```ts
import { renderToString, hydrate } from 'arianna';

// Server: HTML string
const html = renderToString(<App />);

// Client: re-attach to live DOM, no re-render
hydrate(document.getElementById('app'), <App />);
```

Island architecture: `Island` lets pre-rendered HTML co-exist with interactive AriannA components, hydrated lazily on visibility / interaction.

---

## Project starters

Twelve ready-to-run starter templates, distributed as 36 ZIP files in [`arianna-projects/releases/latest/`](https://github.com/Riccardo-Angeli/arianna-projects/tree/main/releases/latest) — each in three flavours: bare, paired with VSCode/WebStorm (browser) or VSCode/RustRover (Tauri).

### Browser

| Template | What it shows | Tags |
|----------|---------------|------|
| **minimal** | Smallest setup — one HTML, one TS file | `vanilla` |
| **counter** | Fine-grain reactivity with `signal()` + `computed()` | `signals` `tutorial` |
| **three-keyframes** | Three.js cube driven by `KeyframeEditor` | `three` `animation` |
| **physics** | Falling boxes / balls with `World`, `Body`, debug-draw | `physics` `canvas` |
| **desktop** | `Dock` + `Window` macOS / Windows / Linux | `layout` |
| **payments** | Multi-provider checkout (Stripe, PayPal, Apple Pay, Google Pay, Satispay, Nexi) | `commerce` |

### Tauri (Rust backend, native binaries)

| Template | Target | Pairs with |
|----------|--------|------------|
| **tauri/macos** | `.app` / `.dmg` | VSCode + RustRover |
| **tauri/windows** | `.exe` / `.msi` | VSCode + RustRover |
| **tauri/linux** | `.AppImage` / `.deb` | VSCode + RustRover |
| **tauri/ios** | iOS app bundle | VSCode + RustRover |
| **tauri/android** | `.apk` / `.aab` | VSCode + RustRover |
| **tauri/web** | Browser preview of the Tauri shell | VSCode + RustRover |

```bash
# Download a ZIP directly
curl -LO https://raw.githubusercontent.com/Riccardo-Angeli/arianna-projects/main/releases/latest/arianna-counter-vscode.zip

# Or scaffold via the CLI
npx arianna new my-app --template counter
```

---

## CLI

```bash
arianna new my-app                    # interactive scaffolder
arianna new my-app --template <name>  # one of the 12 starters

arianna generate component MyCard     # generate canonical component file
arianna serve                         # dev server on :3000
arianna build --minify                # produce dist/
arianna typecheck                     # tsc --noEmit
arianna info                          # versions, paths, credits
```

---

## API surface (re-exports from `arianna`)

```ts
// Reactive primitives
import {
    signal, signalMono, computed, effect, batch,
    sinkText, sinkAttr, sinkClass, sinkStyle,
} from 'arianna';

// DOM strategies
import { Real, Virtual, VirtualNode } from 'arianna';

// Component system
import { Component, Core } from 'arianna';

// Templating + directives
import { html, css, Template, Directive } from 'arianna';

// Decorators
import { Component as ComponentDecorator, Prop, Watch, Emit, Ref } from 'arianna';

// CSS
import { Rule, Stylesheet, CssState } from 'arianna';

// State management
import { State, Context } from 'arianna';

// SSR
import { renderToString, hydrate, Island, SSR } from 'arianna';

// Workers
import { WorkerPool, Workers } from 'arianna';

// Custom-element namespaces (XHTML, SVG, MathML)
import { Namespace } from 'arianna';
```

---

## Documentation map

| Doc | Audience |
|-----|----------|
| [README.md](README.md) | This file — ecosystem overview |
| [COMPONENT_CONVENTIONS.md](COMPONENT_CONVENTIONS.md) | Canonical spec: signatures, instantiation forms, directives, decorators, Sheet inheritance |
| [ariannajs.dev/reference.html](https://ariannajs.dev/reference.html) | Full API reference with live previews per component |
| [ariannajs.dev/playground.html](https://ariannajs.dev/playground.html) | Interactive editor — write, render, inspect |
| [CHANGELOG.md](CHANGELOG.md) | Per-version release notes |

---

## License

Dual-licensed: **MIT** (open source) + **Commercial** (closed source / enterprise).
See [LICENSES/](LICENSES/) for details.

---

<div align="center">

*© Riccardo Angeli 2012–2026 · Zurich, Switzerland*

*Thanks to: Alessandro De Rossi · Simone Ricucci · Alessandro Ligi · Marco Ciurcina · Aurora Castello · Massimiliano Ceaglio · Andrea Giammarchi*

</div>

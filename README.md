# AriannA

**1.0.0 · Final**

A reactive TypeScript framework for interactive applications, with DOM components, 2D and 3D graphics, audio and video editors, and visual workflows.

AriannA brings application logic and creative tools into one component system. Build a form, compose an editor, or combine graphics, media and workflow controls in the same interface.

[Reference](https://ariannajs.dev/reference) · [Website and documentation](https://ariannajs.dev) · [GitHub](https://github.com/Riccardo-Angeli/AriannA-Js) · [Issues](https://github.com/Riccardo-Angeli/AriannA-Js/issues)

## Install

```sh
npm install arianna@1.0.0
```

The package includes Core, Components and Additionals. They are entry points of **one npm package**, not three separate installations.

| Import | Purpose | Distribution bundle |
| --- | --- | --- |
| `arianna` | Core, DOM authoring, reactivity and application infrastructure | `arianna.js` |
| `arianna/components` | UI components and editors | `arianna-components.js` |
| `arianna/additionals` | Supporting engines and utilities | `arianna-additionals.js` |
| `arianna/runtime` | Standalone Reactivity and Templates exports | `arianna-runtime.js` |

JavaScript ES modules and TypeScript declarations are included. The package declares Node.js 18 or later for tooling. DOM examples run in a browser; use a browser entry point in your application, rather than executing them directly with Node.js.

## First application

For a Vite application, put a host in `index.html`:

```html
<div id="app"></div>
<script type="module" src="/src/main.ts"></script>
```

In `src/main.ts`:

```ts
import { Core, AriannA, Real } from 'arianna';

Core.Initialize();
await AriannA.Ready;

const parent = document.querySelector('#app');
if (!parent) throw new Error('Missing #app host');

new Real('button')
    .text('Hello')
    .append(parent)
    .render();
```

For Real and Virtual wrappers, append the wrapper to its host **before** calling `render()`.

To use a packaged component:

```ts
import { Button } from 'arianna/components';

const button = new Button.Button({ label: 'Hello' });
parent.append(button);
```

`Button` is a module namespace in this release; `Button.Button` is its constructor. Other exports may be constructors or namespaces: consult their bundled declarations instead of assuming every module has the same export shape.

## Architecture

The documented architecture assigns distinct responsibilities: **Real executes DOM mutations, Template plans rendering, Virtual reconciles, and Component orchestrates**. Reactivity propagates changes, Events manages event behavior, Namespaces resolves element identity, and Shadow selects the rendering boundary.

Virtual rendering is an authoring choice, not a requirement for every interface. The five authoring styles below are ways to create and mount views; they are not five independent DOM engines. Architecture revision labels in historical documents are separate from the public **1.0.0** release version.

## Five authoring styles

AriannA supports Real, Direct, Markup, Virtual and JSX. The following examples share the initialized `parent` from the first application. Use one example at a time.

### Real

Create and configure a DOM wrapper, mount it, then render:

```ts
import { Real } from 'arianna';

const real = new Real('button')
    .text('Hello')
    .append(parent)
    .render();
```

### Direct

Instantiate a component constructor and append its instance:

```ts
import { Button } from 'arianna/components';

const direct = new Button.Button({ label: 'Hello' });
parent.append(direct);
```

### Markup

Load Components in the browser entry point:

```ts
import 'arianna/components';
```

Then use the component tag in your HTML:

```html
<div id="app">
    <arianna-button label="Hello"></arianna-button>
</div>
```

Core and the component definitions must be initialized for the tag to become an interactive component. Supported attributes belong to each component's API; TypeScript options are not automatically interchangeable with arbitrary HTML attributes.

### Virtual

Create a Virtual wrapper and mount it before rendering:

```ts
import { Virtual } from 'arianna';

const virtual = new Virtual('button')
    .text('Hello')
    .append(parent)
    .render();
```

### JSX

Use AriannA's JSX factory and convert the result to DOM nodes:

```tsx
/** @jsx Jsx.Runtime.H */
import { Jsx } from 'arianna';

const view = <button>Hello</button>;
parent.append(...Jsx.Runtime.ToNodes(view));
```

This example requires a JSX transform configured for the classic factory `Jsx.Runtime.H`. For fragments, configure the fragment expression as `Jsx.Fragment`. JSX must be compiled before the browser executes it. Version 1.0.0 does not export an `arianna/jsx-runtime` subpath, so do not configure an automatic JSX import source with that path.

## Styling

Use ordinary CSS for native elements:

```css
#app > button {
    padding: 10px 20px;
    border: 0;
    border-radius: 8px;
    background: linear-gradient(135deg, #ff2a9d, #e40c88);
    color: white;
    font: 600 14px system-ui, sans-serif;
    cursor: pointer;
}

#app > button:hover {
    filter: brightness(1.08);
}

#app > button:active {
    transform: translateY(1px);
}
```

AriannA also provides its CSS pipeline through `Css`, and component defaults through `Namespaces.Namespace.Define`. Components with Shadow DOM use their own documented styling and theme interfaces; page CSS cannot directly target their shadow internals.

Where supported, select a component theme explicitly:

```html
<arianna-button theme="light" label="Hello"></arianna-button>
```

Theme support and styling options are component-specific. See the Reference for interactive examples.

## Custom elements

Use the exported `Namespaces` module to access the namespace API:

```js
import { Namespaces, Real } from 'arianna';

const { Namespace } = Namespaces;

function HelloCard() {
    this.textContent = 'Hello from AriannA';
}

HelloCard = Namespace.Define(
    'hello-card',
    HelloCard,
    HTMLDivElement,
    {
        Display: 'block',
        Padding: '24px 28px',
        Background: 'linear-gradient(135deg, #ff2a9d, #e40c88)',
        Color: 'white',
        BorderRadius: '12px',
        FontSize: '18px'
    }
);

new Real('hello-card').append(parent).render();
```

Keep the constructor returned by `Namespace.Define` when you want to use direct construction. A plain initializer function is not, by itself, a browser-created DOM node. In TypeScript, also handle the API's `false` return when a definition cannot be resolved or created.

## What is included

### Core

- Real, Virtual, Direct component construction and JSX authoring.
- Namespaces, component definitions, templates, Shadow DOM and directives.
- Reactivity, state, context, events and observers.
- CSS rules and stylesheets.
- Application and router infrastructure.
- Dedicated SSR, worker, WebAssembly, WebSocket, GraphQL and plugin APIs.

DOM-dependent components require a browser environment. The presence of an SSR API does not make every graphics, media or UI component server-renderable.

### Components

- Inputs, display controls, navigation, layout and themes.
- Data controls, charts, project and timeline interfaces.
- Composite interfaces, including Workflow, Chat and CodeEditor.
- Audio and video tracks and editors.
- 2D canvases, line editing, strokes, selection and modifiers.
- 3D canvases, primitives, materials and modifiers.
- Color pickers and gradient editors.
- Maps, animation, finance and automotive controls.

Combine these components through their public APIs. A canvas, a behavior and a tool panel can remain separate objects instead of being fused into a single editor.

### Additionals

Additionals supply supporting functionality, including AI, Animation, Audio, Colors, Data, Finance, Geometry, IO, Latex, Math, Midi, Network, Physics, Three, Two and Video, together with stylesheet parsers and timecode utilities.

For example, generate text with the included Markov-chain utility:

```ts
import { AI } from 'arianna/additionals';

const model = new AI.MarkovChain(2);
model.train(
    'Hello AriannA. Hello creative world. Hello AriannA world.',
    'word'
);

const words = model.generate(['Hello', 'AriannA.'], 20, 'word');
console.log(words.join(' '));
```

Feature availability, input formats and export capabilities depend on the selected additional. Consult its API before assuming that every import format has a matching exporter or that conversions preserve every feature.

## Imports and TypeScript

Import APIs from their actual owners:

```ts
import { Real, Virtual, Namespaces, Css, Reactivity } from 'arianna';
import { Button } from 'arianna/components';
import { AI, Three } from 'arianna/additionals';

const { Namespace } = Namespaces;
const { Rule, Stylesheet } = Css;
```

The package includes declarations for all four public entry points and the associated type tree. Prefer these public entry points over internal filesystem imports. The `types/` directory supplies declarations; it is not a collection of separately importable JavaScript implementations.

The distribution is ESM. Use `import`, not a CommonJS `require()` entry point.

## Browser bundles

When serving the distribution files directly, keep the companion bundles in the same directory. Components and Additionals import `./arianna.js` relative to their own location.

```html
<div id="app"></div>
<script type="module">
    import { Core, AriannA, Real } from './vendor/arianna.js';

    Core.Initialize();
    await AriannA.Ready;

    new Real('button')
        .text('Hello')
        .append(document.querySelector('#app'))
        .render();
</script>
```

Serve the files over HTTP or HTTPS. If your deployment forbids inline scripts, move this script into an external module allowed by your Content Security Policy.

Do not mix different releases of Core, Components and Additionals, or load duplicate copies of Core through unrelated URLs.

## Performance

AriannA has been tested locally using Stefan Krause's `js-framework-benchmark`, with keyed and non-keyed implementations. The supplied test report records a run on **23 August 2026**, on the author's Mac (`Rigel`), with Node.js **22.23.2**.

The following are **historical, author-reported measurements** from that report. Its implementation labels are `arianna-v2.0.0-keyed` and `arianna-v2.0.0-non-keyed`; they predate the current public release name, **1.0.0 Final**. The supplied evidence does not establish an identical runtime hash between that run and the current npm package.

### CPU / DOM

Total-duration medians in milliseconds; lower is better within the same test configuration. Operation suffixes such as `x16` and `x8` are retained from the benchmark and must not be interpreted as unscaled single-operation measurements.

| Benchmark | Keyed median | Non-keyed median |
|---|---:|---:|
| `01_run1k` | 81.5 ms | 96.3 ms |
| `02_replace1k` | 141.9 ms | 59.7 ms |
| `03_update10th1k_x16` | 75.7 ms | 71.3 ms |
| `04_select1k` | 14.5 ms | 13.7 ms |
| `05_swap1k` | 69.1 ms | 49.4 ms |
| `06_remove-one-1k` | 65.7 ms | 108.2 ms |
| `07_create10k` | 1514.4 ms | 1440.0 ms |
| `08_create1k-after1k_x2` | 105.5 ms | 94.2 ms |
| `09_clear1k_x8` | 54.0 ms | 57.1 ms |

### Memory

Reported benchmark memory in MiB, not total browser or application process memory:

| Memory benchmark | Keyed | Non-keyed |
|---|---:|---:|
| `21_ready-memory` | 0.7664 MiB | 0.7709 MiB |
| `22_run-memory` | 3.0805 MiB | 3.0646 MiB |
| `25_run-clear-memory` | 1.0884 MiB | 1.0938 MiB |
| `26_run-10k-memory` | 22.4444 MiB | 21.9359 MiB |

The report records successful plausibility checks and approximately 1.09 MiB after five create/clear cycles. These observations cover the benchmark workload, not every editor or application.

Raw per-run JSON, benchmark commit, exact browser version, hardware specifications and final benchmark screenshots were not included in the supplied documentation archive. These results are therefore not an independently reproduced ranking, a current-release performance guarantee, or a comparison with other frameworks.

## Desktop and mobile projects

AriannA can be used as the frontend of a [Tauri](https://v2.tauri.app/) application. Project downloads are available through the [AriannA website](https://ariannajs.dev).

The npm package supplies the framework. Native application builds additionally require the relevant platform toolchain and project configuration. An installed production application must include its built frontend assets; a development server URL is not an offline application bundle.

## Documentation and support

Start with the [Reference](https://ariannajs.dev/reference) for examples, then use the **Docs**, **Projects** and **Playground** links on the website for API documentation, starter projects and interactive exploration.

When reporting a problem, include:

- AriannA version and the affected component or additional.
- Browser or native platform and toolchain versions.
- A minimal reproduction, expected result and actual result.
- Relevant console or build output.

Report issues on [GitHub](https://github.com/Riccardo-Angeli/AriannA-Js/issues).

## Author and licensing

Created by **Riccardo Angeli**.

The supplied licensing documents are [MIT](LICENSES/MIT.txt) and [Commercial](LICENSES/COMMERCIAL.md). See also [LICENSE](LICENSE). Licensing enquiries: [licensing@ariannajs.dev](mailto:licensing@ariannajs.dev).

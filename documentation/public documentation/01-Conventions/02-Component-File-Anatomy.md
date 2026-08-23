# Component File Anatomy

> **Architecture:** AriannA 2.0. Where older examples describe a different DOM ownership model, `ARCHITECTURE.md` is authoritative: **Real executes DOM mutations; Template plans; Virtual reconciles; Component orchestrates.**

Components are not Core. Component-specific contracts belong to the merged component namespace.

```ts
import
{
    Component,
    Reactivity,
    Templates
}
from '../../core/index.ts';

const html =
    Templates.Template.Html;

@Component('arianna-example', {}, { Attributes: ['value'] })
export class Example extends HTMLElement
{
    declare template:
        unknown;

    readonly #value =
        new Reactivity.Signal('');

    onConnected(): void
    {
        this.template =
            html`<span>{{ this.Value }}</span>`;
    }
}

export namespace Example
{
    export namespace Types
    {
        export type Mode =
            'compact' |
            'comfortable';
    }

    export namespace Interfaces
    {
        export interface Options
        {
            Value? : string;
            Mode?  : Types.Mode;
        }
    }
}

export default Example;
```

Rules:

- the class owns runtime behavior;
- the merged namespace owns component-local Types, Interfaces and public helpers;
- no global `HTMLElement` augmentation;
- shared capabilities are declared once on a base component;
- concrete subclasses do not repeat conflicting interface merges;
- module-scope helpers are folded into the class or namespace before release;
- Core surfaces are named imports from `core/index.ts`.

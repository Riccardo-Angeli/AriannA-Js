# Swift ↔ Logos — CSS → SwiftUI

> Il lowering `arianna.css → arianna.swiftui`, in **poche funzioni**. Il *modello* (tipi View/Modifier + tabella property→modifier) è **dato** dentro Logos (`Logos.SwiftUI`); l'**emitter** è un piccolo backend (`Swift.ts`) che lo applica. Deterministico e side-effect-free: stesse dichiarazioni ⇒ stesso sorgente SwiftUI.

```
Logos.Css.Rule ──view()──► Logos.SwiftUI.View ──emit()──► SwiftUI source
```

SwiftUI è un **target dialect** (`Level: 'target'`) della piattaforma `apple`. Consuma il frammento `Logos.Css` — quindi vale per QUALSIASI Css nel programma, non solo per AriannA.

---

## 1. Il dialect SwiftUI (dato, in Logos)

```ts
export namespace SwiftUI {
    export type ViewKind = 'Text'|'VStack'|'HStack'|'ZStack'|'Image'|'Button'|'Rectangle'|'Spacer'|'ScrollView'|'Group';

    export interface Modifier { readonly Name: string; readonly Arguments: readonly Value[]; }
    export interface View     { readonly Kind: ViewKind; readonly Text?: string; readonly Modifiers: readonly Modifier[]; readonly Children: readonly View[]; }

    /** Come tradurre un valore CSS in un argomento SwiftUI. */
    export type ValueTransform = 'color'|'length'|'number'|'font-weight'|'enum'|'passthrough'|'ignore';

    /** Una regola dichiarativa property-CSS → modifier-SwiftUI. */
    export interface Mapping { readonly Css: string; readonly Modifier: string; readonly Transform: ValueTransform; readonly EnumMap?: Readonly<Record<string,string>>; }

    /** Tabella rappresentativa — pura DATO. Aggiungere una property = una riga. */
    export const CssMap: readonly Mapping[] = [
        { Css:'color',            Modifier:'foregroundColor',        Transform:'color'       },
        { Css:'background-color', Modifier:'background',             Transform:'color'       },
        { Css:'padding',          Modifier:'padding',                Transform:'length'      },
        { Css:'opacity',          Modifier:'opacity',                Transform:'number'      },
        { Css:'font-size',        Modifier:'font',                   Transform:'length'      },
        { Css:'font-weight',      Modifier:'fontWeight',             Transform:'font-weight' },
        { Css:'corner-radius',    Modifier:'cornerRadius',           Transform:'length'      },
        { Css:'border-radius',    Modifier:'cornerRadius',           Transform:'length'      },
        { Css:'width',            Modifier:'frame',                  Transform:'length'      },
        { Css:'height',           Modifier:'frame',                  Transform:'length'      },
        { Css:'text-align',       Modifier:'multilineTextAlignment', Transform:'enum',
          EnumMap:{ left:'leading', center:'center', right:'trailing' } },
    ];
}
```

---

## 2. L'emitter — sei funzioni (in `Swift.ts`)

Tre pubbliche (`modifiers` / `view` / `emit`) e tre helper di valore (`color` / `length` / `weight` + il dispatch `args` e il format `fmt`). Consuma `Logos` come valore per leggere `CssMap`.

```ts
import IR from './IR.ts';   // = Logos

export namespace Swift {
    const NAMED = new Set(['red','green','blue','black','white','gray','orange','yellow','pink','purple','clear','primary','secondary']);

    function color(v: string): string {
        const s = v.trim().toLowerCase();
        if (NAMED.has(s))      return `.${s}`;
        if (s.startsWith('#')) return `Color(hex: "${v.trim()}")`;
        return `Color("${v.trim()}")`;
    }
    function length(v: string): number { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; }
    function weight(v: string): string {
        const map: Record<string,string> = { '100':'.thin','200':'.ultraLight','300':'.light','400':'.regular','500':'.medium','600':'.semibold','700':'.bold','800':'.heavy','900':'.black', normal:'.regular', bold:'.bold' };
        return map[v.trim().toLowerCase()] ?? '.regular';
    }
    function args(m: IR.SwiftUI.Mapping, raw: string): IR.Value[] {
        switch (m.Transform) {
            case 'color':       return [color(raw)];
            case 'length':      return [length(raw)];
            case 'number':      return [Number.isFinite(parseFloat(raw)) ? parseFloat(raw) : 0];
            case 'font-weight': return [weight(raw)];
            case 'enum':        return ['.' + (m.EnumMap?.[raw.trim().toLowerCase()] ?? raw.trim())];
            case 'passthrough': return [raw];
            case 'ignore':      return [];
        }
        return [];
    }
    function fmt(a: IR.Value): string { return typeof a === 'number' ? String(a) : typeof a === 'string' ? a : JSON.stringify(a); }

    export function modifiers(decls: IR.Css.Declarations): IR.SwiftUI.Modifier[] {
        const out: IR.SwiftUI.Modifier[] = [];
        for (const m of IR.SwiftUI.CssMap) {
            const raw = decls[m.Css];
            if (raw === undefined || m.Transform === 'ignore') continue;
            out.push({ Name: m.Modifier, Arguments: args(m, String(raw)) });
        }
        return out;
    }
    export function view(rule: IR.Css.Rule, kind: IR.SwiftUI.ViewKind = 'VStack', children: readonly IR.SwiftUI.View[] = []): IR.SwiftUI.View {
        return { Kind: kind, Modifiers: modifiers(rule.Declarations), Children: children };
    }
    export function emit(v: IR.SwiftUI.View, indent = 0): string {
        const pad  = '    '.repeat(indent);
        const mods = v.Modifiers.map(m => `\n${pad}    .${m.Name}(${m.Arguments.map(fmt).join(', ')})`).join('');
        if (v.Kind === 'Text')            return `${pad}Text("${v.Text ?? ''}")${mods}`;
        if (v.Children.length === 0)      return `${pad}${v.Kind} { }${mods}`;
        const body = v.Children.map(c => emit(c, indent + 1)).join('\n');
        return `${pad}${v.Kind} {\n${body}\n${pad}}${mods}`;
    }
}
```

---

## 3. Esempio funzionante (output reale, verificato)

Input CSS (`Logos.Css.Rule`):

```ts
{ Selector:'.hero', Rules:[], Declarations:{
    color:'red', 'background-color':'#0af', padding:'16px',
    'font-weight':'700', 'font-size':'20px', 'text-align':'center', opacity:'0.9'
}}
```

Output SwiftUI (`Swift.emit(...)`):

```swift
VStack {
    Text("Ciao Arianna")
        .foregroundColor(.red)
        .background(Color(hex: "#0af"))
        .padding(16)
        .opacity(0.9)
        .font(20)
        .fontWeight(.bold)
        .multilineTextAlignment(.center)
}
    .foregroundColor(.red)
    .background(Color(hex: "#0af"))
    .padding(16)
    …
```

---

## 4. Note di rifinitura (sono righe di dati, non codice)

- `font-size` oggi emette `.font(20)`; in SwiftUI vero serve `.font(.system(size: 20))`. → aggiungere una `ValueTransform: 'font-size'` (o un template nel `Mapping`).
- `width`/`height` puntano entrambi a `frame` → due `.frame()` separati. Andrebbe fuso in `.frame(width:…, height:…)`: caso speciale nell'emitter o un `Mapping` che collassa le due property.
- Colori: `Color(hex:)` richiede un'estensione SwiftUI (`init(hex:)`); i named (`.red`) sono nativi.

Il **meccanismo** è provato; la resa esatta è raffinamento della tabella + un paio di casi nell'emitter.

---

## 5. Come si inserisce in Logos

- `Logos.SwiftUI` è il dialect target (`apple` platform, `Level:'target'`).
- `Swift.ts` è un **backend/emitter**: consuma un frammento `Logos.Css` e produce sorgente. Non è IR (ha funzioni), quindi sta fuori dallo schema function-free.
- Nel pipeline: `arianna.css (HIR) → arianna.swiftui (LIR, Target.Kind='swiftui') → SwiftUI source`. In Tauri/Rust l'equivalente `targets/swiftui.rs` farebbe lo stesso lowering per build native.

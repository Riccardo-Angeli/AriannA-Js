# AriannA ↔ Logos — La faccia di AriannA

> AriannA possiede soltanto **la propria faccia** del contratto Logos: le `Definitions` e il runtime dei propri concern, più un adapter che esporta un `Logos.Fragment<'arianna.ui'>`. Non conosce l'IR globale, i dialect di calcolo, né il lowering verso i target. Gira su **Tauri**: WebView (TypeScript) ↔ IPC ↔ processo Rust.

---

## 1. Regola di appartenenza

```
AriannA (WebView / TypeScript)              Backend (Rust / Tauri)
├── Definitions (facce IR dei concern)       ├── Logos.Program (composizione canonica)
├── Runtime (handle vivi, DOM)               ├── Linker · Validator · Canonicalizer
├── FragmentBuilder                          ├── Serializer (JSON/XML/binario) · ORM
└── Adapter AriannA ↔ Logos (IPC)            ├── Compiler / Lowering · Security / Signing
                                             └── Target backends (dom/qnx/vxworks/cuda/llvm)
```

AriannA **produce** un `Fragment`; il backend **compone** il `Program`. Entrambi dipendono dallo schema `logos.lgs`; nessuno lo possiede.

---

## 2. Due facce per ogni modulo AriannA

Ogni concern espone **Runtime** (vivo) e **IR/Definition** (dato). È la regola che chiude AriannA e la allinea a Logos.

```
Core     ├── Core.Descriptors.RuntimeType     └── Core.Descriptors.IRType
Events   ├── Events.Descriptors.Runtime        └── Events.Descriptors.IR
Virtual  ├── Virtual.Descriptors.Runtime       └── Virtual.Descriptors.IR
Css      ├── Css.Descriptors.Runtime           └── Css.Descriptors.IR
Observable ├── Observable.Runtime              └── Observable.Descriptors.IR
```

La faccia **Runtime** può portare `Constructor`, `EventListener`, `Element`, `CSSStyleDeclaration`, getter vivi. La faccia **IR** no: comportamento per riferimento, valori serializzabili.

Mappatura corrente → Logos:

| AriannA (oggi) | Logos (faccia IR) |
|----------------|-------------------|
| `class Virtual implements Virtual.Node` | `Logos.Node.Descriptor` (sottoinsieme dichiarativo) |
| `Core.Descriptors.Type` | `Logos.Type.Descriptor` (Constructor→`ConstructorRef`) |
| `Rule` / `Stylesheet` | `Logos.Css.Descriptor` (una chiave `Declarations`, scope-intent) |
| `Events.EventDescriptor` / binding | `Logos.Events.{Event,Binding,Handler,Code,Target,Broker}` |
| `Observable` signal/effect | `Logos` (Signal/Binding definitions — da formalizzare) |

---

## 3. Cosa resta in AriannA, cosa no

**Resta** (Definitions + runtime + builder):

```
Core.TypeDefinition · Namespace.Definition
Virtual.NodeDefinition · Events.EventDefinition · Events.EventBindingDefinition
Stylesheet.StyleDefinition · Observable.SignalDefinition · Observable.BindingDefinition
AriannA.FragmentBuilder · AriannA.FragmentPatch
+ tutto il runtime: Virtual.NodeRuntime, Events.Runtime, Stylesheet.Runtime,
  Observable runtime, Real DOM handles, Tauri IPC adapter
```

**Non deve stare** nel runtime AriannA (è backend):

```
IR linker globale · tutti i dialect · target lowering
LLVM/CUDA compiler · QNX/VxWorks backend
ORM canonico globale · firma dell'intero programma · cross-domain validator
```

Dipendenza minima del frontend — solo i contratti, type-only:

```ts
import type {
    Fragment, Definition, Reference, CapabilityRequirement,
} from '@ra-software/logos';
```

---

## 4. Il Fragment prodotto da AriannA

```ts
const fragment: Logos.Fragment<'arianna.ui'> = {
    Schema:  'urn:arianna:logos:2',
    Version: '2.0.0',
    Domain:  'arianna.ui',
    Definitions: [
        ...types,      // Logos.Type.Descriptor[]
        ...nodes,      // Logos.Node.Descriptor[]
        ...styles,     // Logos.Css.Descriptor[]
        ...events,     // Logos.Events.{Event,Binding,…}[]
    ],
    References: [],
    Requirements: [
        { Capability: 'tree' },
        { Capability: 'events.bubble' },
        { Capability: 'presentation.style' },
    ],
};
```

Il backend lo linka con altri frammenti (`security`, `workflow`, `compute`, `target-platform`) in un `Logos.Program`. AriannA **non** importa l'universo IR: importa solo `Fragment` + i tipi minimi.

---

## 5. FragmentBuilder — l'adapter

`Fragment.ts` (in `arianna-js/core/`) è l'unico punto che traduce le facce Runtime nelle Definitions Logos.

```ts
export namespace Fragment {
    /** Proietta l'albero Virtual vivo in Node.Descriptor dichiarativi (function-free). */
    export function fromVirtual(root: Virtual): Logos.Node.Descriptor { /* legge Path/Tag/Attributes/Children/BindingIds */ }

    /** Compone il frammento AriannA completo dai registry runtime. */
    export function build(): Logos.Fragment<'arianna.ui'> { /* types + nodes + styles + events */ }

    /** Patch dichiarativo verso il backend (sync mode). */
    export function patch(rev: number, ops: readonly Logos.PatchOperation[]): Logos.FragmentPatch { /* … */ }
}
```

Nessuna funzione viva attraversa il confine IPC: solo dati.

---

## 6. I tre modi (Tauri)

1. **Authoring** (locale, veloce): il runtime AriannA aggiorna le `NodeDefinition`/`StyleDefinition`/`EventBinding` in memoria. Nessuna chiamata backend per mouse-move / signal-update / DOM-mutation / style-update.
2. **Synchronization**: `invoke('logos_apply_patch', { patch: Fragment.patch(rev, ops) })` — patch dichiarative, non stati grezzi.
3. **Compilation / persistence**: il backend fa `patch → validate → persist → canonicalize → hash → compile/link`.

```ts
// esempio: registrazione nodi
await invoke('logos_register_fragment', { fragment: Fragment.build() });
```

Il backend compone e possiede la verità canonica; il frontend può essere ricaricato senza perdere il `Program` persistito. AriannA non dipende dalla rete: il servizio Tauri locale basta.

---

## 7. Correttezza del DAG

- AriannA → dipende da `@ra-software/logos` **solo type-only** (contratti erasi a runtime, peso zero).
- AriannA → **non** dipende dal backend Rust (comunica via IPC con dati serializzabili).
- Core resta il kernel: nessun ciclo `Events→Core→Events`; le facce IR vivono nei moduli, la composizione nel backend.

Questa divisione preserva il DAG, evita un god-module in AriannA e sfrutta correttamente Tauri (Rust per parsing deterministico, hashing, firme, persistenza, code-gen, controllo risorse, serializzazione binaria, ORM).

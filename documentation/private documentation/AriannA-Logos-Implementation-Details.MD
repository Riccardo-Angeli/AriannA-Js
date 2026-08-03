# AriannA ↔ Logos — Implementation Details (chiusura)

> Documento operativo per **chiudere AriannA**, fare gli ultimi debug e farla combaciare con Logos. Raccoglie: i fix già applicati (con verifica), il debito residuo, il refactor a due facce, l'adapter Fragment, e la checklist di allineamento.

---

## 1. Fix già applicati e verificati (tsc-clean, harness Node)

| Area | Causa | Fix | Stato |
|------|-------|-----|-------|
| **Boot / render** | `Service.ts` era pre-fix: importava `Core`, i metodi usavano `Core.Services`, non esportava `Services`. Il nuovo `Core.ts` re-esporta `Services` da Service.ts → `Core.Services` `undefined` → primo `new Service()` in Events/Properties crashava al boot → stage vuoto. | `Service.ts` reso **leaf**: `export const Services = new Map()`, rimosso `import { Core }`, tutti i metodi usano la Map locale. Importato per primo in Core (prima di Properties/Events). | ✅ confermato ("ora funziona tutto playground") |
| **Chain** | Il patch di `document.createElement` aggiornava solo i `FUNCTION`. Ogni forma `Component(...)`/`@Component`/`class extends` è **CLASS** → `createElement('custom')` restava `HTMLUnknownElement`, chain sbagliata, `build()` mai eseguito. | Patch esteso a **qualsiasi custom** (`d.Custom && d.Constructor`), FUNCTION+CLASS. `Upgrade` è idempotente → l'observer su append è no-op. | ✅ harness: `CustomComponent > HTMLDivElement > HTMLElement`, `build()` true |
| **Regressione Virtual** | `class Virtual` era **annidata** in `namespace Virtual` (⇒ `Virtual.Virtual`), `export default Virtual` esportava il **namespace** → `new Virtual()` e `: Virtual` rotti in Jsx/Component/Real/SSR → stage Virtual/Jsx rotto. | `class Virtual` riportata **top-level** con declaration-merging (`class Virtual` + `namespace Virtual { Node }`), `implements Virtual.Node`, service `Virtual.Virtual`→`Virtual`. | ✅ tsc pulito su Virtual + Jsx + Component + Real + SSR |
| **Peso SSR** | SSR importava `Virtual` come **valore** → a runtime trascinava Virtual.ts + Core + Events (108KB) + Rule + Stylesheet + Template. E aveva un tipo-nodo locale `VNodeAccessor` (versione parziale duplicata). | SSR → **`import type Virtual`** (erasa a runtime, zero import nel JS emesso). `VNodeAccessor`/`accessNode` **rimossi**; `_renderNode`/`_walkNode`/`_hydrateNode` consumano `Virtual.Node` diretto; resta solo il normalizzatore scalare `attrStr`. Read-path → `Virtual.Node`, mutazione (Island `.set()`) → classe `Virtual`. | ✅ SSR standalone, dependency-free |

Il `Virtual.Node` (26 campi, dal commento SOT del modulo) è già la prima **faccia IR** codificata: mappa 1:1 su `Logos.Node`/descrittore.

---

## 2. Debito di determinismo (bloccante per Logos)

Logos richiede Id deterministici (build riproducibili). Da correggere:

- `Virtual.ts:99` — `static #Uid()` usa `Math.random`. → derivare da **Path** (`Root[b1][b2]…`) o content-hash del sottoalbero.
- `Virtual.ts:1398` — `#instanceId = 'vn-' + Math.random()`. → hash deterministico (tag + path + indice sheet).
- `Core.ts:3493` — generazione UUID via `Math.random`. → UUID deterministico o namespaced (UUIDv5 su input stabile).

Regola: nessun `Math.random` nel percorso che produce Definitions. Stesso sorgente ⇒ stesso `Fragment` ⇒ stesso hash.

---

## 3. Refactor a due facce (il cuore dell'allineamento)

Ogni modulo espone **Runtime** (vivo) e **IR** (dato). Piano per modulo:

```
Core     → Core.Descriptors.RuntimeType   |  Core.Descriptors.IRType   (Constructor/Interface/Prototype → ref/nomi)
Events   → Events.Descriptors.Runtime      |  Events.Descriptors.IR      (EventDescriptor esiste già → Definitions Event/Binding/Handler/Code/Target/Broker)
Virtual  → Virtual.Descriptors.Runtime     |  Virtual.Descriptors.IR      (Virtual.Node = già la faccia IR; estrarre il sottoinsieme dichiarativo)
Css      → Css.Descriptors.Runtime         |  Css.Descriptors.IR          (proiezione di Rule/Stylesheet: Selector+Declarations+Rules; scope-intent)
Observable → Observable.Runtime            |  Observable.Descriptors.IR    (SignalDefinition/BindingDefinition — da formalizzare)
```

Ordine consigliato:
1. **Determinismo** (§2) — prerequisito pulito, non tocca API.
2. **Css.Descriptors.IR** — proiezione da Rule/Stylesheet (una chiave `Declarations`, collassa gli alias `Contents/Content/Body/Rule`).
3. **Events.Descriptors.IR** — agganciare `EventDescriptor` esistente; `Node.Events` per riferimento (Binding ids), non closure.
4. **Split `Virtual.Node`** — dichiarativo (IR) vs stato runtime (Mounted/Loaded/Dirty/Real/History → fuori dalla faccia IR).
5. **Core.Descriptors.IRType** — function-free (ref).
6. **FragmentBuilder** (§4).

> Le facce IR migrano poi al package `logos` (o restano nei moduli e Logos le importa type-only): decisione da prendere quando il modello si assesta. Nel frattempo `IR.ts`/`Logos` le tiene come spec canonica.

---

## 4. FragmentBuilder + adapter Tauri

`arianna-js/core/Fragment.ts` — unico punto che attraversa il confine IPC, solo dati:

```ts
export namespace Fragment {
    export function fromVirtual(root: Virtual): Logos.Node.Descriptor;      // legge Path/Tag/Attributes/Children/BindingIds
    export function build(): Logos.Fragment<'arianna.ui'>;                  // types + nodes + styles + events
    export function patch(rev: number, ops: readonly Logos.PatchOperation[]): Logos.FragmentPatch;
}
```

- **Authoring**: runtime locale aggiorna le Definitions in memoria (nessuna IPC per mouse/signal/DOM).
- **Sync**: `invoke('logos_apply_patch', { patch: Fragment.patch(rev, ops) })`.
- **Compile/persist**: backend `validate → persist → canonicalize → hash → compile/link`.

Nessuna funzione viva attraversa IPC.

---

## 5. Debug residui noti (roadmap hardening)

Da chiudere prima del match completo (declaration-emit e export mismatch dalla roadmap):

- **tsc declaration-emit** su `TrackingMulti`, `UPSTracker`, `VideoPlayer`, `VideoTrackEditor` — proprietà `template`, `attrSignal` non emesse nei `.d.ts`. → dichiarare esplicitamente i tipi delle property (evitare inferenza da assegnazione privata).
- **`Virtual.ts` export/consumo** — risolto per `new Virtual()`/`: Virtual` (un-nest). Ri-verificare `Jsx.ts`/`SSR.ts` dopo l'applicazione su disco (i file consegnati sono tsc-clean; il disco va aggiornato).
- **`build-zips.mjs`** — le varianti `-vscode`/`-webstorm`/`-rustrover` devono embeddare i preset IDE.
- **Demo `VideoPlayer`** — switch provider (native ↔ YouTube/Vimeo/Twitch iframe) prima di chiudere il sito.
- **Playground** — `direct = new CustomElement()` su ref raw funzione/classe dà `[CustomElement, Object]` (limite JS: il framework non intercetta `new` su ref utente) → usare `Core.Create('custom')` o catturare il Wrapper negli esempi.
- **`Core.Create` CLASS** — warning `Reflect.construct failed` (non bloccante, chain corretta via fallback): ripulire.
- **`createElementNS`** — SVG/MathML custom (`case-1i`/`1q`/`3i`) non aggiornati: stesso patch di `createElement` su `createElementNS`.

---

## 6. Cosa AriannA NON deve contenere

Ribadito, per non reintrodurre il god-module durante il cleanup:

```
IR linker globale · tutti i dialect · target lowering
LLVM/CUDA/SwiftUI compiler · QNX/VxWorks backend
ORM canonico globale · firma dell'intero programma · cross-domain validator
```

Questi vivono nel backend Rust/Tauri (`src-tauri/src/ir/*`, `targets/*`) o in servizi esterni/plugin. AriannA dipende da `@ra-software/logos` **solo type-only**.

---

## 7. Checklist "match Logos"

- [ ] Id deterministici ovunque (no `Math.random` nel percorso Definitions).
- [ ] `Css.Descriptors.IR` (proiezione Rule/Stylesheet, una chiave `Declarations`).
- [ ] `Events.Descriptors.IR` (aggancio `EventDescriptor`; Node.Events per riferimento).
- [ ] Split `Virtual.Node`: faccia IR dichiarativa vs stato runtime.
- [ ] `Core.Descriptors.IRType` function-free (ref).
- [ ] `Observable.Descriptors.IR` (Signal/Binding definitions).
- [ ] `Fragment.build()` produce `Logos.Fragment<'arianna.ui'>` valido, hash stabile.
- [ ] Adapter IPC Tauri (`logos_register_fragment` / `logos_apply_patch`), solo dati.
- [ ] Debug residui §5 chiusi (declaration-emit, createElementNS, Reflect.construct, build-zips).
- [ ] AriannA importa `logos` **solo type-only**; nessun linker/dialect/target nel bundle frontend.

Quando la checklist è verde, AriannA **è** una sorgente Logos: produce un frammento canonico, deterministico, verificabile, che il backend Tauri compone, valida, persiste e abbassa verso DOM / SwiftUI / C / CUDA / LLVM / QNX / VxWorks.

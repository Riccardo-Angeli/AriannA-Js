# AriannA JS — Missing Bugs (da risolvere)

Repo: github.com/Riccardo-Angeli/AriannA-Js · branch cf2
Bundle: `release/dist/AriannA.ts` (esbuild ESM) → `release/dist/arianna.js`
Playground (devtools, NON nel bundle): `playground.html`
Stato: **2 bug aperti**. Aggiornato 2026-06-13.

---

## Bug 1 — Costruttori sbagliati su Component (`extends Component`)

### Sintomo
Con la forma factory:

```ts
class CustomComponent extends Component('custom', HTMLDivElement, { ...css })
{
    build() { this.style.background = '...'; this.textContent = '...'; }
}
```

l'elemento creato da markup / `createElement` / `Core.Create` / `Virtual` ha la
prototype chain del **base** invece che della sottoclasse:

- atteso:  `["CustomComponent","HTMLDivElement","HTMLElement",...]`
- ottenuto: `["HTMLDivElement","HTMLDivElement","HTMLElement",...]` (doppio = splice del base)

L'UNICO percorso corretto è `new CustomComponent()` diretto (la 6ª chain nel test),
perché lì `new.target = CustomComponent` e il factory ne splica il prototype.
Conseguenza: `build()` non gira, niente stile/contenuto. Da markup il nodo può
restare `HTMLUnknownElement`.

### Causa (verificata)
`Component.ts` ~1269-1285 (forma factory):

```ts
Core.Define(tag, base, base, css ?? {});   // Constructor = base
return base;                                // extends Component(...) ≡ extends base
```

- La factory **restituisce `base`** e **non lega mai la sottoclasse X**: a differenza
  della forma decorator (riga 1242 chiama `ComponentFn.Define(tag, Target)`), la
  factory non popola né `__ariannaSubclassByTag` né `desc.Class`.
- Non può: quando si valuta `Component('custom', …)` (espressione di heritage) la
  classe `X` non esiste ancora.
- Il repoint di `Namespace.Update` (~1370-1428) cerca la sottoclasse in:
  (1) `desc.Class` — non settato dalla factory;
  (1b) `__ariannaSubclassByTag.get(tag)` — non settato dalla factory;
  (2) `window[Pascal(tag)]` — per tag `custom` cerca `Custom`, ma la classe si
  chiama `CustomComponent` → mismatch.
  Tutti e tre falliscono → `desc.Constructor` resta `base` → chain del base.

Fatti accertati (da lettura codice):
- `desc.Constructor` per la forma factory **è l'oggetto nativo reale** (es. il vero
  `HTMLDivElement`), non un wrapper sintetico (`Core.Define` inoltra `ctor = base`;
  `_RealClass = base`; il window-install è saltato quando `ctor === interface`).
- Quindi `Object.getPrototypeOf(CustomComponent.prototype) === currentCtor.prototype`
  combacia, e `tryRepoint` (transitivo) accetterebbe la classe se la trovasse.
- `lib`: il MutationObserver **parte** all'avvio (Core auto-chiama `Initialize()`
  all'import → observer connesso a `document.documentElement`, config
  `{childList,subtree,attributes}`). `Bootstrap()` NON è mai chiamato → `Observer.live`
  resta `false`, ma `live` non blocca l'upgrade dei nodi non-trattino (solo i tag con
  `-` vengono rinviati allo Stack). Quindi non è "l'observer non parte": è il repoint
  che non risolve la sottoclasse.

### Vincolo che rende il fix non banale
Nel playground le classi top-level sono esposte su `globalThis` SOLO dopo l'eval
(exposeEpilogue). Durante l'eval — quando girano `createElement`/`Core.Create`/
`Virtual`/`new` — la classe NON è ancora esposta. Quindi:
- uno **scan globale** può risolvere solo i nodi aggiornati DOPO l'eval (es. il nodo
  da markup nella fase `finally` del runner), NON i percorsi eseguiti durante l'eval;
- i percorsi factory (createElement/Core.Create/Virtual) consultano `desc.Class`, che
  resta null finché un `new X()` non lo cattura via `new.target`. Ordine-dipendente.

### Tentativi
- **Opzione A** (scan globale per sottoclasse diretta del base, in `Namespace.Update`)
  → **FALLITA**: il blocco lanciava un'eccezione a runtime — `Object.keys(window)` +
  `window[key]` tocca global con getter che throwano in browser, non protetto da
  try/catch → ogni `Update` falliva (`namespace.Update failed`), `<custom>` →
  `HTMLUnknownElement`. Ripristinato l'originale. Lezione: qualunque scan va blindato
  con try/catch per-proprietà e va testato in un DOM REALE (non solo tsx/Node, dove
  `Object.keys(globalThis)` non ha getter ostili).
  Inoltre A risolve comunque solo il path `Update` (markup), non i 5 percorsi factory.

### Direzioni di fix da valutare (nessuna ancora scelta)
1. **Bind esplicito** (zero rischio framework): `Component.Define('custom', X)` dopo la
   classe, oppure forma `@Component('custom', css)` (lega già a riga 1242). Affidabile,
   chain pulita; richiede una riga in più.
2. **Marker per-tag identitario**: la factory ritorna un marker con
   `prototype === base.prototype` e `setPrototypeOf(marker, base)`, così la chain
   instanza resta `[X, base, …]` (nessun layer in più) E
   `Object.getPrototypeOf(X) === marker` identifica X univocamente per quel tag, SENZA
   dipendere dall'esposizione globale. Più robusto; tocca il path `super()` del ramo
   `new X()` (oggi l'unico corretto) → da ri-testare con cura per non regredire.
3. **Cattura lazy + re-upgrade**: quando `desc.Class` viene catturato (qualsiasi
   `new X()`), invalidare `__userResolved` e ri-aggiornare i nodi esistenti del tag.
   Non copre i percorsi che girano PRIMA di qualsiasi `new X()`.

> NB: un fix che copra TUTTI i percorsi (markup + factory) deve popolare `desc.Class`
> **presto** (alla definizione), non solo in `Update`. La factory non vede X alla
> valutazione → serve marker (2) o bind esplicito (1).

---

## Bug 2 — Stili sbagliati con `new Rule` / `new Stylesheet`

### Sintomo
Il CSS passato come istanza `new Rule(...)` / `new Stylesheet(...)` non si
renderizza nel playground. Le forme flat / oggetto plain SÌ.

### Cosa è verificato
- `Rule.Text` / `Stylesheet.Text` serializzano correttamente (testato in isolamento):
  `Rule.Text` (Rule.ts:501) = `${selector} { ${serializeDeclarations(props)} }`;
  `Stylesheet.Text` (Stylesheet.ts:568) = `rules.map(r => r.Text).join('\n')`.
- `emitCss` (Core.ts ~1240-1276, chiamato a Define-time, appende
  `<style data-arianna-tag-style="<tag>">` in head) emette CSS corretto per tutte le
  forme (Rule instance → `.Class{…}` globale; Properties/oggetto → `tag,[is=tag]{…}`).
- Lo stamp `class="<nome>"` funziona.
- Le forme flat sopravvivono perché applicano ANCHE inline (`applyInlineStyle`);
  Rule/Stylesheet sono SOLO-`<style>`-globale → spariscono se quel `<style>` manca.

### Sospetto principale (da confermare)
Re-`Define` nel playground non rinfresca la registrazione per-tag (osservato un
**base STALE** su un esempio dopo un run precedente), quindi `emitCss` non ri-emette
il `<style>`. Da separare: framework `Core.Define` vs pollution del runner del
playground (`clearUserDescriptors` non ripulisce tutto, es. `window[ctorName]`).

### Diagnostico aperto (mai eseguito)
Ricaricare il playground e, come PRIMISSIMA cosa, eseguire un esempio con `new Rule`
(senza nient'altro prima): **rende o no?**
- rende → causa = reset/pollution del playground (fix in `clearUserDescriptors`/`run`).
- non rende nemmeno da primo → causa = `Core.Define` non appende il `<style>` per il
  ramo Rule.

---

## Note operative
- Comunicazione: italiano, brace stile Allman, edit chirurgici, opzioni multiple.
- File sorgente in `/mnt/user-data/uploads/` (Core.ts, Component.ts, Core.ts,
  Real.ts, Virtual.ts, Rule.ts, Stylesheet.ts, Jsx.ts, playground.html, …).
- `tsx` a `/home/claude/.npm-global/bin/tsx`; esbuild via
  `/home/claude/.npm-global/lib/node_modules/tsx/node_modules/esbuild/lib/main.js`.
- **Verificare ogni edit in un DOM REALE** (browser/jsdom), non solo Node/tsx, prima
  di consegnare — il fallimento di Opzione A è dovuto proprio a questo gap.

# Architettura di Test — Invarianti di Runtime AriannA v2 (Modello a 4 Livelli)

> Riferimento normativo: [`ARCHITECTURE.md`](ARCHITECTURE.md). Questo documento
> traduce i quattro livelli e gli invarianti in **casi di test eseguibili**. Ogni
> invariante ha un ID (`INV-n`) richiamato dal file `architecture.test.ts`.

---

## 1. Cosa cambia rispetto ai vecchi test

I vecchi test assumevano che **il Component fosse l'elemento** (`this === nodo`,
`appendChild(componentInstance)`, facilities montate sul nodo). Sono **obsoleti**.
Il nuovo contratto è:

```
Core.Create(tag)   →  Element nudo (Livello 0)
new Real / Virtual →  Element + fluent API (Livello 1)
Component          →  super-strato su Real + Virtual, NON è un nodo (Livello 2)
Directives         →  agiscono sulla BASE, indipendenti (Livello 3)
```

Tutti i test che facevano `document.body.appendChild(component)` o
`component.setAttribute(...)` vanno **riscritti** verso `component.Real.append(...)`
e `component.set(...)`.

---

## 2. Output Atteso dal Kernel — Prototype Chains (INV-3, INV-8)

All'esecuzione del motore di introspezione, le catene dei prototipi degli
elementi prodotti **NON devono mai contenere `Component`**. Per il tag dichiarativo
standard `A1a` (registrato su `HTMLElement`):

```text
HH:MM:SS [arianna] ----------------Prototype Chains-------------------
HH:MM:SS [arianna] A1a createElement Chain A1a,HTMLElement,Element,Node,EventTarget,Object
HH:MM:SS [arianna] A1a Class Chain        A1a,HTMLElement,Element,Node,EventTarget,Object
HH:MM:SS [arianna] A1a Create Chain       A1a,HTMLElement,Element,Node,EventTarget,Object
HH:MM:SS [arianna] A1a Real Chain         A1a,HTMLElement,Element,Node,EventTarget,Object
HH:MM:SS [arianna] A1a Virtual Chain      A1a,HTMLElement,Element,Node,EventTarget,Object
HH:MM:SS [arianna] A1a Component.Real     A1a,HTMLElement,Element,Node,EventTarget,Object
```

Le sei catene (createElement, Class, Create, Real, Virtual, Component.Real)
**devono coincidere** ed essere prive di `Component`. La riga `Component.Real`
prova che il super-strato non si infila nella catena dell'elemento.

### Re-estensione (INV-8)

Estendendo un Component già esteso (`B1b extends A1a`), la catena del **Real**
(facet eager) deve essere **ri-splittata subito**:

```text
HH:MM:SS [arianna] B1b Real Chain         B1b,A1a,HTMLElement,Element,Node,EventTarget,Object
```

Il **Virtual** non ri-renderizza: aggiorna il descrittore e produce la catena
corretta solo al `render()` finale.

---

## 3. Invarianti (mappati 1:1 ai test)

| ID | Invariante | Asserzione |
|----|------------|------------|
| **INV-1** | `Core.Create(tag)` ritorna un `Element` nudo, upgraded, senza fluent API né `.Real`/`.Virtual`. | `el instanceof Element` **&&** `typeof el.text !== 'function'` **&&** `!('Real' in el && el.Real instanceof Object && '_real' in el)` |
| **INV-2** | `new Real(x)` / `new Virtual(x)` aggiungono **solo** la fluent API. | `r instanceof Real` **&&** `typeof r.set === 'function'` **&&** `r.render() instanceof Element` |
| **INV-3** | L'elemento prodotto da Real/Virtual ha una catena **priva di `Component`**. | `chain(r.render()).includes('Component') === false` |
| **INV-4** | Un Component **non è un nodo** e **non è appendibile**; espone `.Real` e `.Virtual`. | `!(c instanceof Node)` **&&** `c.Real` **&&** `c.Virtual` **&&** `appendChild(c)` lancia / no-op |
| **INV-5** | Il Component possiede lo stato reattivo e sincronizza i due facet senza alterarne il comportamento. | una `signal` del Component aggiorna sia `c.Real.render()` sia `c.Virtual.render()` |
| **INV-6** | `new Component(createElement('div'))` è visibile solo via `.Real`/`.Virtual`. | dopo `c.Real.append(p)` il `<div>` è in `p`; prima no |
| **INV-7** | Le directive scattano alla **base**, indipendenti dal Component. | `Directive.bootstrap` su `c.Real.render()` reagisce anche senza coinvolgere `c` |
| **INV-8** | Re-estensione: catena del Real ri-splittata subito; Virtual aggiorna soltanto. | `chain(sub.Real.render())[0..1] === [NewSub, OldSub]` |
| **INV-9** | Real e Virtual prendono l'elemento da `Core.Create`. | `Real` e `Virtual.render()` di uno stesso tag producono catene identiche |

---

## 4. Famiglie di entry point (INV-4, INV-6)

| Entry point | Ritorna | Test |
|---|---|---|
| `@Component` / `extends Component` / `new Component` / `new MyClass` | **Component** (no-nodo) | `!(x instanceof Node)`, `x.Real`/`x.Virtual` presenti |
| `document.createElement('arianna-x')` / markup | **nodo** (Real vestito) | `el instanceof Element`, `Component(el)` ritorna un Component |

---

## 5. Esecuzione

```bash
# vitest / jest — adatta al runner del repo (jsdom o happy-dom richiesto)
npx vitest run core/__tests__/architecture.test.ts
```

Il file `architecture.test.ts` allegato copre INV-1…INV-9. I test legacy che
trattano il Component come elemento vanno **eliminati** (vedi §1): cercali con

```bash
grep -rnE "appendChild\\(\\s*(new\\s+)?[A-Za-z0-9_]+\\s*\\)" core/__tests__ \
  | grep -vi "render()\\|\\.Real\\|\\.Virtual\\|document\\.createElement"
```

e convertili al pattern `.Real.append(...)` / `.Virtual.render().append(...)`.

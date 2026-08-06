# AriannA CSS — Catalogo Canonico delle Sintassi (Golem E2E)

> Fonte di verità: 22 file di test E2E del Golem originale + legacy `Css.js` (9271 righe).
> Ogni formato di dichiarazione di una Rule/Sheet è documentato qui con l'esempio esatto.
> **Questi formati sono DATI PER SCONTATI**: le statiche (GetSelector/GetType/GetContents/
> GetObject/GetText) e il costruttore DEVONO riconoscerli tutti.

---

## PARTE 1 — I formati di costruzione di una Rule

### 1.1 Posizionale: `new Css(selettore, propsObject)`
```js
new Css(".Box-Text", boxTextRule)        // selettore stringa + oggetto proprietà PIATTO
new Css(".Element-Style", elementRule)
new Css(".Text", textRule)
```
`boxTextRule` è un oggetto PIATTO di sole proprietà (PascalCase): `{ Color, FontFamily, FontSize, ... }`.
→ Il selettore arriva SEPARATO, le props sono l'oggetto. Questo è il caso "solo content + selettore".

### 1.2 Oggetto con `Selector` + body (`Rule` / `Contents` / `Content` / `Body`)
```js
// body come "Rule" (Golem-Css.html, Style.html, Media.html):
new Css({ Selector: ".Box-Style", Rule: { Width, Height, Margin, Padding, ... } })

// body come "Contents" (CounterStyle.html, FontFace.html, Page.html, Viewport.html):
new Css({ Selector: {Type:"@counter-style", Name:"..."}, Contents: { System, Symbols, ... } })
```
**I 4 nomi del body sono intercambiabili**: `Contents ?? Content ?? Body ?? Rule` (fallback a cascata).
Golem usa `Rule` per gli style rule, `Contents` per gli @-rule — ma entrambi funzionano ovunque.

### 1.3 Da CSSRule nativa
```js
new Css(cssRule)    // regex su cssText → selettore + proprietà
```

### 1.4 Flat property map (SOLO proprietà, nessun selettore)
```js
{ Display:'block', Background:'…', Color:'white' }   // valori tutti PRIMITIVI
```
→ Riconosciuto quando OGNI valore è primitivo (string/number, mai oggetto).
→ Va wrappato con un selettore (`:host` di default, o quello passato separatamente).

### 1.5 Selector→properties map (mappa selettore→props)
```js
{ '.btn': {props}, '.card': {props}, '@media screen': { '.btn': {props} } }
```
→ Le CHIAVI sono selettori, i VALORI sono oggetti di proprietà (o nested).
→ Discriminante: il valore è un oggetto e NON contiene `Selector`.

---

## PARTE 2 — Le @-rules (Selector oggetto con `Type`)

Il Selector oggetto ha SEMPRE `Type` (il keyword @-rule) + campi specifici.

### 2.1 `@charset` (Golem-Css-Charset.html)
```js
{ Selector: { Type: "@charset", Value: "uTf-8" } }
```
→ serializza: `@charset "utf-8"` (Value normalizzato, quote strip)

### 2.2 `@namespace` (Golem-Css-Namespace.html)
```js
{ Selector: { Type: "@namespace", Prefix: "svg|a", Url: 'url("http://www.w3.org/2000/svg")' } }
```
→ `@namespace svg|a url("...")`

### 2.3 `@import` (Golem-Css-Import.html) — CON condizioni And/Or annidate + Rules
```js
{ Selector: { Type: "@import", Url: "...", Media: "screen",
              And: { MinHeight:"500px", Or: { MinWidth:"500px", And: { MaxWidth:"700px" } } } },
  Rules: { MediaRule: {...@media annidato...}, BoxRule: {...}, BoxTextRule: {...} } }
```
→ Il caso PIÙ complesso: And/Or/And ricorsivi + Rules dentro Rules.

### 2.4 `@media` (Golem-Css-Media.html)
```js
{ Selector: { Type: "@media", Media: "screen",
              And: { MinHeight:"600px", Or: { MinWidth:"600px", And: { MaxWidth:"800px" } } } },
  Rules: { ElementRule: {Selector:".Element-Style", Rule:{...}}, BoxRule:{...}, BoxTextContentRule:{...} } }
```

### 2.5 `@supports` (Golem-Css-Supports.html) — condizioni DIRETTE sul Selector
```js
{ Selector: { Type: "@supports",
              MinHeight:"600px", Or:{ MinWidth:"600px", And:{ MaxHeight:"200px" } } },
  Rules: { ... } }
```
→ NOTA: qui le condizioni (MinHeight/Or/And) sono DIRETTAMENTE nel Selector, non dentro un campo `And`.
→ buildMediaCondition prende ogni chiave tranne `Type`.

### 2.6 `@document` (Golem-Css-Document.html)
```js
{ Selector: { Type:"@document", Url:"...", Prefix:"...", Domain:"...", Regex:"..." },
  Rules: { ElementRule:{...}, BoxRule:{...}, BoxTextRule:{...} } }
```
→ `@document url("..."), url-prefix("..."), domain("..."), regexp("...")`

### 2.7 `@page` (Golem-Css-Page.html) — CON margin-boxes
```js
{ Selector: { Type:"@page", Name:"Page-Rule, Criceto", Right:true },
  Contents: { FontSize:"20px", Margin:"auto",
              TopLeftCorner: {...}, TopLeft: {...} } }   // margin-box pseudo-elements
```
→ `@page Name :right { ...props; @top-left-corner {...}; @top-left {...} }`
→ Le chiavi margin-box (TopLeftCorner→@top-left-corner) vanno distinte dalle props normali.

### 2.8 `@keyframes` (Golem-Css-Keyframes.html)
```js
{ Selector: { Type:"@keyframes", Name:"spin" },
  Contents: { From:{...}, To:{...}, "50%":{ Position:"50%", Style:{...} } } }
```
→ Frames: `from`/`to` diretti, o `{ Position, Style }` per percentuali.

### 2.9 `@counter-style` (Golem-Css-CounterStyle.html)
```js
{ Selector: { Type:"@counter-style", Name:"GolemCounterStyleExampleName" },
  Contents: { System, Symbols, AdditiveSymbols, Negative, Prefix, Suffix, Range, Pad, SpeakAs, Fallback } }
```

### 2.10 `@font-face` (Golem-Css-FontFace.html)
```js
{ Selector: { Type:"@font-face" },   // solo Type
  Contents: { FontFamily, Source, FontWeight, FontDisplay, FontStretch, FontStyle,
              FontVariationSettings, UnicodeRange, FontVariant, FontFeatureSettings } }
```

### 2.11 `@viewport` (Golem-Css-Viewport.html)
```js
{ Selector: { Type:"@viewport" },
  Contents: { Width:"300px", MinWidth:"100px", MaxWidth:"600px", Zoom, Orientation, ... } }
```

---

## PARTE 3 — Le API statiche (testate in OGNI file @-rule)

```js
Css.GetSelector(rule)    // → selettore serializzato   es. "@media screen and (min-height:600px)"
Css.GetType(rule)        // → keyword @-rule            es. "@media"
Css.GetContents(rule)    // → oggetto contents
Css.GetObject(css.Text)  // → CSS text RI-PARSATO a oggetto { '.sel': {props} }
Css.GetText(rule)        // → CSS text completo serializzato
```
Legacy (Css.js): `GetSelector`/`GetContents`/`GetType`/`GetText`/`GetObject` accettano sia
il def-oggetto sia il testo. Vedi Css.js righe 902-904, 1027-1070.

### Accesso runtime (istanza)
```js
css.Type                       // tipo @-rule dell'istanza
css.Text                       // CSS text
element.Css.Background = "..."  // SET proprietà live sul nodo
element.Css.FontSize           // GET proprietà
```

---

## PARTE 4 — Stylesheet (Sheet)

### 4.1 Costruzione + Add (Golem-Css-Sheet.html)
```js
var css1  = new Css(rule1);
var sheet = new SheetES5();
sheet.Add(css1, css2);       // variadico
sheet2.Add(css1, css3);
```

### 4.2 Navigation Sheet (Golem-Navigation-Css-Sheet.html) — il più grande (340 righe)
→ Sistema completo di gestione fogli con navigazione.

---

## PARTE 5 — Preprocessori (tutti via `SheetES5.Less`)

Sass / Scss / Stylus / Parser / Less — TUTTI passano per lo stesso parser:
```js
var sheet = SheetES5.Less(textArea.Text);   // indented/Less/Sass/Scss/Stylus → CSS string
```
(Golem-Css-Sass/Scss/Stylus/Parser/Less.html — stessa API `SheetES5.Less`, input diversi.)
Supporta: nesting indentato, variabili (@var/$var: val, $var = val), sostituzione, commenti //.

---

## PARTE 6 — State / Bind

### 6.1 `new State(...)` (dal costruttore + Golem-Css-State.html)
```js
new State(
  buttonEl,                              // 1. elemento
  "MouseDown",                           // 2. evento DOM
  existingCssRule,                       // 3. base rule
  { Background:"yellow", animation:"Boh 2s" },  // 4. state props
  (event) => console.log("clicked"),     // 5. action (opzionale)
  "@Keyframes Boh",                      // 6. keyframe selector (opzionale)
  { From:{Background:"yellow"}, To:{Background:"red"} }  // 7. keyframe contents (opzionale)
)
```

### 6.2 `Css.Bind(...)` (legacy Css.js:6663) — firma `(Name, CssInstances, Ways)`
```js
Css.Bind(element, [cssKeyframesLink, cssSheetLink], exampleBox, golemText, [cssStyleLink, cssMediaLink], 2)
```
→ Sistema di binding navigazione (element + array di istanze + ways).

---

## DISCRIMINAZIONE — come capire quale formato (da #parseObject, Css.ts:1517-1535)

1. Valori TUTTI primitivi           → **Flat property map** (1.4) → wrappa con selettore
2. Ha Selector/Contents/Content/Rule/Body → **RuleDefinition** (1.2)
3. Valori sono oggetti senza Selector    → **Selector→props map** (1.5)

Per il Selector:
- stringa           → usato diretto
- oggetto con Type  → buildSelector (gestisce ogni @-rule di PARTE 2)

Per il body (@-rule specifico):
- @keyframes → frames (buildKeyframesText)
- @page      → margin-boxes (buildPageText)
- altro      → proprietà (normaliseProps)
- And/Or/Not → ricorsivo (buildMediaCondition) — @media/@supports/@import

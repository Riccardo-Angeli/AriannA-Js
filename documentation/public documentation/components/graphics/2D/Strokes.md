# Strokes

Sorgente: `components/graphics/2D/Strokes.ts`  
Documentazione: `documentation/components/graphics/2D/Strokes.md`

Pannello indipendente per il tratto: colore, spessore, unità, estremità, giunzioni, allineamento, tratteggio, terminatori e profili di larghezza. Mantiene i temi AriannA Dark e Light e non crea né possiede un Canvas2D o un LineEditor.

## Installazione

Sostituire il file nella posizione indicata. Il file conserva l'export default e il namespace `Strokes`: non è necessario rinominare gli export esistenti dell'index 2D.

```ts
import Strokes from './components/graphics/2D/Strokes.ts';
import type { WidthProfile, ArrowheadDefinition, PresetLibrary } from './components/graphics/2D/Strokes.ts';

const panel = new Strokes({ theme: 'dark', color: '#e40c88', width: 12, unit: 'px' });
stage.append(panel);
panel.bind(svgPath); // un SVGGeometryElement già inserito in un <svg>
```

Il tratto SVG viene aggiornato immediatamente. Le modifiche successive agli attributi geometrici del target sono osservate e raggruppate in un aggiornamento per animation frame. `panel.Refresh()` forza l'aggiornamento.

## Markup

```html
<arianna-strokes id="strokePanel" theme="light" color="#e40c88"
  width="12" unit="px" cap="round" join="round"
  profile="width-1" arrow-start="none" arrow-end="arrow-8"
  arrow-scale-end="100" arrow-align="tip">
</arianna-strokes>
```

```ts
const panel = stage.querySelector('#strokePanel') as Strokes;
panel.bind(svgPath);
```

I preset incorporati sono disponibili anche da markup. Per un ID custom, registrare prima la definizione e poi impostare la proprietà `stroke` o l'attributo corrispondente. Per caricare una libreria intera usare `presets` nel costruttore o come proprietà del componente.

## Controlli del tratto

| Proprietà JS | Attributo | Valori / significato |
| --- | --- | --- |
| `color` | `color` | Colore CSS |
| `width` | `width` | Spessore, 0.01–1000 |
| `unit` | `unit` | `px`, `pt`, `mm`; conversione a pixel a 96 dpi |
| `cap` | `cap` | `butt`, `round`, `square` |
| `join` | `join` | `miter`, `round`, `bevel` |
| `miterLimit` | `miter-limit` | Limite delle giunzioni miter |
| `align` | `align` | `center`, `inside`, `outside`; interno/esterno solo per figure chiuse |
| `dash` | `dash` | Array di massimo 6 lunghezze; markup `"12 6"` |
| `dashOffset` | `dash-offset` | Offset del tratteggio nell'unità scelta |
| `dashFit` | `dash-fit` | `exact` o `corners` |
| `profile` | `profile` | ID del profilo |
| `flipAlong` | `flip-along` | Inverte il profilo lungo il percorso |
| `flipAcross` | `flip-across` | Scambia i due lati del profilo |
| `arrowStart`, `arrowEnd` | `arrow-start`, `arrow-end` | ID dei terminatori |
| `arrowScaleStart`, `arrowScaleEnd` | `arrow-scale-start`, `arrow-scale-end` | Percentuale, 1–1000 |
| `arrowAlign` | `arrow-align` | `tip`: punta sull'estremo; `extend`: base sull'estremo |
| `linkScales` | `link-scales` | Collega le modifiche delle scale effettuate dal pannello |

Le proprietà del tratto si impostano tramite `setStroke({...})` oppure assegnando `panel.stroke = {...}`. Le tabelle indicano i campi dell'oggetto `stroke`, non proprietà dirette come `panel.width`.

```ts
panel.setStroke({ profile: 'width-6', flipAcross: true, arrowEnd: 'arrow-26' });
const snapshot = panel.stroke; // copia indipendente
panel.stroke = { cap: 'round', dash: [12, 6], dashOffset: 2 };
```

La scala collegata è un comportamento del pannello: chiamando `setStroke` da codice è possibile impostare esplicitamente entrambe le scale. Il bottone Swap scambia terminatori e relative scale.

## Profili precaricati

Uniforme più i sei profili rappresentati nelle schermate, con due ID legacy conservati.

| ID | Forma |
| --- | --- |
| `uniform` | Larghezza costante, simmetrica |
| `width-1` | Fusiforme, estremi sottili |
| `width-2` | Doppio lobo con restringimento centrale |
| `width-3` | Plateau, estremi rastremati |
| `width-4` | Cuneo, largo all'inizio e sottile alla fine |
| `width-5` | Goccia, massimo spostato verso la fine |
| `width-6` | Arco su un solo lato, baseline piatta |
| `taper-start` | Legacy: sottile all'inizio, largo alla fine |
| `taper-end` | Legacy: largo all'inizio, sottile alla fine |

I menu mostrano anteprime SVG reali. `Profiles` restituisce tutte le definizioni, incluse quelle custom, come copie difensive.

## Terminatori precaricati

`none`, 39 terminatori numerati e quattro ID legacy (`arrow`, `open-arrow`, `circle`, `square`). I numeri sono ID AriannA: non costituiscono una garanzia di corrispondenza con la numerazione di ogni versione di Illustrator. Sono geometrie vettoriali native, non risorse `.ai` Adobe.

| ID | Famiglia |
| --- | --- |
| `arrow-1`–`arrow-5` | Frecce concave e sagomate |
| `arrow-6`–`arrow-8` | Frecce triangolari |
| `arrow-9`–`arrow-12` | Frecce aperte e doppie |
| `arrow-13`–`arrow-20` | Frecce incavate, mezze frecce e composte |
| `arrow-21` | Disco |
| `arrow-22` | Anello |
| `arrow-23` | Anello con punto |
| `arrow-24`, `arrow-25` | Quadrato pieno / aperto |
| `arrow-26`, `arrow-27` | Rombo pieno / aperto |
| `arrow-28`–`arrow-30` | Una, due, tre barre |
| `arrow-31`, `arrow-32` | Croce e plus |
| `arrow-33`, `arrow-34` | Stella ed esagono |
| `arrow-35` | Cerchio e barra |
| `arrow-36` | Tre punte |
| `arrow-37` | Coda piumata |
| `arrow-38` | Semicerchio |
| `arrow-39` | Gancio |

`Arrowheads` restituisce le definizioni complete come copie difensive. Entrambi i menu mostrano la forma nell'orientamento del rispettivo estremo. Le ancore `tip` e `base` evitano di usare lo stesso punto di allineamento per frecce, dischi e barre.

## Aggiungere un profilo custom

`t` è la posizione normalizzata lungo il percorso. `left` e `right` sono moltiplicatori dello spessore totale sui due lati della linea centrale: `{left: .5, right: .5}` significa larghezza totale 1×.

```ts
panel.RegisterProfile({
  id: 'my-bulge', label: 'Rigonfiamento', interpolation: 'smooth',
  points: [
    { t: 0,   left: .1, right: .1 },
    { t: .35, left: .8, right: .2 },
    { t: .7,  left: .2, right: .8 },
    { t: 1,   left: .1, right: .1 }
  ]
}).setStroke({ profile: 'my-bulge' });
```

Il profilo appare subito nel menu e usa lo stesso renderer dei profili incorporati. È possibile usare `interpolation: 'linear'` oppure `'smooth'` (smoothstep fra campioni, non una spline Bézier globale).

Vincoli: 2–256 punti, `t` strettamente crescente da 0 a 1 inclusi, lati finiti fra 0 e 16. Per campionare da un renderer esterno: `StrokesNamespace.SampleProfile(definition, t)`, importando `{ Strokes as StrokesNamespace }` dal file.

## Aggiungere un terminatore custom

Le geometrie sono orientate verso +X. Le coordinate di `tip` e `base` sono espresse nel sistema del `viewBox`.

```ts
panel.RegisterArrowhead({
  id: 'my-diamond', label: 'Rombo custom',
  viewBox: [0, 0, 10, 10], tip: [10, 5], base: [0, 5],
  shapes: [{
    tag: 'path', attributes: { d: 'M0 5 L5 0 L10 5 L5 10 Z' },
    fill: 'stroke', stroke: 'none'
  }]
}).setStroke({ arrowStart: 'my-diamond', arrowEnd: 'arrow-8' });
```

Primitive ammesse: `path`, `circle`, `ellipse`, `rect`, `polygon`, `polyline`. Gli attributi ammessi sono soltanto quelli geometrici della rispettiva primitiva: `d`, `points`, coordinate e dimensioni. `fill` e `stroke` valgono `'stroke'` (colore del tratto corrente) oppure `'none'`; `strokeWidth` è espresso nelle coordinate locali del marker. Per una forma aperta indicare `fill: 'none', stroke: 'stroke'`.

Massimo 64 primitive per terminatore. Non sono supportati markup SVG arbitrario, URL esterni, script, eventi o import di file Illustrator `.ai`.

## Registro e persistenza

I preset custom appartengono alla singola istanza. Gli ID incorporati non possono essere sovrascritti né rimossi. Usare ID alfanumerici con eventuali `-`, `_`, `.`, `:`; massimo 128 caratteri. Massimo 128 profili custom e 128 terminatori custom per istanza.

```ts
panel.RegisterProfile(updatedDefinition, true); // sostituisce un ID custom esistente
panel.RegisterArrowhead(updatedArrow, true);
panel.RemoveProfile('my-bulge');
panel.RemoveArrowhead('my-diamond');

const library = panel.ExportPresets(); // solo custom, version: 1
localStorage.setItem('arianna-strokes', JSON.stringify(library));
const restored = new Strokes({ presets: JSON.parse(localStorage.getItem('arianna-strokes')!) });
stage.append(restored);
restored.bind(svgPath);
restored.setStroke({ profile: 'my-bulge' }); // scegliere un ID presente nella libreria salvata
```

Le righe Remove sono esempi alternativi: non eseguirle prima del salvataggio se si vuole ripristinare quegli stessi ID.

`ImportPresets(libraryOrJson)` valida l'intera libreria prima di sostituire il registro custom; in caso di errore mantiene quello precedente. Non fonde le librerie. `ResetPresets()` elimina soltanto i custom. Se un preset selezionato viene rimosso, il tratto torna a `uniform` o il terminatore a `none`.

`ExportPresets()` non contiene lo stile selezionato. Salvare separatamente `panel.stroke` se serve ripristinare anche lo stile, e applicarlo dopo l'import dei preset.

## Eventi

| Evento | Detail |
| --- | --- |
| `arianna:stroke-change` | Campi dello stile, `pixelWidth`, `source` |
| `arianna:change` | Stesso payload, compatibilità |
| `arianna:stroke-presets-change` | Libreria custom `{ version, profiles, arrowheads }` |

```ts
panel.addEventListener('arianna:stroke-change', event => {
  const style = (event as CustomEvent).detail;
  console.log(style.profile, style.arrowEnd);
});
```

## Integrazione con renderer esterni

`bind(svgGeometry)` applica direttamente profili e terminatori, creando ribbon SVG e marker. Su un target che espone una proprietà `stroke` il pannello trasmette invece lo stile, lo spessore in pixel e le definizioni `profileDefinition`, `arrowStartDefinition`, `arrowEndDefinition`. Il renderer del target deve interpretare queste definizioni per disegnarle: questo aggiornamento di Strokes non modifica automaticamente il renderer di LineEditor o Canvas2D.

Non incorporare il pannello nel behaviour di disegno. Collegarlo nell'applicazione o nell'esempio, mantenendo indipendenti Canvas2D, Tools2D e LineEditor.

## Lifecycle e verifiche

`unbind()` scollega il target, rimuove geometrie ausiliarie e marker, cancella gli aggiornamenti pendenti e ripristina lo stile precedente. Lo scollegamento del pannello esegue la stessa pulizia. Registri e stile restano nella singola istanza; dopo un remount collegare nuovamente il target.

I menu supportano tastiera (frecce, Home, End, Escape), selezione, click esterno e chiusura allo scroll esterno o resize. Le anteprime sono SVG, non immagini caricate dalla rete.

Verifica automatica eseguita: TypeScript strict, bundle con il Core AriannA disponibile, tutti i profili e terminatori sul renderer SVG, custom, import atomico, flip, ancore, menu e disposal in una fixture DOM. La verifica visuale nel browser reale resta da eseguire sul playground locale.

Il ribbon variabile è campionato e ha un budget geometrico limitato per evitare esplosioni di punti su tratteggi fitti. Non è un motore CAD per offset esatti: cuspidi, auto-intersezioni e tracciati con più sottopercorsi richiedono verifica visuale. L'allineamento interno/esterno è destinato a geometrie chiuse; il trattamento dei cap/join sui ribbon campionati non promette equivalenza geometrica esatta con Illustrator.

Per controllare manualmente il catalogo: collegare una curva SVG aperta, scorrere entrambi i menu, provare i sei profili, i flip, scale indipendenti/collegate, Swap e ancore. Ripetere su una figura chiusa per allineamento, su un percorso angolare per dash-fit e in entrambi i temi.

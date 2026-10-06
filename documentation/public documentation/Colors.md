# AriannA — Color Studio

## Installazione

Copia `components/graphics/colors/` nella stessa cartella del progetto, conservando tutti i file interni del pacchetto. Sostituisci `devtools/playground/playground.html` e ricompila il bundle Components. Gli index superiori non cambiano: sono conservati i nomi pubblici e i tag originali. Nessuna dipendenza esterna.

Questo intervento riguarda i 17 controlli in `graphics/colors`. Il semplice input `components/inputs/ColorPicker.ts` rimane separato. Nel Playground sono aggiornati soltanto i 17 esempi della suite; gli altri esempi restano quelli della baseline ricevuta.

## Stile

Dark: corpo `#202428`, campi `#171b1f`, header `#383d42 → #292d31`, testo `#e9ecf0`. Light: corpo `#f1f2f5`, campi bianchi, header bianco → `#e1e4e9`, testo `#252a33`. Selezione attiva rosa in gradiente. Nessun verde decorativo: il verde rimane naturalmente nelle superfici di selezione e nelle palette cromatiche.

Larghezza iniziale 340 px, `max-width:100%`, padding 12 px, campi e tastiera identici nei due temi. Gli esempi Dark e Light sono in verticale. I piccoli picker della galleria si affiancano soltanto quando lo spazio disponibile lo consente.

Variabili personalizzabili: `--cp-bg`, `--cp-field`, `--cp-border`, `--cp-text`, `--cp-muted`, `--cp-head`. Gli stili passano attraverso `Css.Stylesheet`; il componente monta una copia locale solo quando viene inserito dentro una ShadowRoot esterna.

## Superfici e spazi colore

I dieci picker specializzati conservano lo spazio iniziale del proprio nome. Il menu permette di passare a RGB, HSL, HSV/HSB, OKHSL, OKHSV, CMYK, XYZ, CIELAB, CIELUV, CIEUVW, OKLab e OKLCH. HEX con alpha ha un campo dedicato. Il pannello espandibile mostra tutte le conversioni e le forme CSS contemporaneamente.

| `geometry` | Funzione |
|---|---|
| `ring` | Anello hue + disco interno saturazione/valore HSV, con mappatura continua quadrato/disco |
| `wheel` | Disco hue/saturazione; HSL/OKHSL usano la propria luminosità, gli altri HSV |
| `square` | Quadrato HSV saturazione/valore, hue dai canali |
| `spectrum` | Rettangolo hue orizzontale, bianco → colore → nero verticale |
| `plane` | Due canali dello spazio selezionato; gli altri rimangono regolabili |
| `swatches` | Palette quadrata |
| `dots` | Palette circolare |

La scelta della superficie non elimina i campi dello spazio selezionato. I canali numerici sono la via precisa per valori non direttamente rappresentati dalla superficie. Le conversioni riutilizzano `additionals/Colors.ts`: questo pacchetto non introduce gestione ICC, gamut estesi o conversioni di stampa calibrate.

```ts
import HSVColorPicker from './components/graphics/colors/HSVColorPicker.ts';

const picker = new HSVColorPicker();
picker.setAttribute('theme', 'dark');
picker.geometry = 'ring';
picker.setColor('#CB68DBCC');
stage.appendChild(picker);

picker.space = 'lab';
picker.setSpaceValues({ L: 65 });
picker.setAlpha(0.8);
picker.palette = ['#CB68DB', '#608CE8', '#F2AD73', '#FFFFFF'];

picker.addEventListener('arianna:change', event => {
    const { value, color, space, spaceValues, conversions } =
        (event as CustomEvent).detail;
    // value: #RRGGBBAA; color: { r, g, b, a }.
});
```

```html
<arianna-hsl-color-picker
    theme="light" geometry="wheel" value="#CB68DBCC">
</arianna-hsl-color-picker>
```

`ColorPickerSquare`, `ColorPickerWheel` e `ColorPickerTile` conservano `setColor()` e `getColor()` con valore HEX stringa. Il Tile conserva anche `palette`, `value` e `getRecent()`. Le classi specializzate espongono `getColor()` come RGB con alpha, come prima.

Il pulsante `+` salva il colore corrente nella palette della singola istanza. Le modifiche non alterano altre istanze.

## GraphicsColorPicker composto

Mantiene l'API preesistente: `value`, `Color`, `getColor()`, `setColor(...)` e le utility esportate `parseHexRgba`, `rgbToHex`, `rgbToHsl`, `hslToRgb`.

```ts
import GraphicsColorPicker from './components/graphics/colors/GraphicsColorPicker.ts';
const studio = new GraphicsColorPicker();
stage.appendChild(studio);
studio.setColor({ hex:'#A475DF', alpha:0.75 });
studio.mode = 'radial'; // solid | linear | radial | shape
```

`Solid` e `Gradient` danno accesso ai controlli interni dopo il montaggio; `Gradient` viene creato soltanto al primo ingresso in una tab gradiente. Il valore solido è conservato quando si cambia tab. Gli eventi delle tab gradiente contengono `type` e `css`; non sostituiscono `Color`, che resta il colore solido.

## Gradienti

Tutti e tre i componenti hanno tab Linear / Radial / Shape. Il nome del componente determina soltanto la tab iniziale. Linear e Radial condividono gli stop nello stesso editor, ma conservano separatamente angolo e centro/forma/estensione. Shape conserva una propria lista di punti.

- Doppio click su uno stop della rampa, sulla linea o su un punto Shape: apre un picker contestuale, con alpha e tutti gli spazi colore. Enter offre lo stesso comando da tastiera. Il pulsante Done, Escape o il click esterno chiudono il popup.
- Click sulla rampa: aggiunge uno stop.
- Trascinamento: sposta lo stop, anche oltre gli altri; rimane selezionato lo stesso stop.
- Frecce: spostamento fine; Shift + frecce sugli stop: passo maggiore.
- Delete/Backspace sugli stop oppure pulsante Delete: elimina lo stop selezionato. Restano almeno due stop.
- Anteprima Linear: trascina gli estremi della linea per orientare e delimitare il gradiente. Trascina il filo per traslare entrambi gli estremi. Doppio click sul filo aggiunge uno stop; gli stop intermedi scorrono lungo la linea. Il campo angolo e sei piccoli preset completano il controllo.
- Anteprima Radial: trascina per spostare il centro. Sono disponibili cerchio/ellisse, quattro modalità di estensione e sei preset per la direzione/origine.
- Shape: doppio click sullo sfondo aggiunge un punto, drag lo sposta; colore, alpha, posizione e raggio si modificano dai campi. Rimane almeno un punto.
- Interpolazione Linear/Radial: sRGB, OKLab, OKLCH, HSL mediante CSS del browser.

```ts
import LinearGradientEditor from './components/graphics/colors/LinearGradientEditor.ts';
const editor = new LinearGradientEditor();
editor.setStops([
    { t:0, color:{ r:220, g:68, b:147, a:1 } },
    { t:1, color:{ r:97, g:112, b:224, a:1 } }
]);
editor.setAngle(125);
stage.appendChild(editor);
editor.addEventListener('arianna:change', event => {
    preview.style.background = (event as CustomEvent).detail.css;
});
```

API mantenute: `stops`, `getStops/setStops`, `getAngle/setAngle`, `getInterp/setInterp`, `getShape/setShape`, `getSize/setSize`, `getCenter/setCenter`, `toCSS`; per Shape `points`, `getPoints/setPoints`, `addPoint`, `removePoint`, `updatePoint`, `toCanvasDataURL`.

Shape è un gradiente morbido composto da aree radiali sovrapposte, non un editor di mesh Bézier. L'esportazione canvas mantiene la rasterizzazione dell'editor; la stringa CSS è una rappresentazione mediante gradienti radiali, non una promessa di identità pixel-per-pixel a ogni rapporto d'aspetto. I metodi restituiscono copie dei dati per evitare mutazioni esterne accidentali.

## Interazione e prestazioni

I canvas, i campi e gli handle non vengono ricreati durante il trascinamento. Gli indicatori e il modello si aggiornano subito; rasterizzazione e `arianna:change` vengono accorpati a un solo frame. Gli stop vengono ordinati senza clonare l'oggetto trascinato. Il campione finale di `pointerup` viene applicato.

Il canvas di destinazione segue dimensione CSS e devicePixelRatio (massimo 3×, lato massimo 1024). I bordi circolari sono ritagliati alla risoluzione di destinazione. Le superfici interne vengono campionate a 192 × 192 e interpolate; l’anello usa maschere alpha riutilizzabili alla risoluzione di destinazione, senza ricalcolo dei pixel durante il trascinamento della hue. Viene rigenerata soltanto se cambiano forma o canali fissi della superficie; trascinare saturazione/valore a hue costante non rigenera il quadrato. Le conversioni testuali vengono ricostruite solo con il pannello aperto. Alla disconnessione si rimuovono i listener temporanei e si cancella il frame pendente.

Gli eventi sono ora accorpati per frame: per leggere immediatamente il risultato di un setter si usa il getter; un ascoltatore riceve l'ultimo stato nel frame successivo.

## Verifica effettuata

- TypeScript strict su tutta la baseline del progetto e bundle Components.
- Sintassi di tutti gli script inline del Playground.
- Test in DOM simulato sui sorgenti effettivi: 12 spazi × 7 superfici, stabilità DOM su 100 movimenti consecutivi, un solo frame pendente, cache del raster SV, campione finale, cleanup, stop che si incrociano, drag Shape, clone dei dati, tab, alpha e costruttori esportati.

Non è stata eseguita una sessione visuale su Safari/Chrome reale. Prima di considerare chiusa la rifinitura grafica, verificare i 17 esempi nel browser: mouse e touch, drag fuori dal pannello e rilascio, stop incrociati, cambio tema, cambio esempio durante il drag, pannello stretto e zoom pagina. La compilazione e il DOM simulato non sostituiscono questa verifica visiva.


## Rifinitura visuale — consegna Smooth

- `ColorPickerWheel` parte con anello esterno e selettore interno circolare, seguendo il riferimento fornito.
- Gli swatch usano larghezza e altezza identiche, aggiornate al resize; le regole neutralizzano le altezze minime dei bottoni ereditate.
- Indicatori e handle hanno bordo bianco, senza contorno nero.
- La linea del gradiente è parte del componente. `getLine()` restituisce una copia; `setLine({start:{x,y},end:{x,y}})` usa coordinate normalizzate 0–1. L’export CSS riflette posizione e lunghezza effettive della linea.
- I popup sono locali all’istanza. Usano il top layer Popover quando disponibile; il fallback mantiene chiusura esterna/Escape e cleanup alla disconnessione.
- In aggiunta ai test precedenti: inversione della mappatura disco/quadrato, sei preset, linea parametrica, popup e modifica colore/alpha, chiusura del popup e riuso delle maschere durante il cambio hue.
- La verifica resta statica e in DOM simulato: la resa visiva su Safari/Chrome reale non è stata verificata in questo ambiente.

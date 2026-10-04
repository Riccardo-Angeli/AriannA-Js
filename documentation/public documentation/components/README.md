# Documentazione dei componenti AriannA

Questa struttura rispecchia le cartelle di `components` nello snapshot fornito del 2 ottobre 2026. È una struttura di documentazione, non una sostituzione del repository né un pacchetto di sorgenti vecchi.

Per ogni sorgente pubblico `components/<categoria>/<Componente>.ts`, usare `documentation/components/<categoria>/<Componente>.md`. Gli `index.ts` sono barrel di export e non hanno una scheda componente separata. Le directory ausiliarie presenti nello snapshot sono mantenute, inclusa `animations`, che contiene KeyframeEditor.

- [Indice completo](INDEX.md)
- [Modello di scheda](Template.md)
- [Guida Strokes](graphics/2D/Strokes.md)

Solo la guida Strokes è compilata in questo archivio. Le altre schede sono dichiaratamente da documentare: la loro presenza non implica una verifica delle API o dei componenti.

## Convenzioni

Documentare l'API reale e la versione verificata. Non inventare proprietà partendo dal nome del file. Distinguere chiaramente API pubblica, dettagli interni e responsabilità dell'applicazione.

Ogni scheda deve includere scopo, import, markup, istanziazione, proprietà e valori di default, metodi, eventi, temi, composizione con altri componenti, lifecycle/disposal e limiti. Per un behaviour spiegare il target a cui si applica: non incorporare altri componenti solo per riprodurre un esempio.

Gli esempi devono rendere visibile il risultato ed essere montati nello stage. Per Real e Virtual rispettare l'ordine `.append(stage).render()`. Riportare soltanto i percorsi di creazione effettivamente supportati dal componente e dal Core verificato.

Le fixture degli esempi devono restare separate dalle implementazioni. Conservare le convenzioni AriannA Dark/Light, gradient pink per gli stati attivi e le proporzioni adottate nel playground. Documentare accessibilità, tastiera e pointer quando pertinenti.

## Manutenzione

Aggiornare questa struttura quando vengono aggiunti, rimossi o rinominati i sorgenti. Quando si completa una scheda, sostituire la dicitura “Da documentare” con la versione/commit esaminata e le verifiche realmente eseguite.

Non pubblicare le schede incomplete come documentazione di API definitive. Non sono incluse schede Payments o Shipments, rimossi dal perimetro della libreria.

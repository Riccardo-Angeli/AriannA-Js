# DCOM — serie ZIP e superficie 3D

## Playground

Aprire 3D → Formats → Dcom. Il pulsante Load… accetta un DICOM singolo oppure uno ZIP. Nel secondo caso estrae la serie, ricostruisce il volume e sostituisce il cubo con una superficie 3D. Durante il lavoro Load diventa Cancel. Il pannello consente di scegliere la serie, la soglia di intensità e il passo di campionamento. Auto aumenta il passo se supera il budget di 12.000 triangoli. La serie più numerosa è selezionata inizialmente; le altre sono selezionabili. La dimensione fisica viene mantenuta nelle proporzioni, poi normalizzata soltanto per inquadrare la scena.

Il volume completo resta nei dati: il campionamento riduce soltanto la superficie di anteprima. La modalità implementata è estrazione di isosuperficie (marching tetrahedra), NON ray casting volumetrico e NON segmentazione anatomica. Una soglia MR non identifica automaticamente tessuti o lesioni. Il file singolo mantiene l'anteprima 2D.

## API

```ts
const abort = new AbortController();
const volume = await Three.DCOM.loadSeries(zipFile, {
  signal: abort.signal,
  onProgress: fraction => console.log(fraction),
  // seriesUID: '...'
});
const mesh = await Three.DCOM.surface(volume, {
  threshold: volume.windowCenter,
  step: 8,
  maxTriangles: 12000,
  signal: abort.signal
});
// mesh.positions, mesh.normals e mesh.indices: buffer triangolati in millimetri.
// volume.pixels: Float32Array con rescale slope/intercept applicati.
```

Sono accettati anche ArrayBuffer ZIP e array di ArrayBuffer DICOM. Le coordinate usano ImagePositionPatient, ImageOrientationPatient e PixelSpacing; l'ordine dei nomi nello ZIP non influisce. I duplicati, le sezioni mancanti/irregolari, le geometrie miste e lo shear sono rifiutati esplicitamente: richiederebbero resampling.

Decompressione, decodifica e meshing avvengono in Web Worker. Abort/disposal terminano il worker e rilasciano il Blob URL. Servono Worker da Blob e DecompressionStream('deflate-raw') per ZIP compressi. La CSP dell'applicazione deve consentire il proprio worker; non viene modificata automaticamente. Nessuna libreria viene scaricata da CDN.

Il percorso nativo gestisce Part 10, Explicit VR Little Endian, MONOCHROME1/2, 8/16 bit, singolo frame per istanza. La serie può contenere molte istanze. DICOM compressi, enhanced multiframe e LUT non lineari richiedono ulteriori decoder: l'adapter Cornerstone precedente resta disponibile, ma non viene collegato automaticamente a questa ricostruzione. ZIP STORE/DEFLATE, controllo CRC32, massimo 4096 entry e 256 MiB espansi; limite volume 64 milioni di voxel. Il Playground limita il file a 64 MiB.

## Verifiche

Campione utente: 90 sezioni 256×256, 5.898.240 voxel, spacing 0,898438 × 0,898438 × circa 2 mm. Superficie alla soglia 219 e passo 8: 11.036 triangoli. Testati worker reali Node, bundle normale e minificato, ZIP corrotto, annullamento, coordinate e buffer finiti. Il browser grafico reale non è stato eseguito. Il campione medico non viene redistribuito nell'archivio.

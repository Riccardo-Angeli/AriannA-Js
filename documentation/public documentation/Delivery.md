# AriannA — Formats + Medical Definitions

## Perimetro della consegna

Questa consegna attua il perimetro chiarito: conversioni archiviate con dati separati, definizioni di schema e costruzione/mapping dei documenti clinici. Non include server sanitari, validatori clinici, terminologie eseguibili, certificazione SSN/FSE o un motore AQL. Non sono necessari per costruire i documenti richiesti e non vengono simulati.

Sostituire `additionals/Three.ts` e `additionals/index.ts`, aggiungere `additionals/formats/` e `additionals/medical/`, sostituire `devtools/playground/playground.html`. Conservare eventuali export aggiunti localmente al proprio index dopo la baseline: quello incluso mantiene i precedenti export della copia disponibile. Nessun cambiamento a Core o ai componenti. Le dipendenze sono relative alla repository, senza percorsi Downloads.

## Schemi: file statici, non peso del bundle

La cartella `additionals/medical/schemas` contiene dati di definizione e SDL GraphQL. Copiarla tra gli asset statici del proprio progetto per usare `Fhir.load(url)` o `OpenEHR.load(url)`. In alternativa caricare il JSON con il proprio sistema e passarlo al costruttore. Non ci sono import JSON impliciti né richieste automatiche alla partenza di AriannA.

FHIR R5: schema JSON ufficiale completo (857 definizioni), 158 risorse, 159 file GraphQL ufficiali, StructureDefinition/OperationDefinition/ricerche/ValueSet/ConceptMap del pacchetto ufficiale `definitions.json.zip`. `rest.openapi.json` è una proiezione AriannA dei percorsi REST e dei corpi JSON, non una specifica ufficiale alternativa: i dettagli autorevoli di ricerca e operazioni rimangono nei file ufficiali inclusi.

openEHR: repository JSON Schema upstream completo per i componenti presenti AM/BASE/RM, con file originali, licenza, cataloghi per versione e proiezioni GraphQL generate. I JSON Schema upstream sono dichiarati DEVELOPMENT dal progetto openEHR, non diventano standard stabili perché inclusi qui. Le specifiche OpenAPI upstream sono conservate in YAML e riprodotte anche come JSON. Versioni/snapshot e hash delle fonti sono in `Sources.json`; conteggi in `Coverage.json`.

La proiezione GraphQL openEHR comprende i campi delle definizioni, con oggetti input/output e union in output. I campi non esprimibili direttamente in GraphQL, comprese le union in input, usano lo scalare JSON. I vincoli completi restano nel JSON Schema. Non è uno standard GraphQL ufficiale openEHR né un server/resolver già avviato.

## Import/export e archivio

`Three.createFormats().convert(input, from, to, options)` restituisce ora `{ data: ArrayBuffer, format: 'zip', manifest }`.

L'archivio contiene:

- `model/model.<formato>`: geometria convertita;
- `animations/`, `rigs/`, `materials/`, `textures/`: descrittori separati e buffer binari;
- `scene/`: gerarchia, primitive e metadati del decoder;
- `metadata/`: dati applicativi forniti;
- `source/`: file originale ESATTO e risorse esterne;
- `manifest.json`: collegamenti tra i file, formato sorgente/destinazione e warning del decoder.

Animazioni e rig conservati non vengono automaticamente applicati all'STL: lo STL rimane geometria statica. `restore(zip)` rilegge la sorgente conservata con le sue risorse, recuperando il modello originario. La copia originale evita di perdere estensioni o dati che il decoder non interpreta. Per preservare dipendenze esterne, fornirle con `resources` o `resolveResource`: i buffer glTF e le immagini glTF/FBX individuate vengono richiesti esplicitamente. Risorse mancanti producono errore, non una conversione falsamente dichiarata completa. Eventuali dipendenze arbitrarie non individuabili dal formato vanno fornite in `resources`.

```ts
const formats = Three.createFormats();
const archive = await formats.convert(await model.arrayBuffer(), 'gltf', 'stl', {
  resources: {
    'scene.bin': await binaryFile.arrayBuffer(),
    'albedo.png': await textureFile.arrayBuffer()
  },
  metadata: { project: 'AriannA' }
});
const blob = new Blob([archive.data], { type: 'application/zip' });
// Salva blob con il download della tua applicazione.
const restored = await formats.restore(archive.data);
```

Per il precedente comportamento senza ZIP esiste `convertGeometry(..., {allowGeometryOnly:true})`. È volutamente distinto. `export(format, mesh)` continua a restituire direttamente il file. Sono testati OBJ/STL/PLY/FBX/glTF/GLB per triangoli statici. Le capacità dei singoli codec rimangono esplicite; non viene promessa la riscrittura nativa di ogni feature proprietaria di ogni formato.

`packageOriginal(input, 'dcm')` o `packageOriginal(input, 'dxf')` conserva anche questi formati nello stesso contenitore. La trasformazione di una scansione DICOM in un solido richiede segmentazione/estrazione di superficie; un disegno DXF richiede le scelte geometriche di estrusione/tessellazione. Queste operazioni non sono sostituite con una geometria inventata.

## DCOM e Playground

La categoria `3D → Formats` conserva gli otto esempi e il Load dedicato. Il DICOM allegato è stato decodificato localmente e confrontato campione per campione con dicom-parser. Il reader locale accetta Explicit VR Little Endian, singolo frame MONOCHROME1/2 8/16 bit e VOI LINEAR. Per altri encoding rimane l'adapter Cornerstone. Il file singolo viene mostrato come piano con texture. Lo ZIP di una serie viene ricostruito in volume e visualizzato come superficie 3D per soglia, come descritto in Dcom-Series.md.

## Verifiche e limiti osservati

Compilazione TypeScript rigorosa e bundle; 36 coppie di conversione geometrica su fixture; archivio di un glTF con animazione, skin e texture esterna ripristinato dalla sorgente; integrità ZIP controllata anche da Python. Il decoder DICOM è testato sui 65.536 campioni del file utente. Costruzione/assegnazione di tutti i campi delle 857 definizioni FHIR e 134 RM 1.1.0 testata, senza validazione clinica.

I file GraphQL FHIR sono stati analizzati sintatticamente; le proiezioni GraphQL openEHR sono state costruite con il parser/schema builder GraphQL. I file ufficiali FHIR non sono stati modificati per adattarli a un server specifico. Non è stato eseguito un browser reale né un test contro un fascicolo SSN. Questi test non costituiscono conformance/certificazione medica.

### GraphQL FHIR: originali e proiezione utilizzabile

`schemas/fhir-r5/graphql/` conserva i 159 file ufficiali senza modifiche. Il pacchetto upstream è analizzabile sintatticamente, ma la concatenazione diretta non forma uno schema eseguibile: contiene riferimenti non definiti (per esempio `IBase`) e argomenti duplicati.

`schemas/fhir-r5/Fhir.graphql` è invece la proiezione AriannA dei modelli JSON FHIR R5: tipi input/output, Query e Mutation, 1.686 tipi compresi gli scalari e i tipi di introspezione. Passa `buildSchema` e `validateSchema`. Non sostituisce il contratto normativo FHIR GraphQL: richiede resolver applicativi. I campi non rappresentabili nativamente usano lo scalare JSON; le definizioni originali restano disponibili.

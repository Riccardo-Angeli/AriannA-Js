# Logos IR 2.1 — Specifica canonica corretta

**Logos** è il contratto IR autonomo di Kosmos. Non appartiene al runtime AriannA né al backend Techne: entrambi dipendono dallo stesso schema.

```text
                 Logos Schema
                 /          \
          AriannA            Techne
      produce Fragment   link/validate/lower
```

AriannA esporta Definitions dei propri concern e costruisce `Fragment`. Techne collega i frammenti, risolve i riferimenti, verifica le capability e produce `Program` HIR, MIR o LIR.

## Invarianti normative

1. **Type-only e function-free.** `Logos.ts` non contiene costanti, registri, callback o tabelle eseguibili. Ogni comportamento è rappresentato mediante `ActionId`, `CodeId`, `ExpressionId` o riferimento stabile.
2. **Definition discriminata.** Ogni Definition contiene obbligatoriamente `Id`, `Kind`, `DialectId` e `Version`. Questo permette union affidabili in TypeScript, Rust/Serde, JSON Schema e ORM.
3. **Spazio valori chiuso.** `Value` ammette soltanto null, booleani, numeri, stringhe, array e oggetti ricorsivi. Non esiste `unknown` nelle Definitions canoniche.
4. **Identità deterministica.** Gli ID di build sono forniti dal produttore o generati da path/hash canonici. Gli ID runtime non entrano in Logos.
5. **Riferimenti, non copie.** Node, Component, Graph e Model usano ID. Il Program canonico è una tabella di Definitions, non un albero di oggetti duplicati.
6. **Canonicalizzazione esplicita.** Hash e firme dichiarano `logos-c14n-v1`, scope e algoritmo. Firma e certificati non sono implicitamente parte dell’hash.
7. **Stage verificabili.** HIR, MIR e LIR non sono semplici etichette:
   - HIR: nessuna piattaforma attiva e nessun target;
   - MIR: piattaforma attiva obbligatoria, target vietato;
   - LIR: piattaforma e target obbligatori, nessun riferimento irrisolto.
8. **SOT per concern.** Il futuro `.lgs` deve essere componibile per concern (`Events.lgs`, `Css.lgs`, `Virtual.lgs`, ecc.). Il file aggregato Logos compone le proiezioni, non introduce runtime paralleli.

## Struttura

```text
Fragment
  Definitions[]
  References[]
  Requirements[]
       |
       v
Techne Linker
       |
       v
HIR -> MIR -> LIR -> Artifact
```

Ogni Definition è identificata da:

```ts
interface DefinitionHeader<K extends DefinitionKind> {
    Id: Id;
    Kind: K;
    DialectId: Id;
    Version: DefinitionVersion;
    Revision?: Revision;
    Metadata?: Record<string, Value>;
    Provenance?: Provenance;
    Integrity?: Integrity;
}
```

## Platform, Namespace e Dialect

`Platform` è sopra `Namespace`. Una Platform non incorpora copie dei Namespace o Dialect: contiene soltanto `NamespaceIds` e `DialectIds`.

```text
Platform
  NamespaceIds[]   identità e domini
  DialectIds[]     grammatica e operazioni
  Capabilities[]
  MemorySpaces[]
  ExecutionModels[]
```

`Program.Definitions` contiene le relative Definitions una sola volta. Questo elimina la precedente duplicazione fra `Platform.Namespaces`, `Program.Namespaces` e `Program.Dialects`.

## AriannA UI

La faccia AriannA comprende principalmente:

```text
Type.Definition
Css.Definition
Node.Definition
Component.Definition
Events.*
Reactive.*
Expression.Definition
Mapping.Definition
Action.Definition
```

Il nodo è normalizzato:

```ts
interface Node.Definition {
    Id: Id;
    Kind: 'node';
    NodeKind: 'element' | 'text' | 'component' | 'resource' | 'operation';
    Path: string;
    NamespaceId: Id;
    TypeId?: Id;
    ParentId?: Id;
    ChildIds: Id[];
    Attributes: Record<string, Primitive>;
    StyleIds: Id[];
    EventBindingIds: Id[];
    ReactiveBindingIds: Id[];
}
```

`Mounted`, `Rendered`, `Dirty`, DOM handles, disposer e cronologia restano nel runtime AriannA o nell’inspector, mai nell’IR compilabile.

## Events

Il modello eventi separa:

- `Event`: schema dell’evento;
- `Target`: destinazione persistibile;
- `Code`: sorgente o artefatto, mai callback viva;
- `Handler`: riferimento al comportamento;
- `Binding`: collegamento evento-target-handler;
- `Broker`: routing fuori dall’albero;
- `Expression`: condizioni strutturate;
- `Mapping`: trasformazione del payload;
- `Action`: behavior compilabile o riferimento nativo.

Le condizioni non sono stringhe opache: `ConditionExpressionId` e `PredicateExpressionId` referenziano un AST `Expression.Definition`.

## Compute, Vision e Neural

Logos include facce dichiarative per:

```text
Tensor
Operation
Graph
Device
Vision Operation
Neural Model
Quantization
Model Transform
Pass / Rewrite / Pipeline
```

Gli handle vivi (`cv::Mat`, `GpuMat`, device pointer, CUDA stream, kernel compilato) appartengono esclusivamente a Techne Runtime.

## Persistence e ORM

La discriminazione `Kind` permette una strategia ibrida:

```text
Logos.Definitions
  Id
  Kind
  DialectId
  Version
  Revision
  IntegrityHash
  PayloadJson
```

con tabelle normalizzate per i domini interrogati frequentemente:

```text
Logos.Nodes
Logos.NodeChildren
Logos.Types
Logos.Events
Logos.EventBindings
Logos.Tensors
Logos.Operations
```

Gli ID costituiscono chiavi esterne. Gli oggetti annidati non devono duplicare Definitions.

## Formati consegnati

- `Logos.corrected.ts`: contratto TypeScript puro, compilato con `strict`.
- `Logos.corrected.schema.json`: proiezione strutturale esaustiva, JSON Schema Draft 2020-12.
- `Logos.corrected.schema.xml`: proiezione XML/XSD 1.1 per trasporto, con Value esplicitamente tipizzato e assert sugli stage.
- `Logos.corrected.MD`: specifica normativa.

Il JSON Schema è la proiezione strutturale completa. L’XSD modella rigorosamente envelope, header, discriminanti, riferimenti, integrity e valori tipizzati; le proprietà specifiche delle Definitions sono trasportate come entry tipizzate e validate semanticamente da Techne contro lo schema canonico.

## Passo successivo

Il collegamento AriannA → Logos deve produrre un `Fragment<'arianna.ui'>` tramite exporter puri:

```text
Core runtime       -> Type.Definition
Virtual runtime    -> Node.Definition
Stylesheet runtime -> Css.Definition
Events runtime     -> Events Definitions
Observable runtime -> Signal/Binding Definitions
Component runtime  -> Component.Definition
```

Techne deve poi implementare, nell’ordine:

1. `validate_fragment`;
2. `canonicalize` e `hash`;
3. `link_fragments`;
4. `validate_stage`;
5. `lower_hir_to_mir`;
6. `lower_mir_to_lir`;
7. persistence e artifact emission.

# Medical definitions — uso

## FHIR: generazione di una risorsa dalla propria cartella

```ts
import { Fhir, OpenEHR } from './additionals/medical/index.ts';
const fhir = await Fhir.load('/schemas/fhir-r5/fhir.schema.json');
const patientMapping = fhir.compile('Patient', [
  { from: 'anagrafica.id', to: 'id' },
  { from: 'anagrafica.cognome', to: 'name[0].family' },
  { from: 'anagrafica.nomi', to: 'name[0].given' },
  { from: 'anagrafica.nascita', to: 'birthDate' },
  { value: true, to: 'active' }
]);
const patient = patientMapping({anagrafica:{id:'patient-1',cognome:'Example',nomi:['Arianna'],nascita:'2015-01-01'}});
const observation = fhir.create('Observation', {
  id:'observation-1', status:'final', subject:fhir.reference(patient)
}).set('valueQuantity', fhir.quantity(36.5, 'Cel')).toJSON();
// Code, encounter, effectiveDateTime ecc. devono essere associati dai propri dati.
const bundle = fhir.bundle([patient, observation]);
console.log(bundle.toString());
const post = fhir.request('https://server.example/fhir', 'Patient', 'POST', patient);
// post è un descrittore: URL, method, headers, body. Non viene inviato automaticamente.
```

`map`, `compile` e `mapMany` accettano mapping espliciti con `from`, `to`, `value`, `default`, `transform`. `transform` permette di associare un record ripetuto a un array di oggetti, normalizzare date/unità secondo regole dell'applicazione, o consultare dizionari definiti da voi. Non vengono inventati codici o equivalenze cliniche.

```ts
{ from:'contatti', to:'telecom', transform: rows => rows.map(r => ({system:r.tipo,value:r.valore})) }
```

I percorsi supportano `name[0].family`, `name.0.family` e JSON Pointer `/name/0/family`. I valori mancanti sono omessi salvo default esplicito. Stringhe, numeri, false, null e array restano distinti. Nessuna compilazione dinamica/eval del mapping.

`fields(type)` fornisce ogni campo con indicazione required e JSON Schema originale; `definition(type)` restituisce una copia della definizione; `types()` elenca i tipi; `resources()` elenca solo le risorse FHIR effettive. `register(name,schema)` permette cataloghi/profili aggiuntivi. `create` non riempie dati clinici fittizi per soddisfare required. Il documento può quindi essere incompleto durante l'editing: questo è voluto, dato che non si tratta di un validatore.

## openEHR

```ts
const ehr = await OpenEHR.load('/schemas/openehr/catalog/RM-1.1.0.json');
const doc = ehr.fromTemplate('COMPOSITION', myCanonicalTemplate, {
  'name': ehr.text('Visita'),
  'content[0].data.items[0].value': ehr.quantity(36.5, 'Cel')
});
const payload = doc.toJSON();
const request = ehr.commit('https://server.example/openehr/v1', ehrId, payload);
```

`myCanonicalTemplate` è la struttura RM scelta dalla propria applicazione, con archetype_node_id, template_id e percorsi corretti. Non è un file ADL/OPT compilato automaticamente. L'API associa valori ai percorsi del JSON canonico: non sostituisce un compiler di archetipi. Per generare una forma diversa usare `compile` con un insieme di mapping specifico.

`text`, `code`, `quantity`, `dateTime`, `element`, `composition`, `fromTemplate` sono helper di costruzione. I valori di terminology_id/code_string, versioni e identificativi restano quelli forniti dall'applicazione. `query` produce un descrittore REST AQL; non esegue AQL nel browser. `graphqlRequest` indirizza la propria facade GraphQL, senza attribuirla allo standard openEHR.

## GraphQL e REST

FHIR: utilizzare i file ufficiali in `schemas/fhir-r5/graphql/` e le definizioni JSON originali. `graphqlRequest()` costruisce il payload verso `$graphql`; i resolver e la persistenza sono responsabilità dell'applicazione.

openEHR: `schemas/openehr/catalog/*.graphql` contiene le proiezioni generate, una per componente/versione. La proiezione RM 1.1.0 è anche in `OpenEHR.graphql`. Lo scalare JSON è intenzionale per rappresentare costrutti non esprimibili direttamente in GraphQL. Implementare scalar/resolver nella propria applicazione; non viene avviato alcun backend.

I percorsi REST FHIR sono in `rest.openapi.json`, con collegamenti agli schemi delle risorse e OperationDefinition. Per openEHR usare i documenti OpenAPI JSON convertiti dai YAML upstream. I metodi helper non coprono nominalmente ogni endpoint: il descrittore generico e i documenti delle definizioni restano accessibili per generare il routing applicativo.

## Futuro confronto SSN/FSE

Le risorse/profili italiani e le regole dello specifico documento e servizio SSN dovranno essere caricati e mappati esplicitamente. Questo pacchetto costruisce JSON standard e permette il confronto campo-per-campo; non afferma che ogni payload generato sia già accettato da SSN/FSE né realizza ora conversioni CDA o un'integrazione nazionale.

### GraphQL FHIR: originali e proiezione utilizzabile

`schemas/fhir-r5/graphql/` conserva i 159 file ufficiali senza modifiche. Il pacchetto upstream è analizzabile sintatticamente, ma la concatenazione diretta non forma uno schema eseguibile: contiene riferimenti non definiti (per esempio `IBase`) e argomenti duplicati.

`schemas/fhir-r5/Fhir.graphql` è invece la proiezione AriannA dei modelli JSON FHIR R5: tipi input/output, Query e Mutation, 1.686 tipi compresi gli scalari e i tipi di introspezione. Passa `buildSchema` e `validateSchema`. Non sostituisce il contratto normativo FHIR GraphQL: richiede resolver applicativi. I campi non rappresentabili nativamente usano lo scalare JSON; le definizioni originali restano disponibili.

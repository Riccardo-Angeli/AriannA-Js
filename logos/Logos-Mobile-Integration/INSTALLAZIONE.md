# Logos Mobile — installazione controllata

## Ambito
Overlay additivo per il repository `arianna-js(4).zip`: punti 1–4 e 6. Non compila applicazioni SwiftUI/Compose e non è un catalogo completo delle API SDK: fornisce contratti tipizzati, inventario iniziale, registri semantici, conversioni IR prototipali, diagnostica, punti di estensione Watch/TV e verifiche. Nessun file del Core, build esistente o componenti è sostituito.

## Prerequisiti e backup
1. Su Mac, nel repository originale, verificare `git status --short` e annotare branch e commit con `git rev-parse HEAD`.
2. Eseguire `git switch -c feat/logos-mobile-isolated` (solo con working tree pulito) oppure creare prima un commit/stash.
3. Conservare il backup ZIP originale **fuori dal repository**. Non eseguire installazioni direttamente sul server di ariannajs.dev.
4. Assicurarsi di usare Node >=22 e TypeScript (`npx --no-install tsc --version` oppure `tsc --version`).
5. Baseline prima di ogni modifica: `npm ci`, `npm run typecheck`, `npm run build`; conservare output e checksum della release. Se la baseline fallisce, fermarsi e diagnosticare senza attribuire l'errore a Logos Mobile.

## Copia e installazione
Dalla cartella del repository:

```bash
# Scompattare il deliverable fuori dalla directory del repository.
cp -R /PERCORSO/Logos-Mobile-Integration/overlay/logos ./logos
cp /PERCORSO/Logos-Mobile-Integration/overlay/scripts/logos-mobile-*.mjs ./scripts/
cp /PERCORSO/Logos-Mobile-Integration/overlay/scripts/install-logos-mobile.mjs ./scripts/
cp /PERCORSO/Logos-Mobile-Integration/protected-sha256.json ./logos-mobile-protected-sha256.json
node scripts/logos-mobile-guard.mjs
node scripts/install-logos-mobile.mjs
npm run logos:mobile:check
npm run logos:mobile:audit
npm run typecheck
npm run build
node scripts/logos-mobile-guard.mjs
```

Attenzione: `cp -R` richiede che non esista già `logos/` con modifiche locali da preservare; in tal caso esaminare il diff e copiare solo `logos/mobile/`. I checksum del guard si riferiscono **esattamente** allo ZIP `arianna-js(4).zip`; se il repository locale è più recente, non forzare i checksum: aggiornare la baseline confrontando attentamente i file canonici.

## Verifica di rilascio
`git diff --name-status` deve mostrare soltanto `package.json` modificato e nuovi `logos/mobile`, `scripts/logos-mobile-*`, `scripts/install-logos-mobile.mjs`, `logos-mobile-protected-sha256.json`. Nessuna modifica a `core/`, `schema/`, `components/`, `additionals/`, `scripts/build.mjs` o `scripts/build-devices.mjs`. Verificare anche `git diff -- package.json`; si aggiungono solamente export `./logos/mobile` e due script.

Ripetere i test preesistenti su browser, device kits e playground. Generare i bundle attuali e confrontare `sha256sum` (su macOS `shasum -a 256`) per gli artefatti principali **a parità di toolchain e build flags**. Non distribuire su ariannajs.dev fino a quando i test integrativi e il confronto di output non siano completati.

## Rollback
Prima del merge: `git restore package.json` e rimuovere **solo** i nuovi file elencati sopra, oppure semplicemente cancellare il branch isolato. Non usare `git reset --hard` o `git clean -fd` su modifiche non salvate. Se `node scripts/logos-mobile-guard.mjs` segnala una modifica a un file protetto, fermarsi e ripristinare selettivamente dal commit di baseline.

## Risultati e limiti
Il prototipo importa/esporta una rappresentazione Logos Mobile serializzabile e preserva metadati custom in `extensions`. Il round-trip è verificabile localmente; **non** garantisce equivalenza semantica tra framework, compilazione nativa, emissione di codice Swift/Kotlin o copertura esaustiva dei loro SDK. I registry e i mirror sono progettati per espansione versionata e test di conformance per dispositivo.

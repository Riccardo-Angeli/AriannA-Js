# Logos Mobile: avvio da arianna-js/logos/Logos-Mobile-Integration

Posizionare **l'intera directory**, senza cambiare il nome, in `arianna-js/logos/Logos-Mobile-Integration/`. Non copiare gli script nella root e non eseguirli dalla cartella `scripts/`.

## Prima di iniziare

Assicurarsi che la working tree sia pulita (`git status --short`), lavorare in un branch dedicato (`git switch -c feat/logos-mobile`), salvare un backup, ed eseguire `npm ci`, `npm run typecheck`, `npm run build` **prima** di installare. Non operare sul branch che distribuisce ariannajs.dev.

## Esecuzione

Aprire un terminale nella root `arianna-js`:

```bash
node logos/Logos-Mobile-Integration/install.mjs check
node logos/Logos-Mobile-Integration/install.mjs install
npm run logos:mobile:check
npm run logos:mobile:audit
npm run typecheck
npm run build
node logos/Logos-Mobile-Integration/install.mjs check
```

Oppure dal Finder, dopo `chmod +x logos/Logos-Mobile-Integration/*.command`, eseguire in sequenza `01-CHECK.command`, `02-INSTALL.command`, `03-VERIFY.command`, `04-FULL-REGRESSION.command`.

## Cosa viene modificato

- Crea `logos/mobile/` con i file TypeScript contenuti in `overlay/logos/mobile/`.
- Modifica **solo** `package.json` aggiungendo `exports['./logos/mobile']`, `scripts['logos:mobile:check']`, `scripts['logos:mobile:audit']` e il percorso `logos/mobile/` nella lista `files` per npm pack.
- Salva il `package.json` originale in `logos/Logos-Mobile-Integration/package.json.before-logos-mobile.backup`.
- Non scrive nel Core, non esegue deploy, non modifica la build preesistente.

## Stop e rollback

Se il controllo SHA-256 fallisce, **non installare**: gli hash sono quelli del repository allegato il 16 ottobre 2026; un aggiornamento legittimo del Core può rendere necessaria una nuova baseline verificata. Non forzare la sostituzione dei file.

Per annullare, dopo aver salvato eventuali modifiche proprie, dalla root:

```bash
cp logos/Logos-Mobile-Integration/package.json.before-logos-mobile.backup package.json
rm -rf logos/mobile
npm run typecheck
npm run build
```

Il rollback non modifica alcun altro file. Se qualcuno ha modificato `package.json` dopo l'installazione, fare invece un merge manuale del backup (non sovrascriverlo).

## Limiti

Il pacchetto è l'estensione iniziale di registri/contratti, non un compilatore SwiftUI/Compose completo. Non pubblicare npm o ariannajs.dev senza regression test e controllo del packaging.

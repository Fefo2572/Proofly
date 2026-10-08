# Proofly

Sito didattico in italiano del Dottore in Ingegneria Federico Ennio Ambrogi.

## Contenuti

- Matematica: 10 capitoli sulla retta (coordinate, forme dell'equazione, pendenza, due punti, punto-pendenza, parallelismo e perpendicolarità, intersezioni, distanze, fasci e vettori).
- Fisica: i tre principi della dinamica classica.
- Ogni capitolo: teoria, laboratorio interattivo, tre esercizi svolti e verifica numerica.
- Ricerca degli argomenti, dark mode e progressi salvati nel browser.

## Avvio locale

Il sito è statico: non richiede compilazione né dipendenze da installare. Con Python disponibile:

```sh
python -m http.server 8765 --directory dist
```

Aprire http://localhost:8765. Si può anche aprire `dist/index.html` direttamente; per lo sviluppo si consiglia il server locale.

## Modificare il progetto

- `dist/content.js`: lezioni, testi e soluzioni; le stringhe `String.raw` preservano il LaTeX.
- `dist/app.js`: ricerca, navigazione, verifica esercizi, grafici e simulazioni.
- `dist/style.css`: grafica responsive, tema chiaro e scuro.
- `dist/katex/`: KaTeX 0.19.0 e font locali. Non spostare la cartella dei font rispetto al CSS.

Controlli: `node tests/validate.cjs`. Il test verifica tutte le formule, le risorse dei font, ricerca e casi limite dei laboratori.

## Hosting e riservatezza

La versione Sites è inizialmente privata. Il file `.openai/hosting.json` conserva l'identità del sito per aggiornamenti futuri. Nessuna credenziale è inclusa nel progetto. Per utilizzare un nuovo progetto Sites, seguire il workflow di registrazione invece di riutilizzare questa identità.

Tema e completamento dei capitoli usano localStorage. Non ci sono account, analytics, tracciamento o dipendenze da CDN. I grafici mostrano valori numerici arrotondati a tre decimali; gli esercizi espongono i passaggi simbolici. Le simulazioni sono modelli ideali con ipotesi dichiarate.

KaTeX è distribuito secondo la licenza MIT inclusa in `dist/katex/LICENSE`. I testi delle lezioni sono originali del progetto.

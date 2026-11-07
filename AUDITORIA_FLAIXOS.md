# Auditoria orientativa de flaixos · Caleidoscopi (CE21)

> **Nota de la versió 0.7.1.** Aquest informe correspon a la versió 0.7 (3 patrons). A la 0.7.1 el Corrent d’aurora s’ha refet i s’han afegit 17 patrons, i l’auditoria no s’ha tornat a executar. Per tant, aquest informe no és vàlid per a la 0.7.1. Per regenerar-lo amb els 20 patrons: `node tools/flash-audit.mjs AUDITORIA_FLAIXOS.md`.

Generat per `tools/flash-audit.mjs` el 2026-10-25. Durada analitzada: 8 s per patró (la mínima, és a dir, la més ràpida), a 60 fotogrames per segon, en un llenç de 1024×768 px.

**Mètode.** Adaptació dels criteris de flaix general i de flaix vermell de WCAG 2.2 (criteri 2.3.1). Per a cada cel·la de 8×8 px es calcula la lluminància relativa mitjana i el valor de vermell saturat. Es compta una transició quan hi ha un canvi oposat d'almenys 0,1 de lluminància (amb l'estat fosc per sota de 0,8), o d'almenys 20 en el valor de vermell. Una cel·la es marca si té set transicions o més (més de tres flaixos) dins d'un segon. Després es busca el pitjor camp de 10° (341×256 px), i el criteri falla si més del 25 % d'aquest camp està marcat.

**Límits.** És una comprovació d'enginyeria, no una certificació. No substitueix una eina reconeguda (per exemple, el Harding Test), no analitza el risc dels patrons espacials regulars (bandes o reixes) i no té en compte la mida real de la pantalla ni la distància de visió de cada infant.

## Validació del detector

Abans d'analitzar els patrons, el mateix detector s'aplica a dos controls que han de fallar: una pantalla completa que alterna negre i blanc a 5 Hz, i una altra que alterna negre i vermell saturat a 5 Hz.

| Control | Pitjor àrea de flaix general | Pitjor àrea de flaix vermell | Detectat |
|---|---|---|---|
| Negre/blanc a 5 Hz | 100.0 % | 0.0 % | Sí |
| Negre/vermell a 5 Hz | 100.0 % | 100.0 % | Sí |

## Patrons

| Patró (núm. del pla) | Ronda | Moviment | Màx. transicions d'una cel·la en 1 s (moment) | Pitjor àrea de flaix general | Pitjor àrea de flaix vermell | Salt màx. de lluminància mitjana entre fotogrames | Resultat |
|---|---|---|---|---|---|---|---|
| Mandala que respira (1) | 0 | normal | 5 (1.75 s) | 0.0 % | 0.0 % | 0.005 | Sense incidències |
| Mandala que respira (1) | 0 | reduït | 6 (2.60 s) | 0.0 % | 0.0 % | 0.005 | Sense incidències |
| Mandala que respira (1) | 1 | normal | 7 (2.75 s) | 0.1 % | 0.0 % | 0.006 | Sense incidències |
| Mandala que respira (1) | 1 | reduït | 6 (2.05 s) | 0.0 % | 0.0 % | 0.005 | Sense incidències |
| Mandala que respira (1) | 2 | normal | 6 (3.10 s) | 0.0 % | 0.0 % | 0.006 | Sense incidències |
| Mandala que respira (1) | 2 | reduït | 6 (2.05 s) | 0.0 % | 0.0 % | 0.006 | Sense incidències |
| Constel·lació de fils (7) | 0 | normal | 13 (2.15 s) | 1.2 % | 0.0 % | 0.001 | Sense incidències |
| Constel·lació de fils (7) | 0 | reduït | 12 (1.50 s) | 0.9 % | 0.0 % | 0.001 | Sense incidències |
| Constel·lació de fils (7) | 1 | normal | 16 (1.45 s) | 0.9 % | 0.0 % | 0.001 | Sense incidències |
| Constel·lació de fils (7) | 1 | reduït | 12 (3.65 s) | 0.9 % | 0.0 % | 0.001 | Sense incidències |
| Constel·lació de fils (7) | 2 | normal | 12 (0.05 s) | 1.1 % | 0.0 % | 0.001 | Sense incidències |
| Constel·lació de fils (7) | 2 | reduït | 12 (2.10 s) | 0.7 % | 0.0 % | 0.001 | Sense incidències |
| Corrent d’aurora (8) | 0 | normal | 8 (0.00 s) | 1.2 % | 0.0 % | 0.001 | Sense incidències |
| Corrent d’aurora (8) | 0 | reduït | 8 (0.00 s) | 0.7 % | 0.0 % | 0.001 | Sense incidències |
| Corrent d’aurora (8) | 1 | normal | 11 (0.05 s) | 2.7 % | 0.0 % | 0.001 | Sense incidències |
| Corrent d’aurora (8) | 1 | reduït | 8 (0.00 s) | 0.8 % | 0.0 % | 0.001 | Sense incidències |
| Corrent d’aurora (8) | 2 | normal | 10 (0.00 s) | 1.2 % | 0.0 % | 0.001 | Sense incidències |
| Corrent d’aurora (8) | 2 | reduït | 9 (1.35 s) | 0.7 % | 0.0 % | 0.000 | Sense incidències |

Llindar per marcar una cel·la: 7 transicions en 1 s. Llindar d'àrea: 25 % del camp de 10°. La columna «moment» indica l'inici de la finestra d'1 s amb més transicions en una sola cel·la.

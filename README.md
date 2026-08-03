# noatournoy.dev

Le portfolio de Noa Tournoy. Statique, écrit à la main : pas de build, pas de dépendance,
aucune requête vers un tiers au runtime.

## Structure

```
index.html            accueil
travaux/              index des travaux + une page par travail
savoir-faire/         langages, infrastructure, certifications
contact/              coordonnées
404.html              page d'erreur
styles/spec.css       la feuille unique
scripts/kinetic.js    le défilement pilote les axes de la fonte variable
scripts/i18n.js       bascule FR/EN
i18n/*.en.json        les textes anglais, une entrée par page
fonts/RobotoFlex.woff2  fonte variable, sous-ensemblée latin
```

Le français est écrit dans le HTML : la page se lit entièrement sans JavaScript.
L'anglais est chargé à la demande depuis `i18n/`.

## Développement

N'importe quel serveur statique suffit :

```bash
python -m http.server 8000
```

## Mise en ligne

Push sur `main` → déploiement Vercel. Les branches de travail ciblent `main` par pull request.

## Refaire la fonte

La fonte est un sous-ensemble latin de [Roboto Flex](https://github.com/google/fonts/tree/main/ofl/robotoflex)
(SIL Open Font License), réduit aux quatre axes utilisés :

```bash
pip install fonttools brotli
python -m fontTools.varLib.instancer RobotoFlex.ttf XOPQ=96 YOPQ=79 XTRA=468 \
  YTUC=712 YTLC=514 YTAS=750 YTDE=-203 YTFI=738 slnt=0 -o trim.ttf
python -m fontTools.subset trim.ttf --flavor=woff2 --layout-features='*' \
  --unicodes='U+0000-00FF,U+0131,U+0152-0153,U+2000-206F,U+20AC,U+2122,U+2190-2193' \
  --output-file=fonts/RobotoFlex.woff2
```

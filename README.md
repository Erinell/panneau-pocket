# Panneau Pocket

Ce projet est une application (non officiel) PC de l'application [Panneau Pocket](https://www.panneaupocket.com).

Cette application est compatible avec Windows, Linux et Mac.

## Developpement

```
$ yarn run dev
```

## Build
```
$ yarn install
$ yarn electron:package:<os>
```
Remplacer `<os>` par un système d'exploitation.

OS      | format
--------|----------
`linux` | .AppImage
`win`   | .exe
`mac`   | _

## Installation

Effectuer l'étape `Build` pour commencer.

### Linux
```
$ cd dist
$ ./<package>.AppImage
```

## Todo
- [ ] Bug enregistrement fichier PDF
- [ ] Ajout de thèmes
- [ ] Possibilité de laisser tourner en arrière plan (lancement au démarrage)
- [ ] Système de notification bureau (en cours)
- [ ] Optimisations (en cours)
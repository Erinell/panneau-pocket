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
- [ ] Optimisations (en cours)

## 1.6.2
### Notes
- Ajout d'un overlay lorsqu'un évènement est annulé.
- Ajout d'une option pour lancer Panneau Pocket au démarrage.
- Mise à jour de la base de donnée des villes.
- Ajout de l'argument `--background` pour lancer en arrière plan.
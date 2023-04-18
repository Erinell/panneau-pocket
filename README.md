# Application PC Panneau Pocket

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

os      | format
--------|-------
`linux` | .deb
`win`   | _
`mac`   | _

## Installation

Effectuer l'étape `Build` pour commencer.

### Linux
```
$ cd dist
$ dpkg -i <package>.deb
```

## Todo
- [x] Ajout de scrap la fenêtre pour + de possibilités
- [x] Possibilité d'enregistrer les images
- [x] Désactiver la fenêtre pour les redirection mailto: & tel:
- [x] Ajout page paramètres
- [x] Trier favoris par ordre alphabétique
- [ ] Bug enregistrement fichier PDF
- [ ] Ajout de thèmes
- [ ] Possibilité de laisser tourner en arrière plan (lancement au démarrage)
- [ ] Modifier l'icone pour Windows
- [ ] Système de notification bureau
- [ ] Optimisations
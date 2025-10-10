# 🏔️ OPOTOPO

[![Site](https://img.shields.io/badge/demo-live-brightgreen)](https://matfrancois.github.io/opotopo/)


## Démarrage rapide

1. Clonez le dépôt :
```bash
git clone https://github.com/MatFrancois/opotopo.git
cd opotopo
```

2. Ouvrez `index.html` dans votre navigateur

**OU** utilisez un serveur local simple :

**Avec Python :**
```bash
python -m http.server 8000
# Ouvrez http://localhost:8000
```

## 📁 Structure du projet

```
opotopo/
├── index.html              # Page principale
├── css/
│   └── styles.css          # Styles personnalisés
├── js/
│   ├── config.js           # Configuration globale
│   ├── table.js            # Gestion de la table DataTables
│   ├── filters.js          # Logique des filtres
│   └── main.js             # Point d'entrée de l'application
├── assets/                 # Ressources (images, icônes, etc.)
├── randonnees_enrich.json  # Données des randonnées
├── .gitignore             # Fichiers ignorés par git
├── LICENSE                # Licence MIT
└── README.md              # Ce fichier
```

## Système de notation


La note d'une randonnée est calculée selon la méthode suivante :

1. Seules les randonnées avec **plus de 6 commentaires** reçoivent une note (premier quartile)
2. Chaque commentaire est analysé avec le modèle de classification multi-langue [tabularisai](https://huggingface.co/tabularisai/multilingual-sentiment-analysis)
3. La note finale = moyenne des notes ± écart-type (échelle 0-4)



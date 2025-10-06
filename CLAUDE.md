# Système d'affichage digital pour restaurant traiteur

## Vue d'ensemble du projet

Créer une application web responsive pour afficher le menu hebdomadaire (8 plats) d'un restaurant traiteur. L'application doit fonctionner sur :
- **Écran TV** : LG 43UT73006LA (43", 1920x1080) - affichage principal dans le restaurant
- **Tablette** : Pour consultation par les clients ou le personnel
- **Mobile** : Pour permettre aux clients de consulter le menu à distance

## Architecture technique

### Structure des fichiers
```
restaurant-display/
├── index.html          # Page principale d'affichage
├── style.css          # Styles responsive
├── script.js          # Logique JavaScript
├── menu.json          # Données des plats (8 plats renouvelés chaque semaine)
├── editeur.html       # Interface d'édition du menu (optionnel)
├── editeur.js         # Logique de l'éditeur
└── assets/
    ├── logo.png       # Logo du restaurant
    └── icons/         # Icônes (végétarien, allergènes, etc.)
```

### Technologies
- **HTML5** : Structure sémantique
- **CSS3** : Design moderne avec CSS Grid/Flexbox
- **JavaScript vanilla** : Pas de framework pour rester léger
- **JSON** : Stockage des données

## Structure du fichier menu.json

```json
{
  "restaurant": {
    "nom": "Nom du Traiteur",
    "logo": "assets/logo.png",
    "telephone": "0123456789",
    "email": "contact@traiteur.be"
  },
  "semaine": {
    "debut": "2025-10-07",
    "fin": "2025-10-13",
    "numero": 41
  },
  "plats": [
    {
      "id": 1,
      "nom": "Bœuf Bourguignon",
      "description": "Mijoté 6 heures avec carottes et pommes de terre fondantes",
      "prix": 12.50,
      "categorie": "plat",
      "tags": ["sans-gluten"],
      "allergenes": ["céleri", "moutarde"],
      "nouveau": true,
      "epuise": false
    },
    // ... 7 autres plats
  ],
  "messages": [
    {
      "texte": "Commandez par SMS au 0123456789",
      "priorite": "haute"
    },
    {
      "texte": "Livraison gratuite dès 30€",
      "priorite": "normale"
    }
  ],
  "horaires": {
    "lundi": { "ouverture": "11:30", "fermeture": "14:30" },
    "mardi": { "ouverture": "11:30", "fermeture": "14:30" },
    "mercredi": { "ouverture": "11:30", "fermeture": "14:30" },
    "jeudi": { "ouverture": "11:30", "fermeture": "14:30" },
    "vendredi": { "ouverture": "11:30", "fermeture": "14:30" },
    "samedi": { "ferme": true },
    "dimanche": { "ferme": true }
  }
}
```

## Fonctionnalités détaillées

### 1. Affichage principal (TV)

#### En-tête fixe
- Logo du restaurant (gauche)
- Heure actuelle avec secondes (centre)
- Date du jour (centre)
- Météo locale (droite) - si connexion internet disponible
- Message "Ouvert/Fermé" selon les horaires

#### Zone centrale - Grille des plats
- **Layout** : Grille 2×4 pour les 8 plats
- **Chaque carte de plat** :
  - Nom en gros (24-32px)
  - Description (18-20px)
  - Prix bien visible (28-36px)
  - Badges : "NOUVEAU" (animé), "Végétarien" 🌱
  - Indicateur si épuisé (grisé avec "ÉPUISÉ")
  - Liste des allergènes en petits badges

#### Pied de page
- Défilement des messages (vitesse réglable)
- Informations de contact
- Mention "Menu de la semaine X"

### 2. Animations et interactions

#### Mode TV (pas d'interaction)
- **Rotation automatique** : Focus sur un plat différent toutes les 15 secondes
- **Effet de mise en avant** : Le plat en focus s'agrandit légèrement
- **Transitions douces** : Fade in/out entre les changements
- **Badge "NOUVEAU"** : Pulse animation subtile
- **Messages défilants** : Défilement horizontal continu

#### Mode tablette/mobile
- **Swipe** : Navigation entre les plats
- **Tap** : Affichage détaillé d'un plat
- **Pull-to-refresh** : Recharger les données

### 3. Design responsive

#### Breakpoints
```css
/* Mobile - Portrait */
@media (max-width: 576px) {
  /* Liste verticale, 1 plat par écran */
}

/* Mobile - Paysage & Petites tablettes */
@media (min-width: 577px) and (max-width: 768px) {
  /* Grille 2×2, défilement vertical */
}

/* Tablettes */
@media (min-width: 769px) and (max-width: 1024px) {
  /* Grille 2×3 ou 3×2 selon orientation */
}

/* Desktop & TV */
@media (min-width: 1025px) {
  /* Grille 2×4 ou 4×2 selon format */
}
```

### 4. Thème visuel

#### Couleurs
- **Fond principal** : Gris foncé (#1a1a1a) ou couleur brand
- **Cartes plats** : Gris plus clair (#2a2a2a) avec bordure subtile
- **Texte principal** : Blanc (#ffffff)
- **Prix** : Vert clair (#4ade80) ou couleur accent
- **Badge nouveau** : Orange vif (#f97316)
- **Épuisé** : Rouge (#ef4444) avec opacité

#### Typographie
- **Police principale** : Sans-serif moderne (Inter, Roboto, ou système)
- **Titres** : Bold, taille adaptative
- **Descriptions** : Regular, ligne-height généreux
- **Prix** : Extra-bold pour visibilité

### 5. Fonctionnalités avancées

#### Mode hors-ligne
- Cache des données en localStorage
- Affichage de la dernière version connue
- Indicateur "Hors ligne" discret

#### Météo (si connecté)
```javascript
// API OpenWeatherMap ou alternative gratuite
// Fallback sur icône statique si pas de connexion
// Cache de 30 minutes pour limiter les appels API
```

#### Multi-langues (optionnel)
- Support FR/NL/EN via paramètre URL
- Changement dynamique sans rechargement

### 6. Interface d'édition (editeur.html)

#### Formulaire simple
- 8 zones de saisie pour les plats
- Prévisualisation en temps réel
- Validation des données (prix, format)
- Export JSON avec téléchargement
- Import d'un JSON existant
- Historique des 4 dernières semaines

#### Workflow d'utilisation
1. Ouvrir editeur.html dans un navigateur
2. Remplir ou modifier les 8 plats
3. Prévisualiser l'affichage
4. Télécharger le menu.json
5. Uploader ou copier sur clé USB

## Déploiement

### Option 1 : Hors ligne (Clé USB)
1. Copier tous les fichiers sur une clé USB
2. Insérer dans le port USB de la TV LG
3. Naviguer vers index.html via le navigateur TV
4. Mettre en favori pour accès rapide

### Option 2 : En ligne
1. Héberger sur GitHub Pages (gratuit)
2. Ou Netlify/Vercel pour déploiement automatique
3. URL personnalisée possible (menu.restaurant.be)
4. Mise à jour via Git ou interface web

## Optimisations performances

### Pour TV/Écran
- Préchargement des assets
- Animations GPU (transform, opacity)
- Pas d'images lourdes (icônes SVG)
- Code minifié en production

### Pour mobile
- Lazy loading des sections
- Touch optimisé
- Taille minimale des tapable areas (48px)
- Font-size minimum 16px pour éviter zoom

## Maintenance hebdomadaire

### Processus simple
1. **Lundi matin** : Définir les 8 plats de la semaine
2. **Utiliser l'éditeur** : Saisir les informations
3. **Sauvegarder** : Télécharger le nouveau menu.json
4. **Déployer** : 
   - Hors ligne : Copier sur clé USB
   - En ligne : Upload via FTP/Git
5. **Vérifier** : Contrôle visuel sur l'écran

### Checklist de validation
- [ ] 8 plats correctement affichés
- [ ] Prix corrects
- [ ] Allergènes mentionnés
- [ ] Dates de la semaine à jour
- [ ] Messages promotionnels actualisés
- [ ] Test sur mobile/tablette si en ligne

## Évolutions futures possibles

1. **Intégration API** : Connexion au système de caisse
2. **QR Code** : Pour accès mobile direct
3. **Commande en ligne** : Transformation en mini-app
4. **Statistiques** : Plats les plus consultés
5. **Photos des plats** : Si bande passante suffisante
6. **Système de notation** : Feedback clients
7. **Mode sombre/clair** : Selon heure de la journée
8. **Alertes stock** : Mise à jour temps réel des ruptures

## Exemple de prompt pour Claude Code

```
Crée une application web responsive pour afficher le menu hebdomadaire d'un restaurant traiteur avec les spécifications suivantes :

STRUCTURE :
- Lecture d'un fichier menu.json contenant 8 plats renouvelés chaque semaine
- Architecture : index.html, style.css, script.js, menu.json

DESIGN :
- Layout responsive : 
  * TV (1920x1080) : grille 2×4 
  * Tablette : grille adaptative
  * Mobile : liste verticale avec swipe
- Thème sombre élégant (#1a1a1a) avec excellente lisibilité
- Police sans-serif moderne, tailles adaptatives (minimum 16px mobile)
- Cartes pour chaque plat avec nom, description, prix et tags

FONCTIONNALITÉS :
- Horloge temps réel dans l'en-tête
- Météo locale (API si connecté, sinon icône statique)
- Badge "NOUVEAU" animé (pulse) pour nouveaux plats
- Indicateur "ÉPUISÉ" si rupture
- Affichage des allergènes
- Messages défilants en pied de page
- Rotation automatique des plats (focus toutes les 15s) en mode TV
- Swipe navigation sur mobile/tablette

TECHNIQUE :
- JavaScript vanilla (pas de framework)
- localStorage pour cache hors-ligne
- Animations CSS performantes (transform/opacity)
- Chargement asynchrone du JSON

BONUS :
- Créer aussi editeur.html : interface simple pour éditer les 8 plats et générer le JSON
- Prévoir structure multi-langues (FR/NL/EN)
- Mode sombre/clair selon l'heure

L'application doit être moderne, attractive et parfaitement lisible à 3-4 mètres de distance sur l'écran TV.
```

## Notes importantes

- **Accessibilité** : Contrastes élevés, tailles de police généreuses
- **Fiabilité** : Gestion d'erreurs robuste, fallbacks prévus
- **Simplicité** : Interface intuitive pour modification hebdomadaire
- **Performance** : Optimisé pour hardware TV potentiellement limité
- **Flexibilité** : Facile d'ajouter/retirer des fonctionnalités
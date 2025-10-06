# Configuration de la Météo en Temps Réel

## 🌤️ Obtenir une clé API OpenWeatherMap (GRATUIT)

### Étape 1 : Créer un compte
1. Visitez : https://openweathermap.org/api
2. Cliquez sur "Sign Up" (Inscription)
3. Créez votre compte gratuitement

### Étape 2 : Obtenir votre clé API
1. Une fois connecté, allez dans "API keys"
2. Copiez votre clé API (elle ressemble à : `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

### Étape 3 : Configurer l'application
1. Ouvrez le fichier `script.js`
2. Ligne 7, remplacez la ligne vide par votre clé :
   ```javascript
   WEATHER_API_KEY: 'VOTRE_CLE_API_ICI',
   ```
3. Vous pouvez aussi changer la ville (ligne 8) :
   ```javascript
   WEATHER_CITY: 'Brussels', // ou 'Paris', 'London', etc.
   ```

### Étape 4 : Tester
1. Lancez `DEMARRER.bat`
2. La météo réelle devrait s'afficher après quelques secondes

## 📍 Personnaliser la Localisation

Dans `script.js`, modifiez :
```javascript
WEATHER_CITY: 'Brussels',     // Nom de la ville
WEATHER_COUNTRY: 'BE',         // Code pays (BE=Belgique, FR=France, etc.)
```

## 🎨 Fonctionnalités du Widget Météo

### ✅ Avec API (données réelles)
- 📍 Localisation automatique
- 🌡️ Température actuelle
- 🕐 Prévisions horaires (4 prochaines heures)
- 📅 Prévisions 5 jours (min/max)
- 🎨 Gradient dynamique selon la météo
- 💾 Cache 30 minutes pour économiser les appels API

### ✅ Sans API (données statiques)
- 📍 Localisation par défaut (Bruxelles)
- 🌡️ Température fictive (20°)
- 🕐 Heures dynamiques basées sur l'heure actuelle
- 📅 Prévisions fictives
- 🎨 Design complet fonctionnel

## 🔄 Mise à Jour des Données

La météo se rafraîchit automatiquement :
- ✅ Toutes les 30 minutes (si API configurée)
- ✅ À chaque rechargement de page
- ✅ Cache localStorage pour mode hors ligne

## 🎯 Limites du Plan Gratuit OpenWeatherMap

- ✅ 1000 appels API / jour (largement suffisant)
- ✅ Données mises à jour toutes les 10 minutes
- ✅ Prévisions 5 jours
- ✅ Sans carte bancaire requise

## 🚨 En Cas de Problème

### La météo ne s'affiche pas ?
1. Vérifiez que la clé API est correctement copiée
2. Vérifiez que vous avez une connexion internet
3. Ouvrez la console du navigateur (F12) pour voir les erreurs
4. Attendez 10 minutes après création du compte (activation de la clé)

### Données statiques affichées ?
- C'est normal si aucune clé API n'est configurée
- Le widget fonctionne quand même avec des données d'exemple
- Pour des données réelles, suivez les étapes ci-dessus

## 💡 Conseils

- La clé API est activée sous 10 minutes après création
- Gardez votre clé API privée (ne la partagez pas publiquement)
- Le cache permet de fonctionner hors ligne pendant 30 minutes
- Vous pouvez tester avec n'importe quelle ville du monde

---

**Besoin d'aide ?** Consultez la documentation OpenWeatherMap : https://openweathermap.org/api

═══════════════════════════════════════════════════════════
   SYSTÈME D'AFFICHAGE DIGITAL - RESTAURANT TRAITEUR
═══════════════════════════════════════════════════════════

📋 COMMENT DÉMARRER L'APPLICATION ?
───────────────────────────────────────────────────────────

MÉTHODE 1 : Double-clic sur DEMARRER.bat (RECOMMANDÉ)
   → Double-cliquez sur le fichier "DEMARRER.bat"
   → Un serveur local démarre automatiquement
   → Votre navigateur s'ouvre sur http://localhost:8000
   → Pour arrêter : fermez la fenêtre noire (cmd)

MÉTHODE 2 : Via Python manuellement
   1. Ouvrez une invite de commande dans ce dossier
   2. Tapez : python -m http.server 8000
   3. Ouvrez : http://localhost:8000 dans votre navigateur

MÉTHODE 3 : Extension navigateur (si pas de Python)
   Chrome : Installez "Web Server for Chrome"
   Firefox : Ouvrez directement index.html (Firefox autorise le file://)


📝 COMMENT MODIFIER LE MENU ?
───────────────────────────────────────────────────────────

1. Démarrez l'application (voir ci-dessus)
2. Ouvrez http://localhost:8000/editeur.html
3. Ajoutez/modifiez vos plats (bouton ➕ pour ajouter)
4. Ajoutez des images si vous le souhaitez (📷 Choisir une image)
5. Cliquez sur "💾 Sauvegarder & Prévisualiser"
6. Cliquez sur "⬇️ Télécharger menu.json"
7. Sauvegardez le fichier dans ce même dossier (remplacer l'ancien)
8. Rechargez index.html pour voir les changements


📁 STRUCTURE DES FICHIERS
───────────────────────────────────────────────────────────

DEMARRER.bat    → Lance le serveur local (double-clic)
index.html      → Page d'affichage principale
editeur.html    → Interface pour modifier le menu
menu.json       → Données du menu (à modifier via l'éditeur)
style.css       → Styles de l'affichage
script.js       → Logique de l'affichage
editeur.js      → Logique de l'éditeur
README.txt      → Ce fichier d'aide


🖥️ DÉPLOIEMENT SUR LA TV
───────────────────────────────────────────────────────────

OPTION 1 : Clé USB (Mode hors-ligne)
   1. Copiez TOUS les fichiers sur une clé USB
   2. Insérez la clé dans le port USB de la TV LG
   3. Naviguez vers index.html via le navigateur TV
   4. Mettez en favori pour un accès rapide

OPTION 2 : En ligne (Recommandé)
   1. Hébergez les fichiers sur un serveur web
   2. Ou utilisez GitHub Pages (gratuit)
   3. Accédez à l'URL depuis le navigateur de la TV
   4. Le menu se met à jour automatiquement


❓ PROBLÈMES FRÉQUENTS
───────────────────────────────────────────────────────────

Q: Les plats ne s'affichent pas
A: Vérifiez que menu.json est bien dans le même dossier
   Utilisez DEMARRER.bat au lieu d'ouvrir index.html directement

Q: Python n'est pas installé
A: Téléchargez depuis https://www.python.org/downloads/
   Ou utilisez Firefox qui autorise le chargement local

Q: Comment ajouter plus de 8 plats ?
A: Utilisez l'éditeur, cliquez sur ➕ autant de fois que nécessaire

Q: L'image ne s'affiche pas
A: Les images sont converties en base64 (incluses dans le JSON)
   Ou utilisez une URL d'image en ligne (https://...)


📞 AIDE SUPPLÉMENTAIRE
───────────────────────────────────────────────────────────

Pour toute question, consultez le fichier CLAUDE.md qui contient
la documentation technique complète du projet.

═══════════════════════════════════════════════════════════

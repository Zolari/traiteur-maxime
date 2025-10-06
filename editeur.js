// Données du menu
let menuData = {
    affichage: {
        type: "1",
        bgColor: "#ffffff"
    },
    restaurant: {
        nom: "Traiteur Maxime",
        logo: "assets/logo.png",
        telephone: "+32 2 123 45 67",
        email: "contact@traiteurmaxime.be"
    },
    semaine: {
        debut: "2025-10-07",
        fin: "2025-10-13",
        numero: 41
    },
    plats: [],
    messages: [
        { texte: "📱 Commandez par SMS au +32 2 123 45 67", priorite: "haute" },
        { texte: "🚚 Livraison gratuite dès 30€", priorite: "normale" },
        { texte: "⏰ Commandez avant 10h pour le midi", priorite: "normale" }
    ],
    horaires: {
        lundi: { ouverture: "11:30", fermeture: "14:30" },
        mardi: { ouverture: "11:30", fermeture: "14:30" },
        mercredi: { ouverture: "11:30", fermeture: "14:30" },
        jeudi: { ouverture: "11:30", fermeture: "14:30" },
        vendredi: { ouverture: "11:30", fermeture: "14:30" },
        samedi: { ferme: true },
        dimanche: { ferme: true }
    }
};

// Initialiser avec 1 plat vide au minimum
if (menuData.plats.length === 0) {
    menuData.plats.push({
        id: 1,
        nom: "",
        description: "",
        prix: 0,
        categorie: "plat",
        tags: [],
        allergenes: [],
        image: "",
        bgColor: "#ffffff",
        colonne: null,
        nouveau: false,
        epuise: false
    });
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    renderPlatEditors();
    loadFormData();
    setupFileInput();

    // Event listener pour le changement de type d'affichage
    const affichageSelect = document.getElementById('affichage-type');
    if (affichageSelect) {
        affichageSelect.addEventListener('change', (e) => {
            toggleAffichage2Options(e.target.value);
        });
    }
});

// Charger depuis localStorage si disponible
function loadFromLocalStorage() {
    const saved = localStorage.getItem('menuEditorData');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.plats && data.plats.length > 0) {
                menuData = data;
            }
        } catch (e) {
            console.error('Erreur lors du chargement des données:', e);
        }
    }
}

// Sauvegarder dans localStorage (SANS les images pour éviter QuotaExceeded)
function saveToLocalStorage() {
    // Créer une copie sans les images
    const dataToSave = JSON.parse(JSON.stringify(menuData));

    // Retirer les images des plats pour le localStorage
    if (dataToSave.plats) {
        dataToSave.plats.forEach(plat => {
            if (plat.image) {
                delete plat.image; // Ne pas sauvegarder les images en localStorage
            }
        });
    }

    localStorage.setItem('menuEditorData', JSON.stringify(dataToSave));
    console.log('Données sauvegardées dans localStorage (sans images)');
}

// === BIBLIOTHÈQUE DE PLATS ===

// Charger la bibliothèque de plats
function getPlatLibrary() {
    const library = localStorage.getItem('platLibrary');
    return library ? JSON.parse(library) : [];
}

// Sauvegarder la bibliothèque
function savePlatLibrary(library) {
    localStorage.setItem('platLibrary', JSON.stringify(library));
}

// Ajouter un plat à la bibliothèque
function savePlatToLibrary(index) {
    // IMPORTANT: Collecter les données du formulaire d'abord !
    collectFormData();

    const plat = menuData.plats[index];
    if (!plat || !plat.nom) {
        alert('Veuillez d\'abord renseigner le nom du plat');
        return;
    }

    // Vérifier que le prix est valide
    if (!plat.prix || plat.prix <= 0) {
        alert('⚠️ Le prix du plat doit être supérieur à 0');
        return;
    }

    // Copier le plat sans l'image (pour éviter quota)
    const platToSave = {
        nom: plat.nom,
        description: plat.description,
        prix: plat.prix,
        categorie: plat.categorie,
        allergenes: plat.allergenes,
        bgColor: plat.bgColor,
        tags: plat.tags,
        savedAt: new Date().toISOString()
    };

    const library = getPlatLibrary();
    library.push(platToSave);
    savePlatLibrary(library);

    alert(`✅ "${plat.nom}" ajouté à la bibliothèque ! (Prix: ${plat.prix}€)`);
}

// Charger un plat depuis la bibliothèque
function loadPlatFromLibrary(index) {
    const library = getPlatLibrary();
    if (library.length === 0) {
        alert('📚 La bibliothèque est vide. Sauvegardez d\'abord des plats !');
        return;
    }

    showLibraryModal(index);
}

// Afficher le modal de la bibliothèque
function showLibraryModal(targetIndex) {
    const library = getPlatLibrary();

    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 2rem;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        width: 90%;
    `;

    let html = `
        <h2 style="margin-bottom: 1.5rem;">📚 Bibliothèque de plats</h2>
        <div style="display: grid; gap: 1rem;">
    `;

    library.forEach((plat, idx) => {
        html += `
            <div style="border: 2px solid #e0e0e0; border-radius: 8px; padding: 1rem; cursor: pointer; transition: all 0.2s;"
                 onmouseover="this.style.borderColor='#667eea'; this.style.background='#f8f9ff';"
                 onmouseout="this.style.borderColor='#e0e0e0'; this.style.background='white';"
                 onclick="applyPlatFromLibrary(${targetIndex}, ${idx}); this.parentElement.parentElement.parentElement.remove();">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <h3 style="margin-bottom: 0.5rem; color: #333;">${plat.nom}</h3>
                        <p style="color: #666; font-size: 0.9rem; margin-bottom: 0.5rem;">${plat.description || ''}</p>
                        <div style="display: flex; gap: 1rem; font-size: 0.85rem; color: #888;">
                            <span>💰 ${plat.prix}€</span>
                            ${plat.categorie ? `<span>🍽️ ${plat.categorie}</span>` : ''}
                        </div>
                    </div>
                    <button onclick="event.stopPropagation(); deletePlatFromLibrary(${idx}); this.parentElement.parentElement.parentElement.parentElement.remove();"
                            style="background: #ef4444; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    html += `<button onclick="this.parentElement.parentElement.remove();"
                     style="margin-top: 1.5rem; width: 100%; padding: 0.75rem; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem;">
                Fermer
            </button>`;

    content.innerHTML = html;
    modal.appendChild(content);
    document.body.appendChild(modal);
}

// Appliquer un plat depuis la bibliothèque
function applyPlatFromLibrary(targetIndex, libraryIndex) {
    const library = getPlatLibrary();
    const plat = library[libraryIndex];

    // Appliquer les valeurs au plat cible
    menuData.plats[targetIndex] = {
        ...menuData.plats[targetIndex],
        nom: plat.nom,
        description: plat.description,
        prix: plat.prix,
        categorie: plat.categorie,
        allergenes: plat.allergenes,
        bgColor: plat.bgColor,
        tags: plat.tags
    };

    // Rafraîchir l'affichage
    renderPlatEditors();
    saveToLocalStorage();

    alert(`✅ Plat "${plat.nom}" chargé !`);
}

// Supprimer un plat de la bibliothèque
function deletePlatFromLibrary(index) {
    if (!confirm('Supprimer ce plat de la bibliothèque ?')) return;

    const library = getPlatLibrary();
    library.splice(index, 1);
    savePlatLibrary(library);

    alert('✅ Plat supprimé de la bibliothèque');
}

// Exporter la bibliothèque vers un fichier JSON
function exportPlatLibrary() {
    const library = getPlatLibrary();
    if (library.length === 0) {
        alert('La bibliothèque est vide !');
        return;
    }

    const dataStr = JSON.stringify(library, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `bibliotheque-plats-${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
    alert('✅ Bibliothèque exportée !');
}

// Importer une bibliothèque depuis un fichier JSON
function importPlatLibrary() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedLibrary = JSON.parse(event.target.result);

                if (!Array.isArray(importedLibrary)) {
                    alert('❌ Fichier invalide !');
                    return;
                }

                // Fusionner avec la bibliothèque existante
                const currentLibrary = getPlatLibrary();
                const mergedLibrary = [...currentLibrary, ...importedLibrary];
                savePlatLibrary(mergedLibrary);

                alert(`✅ ${importedLibrary.length} plat(s) importé(s) !`);
            } catch (error) {
                alert('❌ Erreur lors de la lecture du fichier');
                console.error(error);
            }
        };

        reader.readAsText(file);
    };

    input.click();
}

// Rendre les éditeurs de plats
function renderPlatEditors() {
    const container = document.getElementById('plats-container');
    container.innerHTML = '';

    menuData.plats.forEach((plat, index) => {
        const editor = createPlatEditor(plat, index);
        container.appendChild(editor);
    });

    // Ajouter le bouton "Ajouter un plat"
    const addButton = document.createElement('button');
    addButton.className = 'btn btn-primary btn-add-plat';
    addButton.innerHTML = '➕ Ajouter un plat';
    addButton.onclick = addNewPlat;
    container.appendChild(addButton);
}

// Créer un éditeur de plat
function createPlatEditor(plat, index) {
    const div = document.createElement('div');
    div.className = 'plat-editor';

    div.innerHTML = `
        <div class="plat-header">
            <span class="plat-number">Plat ${index + 1}</span>
            <div style="display: flex; gap: 0.5rem;">
                <button class="btn" style="background: #10b981; padding: 0.5rem 1rem; font-size: 0.85rem;" onclick="savePlatToLibrary(${index})">💾 Sauvegarder</button>
                <button class="btn" style="background: #667eea; padding: 0.5rem 1rem; font-size: 0.85rem;" onclick="loadPlatFromLibrary(${index})">📚 Charger</button>
                <button class="btn-delete" onclick="deletePlat(${index})">🗑️ Supprimer</button>
            </div>
        </div>

        <div class="form-group">
            <label>Image du plat</label>
            <div class="image-upload-container">
                <input type="text" id="plat-${index}-image" value="${plat.image || ''}" placeholder="Ex: images/sandwich-jambon.jpg" style="margin-top: 0.5rem;">
                <small style="color: #6c757d; font-size: 0.85rem; margin-top: 0.25rem; display: block;">
                    ℹ️ Entrez le chemin relatif vers votre image (ex: images/plat.jpg). Placez vos images dans un dossier à la racine du projet.
                </small>
                ${plat.image && !plat.image.startsWith('data:') ? `<img src="${plat.image}" class="image-preview" alt="Aperçu" onerror="this.style.display='none'">` : ''}
            </div>
        </div>

        <div class="form-group">
            <label>Nom du plat *</label>
            <input type="text" id="plat-${index}-nom" value="${plat.nom}" placeholder="Ex: Bœuf Bourguignon">
        </div>

        <div class="form-group">
            <label>Description *</label>
            <textarea id="plat-${index}-description" placeholder="Ex: Mijoté 6 heures avec carottes et pommes de terre fondantes">${plat.description}</textarea>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>Prix (€) *</label>
                <input type="number" id="plat-${index}-prix" value="${plat.prix}" step="0.1" min="0">
            </div>
            <div class="form-group">
                <label>Catégorie</label>
                <select id="plat-${index}-categorie">
                    <option value="plat" ${plat.categorie === 'plat' ? 'selected' : ''}>Plat</option>
                    <option value="entree" ${plat.categorie === 'entree' ? 'selected' : ''}>Entrée</option>
                    <option value="dessert" ${plat.categorie === 'dessert' ? 'selected' : ''}>Dessert</option>
                </select>
            </div>
        </div>

        <div class="form-group">
            <label>Colonne (pour Affichage 3 - Sandwich)</label>
            <select id="plat-${index}-colonne">
                <option value="">Auto (répartition automatique)</option>
                <option value="1" ${plat.colonne === 1 ? 'selected' : ''}>Colonne 1 - Nos Sandwichs</option>
                <option value="2" ${plat.colonne === 2 ? 'selected' : ''}>Colonne 2 - Nos Spécialités</option>
                <option value="3" ${plat.colonne === 3 ? 'selected' : ''}>Colonne 3 - Nos Desserts</option>
                <option value="4" ${plat.colonne === 4 ? 'selected' : ''}>Colonne 3 (bas) - Extras</option>
            </select>
            <small style="color: #6c757d; font-size: 0.85rem; margin-top: 0.25rem; display: block;">
                ℹ️ Colonne 3 est divisée en 2 : "Nos Desserts" en haut, "Extras" en bas (prix crudités, tailles, etc.)
            </small>
        </div>

        <div class="form-group">
            <label>Allergènes (séparés par des virgules)</label>
            <input type="text" id="plat-${index}-allergenes" value="${plat.allergenes ? plat.allergenes.join(', ') : ''}" placeholder="Ex: gluten, lait, œuf">
        </div>

        <div class="form-group">
            <label>Couleur de fond (pour affichage 2)</label>
            <input type="color" id="plat-${index}-bgcolor" value="${plat.bgColor || '#ffffff'}">
        </div>

        <div class="checkbox-group">
            <label>
                <input type="checkbox" id="plat-${index}-vegetarien" ${plat.tags && plat.tags.includes('vegetarien') ? 'checked' : ''}>
                🌱 Végétarien
            </label>
            <label>
                <input type="checkbox" id="plat-${index}-sans-gluten" ${plat.tags && plat.tags.includes('sans-gluten') ? 'checked' : ''}>
                Ⓖ Sans gluten
            </label>
            <label>
                <input type="checkbox" id="plat-${index}-nouveau" ${plat.nouveau ? 'checked' : ''}>
                ⭐ Nouveau
            </label>
            <label>
                <input type="checkbox" id="plat-${index}-epuise" ${plat.epuise ? 'checked' : ''}>
                ❌ Épuisé
            </label>
        </div>
    `;

    return div;
}

// Ajouter un nouveau plat
function addNewPlat() {
    const newPlat = {
        id: menuData.plats.length + 1,
        nom: "",
        description: "",
        prix: 0,
        categorie: "plat",
        tags: [],
        allergenes: [],
        image: "",
        bgColor: "#ffffff",
        colonne: null,
        nouveau: false,
        epuise: false
    };

    menuData.plats.push(newPlat);
    renderPlatEditors();
    saveToLocalStorage();
}

// Supprimer un plat
function deletePlat(index) {
    if (menuData.plats.length <= 1) {
        alert('Vous devez avoir au moins un plat dans le menu.');
        return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer ce plat ?')) {
        menuData.plats.splice(index, 1);
        // Réassigner les IDs
        menuData.plats.forEach((plat, i) => {
            plat.id = i + 1;
        });
        renderPlatEditors();
        saveToLocalStorage();
    }
}

// Gérer l'upload d'image
// NOTE: Fonction désactivée - on n'utilise plus l'upload base64
// Les images doivent être référencées par leur chemin (ex: images/plat.jpg)
function handleImageUpload(index, event) {
    alert('⚠️ Upload désactivé. Veuillez entrer le chemin de votre image dans le champ texte.\n\nExemple: images/sandwich-jambon.jpg\n\nPlacez vos images dans un dossier à la racine du projet.');
}

// Charger les données du formulaire
function loadFormData() {
    // Affichage
    if (menuData.affichage) {
        document.getElementById('affichage-type').value = menuData.affichage.type || "1";
    }

    // Restaurant
    document.getElementById('restaurant-nom').value = menuData.restaurant.nom;
    document.getElementById('restaurant-tel').value = menuData.restaurant.telephone;
    document.getElementById('restaurant-email').value = menuData.restaurant.email;

    // Semaine
    document.getElementById('semaine-numero').value = menuData.semaine.numero;
    document.getElementById('semaine-debut').value = menuData.semaine.debut;
    document.getElementById('semaine-fin').value = menuData.semaine.fin;
}

// Afficher/masquer les options de l'affichage 2
function toggleAffichage2Options(type) {
    const options = document.getElementById('affichage2-options');
    if (options) {
        options.style.display = type === "2" ? 'block' : 'none';
    }
}

// Collecter les données du formulaire
function collectFormData() {
    // Affichage
    if (!menuData.affichage) menuData.affichage = {};
    menuData.affichage.type = document.getElementById('affichage-type').value;

    // Informations du restaurant
    menuData.restaurant.nom = document.getElementById('restaurant-nom').value;
    menuData.restaurant.telephone = document.getElementById('restaurant-tel').value;
    menuData.restaurant.email = document.getElementById('restaurant-email').value;

    // Informations de la semaine
    menuData.semaine.numero = parseInt(document.getElementById('semaine-numero').value);
    menuData.semaine.debut = document.getElementById('semaine-debut').value;
    menuData.semaine.fin = document.getElementById('semaine-fin').value;

    // Plats
    menuData.plats.forEach((plat, index) => {
        plat.nom = document.getElementById(`plat-${index}-nom`).value;
        plat.description = document.getElementById(`plat-${index}-description`).value;

        // Prix : mieux gérer les valeurs vides/invalides
        const prixInput = document.getElementById(`plat-${index}-prix`);
        const prixValue = parseFloat(prixInput.value);
        plat.prix = !isNaN(prixValue) && prixValue >= 0 ? prixValue : plat.prix || 0;

        plat.categorie = document.getElementById(`plat-${index}-categorie`).value;
        plat.image = document.getElementById(`plat-${index}-image`).value;
        plat.bgColor = document.getElementById(`plat-${index}-bgcolor`).value;

        // Colonne pour affichage 3 (Sandwich)
        const colonneValue = document.getElementById(`plat-${index}-colonne`).value;
        plat.colonne = colonneValue ? parseInt(colonneValue) : null;

        // Allergènes
        const allergenesText = document.getElementById(`plat-${index}-allergenes`).value;
        plat.allergenes = allergenesText
            .split(',')
            .map(a => a.trim())
            .filter(a => a.length > 0);

        // Tags
        plat.tags = [];
        if (document.getElementById(`plat-${index}-vegetarien`).checked) {
            plat.tags.push('vegetarien');
        }
        if (document.getElementById(`plat-${index}-sans-gluten`).checked) {
            plat.tags.push('sans-gluten');
        }

        // Nouveau et épuisé
        plat.nouveau = document.getElementById(`plat-${index}-nouveau`).checked;
        plat.epuise = document.getElementById(`plat-${index}-epuise`).checked;
    });

    return menuData;
}

// Sauvegarder et prévisualiser
async function saveAndPreview() {
    try {
        // Collecter les données
        const data = collectFormData();

        // Valider
        if (!validateMenu(data)) {
            alert('Veuillez remplir tous les champs obligatoires (nom, description, prix) pour chaque plat.');
            return;
        }

        // Sauvegarder dans localStorage
        saveToLocalStorage();

        // Sauvegarder dans menu.json
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });

        // Utiliser l'API File System Access si disponible
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: 'menu.json',
                types: [{
                    description: 'JSON Files',
                    accept: { 'application/json': ['.json'] }
                }]
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();

            // Afficher message de succès
            showSuccessMessage();

            // Recharger la prévisualisation
            reloadPreview();
        } catch (e) {
            // Si l'API n'est pas supportée ou annulée, on continue sans erreur
            console.log('Sauvegarde fichier annulée ou non supportée');

            // Afficher message de succès quand même
            showSuccessMessage();

            // Recharger la prévisualisation
            reloadPreview();
        }
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        alert('Erreur lors de la sauvegarde du menu.');
    }
}

// Télécharger le JSON
function downloadJSON() {
    const data = collectFormData();

    if (!validateMenu(data)) {
        alert('Veuillez remplir tous les champs obligatoires (nom, description, prix) pour chaque plat.');
        return;
    }

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'menu.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showSuccessMessage();
}

// Valider le menu
function validateMenu(data) {
    for (let plat of data.plats) {
        if (!plat.nom || !plat.description || plat.prix <= 0) {
            return false;
        }
    }
    return true;
}

// Afficher message de succès
function showSuccessMessage() {
    const message = document.getElementById('success-message');
    message.classList.add('show');
    setTimeout(() => {
        message.classList.remove('show');
    }, 3000);
}

// Recharger la prévisualisation
function reloadPreview() {
    const iframe = document.getElementById('preview');
    iframe.src = iframe.src;
}

// Importer un menu JSON
function importMenu() {
    document.getElementById('file-input').click();
}

// Configuration de l'input file
function setupFileInput() {
    const fileInput = document.getElementById('file-input');
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            // Valider la structure
            if (!data.plats || !Array.isArray(data.plats)) {
                throw new Error('Structure JSON invalide');
            }

            // S'assurer que chaque plat a un champ image et bgColor
            data.plats.forEach(plat => {
                if (!plat.image) {
                    plat.image = "";
                }
                if (!plat.bgColor) {
                    plat.bgColor = "#ffffff";
                }
            });

            // S'assurer que le champ affichage existe
            if (!data.affichage) {
                data.affichage = {
                    type: "1",
                    bgColor: "#ffffff"
                };
            }

            // Charger les données
            menuData = data;
            renderPlatEditors();
            loadFormData();
            saveToLocalStorage();

            alert('Menu importé avec succès !');
        } catch (error) {
            console.error('Erreur lors de l\'import:', error);
            alert('Erreur lors de l\'import du fichier JSON. Vérifiez le format.');
        }

        // Réinitialiser l'input
        fileInput.value = '';
    });
}

// Auto-sauvegarde toutes les 30 secondes
setInterval(() => {
    collectFormData();
    saveToLocalStorage();
}, 30000);

// Sauvegarder avant de quitter
window.addEventListener('beforeunload', () => {
    collectFormData();
    saveToLocalStorage();
});

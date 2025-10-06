// Configuration
const CONFIG = {
    ROTATION_INTERVAL: 15000, // 15 secondes
    WEATHER_CACHE_DURATION: 1800000, // 30 minutes
    MENU_CACHE_KEY: 'menuData',
    WEATHER_CACHE_KEY: 'weatherData',
    WEATHER_API_KEY: '', // À remplir avec votre clé API OpenWeatherMap (https://openweathermap.org/api)
    WEATHER_CITY: 'Brussels', // Ville par défaut
    WEATHER_COUNTRY: 'BE', // Code pays (BE pour Belgique)
};

// État de l'application
let menuData = null;
let currentFocusIndex = 0;
let rotationInterval = null;
let isOnline = navigator.onLine;

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    updateClock();
    setInterval(updateClock, 1000);
    checkOnlineStatus();
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
});

// Initialisation de l'application
async function initApp() {
    try {
        await loadMenu();
        if (menuData) {
            renderMenu();
            updateHeaderInfo();
            updateFooterInfo();
            updateStatus();
            startAutoplay();
            loadWeather();
        }
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        loadCachedMenu();
    }
}

// Chargement du menu
async function loadMenu() {
    try {
        const response = await fetch('menu.json');
        if (!response.ok) throw new Error('Erreur de chargement du menu');

        menuData = await response.json();

        // Cache en localStorage
        localStorage.setItem(CONFIG.MENU_CACHE_KEY, JSON.stringify(menuData));

        return menuData;
    } catch (error) {
        console.error('Erreur:', error);
        throw error;
    }
}

// Chargement du menu depuis le cache
function loadCachedMenu() {
    const cached = localStorage.getItem(CONFIG.MENU_CACHE_KEY);
    if (cached) {
        menuData = JSON.parse(cached);
        renderMenu();
        updateHeaderInfo();
        updateFooterInfo();
        updateStatus();
        startAutoplay();
        showOfflineIndicator();
    }
}

// Affichage du menu
function renderMenu() {
    const grid = document.getElementById('plats-grid');
    if (!grid || !menuData || !menuData.plats) return;

    // Détecter le type d'affichage
    const affichageType = menuData.affichage?.type || "1";

    // Ajouter classe au body pour gérer l'affichage
    document.body.className = `affichage-${affichageType}`;

    if (affichageType === "2") {
        renderAffichage2();
    } else if (affichageType === "3") {
        renderAffichage3();
    } else {
        renderAffichage1();
    }
}

// Affichage 1 - Grille de cartes (classique)
function renderAffichage1() {
    const grid = document.getElementById('plats-grid');
    grid.innerHTML = '';
    grid.className = 'plats-grid';

    menuData.plats.forEach((plat, index) => {
        const card = createPlatCard(plat, index);
        grid.appendChild(card);
    });
}

// Affichage 2 - Colonnes défilantes
function renderAffichage2() {
    const grid = document.getElementById('plats-grid');
    grid.innerHTML = '';
    grid.className = 'plats-carousel';

    menuData.plats.forEach((plat, index) => {
        const column = createColumnCard(plat, index);
        grid.appendChild(column);
    });

    // Forcer un repaint immédiat
    setTimeout(() => {
        const columns = grid.querySelectorAll('.column-card');
        columns.forEach(col => {
            col.style.opacity = '1';
            col.offsetHeight; // Force reflow
        });
    }, 0);

    // Démarrer le défilement automatique
    startCarousel();
}

// Affichage 3 - Mode Sandwich
function renderAffichage3() {
    const grid = document.getElementById('plats-grid');
    grid.innerHTML = '';
    grid.className = 'sandwich-layout';

    // Créer la structure en 3 lignes
    const container = document.createElement('div');
    container.className = 'sandwich-container';

    // Ligne 1 : Header (logo, date/heure, météo)
    const header = document.createElement('div');
    header.className = 'sandwich-header';
    header.innerHTML = `
        <div class="sandwich-header-left">
            <img src="logo-maxime-h.svg" alt="Logo" class="sandwich-logo" onerror="this.style.display='none'">
        </div>
        <div class="sandwich-header-center">
            <div id="sandwich-time" class="sandwich-time"></div>
            <div id="sandwich-date" class="sandwich-date"></div>
        </div>
        <div class="sandwich-header-right">
            <div id="sandwich-weather" class="sandwich-weather">
                <span class="weather-location">📍 Liège</span>
                <span class="weather-icon">${getWeatherIconSVG(800)}</span>
                <span class="weather-temp">20°</span>
            </div>
        </div>
    `;
    container.appendChild(header);

    // Mettre à jour l'heure/date pour l'affichage 3
    updateSandwichClock();

    // Ligne 2 : Corps (3 colonnes, mais colonne 3 divisée en 2 sections)
    const body = document.createElement('div');
    body.className = 'sandwich-body';

    // Grouper les plats par colonnes (4 sections : 1, 2, 3=desserts, 4=extras)
    const sections = [
        { title: 'Nos Sandwichs', colonne: 1, plats: [] },
        { title: 'Nos Spécialités', colonne: 2, plats: [] },
        { title: 'Nos Desserts', colonne: 3, plats: [] },
        { title: 'Extras', colonne: 4, plats: [] }
    ];

    // Répartir les plats dans les sections selon leur champ "colonne"
    menuData.plats.forEach((plat, index) => {
        // Si le plat a un champ "colonne" (1, 2, 3 ou 4), l'utiliser
        // Sinon, répartir automatiquement avec modulo 3 (colonnes 1-3 seulement)
        const colonneIndex = plat.colonne ? plat.colonne - 1 : index % 3;

        // S'assurer que l'index est valide (0 à 3)
        const validIndex = Math.max(0, Math.min(3, colonneIndex));
        sections[validIndex].plats.push(plat);
    });

    // Créer les colonnes 1 et 2 normalement
    [0, 1].forEach(sectionIndex => {
        const section = sections[sectionIndex];
        const column = document.createElement('div');
        column.className = 'sandwich-column';

        const columnTitle = document.createElement('h2');
        columnTitle.className = 'sandwich-column-title';
        columnTitle.textContent = section.title;
        column.appendChild(columnTitle);

        section.plats.forEach(plat => {
            const item = createSandwichItem(plat);
            column.appendChild(item);
        });

        body.appendChild(column);
    });

    // Créer la colonne 3 avec 2 sections (Desserts + Extras)
    const column3 = document.createElement('div');
    column3.className = 'sandwich-column sandwich-column-split';

    // Section Desserts
    const dessertsSection = document.createElement('div');
    dessertsSection.className = 'sandwich-section';

    const dessertsTitle = document.createElement('h2');
    dessertsTitle.className = 'sandwich-column-title';
    dessertsTitle.textContent = sections[2].title;
    dessertsSection.appendChild(dessertsTitle);

    sections[2].plats.forEach(plat => {
        const item = createSandwichItem(plat);
        dessertsSection.appendChild(item);
    });

    column3.appendChild(dessertsSection);

    // Section Extras
    const extrasSection = document.createElement('div');
    extrasSection.className = 'sandwich-section';

    const extrasTitle = document.createElement('h2');
    extrasTitle.className = 'sandwich-column-title';
    extrasTitle.textContent = sections[3].title;
    extrasSection.appendChild(extrasTitle);

    sections[3].plats.forEach(plat => {
        const item = createSandwichItem(plat);
        extrasSection.appendChild(item);
    });

    column3.appendChild(extrasSection);
    body.appendChild(column3);

    container.appendChild(body);

    // Ligne 3 : Footer (infos)
    const footer = document.createElement('div');
    footer.className = 'sandwich-footer';

    // Formater les dates pour le footer
    const dateDebut = menuData.semaine?.debut ? formatDate(menuData.semaine.debut) : '';
    const dateFin = menuData.semaine?.fin ? formatDate(menuData.semaine.fin) : '';
    const semaineText = menuData.semaine?.numero
        ? `Semaine ${menuData.semaine.numero} (${dateDebut} - ${dateFin})`
        : '';

    footer.innerHTML = `
        <div class="sandwich-footer-content">
            <span>${menuData.messages?.[0]?.texte || 'Bienvenue'}</span>
            <span>${semaineText}</span>
            <span>${menuData.restaurant?.email || ''}</span>
        </div>
    `;
    container.appendChild(footer);

    grid.appendChild(container);
}

// Créer un item sandwich (utilisé dans l'affichage 3)
function createSandwichItem(plat) {
    const item = document.createElement('div');
    item.className = 'sandwich-item';

    // Image (si présente)
    const imageHTML = plat.image
        ? `<img src="${plat.image}" alt="${plat.nom}" class="sandwich-item-image" onerror="this.src=''; this.classList.add('error')">`
        : '<div class="sandwich-item-image-placeholder">🍽️</div>';

    item.innerHTML = `
        ${imageHTML}
        <div class="sandwich-item-content">
            <div class="sandwich-item-name">${plat.nom}</div>
            <div class="sandwich-item-description">${plat.description || ''}</div>
        </div>
        <div class="sandwich-item-price">${plat.prix.toFixed(2)} €</div>
    `;

    return item;
}

// Création d'une carte de plat
function createPlatCard(plat, index) {
    const card = document.createElement('div');
    card.className = 'plat-card';
    card.dataset.index = index;

    if (plat.epuise) {
        card.classList.add('epuise');
    }

    // Image (si présente)
    if (plat.image) {
        const img = document.createElement('img');
        img.className = 'plat-image';
        img.src = plat.image;
        img.alt = plat.nom;
        img.onerror = function() {
            this.style.display = 'none';
        };
        card.appendChild(img);
    }

    // Header
    const header = document.createElement('div');
    header.className = 'plat-header';

    const nom = document.createElement('h2');
    nom.className = 'plat-nom';
    nom.textContent = plat.nom;
    header.appendChild(nom);

    card.appendChild(header);

    // Badges
    const badges = document.createElement('div');
    badges.className = 'badges';

    if (plat.nouveau) {
        const badgeNew = createBadge('NOUVEAU', 'nouveau');
        badges.appendChild(badgeNew);
    }

    if (plat.epuise) {
        const badgeEpuise = createBadge('ÉPUISÉ', 'epuise');
        badges.appendChild(badgeEpuise);
    }

    if (plat.tags && plat.tags.includes('vegetarien')) {
        const badgeVeg = createBadge('🌱 Végétarien', 'vegetarien');
        badges.appendChild(badgeVeg);
    }

    card.appendChild(badges);

    // Description
    const description = document.createElement('p');
    description.className = 'plat-description';
    description.textContent = plat.description;
    card.appendChild(description);

    // Footer
    const footer = document.createElement('div');
    footer.className = 'plat-footer';

    const prix = document.createElement('div');
    prix.className = 'plat-prix';
    prix.textContent = `${plat.prix.toFixed(2)} €`;
    footer.appendChild(prix);

    // Allergènes
    if (plat.allergenes && plat.allergenes.length > 0) {
        const allergenes = document.createElement('div');
        allergenes.className = 'allergenes';

        plat.allergenes.forEach(allergene => {
            const span = document.createElement('span');
            span.className = 'allergene';
            span.textContent = allergene;
            allergenes.appendChild(span);
        });

        footer.appendChild(allergenes);
    }

    card.appendChild(footer);

    // Événements tactiles pour mobile/tablette
    if ('ontouchstart' in window) {
        card.addEventListener('click', () => handleCardClick(index));
    }

    return card;
}

// Création d'une colonne pour l'affichage 2 - VERSION INNERHTML
function createColumnCard(plat, index) {
    const column = document.createElement('div');
    column.className = 'column-card';

    // Styles inline avec dégradé transparent (mix option 2 + 3)
    const bgColor = plat.bgColor || '#ffffff';

    // Convertir hex en rgba
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Dégradé de 25% d'opacité vers transparent
    column.style.background = `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.25) 0%, rgba(${r}, ${g}, ${b}, 0.05) 70%, rgba(255, 255, 255, 0) 100%)`;
    column.style.minWidth = '25%';
    column.style.padding = '2rem';

    // Image (si présente)
    let imageHTML = '';
    if (plat.image) {
        imageHTML = `<img class="column-image" src="${plat.image}" alt="${plat.nom}" onerror="this.style.display='none'">`;
    }

    // Créer tout le contenu avec innerHTML
    column.innerHTML = `
        ${imageHTML}
        <h2 class="column-title">${plat.nom}</h2>
        <div class="column-divider"></div>
        <p class="column-description">${plat.description}</p>
        <div class="column-price">${plat.prix.toFixed(2)} €</div>
    `;

    console.log('Colonne créée:', plat.nom, '- bg:', plat.bgColor);

    return column;
}

// Création d'un badge
function createBadge(text, type) {
    const badge = document.createElement('span');
    badge.className = `badge ${type}`;
    badge.textContent = text;
    return badge;
}

// Gestion du clic sur une carte (mobile/tablette)
function handleCardClick(index) {
    stopRotation();
    focusCard(index);
    setTimeout(() => startRotation(), 5000);
}

// Mise à jour de l'en-tête
function updateHeaderInfo() {
    // Le logo est maintenant directement dans le HTML
    return;
}

// Mise à jour du pied de page
function updateFooterInfo() {
    if (!menuData) return;

    // Informations de semaine
    const weekInfo = document.getElementById('week-info');
    if (weekInfo && menuData.semaine) {
        weekInfo.textContent = `Menu de la semaine ${menuData.semaine.numero} (${formatDate(menuData.semaine.debut)} - ${formatDate(menuData.semaine.fin)})`;
    }

    // Informations de contact
    const contactInfo = document.getElementById('contact-info');
    if (contactInfo && menuData.restaurant) {
        contactInfo.textContent = `📞 ${menuData.restaurant.telephone} | 📧 ${menuData.restaurant.email}`;
    }

    // Messages défilants
    const marquee = document.getElementById('marquee');
    if (marquee && menuData.messages) {
        marquee.innerHTML = '';

        // Dupliquer les messages pour un défilement continu
        const messages = [...menuData.messages, ...menuData.messages];

        messages.forEach(message => {
            const item = document.createElement('span');
            item.className = `marquee-item ${message.priorite}`;
            item.textContent = message.texte;
            marquee.appendChild(item);
        });
    }
}

// Mise à jour de l'horloge
function updateClock() {
    const now = new Date();

    // Heure
    const timeEl = document.getElementById('current-time');
    if (timeEl) {
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        timeEl.textContent = `${hours}:${minutes}:${seconds}`;
    }

    // Date
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = now.toLocaleDateString('fr-FR', options);
    }

    // Mise à jour pour affichage 3 (Sandwich)
    updateSandwichClock();

    // Mise à jour du statut ouvert/fermé
    updateStatus();
}

// Mise à jour de l'horloge pour l'affichage Sandwich
function updateSandwichClock() {
    const now = new Date();

    // Heure
    const sandwichTimeEl = document.getElementById('sandwich-time');
    if (sandwichTimeEl) {
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        sandwichTimeEl.textContent = `${hours}:${minutes}:${seconds}`;
    }

    // Date
    const sandwichDateEl = document.getElementById('sandwich-date');
    if (sandwichDateEl) {
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        sandwichDateEl.textContent = now.toLocaleDateString('fr-FR', options);
    }
}

// Mise à jour du statut (ouvert/fermé)
function updateStatus() {
    if (!menuData || !menuData.horaires) return;

    const statusEl = document.getElementById('status');
    if (!statusEl) return;

    const now = new Date();
    const dayName = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'][now.getDay()];
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const todayHours = menuData.horaires[dayName];

    if (todayHours && todayHours.ferme) {
        statusEl.textContent = 'FERMÉ';
        statusEl.className = 'status ferme';
    } else if (todayHours && todayHours.ouverture && todayHours.fermeture) {
        const isOpen = currentTime >= todayHours.ouverture && currentTime <= todayHours.fermeture;
        statusEl.textContent = isOpen ? 'OUVERT' : 'FERMÉ';
        statusEl.className = `status ${isOpen ? 'ouvert' : 'ferme'}`;
    } else {
        statusEl.textContent = '';
        statusEl.className = 'status';
    }
}

// Rotation automatique des plats (mode TV)
function startRotation() {
    if (window.innerWidth < 769) return; // Pas de rotation sur mobile/tablette

    stopRotation();

    rotationInterval = setInterval(() => {
        const totalPlats = menuData.plats.length;
        currentFocusIndex = (currentFocusIndex + 1) % totalPlats;
        focusCard(currentFocusIndex);
    }, CONFIG.ROTATION_INTERVAL);

    // Focus initial
    focusCard(0);
}

// Arrêt de la rotation
function stopRotation() {
    if (rotationInterval) {
        clearInterval(rotationInterval);
        rotationInterval = null;
    }
}

// Focus sur une carte
function focusCard(index) {
    const cards = document.querySelectorAll('.plat-card');
    cards.forEach((card, i) => {
        if (i === index) {
            card.classList.add('focused');
        } else {
            card.classList.remove('focused');
        }
    });
}

// Variables pour le carousel
let carouselInterval = null;
let carouselPosition = 0;

// Démarrage du carousel (affichage 2)
function startCarousel() {
    // IMPORTANT : Arrêter tout carousel en cours
    stopCarousel();

    const carousel = document.querySelector('.plats-carousel');
    if (!carousel) {
        console.log('Carousel: pas de .plats-carousel trouvé');
        return;
    }

    const columns = carousel.querySelectorAll('.column-card');
    const totalColumns = columns.length;

    console.log('=== DÉMARRAGE CAROUSEL ===');
    console.log('Colonnes détectées:', totalColumns);
    console.log('Interval actuel:', carouselInterval);

    // Réinitialiser la position
    carouselPosition = 0;
    carousel.style.transform = 'translateX(0%)';

    // Démarrer le carousel après 1 seconde
    setTimeout(() => {
        // Double-check qu'il n'y a pas déjà un interval
        if (carouselInterval) {
            console.warn('ATTENTION : un interval existe déjà, on le clear');
            clearInterval(carouselInterval);
            carouselInterval = null;
        }
        startCarouselNormal(carousel, totalColumns);
    }, 1000);
}

// Carousel normal - 4 colonnes visibles, slide 1 par 1
function startCarouselNormal(carousel, totalColumns) {
    console.log('=== START CAROUSEL NORMAL ===');
    console.log('Total colonnes:', totalColumns);

    carouselInterval = setInterval(() => {
        carouselPosition++;

        // Maximum : les 4 dernières colonnes visibles
        const maxPosition = totalColumns - 4;

        // Retour au début
        if (carouselPosition > maxPosition) {
            carouselPosition = 0;
        }

        // 25% par colonne (4 colonnes visibles)
        const offset = -(carouselPosition * 25);
        console.log('>>> Slide position: ' + carouselPosition + '/' + maxPosition + ', offset: ' + offset + '%');
        carousel.style.transform = `translateX(${offset}%)`;
    }, 5000); // 5 secondes

    console.log('Interval ID créé:', carouselInterval);
}

// Arrêt du carousel
function stopCarousel() {
    if (carouselInterval) {
        console.log('STOP carousel, interval ID:', carouselInterval);
        clearInterval(carouselInterval);
        carouselInterval = null;
    } else {
        console.log('STOP carousel: aucun interval à arrêter');
    }
}

// Démarrer l'autoplay selon le type d'affichage
function startAutoplay() {
    const affichageType = menuData?.affichage?.type || "1";

    if (affichageType === "2") {
        stopRotation(); // Arrêter la rotation si elle était active
        startCarousel();
    } else if (affichageType === "3") {
        stopRotation(); // Arrêter toutes animations
        stopCarousel();
        // Affichage 3 est statique, pas d'animation
    } else {
        stopCarousel(); // Arrêter le carousel s'il était actif
        startRotation();
    }
}

// Chargement de la météo
async function loadWeather() {
    if (!isOnline) return;

    // Vérifier le cache
    const cached = localStorage.getItem(CONFIG.WEATHER_CACHE_KEY);
    if (cached) {
        const data = JSON.parse(cached);
        if (Date.now() - data.timestamp < CONFIG.WEATHER_CACHE_DURATION) {
            updateWeatherDisplay(data);
            return;
        }
    }

    // Si pas d'API key, afficher météo statique
    if (!CONFIG.WEATHER_API_KEY) {
        const staticData = generateStaticWeather();
        updateWeatherDisplay(staticData);
        return;
    }

    // Charger depuis l'API OpenWeatherMap
    try {
        // API Call pour météo actuelle + prévisions horaires + prévisions 5 jours
        const [current, forecast] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/weather?q=${CONFIG.WEATHER_CITY},${CONFIG.WEATHER_COUNTRY}&appid=${CONFIG.WEATHER_API_KEY}&units=metric&lang=fr`),
            fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${CONFIG.WEATHER_CITY},${CONFIG.WEATHER_COUNTRY}&appid=${CONFIG.WEATHER_API_KEY}&units=metric&lang=fr`)
        ]);

        const currentData = await current.json();
        const forecastData = await forecast.json();

        const weatherData = {
            location: currentData.name,
            temp: Math.round(currentData.main.temp),
            condition: currentData.weather[0].description,
            icon: getWeatherIcon(currentData.weather[0].id),
            weatherId: currentData.weather[0].id, // ID météo pour les icônes SVG
            hourly: forecastData.list.slice(0, 4).map(item => ({
                time: new Date(item.dt * 1000).getHours() + 'h',
                icon: getWeatherIcon(item.weather[0].id),
                temp: Math.round(item.main.temp)
            })),
            daily: getDailyForecast(forecastData.list),
            timestamp: Date.now()
        };

        localStorage.setItem(CONFIG.WEATHER_CACHE_KEY, JSON.stringify(weatherData));
        updateWeatherDisplay(weatherData);
    } catch (error) {
        console.error('Erreur météo:', error);
        const staticData = generateStaticWeather();
        updateWeatherDisplay(staticData);
    }
}

// Générer des données météo statiques
function generateStaticWeather() {
    const now = new Date();
    const currentHour = now.getHours();

    return {
        location: 'Liège',
        temp: 20,
        condition: 'Ensoleillé',
        icon: '☀️',
        weatherId: 800, // ID pour ciel dégagé
        hourly: [
            { time: (currentHour + 1) + 'h', icon: '☀️', temp: 20 },
            { time: (currentHour + 2) + 'h', icon: '🌤️', temp: 21 },
            { time: (currentHour + 3) + 'h', icon: '⛅', temp: 19 },
            { time: (currentHour + 4) + 'h', icon: '☁️', temp: 18 }
        ],
        daily: [
            { day: 'Lun', icon: '☀️', min: 12, max: 22 },
            { day: 'Mar', icon: '🌤️', min: 13, max: 21 },
            { day: 'Mer', icon: '⛅', min: 11, max: 19 },
            { day: 'Jeu', icon: '🌧️', min: 10, max: 16 },
            { day: 'Ven', icon: '☁️', min: 11, max: 18 }
        ]
    };
}

// Obtenir une icône SVG météo en style outline
function getWeatherIconSVG(weatherId) {
    const svgBase = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';

    if (weatherId >= 200 && weatherId < 300) { // Orage
        return `${svgBase}<path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"/><polyline points="13 11 9 17 15 17 11 23"/></svg>`;
    }
    if (weatherId >= 300 && weatherId < 600) { // Pluie/Bruine
        return `${svgBase}<line x1="8" y1="19" x2="8" y2="21"/><line x1="8" y1="13" x2="8" y2="15"/><line x1="16" y1="19" x2="16" y2="21"/><line x1="16" y1="13" x2="16" y2="15"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="12" y1="15" x2="12" y2="17"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/></svg>`;
    }
    if (weatherId >= 600 && weatherId < 700) { // Neige
        return `${svgBase}<path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="8" y1="20" x2="8" y2="20"/><line x1="12" y1="18" x2="12" y2="18"/><line x1="12" y1="22" x2="12" y2="22"/><line x1="16" y1="16" x2="16" y2="16"/><line x1="16" y1="20" x2="16" y2="20"/></svg>`;
    }
    if (weatherId >= 700 && weatherId < 800) { // Brouillard
        return `${svgBase}<path d="M5 20h14M5 16h14M5 12h14"/></svg>`;
    }
    if (weatherId === 800) { // Ciel dégagé
        return `${svgBase}<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
    }
    if (weatherId === 801) { // Peu nuageux
        return `${svgBase}<path d="M22 15a10 10 0 1 1-17.2-7"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="5" y1="5" x2="6.5" y2="6.5"/><line x1="1" y1="12" x2="3" y2="12"/></svg>`;
    }
    if (weatherId >= 802) { // Nuageux
        return `${svgBase}<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>`;
    }
    // Par défaut: soleil
    return `${svgBase}<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
}

// Convertir l'ID météo OpenWeatherMap en emoji (pour compatibilité)
function getWeatherIcon(weatherId) {
    if (weatherId >= 200 && weatherId < 300) return '⛈️'; // Orage
    if (weatherId >= 300 && weatherId < 400) return '🌦️'; // Bruine
    if (weatherId >= 500 && weatherId < 600) return '🌧️'; // Pluie
    if (weatherId >= 600 && weatherId < 700) return '❄️'; // Neige
    if (weatherId >= 700 && weatherId < 800) return '🌫️'; // Brouillard
    if (weatherId === 800) return '☀️'; // Ciel dégagé
    if (weatherId === 801) return '🌤️'; // Peu nuageux
    if (weatherId === 802) return '⛅'; // Partiellement nuageux
    if (weatherId === 803 || weatherId === 804) return '☁️'; // Nuageux
    return '☀️';
}

// Obtenir les prévisions quotidiennes
function getDailyForecast(list) {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const dailyData = {};

    // Grouper par jour
    list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toDateString();

        if (!dailyData[dayKey]) {
            dailyData[dayKey] = {
                day: days[date.getDay()],
                temps: [],
                icons: []
            };
        }

        dailyData[dayKey].temps.push(item.main.temp);
        dailyData[dayKey].icons.push(item.weather[0].id);
    });

    // Extraire les 5 prochains jours
    return Object.values(dailyData).slice(0, 5).map(day => ({
        day: day.day,
        icon: getWeatherIcon(Math.round(day.icons.reduce((a, b) => a + b) / day.icons.length)),
        min: Math.round(Math.min(...day.temps)),
        max: Math.round(Math.max(...day.temps))
    }));
}

// Mise à jour de l'affichage météo pour le Sandwich (affichage 3)
function updateSandwichWeather(data) {
    const sandwichWeatherEl = document.getElementById('sandwich-weather');
    if (!sandwichWeatherEl) return;

    const locationEl = sandwichWeatherEl.querySelector('.weather-location');
    const iconEl = sandwichWeatherEl.querySelector('.weather-icon');
    const tempEl = sandwichWeatherEl.querySelector('.weather-temp');

    if (locationEl) locationEl.textContent = `📍 ${data.location || 'Liège'}`;
    if (iconEl) iconEl.innerHTML = getWeatherIconSVG(data.weatherId || 800);
    if (tempEl) tempEl.textContent = data.temp ? `${data.temp}°` : '20°';
}

// Mise à jour de l'affichage météo
function updateWeatherDisplay(data) {
    // Mettre à jour la météo de l'affichage Sandwich si présent
    updateSandwichWeather(data);

    const weatherEl = document.querySelector('.weather-widget');
    if (!weatherEl) return;

    // Localisation
    const locationEl = weatherEl.querySelector('.weather-location');
    if (locationEl) locationEl.textContent = `📍 ${data.location || 'Bruxelles'}`;

    // Météo actuelle
    const iconEl = weatherEl.querySelector('.weather-icon');
    const tempEl = weatherEl.querySelector('.weather-temp');
    const conditionEl = weatherEl.querySelector('.weather-condition');

    if (iconEl) iconEl.textContent = data.icon || '☀️';
    if (tempEl) tempEl.textContent = data.temp ? `${data.temp}°` : '20°';
    if (conditionEl) conditionEl.textContent = data.condition || 'Ensoleillé';

    // Météo horaire
    const hourlyContainer = weatherEl.querySelector('.weather-hourly');
    if (hourlyContainer && data.hourly) {
        hourlyContainer.innerHTML = data.hourly.map(hour => `
            <div class="hourly-item">
                <div class="hourly-time">${hour.time}</div>
                <div class="hourly-icon">${hour.icon}</div>
                <div class="hourly-temp">${hour.temp}°</div>
            </div>
        `).join('');
    }

    // Prévisions 5 jours
    const dailyContainer = weatherEl.querySelector('.weather-daily');
    if (dailyContainer && data.daily) {
        dailyContainer.innerHTML = data.daily.map(day => `
            <div class="daily-item">
                <div class="daily-day">${day.day}</div>
                <div class="daily-icon">${day.icon}</div>
                <div class="daily-temps">
                    <span class="daily-min">${day.min}°</span>
                    <span class="daily-max">${day.max}°</span>
                </div>
            </div>
        `).join('');
    }

    // Changer le gradient selon la météo
    if (data.condition || data.icon) {
        const condition = (data.condition || '').toLowerCase();
        const icon = data.icon || '';

        if (condition.includes('pluie') || condition.includes('rain') || icon === '🌧️') {
            weatherEl.style.background = 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)';
        } else if (condition.includes('nuage') || condition.includes('cloud') || icon === '☁️' || icon === '⛅') {
            weatherEl.style.background = 'linear-gradient(135deg, #718096 0%, #4a5568 100%)';
        } else if (condition.includes('neige') || condition.includes('snow') || icon === '❄️') {
            weatherEl.style.background = 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%)';
        } else if (icon === '⛈️') {
            weatherEl.style.background = 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
        } else {
            weatherEl.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }
    }
}

// Vérification du statut en ligne/hors ligne
function checkOnlineStatus() {
    isOnline = navigator.onLine;
    if (!isOnline) {
        showOfflineIndicator();
    } else {
        hideOfflineIndicator();
    }
}

function handleOnlineStatus() {
    checkOnlineStatus();
    if (isOnline) {
        initApp(); // Recharger les données si on revient en ligne
    }
}

function showOfflineIndicator() {
    const indicator = document.getElementById('offline-indicator');
    if (indicator) indicator.style.display = 'block';
}

function hideOfflineIndicator() {
    const indicator = document.getElementById('offline-indicator');
    if (indicator) indicator.style.display = 'none';
}

// Formatage de date
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
}

// Support du swipe sur mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    if (!menuData || window.innerWidth > 768) return;

    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe gauche - plat suivant
            currentFocusIndex = (currentFocusIndex + 1) % menuData.plats.length;
        } else {
            // Swipe droite - plat précédent
            currentFocusIndex = (currentFocusIndex - 1 + menuData.plats.length) % menuData.plats.length;
        }
        focusCard(currentFocusIndex);
    }
}

// Pull to refresh sur mobile
let touchStartY = 0;
let isPulling = false;

document.addEventListener('touchstart', e => {
    if (window.scrollY === 0) {
        touchStartY = e.touches[0].clientY;
        isPulling = false;
    }
});

document.addEventListener('touchmove', e => {
    const touchY = e.touches[0].clientY;
    const pullDistance = touchY - touchStartY;

    if (pullDistance > 100 && window.scrollY === 0) {
        isPulling = true;
    }
});

document.addEventListener('touchend', () => {
    if (isPulling) {
        isPulling = false;
        initApp(); // Recharger les données
    }
});

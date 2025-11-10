// Version compatible navigateurs anciens
// Remplace les fonctions async/await par des callbacks

// Remplacement de la fonction loadMenu (async -> callback)
function loadMenuCompat(callback) {
    // Ajouter un cache-busting pour toujours charger la dernière version
    var cacheBuster = new Date().getTime();

    fetch('menu.json?v=' + cacheBuster)
        .then(function(response) {
            if (!response.ok) throw new Error('Erreur de chargement du menu');
            return response.json();
        })
        .then(function(newMenuData) {
            // Vérifier si la version a changé
            var cachedData = localStorage.getItem(CONFIG.MENU_CACHE_KEY);
            if (cachedData) {
                var cachedMenu = JSON.parse(cachedData);
                var cachedVersion = cachedMenu.version || '0.0.0';
                var newVersion = newMenuData.version || '0.0.0';

                if (cachedVersion !== newVersion) {
                    console.log('🔄 Nouvelle version détectée: ' + cachedVersion + ' → ' + newVersion);
                    console.log('🧹 Nettoyage du cache...');
                    localStorage.clear();
                }
            }

            menuData = newMenuData;

            // Cache en localStorage avec la nouvelle version
            localStorage.setItem(CONFIG.MENU_CACHE_KEY, JSON.stringify(menuData));
            console.log('✅ Menu chargé - Version:', menuData.version || 'non spécifiée');
            console.log('📺 Type d\'affichage:', menuData.affichage ? menuData.affichage.type : '1');

            if (callback) callback(null, menuData);
        })
        .catch(function(error) {
            console.error('❌ Erreur de chargement:', error);
            if (callback) callback(error);
        });
}

// Remplacement de initApp (async -> callback)
function initAppCompat() {
    loadMenuCompat(function(error) {
        if (error) {
            console.error('Erreur lors de l\'initialisation:', error);
            loadCachedMenu();
        } else if (menuData) {
            renderMenu();
            updateHeaderInfo();
            updateFooterInfo();
            updateStatus();
            startAutoplay();
            loadWeatherCompat();
            applyBackgroundColor();
            applyPriceColor();
        }
    });
}

// Remplacement de loadWeather (async -> callback)
function loadWeatherCompat() {
    if (!isOnline) return;

    // Vérifier le cache
    var cached = localStorage.getItem(CONFIG.WEATHER_CACHE_KEY);
    if (cached) {
        var data = JSON.parse(cached);
        if (Date.now() - data.timestamp < CONFIG.WEATHER_CACHE_DURATION) {
            updateWeatherDisplay(data);
            return;
        }
    }

    // Si pas d'API key, afficher météo statique
    if (!CONFIG.WEATHER_API_KEY) {
        var staticData = generateStaticWeather();
        updateWeatherDisplay(staticData);
        return;
    }

    // Charger depuis l'API OpenWeatherMap
    var currentUrl = 'https://api.openweathermap.org/data/2.5/weather?q=' + CONFIG.WEATHER_CITY + ',' + CONFIG.WEATHER_COUNTRY + '&appid=' + CONFIG.WEATHER_API_KEY + '&units=metric&lang=fr';
    var forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast?q=' + CONFIG.WEATHER_CITY + ',' + CONFIG.WEATHER_COUNTRY + '&appid=' + CONFIG.WEATHER_API_KEY + '&units=metric&lang=fr';

    fetch(currentUrl)
        .then(function(response) { return response.json(); })
        .then(function(currentData) {
            return fetch(forecastUrl).then(function(response) {
                return response.json();
            }).then(function(forecastData) {
                return { current: currentData, forecast: forecastData };
            });
        })
        .then(function(result) {
            var weatherData = {
                location: result.current.name,
                temp: Math.round(result.current.main.temp),
                condition: result.current.weather[0].description,
                icon: getWeatherIcon(result.current.weather[0].id),
                weatherId: result.current.weather[0].id,
                hourly: result.forecast.list.slice(0, 4).map(function(item) {
                    return {
                        time: new Date(item.dt * 1000).getHours() + 'h',
                        icon: getWeatherIcon(item.weather[0].id),
                        temp: Math.round(item.main.temp)
                    };
                }),
                daily: getDailyForecast(result.forecast.list),
                timestamp: Date.now()
            };

            localStorage.setItem(CONFIG.WEATHER_CACHE_KEY, JSON.stringify(weatherData));
            updateWeatherDisplay(weatherData);
        })
        .catch(function(error) {
            console.error('Erreur météo:', error);
            var staticData = generateStaticWeather();
            updateWeatherDisplay(staticData);
        });
}

// Remplacer l'initialisation
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initAppCompat();
        updateClock();
        setInterval(updateClock, 1000);
        checkOnlineStatus();
        window.addEventListener('online', handleOnlineStatus);
        window.addEventListener('offline', handleOnlineStatus);
    });
} else {
    // DOM déjà chargé
    initAppCompat();
    updateClock();
    setInterval(updateClock, 1000);
    checkOnlineStatus();
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
}

console.log('✅ Script compatible chargé');

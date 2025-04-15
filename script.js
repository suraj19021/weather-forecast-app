const apiKey = 'b73c62ffe24da607a8be6c93e6665007';  // Replace with your OpenWeatherMap API key

const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const weatherDisplay = document.getElementById("weatherDisplay");
const recentCities = document.getElementById("recentCities");
const cityDropdown = document.getElementById("cityDropdown");

// Load recent searches from local storage
function loadRecentCities() {
    const cities = JSON.parse(localStorage.getItem("cities")) || [];
    if (cities.length > 0) {
        recentCities.classList.remove("hidden");
        cityDropdown.innerHTML = cities.map(city => `<option>${city}</option>`).join('');
    }
}

// Save city to local storage
function saveCity(city) {
    let cities = JSON.parse(localStorage.getItem("cities")) || [];
    if (!cities.includes(city)) {
        cities.unshift(city);
        if (cities.length > 5) cities.pop(); 
        localStorage.setItem("cities", JSON.stringify(cities));
    }
}

// Fetch weather data
async function fetchWeather(city) {
    if (!city.trim()) {
        alert("Please enter a valid city name.");
        return;
    }
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("City not found!");
        const data = await response.json();

        saveCity(city);  
        loadRecentCities();  
        displayWeather(data);  
        fetchExtendedForecast(city);  

    } catch (error) {
        alert(error.message);
    }
}

// Display current weather
function displayWeather(data) {
    weatherDisplay.innerHTML = `
        <h2 class="text-xl font-bold">${data.name}, ${data.sys.country}</h2>
        <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather Icon">
        <p>${data.weather[0].description}</p>
        <p>🌡 Temp: ${data.main.temp}°C</p>
        <p>💧 Humidity: ${data.main.humidity}%</p>
        <p>💨 Wind: ${data.wind.speed} m/s</p>
    `;
}

async function fetchExtendedForecast(city) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("City not found!");
        const data = await response.json();

        let forecastHTML = '<h3 class="text-lg font-semibold mt-4">5-Day Forecast</h3>';

        // Create a wrapper for the forecast and set it to display horizontally
        forecastHTML += `<div class="flex overflow-x-auto space-x-4 mt-4">`;

        // Loop through the forecast data and display 1 value per day (every 8th entry, starting from 0)
        for (let i = 0; i <=9; i++) {
            const forecast = data.list[i]; // Use this entry as the daily forecast

            forecastHTML += `
                <div class="border p-2 rounded-lg bg-blue-200 shadow-md w-36">
                    <p><strong>${new Date(forecast.dt_txt).toLocaleDateString()}</strong></p>
                    <img src="http://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="Weather Icon" class="mx-auto">
                    <p>${forecast.weather[0].description}</p>
                    <p>🌡 Temp: ${forecast.main.temp}°C</p>
                    <p>💨 Wind: ${forecast.wind.speed} m/s</p>
                    <p>💧 Humidity: ${forecast.main.humidity}%</p>
                </div>
            `;
        }

        forecastHTML += `</div>`; // Close the horizontal wrapper

        weatherDisplay.innerHTML += forecastHTML; // Display the extended forecast
    } catch (error) {
        alert(error.message);
    }
}
// Event listeners
searchBtn.addEventListener("click", () => {
    const city = cityInput.value;
    fetchWeather(city);
});

cityDropdown.addEventListener("change", (e) => {
    fetchWeather(e.target.value);
});

// Auto-load recent cities
loadRecentCities();

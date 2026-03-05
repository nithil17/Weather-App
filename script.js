const apiKey = "855d79cc47b93b03667d6eae75222844";
// https://github.com/nithil17/Weather-App
const input = document.getElementById("place");
const suggestionsBox = document.getElementById("suggestions");
const submitBtn = document.getElementById("submit");
const currentLocationBtn = document.getElementById("current-location");
const unitToggleBtn = document.getElementById("unit-toggle");
const errorMsg = document.getElementById("error-msg");
const weatherAlert = document.getElementById("weather-alert");
const weatherIcon = document.getElementById("weather-icon");
const conditionText = document.getElementById("condition");
const recentCitiesSelect = document.getElementById("recent-cities");
const recentEmpty = document.getElementById("recent-empty");
let currentTempC = null;
let currentForecastDays = [];
let isFahrenheit = false;

function cToF(celsius) {
  return (celsius * 9) / 5 + 32;
}

function renderTodayTemp() {
  if (currentTempC === null) return;

  const tempValue = isFahrenheit ? cToF(currentTempC) : currentTempC;
  const unit = isFahrenheit ? "°F" : "°C";
  document.getElementById("temp").textContent = `Temp: ${tempValue.toFixed(2)}${unit}`;
}

function formatTemp(tempC) {
  const value = isFahrenheit ? cToF(tempC) : tempC;
  const unit = isFahrenheit ? "°F" : "°C";
  return `${value.toFixed(1)}${unit}`;
}

function renderForecastCards(days) {
  const forecastContainer = document.getElementById("forecast");
  if (!forecastContainer) return;
  forecastContainer.innerHTML = "";

  days.forEach((day) => {
    const div = document.createElement("div");
    div.classList.add("forecast-day");
    div.innerHTML = `
      <h3>${day.date}</h3>
      <div class="forecast-condition">
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}">
        <p>${day.weather[0].description}</p>
      </div>
      <p><span class="metric-icon" aria-hidden="true">&#x1F321;</span> Temp: ${formatTemp(day.main.temp)}</p>
      <p><span class="metric-icon" aria-hidden="true">&#x1F4A7;</span> Humidity: ${day.main.humidity}%</p>
      <p><span class="metric-icon" aria-hidden="true">&#x1F32C;</span> Wind: ${day.wind.speed} m/s</p>
    `;
    forecastContainer.appendChild(div);
  });
}

function showError(message) {
  if (!errorMsg) return;
  errorMsg.textContent = message;
  errorMsg.classList.remove("hidden");
}

function clearError() {
  if (!errorMsg) return;
  errorMsg.textContent = "";
  errorMsg.classList.add("hidden");
}

function updateExtremeAlert(tempC) {
  if (!weatherAlert) return;

  weatherAlert.className =
    "mx-auto mt-2 hidden w-full max-w-2xl rounded-lg border px-3 py-2 text-sm font-semibold";
  weatherAlert.textContent = "";

  if (tempC > 40) {
    weatherAlert.classList.remove("hidden");
    weatherAlert.classList.add("border-red-300", "bg-red-50", "text-red-700");
    weatherAlert.textContent = "Extreme heat alert: temperature is above 40°C.";
    return;
  }

  if (tempC < 5) {
    weatherAlert.classList.remove("hidden");
    weatherAlert.classList.add("border-blue-300", "bg-blue-50", "text-blue-700");
    weatherAlert.textContent = "Cold weather alert: temperature is below 5°C.";
  }
}

function updateWeatherVisuals(weatherEntry) {
  if (!weatherEntry) return;

  if (weatherIcon) {
    const iconCode = weatherEntry.icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.alt = weatherEntry.description || "Weather icon";
  }

  if (conditionText) {
    conditionText.textContent = `Condition: ${weatherEntry.description}`;
  }

  const allClasses = [
    "weather-default",
    "weather-clear",
    "weather-clouds",
    "weather-rain",
    "weather-drizzle",
    "weather-thunderstorm",
    "weather-snow",
  ];

  document.body.classList.remove(...allClasses);
  const mainCondition = (weatherEntry.main || "").toLowerCase();
  const className = allClasses.includes(`weather-${mainCondition}`)
    ? `weather-${mainCondition}`
    : "weather-default";
  document.body.classList.add(className);
}

if (unitToggleBtn) {
  unitToggleBtn.addEventListener("click", function () {
    if (currentTempC === null) {
      showError("Search a city first to use the temperature toggle.");
      return;
    }

    clearError();
    isFahrenheit = !isFahrenheit;
    unitToggleBtn.textContent = isFahrenheit ? "Switch to °C" : "Switch to °F";
    renderTodayTemp();
    renderForecastCards(currentForecastDays);
  });
}

submitBtn.addEventListener("click", function () {
  const city = input.value.trim();

  if (city === "") {
    showError("Please enter a place name.");
    return;
  }

  clearError();
  searchByCity(city);
});

if (currentLocationBtn) {
  currentLocationBtn.addEventListener("click", function () {
    if (!navigator.geolocation) {
      showError("Geolocation is not supported by your browser.");
      return;
    }

    clearError();
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        await fetchWeatherByCoords(lat, lon);
      },
      () => {
        showError("Unable to get your location. Please allow location permission.");
      }
    );
  });
}

function searchByCity(city) {
  getLatLon(apiKey, city);
  saveToHistory(city);
}

function saveToHistory(city) {
  let history = getHistory();
  if (!history.includes(city)) {
    history.push(city);
    localStorage.setItem("searchHistory", JSON.stringify(history));
  }
  loadHistory();
}

function loadHistory() {
  const history = JSON.parse(localStorage.getItem("searchHistory")) || [];
  if (!recentCitiesSelect) return;

  recentCitiesSelect.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Recently searched cities";
  placeholder.selected = true;
  placeholder.disabled = true;
  recentCitiesSelect.appendChild(placeholder);

  history.forEach((city) => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    recentCitiesSelect.appendChild(option);
  });

  const hasHistory = history.length > 0;
  recentCitiesSelect.classList.toggle("hidden", !hasHistory);
  if (recentEmpty) recentEmpty.classList.toggle("hidden", hasHistory);
}

window.onload = loadHistory;

if (recentCitiesSelect) {
  recentCitiesSelect.addEventListener("change", function () {
    const selectedCity = this.value;
    if (!selectedCity) return;
    input.value = selectedCity;
    clearError();
    searchByCity(selectedCity);
  });
}

function getHistory() {
  return JSON.parse(localStorage.getItem("searchHistory")) || [];
}

input.addEventListener("input", function () {
  const value = this.value.toLowerCase();
  const history = getHistory();
  suggestionsBox.innerHTML = "";

  if (value === "") {
    clearError();
    suggestionsBox.style.display = "none";
    return;
  }

  const filtered = history.filter((city) => city.toLowerCase().includes(value));

  filtered.forEach((city) => {
    const div = document.createElement("div");
    div.classList.add("suggestion-item");
    div.textContent = city;

    div.addEventListener("click", function () {
      input.value = city;
      suggestionsBox.style.display = "none";
      searchByCity(city);
    });

    suggestionsBox.appendChild(div);
  });

  suggestionsBox.style.display = filtered.length ? "block" : "none";
});

document.addEventListener("click", function (e) {
  if (!document.querySelector(".search-container").contains(e.target)) {
    suggestionsBox.style.display = "none";
  }
});

async function getLatLon(api, city) {
  document.getElementById("city").textContent = city;

  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${api}`
    );
    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      showError("City not found. Please try a valid city name.");
      return;
    }

    clearError();
    const info = data[0];
    const lat = info.lat;
    const lon = info.lon;

    updateLocationUI(info.name, lat, lon);
    await fetchWeatherByCoords(lat, lon, info.name);
  } catch (error) {
    console.error("Fetch error:", error);
    showError("Something went wrong while fetching city data.");
  }
}

function updateLocationUI(city, lat, lon) {
  document.getElementById("city").textContent = city;
  document.getElementById("lat").textContent = `Lat: ${Number(lat).toFixed(2)}`;
  document.getElementById("lon").textContent = `Lon: ${Number(lon).toFixed(2)}`;
}

async function fetchWeatherByCoords(lat, lon, cityNameFromGeo = "") {
  try {
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const response = await fetch(currentUrl);
    const data = await response.json();

    const cityToShow = cityNameFromGeo || data.name || "Current Location";
    updateLocationUI(cityToShow, lat, lon);
    clearError();

    const vals = data.main;
    currentTempC = vals.temp;
    isFahrenheit = false;
    if (unitToggleBtn) unitToggleBtn.textContent = "Switch to °F";
    renderTodayTemp();
    updateExtremeAlert(currentTempC);
    updateWeatherVisuals(data.weather && data.weather[0]);
    document.getElementById("humidity").textContent = `Humidity: ${vals.humidity}%`;
    document.getElementById("wind").textContent = `Wind: ${data.wind.speed} m/s`;

    await getFiveDayForecast(lat, lon, apiKey);
  } catch (error) {
    console.log("Fetch Error:", error);
    showError("Unable to fetch weather for this location.");
  }
}

async function getFiveDayForecast(lat, lon, key) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok || !Array.isArray(data.list)) {
      throw new Error("Invalid forecast response");
    }
    clearError();
    displayForecast(data.list);
  } catch (error) {
    console.log("Forecast Fetch Error:", error);
    showError("Unable to fetch 5-day forecast right now.");
    const forecastContainer = document.getElementById("forecast");
    if (forecastContainer) forecastContainer.innerHTML = "";
  }
}

function displayForecast(list) {
  const dailyData = {};
  list.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];
    const time = item.dt_txt.split(" ")[1];

    if (time === "12:00:00") {
      dailyData[date] = item;
    }
  });

  const forecastDates = Object.keys(dailyData).slice(0, 5);
  currentForecastDays = forecastDates.map((date) => ({
    date,
    ...dailyData[date],
  }));
  renderForecastCards(currentForecastDays);
}


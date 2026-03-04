const apiKey = "855d79cc47b93b03667d6eae75222844";

const input = document.getElementById("place");
const suggestionsBox = document.getElementById("suggestions");
const submitBtn = document.getElementById("submit");
const currentLocationBtn = document.getElementById("current-location");
const errorMsg = document.getElementById("error-msg");

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
  const datalist = document.getElementById("search-history-list");
  datalist.innerHTML = "";

  history.forEach((city) => {
    const option = document.createElement("option");
    option.value = city;
    datalist.appendChild(option);
  });
}

window.onload = loadHistory;

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
    document.getElementById("temp").textContent = `Temp: ${vals.temp}°C`;

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
    displayForecast(data.list);
  } catch (error) {
    console.log("Forecast Fetch Error:", error);
  }
}

function displayForecast(list) {
  const forecastContainer = document.getElementById("forecast");
  forecastContainer.innerHTML = "";

  const dailyData = {};
  list.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];
    const time = item.dt_txt.split(" ")[1];

    if (time === "12:00:00") {
      dailyData[date] = item;
    }
  });

  Object.keys(dailyData).forEach((date) => {
    const day = dailyData[date];
    const div = document.createElement("div");
    div.classList.add("forecast-day");
    div.innerHTML = `
      <h3>${date}</h3>
      <p>Temp: ${day.main.temp}°C</p>
      <p>Weather: ${day.weather[0].description}</p>
    `;

    forecastContainer.appendChild(div);
  });
}


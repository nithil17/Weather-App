// const { stringify } = require("postcss");

const apiKey = "855d79cc47b93b03667d6eae75222844";


document.getElementById("submit").addEventListener("click", function(){
  const city = document.getElementById("place").value.trim();
  
  
  if(city===""){
    alert("Please Enter a Place Name");
  }
  // document.getElementById("city").innerHTML = city;
  getLatLon(apiKey, city);
  saveToHistory(city);
  
});

function saveToHistory(city){
  let history = getHistory();
  if(!history.includes(city)){
    history.push(city);
    localStorage.setItem("searchHistory",JSON.stringify(history));
  }
  loadHistory();
}


function loadHistory(){
  const history = JSON.parse(localStorage.getItem("searchHistory"))||[];
  const datalist = document.getElementById("search-history-list")
  datalist.innerHTML="";
  history.forEach(city=>{
    const option = document.createElement("option");
    option.value = city;
    datalist.appendChild(option);
  });
}



window.onload = loadHistory;

function getHistory(){
  JSON.parse(localStorage.getItem("searchHistory"))||[];
}

// show suggestion while typing

const input = document.getElementById("place");
const suggestionsBox = document.getElementById("suggestions");

input.addEventListener("input", function(){
  const value = this.value.toLowerCase();
  const history = getHistory();
  suggestionsBox.innerHTML="";

  if(value===""){
    suggestionsBox.style.display = "none";
    return;
  }

  const filtered = history.filter(city=>
    city.toLowerCase.includes(value)
  );

  filtered.forEach(city=>{
    const div = document.createElement("div");
    div.classList("suggestion-item");
    div.textContent = city;

    div.addEventListener("click", function(){
      input.value=city;
      suggestionsBox.style.display = "none";
      getLatLon(apiKey, city);
    });
    suggestionsBox.appendChild(div);
    

  });
  suggestionsBox.style.display = filtered.length ? "block":"none";

});

// Hide dropdown while clicking outside

document.addEventListener("click", function(e){
  if(!document.querySelector(".search-container").contains(e.target)){
    suggestionsBox.style.display="none";
  }
});

// button click again

document.getElementById("submit").addEventListener("click", function () {

  const city = input.value.trim();

  if (city === "") {
    alert("Enter a city name");
    return;
  }

  saveToHistory(city);
  getLatLon(apiKey, city);
});

async function getLatLon(api, city) {
  document.getElementById("city").innerHTML = city;
  try {
    const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${api}`);

    const data = await response.json();
    console.log(data)
    
    // Now you can treat 'data' like a normal variable
    const info = data[0];
    const lat = info.lat;
    const lon = info.lon;
    console.log(lat, lon);
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api}&units=metric`;
    
    // Call other functions and pass the data to them
    updateUI(info);
    getWeather(url)
    getFiveDayForecast(lat, lon, api);
    
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

function updateUI(info) {
  document.getElementById("city").innerHTML = info.name;
  document.getElementById("lat").innerHTML = info.lat;
 
}



async function getWeather(url) {
  try{
  const response = await fetch(url);
  const data = await response.json();
  const vals = data.main;
  console.log(data);
  console.log(vals);
  document.getElementById("temp").innerHTML = vals.temp;
  }catch(error){
    console.log("Fetch Error:", error);
  }
}

async function getFiveDayForecast(lat, lon, apiKey) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();
    displayForecast(data.list);

  } catch (error) {
    console.log("Forecase Fetch Error:",error);
  }
}


function displayForecast(list) {

     const forecastContainer = document.getElementById("forecast");
  forecastContainer.innerHTML="";

  const dailyData = {};
  list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    const time = item.dt_txt.split(" ")[1];
    
    if(time==="12:00:00"){
      dailyData[date] = item;
    }

  } );

  Object.keys(dailyData).forEach(date=>{
    const day = dailyData[date];
    const div = document.createElement("div")
    div.classList.add("forecast-day");
    div.innerHTML =`
      <h3>${date}</h3>
      <p>Temp:${day.main.temp}°C</p>
      <p>Weather: ${day.weather[0].description}</p>

    `;

    forecastContainer.appendChild(div)
  })
  
}




// https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}

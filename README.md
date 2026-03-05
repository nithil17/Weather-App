# Weather Forecast App

A responsive weather application built with **HTML**, **Tailwind CSS + Vanilla CSS**, and **JavaScript** using the **OpenWeather API**.

## Features

- Search weather by city name
- Get weather using current location (browser geolocation)
- Recently searched cities dropdown (saved with `localStorage`)
- Search suggestions from previous history
- Current weather details:
  - city
  - latitude and longitude
  - temperature
  - humidity
  - wind speed
  - weather condition + icon
- Temperature unit toggle for **today's temperature only** (`°C / °F`)
- Extreme temperature alerts:
  - heat alert above `40°C`
  - cold alert below `5°C`
- Dynamic background by weather type (clear, clouds, rain, drizzle, thunderstorm, snow)
- 5-day forecast cards with:
  - date
  - weather icon + description
  - temperature
  - humidity
  - wind speed
- Inline UI error messages (no JavaScript `alert()` popups)

## Tech Stack

- HTML5
- Tailwind CSS (CDN)
- Custom CSS (`stylesheet.css`)
- Vanilla JavaScript (`script.js`)
- OpenWeather API

## Repository

GitHub: https://github.com/nithil17/Weather-App

## Project Structure

```text
Weather App/
|-- index.html
|-- stylesheet.css
|-- script.js
|-- Images/
|   |-- search50px.png
|-- README.md
```

## Setup and Run

1. Clone or download this project.
2. Open the project folder.
3. Run `index.html` in a browser (double-click or use Live Server in VS Code).
4. Allow location permission in the browser to use **Use My Location**.

## API Key

This project uses OpenWeather API calls in `script.js`.

If you want to use your own key:

1. Create an account at OpenWeather.
2. Generate an API key.
3. Replace the value of `apiKey` in `script.js`.

## Usage

1. Enter a city name and click search.
2. Or click **Use My Location**.
3. Use the **recent cities dropdown** to quickly load previously searched cities.
4. Click **Switch to °F / °C** to toggle today's temperature unit.

## Notes

- Internet connection is required for API requests.
- Weather and forecast data are based on OpenWeather responses.
- Recent city history is stored in browser local storage.

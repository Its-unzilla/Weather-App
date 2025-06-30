const weatherSection = document.getElementById('weather');
const cityName = document.getElementById('cityName');
const description = document.getElementById('description');
const temperature = document.getElementById('temperature');
const humidity = document.getElementById('humidity');
const weatherIcon = document.getElementById('weatherIcon');
const errorDiv = document.getElementById('error');
const loader = document.getElementById('loader');
const toggleUnitBtn = document.getElementById('toggleUnitBtn');
const unitSpan = document.getElementById('unit');
const darkModeBtn = document.getElementById('darkModeToggle');
const forecastEl = document.getElementById('forecast');
const forecastCards = document.getElementById('forecastCards');

let isCelsius = true;
let currentTempCelsius = null;

document.addEventListener('DOMContentLoaded', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetchWeather(lat, lon);
      },
      (error) => {
        showError('Please enable location services to see weather.');
      }
    );
  } else {
    showError('Geolocation is not supported in your browser.');
  }
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark');
  }
});

toggleUnitBtn.addEventListener('click', () => {
  if (currentTempCelsius !== null) {
    isCelsius = !isCelsius;
    updateTemperatureDisplay();
  }
});

darkModeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('darkMode', document.body.classList.contains('dark'));
});

function fetchWeather(lat, lon) {
  showLoader();
  hideError();
  weatherSection.classList.add('hidden');
  forecastEl.classList.add('hidden');

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (!data.current_weather) {
        throw new Error('No weather data found.');
      }
      displayWeather(data, lat, lon);
    })
    .catch((err) => {
      showError(err.message);
    })
    .finally(() => {
      hideLoader();
    });
}

function displayWeather(data, lat, lon) {
  cityName.textContent = `Your Location`;
  description.textContent = weatherCodeToDescription(data.current_weather.weathercode);
  weatherIcon.src = getIconForWeatherCode(data.current_weather.weathercode);
  weatherIcon.alt = description.textContent;

  currentTempCelsius = data.current_weather.temperature;
  isCelsius = true;
  updateTemperatureDisplay();

  humidity.textContent = 'N/A';
  weatherSection.classList.remove('hidden');

  setWeatherBackground(description.textContent.toLowerCase());
  fetchForecast(lat, lon);
}

function fetchForecast(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      displayForecast(data);
    })
    .catch((err) => {
      console.log('Forecast error:', err);
    });
}

function displayForecast(data) {
  forecastCards.innerHTML = '';

  const dates = data.daily.time;
  const tempsMax = data.daily.temperature_2m_max;
  const tempsMin = data.daily.temperature_2m_min;
  const weatherCodes = data.daily.weathercode;

  for (let i = 0; i < dates.length && i < 5; i++) {
    const date = dates[i];
    const maxTemp = tempsMax[i];
    const minTemp = tempsMin[i];
    const weatherCode = weatherCodes[i];
    const desc = weatherCodeToDescription(weatherCode);
    const icon = getIconForWeatherCode(weatherCode);

    const card = document.createElement('div');
    card.className = 'forecast-card';
    card.innerHTML = `
      <div>${date}</div>
      <img src="${icon}" alt="${desc}" />
      <div>${minTemp}°C - ${maxTemp}°C</div>
      <div>${desc}</div>
    `;
    forecastCards.appendChild(card);
  }

  forecastEl.classList.remove('hidden');
}

function updateTemperatureDisplay() {
  if (isCelsius) {
    temperature.textContent = currentTempCelsius.toFixed(1);
    unitSpan.textContent = '°C';
  } else {
    const tempF = currentTempCelsius * 9 / 5 + 32;
    temperature.textContent = tempF.toFixed(1);
    unitSpan.textContent = '°F';
  }
}

function setWeatherBackground(condition) {
  const body = document.querySelector('body');

  if (condition.includes('rain')) {
    body.style.background = 'linear-gradient(to right, #434343, #000000)';
  } else if (condition.includes('clear')) {
    body.style.background = 'linear-gradient(to right, #56CCF2, #2F80ED)';
  } else if (condition.includes('snow')) {
    body.style.background = 'linear-gradient(to right, #83a4d4, #b6fbff)';
  } else if (condition.includes('cloud')) {
    body.style.background = 'linear-gradient(to right, #757F9A, #D7DDE8)';
  } else {
    body.style.background = 'linear-gradient(to right, #bdc3c7, #2c3e50)';
  }
}


function showLoader() {
  loader.classList.remove('hidden');
}

function hideLoader() {
  loader.classList.add('hidden');
}

function showError(message) {
  errorDiv.textContent = message;
  errorDiv.classList.remove('hidden');
}

function hideError() {
  errorDiv.textContent = '';
  errorDiv.classList.add('hidden');
}

function weatherCodeToDescription(code) {
  const map = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    95: 'Thunderstorm',
    99: 'Thunderstorm with hail'
  };

  return map[code] || 'Unknown weather';
}

function getIconForWeatherCode(code) {
  const icons = {
    0: 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png',
    1: 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png',
    2: 'https://cdn-icons-png.flaticon.com/512/414/414825.png',
    3: 'https://cdn-icons-png.flaticon.com/512/414/414825.png',
    45: 'https://cdn-icons-png.flaticon.com/512/4005/4005901.png',
    48: 'https://cdn-icons-png.flaticon.com/512/4005/4005901.png',
    51: 'https://cdn-icons-png.flaticon.com/512/414/414974.png',
    53: 'https://cdn-icons-png.flaticon.com/512/414/414974.png',
    55: 'https://cdn-icons-png.flaticon.com/512/414/414974.png',
    61: 'https://cdn-icons-png.flaticon.com/512/414/414974.png',
    63: 'https://cdn-icons-png.flaticon.com/512/414/414974.png',
    65: 'https://cdn-icons-png.flaticon.com/512/414/414974.png',
    71: 'https://cdn-icons-png.flaticon.com/512/642/642102.png',
    73: 'https://cdn-icons-png.flaticon.com/512/642/642102.png',
    75: 'https://cdn-icons-png.flaticon.com/512/642/642102.png',
    95: 'https://cdn-icons-png.flaticon.com/512/1146/1146869.png',
    99: 'https://cdn-icons-png.flaticon.com/512/1146/1146869.png'
  };

  return icons[code] || 'https://cdn-icons-png.flaticon.com/512/1163/1163657.png';
}

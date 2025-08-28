const apiKey = 'YOUR_API_KEY_HERE'; // Replace with your OpenWeatherMap API key
const form = document.getElementById('weather-form');
const cityInput = document.getElementById('city-input');
const currentWeatherDiv = document.getElementById('current-weather');
const hourlyForecastDiv = document.getElementById('hourly-forecast');
const dailyForecastDiv = document.getElementById('daily-forecast');
const errorDiv = document.getElementById('error-message');

// Weather condition icons mapping
const weatherIcons = {
    'clear': 'fas fa-sun',
    'clouds': 'fas fa-cloud',
    'rain': 'fas fa-cloud-rain',
    'drizzle': 'fas fa-cloud-drizzle',
    'thunderstorm': 'fas fa-bolt',
    'snow': 'fas fa-snowflake',
    'mist': 'fas fa-smog'
};

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (!city) return;

    try {
        errorDiv.textContent = '';
        currentWeatherDiv.innerHTML = '';
        hourlyForecastDiv.innerHTML = '';
        dailyForecastDiv.innerHTML = '';

        const currentWeather = await fetchWeather(city, 'weather');
        displayCurrentWeather(currentWeather);

        const forecast = await fetchWeather(city, 'forecast');
        displayHourlyForecast(forecast);
        displayDailyForecast(forecast);
    } catch (error) {
        errorDiv.textContent = 'Error fetching weather data. Please check the city name and try again.';
    }
});

async function fetchWeather(city, endpoint) {
    const url = `https://api.openweathermap.org/data/2.5/${endpoint}?q=${city},IN&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('City not found');
    return await response.json();
}

function displayCurrentWeather(data) {
    const { main, weather, wind, name } = data;
    const icon = weatherIcons[weather[0].main.toLowerCase()] || 'fas fa-question';
    currentWeatherDiv.innerHTML = `
        <h2>${name}</h2>
        <p><i class="${icon}"></i> ${weather[0].description.charAt(0).toUpperCase() + weather[0].description.slice(1)}</p>
        <p>Temperature: ${main.temp}°C (Feels like: ${main.feels_like}°C)</p>
        <p>High: ${main.temp_max}°C | Low: ${main.temp_min}°C</p>
        <p>Humidity: ${main.humidity}% | Wind: ${wind.speed} m/s</p>
    `;
}

function displayHourlyForecast(data) {
    const hourly = data.list.slice(0, 5); // First 5 entries (approx. 6-hour intervals)
    hourly.forEach(item => {
        const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const icon = weatherIcons[item.weather[0].main.toLowerCase()] || 'fas fa-question';
        const forecastHour = document.createElement('div');
        forecastHour.classList.add('forecast-hour');
        forecastHour.innerHTML = `
            <span>${time}</span>
            <i class="${icon}"></i>
            <span>${Math.round(item.main.temp)}°C</span>
        `;
        hourlyForecastDiv.appendChild(forecastHour);
    });
}

function displayDailyForecast(data) {
    const daily = data.list.filter(forecast => forecast.dt_txt.includes('12:00:00')).slice(0, 5); // Noon each day
    daily.forEach(day => {
        const date = new Date(day.dt * 1000).toLocaleDateString();
        const icon = weatherIcons[day.weather[0].main.toLowerCase()] || 'fas fa-question';
        const forecastDay = document.createElement('div');
        forecastDay.classList.add('forecast-day');
        forecastDay.innerHTML = `
            <span>${date}</span>
            <i class="${icon}"></i>
            <span>High: ${day.main.temp_max}°C</span>
            <span>Low: ${day.main.temp_min}°C</span>
        `;
        dailyForecastDiv.appendChild(forecastDay);
    });
}
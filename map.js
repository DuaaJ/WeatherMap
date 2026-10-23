const form = document.getElementById('search');
const input=document.getElementById('input');
const map = L.map('map').setView([15.5007, 32.5599], 6);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',maxZoom: 19}).addTo(map);

setTimeout(() => map.invalidateSize(), 100);
async function fetchJson(url, notFoundMsg) {
    let response;
    try {
        response = await fetch(url);
    } catch {
        throw new Error('Network error. Check your connection and try again.');
    }
    if (response.status === 404) throw new Error(notFoundMsg);
    if (response.status === 401) throw new Error('Invalid / not-yet-activated API key.');
    if (response.status === 429) throw new Error('Too many requests. Please wait a minute.');
    if (!response.ok) throw new Error(`Server error (HTTP ${response.status}).`);
    return response.json();
}

async function getCoordinates(location) {
    const url= `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;   //"Paris, France"  ->encodeURIComponent() converts it to Paris%2C%20France — a safe URL string.
    const data = await fetchJson(url, 'Location sevice failed');    //fetch() sends the HTTP request  , await pauses execution here until the server responds  , answer holds the metadata — not the data yet

    if(data.length=== 0){ 
        throw new Error(`Location "${location}" not found.`);
    }
    return{ lat:parseFloat(data[0].lat),  lng:parseFloat(data[0].lon)};     
}
const API_KEY = "1b89a68e83643643c9d9230fc8520978"; 
async function getWeather(lat, lng) {     
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`; 
    return fetchJson(url, 'No weather data found for this location.');   
}

let currentMark =null;
form.addEventListener('submit', async(event)=>{
    event.preventDefault();
    const errorBlock = document.getElementById('error');
    const spinner = document.getElementById('spinner')
    spinner.classList.remove('hidden');
    errorBlock.classList.add('hidden');
    errorBlock.textContent='';
    try{
        const location = input.value.trim();
        if (!location) {
    throw new Error('Please enter a Location.');
}
        const coord =await getCoordinates(location);
        const weather =await getWeather(coord.lat, coord.lng);
        //remove current marker
        if(currentMark){
            map.removeLayer(currentMark);
        }
        //move to the new location
        map.flyTo([coord.lat, coord.lng], 10);   //10 zoom level
        //add the new marker
        currentMark=L.marker([coord.lat, coord.lng]).addTo(map);
        // weather popup
        currentMark.bindPopup(popup(weather)).openPopup();
    }catch (error){
        const errorBlock = document.getElementById('error');
        errorBlock.textContent=error.message;
        errorBlock.classList.remove('hidden');
    } finally{
        spinner.classList.add('hidden');
    }
});

function popup(weather){
    const template =document.getElementById("popup");
    const popup =document.importNode(template.content.firstElementChild, true);

    popup.querySelector(".location").textContent =`${weather.name}, ${weather.sys.country}`;
    const icon =weather.weather[0].icon;
    const weatherIcon =popup.querySelector(".icon");
    weatherIcon.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    weatherIcon.alt = weather.weather[0].description;
    popup.querySelector(".temperature").textContent =`${Math.round(weather.main.temp)}°C`;
    popup.querySelector(".description").textContent =weather.weather[0].description;
    popup.querySelector(".humidity").innerHTML =`<i class="fa-solid fa-droplet icon-water"></i>Humidity: ${weather.main.humidity}%`;
    popup.querySelector(".wind").innerHTML = `<i class="fa-solid fa-wind icon-wind"></i>Wind: ${weather.wind.speed} m/s`;
    popup.querySelector(".cloud").innerHTML =`<i class="fa-solid fa-cloud icon-cloud"></i>Clouds: ${weather.clouds.all}%`;
    
    const share= `Weather in ${weather.name}: ${Math.round(weather.main.temp)}°C, ${weather.weather[0].description}`;
    const pageUrl = window.location.href;

    const shareButton = popup.querySelector(".share");
    const shareOptions = popup.querySelector(".share-options");
    shareButton.addEventListener("click", () => {
    shareOptions.classList.toggle("open");
    });
    
   

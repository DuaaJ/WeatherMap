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


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


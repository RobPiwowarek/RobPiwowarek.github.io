/**
 * SINGLE SOURCE OF TRUTH: CONFERENCES
 * Used by both the footer (Upcoming Quests) and the /conferences page
 */
const conferencesData = [
    { id: "c1", type: "epic", date: "2026-11-15", displayDate: "Nov 15, 2026", title: "C++ Summit Europe", city: "Warsaw", lat: 52.2297, lng: 21.0122, desc: "Speaking on memory pooling in real-time engines." },
    { id: "c2", type: "normal", date: "2027-01-10", displayDate: "Jan 10, 2027", title: "Backend Days", city: "Wrocław", lat: 51.1079, lng: 17.0385, desc: "Workshop: Building resilient data pipelines." },
    { id: "c3", type: "normal", date: "2026-03-05", displayDate: "Mar 05, 2026", title: "Local Dev Group", city: "Grodzisk Maz", lat: 52.1054, lng: 20.6279, desc: "Architecture Talk at Base of Operations." },
    { id: "c4", type: "normal", date: "2025-12-02", displayDate: "Dec 02, 2025", title: "Warsaw Game Dev", city: "Kraków", lat: 50.0647, lng: 19.9450, desc: "Panel: The Future of AI in Strategy Games." },
    { id: "c5", type: "epic", date: "2025-04-20", displayDate: "Apr 20, 2025", title: "Code Europe", city: "Gdańsk", lat: 54.3520, lng: 18.6466, desc: "Keynote: Taming the Chaos of Distributed Systems." }
];

let bigMap, miniMap;
let bigMapMarkers = {};

function initMapsAndFooter() {
    // 1. Setup Mini Map (Always present in footer)
    miniMap = L.map('mini-leaflet-map', { zoomControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false }).setView([52.0693, 19.4803], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 12, minZoom: 4 }).addTo(miniMap);

    // 2. Setup Big Map (Only if we are on the /conferences page)
    const bigMapElement = document.getElementById('big-leaflet-map');
    if (bigMapElement) {
        bigMap = L.map('big-leaflet-map').setView([52.0693, 19.4803], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap', maxZoom: 12, minZoom: 5
        }).addTo(bigMap);
    }

    // 3. Populate Footer Events
    const eventsList = document.getElementById('footer-events-list');
    const tableBody = document.getElementById('conferences-table-body'); // Only exists on conferences page

    const today = new Date();
    const futureEvents = conferencesData.filter(conf => new Date(conf.date) >= today);
    futureEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (futureEvents.length === 0) {
        eventsList.innerHTML = '<div class="event-empty">No upcoming quests available.</div>';
    } else {
        futureEvents.forEach(conf => {
            eventsList.innerHTML += `
                <div class="event-item ${conf.type}">
                    <div class="event-date">${conf.displayDate} | ${conf.city}</div>
                    <div class="event-name" title="${conf.title}">${conf.title}</div>
                    <div class="event-desc" title="${conf.desc}">${conf.desc}</div>
                </div>`;
        });
    }

    // 4. Plot Points on Maps and build Table (if on conferences page)
    conferencesData.forEach(conf => {
        const iconHtml = `
            <div class="pin-inner"></div>
            <div class="tooltip">
                <div class="tt-title">${conf.city}</div>
                ${conf.type === 'epic' ? '<div class="tt-unique">Main Stage</div>' : ''}
                <div class="tt-subtitle">${conf.displayDate}</div>
                <div class="tt-desc">${conf.title}</div>
            </div>
        `;
        const radarIcon = L.divIcon({ className: 'custom-radar-pin', html: iconHtml, iconSize: [12, 12], iconAnchor: [6, 6] });

        // Add to Minimap
        L.marker([conf.lat, conf.lng], { icon: radarIcon }).addTo(miniMap);

        // If on Conferences page, build big map and table
        if (bigMapElement && tableBody) {
            const marker = L.marker([conf.lat, conf.lng], { icon: radarIcon }).addTo(bigMap);
            bigMapMarkers[conf.id] = marker;

            const typeBadge = conf.type === 'epic' ? `<span class="type-badge type-epic">Epic</span>` : `<span class="type-badge type-normal">Quest</span>`;
            tableBody.innerHTML += `
                <tr id="row-${conf.id}" onclick="focusMapMarker('${conf.id}', ${conf.lat}, ${conf.lng})">
                    <td>${conf.displayDate}</td>
                    <td>${typeBadge}</td>
                    <td style="font-family: monospace; color: #888;">[${conf.lat.toFixed(2)}, ${conf.lng.toFixed(2)}]</td>
                    <td style="color: var(--gold-text); font-weight: bold;">${conf.city}</td>
                    <td><strong>${conf.title}</strong><br><span style="color:#888; font-size:0.8rem;">${conf.desc}</span></td>
                </tr>`;
        }
    });
}

function focusMapMarker(id, lat, lng) {
    if(!bigMap) return;
    bigMap.flyTo([lat, lng], 8, { animate: true, duration: 1.5 });

    document.querySelectorAll('.custom-radar-pin').forEach(pin => pin.classList.remove('active-pin'));
    if(bigMapMarkers[id] && bigMapMarkers[id].getElement()) {
        bigMapMarkers[id].getElement().classList.add('active-pin');
    }

    document.querySelectorAll('.wc3-table tr').forEach(r => r.classList.remove('active-row'));
    document.getElementById(`row-${id}`).classList.add('active-row');
}

function updateTime() {
    const now = new Date();
    const options = { timeZone: 'Europe/Warsaw', hour: '2-digit', minute: '2-digit', hour12: false };
    const timeText = document.querySelector('.time-text');
    if(timeText) timeText.textContent = new Intl.DateTimeFormat('en-GB', options).format(now);
}

// Initialize Application
setInterval(updateTime, 60000);
updateTime();
initMapsAndFooter();
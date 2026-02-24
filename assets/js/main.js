/**
 * SINGLE SOURCE OF TRUTH: CONFERENCES
 * Used by both the footer (Upcoming Quests) and the /conferences page
 */
const conferencesData = [
    { id: "c3", type: "conference", date: "2024-06-25", displayDate: "Summer 2024", title: "Sumo Digital Conference 2024", city: "Sheffield", lat: 53.38116797372368, lng: -1.4697846912476509, desc: "Talk about importance of logging and diagnosing issues in unreal based on experiences from multiple projects", lang: "EN", video: "[Private] No recording :(" },
    { id: "c2", type: "conference", date: "2023-04-20", displayDate: "Apr 20, 2023", title: "GeeCon 2023", city: "Cracow", lat: 50.08910790027821, lng: 19.984504154240273, desc: "What is Animation Engineering?", lang: "EN", video: "https://youtu.be/RwzZWc2ug0g?si=1S7ogOX41Nunnv4b"},
    { id: "c1", type: "conference", date: "2022-05-12", displayDate: "May 12, 2022", title: "GeeCon 2022", city: "Cracow", lat: 50.08910790027821, lng: 19.984504154240273, desc: "Gamedev through the eyes of a backend engineer", lang: "EN", video: "https://youtu.be/ZdfqLmfIlPs" },
    { id: "c0", type: "conference", date: "2022-06-25", displayDate: "Jun 25, 2022", title: "Confitura", city: "Warsaw", lat: 52.225118613276074, lng: 20.96213981772683, desc: "GameDev okiem Backendowca", lang: "PL", video: "https://youtu.be/w5G6RqsFdgA?si=MX2znuZGwFGafjKf" },
//    { id: "c4", type: "normal", date: "2025-12-02", displayDate: "Dec 02, 2025", title: "Warsaw Game Dev", city: "Kraków", lat: 50.0647, lng: 19.9450, desc: "Panel: The Future of AI in Strategy Games." },
//    { id: "c5", type: "epic", date: "2025-04-20", displayDate: "Apr 20, 2025", title: "Code Europe", city: "Gdańsk", lat: 54.3520, lng: 18.6466, desc: "Keynote: Taming the Chaos of Distributed Systems." }
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
    // 4. Populate the Table First (No Map Pins yet)
        if (tableBody) {
            conferencesData.forEach(conf => {
                const badgeClass = conf.type === 'epic' ? 'type-epic' : 'type-normal';
                const displayType = conf.type.charAt(0).toUpperCase() + conf.type.slice(1);
                const typeBadge = `<span class="type-badge ${badgeClass}">${displayType}</span>`;

                let videoButton = `<span style="color: #555; font-style: italic; font-size: 0.8rem;">Locked</span>`;
                if (conf.video && conf.video.startsWith("http")) {
                    videoButton = `<a href="${conf.video}" target="_blank" onclick="event.stopPropagation();" class="read-more-btn" style="padding: 4px 10px; font-size: 0.75rem; text-decoration: none; display: inline-block;">▶ Watch</a>`;
                } else if (conf.video) {
                    videoButton = `<span style="color: #555; font-style: italic; font-size: 0.75rem;">${conf.video}</span>`;
                }

                tableBody.innerHTML += `
                    <tr id="row-${conf.id}" onclick="focusMapMarker('${conf.id}', ${conf.lat}, ${conf.lng})">
                        <td style="white-space: nowrap;">${conf.displayDate}</td>
                        <td>${typeBadge}</td>
                        <td style="text-align: center; font-weight: bold; color: #888;">${conf.lang || 'EN'}</td>
                        <td style="color: var(--gold-text); font-weight: bold;">${conf.city}</td>
                        <td style="font-family: monospace; color: #888; white-space: nowrap;">[${conf.lat.toFixed(2)}, ${conf.lng.toFixed(2)}]</td>
                        <td><strong>${conf.title}</strong><br><span style="color:#888; font-size:0.8rem;">${conf.desc}</span></td>
                        <td style="text-align: center;">${videoButton}</td>
                    </tr>`;
            });
        }

        // 5. Aggregate Map Data by Coordinates
        const locationGroups = {};
        conferencesData.forEach(conf => {
            // We round to 4 decimals (roughly 10 meters) to group overlapping pins
            const key = `${conf.lat.toFixed(4)},${conf.lng.toFixed(4)}`;
            if (!locationGroups[key]) {
                locationGroups[key] = { lat: conf.lat, lng: conf.lng, events: [] };
            }
            locationGroups[key].events.push(conf);
        });

        // 6. Plot the Aggregated Clusters on Maps
        Object.values(locationGroups).forEach(group => {
            let tooltipContent = '';

            // Loop through all events at this exact location and stack them in the popup
            group.events.forEach((conf, index) => {
                const hasVideo = conf.video && conf.video.startsWith("http");
                // The clickable video link for the tooltip
                const videoLink = hasVideo ? `<a href="${conf.video}" target="_blank" style="color: var(--green-text); text-decoration: underline; font-size: 0.8rem; display: inline-block; margin-top: 4px;">▶ Watch Recording</a>` : '';

                // Add a separator line if this isn't the first event in the list
                const divider = index > 0 ? 'border-top: 1px solid #444; margin-top: 10px; padding-top: 10px;' : '';

                tooltipContent += `
                    <div style="${divider}">
                        <div class="tt-title" style="margin-bottom: 4px;">${conf.title}</div>
                        <div style="color: #ccc; font-size: 0.85rem; font-weight: bold; margin-bottom: 4px; line-height: 1.2;">${conf.desc}</div>
                        <div style="color: #888; font-size: 0.75rem; margin-bottom: 2px;">📅 ${conf.displayDate} &nbsp;|&nbsp; 📍 ${conf.city}</div>
                        ${videoLink}
                    </div>
                `;
            });

            // If there are multiple events, make the pin glow purple and show a number badge
            const isCluster = group.events.length > 1;
            const pinStyle = isCluster ? 'background: var(--epic-purple); box-shadow: 0 0 10px var(--epic-purple);' : '';
            const badgeHTML = isCluster ? `<div style="position: absolute; top: -8px; right: -8px; background: #000; color: #fff; border: 1px solid #555; font-size: 0.65rem; font-weight: bold; border-radius: 50%; width: 15px; height: 15px; display: flex; justify-content: center; align-items: center; z-index: 10;">${group.events.length}</div>` : '';

            const iconHtml = `
                <div class="pin-inner" style="${pinStyle}"></div>
                ${badgeHTML}
                <div class="tooltip">
                    ${tooltipContent}
                </div>
            `;

            const radarIcon = L.divIcon({ className: 'custom-radar-pin', html: iconHtml, iconSize: [12, 12], iconAnchor: [6, 6] });

            // Plot to Minimap
            L.marker([group.lat, group.lng], { icon: radarIcon }).addTo(miniMap);

            // Plot to Big Map and bind all child IDs to this single marker
            if (bigMapElement) {
                const marker = L.marker([group.lat, group.lng], { icon: radarIcon }).addTo(bigMap);
                group.events.forEach(conf => {
                    bigMapMarkers[conf.id] = marker; // Now clicking ANY Cracow row activates this combined pin
                });
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

/**
 * Automate Years of Experience Counter
 * Calculates full years passed since July 2017
 */
function updateYOE() {
    const startDate = new Date('2017-07-01'); // Base of Operations established
    const today = new Date();

    let yoe = today.getFullYear() - startDate.getFullYear();
    const monthDifference = today.getMonth() - startDate.getMonth();

    // If the current month is before July, or it is July but the day hasn't passed yet, subtract 1
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < startDate.getDate())) {
        yoe--;
    }

    const yoeElement = document.getElementById('yoe-counter');
    if (yoeElement) {
        yoeElement.innerText = yoe;
    }
}

// Initialize Application
setInterval(updateTime, 60000);
updateTime();
updateYOE();
initMapsAndFooter();
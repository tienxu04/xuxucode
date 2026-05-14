const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQcUGkdDcQT0Pi3y1TCnsnO0qbdVV11rpb3vNz-Uip6ag9J9uQmrWOtVd82cZtt9FxqVhKd7oxJelc0/pub?output=csv";
const HOME = { name: "Tân Phú, TP.HCM", lat: 10.7916, lng: 106.6273 };

const state = {
  rows: [],
  filtered: [],
  markers: [],
  lines: [],
  markerLayer: null,
  clusterLayer: null,
  useCluster: true,
  includeAbstract: false,
};

const els = {
  loading: document.getElementById("loading"),
  search: document.getElementById("searchInput"),
  country: document.getElementById("countryFilter"),
  lineMode: document.getElementById("lineMode"),
  cluster: document.getElementById("clusterToggle"),
  includeNA: document.getElementById("naToggle"),
  list: document.getElementById("bookList"),
  reset: document.getElementById("resetBtn"),
  statBooks: document.getElementById("statBooks"),
  statCountries: document.getElementById("statCountries"),
  statPlaces: document.getElementById("statPlaces"),
  statFarthest: document.getElementById("statFarthest"),
};

const map = L.map("map", {
  zoomControl: false,
  worldCopyJump: true,
}).setView([18, 40], 3);

L.control.zoom({ position: "topright" }).addTo(map);

L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png", {
  attribution: '&copy; OpenStreetMap &copy; CARTO',
  subdomains: "abcd",
  tileSize: 256,
  zoomOffset: 0,
  detectRetina: false,
  maxZoom: 19,
}).addTo(map);

window.addEventListener("load", () => {
  setTimeout(() => map.invalidateSize(true), 150);
});
window.addEventListener("resize", () => map.invalidateSize(true));

const homeIcon = L.divIcon({ className: "", html: '<div class="home-marker"></div>', iconSize: [18, 18], iconAnchor: [9, 9] });
const bookIcon = L.divIcon({ className: "", html: '<div class="book-marker"></div>', iconSize: [13, 13], iconAnchor: [6, 6] });
const abstractIcon = L.divIcon({ className: "", html: '<div class="book-marker abstract-marker"></div>', iconSize: [13, 13], iconAnchor: [6, 6] });

L.marker([HOME.lat, HOME.lng], { icon: homeIcon, zIndexOffset: 1000 })
  .bindPopup(`<p class="popup-title">${HOME.name}</p><p class="popup-meta">Home base của Book Globetrotter.</p>`)
  .addTo(map);

function clean(value) {
  return String(value ?? "").trim();
}

function number(value) {
  const n = Number(String(value ?? "").trim());
  return Number.isFinite(n) ? n : null;
}

function isAbstractPoint(row) {
  const city = clean(row["state/city"]).toLowerCase();
  const country = clean(row.country).toLowerCase();
  return (
    !row.lat || !row.lng ||
    (row.lat === 0 && row.lng === 0) ||
    city === "n/a" ||
    city === "multiple" ||
    city === "at sea" ||
    city === "outer space" ||
    city === "low earth orbit" ||
    country === "n/a" ||
    country === "space"
  );
}

function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function popupHTML(row) {
  const title = clean(row.Title) || "Untitled";
  const author = clean(row.Author) || "Unknown author";
  const country = clean(row.country) || "N/A";
  const city = clean(row["state/city"]) || "N/A";
  const distance = row.distanceKm ? `${Math.round(row.distanceKm).toLocaleString()} km from Tân Phú` : "";
  return `
    <p class="popup-title">${escapeHTML(title)}</p>
    <p class="popup-meta">${escapeHTML(author)}</p>
    <p class="popup-place">${escapeHTML(city)} · ${escapeHTML(country)}</p>
    <p class="popup-meta">${distance}</p>
  `;
}

function escapeHTML(str) {
  return String(str).replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" }[c]));
}

function normalizeRows(rows) {
  return rows
    .map((row, idx) => {
      const lat = number(row.lat);
      const lng = number(row.lng);
      const item = { ...row, id: idx, lat, lng };
      item.abstract = isAbstractPoint(item);
      item.distanceKm = lat !== null && lng !== null && !(lat === 0 && lng === 0)
        ? haversineKm(HOME, { lat, lng })
        : null;
      return item;
    })
    .filter(row => clean(row.Title));
}

function populateCountryFilter(rows) {
  const countries = [...new Set(rows.map(r => clean(r.country)).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));
  for (const country of countries) {
    const option = document.createElement("option");
    option.value = country;
    option.textContent = country;
    els.country.appendChild(option);
  }
}

function applyFilters() {
  const q = clean(els.search.value).toLowerCase();
  const country = els.country.value;
  state.useCluster = els.cluster.checked;
  state.includeAbstract = els.includeNA.checked;

  state.filtered = state.rows.filter(row => {
    if (!state.includeAbstract && row.abstract) return false;
    if (country !== "all" && clean(row.country) !== country) return false;
    if (!q) return true;
    const haystack = [row.Title, row.Author, row.country, row["state/city"]].map(clean).join(" ").toLowerCase();
    return haystack.includes(q);
  });

  renderMap();
  renderList();
  renderStats();
}

function clearMapLayers() {
  for (const line of state.lines) map.removeLayer(line);
  state.lines = [];

  if (state.markerLayer) map.removeLayer(state.markerLayer);
  if (state.clusterLayer) map.removeLayer(state.clusterLayer);
  state.markerLayer = null;
  state.clusterLayer = null;
  state.markers = [];
}

function renderMap() {
  clearMapLayers();
  const visibleLines = els.lineMode.value === "on";
  const markerGroup = L.layerGroup();
  const clusterGroup = L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: 42 });

  const bounds = [[HOME.lat, HOME.lng]];

  for (const row of state.filtered) {
    if (row.lat === null || row.lng === null) continue;

    const icon = row.abstract ? abstractIcon : bookIcon;
    const marker = L.marker([row.lat, row.lng], { icon })
      .bindPopup(popupHTML(row));

    marker.bookId = row.id;
    state.markers.push(marker);
    bounds.push([row.lat, row.lng]);

    if (state.useCluster) clusterGroup.addLayer(marker);
    else markerGroup.addLayer(marker);

    if (visibleLines && !row.abstract && !(row.lat === HOME.lat && row.lng === HOME.lng)) {
      const line = L.polyline([[HOME.lat, HOME.lng], [row.lat, row.lng]], {
        color: "#f6c177",
        weight: 1,
        opacity: 0.18,
      }).addTo(map);
      state.lines.push(line);
    }
  }

  if (state.useCluster) {
    state.clusterLayer = clusterGroup.addTo(map);
  } else {
    state.markerLayer = markerGroup.addTo(map);
  }

  if (bounds.length > 1) {
    map.invalidateSize(true);
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 5 });
  }
}

function renderList() {
  els.list.innerHTML = "";
  const frag = document.createDocumentFragment();

  state.filtered.slice(0, 220).forEach(row => {
    const div = document.createElement("article");
    div.className = "book-item";
    div.innerHTML = `
      <p class="book-title">${escapeHTML(clean(row.Title))}</p>
      <p class="book-meta">${escapeHTML(clean(row.Author))} · ${escapeHTML(clean(row["state/city"]) || "N/A")}, ${escapeHTML(clean(row.country) || "N/A")}</p>
    `;
    div.addEventListener("click", () => focusBook(row.id));
    div.addEventListener("mouseenter", () => pulseBook(row.id));
    frag.appendChild(div);
  });

  if (!state.filtered.length) {
    const empty = document.createElement("p");
    empty.className = "book-meta";
    empty.textContent = "Không có sách nào khớp filter hiện tại.";
    frag.appendChild(empty);
  }
  els.list.appendChild(frag);
}

function focusBook(id) {
  const row = state.rows.find(r => r.id === id);
  const marker = state.markers.find(m => m.bookId === id);
  if (!row || !marker || row.lat === null || row.lng === null) return;
  map.flyTo([row.lat, row.lng], Math.max(map.getZoom(), row.abstract ? 3 : 5), { duration: 0.8 });
  setTimeout(() => marker.openPopup(), 450);
}

function pulseBook(id) {
  const marker = state.markers.find(m => m.bookId === id);
  if (!marker) return;
  marker.setZIndexOffset(900);
  setTimeout(() => marker.setZIndexOffset(0), 600);
}

function renderStats() {
  const rows = state.filtered;
  const countries = new Set(rows.map(r => clean(r.country)).filter(c => c && c !== "N/A" && c !== "Space"));
  const places = new Set(rows.map(r => `${clean(r["state/city"])}|${clean(r.country)}`).filter(p => !p.toLowerCase().includes("n/a")));
  const farthest = Math.max(0, ...rows.map(r => r.distanceKm || 0));

  els.statBooks.textContent = rows.length.toLocaleString();
  els.statCountries.textContent = countries.size.toLocaleString();
  els.statPlaces.textContent = places.size.toLocaleString();
  els.statFarthest.textContent = Math.round(farthest).toLocaleString();
}

function resetFilters() {
  els.search.value = "";
  els.country.value = "all";
  els.lineMode.value = "on";
  els.cluster.checked = true;
  els.includeNA.checked = false;
  applyFilters();
}

function loadCSV() {
  Papa.parse(CSV_URL, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: (result) => {
      state.rows = normalizeRows(result.data);
      populateCountryFilter(state.rows);
      applyFilters();
      els.loading.classList.add("hidden");
    },
    error: (err) => {
      els.loading.textContent = "Không tải được CSV. Kiểm tra lại publish link Google Sheets.";
      console.error(err);
    },
  });
}

els.search.addEventListener("input", applyFilters);
els.country.addEventListener("change", applyFilters);
els.lineMode.addEventListener("change", applyFilters);
els.cluster.addEventListener("change", applyFilters);
els.includeNA.addEventListener("change", applyFilters);
els.reset.addEventListener("click", resetFilters);

loadCSV();

const panelHint = document.getElementById("panelHint");
const panelContent = document.getElementById("panelContent");
const panelTitle = document.getElementById("panelTitle");
const panelMeta = document.getElementById("panelMeta");
const panelBody = document.getElementById("panelBody");

let map;

init();

async function init() {
  map = L.map("map", {
    zoomControl: true,
    worldCopyJump: true
  }).setView([35, 20], 4);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  const objects = await loadObjects();

  const markers = [];
  objects.forEach(obj => {
    if (!isFinite(obj.lat) || !isFinite(obj.lng)) return;

    const marker = L.circleMarker([obj.lat, obj.lng], {
      radius: 6,
      weight: 1,
      fillOpacity: 0.9
    }).addTo(map);

    marker.bindTooltip(makeHoverHTML(obj), {
      className: "hoverTooltip",
      direction: "top",
      offset: [0, -6],
      opacity: 1,
      sticky: true
    });

    marker.on("click", () => showPanel(obj));
    markers.push(marker);
  });

 
}

async function loadObjects() {
  const res = await fetch("data/objects.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load data/objects.json");
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("objects.json must be an array");
  return data;
}

function makeHoverHTML(obj) {
  const safeTitle = escapeHtml(obj.title || "");
  const safeMeta = escapeHtml([obj.year, obj.location_label].filter(Boolean).join(" • "));
  const thumb = obj.thumb ? String(obj.thumb) : "";

  const img = thumb
    ? `<img class="hoverCard__img" src="${thumb}" alt="${safeTitle}" loading="lazy" />`
    : `<div class="hoverCard__img" aria-hidden="true"></div>`;

  return `
    <div class="hoverCard">
      ${img}
      <div class="hoverCard__text">
        <p class="hoverCard__title">${safeTitle}</p>
        <p class="hoverCard__meta">${safeMeta}</p>
      </div>
    </div>
  `;
}

function showPanel(obj) {
  panelHint.hidden = true;
  panelContent.hidden = false;

  panelTitle.textContent = obj.title || "";
  panelMeta.textContent = [obj.year, obj.location_label].filter(Boolean).join(" • ");
  panelBody.innerHTML = obj.panel_html || "<p>No details provided.</p>";
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[s]));
}

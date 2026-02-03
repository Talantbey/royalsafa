let DATA = null;
let LANG = "ky";

const keys = [
  "subtitle","priceLabel","navWaText",
  "heroTitle","heroText","heroWaText","moreBtn","phoneText",
  "sideTitle","chip1","chip2","chip3","chip4","sideNote",
  "featTitle","feat1","feat2","feat3","feat4",
  "prodTitle","prodText","prodLi1","prodLi2","prodLi3","prodLi4","prodWaText",
  "useTitle","use1","use2","use3","use4",
  "ctaLabel","ctaNote","ctaWaText",
  "galTitle","galText",
  "igTitle","igHint",
  "ctTitle","ctPhone","workTime","ctWaText",
  "waFloatText"
];

function normalizePhone(p) {
  // removes +, spaces, dashes, parentheses
  return String(p || "").replace(/[^\d]/g, "");
}

function waLink(text) {
  const phone = normalizePhone(DATA.phone);
  const msg = encodeURIComponent(text || "");
  return `https://wa.me/${phone}?text=${msg}`;
}

function setWaLinks() {
  const msg = DATA.whatsappText?.[LANG] || DATA.whatsappText?.ky || "";
  const link = waLink(msg);

  ["navWa","heroWa","prodWa","ctaWa","ctWa","waFloat"].forEach(id=>{
    const el = document.getElementById(id);
    if (el) el.setAttribute("href", link);
  });
}

function setActiveLang() {
  document.querySelectorAll(".lang__btn").forEach(btn=>{
    btn.classList.toggle("active", btn.dataset.lang === LANG);
  });
}

function applyText() {
  // fallback if ru not found
  const d = DATA[LANG] || DATA.ky;

  keys.forEach(k=>{
    const el = document.getElementById(k);
    if (!el) return;
    if (d[k] !== undefined) el.innerHTML = d[k];
  });

  document.documentElement.lang = (LANG === "ru") ? "ru" : "ky";

  setWaLinks();
  setActiveLang();
}

function renderInstagram() {
  const grid = document.getElementById("igGrid");
  if (!grid) return;

  grid.innerHTML = "";

  const urls = (DATA.instagramEmbeds || []).filter(u => u && !u.includes("REPLACE_"));
  if (urls.length === 0) {
    grid.innerHTML = `<div class="muted small">${(DATA[LANG]?.igHint) || (DATA.ky?.igHint) || ""}</div>`;
    return;
  }

  urls.forEach(url=>{
    const card = document.createElement("div");
    card.className = "ig-card";
    card.innerHTML = `
      <blockquote class="instagram-media"
        data-instgrm-permalink="${url}"
        data-instgrm-version="14"
        style="border:0;margin:0;padding:0;width:100%;">
      </blockquote>
    `;
    grid.appendChild(card);
  });

  if (window.instgrm?.Embeds?.process) window.instgrm.Embeds.process();
}

function setLang(newLang) {
  LANG = (newLang === "ru") ? "ru" : "ky";
  applyText();
  renderInstagram();
}

// ---------------- INIT ----------------
async function init() {
  document.getElementById("year").textContent = new Date().getFullYear();

  const res = await fetch("data.json", { cache: "no-store" });
  DATA = await res.json();

  // Ensure phone normalized (safe)
  DATA.phone = normalizePhone(DATA.phone);

  // bind language buttons
  document.querySelectorAll(".lang__btn").forEach(btn=>{
    btn.addEventListener("click", ()=> setLang(btn.dataset.lang));
  });

  // initial render
  applyText();
  renderInstagram();

  // re-process IG embeds after load
  window.addEventListener("load", ()=>{
    if (window.instgrm?.Embeds?.process) window.instgrm.Embeds.process();
  });

  // DEBUG (console):
  console.log("LANG:", LANG);
  console.log("WA KY:", waLink(DATA.whatsappText?.ky));
  console.log("WA RU:", waLink(DATA.whatsappText?.ru));
}

init().catch(err => console.error("Init error:", err));
/* =========================
   IMAGE ZOOM SCRIPT
   ========================= */

function initImageZoom() {
  const modal = document.getElementById("imgModal");
  const modalImg = document.getElementById("imgModalContent");
  const closeBtn = document.getElementById("imgClose");

  if (!modal || !modalImg) return;

  document.querySelectorAll(".zoom-img").forEach(img => {
    img.addEventListener("click", () => {
      modal.style.display = "flex";
      modalImg.src = img.src;
      document.body.style.overflow = "hidden";
    });
  });

  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", e => {
    if (e.target === modal) closeModal();
  });

  function closeModal() {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }
}

document.addEventListener("DOMContentLoaded", initImageZoom);

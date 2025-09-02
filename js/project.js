// project.js — Tema + Render del contenido del proyecto
// -----------------------------------------------------------
// Flujo:
// 1) Obtener ?slug= de la URL
// 2) Cargar data/home.json para aplicar TEMA (primera categoría del slug)
// 3) Cargar data/_PROYECTOS/{slug}/{slug}.json
// 4) Pintar título, texto, imagen principal (hero) y galería

const CATEGORIES = ["flashes", "mockup", "moodboard", "tattoo"];

// ==========================
// Utilidades
// ==========================
async function loadJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo cargar " + path);
  return res.json();
}

function getSlugFromURL() {
  const u = new URL(location.href);
  return u.searchParams.get("slug") || ""; // "" → caerá en default y mostramos aviso
}

function ensureBgLayers() {
  if (!document.querySelector(".bg")) {
    const b = document.createElement("div");
    b.className = "bg";
    b.setAttribute("aria-hidden", "true");
    document.body.prepend(b);
  }
  if (!document.querySelector(".bg-overlay")) {
    const o = document.createElement("div");
    o.className = "bg-overlay";
    o.setAttribute("aria-hidden", "true");
    document.body.prepend(o);
  }
}

function mergeTheme(defaults, specific) {
  return {
    bg: specific?.bg ?? defaults?.bg ?? null,
    image: specific?.image ?? defaults?.image ?? null,
    overlay: specific?.overlay ?? defaults?.overlay ?? null,
    filters: specific?.filters ?? defaults?.filters ?? null,
    color: specific?.color ?? defaults?.color ?? null,
    hover: specific?.hover ?? defaults?.hover ?? null,
  };
}

function resolveToAbs(urlMaybe) {
  if (!urlMaybe) return null;
  try {
    return new URL(urlMaybe, document.baseURI).href;
  } catch {
    return urlMaybe;
  }
}

function applyCSSVars(theme) {
  ensureBgLayers();

  const r = document.documentElement;
  const bg = theme.bg ?? "#0f0f12";
  const image = theme.image ?? null;
  const filters = theme.filters ?? "none";
  const overlay = theme.overlay ?? "rgba(0,0,0,0.10)";
  const color = theme.color ?? "#E6E6E6";
  const hover = theme.hover ?? "#FFFFFF";

  const abs = resolveToAbs(image);

  r.style.setProperty("--bg-color", bg);
  r.style.setProperty("--bg-image", abs ? `url("${abs}")` : "none");
  r.style.setProperty("--bg-filters", filters);
  r.style.setProperty("--overlay-color", overlay);
  r.style.setProperty("--text-color", color);
  r.style.setProperty("--hover-color", hover);

  document.body.classList.add("themed");
}

function pickFirstCategoryForSlug(home, slug) {
  if (!slug) return null;
  for (const cat of CATEGORIES) {
    const arr = home.categories?.[cat] || [];
    if (arr.includes(slug)) return cat;
  }
  return null; // no encontrado → default
}

function escapeHTML(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function textToHTML(s) {
  if (!s) return "";
  // Conserva saltos de línea simples; si ya pasas HTML, luego podemos ampliar
  return escapeHTML(String(s)).replace(/\n\n/g, "<br><br>").replace(/\n/g, "<br>");
}

function containerEl() {
  return (
    document.getElementById("projectContainer") ||
    document.querySelector(".project-container") ||
    document.body
  );
}

function el(tag, opts = {}) {
  const n = document.createElement(tag);
  if (opts.class) n.className = opts.class;
  if (opts.text) n.textContent = opts.text;
  if (opts.html != null) n.innerHTML = opts.html;
  if (opts.attrs) Object.entries(opts.attrs).forEach(([k, v]) => n.setAttribute(k, v));
  return n;
}

function buildHero(basePath, data) {
  const heroName = data.imagenPrincipal || data.imagen_principal || data.hero || "1.jpg";
  if (!heroName) return null;
  const src = `${basePath}/${heroName}`;
  const wrap = el("div", { class: "project-hero" });
  wrap.appendChild(el("img", { attrs: { src, alt: data.titulo || data.title || "" } }));
  return wrap;
}

function normalizeGalleryList(data) {
  const list =
    data.galeria ||
    data.gallery ||
    data.imagenes ||
    data.images ||
    [];
  // forzamos array de strings
  return Array.isArray(list) ? list.map(String) : [];
}

function buildGallery(basePath, data, heroName) {
  const list = normalizeGalleryList(data);
  if (!list.length) return null;
  const g = el("div", { class: "gallery" });
  for (const name of list) {
    if (heroName && name === heroName) continue; // evita duplicar hero
    const src = `${basePath}/${name}`;
    const shot = el("div", { class: "shot" });
    shot.appendChild(el("img", { attrs: { src, alt: data.titulo || data.title || "" } }));
    g.appendChild(shot);
  }
  return g;
}

function buildBackLink(){
  const a = el("a", { class: "cat-btn as-link volver-home", text: "back", attrs: { href: "index.html" } });
  return a;
}

async function buildProjectPage(slug) {
  const cont = containerEl();
  cont.innerHTML = ""; // limpia

  const basePath = `data/_PROYECTOS/${slug}`;
  const data = await loadJSON(`${basePath}/${slug}.json`);

  // Hero (primero)
  const heroName = data.imagenPrincipal || data.imagen_principal || data.hero || "1.jpg";
  const hero = buildHero(basePath, { ...data, imagenPrincipal: heroName });
  if (hero) cont.appendChild(hero);

  // Título (después del hero)
  const title = data.titulo || data.title || slug;
  cont.appendChild(el("h1", { class: "project-title", text: title }));

  // Texto / descripción
  const desc = data.texto || data.descripcion || data.description || "";
  if (desc) cont.appendChild(el("p", { class: "project-desc", html: textToHTML(desc) }));

  // Galería (al final)
  const gallery = buildGallery(basePath, data, heroName);
  if (gallery) cont.appendChild(gallery);

  // Volver a home (botón fijo, ya estilado en CSS)
  document.body.appendChild(buildBackLink());
}

// ==========================
// Arranque
// ==========================
(async () => {
  try {
    const slug = getSlugFromURL();
    const home = await loadJSON("data/home.json");

    // 1) Tema por primera categoría
    const cat = (slug && pickFirstCategoryForSlug(home, slug)) || "default";
    const defaults = home.backgrounds?.default || {};
    const overrides = home.backgrounds?.[cat] || {};
    const merged = mergeTheme(defaults, overrides);
    applyCSSVars(merged);

    // 2) Contenido del proyecto
    if (!slug) {
      const cont = containerEl();
      cont.innerHTML = "<p>⚠️ Falta el parámetro <code>slug</code> en la URL.</p>";
    } else {
      await buildProjectPage(slug);
    }
  } catch (err) {
    console.error(err);
    document.body.classList.add("themed"); // al menos se ve
    const cont = containerEl();
    cont.innerHTML = "<p>⚠️ No se pudo cargar este proyecto. Revisa la consola.</p>";
  }
})();

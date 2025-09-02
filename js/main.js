// main.js — Viciostorpes (ordenado + comentado)
// -------------------------------------------------
// Responsabilidades de este archivo:
// 1) Cargar configuración (data/home.json) y datos de proyectos
// 2) Pintar tarjetas (projects + stickers) en posiciones aleatorias/guardadas
// 3) Aplicar el TEMA (fondo, overlay, filtros, colores) según la categoría
// 4) Filtrar por categoría y ajustar tamaños por categoría
// 5) Mantener el DOM mínimo: si faltan .bg/.bg-overlay, se crean
// -------------------------------------------------

// ==========================
// 0) Constantes + Estado
// ==========================
const CATEGORIES = ["flashes","mockup","moodboard","tattoo"];
const field = document.getElementById("field");
const nav   = document.getElementById("categoryNav");

let HOME = null;                  // Config de la home (categorías, fondos, sizes)
let ACTIVE = null;                // Categoría activa (null = todas)
let CARD_INDEX = {};              // slug -> nodo .card de proyecto
let STICKERS = [];                // array de nodos .card.sticker

// ==========================
// 1) Utilidades genéricas
// ==========================
async function loadJSON(path){
  const res = await fetch(path, { cache: 'no-store' });
  if(!res.ok) throw new Error("No se pudo cargar " + path);
  return res.json();
}

function el(tag, opts={}){
  const n = document.createElement(tag);
  if(opts.class) n.className = opts.class;
  if(opts.html) n.innerHTML = opts.html;
  if(opts.attrs) Object.entries(opts.attrs).forEach(([k,v])=> n.setAttribute(k,v));
  return n;
}

function placeCardAt(card, top_dvh, left_dvw){
  card.style.top = top_dvh + "dvh";
  card.style.left = left_dvw + "dvw";
}

function randCoord(margin=8){
  const x = margin + Math.random() * (100 - 2*margin);
  const y = margin + Math.random() * (100 - 2*margin);
  return { top: y, left: x };
}

// ==========================
// 2) Tema (fondos/colores)
// ==========================
function ensureBgLayers(){
  // Crea .bg y .bg-overlay si no existen (para que el CSS pueda pintar)
  if(!document.querySelector('.bg')){
    const b = document.createElement('div');
    b.className = 'bg';
    b.setAttribute('aria-hidden','true');
    document.body.prepend(b);
  }
  if(!document.querySelector('.bg-overlay')){
    const o = document.createElement('div');
    o.className = 'bg-overlay';
    o.setAttribute('aria-hidden','true');
    document.body.prepend(o);
  }
}

function mergeTheme(defaults, specific){
  return {
    bg:      specific?.bg      ?? defaults?.bg      ?? null,
    image:   specific?.image   ?? defaults?.image   ?? null,
    overlay: specific?.overlay ?? defaults?.overlay ?? null,
    filters: specific?.filters ?? defaults?.filters ?? null,
    color:   specific?.color   ?? defaults?.color   ?? null,
    hover:   specific?.hover   ?? defaults?.hover   ?? null,
  };
}

function resolveToAbs(urlMaybe){
  if(!urlMaybe) return null;
  try{ return new URL(urlMaybe, document.baseURI).href; }
  catch{ return urlMaybe; }
}

function debugPreloadBackground(absUrl){
  // Ayuda a detectar rutas malas de fondo sin romper la UI
  if(!absUrl) return;
  const img = new Image();
  img.onload = ()=>{/* ok */};
  img.onerror = ()=>{ console.warn('[BG] No se pudo cargar la imagen de fondo:', absUrl); };
  img.src = absUrl;
}

function applyCSSVars(theme){
  ensureBgLayers();

  const r = document.documentElement;
  const bg      = theme.bg      ?? '#0f0f12';
  const image   = theme.image   ?? null;
  const filters = theme.filters ?? 'none';
  const overlay = theme.overlay ?? 'rgba(0,0,0,0.10)';
  const color   = theme.color   ?? '#E6E6E6';
  const hover   = theme.hover   ?? '#FFFFFF';

  const abs = resolveToAbs(image);
  if(abs) debugPreloadBackground(abs);

  r.style.setProperty('--bg-color', bg);
  r.style.setProperty('--bg-image', abs ? `url("${abs}")` : 'none');
  r.style.setProperty('--bg-filters', filters);
  r.style.setProperty('--overlay-color', overlay);
  r.style.setProperty('--text-color', color);
  r.style.setProperty('--hover-color', hover);

  // Mostrar cuando el tema ya está aplicado para evitar flash
  document.body.classList.add('themed');
}

function applyThemeForCategory(category){
  if(!HOME || !HOME.backgrounds) return;
  const defaults  = HOME.backgrounds.default || {};
  const key       = category || (HOME.backgrounds.default ? 'default' : null);
  const overrides = key && HOME.backgrounds[key] ? HOME.backgrounds[key] : {};
  const merged    = mergeTheme(defaults, overrides);
  applyCSSVars(merged);
}

function getSizeFor(category){
  const sizes = HOME?.sizes || {};
  const def   = Number(sizes.default ?? 20);
  const byCat = sizes.byCategory || {};
  if(category && (category in byCat)) return Number(byCat[category]);
  return def;
}

// ==========================
// 3) UI (filtro por categoría)
// ==========================
function setActiveButton(category){
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cat === category);
  });
}

function applyFilter(category){
  ACTIVE = category;
  setActiveButton(category);
  applyThemeForCategory(category);

  // Construye el conjunto de slugs visibles según la categoría
  let set = null;
  if(category && HOME.categories && HOME.categories[category]){
    set = new Set(HOME.categories[category]);
  }

  const size = getSizeFor(category);

  // Proyectos
  Object.entries(CARD_INDEX).forEach(([slug, card])=>{
    const show = !set || set.has(slug);
    if(show){
      card.classList.remove("is-off");
      card.style.width  = size + "dvw";
      card.style.height = size + "dvw";
      card.setAttribute("aria-hidden","false");
    }else{
      card.classList.add("is-off");
      card.setAttribute("aria-hidden","true");
    }
  });

  // Stickers
  STICKERS.forEach(card => {
    const show = !set || set.has(card.dataset.slug);
    if(show){
      card.classList.remove("is-off");
      card.style.width  = size + "dvw";
      card.style.height = size + "dvw";
      card.setAttribute("aria-hidden","false");
    }else{
      card.classList.add("is-off");
      card.setAttribute("aria-hidden","true");
    }
  });
}

// ==========================
// 4) Cards (project + sticker)
// ==========================
function cardProject({slug, title, cover, coords}){
  const card = el("article", {class:"card", attrs:{tabindex:"0","data-type":"project","data-slug":slug}});
  const wrap = el("a",{class:"img-wrap", attrs:{href:`project.html?slug=${encodeURIComponent(slug)}`, "aria-label":`Abrir ${title}`}});
  const img  = el("img",{attrs:{src:cover, alt:title}});
  const lab  = el("span",{class:"label", html: title});

  wrap.appendChild(img);
  card.appendChild(wrap);
  // card.appendChild(lab); // si quieres mostrar el título, descomenta esta línea

  const c = coords && Array.isArray(coords) && coords.length===2
    ? { top: Number(coords[0]), left: Number(coords[1]) }
    : randCoord(10);
  placeCardAt(card, c.top, c.left);

  return card;
}

function normalizeStickerImage(image, slug){
  if(/^data\//.test(image) || /^https?:\/\//.test(image)) return image;
  // Si es solo "2.jpg" etc, lo resolvemos dentro del proyecto del slug
  return `data/_PROYECTOS/${slug}/${image}`;
}

function cardSticker({image, slug}){
  const imgPath = normalizeStickerImage(image, slug);
  const card = el("article", {class:"card sticker", attrs:{"data-type":"sticker","data-slug":slug}});
  const wrap = el("a",{class:"img-wrap", attrs:{href:`project.html?slug=${encodeURIComponent(slug)}`, "aria-label":`Ir a ${slug} (sticker)`}});
  const img  = el("img",{attrs:{src:imgPath, alt:`Sticker ${slug}`}});
  const lab  = el("span",{class:"label", html:"sticker"});
  wrap.appendChild(img);
  card.appendChild(wrap);
  // card.appendChild(lab);

  const c = randCoord(10);
  placeCardAt(card, c.top, c.left);
  return card;
}

// ==========================
// 5) Arranque
// ==========================
async function build(){
  // 5.1 Cargar configuración
  HOME = await loadJSON("data/home.json");

  // 5.2 Pintar proyectos (recorremos todos los slugs referenciados por categorías)
  const slugs = new Set();
  for(const cat of CATEGORIES){
    (HOME.categories?.[cat] || []).forEach(s => slugs.add(s));
  }

  for(const slug of slugs){
    try{
      const data  = await loadJSON(`data/_PROYECTOS/${slug}/${slug}.json`);
      const title = data.titulo || slug;
      const cover = `data/_PROYECTOS/${slug}/${data.imagenPrincipal || "1.jpg"}`;
      const coords = data.coords;
      const card = cardProject({slug, title, cover, coords});
      CARD_INDEX[slug] = card;
      field.appendChild(card);
    }catch(err){
      console.warn("Error cargando proyecto", slug, err);
    }
  }

  // 5.3 Pintar stickers
  if(Array.isArray(HOME.stickers)){
    HOME.stickers.forEach(st => {
      const card = cardSticker({image: st.image, slug: st.slug});
      STICKERS.push(card);
      field.appendChild(card);
    });
  }

  // 5.4 Navegación por categorías (toggle)
  if(nav){
    nav.addEventListener("click",(e)=>{
      const b = e.target.closest(".cat-btn");
      if(!b) return;
      const cat = b.dataset.cat;
      if(ACTIVE === cat){
        applyFilter(null); // desmarca -> muestra todo + tema default
      }else{
        applyFilter(cat);
      }
    });
  }

  // 5.5 Estado inicial: sin filtro => tema DEFAULT, todos visibles, tamaño sizes.default
  applyFilter(null);
}

build().catch(err=>{
  console.error(err);
  if(field) field.innerHTML = "<p>⚠️ No se pudo cargar la home. Revisa la consola.</p>";
});

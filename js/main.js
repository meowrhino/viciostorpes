// main.js — Home (tema + cartas + filtros)
// ----------------------------------------
// - Lee COORDS desde home.json (HOME.coords[slug])
// - Proyectos EXCLUSIVOS: no aparecen por defecto y solo se muestran
//   al activar su categoría (HOME.exclusiveByCategory)
// - Stickers exclusivos por categoría (HOME.exclusiveStickersByCategory)
// - Tema y tamaños por categoría como antes

// Las categorías ahora se leen dinámicamente desde HOME.categories
const getCategories = () => Object.keys(HOME?.categories || {});
const field = document.getElementById("field");
const nav   = document.getElementById("categoryNav");

let HOME = null;         // Config home.json
let ACTIVE = null;       // Categoría activa (null = sin filtro)
let CARD_INDEX = {};     // slug -> nodo .card
let STICKERS = [];       // .card.sticker normales
let EXCLUSIVE_STICKERS = []; // .card.sticker exclusivos (solo con su cat activa)
// Stickers desactivados temporalmente: la generación en build() está comentada.

// ===== Texto central por categoría =====
let CENTER_TEXTS = {};                 // viene de HOME.texts
let CENTER_STATE = { cat: null, idx: 0, list: [] };

function initCenterTextFeature(home){
  CENTER_TEXTS = (home && typeof home.texts === 'object') ? home.texts : {};
  const el = document.getElementById('center-text');
  if(!el) return; // si no existe en el DOM, no hacemos nada

  const btnPrev = el.querySelector('.center-text__arrow--left');
  const btnNext = el.querySelector('.center-text__arrow--right');
  btnPrev && btnPrev.addEventListener('click', ()=> cycleCenterText(-1));
  btnNext && btnNext.addEventListener('click', ()=> cycleCenterText(1));
}

function captureArrowRects(){
  const el = document.getElementById('center-text');
  if(!el) return null;
  const left  = el.querySelector('.center-text__arrow--left');
  const right = el.querySelector('.center-text__arrow--right');
  if(!left || !right) return null;
  const csL = getComputedStyle(left);
  const csR = getComputedStyle(right);
  if(csL.display === 'none' && csR.display === 'none') return null;
  return {
    left:  (csL.display !== 'none')  ? left.getBoundingClientRect()  : null,
    right: (csR.display !== 'none') ? right.getBoundingClientRect() : null,
    els: { left, right }
  };
}

function animateArrowsFLIP(before, after){
  if(!before || !after) return;
  const { left: leftEl, right: rightEl } = after.els;

  function flip(oneBefore, oneAfter, node){
    if(!oneBefore || !oneAfter || !node) return;
    const dx = oneBefore.left - oneAfter.left;
    if(Math.abs(dx) < 0.5) return;

    // 1) preparar: oculto y coloco en pos antigua sin transición
    node.style.transition = 'none';
    node.style.opacity = '0';
    node.style.transform = `translateX(${dx}px)`;

    // 2) siguiente frame: activo transición, muevo a 0 y reaparezco
// 2) siguiente frame: que mande el CSS (usa sus transitions)
requestAnimationFrame(()=>{
  requestAnimationFrame(()=>{
    node.style.transition = ''; // hereda de .center-text__arrow en CSS
    node.style.transform = 'translateX(0)';
    node.style.opacity = '1';
  });
});

    const cleanup = (e)=>{
      if(e.propertyName !== 'transform') return;
      node.style.transition = '';
      node.removeEventListener('transitionend', cleanup);
    };
    node.addEventListener('transitionend', cleanup);
  }

  flip(before.left,  after.left,  leftEl);
  flip(before.right, after.right, rightEl);
}

function setCenterTextForCategory(category){
  const el = document.getElementById('center-text');
  const content = document.getElementById('center-text-content');
  if(!el || !content) return;

  // 1) Lista: primero por categoría, si no hay, cae a default.
  const listByCat   = Array.isArray(CENTER_TEXTS?.[category]) ? CENTER_TEXTS[category] : [];
  const listDefault = Array.isArray(CENTER_TEXTS?.default)    ? CENTER_TEXTS.default    : [];
  const list        = (listByCat.length > 0) ? listByCat : listDefault;

  CENTER_STATE.cat  = category || 'default';
  CENTER_STATE.idx  = 0;
  CENTER_STATE.list = list;

  // 2) Render condicional
  if(!list || list.length === 0){
    el.hidden = true;           // 0 items → no se ve nada
    return;
  }
  el.hidden = false;
  renderCenterText();

  // 3) Flechas según longitud
  const prev = el.querySelector('.center-text__arrow--left');
  const next = el.querySelector('.center-text__arrow--right');
  const showArrows = list.length > 1;  // 1 item → sin flechas
  if(prev) prev.style.display = showArrows ? '' : 'none';
  if(next) next.style.display = showArrows ? '' : 'none';
}

function renderCenterText(newText){
  const content = document.getElementById('center-text-content');
  if(!content) return;

  // Resolve new text if not provided
  if(newText === undefined){
    const { list, idx } = CENTER_STATE;
    newText = (list && list.length) ? String(list[idx]) : '';
  }

  const isFirstPaint = !content.textContent || content.textContent.trim() === '';
  const cs = getComputedStyle(content);

  // Helper: does CSS actually transition OPACITY with non-zero duration?
  const props = (cs.transitionProperty || '').split(',').map(s => s.trim().toLowerCase());
  const durs  = (cs.transitionDuration || '').split(',').map(s => s.trim());
  const hasOpacity = props.some(p => p === 'opacity' || p === 'all');
  const firstDur = durs[0] || '0s';
  const durMs = firstDur.endsWith('ms') ? parseFloat(firstDur) : parseFloat(firstDur||'0')*1000;
  const canFade = hasOpacity && durMs > 0;

  // If first paint or can't fade, swap immediately and run FLIP for arrows
  if(isFirstPaint || !canFade){
    const before = captureArrowRects();
    content.textContent = newText;
    const after = captureArrowRects();
    animateArrowsFLIP(before, after);
    content.classList.remove('is-fading-out');
    return;
  }

  // Otherwise: fade-out -> swap -> fade-in
  content.classList.add('is-fading-out');

  const onEnd = (e)=>{
    if(e.propertyName !== 'opacity') return;
    content.removeEventListener('transitionend', onEnd);
    const before = captureArrowRects();
    content.textContent = newText;
    const after = captureArrowRects();
    animateArrowsFLIP(before, after);
    content.classList.remove('is-fading-out');
  };
  content.addEventListener('transitionend', onEnd, { once: true });
}

function cycleCenterText(direction){
  const n = CENTER_STATE.list ? CENTER_STATE.list.length : 0;
  if(n <= 1) return;
  CENTER_STATE.idx = (CENTER_STATE.idx + direction + n) % n;
  const nextText = String(CENTER_STATE.list[CENTER_STATE.idx]);
  renderCenterText(nextText);
}

// ------------------------
// Utilidades
// ------------------------
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

// ------------------------
// Tema (fondos/colores)
// ------------------------
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
function getSizeFor(category, slug){
  const sizes = HOME?.sizes || {};
  const def   = Number(sizes.default ?? 20);
  const byCat = sizes.byCategory || {};
  const byProj = sizes.byProject || {};

  // 1) Prioridad por proyecto
  if (slug && Object.prototype.hasOwnProperty.call(byProj, slug)){
    const n = Number(byProj[slug]);
    if (Number.isFinite(n)) return n;
  }
  // 2) Luego por categoría activa
  if (category && Object.prototype.hasOwnProperty.call(byCat, category)){
    const n = Number(byCat[category]);
    if (Number.isFinite(n)) return n;
  }
  // 3) Fallback
  return def;
}

// ------------------------
// Slugs / Coords / Exclusivos
// ------------------------
function getAllSlugsFromHome(){
  const set = new Set();
  // normales por categoría (dinámico)
  for (const cat of getCategories()){
    (HOME.categories?.[cat] || []).forEach(s => set.add(s));
  }
  // exclusivos: hay que crearlos también para mostrarlos al filtrar
  const exByCat = HOME.hiddenProjects || {};
  Object.values(exByCat).forEach(arr => (arr || []).forEach(s => set.add(s)));
  return Array.from(set);
}
function getCoordsForSlug(slug){
  const c = HOME?.coords?.[slug];
  if(Array.isArray(c) && c.length === 2){
    const [top,left] = c.map(Number);
    if(Number.isFinite(top) && Number.isFinite(left)) return { top, left };
  }
  return null;
}
function getVisibleSetForCategory(category){
  const exByCat = HOME.hiddenProjects || {};
  if(!category){
    // estado inicial: ocultar exclusivos
    const hide = new Set();
    Object.values(exByCat).forEach(arr => (arr || []).forEach(s => hide.add(s)));
    return { mode: 'default', hide };
  }else{
    // con filtro: normales de la categoría + exclusivos de esa categoría
    const base = new Set(HOME.categories?.[category] || []);
    (exByCat[category] || []).forEach(s => base.add(s));
    return { mode: 'category', show: base };
  }
}

// ------------------------
// UI (filtro por categoría)
function renderCategoryNav(){
  const container = nav || document.getElementById('categoryNav');
  if (!container) {
    console.warn('[nav] No se encontró #categoryNav');
    return;
  }

  const cats = getCategories();
  if (!cats.length) {
    console.warn('[nav] HOME.categories está vacío o no definido');
    container.innerHTML = '';
    return;
  }
  // Asegurar la clase que aplica el layout/posicionamiento desde CSS
  container.classList.add('category-nav');
  console.log('[nav] renderCategoryNav -> container:', container, 'cats:', cats);

  container.innerHTML = '';
  cats.forEach(cat => {
    const btn = el('button', {
      class: 'cat-btn',
      attrs: { 'data-cat': cat, type: 'button' },
      html: cat
    });
    container.appendChild(btn);
  });

  console.log('[nav] botones pintados:', container.childElementCount, cats);
}
// ------------------------
function setActiveButton(category){
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cat === category);
  });
}
function applyFilter(category){
  ACTIVE = category;
  setActiveButton(category);
  applyThemeForCategory(category);
  setCenterTextForCategory(category);

  const { mode, show, hide } = getVisibleSetForCategory(category);
  // size will be computed per card

  // Proyectos
  Object.entries(CARD_INDEX).forEach(([slug, card])=>{
    let visible = true;
    if(mode === 'category') visible = show.has(slug);
    else visible = !hide.has(slug);

    if(visible){
      const s = getSizeFor(category, slug);
      card.classList.remove('is-off');
      card.style.width  = s + 'dvw';
      card.style.height = s + 'dvw';
      card.setAttribute('aria-hidden','false');
    }else{
      card.classList.add('is-off');
      card.setAttribute('aria-hidden','true');
    }
  });

  // Stickers normales (filtran por slugs de categoría si hay filtro)
  const set = category && HOME.categories && HOME.categories[category]
    ? new Set(HOME.categories[category])
    : null;
  STICKERS.forEach(card => {
    const showIt = !set || set.has(card.dataset.slug);
    if(showIt){
      const slug = card.dataset.slug;
      const s = getSizeFor(category, slug);
      card.classList.remove('is-off');
      card.style.width  = s + 'dvw';
      card.style.height = s + 'dvw';
      card.setAttribute('aria-hidden','false');
    }else{
      card.classList.add('is-off');
      card.setAttribute('aria-hidden','true');
    }
  });

  // Stickers exclusivos: solo en su categoría
  EXCLUSIVE_STICKERS.forEach(card => {
    const cat = card.getAttribute('data-cat');
    const showIt = !!category && category === cat;
    if(showIt){
      const slug = card.dataset.slug;
      const s = getSizeFor(category, slug);
      card.classList.remove('is-off');
      card.style.width  = s + 'dvw';
      card.style.height = s + 'dvw';
      card.setAttribute('aria-hidden','false');
    }else{
      card.classList.add('is-off');
      card.setAttribute('aria-hidden','true');
    }
  });
}

// ------------------------
// Cards (project + sticker)
// ------------------------
function cardProject({slug, title, cover, coords}){
  const card = el("article", {class:"card", attrs:{tabindex:"0","data-type":"project","data-slug":slug}});
  const wrap = el("a",{class:"img-wrap", attrs:{href:`project.html?slug=${encodeURIComponent(slug)}`, "aria-label":`Abrir ${title}`}});
  const img  = el("img",{attrs:{src:cover, alt:title}});
  // const lab  = el("span",{class:"label", html: title});

  wrap.appendChild(img);
  card.appendChild(wrap);
  // card.appendChild(lab); // descomentar si quieres ver el título en la carta

  const c = coords || randCoord(10);
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
  // const lab  = el("span",{class:"label", html:"sticker"});
  wrap.appendChild(img);
  card.appendChild(wrap);
  // card.appendChild(lab);

  const c = randCoord(10);
  placeCardAt(card, c.top, c.left);
  return card;
}
function cardExclusiveSticker({image, slug}, category){
  const imgPath = normalizeStickerImage(image, slug);
  const card = el("article", {class:"card sticker is-off", attrs:{"data-type":"sticker","data-slug":slug, "data-cat": category}});
  const wrap = el("a",{class:"img-wrap", attrs:{href:`project.html?slug=${encodeURIComponent(slug)}`, "aria-label":`Ir a ${slug} (sticker ${category})`}});
  const img  = el("img",{attrs:{src:imgPath, alt:`Sticker ${slug}`}});
  wrap.appendChild(img);
  card.appendChild(wrap);
  const c = randCoord(10);
  placeCardAt(card, c.top, c.left);
  return card;
}

// ------------------------
// Arranque
// ------------------------
async function build(){
  // 1) Cargar configuración
  HOME = await loadJSON("data/home.json");

  // Renderizar botones de categorías desde HOME
  renderCategoryNav();

  // Initialize center text feature
  initCenterTextFeature(HOME);

  // 2) Pintar proyectos (TODOS: categorías + exclusivos)
  const slugs = getAllSlugsFromHome();
  for(const slug of slugs){
    try{
      const data  = await loadJSON(`data/_PROYECTOS/${slug}/${slug}.json`);
      const title = data.titulo || slug;
      const cover = `data/_PROYECTOS/${slug}/${data.imagenPrincipal || "1.jpg"}`;
      const coords = getCoordsForSlug(slug); // <<— ahora desde HOME.coords
      const card = cardProject({slug, title, cover, coords});
      CARD_INDEX[slug] = card;
      field.appendChild(card);
    }catch(err){
      console.warn("Error cargando proyecto", slug, err);
    }
  }

  /* === Stickers DESACTIVADOS (normales) ===
  // 3) Stickers normales
  if(Array.isArray(HOME.stickers)){
    HOME.stickers.forEach(st => {
      const card = cardSticker({image: st.image, slug: st.slug});
      STICKERS.push(card);
      field.appendChild(card);
    });
  }
  === /Stickers DESACTIVADOS (normales) === */

  /* === Stickers DESACTIVADOS (exclusivos) ===
  // 3bis) Stickers EXCLUSIVOS por categoría
  if (HOME.exclusiveStickersByCategory && typeof HOME.exclusiveStickersByCategory === 'object'){
    for (const [cat, arr] of Object.entries(HOME.exclusiveStickersByCategory)){
      (arr || []).forEach(st => {
        if(!st || !st.image || !st.slug) return;
        const card = cardExclusiveSticker({image: st.image, slug: st.slug}, cat);
        EXCLUSIVE_STICKERS.push(card);
        field.appendChild(card);
      });
    }
  }
  === /Stickers DESACTIVADOS (exclusivos) === */

  // 4) Navegación por categorías (toggle)
  if(nav){
    nav.addEventListener("click",(e)=>{
      const b = e.target.closest(".cat-btn");
      if(!b) return;
      const cat = b.dataset.cat;
      if(ACTIVE === cat) applyFilter(null); // desmarca -> tema default + ocultar exclusivos
      else               applyFilter(cat);
    });
  }

  // 5) Estado inicial: sin filtro => tema DEFAULT y ocultar exclusivos
  applyFilter(null);
}

build().catch(err=>{
  console.error(err);
  if(field) field.innerHTML = "<p>⚠️ No se pudo cargar la home. Revisa la consola.</p>";
});

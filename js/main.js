// js/main.js (v3 transitions + robust sticker paths)
const CATEGORIES = ["flashes","mockup","moodboard","tattoo"];
const field = document.getElementById("field");
const nav = document.getElementById("categoryNav");
const bg = document.getElementById("bg");
const bgOverlay = document.getElementById("bg-overlay");

let HOME = null;
let ACTIVE = null;
let CARD_INDEX = {};
let STICKERS = [];

async function loadJSON(path){
  const res = await fetch(path);
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

function setBackgroundFor(category){
  if(!HOME || !HOME.backgrounds) return;
  if(category && HOME.backgrounds[category]){
    const conf = HOME.backgrounds[category];
    bg.style.backgroundImage = `url(${conf.image})`;
    bg.style.filter = conf.filters || "none";
    bgOverlay.style.backgroundColor = conf.overlay || "transparent";
  }else{
    bg.style.backgroundImage = "";
    bg.style.filter = "none";
    bgOverlay.style.backgroundColor = "transparent";
  }
}

function getSizeFor(category){
  const sizes = HOME?.sizes || {};
  const def = Number(sizes.default ?? 20);
  const byCat = sizes.byCategory || {};
  if(category && (category in byCat)) return Number(byCat[category]);
  return def;
}

function applyFilter(category){
  ACTIVE = category;
  document.querySelectorAll(".cat-btn").forEach(btn=>{
    btn.classList.toggle("active", btn.dataset.cat === category);
  });
  setBackgroundFor(category);

  let set = null;
  if(category && HOME.categories && HOME.categories[category]){
    set = new Set(HOME.categories[category]);
  }

  const size = getSizeFor(category);

  Object.entries(CARD_INDEX).forEach(([slug, card])=>{
    const show = !set || set.has(slug);
    if(show){
      card.classList.remove("is-off");
      card.style.width = size + "dvw";
      card.style.height = size + "dvw";
      card.setAttribute("aria-hidden","false");
    }else{
      card.classList.add("is-off");
      card.setAttribute("aria-hidden","true");
    }
  });

  STICKERS.forEach(card => {
    const show = !set || set.has(card.dataset.slug);
    if(show){
      card.classList.remove("is-off");
      card.style.width = size + "dvw";
      card.style.height = size + "dvw";
      card.setAttribute("aria-hidden","false");
    }else{
      card.classList.add("is-off");
      card.setAttribute("aria-hidden","true");
    }
  });
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

function cardProject({slug, title, cover, coords}){
  const card = el("article", {class:"card", attrs:{tabindex:"0","data-type":"project","data-slug":slug}});
  const wrap = el("a",{class:"img-wrap", attrs:{href:`project.html?slug=${encodeURIComponent(slug)}`, "aria-label":`Abrir ${title}`}});
  const img = el("img",{attrs:{src:cover, alt:title}});
  const lab = el("span",{class:"label", html: title});

  wrap.appendChild(img);
  card.appendChild(wrap);
  card.appendChild(lab);

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
  const img = el("img",{attrs:{src:imgPath, alt:`Sticker ${slug}`}});
  const lab = el("span",{class:"label", html:"sticker"});
  wrap.appendChild(img);
  card.appendChild(wrap);
  card.appendChild(lab);

  const c = randCoord(10);
  placeCardAt(card, c.top, c.left);
  return card;
}

async function build(){
  HOME = await loadJSON("data/home.json");

  const slugs = new Set();
  for(const cat of CATEGORIES){
    (HOME.categories?.[cat] || []).forEach(s => slugs.add(s));
  }

  for(const slug of slugs){
    try{
      const data = await loadJSON(`data/_PROYECTOS/${slug}/${slug}.json`);
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

  if(Array.isArray(HOME.stickers)){
    HOME.stickers.forEach(st => {
      const card = cardSticker({image: st.image, slug: st.slug});
      STICKERS.push(card);
      field.appendChild(card);
    });
  }

  nav.addEventListener("click",(e)=>{
    const b = e.target.closest(".cat-btn");
    if(!b) return;
    const cat = b.dataset.cat;
    if(ACTIVE === cat){
      applyFilter(null);
    }else{
      applyFilter(cat);
    }
  });

  applyFilter(null);
}

build().catch(err=>{
  console.error(err);
  field.innerHTML = "<p>⚠️ No se pudo cargar la home. Revisa la consola.</p>";
});

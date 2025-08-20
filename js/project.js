// js/project.js (v3)
const params = new URLSearchParams(location.search);
const slug = params.get("slug");
const container = document.getElementById("projectContainer");
const bg = document.getElementById("bg");
const bgOverlay = document.getElementById("bg-overlay");

async function loadJSON(path){
  const res = await fetch(path);
  if(!res.ok) throw new Error("No se pudo cargar " + path);
  return res.json();
}

async function trySetBackground(){
  try{
    const HOME = await loadJSON("data/home.json");
    const cats = HOME.categories || {};
    let catOfSlug = null;
    for(const [cat, list] of Object.entries(cats)){
      if(Array.isArray(list) && list.includes(slug)){
        catOfSlug = cat; break;
      }
    }
    if(catOfSlug && HOME.backgrounds && HOME.backgrounds[catOfSlug]){
      const conf = HOME.backgrounds[catOfSlug];
      bg.style.backgroundImage = `url(${conf.image})`;
      bg.style.filter = conf.filters || "none";
      bgOverlay.style.backgroundColor = conf.overlay || "transparent";
    }
  }catch(e){ /* ignore */ }
}

async function build(){
  if(!slug){
    container.innerHTML = "<p>Falta el parámetro <code>slug</code>. <a href='index.html'>Volver</a></p>";
    return;
  }
  await trySetBackground();

  try{
    const data = await loadJSON(`data/_PROYECTOS/${slug}/${slug}.json`);
    const title = data.titulo || slug;
    const desc = data.descripcion || "";
    const hero = data.imagenPrincipal || (Array.isArray(data.galeria) ? data.galeria[0] : "1.jpg");
    const gal = Array.isArray(data.galeria) ? data.galeria : [];

    const heroWrap = document.createElement("div");
    heroWrap.className = "project-hero";
    const heroImg = document.createElement("img");
    heroImg.src = `data/_PROYECTOS/${slug}/${hero}`;
    heroImg.alt = title;
    heroWrap.appendChild(heroImg);

    const h1 = document.createElement("h1");
    h1.className = "project-title";
    h1.textContent = title;

    const p = document.createElement("p");
    p.className = "project-desc";
    p.textContent = desc;

    const gallery = document.createElement("div");
    gallery.className = "gallery";
    for(const file of gal){
      const shot = document.createElement("figure");
      shot.className = "shot";
      const img = document.createElement("img");
      img.src = `data/_PROYECTOS/${slug}/${file}`;
      img.alt = `${title} - ${file}`;
      shot.appendChild(img);
      gallery.appendChild(shot);
    }

    container.appendChild(heroWrap);
    container.appendChild(h1);
    container.appendChild(p);
    container.appendChild(gallery);
  }catch(err){
    console.error(err);
    container.innerHTML = "<p>⚠️ No se pudo cargar el proyecto. Revisa la consola.</p>";
  }
}

build();

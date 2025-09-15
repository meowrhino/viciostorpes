# Viciostorpes — Guía completa (para editores y devs)

> Sitio estático con **home-lienzo** y páginas de **proyecto**. Todo se configura en **JSON** (sin builds ni frameworks), y el tema visual se aplica con **CSS Variables**.
>
> Este README explica **cómo mantener el sitio sin programar** y, al final, incluye detalles para desarrolladores.

---

## Inicio rápido (5 minutos)

1) **Descarga o clona** este repositorio.
2) Abre la carpeta en VS Code y levanta un **servidor estático** (por ejemplo con *Live Server*).
3) Abre `index.html` en el navegador.
4) Edita `data/home.json`:
   - Añade tu primera categoría en `categories`.
   - Crea una carpeta `data/_PROYECTOS/<mi-slug>/` con `1.jpg` y `<mi-slug>.json` (ver plantillas abajo).
5) Recarga: verás tu proyecto en la Home. 
6) Si quieres publicarlo, usa **GitHub Pages** (guía más abajo).

---

## Índice

- [Viciostorpes — Guía completa (para editores y devs)](#viciostorpes--guía-completa-para-editores-y-devs)
  - [Inicio rápido (5 minutos)](#inicio-rápido-5-minutos)
  - [Índice](#índice)
  - [Qué es y cómo se ve](#qué-es-y-cómo-se-ve)
  - [Abrir el proyecto](#abrir-el-proyecto)
  - [Publicar en GitHub Pages](#publicar-en-github-pages)
  - [Estructura de carpetas](#estructura-de-carpetas)
  - [Conceptos clave](#conceptos-clave)
  - [Plantillas copiables](#plantillas-copiables)
    - [Mínimo `home.json`](#mínimo-homejson)
    - [Mínimo `<slug>.json`](#mínimo-slugjson)
  - [Editar el sitio (paso a paso)](#editar-el-sitio-paso-a-paso)
    - [Añadir una **categoría**](#añadir-una-categoría)
    - [Añadir un **proyecto**](#añadir-un-proyecto)
      - [Ejemplo de `<slug>.json`](#ejemplo-de-slugjson)
      - [Registrar en `home.json`](#registrar-en-homejson)
    - [Mover un proyecto por la Home (coordenadas)](#mover-un-proyecto-por-la-home-coordenadas)
    - [Cambiar **tamaños** (por defecto, por categoría, por proyecto)](#cambiar-tamaños-por-defecto-por-categoría-por-proyecto)
    - [Editar el **tema** (fondo, overlay, filtros, colores)](#editar-el-tema-fondo-overlay-filtros-colores)
      - [¿Qué hace cada opción?](#qué-hace-cada-opción)
    - [Textos centrales por categoría](#textos-centrales-por-categoría)
  - [Buenas prácticas con imágenes (¡minúsculas!)](#buenas-prácticas-con-imágenes-minúsculas)
    - [Renombrar en lote a minúsculas](#renombrar-en-lote-a-minúsculas)
  - [Checklist antes de publicar](#checklist-antes-de-publicar)
  - [Solución de problemas](#solución-de-problemas)
  - [FAQ](#faq)
  - [Detalles para desarrolladores](#detalles-para-desarrolladores)
    - [Datos y flujo](#datos-y-flujo)
    - [Esquema de `home.json`](#esquema-de-homejson)
    - [Esquema de `<slug>.json` (proyecto)](#esquema-de-slugjson-proyecto)
    - [Accesibilidad y rendimiento](#accesibilidad-y-rendimiento)

---

## Qué es y cómo se ve

- **Home**: un lienzo donde cada **proyecto** es una carta cuadrada; se posiciona por **coordenadas** (en unidades de pantalla) y cambia de estilo al activar una **categoría**.
- **Proyecto**: vista detalle con **imagen principal → título → texto → galería** y tema visual coherente con su categoría.

No hay base de datos ni servidor: todo sale de ficheros en `/data`.

---

## Abrir el proyecto

1. Abre la carpeta del repo en VS Code (o similar).
2. Levanta un **servidor estático** desde la **raíz** del repo (ej.: extensión *Live Server*).
3. Visita:
   - `index.html` → Home.
   - `project.html?slug=<slug>` → Detalle de un proyecto.

> **Importante:** abrir `index.html` como `file://` puede bloquear la carga de JSON. Usa un servidor local.

---

## Publicar en GitHub Pages

1. Sube el repo a GitHub.
2. En **Settings → Pages** selecciona:
   - *Source*: `Deploy from a branch`.
   - *Branch*: `main` (o la rama que uses) y carpeta `/ (root)`.
3. Guarda y espera 1–2 minutos. 
4. Tu web quedará en `https://<usuario>.github.io/<repo>/`.

**Notas**:
- Las rutas del proyecto son **relativas** → no necesitas cambiar nada para que funcione en un subdirectorio.
- GitHub Pages es **case-sensitive**: usa archivos en **minúsculas** (ver guía más abajo).

---

## Estructura de carpetas

```
/css
  styles.css                 # estilos globales (el tema se inyecta vía variables CSS)
/data
  home.json                  # configuración global (categorías, tamaños, textos, fondos, coords, ...)
  /_FONDOS                   # imágenes de fondo por categoría (opcional)
  /_PROYECTOS
    /<slug>/                 # carpeta de cada proyecto
      <slug>.json            # metadatos del proyecto
      1.jpg, 2.jpg, ...      # imágenes
/js
  main.js                    # lógica de home (tema, cartas, filtro, center-text)
  project.js                 # lógica del detalle (tema + render del proyecto)
index.html                   # página de home
project.html                 # plantilla del detalle
```

---

## Conceptos clave

- **Categoría**: grupo temático que cambia el **fondo/colores** y qué proyectos se ven.
- **Coordenadas** (`coords`): posición de cada carta en la Home. Son `[top, left]` en **`dvh/dvw`** (unidades de alto/ancho de pantalla dinámicos).
- **Tamaño** (`sizes`): lado de cada carta en **`dvw`**. Hay tamaño **por defecto**, **por categoría** y **por proyecto**.
- **Textos centrales** (`texts`): mensajes que aparecen en el centro según la categoría, con flechas si hay varios.
- **Exclusivos**: proyectos que **solo** aparecen cuando activas una categoría concreta.

---

## Plantillas copiables

### Mínimo `home.json`
```json
{
  "categories": { "galeria": ["ejemplo"] },
  "backgrounds": { "default": { "bg": "#111", "overlay": "rgba(0,0,0,0.1)", "filters": "none", "color": "#fff", "hover": "#ffdf6e" } },
  "sizes": { "default": 14 },
  "texts": { "default": ["Hola"] }
}
```

### Mínimo `<slug>.json`
```json
{
  "titulo": "Mi proyecto",
  "texto": "Descripción breve.",
  "imagenPrincipal": "1.jpg",
  "galeria": ["2.jpg", "3.jpg"]
}
```

---

## Editar el sitio (paso a paso)

### Añadir una **categoría**

Edita `data/home.json` → sección `categories`:

```json
{
  "categories": {
    "flashes": ["caballo1", "caballo2"],
    "mockup": [],
    "moodboard": ["horses"],
    "tattoo": ["oldflash"],
    "nueva": ["mi-proyecto"]          
  }
}
```

Eso es **suficiente**: la Home genera **automáticamente** los botones de categorías a partir de `home.json`.

Por ejemplo:

- Si quieres una categoría de posters llamada `posters`, solo añade:

```json
"categories": {
  "posters": []
}
```

- Si quieres ocultar temporalmente una categoría sin borrarla, simplemente déjala vacía o comenta su contenido (en JSON no hay comentarios, pero puedes eliminar su lista de proyectos):

```json
"categories": {
  "flashes": ["caballo1", "caballo2"],
  "posters": []    // Categoría sin proyectos, no se mostrará ningún proyecto
}
```

Así la categoría `posters` aparece en el menú pero sin proyectos.

Opcionalmente, añade tema y tamaños específicos para `"nueva"` (ver secciones de **Tema** y **Tamaños**).

---

### Añadir un **proyecto**

1. Crea carpeta `data/_PROYECTOS/<slug>/`.
2. Dentro, crea `<slug>.json` con los metadatos mínimos y pon imágenes (al menos `1.jpg`).
3. Añade el `<slug>` en una o más categorías (`home.json > categories`).
4. (Opcional) Añade sus `coords` y un `size` específico en `home.json`.

#### Ejemplo de `<slug>.json`

```json
{
  "titulo": "Caballo 1",               
  "descripcion": "Texto descriptivo.", 
  "imagenPrincipal": "1.jpg",          
  "galeria": ["2.jpg", "3.jpg"]      
}
```
> Alias válidos: `titulo|title`, `texto|descripcion|description`, `imagenPrincipal|hero|imagen_principal`, `galeria|gallery|imagenes|images`.

Por ejemplo, la estructura de carpetas para un proyecto llamado `caballo1` podría ser:

```
data/_PROYECTOS/caballo1/
  caballo1.json
  1.jpg
  2.jpg
  3.jpg
```

Donde `caballo1.json` contiene los metadatos y `1.jpg`, `2.jpg`, `3.jpg` son las imágenes usadas en el proyecto.

#### Registrar en `home.json`

```json
{
  "categories": { "tattoo": ["caballo1"] },
  "coords":     { "caballo1": [40, 70] },
  "sizes":      { "byProject": { "caballo1": 18 } }
}
```

---

### Mover un proyecto por la Home (coordenadas)

En `home.json` → `coords`:

```json
"coords": {
  "caballo1": [24, 42],   
  "caballo2": [66, 22]
}
```
- `top = 24dvh`, `left = 42dvw`.
- La carta se centra con `transform: translate(-50%, -50%)`; es decir, `top/left` apuntan al **centro** de la carta.
- Evita valores extremos (0 o 100). Recomendado: **2–98**.
- Si un slug **no** tiene `coords`, se coloca en una posición **aleatoria agradable**.

Por ejemplo:

- Si pones `"caballo1": [10, 90]`, la carta estará cerca del **top right** (arriba a la derecha).
- Si pones `"caballo2": [90, 10]`, la carta estará cerca del **bottom left** (abajo a la izquierda).

Esto te permite colocar manualmente los proyectos donde quieras en la pantalla.

---

### Cambiar **tamaños** (por defecto, por categoría, por proyecto)

En `home.json` → `sizes`:

```json
"sizes": {
  "default": 14,
  "byCategory": {
    "flashes": 20,
    "tattoo": 18
  },
  "byProject": {
    "caballo1": 22,
    "horses": 12
  }
}
```
- Unidad: **`dvw`** (ancho de pantalla dinámico). El alto se ajusta al mismo valor → cartas cuadradas.
- **Prioridad** al calcular el tamaño de una carta:
  1. `byProject[slug]`
  2. `byCategory[categoria_activa]`
  3. `default`

Por ejemplo:

- Si quieres que todos los flashes sean grandes (20dvw) pero un proyecto concreto (`horses`) sea más pequeño (12dvw):

```json
"sizes": {
  "default": 14,
  "byCategory": {
    "flashes": 20
  },
  "byProject": {
    "horses": 12
  }
}
```

Así, cuando la categoría activa sea `flashes`, todas las cartas serán de 20dvw excepto `horses` que será de 12dvw.

---

### Editar el **tema** (fondo, overlay, filtros, colores)

En `home.json` → `backgrounds` define un tema **default** y, opcionalmente, uno por categoría:

```json
"backgrounds": {
  "default": {
    "bg": "#111",                     
    "overlay": "rgba(0,0,0,0.12)",   
    "filters": "none",               
    "color": "#fff",                 
    "hover": "#ffdf6e"              
  },
  "moodboard": {
    "bg": "data/_FONDOS/moodboard.jpg",  
    "overlay": "rgba(0,0,0,0.18)",
    "filters": "contrast(1.05) saturate(1.05)",
    "color": "azure",
    "hover": "tan"
  }
}
```

#### ¿Qué hace cada opción?

- `bg` → **color** (hex, rgb, hsl, nombre CSS) **o** ruta a **imagen** (relativa o absoluta). 
- `overlay` → capa semitransparente sobre el fondo, útil para contraste (ej. `rgba(0,0,0,0.12)`).
- `filters` → se aplican a la **imagen de fondo** (se ignoran si `bg` es un color).
- `color` → color de texto y botones.
- `hover` → color de texto/botones al pasar el ratón o foco.

> Tip: si usas imagen, combina `overlay` + `filters` para asegurar legibilidad del texto. Ejemplo: un `overlay` negro claro y un `contrast(1.05)`.

Por ejemplo:

- Si quieres que la categoría `mockup` tenga un fondo rojo liso:

```json
"backgrounds": {
  "mockup": {
    "bg": "red",
    "overlay": "rgba(0,0,0,0.1)",
    "filters": "none",
    "color": "white",
    "hover": "yellow"
  }
}
```

- Si quieres que la categoría `tattoo` tenga una foto de fondo:

```json
"backgrounds": {
  "tattoo": {
    "bg": "data/_FONDOS/tattoo-bg.jpg",
    "overlay": "rgba(0,0,0,0.3)",
    "filters": "grayscale(0.5) contrast(1.1)",
    "color": "#f0e6d2",
    "hover": "#ffcc00"
  }
}
```

---

### Textos centrales por categoría

En `home.json` → `texts`:

```json
"texts": {
  "default": ["Bienvenido", "Explora las categorías"],
  "flashes": ["Flash único"],
  "mockup": [],                  
  "moodboard": ["Mood 1", "Mood 2"],
  "tattoo": ["Tatuajes"]
}
```
- Si **0** textos → **no** aparece el bloque central.
- Si **1** texto → aparece **sin flechas**.
- Si **2 o más** → aparecen flechas para pasar; hay animación de **fade** y las flechas se **deslizan suavemente**.

Por ejemplo:

- Si en `tattoo` pones:

```json
"tattoo": ["Bienvenido a Tattoo", "Explora"]
```

verás flechas para pasar entre esos dos textos con animación suave.

---

## Buenas prácticas con imágenes (¡minúsculas!)

GitHub Pages es **sensible a mayúsculas/minúsculas**. 
`1.jpg` **no** es lo mismo que `1.JPG` o `1.jpeg`. Si el JSON pide `1.jpg` y el archivo es `1.JPG` obtendrás **404**.

**Ejemplos:**

- Incorrecto:

```json
"imagenPrincipal": "1.JPG"
```

pero el archivo se llama `1.jpg` → no funcionará.

- Correcto:

```json
"imagenPrincipal": "1.jpg"
```

y el archivo es `1.jpg`.

**Recomendación:**
- Nombra **todas** las imágenes en **minúsculas**, sin espacios ni tildes.
- Usa `.jpg` (o `.png` si realmente es PNG) y escribe la **misma extensión** en el JSON.

**Nota:** el campo `bg` en `backgrounds` puede ser también una imagen. En ese caso, aplica las mismas reglas de minúsculas que para las galerías (`.jpg` vs `.JPG`).

### Renombrar en lote a minúsculas

**Mac/Linux/WSL (bash):**
```bash
cd data/_PROYECTOS
find . -depth -type f -exec bash -c '
  old="$1";
  new="$(dirname "$old")/$(basename "$old" | tr "[:upper:]" "[:lower:]")";
  if [ "$old" != "$new" ]; then git mv "$old" "$new" 2>/dev/null || mv "$old" "$new"; fi
' _ {} \;
```

**Windows (PowerShell):**
```powershell
Get-ChildItem -Recurse -File | ForEach-Object {
  $newName = $_.Name.ToLower()
  if ($_.Name -ne $newName) { Rename-Item -Path $_.FullName -NewName $newName }
}
```

---

## Checklist antes de publicar

- [ ] Todos los nombres de archivos de imágenes en **minúsculas** (`.jpg` o `.png`).
- [ ] `home.json` válido (sin comentarios, llaves/ comas correctas).
- [ ] Cada proyecto tiene su carpeta `data/_PROYECTOS/<slug>/` con `<slug>.json` y al menos `1.jpg`.
- [ ] `categories` contiene todos los slugs que deseas mostrar.
- [ ] Si usas imágenes de fondo en `backgrounds`, rutas correctas y en minúsculas.
- [ ] Probar filtros de categoría en la Home y la navegación a `project.html?slug=<slug>`.

---

## Solución de problemas

**No carga el fondo / imágenes 404**  
Verifica que el **nombre de archivo coincide exactamente** con el del JSON (minúsculas incluidas) y que el sitio se sirve desde la **raíz** del repo (las rutas son relativas).

**No aparecen los botones de categorías**  
Se generan automáticamente desde `home.json`. Si no se ven:
- Abre la consola: debería salir `"[nav] botones pintados: N [...]"`.
- Si existen en el DOM pero no se ven, es un tema de estilos (z-index/posición).

**El texto central no hace fade**  
Respeta `prefers-reduced-motion` y las duraciones están en CSS. Asegúrate de no tener el bloque oculto por tener `texts.<cat>` como `[""]` (mejor deja `[]`).

**En la vista de proyecto no sale nada**  
Confirma que la URL es `project.html?slug=<slug>` y que existe `/data/_PROYECTOS/<slug>/<slug>.json`.

**Cambios no se ven en GitHub Pages**  
Asegúrate de haber hecho push a la **misma rama** configurada en Pages y espera el despliegue (~1–2 min). A veces ayuda tocar un `.html` para forzar rebuild.

---

## FAQ

**¿Puedo usar esto sin saber programar?**  
Sí. Edita `home.json` y los `.json` de cada proyecto con un editor de texto. Sigue las plantillas y ejemplos de este README.

**¿Puedo añadir/quitar categorías sin tocar HTML/JS?**  
Sí. El menú de categorías se genera automáticamente a partir de `home.json > categories`.

**¿Cómo cambio el aspecto?**  
En `home.json > backgrounds`. Usa `bg` como color o imagen, `overlay` para contraste y `filters` para ajustar la imagen.

**¿Cómo controlo el tamaño de una pieza concreta?**  
Con `sizes.byProject["mi-slug"]`.

**¿Cómo coloco una carta en un sitio exacto?**  
Con `coords["mi-slug"] = [top_dvh, left_dvw]`.

**¿Puedo desactivar los stickers?**  
Sí. Están desactivados por defecto en el JS. Puedes reactivarlos descomentando los bloques indicados en `build()`.

**¿Esto funciona en móvil?**  
Sí. Se usan unidades dinámicas `dvh/dvw` y tamaños relativos. Revisa contrastes y pesos de imágenes para buen rendimiento.

---

## Detalles para desarrolladores

### Datos y flujo

- **Dynamic nav**: los botones de categoría se generan desde `Object.keys(HOME.categories)`; no hay lista hardcode.
- **Theme**: `applyThemeForCategory(cat)` inyecta `--bg-color`, `--bg-image`… usando siempre `bg` (color o imagen).
- **Filter**: `applyFilter(cat)` decide visibilidad, tamaños y tema; mezcla `categories[cat]` + `exclusiveByCategory[cat]`.
- **Sizes**: `getSizeFor(category, slug)` prioriza `byProject` → `byCategory` → `default`.
- **Center-text**: `renderCenterText()` sincroniza el fade con `transitionend` (sin ms hardcode). 
  Las flechas usan FLIP (mide antes/después y anima `translateX`) con la misma duración definida en CSS (`--center-text-ms`).
- **Stickers**: la generación está **comentada** en `build()`; reactivable descomentando los bloques señalados.

### Esquema de `home.json`

Campos habituales (todos opcionales salvo `categories`):

```json
{
  "categories": { "flashes": ["caballo1"], "tattoo": ["oldflash"] },
  "exclusiveByCategory": { "moodboard": ["horses"] },
  "backgrounds": {
    "default": { "bg": "#111", "overlay": "rgba(0,0,0,0.12)", "filters": "none", "color": "#fff", "hover": "#ffdf6e" },
    "flashes": { "bg": "data/_FONDOS/flashes.jpg", "overlay": "rgba(0,0,0,0.12)", "filters": "contrast(1.05)", "color": "#fff", "hover": "#ffdf6e" }
  },
  "sizes": { "default": 14, "byCategory": { "flashes": 20 }, "byProject": { "caballo1": 22 } },
  "texts": { "default": ["Hola"], "flashes": ["Texto 1", "Texto 2"], "mockup": [] },
  "coords": { "caballo1": [24, 42] }
  // stickers y exclusivos de stickers existen pero están desactivados en JS
}
```

### Esquema de `<slug>.json` (proyecto)

```json
{
  "titulo": "Nombre bonito",                
  "texto": "Descripción...",               
  "imagenPrincipal": "1.jpg",              
  "galeria": ["2.jpg", "3.jpg"]          
}
```
Alias admitidos:
- título: `titulo`, `title`
- texto: `texto`, `descripcion`, `description`
- imagen principal: `imagenPrincipal`, `imagen_principal`, `hero`
- galería: `galeria`, `gallery`, `imagenes`, `images`

### Accesibilidad y rendimiento

- Se respetan `prefers-reduced-motion` y contrastes a través de `overlay`.
- El *fade* del centro y el *slide* de flechas se sincronizan por **`transitionend`**.
- La Home y el detalle sólo hacen `fetch` de JSON/imagenes; no hay build ni dependencias.

---

¿Dudas o PRs? Este README intenta cubrir tanto el mantenimiento editorial como las dudas técnicas básicas. Si algo no queda claro, abre un issue o anótalo en `TODO.md`.

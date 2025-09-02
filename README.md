
# Viciostorpes — README

> Sitio estático con **home** tipo lienzo y páginas de **proyecto**. Todo el tema visual
> (fondo, filtros, overlay y colores) se define en **JSON** y se inyecta con **CSS Variables**.

---

## Índice

- [Visión general](#visión-general)
- [Estructura de carpetas](#estructura-de-carpetas)
- [Arranque rápido](#arranque-rápido)
- [Cómo funciona el tema (background, overlay, filtros, colores)](#cómo-funciona-el-tema-background-overlay-filtros-colores)
  - [Variables CSS](#variables-css)
  - [`backgrounds` en `home.json`](#backgrounds-en-homejson)
  - [Filtros CSS que puedes usar](#filtros-css-que-puedes-usar)
  - [Overlay: qué es y cómo usarlo](#overlay-qué-es-y-cómo-usarlo)
- [Home (`js/main.js`)](#home-jsmainjs)
  - [Responsabilidades](#responsabilidades)
  - [Carga de datos](#carga-de-datos)
  - [Creación de cartas (projects y stickers)](#creación-de-cartas-projects-y-stickers)
  - [Coordenadas (`coords`)](#coordenadas-coords)
  - [Categorías, exclusivos y filtro](#categorías-exclusivos-y-filtro)
  - [Tamaños (`sizes`)](#tamaños-sizes)
- [Proyecto (`js/project.js`)](#proyecto-jsprojectjs)
  - [Tema por primera categoría](#tema-por-primera-categoría)
  - [Render del contenido](#render-del-contenido)
  - [JSON de proyecto: campos aceptados](#json-de-proyecto-campos-aceptados)
- [Estilos (`css/styles.css`)](#estilos-cssstylescss)
  - [Capas de fondo](#capas-de-fondo)
  - [Interacciones](#interacciones)
  - [Accesibilidad y rendimiento](#accesibilidad-y-rendimiento)
- [Autoría de contenidos (guía de mantenimiento)](#autoría-de-contenidos-guía-de-mantenimiento)
  - [Añadir un proyecto nuevo](#añadir-un-proyecto-nuevo)
  - [Añadir/modificar fondos de categoría](#añadirmodificar-fondos-de-categoría)
  - [Hacer un proyecto “exclusivo” de una categoría](#hacer-un-proyecto-exclusivo-de-una-categoría)
  - [Añadir stickers normales y exclusivos](#añadir-stickers-normales-y-exclusivos)
  - [Ajustar coordenadas](#ajustar-coordenadas)
- [Solución de problemas (FAQ)](#solución-de-problemas-faq)
- [Glosario rápido](#glosario-rápido)

---

## Visión general

- **Home**: muestra cartas (projects) y stickers colocados en posiciones **absolutas** con `top/left`.
  Puedes filtrar por categoría; al activar una categoría cambia **el tema** (fondo, overlay, filtros y colores)
  y se ocultan/muestran cartas según pertenezcan a esa categoría o sean **exclusivas** de ella.
- **Proyecto**: cada detalle se construye desde `data/_PROYECTOS/<slug>/<slug>.json` y muestra
  **imagen principal → título → texto → galería**. El tema del detalle se toma de la **primera
  categoría** en la que aparezca ese `slug` (según el orden fijo de `CATEGORIES`).

Todo el *look & feel* se controla desde `data/home.json`, sin tocar CSS.

---

## Estructura de carpetas

```
/css
  styles.css                 # estilos globales (sin valores “hardcode” de tema)
/data
  home.json                  # configuración general (tema, categorías, coords, stickers, etc.)
  /_FONDOS                   # imágenes de fondo por categoría (opcional)
    flashes.jpg
    mockup.jpg
    moodboard.jpg
    tattoo.jpg
  /_PROYECTOS
    /<slug>                  # carpeta de cada proyecto
      <slug>.json            # metadatos del proyecto
      1.jpg                  # imagen principal por defecto
      2.jpg, 3.jpg, ...      # imágenes de galería
/js
  main.js                    # lógica de la home: tema + cartas + filtro
  project.js                 # lógica del detalle: tema + render del proyecto
index.html                   # página de home
project.html                 # plantilla del detalle (carga project.js)
```

---

## Arranque rápido

1. Abre el proyecto con un **servidor estático** desde la **raíz** del repo
   (p. ej. *Live Server* en VS Code).
2. Ve a `index.html` (home) o `project.html?slug=<slug>` (detalle).
3. Mantén la consola abierta para ver cualquier aviso de rutas/JSON.

> ⚠️ Cargar directamente `index.html` como archivo local (`file://`) puede bloquear `fetch(...)` del JSON.
> Usa un servidor (Live Server, `python -m http.server`, etc.).

---

## Cómo funciona el tema (background, overlay, filtros, colores)

### Variables CSS

El tema se aplica con **CSS Custom Properties** que inyecta JS:

- `--bg-color` — color base del fondo (cuando no hay imagen).
- `--bg-image` — `url("...")` de la imagen de fondo.
- `--bg-filters` — filtros de CSS aplicados a la capa de fondo.
- `--overlay-color` — color del overlay (normalmente `rgba(...)` con alpha).
- `--text-color` — color de texto y elementos interactivos (reposo).
- `--hover-color` — color al *hover/focus* de botones/enlaces.

### `backgrounds` en `home.json`

Ejemplo reducido:

```json
{
  "backgrounds": {
    "default": {
      "bg": "blue",
      "overlay": "rgba(0,0,0,0.10)",
      "filters": "none",
      "color": "red",
      "hover": "lime"
    },
    "moodboard": {
      "image": "data/_FONDOS/moodboard.jpg",
      "overlay": "rgba(0,0,0,0.18)",
      "filters": "saturate(1.05)",
      "color": "azure",
      "hover": "tan"
    }
  }
}
```

- **`default`** se aplica al cargar la home (sin filtro) y como *fallback*.
- Para cada categoría (`flashes`, `mockup`, `moodboard`, `tattoo`) puedes definir:
  - `image`: ruta de imagen (relativa o absoluta). Se resuelve respecto a la página con `new URL(...)`.
  - `bg`: color de fondo si no usas `image` (o mientras carga).
  - `overlay`: color por encima del fondo (recomendado `rgba(..., 0.08–0.25)`).
  - `filters`: cadena con filtros CSS (ver abajo).
  - `color`: color del texto/enlaces **en reposo**.
  - `hover`: color del texto/enlaces al **hover/focus**.

> Puedes usar colores CSS estándar: `#hex`, `rgb()`, `hsl()`, o nombres (`azure`, `gold`, etc.).

### Filtros CSS que puedes usar

La propiedad `filters` acepta cualquier combinación de funciones **en orden**, por ejemplo:

- `none`
- `blur(2px)`
- `brightness(0.9)`
- `contrast(1.1)`
- `saturate(1.05)`
- `grayscale(0.2)`
- `sepia(0.15)`
- `hue-rotate(12deg)`
- **Combinados**: `"contrast(1.05) saturate(1.05)"`

> Consejo: empieza con valores suaves (±5–10%) para que no distorsione el arte.

### Overlay: qué es y cómo usarlo

Es una capa semitransparente por encima del fondo para **mejorar contraste** del contenido.
Define `overlay` como un color (normalmente `rgba` con `alpha` bajo):

- Oscurecer una imagen muy clara: `rgba(0,0,0,0.18)`
- Aclarar una imagen muy oscura: `rgba(255,255,255,0.12)`

---

## Home (`js/main.js`)

### Responsabilidades

1. Cargar `data/home.json` y los JSON de cada proyecto.
2. Crear **todas** las cartas de proyecto (incluyendo las **exclusivas**).
3. Crear stickers normales y, si existen, **stickers exclusivos** por categoría.
4. Aplicar el **tema** según la categoría activa.
5. Filtrar la visibilidad de cartas al cambiar de categoría.

### Carga de datos

- **Categorías**: `HOME.categories[cat]` → array de *slugs*.
- **Exclusivos**: `HOME.exclusiveByCategory[cat]` → *slugs* ocultos por defecto, visibles **solo** cuando activas esa `cat`.
- **Stickers**: `HOME.stickers` → array `{ image, slug }`.
- **Stickers exclusivos**: `HOME.exclusiveStickersByCategory[cat]` → array `{ image, slug }`, visibles solo con esa `cat`.
- **Coords**: `HOME.coords[slug]` → `[top, left]` en **dvh/dvw** (ver abajo).

> Los **proyectos exclusivos** también se **crean** al inicio (para que ya tengan coords) pero arrancan con la clase `is-off` (ocultos).

### Creación de cartas (projects y stickers)

- **Project card**:
  - `href="project.html?slug=<slug>"`
  - imagen de portada: `<proyectos>/<slug>/{imagenPrincipal || 1.jpg}`
  - posición: usa `coords` si existen, si no usa posición aleatoria agradable.
- **Sticker card**:
  - igual `href`, pero **siempre posición aleatoria** (no usa coords).
  - Si la propiedad `image` no empieza por `data/` ni `http`, se asume ruta a
    `data/_PROYECTOS/<slug>/<image>`.

### Coordenadas (`coords`)

- Defínelas en `home.json` así:
  ```json
  "coords": {
    "caballo1": [24, 42],
    "caballo2": [66, 22]
  }
  ```
- Unidades: **`dvh`/`dvw`** (viewport dinámico). El código hace:
  ```js
  top: <top>dvh;
  left: <left>dvw;
  ```
- **Importante**: las cartas llevan `transform: translate(-50%, -50%)`, por lo que `top/left`
  posiciona el **centro** de la carta (no su esquina). Evita extremos (`0` o `100`), que pueden
  quedar parcialmente fuera de la vista.
- Si **no** hay `coords` para un slug → se usa **posición aleatoria**.

### Categorías, exclusivos y filtro

- **Sin filtro (inicio)**: tema `backgrounds.default`; se muestran **todas** las cartas de `categories` y stickers **normales**.  
  Los proyectos y stickers **exclusivos** están **ocultos**.
- **Con filtro `cat`**: se aplica el tema de `cat` y se muestran:
  - proyectos de `categories[cat]` **+** `exclusiveByCategory[cat]`
  - stickers **normales** cuyos *slugs* estén en `categories[cat]`
  - stickers **exclusivos** de `exclusiveStickersByCategory[cat]`

### Tamaños (`sizes`)

En `home.json`:

```json
"sizes": {
  "default": 14,
  "byCategory": {
    "flashes": 20,
    "tattoo": 18
  }
}
```

- Valores en **`dvw`** (anchura/altura de carta cuadrada).
- Al filtrar, se recalcula el tamaño para **todas** las cartas visibles.

---

## Proyecto (`js/project.js`)

### Tema por primera categoría

- Se lee `?slug=<slug>` de la URL.
- Se carga `home.json` y se verifica en qué categoría aparece ese `slug`.
- Se usa la **primera** que coincida, según el orden fijo:
  ```js
  const CATEGORIES = ["flashes", "mockup", "moodboard", "tattoo"];
  ```
- Si no aparece en ninguna → se usa `backgrounds.default`.

### Render del contenido

Orden exacto de render en el contenedor (`#projectContainer` o `.project-container`):

1. **Imagen principal (hero)**
2. **Título**
3. **Texto**
4. **Galería**

Además, se inyecta un botón “← Home” con las clases
`cat-btn as-link volver-home` (hereda colores/hover del tema).

### JSON de proyecto: campos aceptados

Archivo: `data/_PROYECTOS/<slug>/<slug>.json`. Campos equivalentes aceptados:

```json
{
  "titulo": "Nombre bonito",               // alias: "title"
  "texto": "Descripción...
con saltos.",  // alias: "descripcion", "description"
  "imagenPrincipal": "1.jpg",              // alias: "imagen_principal", "hero"
  "galeria": ["2.jpg", "3.jpg"]            // alias: "gallery", "imagenes", "images"
}
```

> La imagen principal **no se duplica** si también está en la galería.

---

## Estilos (`css/styles.css`)

### Capas de fondo

- `.bg` — capa del fondo con `background-color`, `background-image`, `background-size: cover`, etc.
- `.bg-overlay` — capa superior con `background: var(--overlay-color)`.
- Ambas se **crean por JS** si no existen (no hace falta que estén en el HTML).

### Interacciones

- Botones/enlaces usan `color: var(--text-color)` y cambian a `var(--hover-color)` en *hover/focus*.
- No hay `border-radius` y el hover es limpio (sin fondos extra).

### Accesibilidad y rendimiento

- Tipografía y colores dependen de variables de tema.
- Se evita el “flash” inicial mostrando el body solo cuando el tema está aplicado (`body.themed`).
- Transiciones suaves y `prefers-reduced-motion` respetado en CSS.

---

## Autoría de contenidos (guía de mantenimiento)

### Añadir un proyecto nuevo

1. Crea carpeta `data/_PROYECTOS/<slug>/`.
2. Añade `<slug>.json` con al menos un título. Opcionalmente define `imagenPrincipal`, `galeria` y `texto`.
3. Añade imágenes (`1.jpg`, `2.jpg`…).
4. En `data/home.json`, añade el `<slug>` en la(s) categoría(s) que quieras:
   ```json
   "categories": {
     "tattoo": ["caballo2", "<slug>"]
   }
   ```
5. (Opcional) Define sus `coords`:
   ```json
   "coords": {
     "<slug>": [40, 70]
   }
   ```

### Añadir/modificar fondos de categoría

- Coloca las imágenes en `data/_FONDOS/` y referencia su ruta en `backgrounds.<cat>.image`.
- Ajusta `overlay`, `filters`, `color` y `hover` para esa categoría.
- Si no quieres imagen de fondo, borra `image` y usa solo `bg` (color plano).

### Hacer un proyecto “exclusivo” de una categoría

- Añádelo a `exclusiveByCategory.<cat>`:
  ```json
  "exclusiveByCategory": {
    "moodboard": ["<slug>"]
  }
  ```
- El proyecto no aparece en el estado inicial; **solo** cuando filtras `moodboard`.
- Sus `coords` se aplican igualmente desde el arranque (aunque esté oculto).

### Añadir stickers normales y exclusivos

- **Normales** (siempre presentes, filtrados por slug al activar categoría):
  ```json
  "stickers": [
    { "image": "2.jpg", "slug": "<slug>" }
  ]
  ```
- **Exclusivos** (solo visibles con su categoría):
  ```json
  "exclusiveStickersByCategory": {
    "tattoo": [
      { "image": "promo.png", "slug": "<slug>" }
    ]
  }
  ```
- `image`:
  - si empieza por `data/` o `http` se usa tal cual;
  - si no, se asume `data/_PROYECTOS/<slug>/<image>`.

### Ajustar coordenadas

- `coords["<slug>"] = [top, left]` en **dvh/dvw**.
- Recuerda que `top/left` apuntan al **centro** de la carta (`translate(-50%,-50%)`).
- Evita extremos (0 o 100). Recomendado: **2–98**.
- Si no defines coords, el sistema elige una posición aleatoria agradable.

---

## Solución de problemas (FAQ)

**No se ve la imagen de fondo.**  
- Asegúrate de que la ruta `backgrounds.<cat>.image` es correcta.
- Revisa la consola por 404 del archivo.
- Sirve el sitio desde la **raíz** del proyecto; las rutas se resuelven con `new URL(image, document.baseURI)`.

**Al filtrar una categoría no aparece un proyecto.**  
- Verifica que el *slug* está en `categories.<cat>` **o** en `exclusiveByCategory.<cat>`.
- Si es exclusivo, recuerda que **no** aparece sin filtro.

**Las cartas no están donde esperaba.**  
- Si usas `coords`, recuerda: `top/left` posicionan el **centro**.
- Evita `[100,100]` (puede quedarse medio fuera). Prueba `[80,80]` para “abajo/derecha”.

**El detalle del proyecto no tiene el tema correcto.**  
- El tema del detalle se toma de la **primera categoría** donde está el `slug` (según `["flashes","mockup","moodboard","tattoo"]`).

**El JSON del proyecto no muestra texto/galería.**  
- Usa cualquiera de los alias permitidos (`titulo`/`title`, `texto`/`descripcion`/`description`, etc.).
- Asegúrate de que las rutas de imágenes existen en la carpeta del proyecto.

---

## Glosario rápido

- **dvh/dvw**: unidades de viewport “dinámico” (respetan barras del navegador móvil).
- **overlay**: capa de color semitransparente que se dibuja por encima del fondo.
- **filters**: efectos CSS que se aplican a la imagen de fondo (contraste, saturación, etc.).
- **exclusivo**: proyecto o sticker que solo aparece al activar una categoría concreta.
- **slug**: identificador del proyecto (nombre de su carpeta y de su JSON).

---

¿Dudas o mejoras? Este proyecto está pensado para que **no haga falta tocar CSS** para cambiar el aspecto.
Todo lo importante vive en `home.json` y en los JSON de cada proyecto.

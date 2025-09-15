# Viciostorpes — Guía completa (para editores y devs)

> Sitio estático con **home-lienzo** y páginas de **proyecto**. Todo se configura en **JSON** (sin builds ni frameworks), y el tema visual se aplica con **CSS Variables**.
>
> Este README explica **cómo mantener el sitio sin programar** y, al final, incluye detalles para desarrolladores.

---

## Índice

- [Viciostorpes — Guía completa (para editores y devs)](#viciostorpes--guía-completa-para-editores-y-devs)
  - [Índice](#índice)
  - [Qué es y cómo se ve](#qué-es-y-cómo-se-ve)
  - [Abrir el proyecto](#abrir-el-proyecto)
  - [Estructura de carpetas](#estructura-de-carpetas)
  - [Conceptos clave](#conceptos-clave)
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
  - [Solución de problemas](#solución-de-problemas)
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
    "image": "data/_FONDOS/moodboard.jpg",
    "overlay": "rgba(0,0,0,0.18)",
    "filters": "contrast(1.05) saturate(1.05)",
    "color": "azure",
    "hover": "tan"
  }
}
```

#### ¿Qué hace cada opción?

- `bg` → **color de fondo** si no hay `image` o mientras carga.
- `image` → **imagen de fondo** (ruta relativa o absoluta). 
- `overlay` → color por encima del fondo para mejorar el **contraste** (usa `rgba(..., alpha_baja)`).
- `filters` → cadena con filtros CSS aplicados a la imagen de fondo. Puedes combinar:
  - `none` → sin filtros.
  - `blur(2px)` → desenfoque.
  - `brightness(0.9)` → oscurece un 10%.
  - `contrast(1.1)` → más contraste (10%).
  - `saturate(1.05)` → más saturación (5%).
  - `grayscale(0.2)` → 20% en escala de grises.
  - `sepia(0.15)` → 15% tono sepia.
  - `hue-rotate(12deg)` → gira el tono 12° (útil para variar color).
  - **Combinados**: `"contrast(1.05) saturate(1.05)"`.
- `color` → color del **texto** y botones en reposo.
- `hover` → color del **texto** y botones al pasar el ratón / foco.

> Consejo: empieza con cambios suaves (±5–10%) para que no distorsione el arte.

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

---

## Buenas prácticas con imágenes (¡minúsculas!)

GitHub Pages es **sensible a mayúsculas/minúsculas**. 
`1.jpg` **no** es lo mismo que `1.JPG` o `1.jpeg`. Si el JSON pide `1.jpg` y el archivo es `1.JPG` obtendrás **404**.

**Recomendación:**
- Nombra **todas** las imágenes en **minúsculas**, sin espacios ni tildes.
- Usa `.jpg` (o `.png` si realmente es PNG) y escribe la **misma extensión** en el JSON.

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

---

## Detalles para desarrolladores

### Datos y flujo

- **Dynamic nav**: los botones de categoría se generan desde `Object.keys(HOME.categories)`; no hay lista hardcode.
- **Theme**: `applyThemeForCategory(cat)` inyecta `--bg-image`, `--bg-color`, `--bg-filters`, `--overlay-color`, `--text-color`, `--hover-color`.
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
    "flashes": { "image": "data/_FONDOS/flashes.jpg", "overlay": "rgba(0,0,0,0.12)", "filters": "contrast(1.05)", "color": "#fff", "hover": "#ffdf6e" }
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

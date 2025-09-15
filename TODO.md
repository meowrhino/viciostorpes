# TODO del Proyecto

## Novedades v2
- Home sin grid: cada item (proyecto o sticker) se posiciona por coordenadas (`dvh`/`dvw`), tomando el punto como **centro**.
- `home.json` define tamaños en `sizes` (default y por categoría).
- Cada `<slug>.json` puede incluir `coords: [top_dvh, left_dvw]`. Si falta, se coloca en una posición **aleatoria**.
- Página de proyecto: márgenes 20dvh arriba, 50dvh abajo. Orden: **hero → título → descripción → galería**.
- El enlace “volver a la home” reutiliza el estilo de los botones del menú.

## Estructura de archivos
- `/index.html` → Home con categorías y grid libre.
- `/project.html` → Vista individual de proyecto.
- `/css/styles.css` → Estilos generales, categorías y texto central.
- `/js/main.js` → Lógica de home (coords, tamaños, filtros, fondos, center-text).
- `/js/project.js` → Lógica de página de proyecto.
- `/data/home.json` → Configuración global (categorías, tamaños, textos, fondos).
- `/data/_FONDOS/` → Fondos de cada categoría.
- `/data/_PROYECTOS/<slug>/<slug>.json` + imágenes.

## Ejemplo de configuración
### home.json
```json
{
  "sizes": {
    "default": 18,
    "byCategory": {
      "flashes": 22,
      "mockup": 16,
      "moodboard": 20,
      "tattoo": 18
    }
  }
}
```

### Proyecto con coords
```json
{
  "titulo": "Caballo 1",
  "descripcion": "Texto…",
  "imagenPrincipal": "1.jpg",
  "galeria": ["1.jpg","2.jpg","3.jpg","4.jpg","5.jpg"],
  "coords": [22, 28]
}
```
> `coords[0]` = **top** en `dvh`, `coords[1]` = **left** en `dvw`.

## Cómo funciona
- **Sin filtro** → se muestran todos, con tamaño `sizes.default` (dvw).
- **Con filtro** → solo slugs de la categoría activa, con tamaño `sizes.byCategory[cat]` si existe (si no, usa `default`).
- **Stickers** → actualmente desactivados. Antes se colocaban con coords aleatorias.

## Backlog (opcional)
- [ ] Evitar colisiones entre piezas (layout solver ligero).
- [ ] Transiciones/animaciones al activar/desactivar filtros y al cambiar tamaño.
- [ ] Persistir posiciones y categoría activa en `sessionStorage`.
- [ ] Soporte de `coords` también para stickers en `home.json`.

## Plan v3
- Transiciones (opacity/scale/size) al filtrar.
- En lugar de ocultar con `display:none`, usar `.is-off` para poder animar.
- Stickers: aceptar `image: "2.jpg"` o ruta completa; si solo es el nombre, se resuelve como `data/_PROYECTOS/<slug>/2.jpg`.
- Mantener coords en dvh/dvw, y tamaños configurables por categoría.
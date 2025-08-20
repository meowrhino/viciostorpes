# TODO del Proyecto (v2: coords aleatorias y tamaños por categoría)

## Cambios clave
- Home sin grid: cada item (proyecto o sticker) se **posiciona por coordenadas** en **dvh/dvw**,
  tomando el punto dado como **centro** del cuadrado.
- `home.json` incorpora `sizes` para definir tamaño por defecto y por categoría (en **dvw**).
- Cada `<slug>.json` puede incluir `coords: [top_dvh, left_dvw]` (ambos 0–100). Si falta, se coloca **aleatorio**.
- Project page: márgenes **20dvh** arriba y **50dvh** abajo; orden **hero → título → descripción → galería**.
- El enlace “volver a la home” usa el **mismo estilo** que los botones del menú.

## Estructura
- `/index.html` y `/project.html`
- `/css/styles.css`
- `/js/main.js` (coords + sizes + filtros + fondos)
- `/js/project.js` (orden y márgenes, fondo por categoría)
- `/data/home.json`
- `/data/_FONDOS/` (`flashes.jpg`, `mockup.jpg`, `moodboard.jpg`, `tattoo.jpg`)
- `/data/_PROYECTOS/<slug>/<slug>.json` + `1.jpg…5.jpg`

## home.json (ejemplo)
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

## JSON de proyecto con coords
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

## Comportamiento
- Sin filtro: se muestran **todos** con tamaño `sizes.default` (dvw).
- Con filtro activo: solo se muestran los slugs de la categoría, con tamaño `sizes.byCategory[cat]` si existe (si no, `default`).
- Stickers se colocan con coords **aleatorias** (más adelante se podría añadir coords a `home.json` para stickers).

## Pendientes opcionales
- [ ] Evitar colisiones entre piezas (layout solver ligero).
- [ ] Transiciones/animaciones al activar/desactivar filtros y al cambiar tamaño.
- [ ] Persistir posiciones y categoría activa en `sessionStorage`.
- [ ] Soporte de `coords` también para stickers en `home.json`.

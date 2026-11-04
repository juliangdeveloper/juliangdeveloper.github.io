# juliangdeveloper.github.io

Juegos y herramientas que se abren en el navegador, sin instalar.

**[Abrir el portafolio](https://juliangdeveloper.github.io/)**

<img src="img/portafolio.png" alt="Portafolio con las tarjetas de los proyectos" width="320">

## Cómo se usa

- Toca una tarjeta para ver el detalle. El botón abre la app a pantalla completa, con **Inicio** para volver.
- **＋ Agregar proyecto** acepta `usuario.github.io/repo`, `github.com/usuario/repo` o `usuario/repo`.
- **✕** deja de seguir un proyecto y se puede deshacer. **Restaurar proyectos por defecto** devuelve los de fábrica y conserva los que agregaste. El proyecto fijo se queda y no tiene ✕.
- La lista queda en este navegador. En el celular y en la tablet la pantalla no se desplaza.
- La fase, el estado y el objetivo salen solo de `meta.v1.<app>` cuando el registro es válido (`v` 1, el mismo slug y fase, estado y fases completadas dentro de rango). Si no hay meta, o está incompleta o inválida, la tarjeta sigue en Proyectos y la página no se rompe.
- En **Ajustes**, **Mazmorra** empieza apagada. Cada proyecto es un objeto en la sala de su fase. Definición y Diseño comparten sala. Una sala sin proyectos no se muestra.
- Toca el nivel (Ceniza, Brasa, Llama, Forja o Faro) para ver cuántos lanzamientos pide, cuántos proyectos caben y cuánto falta para el siguiente.
- Si una sala supera su cupo, lo que sobra es una pila con el número. Al tocarla ves las apps de esa sala.
- **Trono** lista las habilidades que las apps guardan en `proyecto.aportes`: `id`, `aporte` de 1 a 99 y `fuente` `creacion` o `uso`. Si `proyecto.bloqueada` es `true`, el objeto se ve bloqueado.

## Stack

HTML, CSS y JavaScript, sin build. Los datos quedan en `localStorage`.

## Licencia

MIT

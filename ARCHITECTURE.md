# ARCHITECTURE.md - Counter App

> **LECTURA OBLIGATORIA** para todos los agentes antes de implementar cualquier tarea.

## Stack Tecnológico

| Tecnología | Versión | Propósito |
|---|---|---|
| Angular | 21.2.0 | Framework principal |
| NgRx SignalStore | 21.0.1 | Gestión de estado reactivo |
| Tailwind CSS | 4.x (via @tailwindcss/postcss) | Estilos utilitarios |
| TypeScript | 5.9.x | Lenguaje |
| Node.js | 22.x | Runtime |

## Decisiones Arquitectónicas

### Routing: NO configurado

**Decisión**: No se configura Angular Router.
**Razón**: La aplicación es un contador simple con un solo componente (`App`). No hay navegación entre vistas. Agregar routing añadiría complejidad innecesaria sin beneficio.

### Componentes: Standalone

Todos los componentes usan la API standalone de Angular 21. No hay `NgModule` en el proyecto. El bootstrap se hace directamente en `main.ts` con `bootstrapApplication()`.

### Estado: NgRx SignalStore con `providedIn: 'root'`

El store se define como un servicio inyectable a nivel raíz usando `signalStore({ providedIn: 'root' }, ...)`. No necesita ser registrado en providers de ningún componente ni en `app.config.ts`.

### Estilos: Tailwind CSS 4 via PostCSS

Tailwind CSS v4 está configurado via `@tailwindcss/postcss` en `postcss.config.js`. Los estilos globales están en `src/styles.css` con `@import "tailwindcss"`. Se usan clases utilitarias directamente en los templates HTML.

## Estructura de Carpetas

```
src/
├── app/
│   ├── store/
│   │   ├── counter.types.ts    ← T-001: Interfaces y tipos
│   │   └── counter.store.ts    ← T-002: NgRx SignalStore
│   ├── app.ts                  ← T-003: Componente principal
│   ├── app.html                ← T-003: Template del componente
│   ├── app.css                 ← Estilos del componente (puede quedar vacío si se usa Tailwind)
│   ├── app.config.ts           ← Configuración de la aplicación (NO modificar salvo necesidad)
│   └── app.spec.ts             ← Tests del componente
├── main.ts                     ← Bootstrap de la aplicación (NO modificar)
├── index.html                  ← HTML base (NO modificar)
└── styles.css                  ← Estilos globales con Tailwind (NO modificar)
```

## IMPORTANTE: Convención de Nombres Angular 21

Angular 21 usa nombres de archivo simplificados. Los archivos **NO** llevan sufijo `.component`:

| Archivo real | NO usar |
|---|---|
| `app.ts` | ~~`app.component.ts`~~ |
| `app.html` | ~~`app.component.html`~~ |
| `app.css` | ~~`app.component.css`~~ |

La clase del componente se llama `App` (no `AppComponent`). Respetar estos nombres tal como están.

## Patrón de Estado: Cómo Usar NgRx SignalStore

### API disponible (importar desde `@ngrx/signals`)

- `signalStore` - Crea el store como clase inyectable
- `withState` - Define el estado inicial
- `withMethods` - Define métodos que modifican el estado
- `withComputed` - Define señales computadas (si se necesitan)
- `patchState` - Actualiza el estado dentro de los métodos

### Ejemplo de referencia para T-002

```typescript
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { CounterState } from './counter.types';

const initialState: CounterState = {
  count: 0,
};

export const CounterStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    increment(): void {
      patchState(store, (state) => ({ count: state.count + 1 }));
    },
  }))
);
```

### Ejemplo de uso en componente para T-003

```typescript
import { Component, inject } from '@angular/core';
import { CounterStore } from './store/counter.store';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly store = inject(CounterStore);
}
```

En el template:
```html
<p>{{ store.count() }}</p>
<button (click)="store.increment()">Incrementar</button>
```

## Conexión Entre Componentes

```
main.ts
  └── bootstrapApplication(App, appConfig)
        └── App (app.ts)
              └── inject(CounterStore)
                    └── CounterStore (counter.store.ts)
                          └── usa CounterState (counter.types.ts)
```

- `App` inyecta `CounterStore` directamente con `inject()`.
- `CounterStore` usa `CounterState` como tipo para definir su estado.
- No hay intermediarios, módulos, ni servicios adicionales.

## Archivos Placeholder y Responsabilidades por Tarea

### T-001: `src/app/store/counter.types.ts`
- **Qué hacer**: Definir `export interface CounterState { count: number; }`
- **Qué NO hacer**: No agregar lógica, no importar Angular ni NgRx

### T-002: `src/app/store/counter.store.ts`
- **Qué hacer**: Crear el store con `signalStore()`, `withState()`, `withMethods()`, y `patchState()`
- **Importar**: `CounterState` de `./counter.types`, funciones de `@ngrx/signals`
- **Config**: Usar `{ providedIn: 'root' }` como primer argumento de `signalStore()`
- **Qué NO hacer**: No registrar el store en providers (ya es `providedIn: 'root'`)

### T-003: `src/app/app.ts` + `src/app/app.html`
- **Qué hacer en app.ts**: Inyectar `CounterStore` con `inject()`, exponer en la clase
- **Qué hacer en app.html**: Mostrar `store.count()`, botón con `(click)="store.increment()"`
- **Estilos**: Usar clases Tailwind CSS directamente en el HTML (layout centrado, botón con hover)
- **Qué NO hacer**: No crear archivos nuevos, no agregar routing

## Reglas para los Agentes

### HACER

1. Usar `inject()` para inyección de dependencias (no constructores)
2. Usar signals para reactividad (`store.count()` en templates)
3. Usar built-in control flow (`@if`, `@for`) en lugar de directivas estructurales (`*ngIf`, `*ngFor`)
4. Usar clases Tailwind CSS para estilos en los templates
5. Mantener `App` como standalone component (ya lo es)
6. Verificar que `ng build` compila sin errores después de cada cambio
7. Respetar las importaciones relativas: `./store/counter.types`, `./store/counter.store`

### NO HACER

1. **NO crear Angular Router ni rutas** - La app no usa routing
2. **NO crear archivos nuevos** que no estén en la lista de tareas
3. **NO modificar `main.ts`**, `app.config.ts`, `styles.css`, ni `index.html`
4. **NO usar `NgModule`** - Todo es standalone
5. **NO registrar `CounterStore` en providers** - Ya usa `providedIn: 'root'`
6. **NO usar `*ngIf` ni `*ngFor`** - Usar `@if` y `@for`
7. **NO renombrar archivos** - Los nombres siguen la convención Angular 21 (sin `.component`)
8. **NO instalar dependencias adicionales** - Todo lo necesario ya está instalado
9. **NO usar `signal()` local en `App` para el contador** - El estado vive en `CounterStore`

## Comandos Útiles

```bash
npm start        # Servidor de desarrollo (ng serve)
npm run build    # Build de producción (ng build)
npm test         # Ejecutar tests (ng test)
```

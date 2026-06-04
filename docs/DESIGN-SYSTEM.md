# Design System — reuso

Identidad visual premium · minimalista editorial · fashion internacional  
Referentes: Zara, COS, Nike, vintage premium.

---

## Paleta de colores

### Brand
| Token | Hex | Uso |
|-------|-----|-----|
| `brand-green` | `#1B3022` | Header promo, CTAs secundarios, logo |
| `brand-green-light` | `#2A4536` | Hover verde |
| `brand-beige` | `#D2C1B0` | Utility bar, footer |
| `brand-beige-muted` | `#F3EDE8` | Inputs pill, fondos suaves |
| `brand-orange` | `#F38121` | CTAs primarios, estados activos |
| `brand-orange-hover` | `#E07010` | Hover botones |

### Neutros
| Token | Hex | Uso |
|-------|-----|-----|
| `foreground` | `#0A0A0A` | Texto principal |
| `neutral-500` | `#737373` | Texto secundario |
| `neutral-100` | `#F5F5F5` | Fondo cards producto |
| `neutral-50` | `#FAFAFA` | Secciones alternas |

### Uso Tailwind
```tsx
<div className="bg-brand-green text-white" />
<button className="bg-brand-orange hover:bg-brand-orange-hover" />
<article className="bg-neutral-100" />
```

---

## Tipografías

| Rol | Familia | Uso |
|-----|---------|-----|
| **UI** | Gotham Bold (+ Montserrat fallback) | Nav, labels, botones, precios |
| **Body** | Montserrat 400–600 | Párrafos, descripciones |
| **Editorial** | Cormorant Garamond | Heroes, títulos banner, menú móvil |
| **Logo** | Reuso Script | Wordmark |

### Clases utilitarias
```html
<p class="text-label">ETIQUETA SECCIÓN</p>
<a class="text-nav">NAVEGACIÓN</a>
<h1 class="text-editorial-hero">MUJER</h1>
<p class="text-body-muted">Texto secundario</p>
```

Coloca `Gotham-Bold.woff2` en `public/fonts/`.

---

## Espaciado

Escala base **4px**:

| Token | Valor | Tailwind |
|-------|-------|----------|
| xs | 4px | `1` |
| sm | 8px | `2` |
| md | 16px | `4` |
| lg | 24px | `6` |
| xl | 32px | `8` |
| 2xl | 48px | `12` |
| section | 48–96px | `.section-editorial` |

### Container
```tsx
import { Container } from "@/components/ui";

<Container>...</Container>
// max-width 1280px, padding responsive 16→24→32px
```

---

## Componentes UI

Import centralizado:
```tsx
import {
  Button,
  Badge,
  Input,
  ProductCard,
  NavLink,
  Container,
  HeadingEditorial,
} from "@/components/ui";
```

### Button
| Variant | Uso |
|---------|-----|
| `primary` | CTA naranja |
| `secondary` | Verde marca |
| `outline` | Secundario sobre blanco |
| `ghost` | Acciones terciarias |
| `link` | Texto con subrayado |

Tamaños: `xs` | `sm` | `md` | `lg`

### ProductCard
- Aspect ratio 3:4
- Zoom imagen al hover
- Badge "Nuevo"
- Wishlist en hover (desktop) / siempre (mobile)
- Marca + nombre + precio

### NavLink
- Uppercase tracking amplio
- Subrayado animado (estilo COS)

---

## Layout

```
AnnouncementBar  → verde, promo
UtilityBar       → beige, login + búsqueda (desktop)
MainNav          → sticky, blur, drawer móvil editorial
SiteFooter       → beige, accordion mobile
```

---

## Animaciones

| Clase | Efecto |
|-------|--------|
| `animate-fade-in-up` | Entrada suave |
| `animate-fade-in-delay-1/2` | Stagger hero |
| `animate-slide-down` | Dropdown / drawer |
| `image-zoom` | Zoom producto en hover |
| `link-underline` | Subrayado nav |
| `hover-lift` | Elevación cards |

Respetan `prefers-reduced-motion`.

---

## Mobile-first

1. Grids: 2 col → 3 → 4 → 5
2. Nav: drawer full-width con tipografía editorial grande
3. Footer: acordeones por columna
4. Búsqueda: icono expandible en header móvil
5. Touch targets mínimo 44px (`min-h-11` en botones)

---

## Archivos clave

```
src/design-system/tokens.ts   → tokens TS
src/app/globals.css           → CSS variables + utilities
src/components/ui/            → componentes reutilizables
docs/DESIGN-SYSTEM.md         → esta guía
```

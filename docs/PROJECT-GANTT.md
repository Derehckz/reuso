# Cronograma reuso — 15 may → 19 jun 2026 (producción)

**Hito final:** sistema en **producción** el **19 de junio de 2026**  
**Hoy de referencia:** 2 de junio de 2026 (17 días hábiles restantes)  
**Alcance:** ecommerce reuso (Next.js 16, Prisma, admin tipo PrestaShop/Woo, tienda, checkout, MP, envíos)

---

## Resumen ejecutivo

| Métrica | Valor |
|--------|--------|
| Días totales del proyecto | 35 (15 may – 19 jun) |
| Días transcurridos (hasta 2 jun) | ~19 |
| Avance estimado funcional | **~72 %** (core listo; falta cierre prod) |
| Días restantes para go-live | **17** (3–19 jun) |
| Estado código en repo | 1 commit base (28 may); **mayoría del trabajo en working tree** — planificar commit + deploy |

---

## Leyenda Gantt

| Estado | Significado |
|--------|-------------|
| `done` | Implementado y probado en dev |
| `active` | En curso / sin cerrar en prod |
| `crit` | Bloqueante para go-live |
| `qa` | QA / UAT |

---

## Gantt 1 — Visión general (mayo – junio)

```mermaid
gantt
    title reuso — Línea de tiempo al 19-jun-2026 (producción)
    dateFormat YYYY-MM-DD
    axisFormat %d %b

    section Fundación (listo)
    Arquitectura Next.js + Prisma + capas           :done, f1, 2026-05-15, 2026-05-22
    Schema catálogo pedidos auth                    :done, f2, 2026-05-15, 2026-05-24
    Storefront catálogo carrito cuenta              :done, f3, 2026-05-18, 2026-05-27
    Checkout MP BX código sin prueba real           :active, f4, 2026-05-20, 2026-05-28
    Repo inicial y configuración base               :done, f5, 2026-05-28, 2026-05-29

    section Admin core (listo)
    Shell admin RBAC dashboard                      :done, a1, 2026-05-29, 2026-05-31
    Productos CRUD ofertas variantes stock          :done, a2, 2026-05-31, 2026-06-01
    Atributos globales módulo                       :done, a3, 2026-05-31, 2026-06-01
    Multi-categoría checkboxes tags                 :done, a4, 2026-05-31, 2026-06-01
    Mejoras admin PM galería bulk órdenes           :done, a5, 2026-05-31, 2026-06-02

    section Robustez QA (listo)
    Auditoría producción QA                         :done, q1, 2026-06-01, 2026-06-02
    Fase 0 críticos checkout stock auth             :done, q2, 2026-06-02, 2026-06-02
    Fases 1-3 carrito catálogo password tests       :done, q3, 2026-06-02, 2026-06-02

    section UX contenido catálogo (listo)
    Upload archivos banners contenido               :done, c1, 2026-06-02, 2026-06-02
    Hero categorías imágenes catálogo               :done, c2, 2026-06-02, 2026-06-02
    Login admin separado bloqueo clientes             :done, c3, 2026-06-02, 2026-06-02
    Módulo categorías árbol SEO DnD bulk            :done, c4, 2026-06-02, 2026-06-02

    section Producción (pendiente)
    Infra hosting DB dominio SSL                    :crit, p1, 2026-06-03, 2026-06-04
    Variables entorno prod secrets                  :crit, p2, 2026-06-03, 2026-06-04
    Mercado Pago producción webhooks                :crit, p3, 2026-06-05, 2026-06-06
    SMTP emails transaccionales                     :crit, p4, 2026-06-07, 2026-06-08
    BlueExpress cotización prod                     :crit, p5, 2026-06-07, 2026-06-08
    Migración datos import WooCommerce              :p6, 2026-06-09, 2026-06-10
    Commit deploy pipeline CI                       :crit, p7, 2026-06-09, 2026-06-10
    QA regresión E2E manual                         :qa, p8, 2026-06-11, 2026-06-12
    SEO performance seguridad prod                  :p9, 2026-06-13, 2026-06-14
    UAT cliente correcciones                        :qa, p10, 2026-06-15, 2026-06-16
    Buffer fixes documentación runbook              :p11, 2026-06-17, 2026-06-18
    Go-live producción 19-jun                       :milestone, golive, 2026-06-19, 0d
```

---

## Gantt 2 — Detalle por día (hecho: 15 may – 2 jun)

### Semana 1 · 15–21 may (fundación) — **LISTO**

| Día | Entregables | Estado |
|-----|-------------|--------|
| **15 may** | Kickoff; modelo de datos Category→Subcategory→Product; Prisma; capas `server/actions`, `repositories` | ✅ |
| **16 may** | Auth NextAuth; roles CUSTOMER/STAFF/ADMIN; middleware rutas | ✅ |
| **17 may** | Storefront layout; home; navegación por constantes + BD | ✅ |
| **18 may** | Listado productos `/productos`; filtros URL; ProductCard | ✅ |
| **19 may** | Ficha producto; variantes; stock disponible en UI | ✅ |
| **20 may** | Carrito Zustand; persistencia; cantidades | ✅ |
| **21 may** | Checkout flujo; direcciones; estructura Order | ✅ |

### Semana 2 · 22–28 may (integraciones + admin base) — **LISTO**

| Día | Entregables | Estado |
|-----|-------------|--------|
| **22 may** | Mercado Pago integrado en código (sin prueba real aún) | ⚠️ código listo |
| **23 may** | BlueExpress integrado en código (sin prueba real aún) | ⚠️ código listo |
| **24 may** | Cupones; aplicación en checkout | ✅ |
| **25 may** | Cuenta cliente: pedidos, direcciones, favoritos | ✅ |
| **26 may** | Panel admin: layout verde, dashboard métricas | ✅ |
| **27 may** | CRUD categorías/subcategorías básico; sync categorías script | ✅ |
| **28 may** | Commit inicial repo; `docker-compose`; seed | ✅ |

### Semana 3 · 29–31 may (admin PrestaShop-like) — **LISTO**

| Día | Entregables | Estado |
|-----|-------------|--------|
| **29 may** | Inventario admin; ajustes stock; órdenes listado/detalle | ✅ |
| **30 may** | Cupones admin; contenido banners; usuarios admin | ✅ |
| **31 may** | **Productos:** ofertas %/fijo + preview; layout ancho; colorHex; umbral stock bajo | ✅ |
| **31 may** | **Variantes:** matriz desde atributos globales | ✅ |
| **31 may** | **Módulo `/admin/atributos`** (Color, Talla, etc.) | ✅ |
| **31 may** | Multi-categoría checkboxes + `sys-subcat-*` tags; público Mujer/Hombre | ✅ |

### Semana 4 · 1–2 jun (cierre funcional + QA) — **LISTO**

| Día | Entregables | Estado |
|-----|-------------|--------|
| **1 jun** | Mejoras admin PM: galería reordenar; bulk productos; export CSV órdenes; imprimir orden; RBAC rutas admin-only; clientes bloqueo; subcategorías inline | ✅ |
| **1 jun** | Auditoría arquitectura “cierre admin”; permisos STAFF coherentes | ✅ |
| **2 jun** | **Auditoría QA producción** (stock, checkout, auth, catálogo, SEO) | ✅ |
| **2 jun** | **Fase 0:** normalize carrito; envío obligatorio; JWT revocado; éxito checkout por estado | ✅ |
| **2 jun** | **Fase 1:** preview checkout; idempotencia; rate limit login; admin órdenes | ✅ |
| **2 jun** | **Fase 2:** catálogo sort/filtros; sync carrito; MP/shipment edge cases | ✅ |
| **2 jun** | **Fase 3:** reglas password; soft-delete; SMTP scaffold; tests Vitest | ✅ |
| **2 jun** | Contenido: upload archivo banners (no URL) | ✅ |
| **2 jun** | Hero catálogo por imagen categoría; fix sort “Destacados” | ✅ |
| **2 jun** | Login admin `/admin/login`; clientes bloqueados del panel | ✅ |
| **2 jun** | **Categorías:** árbol, SEO, banner, DnD, bulk, vista tabla | ✅ |

---

## Gantt 3 — Pendiente detallado (3–19 jun → producción)

```mermaid
gantt
    title reuso — Plan hasta go-live (3–19 jun 2026)
    dateFormat YYYY-MM-DD
    axisFormat %d %b

    section 3-4 jun Infra
    Hosting Vercel o VPS + Postgres prod       :crit, d1, 2026-06-03, 2d
    Dominio DNS SSL NEXT_PUBLIC_APP_URL        :crit, d2, 2026-06-03, 2d
    Secrets AUTH_SECRET MP SMTP BP             :crit, d3, 2026-06-04, 1d
    prisma migrate deploy prod                 :crit, d4, 2026-06-04, 1d

    section 5-6 jun Pagos
    Cuenta MP producción credenciales          :crit, d5, 2026-06-05, 1d
    Webhook MP URL prod firma IPN              :crit, d6, 2026-06-05, 2d
    Prueba pago real reembolso test            :qa, d7, 2026-06-06, 1d
    Cron expiración AWAITING_PAYMENT verify    :d8, 2026-06-06, 1d

    section 7-8 jun Envíos y email
    BlueExpress credenciales prod              :crit, d9, 2026-06-07, 2d
    SMTP prod recuperar contraseña pedidos     :crit, d10, 2026-06-07, 2d
    Plantillas email mínimas                   :d11, 2026-06-08, 1d

    section 9-10 jun Datos y deploy
    Git commit push branch main                :crit, d12, 2026-06-09, 1d
    Import WooCommerce final imágenes           :d13, 2026-06-09, 2d
    Build CI npm test tsc build                :crit, d14, 2026-06-10, 1d
    Deploy staging smoke                       :d15, 2026-06-10, 1d

    section 11-12 jun QA
    Checklist regresión storefront             :qa, d16, 2026-06-11, 2d
    Checklist admin operación diaria           :qa, d17, 2026-06-11, 2d
    Fixes bugs P0 P1                           :d18, 2026-06-12, 2d

    section 13-14 jun Hardening
    robots sitemap canonical prod              :d19, 2026-06-13, 1d
    OG metadata categorías productos           :d20, 2026-06-13, 1d
    Rate limits headers seguridad review       :d21, 2026-06-14, 1d
    Backup DB monitoreo logs                   :d22, 2026-06-14, 1d

    section 15-16 jun UAT
    UAT con operador tienda                    :qa, d23, 2026-06-15, 2d
    Correcciones feedback UAT                  :d24, 2026-06-16, 2d

    section 17-18 jun Cierre
    Runbook operación devoluciones stock       :d25, 2026-06-17, 1d
    README deploy checklist                    :d26, 2026-06-17, 1d
    Buffer contingencia                        :d27, 2026-06-18, 1d
    Freeze código release tag                  :d28, 2026-06-18, 1d

    section 19 jun
    GO-LIVE PRODUCCIÓN                         :milestone, live, 2026-06-19, 0d
```

---

## Desglose día a día pendiente (3–19 jun)

### **3 jun (martes)** — Infraestructura
- [ ] Elegir hosting (Vercel + Neon/Supabase o VPS + Postgres).
- [ ] Crear base de datos producción; `prisma db push` / migrate.
- [ ] Configurar `NEXT_PUBLIC_APP_URL`, `AUTH_SECRET`, `DATABASE_URL`.
- [ ] Subdominio staging opcional.

### **4 jun (miércoles)** — Dominio y seguridad base
- [ ] DNS dominio final → hosting.
- [ ] SSL/HTTPS verificado.
- [ ] `trustHost`, cookies secure en prod.
- [ ] Revisar `middleware` matcher en dominio real.

### **5 jun (jueves)** — Mercado Pago (1/2)
- [ ] Alta aplicación MP producción; Client ID/Secret prod.
- [ ] `MERCADOPAGO_ACCESS_TOKEN` prod; modo live.
- [ ] URL webhook pública `/api/webhooks/mercadopago`.

### **6 jun (viernes)** — Mercado Pago (2/2) + órdenes
- [ ] Prueba compra real monto bajo; verificar `PAID` + stock.
- [ ] Probar cancelación / orden `AWAITING_PAYMENT` expirada.
- [ ] Validar idempotencia checkout en prod.

### **7 jun (sábado)** — Envíos y correo (1/2)
- [ ] Credenciales BlueExpress producción.
- [ ] Cotización checkout con comunas reales Chile.
- [ ] SMTP (Resend/SendGrid); `EMAIL_FROM`.

### **8 jun (domingo)** — Envíos y correo (2/2)
- [ ] Recuperar contraseña end-to-end en prod.
- [ ] Email opcional confirmación pedido (si SMTP listo).
- [ ] Revisar plantillas y spam score.

### **9 jun (lunes)** — Código y datos
- [ ] **Commit + push** de todo el working tree (crítico: hoy hay 1 commit).
- [ ] Ejecutar `import:woocommerce` / sync categorías en prod.
- [ ] Verificar imágenes `public/uploads` o estrategia storage.

### **10 jun (martes)** — Deploy staging
- [ ] Pipeline: `npm run build`, tests, deploy preview.
- [ ] Smoke: home → catálogo → producto → carrito → checkout (test MP).
- [ ] Smoke admin: producto, orden, categoría, inventario.

### **11 jun (miércoles)** — QA regresión (1/2)
- [ ] Flujos auth: registro, login, bloqueo, admin login staff.
- [ ] Carrito: duplicados variantes, stock warning, cupón.
- [ ] Catálogo: filtros AND, categoría, SEO metadata.

### **12 jun (jueves)** — QA regresión (2/2) + fixes
- [ ] Admin: bulk, permisos STAFF, export órdenes.
- [ ] Corregir bugs P0/P1 encontrados.
- [ ] Re-ejecutar tests `npm test` + `tsc`.

### **13 jun (viernes)** — SEO y rendimiento
- [ ] `robots.ts`, `sitemap.ts` con URL prod.
- [ ] Meta categorías/productos; JSON-LD catálogo.
- [ ] Lighthouse muestra (home, PLP, PDP).
- [ ] Índices Prisma revisados en tablas grandes.

### **14 jun (sábado)** — Operación y backups
- [ ] Backup automático DB.
- [ ] Logs errores (Vercel/Sentry).
- [ ] Documentar rollback y restore.
- [ ] Revisión permisos archivos upload.

### **15 jun (domingo)** — UAT (1/2)
- [ ] Sesión con operador: alta producto, stock, orden real test.
- [ ] Validar categorías árbol + SEO en tienda.
- [ ] Lista de ajustes menores UX.

### **16 jun (lunes)** — UAT (2/2) + correcciones
- [ ] Implementar feedback UAT (solo P0/P1).
- [ ] Re-deploy staging.
- [ ] Sign-off interno go/no-go.

### **17 jun (martes)** — Documentación
- [ ] Runbook: pedido pagado, enviado, cancelado, reembolso.
- [ ] Checklist deploy en README.
- [ ] Credenciales en gestor secretos (no en repo).

### **18 jun (miércoles)** — Freeze y contingencia
- [ ] Tag release `v1.0.0-rc` o similar.
- [ ] Deploy pre-producción = prod.
- [ ] Buffer: últimos hotfixes.
- [ ] Comunicar ventana de mantenimiento si aplica.

### **19 jun (jueves)** — **GO-LIVE PRODUCCIÓN**
- [ ] Switch DNS / tráfico 100% prod.
- [ ] Monitoreo activo primeras 8 h (checkout, webhook, stock).
- [ ] Admin operativo; soporte standby.
- [ ] **Hito: sistema en producción** ✅

---

## Inventario por módulo (estado al 2 jun)

| Módulo | Listo dev | Falta para prod |
|--------|-----------|-----------------|
| Storefront / catálogo | ✅ | URL prod, CDN imágenes opcional |
| Producto PDP / variantes | ✅ | — |
| Carrito / checkout | ✅ | Flujo UI listo |
| Mercado Pago | ⚠️ sin probar | Credenciales prod + prueba 5–6 jun |
| BlueExpress | ⚠️ sin probar | Credenciales prod + prueba 7–8 jun |
| Auth tienda + cuenta | ✅ | SMTP prod |
| Admin productos | ✅ | — |
| Admin categorías (árbol SEO) | ✅ | — |
| Admin atributos | ✅ | — |
| Admin inventario | ✅ | — |
| Admin órdenes | ✅ | MP live |
| Admin clientes | ✅ | — |
| Admin cupones / contenido | ✅ | — |
| Admin login separado | ✅ | — |
| QA remediación fases 0–3 | ✅ | Regresión en prod |
| Tests automatizados | ✅ parcial | Ampliar E2E opcional |
| Deploy / CI / datos | ❌ | **9–10 jun** |

---

## Riesgos que condicionan el 19-jun

1. **Código sin commitear** — riesgo alto; priorizar 9 jun.
2. **Mercado Pago homologación** — puede demorar 5–6 jun si cuenta no está lista.
3. **Import masivo WooCommerce** — validar tiempo en 9–10 jun.
4. **Sin SMTP** — recuperación contraseña falla en prod (bloqueante parcial).

---

## Cómo usar este documento

- Abre **`docs/PROJECT-GANTT.md`** en el repo para editar fechas o marcar checkboxes.
- Visualización interactiva: canvas **`reuso-project-gantt`** en el IDE (barra por tarea).
- Para marcar avance: cambia `[ ]` → `[x]` en la sección 3–19 jun.

---

*Generado a partir del historial de desarrollo (may 15 – jun 2) y estado del repositorio reuso.*

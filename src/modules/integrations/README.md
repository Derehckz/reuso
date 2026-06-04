# Módulos de integración

Paquetes reutilizables para conectar pagos y envíos sin acoplar la lógica al admin de Reuso.

## Estructura

- `core/` — contrato `IntegrationStore`, fusión env + BD, caché en memoria
- `mercadopago/` — esquema Zod, resolución de credenciales, vista admin
- `blueexpress/` — idem para Blue Express / Bluexpress

## Reutilizar en otro proyecto

1. Copia `src/modules/integrations/`.
2. Implementa `IntegrationStore` (Redis, archivo, o tu ORM).
3. Antes de llamar a la API del proveedor: `await loadMercadoPagoConfig(store)` o `await loadBlueExpressConfig(store)`.
4. Los adaptadores en `src/lib/mercadopago` y `src/lib/bluexpress` leen la config resuelta vía caché.

Prioridad de secretos: **variables de entorno > base de datos**. Así puedes dejar credenciales solo en el servidor de producción y usar el admin para el resto (URLs, origen, entorno).

## Claves en StoreSetting (Reuso)

| Clave | Contenido |
|-------|-----------|
| `integration.mercadopago` | enabled, environment, tokens opcionales |
| `integration.blueexpress` | API, rutas, origen del despacho |

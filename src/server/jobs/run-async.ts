/**
 * Ejecuta trabajo en segundo plano sin bloquear la respuesta HTTP.
 * En producción a escala, reemplazar por cola (Inngest, BullMQ, etc.).
 */
export function runAsync(label: string, task: () => Promise<unknown>): void {
  void task().catch((error) => {
    console.error(`[async:${label}]`, error);
  });
}

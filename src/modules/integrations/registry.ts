import { blueExpressModule } from "./blueexpress/module";
import { mercadoPagoModule } from "./mercadopago/module";
import type { IntegrationModuleMeta } from "./core/types";

export const integrationRegistry: readonly IntegrationModuleMeta[] = [
  mercadoPagoModule,
  blueExpressModule,
] as const;

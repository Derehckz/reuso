import { z } from "zod";

export const mercadoPagoEnvironmentSchema = z.enum(["sandbox", "production"]);
export type MercadoPagoEnvironment = z.infer<typeof mercadoPagoEnvironmentSchema>;

export const mercadoPagoStoredSchema = z.object({
  enabled: z.boolean().default(true),
  environment: mercadoPagoEnvironmentSchema.optional(),
  accessToken: z.string().optional(),
  publicKey: z.string().optional(),
  webhookSecret: z.string().optional(),
});

export type MercadoPagoStoredConfig = z.infer<typeof mercadoPagoStoredSchema>;

export const mercadoPagoAdminFormSchema = z.object({
  enabled: z.coerce.boolean(),
  environment: mercadoPagoEnvironmentSchema,
  accessToken: z.string().optional(),
  publicKey: z.string().optional(),
  webhookSecret: z.string().optional(),
});

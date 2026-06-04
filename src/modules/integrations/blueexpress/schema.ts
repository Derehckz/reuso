import { z } from "zod";

export const blueExpressStoredSchema = z.object({
  enabled: z.boolean().default(true),
  apiUrl: z.string().optional(),
  apiKey: z.string().optional(),
  accountId: z.string().optional(),
  quotePath: z.string().optional(),
  trackingPath: z.string().optional(),
  labelPath: z.string().optional(),
  originRegion: z.string().optional(),
  originCommune: z.string().optional(),
  originRegionCode: z.string().optional(),
  originName: z.string().optional(),
  originPhone: z.string().optional(),
  originStreet: z.string().optional(),
});

export type BlueExpressStoredConfig = z.infer<typeof blueExpressStoredSchema>;

export const blueExpressAdminFormSchema = z.object({
  enabled: z.coerce.boolean(),
  apiUrl: z.string().min(1),
  apiKey: z.string().optional(),
  accountId: z.string().optional(),
  quotePath: z.string().optional(),
  trackingPath: z.string().optional(),
  labelPath: z.string().optional(),
  originRegion: z.string().min(1),
  originCommune: z.string().min(1),
  originRegionCode: z.string().min(1),
  originName: z.string().optional(),
  originPhone: z.string().optional(),
  originStreet: z.string().optional(),
});

/** Almacén clave-valor para configuración de integraciones (Prisma, Redis, archivo, etc.). */
export interface IntegrationStore {
  get(key: string): Promise<unknown | null>;
  set(key: string, value: unknown): Promise<void>;
}

export type SecretSource = "env" | "database" | "none";

export type SecretFieldView = {
  configured: boolean;
  source: SecretSource;
  masked: string;
};

export type IntegrationStatus = "ready" | "partial" | "disabled" | "unconfigured";

export type IntegrationModuleMeta = {
  id: string;
  name: string;
  description: string;
  adminPath: string;
  docsPath?: string;
};

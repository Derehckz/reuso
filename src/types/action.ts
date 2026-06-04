export type ActionResult = {
  success: boolean;
  message?: string;
  error?: Record<string, string[] | undefined>;
};

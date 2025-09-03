export const asPlainObject = (v: any) =>
  v && typeof v === "object" && !Array.isArray(v) ? v : undefined;

import { z } from "zod";

export const requestIdSchema = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    "Enter a valid request ID and deletion token.",
  );
const field = (max: number, required = false) =>
  z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : ""),
    z
      .string()
      .max(max, `Use ${max} characters or fewer.`)
      .min(required ? 1 : 0, "Complete this field."),
  );

export const workflowValuesSchema = z.object({
  name: field(120, true),
  email: field(254, true).refine(
    (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    "Enter a valid email address.",
  ),
  organization: field(200, true),
  role: field(120),
  workflow: field(2000, true),
  criteria: field(1000),
  product: field(50).refine(
    (value) =>
      ["operations-os", "autonomous-execution", "not-sure"].includes(value),
    "Select a product.",
  ),
});
export const contactRequestSchema = workflowValuesSchema.extend({
  requestId: requestIdSchema,
});
export const deleteRequestSchema = z.object({
  id: requestIdSchema,
  token: requestIdSchema,
});
export type WorkflowRequestValues = z.output<typeof workflowValuesSchema>;

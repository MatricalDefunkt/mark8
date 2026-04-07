import { z } from "zod";

export const workflowRunStatusSchema = z.enum([
  "queued",
  "running",
  "succeeded",
  "failed",
  "canceled",
]);
export type WorkflowRunStatus = z.infer<typeof workflowRunStatusSchema>;

export const workflowParameterFieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(["string", "number", "boolean"]),
  required: z.boolean().default(false),
  minLength: z.number().int().nonnegative().optional(),
  maxLength: z.number().int().positive().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
});
export type WorkflowParameterField = z.infer<
  typeof workflowParameterFieldSchema
>;

export const workflowParameterDefinitionSchema = z.object({
  fields: z.array(workflowParameterFieldSchema).min(1),
});
export type WorkflowParameterDefinition = z.infer<
  typeof workflowParameterDefinitionSchema
>;

export const executeWorkflowRequestSchema = z.object({
  organizationId: z.string().min(1),
  idempotencyKey: z.string().min(8).max(128),
  parameters: z.record(z.string(), z.unknown()),
});
export type ExecuteWorkflowRequest = z.infer<
  typeof executeWorkflowRequestSchema
>;

export const executeWorkflowResponseSchema = z.object({
  runId: z.string().min(1),
  status: workflowRunStatusSchema,
});
export type ExecuteWorkflowResponse = z.infer<
  typeof executeWorkflowResponseSchema
>;

export type ValidWorkflowParameters = Record<string, string | number | boolean>;

const inputRecordSchema = z.record(z.string(), z.unknown());

const validateStringField = (
  field: WorkflowParameterField,
  value: unknown,
): string => {
  if (typeof value !== "string") {
    throw new Error(`Field \"${field.key}\" must be a string.`);
  }

  if (field.minLength !== undefined && value.length < field.minLength) {
    throw new Error(
      `Field \"${field.key}\" must be at least ${field.minLength} characters long.`,
    );
  }

  if (field.maxLength !== undefined && value.length > field.maxLength) {
    throw new Error(
      `Field \"${field.key}\" must be at most ${field.maxLength} characters long.`,
    );
  }

  return value;
};

const validateNumberField = (
  field: WorkflowParameterField,
  value: unknown,
): number => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`Field \"${field.key}\" must be a valid number.`);
  }

  if (field.min !== undefined && value < field.min) {
    throw new Error(`Field \"${field.key}\" must be >= ${field.min}.`);
  }

  if (field.max !== undefined && value > field.max) {
    throw new Error(`Field \"${field.key}\" must be <= ${field.max}.`);
  }

  return value;
};

const validateBooleanField = (
  field: WorkflowParameterField,
  value: unknown,
): boolean => {
  if (typeof value !== "boolean") {
    throw new Error(`Field \"${field.key}\" must be a boolean.`);
  }

  return value;
};

export const validateWorkflowParameters = (
  definition: WorkflowParameterDefinition,
  input: unknown,
): ValidWorkflowParameters => {
  const parsedInput = inputRecordSchema.parse(input);
  const allowedKeys = new Set(definition.fields.map((field) => field.key));

  for (const key of Object.keys(parsedInput)) {
    if (!allowedKeys.has(key)) {
      throw new Error(`Unexpected field \"${key}\" in workflow parameters.`);
    }
  }

  const validated: ValidWorkflowParameters = {};

  for (const field of definition.fields) {
    const value = parsedInput[field.key];

    if (value === undefined || value === null) {
      if (field.required) {
        throw new Error(`Missing required field \"${field.key}\".`);
      }

      continue;
    }

    if (field.type === "string") {
      validated[field.key] = validateStringField(field, value);
      continue;
    }

    if (field.type === "number") {
      validated[field.key] = validateNumberField(field, value);
      continue;
    }

    validated[field.key] = validateBooleanField(field, value);
  }

  return validated;
};

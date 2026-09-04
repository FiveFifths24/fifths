export type ActionState = {
  status: "idle" | "error" | "success" | "pending";
  message?: string;
  fieldErrors?: Record<string, string[]>;
  values?: Record<string, string | string[]>;
};

export const initialActionState: ActionState = {
  status: "idle",
};

export function firstFieldError(state: ActionState, field: string) {
  return state.fieldErrors?.[field]?.[0];
}

export function actionValuesFromFormData(
  formData: FormData,
  fields: readonly string[],
) {
  const values: Record<string, string | string[]> = {};

  for (const field of fields) {
    const submitted = formData
      .getAll(field)
      .filter((value): value is string => typeof value === "string");
    values[field] = submitted.length > 1 ? submitted : (submitted[0] ?? "");
  }

  return values;
}

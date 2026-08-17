export type ActionState = {
  status: "idle" | "error" | "success";
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
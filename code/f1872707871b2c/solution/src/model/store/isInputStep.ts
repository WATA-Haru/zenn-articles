import type { InputStep } from "./types";
import { InputStepList } from "./const";

export const isInputStep = (value: unknown): value is InputStep => {
  if (typeof value !== "string") {
    return false;
  }
  return InputStepList.some((step) => step === value);
};

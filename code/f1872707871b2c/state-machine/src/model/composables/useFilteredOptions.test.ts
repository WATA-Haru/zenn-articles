import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { useFilteredOptions } from "./useFilteredOptions";
import { initialFormData } from "../const";
import type { SandwichFormData } from "../types";

const makeFormData = (
  overrides: Partial<SandwichFormData> = {}
): SandwichFormData => ({
  ...structuredClone(initialFormData),
  ...overrides,
});

describe("useFilteredOptions", () => {
  it("choiceUser が未選択のとき、すべての選択肢が返ること", () => {
    const formData = ref(makeFormData());
    const { options } = useFilteredOptions(formData);
    expect(options.value.mainMeal).toContain("shrimp");
    expect(options.value.sideMenu).toContain("garlicShrimp");
  });

  describe("choiceUser が noShrimp のとき", () => {
    it("mainMeal から shrimp が除外されること", () => {
      const formData = ref(makeFormData({ choiceUser: "noShrimp" }));
      const { options } = useFilteredOptions(formData);
      expect(options.value.mainMeal).not.toContain("shrimp");
    });

    it("sideMenu から garlicShrimp が除外されること", () => {
      const formData = ref(makeFormData({ choiceUser: "noShrimp" }));
      const { options } = useFilteredOptions(formData);
      expect(options.value.sideMenu).not.toContain("garlicShrimp");
    });
  });

  it("choiceUser が vegetarian のとき、sideMenu から garlicShrimp が除外されること", () => {
    const formData = ref(makeFormData({ choiceUser: "vegetarian" }));
    const { options } = useFilteredOptions(formData);
    expect(options.value.sideMenu).not.toContain("garlicShrimp");
  });

  it("choiceUser を noShrimp に変えたとき、mainMeal から shrimp が消えること", () => {
    const formData = ref(makeFormData());
    const { options } = useFilteredOptions(formData);
    expect(options.value.mainMeal).toContain("shrimp");
    formData.value.choiceUser = "noShrimp";
    expect(options.value.mainMeal).not.toContain("shrimp");
  });
});

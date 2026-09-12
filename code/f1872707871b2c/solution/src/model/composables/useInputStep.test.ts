import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { useInputStep } from "./useInputStep";
import { initialFormData } from "../const";
import type { SandwichFormData } from "../types";

const makeFormData = (
  overrides: Partial<SandwichFormData> = {}
): SandwichFormData => ({
  ...structuredClone(initialFormData),
  ...overrides,
});

describe("useInputStep", () => {
  describe("初期化したとき", () => {
    it("currentInputStep が choiceUser になること", () => {
      const formData = ref(makeFormData());
      const { currentInputStep } = useInputStep(formData);
      expect(currentInputStep.value).toBe("choiceUser");
    });

    it("visitedInputSteps に choiceUser だけ含まれること", () => {
      const formData = ref(makeFormData());
      const { visitedInputSteps } = useInputStep(formData);
      expect(visitedInputSteps.value).toEqual(["choiceUser"]);
    });

    it("isFirstStep が true になること", () => {
      const formData = ref(makeFormData());
      const { isFirstStep } = useInputStep(formData);
      expect(isFirstStep.value).toBe(true);
    });

    it("isInputFinished が false になること", () => {
      const formData = ref(makeFormData());
      const { isInputFinished } = useInputStep(formData);
      expect(isInputFinished.value).toBe(false);
    });
  });

  describe("inputStepList", () => {
    it("choiceUser が未選択のとき、mainMeal あり・hot なしの 5 ステップになること", () => {
      const formData = ref(makeFormData());
      const { inputStepList } = useInputStep(formData);
      expect(inputStepList.value).toEqual([
        "choiceUser",
        "mainMeal",
        "vegetable",
        "source",
        "sideMenu",
      ]);
    });

    it("choiceUser が vegetarian のとき、mainMeal が含まれないこと", () => {
      const formData = ref(makeFormData({ choiceUser: "vegetarian" }));
      const { inputStepList } = useInputStep(formData);
      expect(inputStepList.value).not.toContain("mainMeal");
    });

    it("source が chili のとき、hot が含まれること", () => {
      const formData = ref(makeFormData({ source: "chili" }));
      const { inputStepList } = useInputStep(formData);
      expect(inputStepList.value).toContain("hot");
    });

    it("source が chili 以外のとき、hot が含まれないこと", () => {
      const formData = ref(makeFormData({ source: "basil" }));
      const { inputStepList } = useInputStep(formData);
      expect(inputStepList.value).not.toContain("hot");
    });
  });

  describe("goNextInputStep", () => {
    it("呼んだとき、currentInputStep が次のページに進むこと", () => {
      const formData = ref(makeFormData());
      const { currentInputStep, goNextInputStep } = useInputStep(formData);
      goNextInputStep();
      expect(currentInputStep.value).toBe("mainMeal");
    });

    it("呼んだとき、進んだページが visitedInputSteps に追加されること", () => {
      const formData = ref(makeFormData());
      const { visitedInputSteps, goNextInputStep } = useInputStep(formData);
      goNextInputStep();
      goNextInputStep();
      expect(visitedInputSteps.value).toEqual([
        "choiceUser",
        "mainMeal",
        "vegetable",
      ]);
    });

    it("最終ページで呼んだとき、isInputFinished が true になること", () => {
      const formData = ref(makeFormData());
      const { isInputFinished, goNextInputStep } = useInputStep(formData);
      for (let i = 0; i < 5; i++) goNextInputStep();
      expect(isInputFinished.value).toBe(true);
    });
  });

  describe("goPreviousInputStep", () => {
    it("呼んだとき、currentInputStep が前のページに戻ること", () => {
      const formData = ref(makeFormData());
      const { currentInputStep, goNextInputStep, goPreviousInputStep } =
        useInputStep(formData);
      goNextInputStep();
      goNextInputStep();
      goPreviousInputStep();
      expect(currentInputStep.value).toBe("mainMeal");
    });

    it("完了画面で呼んだとき、isInputFinished が false に戻ること", () => {
      const formData = ref(makeFormData());
      const { isInputFinished, goNextInputStep, goPreviousInputStep } =
        useInputStep(formData);
      for (let i = 0; i < 5; i++) goNextInputStep();
      expect(isInputFinished.value).toBe(true);
      goPreviousInputStep();
      expect(isInputFinished.value).toBe(false);
    });

    it("先頭で呼んだとき、currentInputStep が変わらないこと", () => {
      const formData = ref(makeFormData());
      const { currentInputStep, goPreviousInputStep } = useInputStep(formData);
      goPreviousInputStep();
      expect(currentInputStep.value).toBe("choiceUser");
    });
  });

  it("formData の choiceUser を vegetarian に変えたとき、inputStepList から mainMeal が消えること", () => {
    const formData = ref(makeFormData());
    const { inputStepList } = useInputStep(formData);
    expect(inputStepList.value).toContain("mainMeal");
    formData.value.choiceUser = "vegetarian";
    expect(inputStepList.value).not.toContain("mainMeal");
  });

  it("reset を呼んだとき、初期状態に戻ること", () => {
    const formData = ref(makeFormData());
    const {
      currentInputStep,
      visitedInputSteps,
      isInputFinished,
      goNextInputStep,
      reset,
    } = useInputStep(formData);
    for (let i = 0; i < 5; i++) goNextInputStep();

    reset();

    expect(currentInputStep.value).toBe("choiceUser");
    expect(visitedInputSteps.value).toEqual(["choiceUser"]);
    expect(isInputFinished.value).toBe(false);
  });
});

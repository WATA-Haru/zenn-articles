import { computed, ref, type Ref } from "vue";
import type { InputStep, SandwichFormData } from "../types";

const INITIAL_INPUT_STEP: InputStep = "choiceUser";

/**
 * ★この記事の肝★
 *
 * 「今表示すべきページ一覧（inputStepList）」を、状態として持つのではなく
 * formData から computed で導出する。
 *
 * こうすると、ページ構成という“導出できるもの”をステートマシンの状態として
 * 二重管理せずに済む＝組み合わせ爆発が起きない。
 *
 */
export const useInputStep = (formData: Ref<SandwichFormData>) => {
  const currentInputStep = ref<InputStep>(INITIAL_INPUT_STEP);

  const isInputFinished = ref(false);

  const visitedInputSteps = ref<InputStep[]>([INITIAL_INPUT_STEP]);

  /**
   * ユーザーの入力値に応じて表示するページの並びを導出する。
   * designDocs / patterns.md の 6 パターンはすべてこの分岐から生まれる。
   */
  const inputStepList = computed<InputStep[]>(() => {
    const data = formData.value;
    const steps: InputStep[] = ["choiceUser"];

    // 制約: ベジタリアンは肉・魚を食べないので具材ページを出さない
    if (data.choiceUser !== "vegetarian") {
      steps.push("mainMeal");
    }

    steps.push("vegetable", "source");

    // 制約: 辛さはチリソースのときだけ
    if (data.source === "chili") {
      steps.push("hot");
    }

    steps.push("sideMenu");

    return steps;
  });

  /** 現在ページが inputStepList の何番目か */
  const currentIndex = computed(() =>
    inputStepList.value.indexOf(currentInputStep.value),
  );

  const isFirstStep = computed(() => currentIndex.value <= 0);

  const setCurrentInputStep = (step: InputStep) => {
    currentInputStep.value = step;
    if (!visitedInputSteps.value.includes(step)) {
      visitedInputSteps.value.push(step);
    }
  };

  /**
   * 次のページへ。最後のページなら isInputFinished を true にする。
   * 「次のページ」は inputStepList（＝導出結果）を辿るだけ。
   */
  const goNextInputStep = () => {
    const nextIndex = currentIndex.value + 1;
    if (nextIndex >= inputStepList.value.length) {
      isInputFinished.value = true;
      return;
    }
    setCurrentInputStep(inputStepList.value[nextIndex]);
  };

  /** 前のページへ */
  const goPreviousInputStep = () => {
    if (isInputFinished.value) {
      isInputFinished.value = false;
      return;
    }
    const prevIndex = currentIndex.value - 1;
    if (prevIndex < 0) return;
    setCurrentInputStep(inputStepList.value[prevIndex]);
  };

  const reset = () => {
    currentInputStep.value = INITIAL_INPUT_STEP;
    visitedInputSteps.value = [INITIAL_INPUT_STEP];
    isInputFinished.value = false;
  };

  return {
    currentInputStep,
    inputStepList,
    visitedInputSteps,
    isInputFinished,
    isFirstStep,
    goNextInputStep,
    goPreviousInputStep,
    setCurrentInputStep,
    reset,
  };
};

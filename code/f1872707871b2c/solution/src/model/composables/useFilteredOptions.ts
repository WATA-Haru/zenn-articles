import { computed, type Ref } from "vue";
import type { OptionInput, SandwichFormData } from "../types";
import {
  choiceUserOptions,
  hotOptions,
  mainMealOptions,
  sideMenuOptions,
  sourceOptions,
  vegetableOptions,
} from "../const";

type FilteredOptions = {
  choiceUser: OptionInput[];
  mainMeal: OptionInput[];
  vegetable: OptionInput[];
  source: OptionInput[];
  hot: OptionInput[];
  sideMenu: OptionInput[];
};

/**
 * 入力データから各ページの選択肢を導出する。
 *
 * 制約:
 *  - エビNG のときは mainMeal から "shrimp" を除外
 *  - エビNG / ベジタリアンのときは sideMenu から "garlicShrimp" を除外
 *
 * 表示都合ではなくドメイン制約なので model 側に置く。
 * 選択済みの値をクリアする整合性リセットは、書き込み側 (container のハンドラ) が
 * 同じ制約に基づいて実行する。
 */
export const useFilteredOptions = (
  formData: Ref<SandwichFormData>
): { options: Ref<FilteredOptions> } => {
  const filteredMainMealOptions = computed(() =>
    formData.value.choiceUser === "noShrimp"
      ? mainMealOptions.filter((option) => option.value !== "shrimp")
      : mainMealOptions
  );

  const filteredSideMenuOptions = computed(() =>
    formData.value.choiceUser === "noShrimp" ||
    formData.value.choiceUser === "vegetarian"
      ? sideMenuOptions.filter((option) => option.value !== "garlicShrimp")
      : sideMenuOptions
  );

  const options = computed<FilteredOptions>(() => ({
    choiceUser: choiceUserOptions,
    mainMeal: filteredMainMealOptions.value,
    vegetable: vegetableOptions,
    source: sourceOptions,
    hot: hotOptions,
    sideMenu: filteredSideMenuOptions.value,
  }));

  return { options };
};

import { computed, type Ref } from "vue";
import type {
  ChoiceUser,
  Hot,
  MainMeal,
  SandwichFormData,
  SideMenu,
  Source,
  Vegetable,
} from "../types";
import {
  choiceUserValues,
  hotValues,
  mainMealValues,
  sideMenuValues,
  sourceValues,
  vegetableValues,
} from "../const";

type FilteredOptions = {
  choiceUser: ChoiceUser[];
  mainMeal: MainMeal[];
  vegetable: Vegetable[];
  source: Source[];
  hot: Hot[];
  sideMenu: SideMenu[];
};

/**
 * 入力データから各ページの選択肢を導出する。
 *
 * 制約:
 *  - エビNG のときは mainMeal から "shrimp" を除外
 *  - エビNG / ベジタリアンのときは sideMenu から "garlicShrimp" を除外
 *
 * 表示都合ではなくドメイン制約なので model 側に置く。
 * 選択済みの値をクリアする整合性リセットは、書き込み側 (store の setter) が
 * 同じ制約に基づいて実行する。
 */
export const useFilteredOptions = (
  formData: Ref<SandwichFormData>
): { options: Ref<FilteredOptions> } => {
  const filteredMainMeal = computed(() =>
    formData.value.choiceUser === "noShrimp"
      ? mainMealValues.filter((value) => value !== "shrimp")
      : mainMealValues
  );

  const filteredSideMenu = computed(() =>
    formData.value.choiceUser === "noShrimp" ||
    formData.value.choiceUser === "vegetarian"
      ? sideMenuValues.filter((value) => value !== "garlicShrimp")
      : sideMenuValues
  );

  const options = computed<FilteredOptions>(() => ({
    choiceUser: choiceUserValues,
    mainMeal: filteredMainMeal.value,
    vegetable: vegetableValues,
    source: sourceValues,
    hot: hotValues,
    sideMenu: filteredSideMenu.value,
  }));

  return { options };
};

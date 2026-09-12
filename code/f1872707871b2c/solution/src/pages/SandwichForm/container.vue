<script setup lang="ts">
import { computed, toRef } from "vue";
import Presentation from "./index.vue";
import { useSandwichFormStore } from "../../model/store/useSandwichFormStore";
import { useInputStep } from "../../model/store/useInputStep";
import {
  choiceUserOptions,
  mainMealOptions,
  vegetableOptions,
  sourceOptions,
  hotOptions,
  sideMenuOptions,
} from "../../model/store/const";
import type {
  ChoiceUser,
  Hot,
  MainMeal,
  SideMenu,
  Source,
  Vegetable,
} from "../../model/store/types";

const { formData, reset: resetForm, toggleArrayValue } = useSandwichFormStore();

const {
  currentInputStep,
  inputStepList,
  visitedInputSteps,
  isInputFinished,
  isFirstStep,
  goNextInputStep,
  goPreviousInputStep,
  reset: resetStep,
} = useInputStep(toRef(() => formData));

// 選択肢の動的絞り込み（制約: エビNG ではエビ / ガーリックシュリンプを出さない）
const filteredMainMealOptions = computed(() =>
  formData.choiceUser === "noShrimp"
    ? mainMealOptions.filter((option) => option.value !== "shrimp")
    : mainMealOptions
);

const filteredSideMenuOptions = computed(() =>
  formData.choiceUser === "noShrimp" || formData.choiceUser === "vegetarian"
    ? sideMenuOptions.filter((option) => option.value !== "garlicShrimp")
    : sideMenuOptions
);

const options = computed(() => ({
  choiceUser: choiceUserOptions,
  mainMeal: filteredMainMealOptions.value,
  vegetable: vegetableOptions,
  source: sourceOptions,
  hot: hotOptions,
  sideMenu: filteredSideMenuOptions.value,
}));

// ステッパー用に整形
const steps = computed(() =>
  inputStepList.value.map((step) => ({
    id: step,
    isCurrent: currentInputStep.value === step,
    isVisited: visitedInputSteps.value.includes(step),
  }))
);

// --- ハンドラ ---------------------------------------------------------------
// 上流の選択が変わると下流の選択が無効になりうるので、整合性を保つために関連値をリセットする。

const handleChangeChoiceUser = (value: string) => {
  formData.choiceUser = value as ChoiceUser;
  // ベジタリアンは具材ページ自体が無くなるので具材をクリア
  if (value === "vegetarian") {
    formData.mainMeal = "";
  }
  // エビNG に切り替えたら、選べなくなる選択肢を除去
  if (value === "noShrimp") {
    if (formData.mainMeal === "shrimp") formData.mainMeal = "";
    formData.sideMenus = formData.sideMenus.filter(
      (item) => item !== "garlicShrimp"
    );
  }
};

const handleChangeMainMeal = (value: string) => {
  formData.mainMeal = value as MainMeal;
};

const handleChangeSource = (value: string) => {
  formData.source = value as Source;
  // 辛さはチリソースのときだけ。それ以外に変えたらクリア
  if (value !== "chili") {
    formData.hot = "";
  }
};

const handleChangeHot = (value: string) => {
  formData.hot = value as Hot;
};

const handleToggleVegetable = (value: string) => {
  toggleArrayValue(formData.vegetables, value as Vegetable);
};

const handleToggleSideMenu = (value: string) => {
  toggleArrayValue(formData.sideMenus, value as SideMenu);
};

const handleReset = () => {
  resetForm();
  resetStep();
};
</script>

<template>
  <Presentation
    :input-step="currentInputStep"
    :form-data="formData"
    :steps="steps"
    :options="options"
    :is-first-step="isFirstStep"
    :is-input-finished="isInputFinished"
    @change:choice-user="handleChangeChoiceUser"
    @change:main-meal="handleChangeMainMeal"
    @change:source="handleChangeSource"
    @change:hot="handleChangeHot"
    @toggle:vegetable="handleToggleVegetable"
    @toggle:side-menu="handleToggleSideMenu"
    @click:next="goNextInputStep"
    @click:previous="goPreviousInputStep"
    @click:reset="handleReset"
  />
</template>

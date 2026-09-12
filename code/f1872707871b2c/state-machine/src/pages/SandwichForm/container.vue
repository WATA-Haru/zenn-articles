<script setup lang="ts">
import { computed } from "vue";
import { useMachine } from "@xstate/vue";
import Presentation from "./index.vue";
import { sandwichMachine } from "../../model/machine";
import { useSandwichFormStore } from "../../model/store/useSandwichFormStore";
import {
  choiceUserOptions,
  mainMealOptions,
  vegetableOptions,
  sourceOptions,
  hotOptions,
  sideMenuOptions,
  sectionTitles,
} from "../../model/store/const";
import type {
  ChoiceUser,
  Hot,
  InputStep,
  MainMeal,
  SideMenu,
  Source,
  Vegetable,
} from "../../model/store/types";

// データの source of truth は Pinia store（machine はデータを持たない）
const { formData, reset: resetForm, toggleArrayValue } = useSandwichFormStore();

// ナビゲーションは machine が持つ（＝失敗パターン）
const { snapshot, send } = useMachine(sandwichMachine);

const isInputFinished = computed(() => snapshot.value.matches("done"));

// machine の状態名がそのまま現在ページ。done のときは最終ページ扱いにする。
const currentInputStep = computed<InputStep>(() =>
  isInputFinished.value ? "sideMenu" : (snapshot.value.value as InputStep)
);

const isFirstStep = computed(() => snapshot.value.value === "choiceUser");

/**
 * 分岐に必要な判定フラグ。store の formData から算出して machine に注入する。
 * ＝分岐の“真実”は store（データ）側にあり、machine はそれを写経しているだけなのでよくない
 */
const injectedFlags = computed(() => ({
  isVegetarian: formData.choiceUser === "vegetarian",
  isChili: formData.source === "chili",
}));

// 選択肢の動的絞り込み（エビNG）
const options = computed(() => ({
  choiceUser: choiceUserOptions,
  mainMeal:
    formData.choiceUser === "noShrimp"
      ? mainMealOptions.filter((option) => option.value !== "shrimp")
      : mainMealOptions,
  vegetable: vegetableOptions,
  source: sourceOptions,
  hot: hotOptions,
  sideMenu:
    formData.choiceUser === "noShrimp"
      ? sideMenuOptions.filter((option) => option.value !== "garlicShrimp")
      : sideMenuOptions,
}));

const sectionTitle = computed(() => sectionTitles[currentInputStep.value]);

// --- ハンドラ（値変更時に下流をリセットするのは solution と同じ） ---
const handleChangeChoiceUser = (value: string) => {
  formData.choiceUser = value as ChoiceUser;
  if (value === "vegetarian") {
    formData.mainMeal = "";
  }
  if (value === "noShrimp") {
    if (formData.mainMeal === "shrimp") formData.mainMeal = "";
    formData.sideMenus = formData.sideMenus.filter((v) => v !== "garlicShrimp");
  }
};

const handleChangeMainMeal = (value: string) => {
  formData.mainMeal = value as MainMeal;
};

const handleChangeSource = (value: string) => {
  formData.source = value as Source;
  if (value !== "chili") formData.hot = "";
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

// next / back の“両方”に同じフラグを渡す点に注目（分岐の二重管理）
const handleNext = () => send({ type: "next", ...injectedFlags.value });
const handlePrevious = () => send({ type: "back", ...injectedFlags.value });

const handleReset = () => {
  resetForm();
  send({ type: "reset" });
};
</script>

<template>
  <Presentation
    :input-step="currentInputStep"
    :section-title="sectionTitle"
    :form-data="formData"
    :steps="[]"
    :options="options"
    :is-first-step="isFirstStep"
    :is-input-finished="isInputFinished"
    @change:choice-user="handleChangeChoiceUser"
    @change:main-meal="handleChangeMainMeal"
    @change:source="handleChangeSource"
    @change:hot="handleChangeHot"
    @toggle:vegetable="handleToggleVegetable"
    @toggle:side-menu="handleToggleSideMenu"
    @click:next="handleNext"
    @click:previous="handlePrevious"
    @click:reset="handleReset"
  />
</template>

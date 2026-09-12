<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useMachine } from "@xstate/vue";
import Presentation from "./index.vue";
import { sandwichMachine } from "../../model/machine";
import { useSandwichFormStore } from "../../model/store/useSandwichFormStore";
import { useFilteredOptions } from "../../model/composables/useFilteredOptions";
import type {
  ChoiceUser,
  Hot,
  InputStep,
  MainMeal,
  SideMenu,
  Source,
  Vegetable,
} from "../../model/types";

// データの source of truth は Pinia store（machine はデータを持たない）
const store = useSandwichFormStore();
const { formData } = storeToRefs(store);
const {
  setChoiceUser,
  setMainMeal,
  setSource,
  setHot,
  setVegetable,
  setSideMenu,
  reset: resetForm,
} = store;

// ナビゲーションは machine が持つ
const { snapshot, send } = useMachine(sandwichMachine);

const isInputFinished = computed(() => snapshot.value.matches("done"));

// machine の状態名がそのまま現在ページ。done のときは最終ページ扱いにする。
const currentInputStep = computed<InputStep>(() =>
  isInputFinished.value ? "sideMenu" : (snapshot.value.value as InputStep)
);

const isFirstStep = computed(() => snapshot.value.value === "choiceUser");

/**
 * 分岐に必要な判定フラグ。store の formData から算出して machine に注入する。
 * ＝分岐の“真実”は store（データ）側にあり、machine はそれを写経しているだけ（失敗2）。
 */
const injectedFlags = computed(() => ({
  isVegetarian: formData.value.choiceUser === "vegetarian",
  isChili: formData.value.source === "chili",
}));

const { options } = useFilteredOptions(formData);

const handleChangeChoiceUser = (value: string) => {
  setChoiceUser(value as ChoiceUser);
};

const handleChangeMainMeal = (value: string) => {
  setMainMeal(value as MainMeal);
};

const handleChangeSource = (value: string) => {
  setSource(value as Source);
};

const handleChangeHot = (value: string) => {
  setHot(value as Hot);
};

const handleChangeVegetable = (value: string) => {
  setVegetable(value as Vegetable);
};

const handleChangeSideMenu = (value: string) => {
  setSideMenu(value as SideMenu);
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
    :form-data="formData"
    :options="options"
    :is-first-step="isFirstStep"
    :is-input-finished="isInputFinished"
    @change:choice-user="handleChangeChoiceUser"
    @change:main-meal="handleChangeMainMeal"
    @change:source="handleChangeSource"
    @change:hot="handleChangeHot"
    @change:vegetable="handleChangeVegetable"
    @change:side-menu="handleChangeSideMenu"
    @click:next="handleNext"
    @click:previous="handlePrevious"
    @click:reset="handleReset"
  />
</template>

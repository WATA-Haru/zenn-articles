<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import Presentation from "./index.vue";
import { useSandwichFormStore } from "../../model/store/useSandwichFormStore";
import { useInputStep } from "../../model/composables/useInputStep";
import { useFilteredOptions } from "../../model/composables/useFilteredOptions";
import type {
  ChoiceUser,
  Hot,
  MainMeal,
  SideMenu,
  Source,
  Vegetable,
} from "../../model/types";

const store = useSandwichFormStore();
const { formData } = storeToRefs(store);
const {
  setChoiceUser,
  setMainMeal,
  setSource,
  setHot,
  toggleVegetable,
  toggleSideMenu,
  reset: resetForm,
} = store;

const {
  currentInputStep,
  inputStepList,
  visitedInputSteps,
  isInputFinished,
  isFirstStep,
  goNextInputStep,
  goPreviousInputStep,
  reset: resetStep,
} = useInputStep(formData);

const { options } = useFilteredOptions(formData);

// ステッパー用に整形
const steps = computed(() =>
  inputStepList.value.map((step) => ({
    id: step,
    isCurrent: currentInputStep.value === step,
    isVisited: visitedInputSteps.value.includes(step),
  }))
);

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

const handleToggleVegetable = (value: string) => {
  toggleVegetable(value as Vegetable);
};

const handleToggleSideMenu = (value: string) => {
  toggleSideMenu(value as SideMenu);
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

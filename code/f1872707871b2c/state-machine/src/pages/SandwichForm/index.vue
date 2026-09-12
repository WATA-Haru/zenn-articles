<script setup lang="ts">
import { computed } from "vue";
import type {
  ChoiceUser,
  Hot,
  InputStep,
  MainMeal,
  SandwichFormData,
  SideMenu,
  Source,
  Vegetable,
} from "../../model/types";
import { sectionTitles } from "./sectionTitles";
import {
  choiceUserLabels,
  hotLabels,
  mainMealLabels,
  sideMenuLabels,
  sourceLabels,
  vegetableLabels,
} from "./optionLabels";

type Props = {
  /** 現在のページ */
  inputStep: InputStep;
  /** 入力データ */
  formData: SandwichFormData;
  /** ページごとの選択肢（動的に絞り込んだものを親から受け取る） */
  options: {
    choiceUser: ChoiceUser[];
    mainMeal: MainMeal[];
    vegetable: Vegetable[];
    source: Source[];
    hot: Hot[];
    sideMenu: SideMenu[];
  };
  /** 先頭ページかどうか（「戻る」の出し分け） */
  isFirstStep: boolean;
  /** 入力完了したか */
  isInputFinished: boolean;
};

const props = defineProps<Props>();

const sectionTitle = computed(() => sectionTitles[props.inputStep]);

const emit = defineEmits<{
  (event: "change:choiceUser", value: string): void;
  (event: "change:mainMeal", value: string): void;
  (event: "change:source", value: string): void;
  (event: "change:hot", value: string): void;
  (event: "change:vegetable", value: string): void;
  (event: "change:sideMenu", value: string): void;
  (event: "click:next"): void;
  (event: "click:previous"): void;
  (event: "click:reset"): void;
}>();
</script>

<template>
  <div class="form">
    <div class="panel">
      <!-- 入力中 -->
      <template v-if="!isInputFinished">
        <h2 class="panel__title">{{ sectionTitle }}</h2>

        <!-- ユーザ選択（単一） -->
        <template v-if="inputStep === 'choiceUser'">
          <label v-for="value in options.choiceUser" :key="value" class="radio">
            <input
              type="radio"
              name="choiceUser"
              :value="value"
              :checked="formData.choiceUser === value"
              @change="emit('change:choiceUser', value)"
            />
            {{ choiceUserLabels[value] }}
          </label>
        </template>

        <!-- 具材選択（単一） -->
        <template v-else-if="inputStep === 'mainMeal'">
          <label v-for="value in options.mainMeal" :key="value" class="radio">
            <input
              type="radio"
              name="mainMeal"
              :value="value"
              :checked="formData.mainMeal === value"
              @change="emit('change:mainMeal', value)"
            />
            {{ mainMealLabels[value] }}
          </label>
        </template>

        <!-- 野菜選択（複数） -->
        <template v-else-if="inputStep === 'vegetable'">
          <label
            v-for="value in options.vegetable"
            :key="value"
            class="checkbox"
          >
            <input
              type="checkbox"
              :value="value"
              :checked="formData.vegetables.includes(value)"
              @change="emit('change:vegetable', value)"
            />
            {{ vegetableLabels[value] }}
          </label>
        </template>

        <!-- ソース（単一） -->
        <template v-else-if="inputStep === 'source'">
          <label v-for="value in options.source" :key="value" class="radio">
            <input
              type="radio"
              name="source"
              :value="value"
              :checked="formData.source === value"
              @change="emit('change:source', value)"
            />
            {{ sourceLabels[value] }}
          </label>
        </template>

        <!-- 辛さ（単一） -->
        <template v-else-if="inputStep === 'hot'">
          <label v-for="value in options.hot" :key="value" class="radio">
            <input
              type="radio"
              name="hot"
              :value="value"
              :checked="formData.hot === value"
              @change="emit('change:hot', value)"
            />
            {{ hotLabels[value] }}
          </label>
        </template>

        <!-- 付け合せ（複数） -->
        <template v-else-if="inputStep === 'sideMenu'">
          <label
            v-for="value in options.sideMenu"
            :key="value"
            class="checkbox"
          >
            <input
              type="checkbox"
              :value="value"
              :checked="formData.sideMenus.includes(value)"
              @change="emit('change:sideMenu', value)"
            />
            {{ sideMenuLabels[value] }}
          </label>
        </template>
      </template>

      <!-- 完了画面 -->
      <template v-else>
        <h2>できあがり！🥪</h2>
        <pre class="summary">{{ JSON.stringify(formData, null, 2) }}</pre>
      </template>

      <!-- 共通アクション（ボタンは状態で出し分け） -->
      <div class="actions">
        <button
          v-if="!isFirstStep || isInputFinished"
          type="button"
          @click="emit('click:previous')"
        >
          戻る
        </button>
        <button
          v-if="!isInputFinished"
          type="button"
          class="actions__next"
          @click="emit('click:next')"
        >
          次へ
        </button>
        <button
          v-if="isInputFinished"
          type="button"
          @click="emit('click:reset')"
        >
          最初から
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form {
  max-width: 480px;
  margin: 0 auto;
  font-family: system-ui, sans-serif;
}

.panel {
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.panel__title {
  margin-top: 0;
}

.radio,
.checkbox {
  display: block;
  padding: 8px 0;
  cursor: pointer;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.actions button {
  padding: 8px 20px;
  border: 1px solid #1d4ed8;
  border-radius: 6px;
  background: #fff;
  color: #1d4ed8;
  cursor: pointer;
}

.actions__next {
  background: #1d4ed8 !important;
  color: #fff !important;
}

.summary {
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  overflow: auto;
}
</style>

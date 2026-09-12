<script setup lang="ts">
import type {
  InputStep,
  OptionInput,
  SandwichFormData,
} from "../../model/store/types";

/** ステッパー1つ分の表示情報 */
type StepView = {
  id: InputStep;
  title: string;
  isCurrent: boolean;
  isVisited: boolean;
};

type Props = {
  /** 現在のページ */
  inputStep: InputStep;
  /** 現在ページの見出し */
  sectionTitle: string;
  /** 入力データ */
  formData: SandwichFormData;
  /** 導出済みのページ列（ステッパー表示用） */
  steps: StepView[];
  /** ページごとの選択肢（動的に絞り込んだものを親から受け取る） */
  options: {
    choiceUser: OptionInput[];
    mainMeal: OptionInput[];
    vegetable: OptionInput[];
    source: OptionInput[];
    hot: OptionInput[];
    sideMenu: OptionInput[];
  };
  /** 先頭ページかどうか（「戻る」の出し分け） */
  isFirstStep: boolean;
  /** 入力完了したか */
  isInputFinished: boolean;
};

defineProps<Props>();

const emit = defineEmits<{
  (event: "change:choiceUser", value: string): void;
  (event: "change:mainMeal", value: string): void;
  (event: "change:source", value: string): void;
  (event: "change:hot", value: string): void;
  (event: "toggle:vegetable", value: string): void;
  (event: "toggle:sideMenu", value: string): void;
  (event: "click:next"): void;
  (event: "click:previous"): void;
  (event: "click:reset"): void;
}>();
</script>

<template>
  <div class="form">
    <!-- ステッパー: inputStepList（導出結果）をそのまま並べる -->
    <ol v-if="steps.length" class="stepper">
      <li
        v-for="step in steps"
        :key="step.id"
        class="stepper__item"
        :class="{
          'stepper__item--current': step.isCurrent,
          'stepper__item--visited': step.isVisited,
        }"
      >
        {{ step.title }}
      </li>
    </ol>

    <!-- 完了画面 -->
    <div v-if="isInputFinished" class="panel">
      <h2>できあがり！🥪</h2>
      <pre class="summary">{{ JSON.stringify(formData, null, 2) }}</pre>
      <div class="actions">
        <button type="button" @click="emit('click:previous')">戻る</button>
        <button type="button" @click="emit('click:reset')">最初から</button>
      </div>
    </div>

    <!-- 入力画面 -->
    <div v-else class="panel">
      <h2 class="panel__title">{{ sectionTitle }}</h2>

      <!-- ユーザ選択（単一） -->
      <template v-if="inputStep === 'choiceUser'">
        <label
          v-for="option in options.choiceUser"
          :key="option.value"
          class="radio"
        >
          <input
            type="radio"
            name="choiceUser"
            :value="option.value"
            :checked="formData.choiceUser === option.value"
            @change="emit('change:choiceUser', option.value)"
          />
          {{ option.label }}
        </label>
      </template>

      <!-- 具材選択（単一） -->
      <template v-else-if="inputStep === 'mainMeal'">
        <label
          v-for="option in options.mainMeal"
          :key="option.value"
          class="radio"
        >
          <input
            type="radio"
            name="mainMeal"
            :value="option.value"
            :checked="formData.mainMeal === option.value"
            @change="emit('change:mainMeal', option.value)"
          />
          {{ option.label }}
        </label>
      </template>

      <!-- 野菜選択（複数） -->
      <template v-else-if="inputStep === 'vegetable'">
        <label
          v-for="option in options.vegetable"
          :key="option.value"
          class="checkbox"
        >
          <input
            type="checkbox"
            :value="option.value"
            :checked="(formData.vegetables as string[]).includes(option.value)"
            @change="emit('toggle:vegetable', option.value)"
          />
          {{ option.label }}
        </label>
      </template>

      <!-- ソース（単一） -->
      <template v-else-if="inputStep === 'source'">
        <label
          v-for="option in options.source"
          :key="option.value"
          class="radio"
        >
          <input
            type="radio"
            name="source"
            :value="option.value"
            :checked="formData.source === option.value"
            @change="emit('change:source', option.value)"
          />
          {{ option.label }}
        </label>
      </template>

      <!-- 辛さ（単一） -->
      <template v-else-if="inputStep === 'hot'">
        <label v-for="option in options.hot" :key="option.value" class="radio">
          <input
            type="radio"
            name="hot"
            :value="option.value"
            :checked="formData.hot === option.value"
            @change="emit('change:hot', option.value)"
          />
          {{ option.label }}
        </label>
      </template>

      <!-- 付け合せ（複数） -->
      <template v-else-if="inputStep === 'sideMenu'">
        <label
          v-for="option in options.sideMenu"
          :key="option.value"
          class="checkbox"
        >
          <input
            type="checkbox"
            :value="option.value"
            :checked="(formData.sideMenus as string[]).includes(option.value)"
            @change="emit('toggle:sideMenu', option.value)"
          />
          {{ option.label }}
        </label>
      </template>

      <div class="actions">
        <button
          v-if="!isFirstStep"
          type="button"
          @click="emit('click:previous')"
        >
          戻る
        </button>
        <button type="button" class="actions__next" @click="emit('click:next')">
          次へ
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

.stepper {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0;
  margin: 0 0 20px;
  list-style: none;
}

.stepper__item {
  padding: 4px 10px;
  border-radius: 999px;
  background: #eee;
  color: #888;
  font-size: 12px;
}

.stepper__item--visited {
  background: #dbeafe;
  color: #1d4ed8;
}

.stepper__item--current {
  background: #1d4ed8;
  color: #fff;
  font-weight: 700;
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

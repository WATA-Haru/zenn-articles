import { defineStore } from "pinia";
import { reactive } from "vue";
import type { SandwichFormData } from "./types";
import { initialFormData } from "./const";

/**
 * フォームの入力データ（＝data）を保持する Pinia store。
 *
 * このデモでは machine がデータを一切持たない（source of truth はこの store）。
 * ところが machine のナビゲーション分岐は、結局この store から算出したフラグ
 * （isVegetarian など）を guard で読み直しているだけ。
 * ＝ machine は store の“影絵”になっており、xstate を入れる意味が薄い（失敗1）。
 *
 * 入力データはこの store が持つ。
 */
export const useSandwichFormStore = defineStore("sandwichForm", () => {
  const formData = reactive<SandwichFormData>(structuredClone(initialFormData));

  const reset = () => {
    Object.assign(formData, structuredClone(initialFormData));
  };

  /** 複数選択（チェックボックス）のトグル */
  const toggleArrayValue = <T>(list: T[], value: T) => {
    const index = list.indexOf(value);
    if (index === -1) {
      list.push(value);
    } else {
      list.splice(index, 1);
    }
  };

  return {
    formData,
    reset,
    toggleArrayValue,
  };
});

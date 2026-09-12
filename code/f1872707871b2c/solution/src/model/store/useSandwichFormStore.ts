import { defineStore } from "pinia";
import { reactive } from "vue";
import type { SandwichFormData } from "./types";
import { initialFormData } from "./const";

/**
 * フォームの入力データ（＝data）を保持する Pinia store。
 *
 * TODO: 余力あったらあとで永続化など
 *
 * ★この記事のもう一方の主役★
 * store が持つのは「入力データそのもの」だけ。
 * 現在ページや表示ページ列といった“データから導出できるもの”はここに置かず、
 * useInputStep で都度導出する。
 *
 * 将来 sessionStorage などで永続化する場合も、入力データの source of truth は
 * xstate の context ではなく、この store に置く。
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

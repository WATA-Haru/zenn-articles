import { reactive } from "vue";
import type { SandwichFormData } from "./types";
import { initialFormData } from "./const";

/**
 * フォームの入力データを保持する単純なストア（シングルトン）。
 * 実プロジェクトでは Pinia store だが、サンプルなのでモジュールスコープの reactive で代用する。
 *
 * ポイントは「入力データしか持たない」こと。
 * 現在ページや表示ページ一覧はここに置かず、useInputStep で導出する。
 */
const formData = reactive<SandwichFormData>({ ...initialFormData });

export const useSandwichForm = () => {
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
};

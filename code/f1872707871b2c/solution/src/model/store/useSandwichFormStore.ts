import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  ChoiceUser,
  Hot,
  MainMeal,
  SandwichFormData,
  SideMenu,
  Source,
  Vegetable,
} from "../types";
import { initialFormData } from "../const";

/**
 * フォームの入力データ（＝data）を保持する Pinia store。
 *
 * ★この記事のもう一方の主役★
 * store が持つのは「入力データそのもの」と「そのデータを正しく変更する方法」だけ。
 * 現在ページや表示ページ列といった“導出できるもの”はここに置かず、
 * composables/ 側で都度導出する。
 *
 * setter がドメイン制約に基づく整合性リセットを担うので、
 * 呼び出し側（container）は「値を渡すだけ」で済む。
 */
export const useSandwichFormStore = defineStore("sandwichForm", () => {
  const formData = ref<SandwichFormData>(structuredClone(initialFormData));

  const setChoiceUser = (value: ChoiceUser) => {
    formData.value.choiceUser = value;
    // ベジタリアンは具材ページ自体が無くなるので具材をクリア
    if (value === "vegetarian") {
      formData.value.mainMeal = "";
    }
    // エビNG に切り替えたら、選べなくなる選択肢を除去
    if (value === "noShrimp") {
      if (formData.value.mainMeal === "shrimp") {
        formData.value.mainMeal = "";
      }
      formData.value.sideMenus = formData.value.sideMenus.filter(
        (item) => item !== "garlicShrimp"
      );
    }
  };

  const setMainMeal = (value: MainMeal) => {
    formData.value.mainMeal = value;
  };

  const setSource = (value: Source) => {
    formData.value.source = value;
    // 辛さはチリソースのときだけ。それ以外に変えたらクリア
    if (value !== "chili") {
      formData.value.hot = "";
    }
  };

  const setHot = (value: Hot) => {
    formData.value.hot = value;
  };

  const toggleVegetable = (value: Vegetable) => {
    formData.value.vegetables = formData.value.vegetables.includes(value)
      ? formData.value.vegetables.filter((item) => item !== value)
      : [...formData.value.vegetables, value];
  };

  const toggleSideMenu = (value: SideMenu) => {
    formData.value.sideMenus = formData.value.sideMenus.includes(value)
      ? formData.value.sideMenus.filter((item) => item !== value)
      : [...formData.value.sideMenus, value];
  };

  const reset = () => {
    formData.value = structuredClone(initialFormData);
  };

  return {
    formData,
    setChoiceUser,
    setMainMeal,
    setSource,
    setHot,
    toggleVegetable,
    toggleSideMenu,
    reset,
  };
});

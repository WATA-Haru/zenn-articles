import type { InputStepList } from "./const";

/**
 * 入力ステップ（＝1ページ）の識別子。
 * InputStepList から導出するので、配列に足せば型も増える。
 */
export type InputStep = (typeof InputStepList)[number];

export type ChoiceUser = "normal" | "vegetarian" | "noShrimp";
export type MainMeal = "beef" | "chicken" | "shrimp";
export type Vegetable = "tomato" | "avocado" | "lettuce";
export type Source = "chili" | "basil";
export type Hot = "mild" | "spicy";
export type SideMenu = "potato" | "cola" | "garlicShrimp";

/**
 * フォームの入力データ。
 * 「未選択」を "" / [] で表現する。
 *
 * state-machine 版では、machine が navigation を、store がこの formData を持つ。
 * → machine が分岐するときにこのデータを guard に注入する必要がある（＝失敗2）。
 */
export type SandwichFormData = {
  choiceUser: ChoiceUser | "";
  mainMeal: MainMeal | "";
  vegetables: Vegetable[];
  source: Source | "";
  hot: Hot | "";
  sideMenus: SideMenu[];
};

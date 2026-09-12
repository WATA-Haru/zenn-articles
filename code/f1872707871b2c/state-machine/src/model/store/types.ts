import type { InputStepList } from "./const";

/**
 * 入力ステップ（＝1ページ）の識別子。
 * InputStepList から導出するので、配列に足せば型も増える。
 */
export type InputStep = (typeof InputStepList)[number];

/** ラジオ・チェックボックスの選択肢 */
export type OptionInput = {
  value: string;
  label: string;
};

export type ChoiceUser = "normal" | "vegetarian" | "noShrimp";
export type MainMeal = "beef" | "chicken" | "shrimp" | "beans";
export type Vegetable = "tomato" | "avocado" | "lettuce";
export type Source = "cheese" | "chili" | "basil";
export type Hot = "mild" | "spicy";
export type SideMenu = "potato" | "cola" | "garlicShrimp";

/**
 * フォームの入力データ。
 * 「未選択」を "" / [] で表現する（実プロジェクトの FormData に合わせた素朴な持ち方）。
 *
 * 重要: ここには「今どのページか」も「表示するページ一覧」も持たない。
 *       それらはこのデータから導出できる（＝状態として持たない）。
 */
export type SandwichFormData = {
  choiceUser: ChoiceUser | "";
  mainMeal: MainMeal | "";
  vegetables: Vegetable[];
  source: Source | "";
  hot: Hot | "";
  sideMenus: SideMenu[];
};

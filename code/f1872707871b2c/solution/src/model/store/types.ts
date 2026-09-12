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

export type SandwichFormData = {
  choiceUser: ChoiceUser | "";
  mainMeal: MainMeal | "";
  vegetables: Vegetable[];
  source: Source | "";
  hot: Hot | "";
  sideMenus: SideMenu[];
};

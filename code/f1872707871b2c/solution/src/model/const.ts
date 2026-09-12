import type {
  ChoiceUser,
  Hot,
  MainMeal,
  SandwichFormData,
  SideMenu,
  Source,
  Vegetable,
} from "./types";

/**
 * 入力ステップ（＝ページ）の全種類。
 * この配列の要素が InputStep 型になる（実プロジェクトの InputStepList と同じ作り）。
 *
 * NOTE: ここに並べた順序が「ページを出す順序」ではない点に注意。
 *       実際に出すページと順序は formData から useInputStep で導出する。
 */
export const InputStepList = [
  "choiceUser",
  "mainMeal",
  "vegetable",
  "source",
  "hot",
  "sideMenu",
] as const;

/** フォームの初期状態 */
export const initialFormData: SandwichFormData = {
  choiceUser: "",
  mainMeal: "",
  vegetables: [],
  source: "",
  hot: "",
  sideMenus: [],
};

// --- 各ページで選べる値 -----------------------------------------------------
// 表示ラベルは view 側（pages/SandwichForm/optionLabels.ts）が持つ。

export const choiceUserValues: ChoiceUser[] = [
  "normal",
  "vegetarian",
  "noShrimp",
];
export const mainMealValues: MainMeal[] = ["beef", "chicken", "shrimp"];
export const vegetableValues: Vegetable[] = ["tomato", "avocado", "lettuce"];
export const sourceValues: Source[] = ["chili", "basil"];
export const hotValues: Hot[] = ["mild", "spicy"];
export const sideMenuValues: SideMenu[] = ["potato", "cola", "garlicShrimp"];

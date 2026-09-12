import type { OptionInput, SandwichFormData } from "./types";

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

// --- 各ページの選択肢 -------------------------------------------------------

export const choiceUserOptions: OptionInput[] = [
  { value: "normal", label: "ノーマル" },
  { value: "vegetarian", label: "ベジタリアン（肉・魚・乳製品NG）" },
  { value: "noShrimp", label: "エビNG" },
];

export const mainMealOptions: OptionInput[] = [
  { value: "beef", label: "ビーフ" },
  { value: "chicken", label: "チキン" },
  { value: "shrimp", label: "エビ" },
  { value: "beans", label: "豆" },
];

export const vegetableOptions: OptionInput[] = [
  { value: "tomato", label: "トマト" },
  { value: "avocado", label: "アボカド" },
  { value: "lettuce", label: "レタス" },
];

export const sourceOptions: OptionInput[] = [
  { value: "cheese", label: "チーズソース" },
  { value: "chili", label: "チリソース" },
  { value: "basil", label: "バジルソース" },
];

export const hotOptions: OptionInput[] = [
  { value: "mild", label: "少なめ" },
  { value: "spicy", label: "多め" },
];

export const sideMenuOptions: OptionInput[] = [
  { value: "potato", label: "ポテト" },
  { value: "cola", label: "コーラ" },
  { value: "garlicShrimp", label: "ガーリックシュリンプ" },
];

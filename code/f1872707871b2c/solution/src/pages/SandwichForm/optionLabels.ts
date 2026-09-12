import type {
  ChoiceUser,
  Hot,
  MainMeal,
  SideMenu,
  Source,
  Vegetable,
} from "../../model/types";

export const choiceUserLabels: Record<ChoiceUser, string> = {
  normal: "ノーマル",
  vegetarian: "ベジタリアン",
  noShrimp: "エビNG",
};

export const mainMealLabels: Record<MainMeal, string> = {
  beef: "ビーフ",
  chicken: "チキン",
  shrimp: "エビ",
};

export const vegetableLabels: Record<Vegetable, string> = {
  tomato: "トマト",
  avocado: "アボカド",
  lettuce: "レタス",
};

export const sourceLabels: Record<Source, string> = {
  chili: "チリソース",
  basil: "バジルソース",
};

export const hotLabels: Record<Hot, string> = {
  mild: "少なめ",
  spicy: "多め",
};

export const sideMenuLabels: Record<SideMenu, string> = {
  potato: "ポテト",
  cola: "コーラ",
  garlicShrimp: "ガーリックシュリンプ",
};

import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useSandwichFormStore } from "./useSandwichFormStore";
import { initialFormData } from "../const";

beforeEach(() => {
  setActivePinia(createPinia());
});

describe("useSandwichFormStore", () => {
  it("初期化したとき、formData が initialFormData と一致すること", () => {
    const store = useSandwichFormStore();
    expect(store.formData).toEqual(initialFormData);
  });

  describe("setChoiceUser", () => {
    it("値を渡したとき、formData.choiceUser にその値がセットされること", () => {
      const store = useSandwichFormStore();
      store.setChoiceUser("normal");
      expect(store.formData.choiceUser).toBe("normal");
    });

    it("vegetarian に変えたとき、mainMeal がクリアされること", () => {
      const store = useSandwichFormStore();
      store.setMainMeal("beef");
      store.setChoiceUser("vegetarian");
      expect(store.formData.mainMeal).toBe("");
    });

    it("mainMeal が shrimp のとき noShrimp に変えると、mainMeal がクリアされること", () => {
      const store = useSandwichFormStore();
      store.setMainMeal("shrimp");
      store.setChoiceUser("noShrimp");
      expect(store.formData.mainMeal).toBe("");
    });

    it("mainMeal が shrimp 以外のとき noShrimp に変えると、mainMeal は変わらないこと", () => {
      const store = useSandwichFormStore();
      store.setMainMeal("beef");
      store.setChoiceUser("noShrimp");
      expect(store.formData.mainMeal).toBe("beef");
    });

    it("noShrimp に変えたとき、sideMenus から garlicShrimp が除去されること", () => {
      const store = useSandwichFormStore();
      store.setSideMenu("potato");
      store.setSideMenu("garlicShrimp");
      store.setChoiceUser("noShrimp");
      expect(store.formData.sideMenus).toEqual(["potato"]);
    });
  });

  describe("setSource", () => {
    it("chili にセットしたとき、hot はクリアされないこと", () => {
      const store = useSandwichFormStore();
      store.setHot("spicy");
      store.setSource("chili");
      expect(store.formData.hot).toBe("spicy");
    });

    it("chili 以外に変えたとき、hot がクリアされること", () => {
      const store = useSandwichFormStore();
      store.setSource("chili");
      store.setHot("spicy");
      store.setSource("basil");
      expect(store.formData.hot).toBe("");
    });
  });

  describe("setVegetable", () => {
    it("未選択の値を渡したとき、vegetables に追加されること", () => {
      const store = useSandwichFormStore();
      store.setVegetable("tomato");
      expect(store.formData.vegetables).toEqual(["tomato"]);
    });

    it("選択済みの値を渡したとき、vegetables から削除されること", () => {
      const store = useSandwichFormStore();
      store.setVegetable("tomato");
      store.setVegetable("avocado");
      store.setVegetable("tomato");
      expect(store.formData.vegetables).toEqual(["avocado"]);
    });
  });

  describe("setSideMenu", () => {
    it("未選択の値を渡したとき、sideMenus に追加されること", () => {
      const store = useSandwichFormStore();
      store.setSideMenu("potato");
      expect(store.formData.sideMenus).toEqual(["potato"]);
    });

    it("選択済みの値を渡したとき、sideMenus から削除されること", () => {
      const store = useSandwichFormStore();
      store.setSideMenu("potato");
      store.setSideMenu("cola");
      store.setSideMenu("potato");
      expect(store.formData.sideMenus).toEqual(["cola"]);
    });
  });

  it("reset を呼んだとき、formData が初期状態に戻ること", () => {
    const store = useSandwichFormStore();
    store.setChoiceUser("normal");
    store.setMainMeal("beef");
    store.setVegetable("tomato");
    store.setSource("chili");
    store.setHot("spicy");
    store.setSideMenu("potato");

    store.reset();

    expect(store.formData).toEqual(initialFormData);
  });
});

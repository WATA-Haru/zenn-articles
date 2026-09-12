import { describe, expect, it } from "vitest";
import { createActor } from "xstate";
import { sandwichMachine } from "./machine";

/**
 * machine の遷移テスト。
 *
 * ここで示したいのは「next / back の分岐に、同じフラグを両方に渡さないと壊れる」こと。
 * それが失敗2（分岐の二重管理）の具体的な証拠になる。
 */

const start = () => {
  const actor = createActor(sandwichMachine).start();
  return actor;
};

describe("sandwichMachine", () => {
  it("開始したとき、choiceUser 状態になること", () => {
    const actor = start();
    expect(actor.getSnapshot().value).toBe("choiceUser");
  });

  describe("next（前進）", () => {
    it("choiceUser で next を送ると、mainMeal に進むこと", () => {
      const actor = start();
      actor.send({ type: "next" });
      expect(actor.getSnapshot().value).toBe("mainMeal");
    });

    it("choiceUser で isVegetarian フラグ付きの next を送ると、mainMeal をスキップして vegetable に進むこと", () => {
      const actor = start();
      actor.send({ type: "next", isVegetarian: true });
      expect(actor.getSnapshot().value).toBe("vegetable");
    });

    it("source で isChili フラグ付きの next を送ると、hot に進むこと", () => {
      const actor = start();
      actor.send({ type: "next" }); // choiceUser -> mainMeal
      actor.send({ type: "next" }); // mainMeal -> vegetable
      actor.send({ type: "next" }); // vegetable -> source
      actor.send({ type: "next", isChili: true });
      expect(actor.getSnapshot().value).toBe("hot");
    });

    it("source で isChili フラグ無しの next を送ると、hot をスキップして sideMenu に進むこと", () => {
      const actor = start();
      actor.send({ type: "next" });
      actor.send({ type: "next" });
      actor.send({ type: "next" });
      actor.send({ type: "next" });
      expect(actor.getSnapshot().value).toBe("sideMenu");
    });
  });

  describe("back（後退）", () => {
    it("vegetable で isVegetarian フラグ付きの back を送ると、choiceUser に戻ること", () => {
      const actor = start();
      actor.send({ type: "next", isVegetarian: true }); // choiceUser -> vegetable
      actor.send({ type: "back", isVegetarian: true });
      expect(actor.getSnapshot().value).toBe("choiceUser");
    });

    it("vegetable で isVegetarian フラグ無しの back を送ると、mainMeal に戻ること", () => {
      const actor = start();
      actor.send({ type: "next" }); // choiceUser -> mainMeal
      actor.send({ type: "next" }); // mainMeal -> vegetable
      actor.send({ type: "back" });
      expect(actor.getSnapshot().value).toBe("mainMeal");
    });

    it("sideMenu で isChili フラグ付きの back を送ると、hot に戻ること", () => {
      const actor = start();
      actor.send({ type: "next" });
      actor.send({ type: "next" });
      actor.send({ type: "next" });
      actor.send({ type: "next", isChili: true }); // source -> hot
      actor.send({ type: "next" }); // hot -> sideMenu
      actor.send({ type: "back", isChili: true });
      expect(actor.getSnapshot().value).toBe("hot");
    });
  });

  describe("分岐の二重管理（失敗2）の証拠", () => {
    it("行きは isVegetarian=true で vegetable まで進めたのに、帰りに isVegetarian を渡し忘れると mainMeal に迷い込むこと", () => {
      const actor = start();
      actor.send({ type: "next", isVegetarian: true }); // choiceUser -> vegetable
      // ↓ フラグを渡し忘れる
      actor.send({ type: "back" });
      // 期待: choiceUser に戻ってほしい。実際は mainMeal（存在しないはずのページ）に落ちる。
      expect(actor.getSnapshot().value).toBe("mainMeal");
    });
  });

  describe("完了と reset", () => {
    it("sideMenu で next を送ると、done に到達すること", () => {
      const actor = start();
      actor.send({ type: "next" });
      actor.send({ type: "next" });
      actor.send({ type: "next" });
      actor.send({ type: "next" });
      actor.send({ type: "next" });
      expect(actor.getSnapshot().value).toBe("done");
    });

    it("done で reset を送ると、choiceUser に戻ること", () => {
      const actor = start();
      for (let i = 0; i < 5; i++) actor.send({ type: "next" });
      actor.send({ type: "reset" });
      expect(actor.getSnapshot().value).toBe("choiceUser");
    });
  });
});

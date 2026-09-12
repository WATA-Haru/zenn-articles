import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// このディレクトリ単体で `npm run dev` すると playground が立ち上がる
// GitHub Pages 用に build するときは PAGES_BASE 環境変数でベースパスを渡す
export default defineConfig({
  base: process.env.PAGES_BASE ?? "/",
  plugins: [vue()],
});

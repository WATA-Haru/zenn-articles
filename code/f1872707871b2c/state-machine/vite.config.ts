import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// このディレクトリ単体で `npm run dev` すると playground が立ち上がる
export default defineConfig({
  plugins: [vue()],
});

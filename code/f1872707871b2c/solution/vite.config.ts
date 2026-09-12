import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// solution ディレクトリ単体で `npm run dev` すると playground が立ち上がる
export default defineConfig({
  plugins: [vue()],
});

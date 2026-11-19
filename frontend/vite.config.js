import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

export default defineConfig({
  plugins: [react()],

  server: {
    host: "0.0.0.0",
    port: 5175,

    https: {
      key: fs.readFileSync(
        path.resolve(__dirname, "cert/local-key.pem"),
      ),

      cert: fs.readFileSync(path.resolve(__dirname, "cert/local.pem")),
    },
  },
});

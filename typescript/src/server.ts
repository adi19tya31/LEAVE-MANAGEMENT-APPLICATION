import dotenv from "dotenv";
dotenv.config();

import https from "https";
import fs from "fs";
import path from "path";

import app from "./app";

const PORT = Number(process.env.PORT || 5000);
const HOST = process.env.HOST || "0.0.0.0";

const sslOptions = {
  key: fs.readFileSync(
    path.resolve(
      __dirname,
      "../cert/192.168.1.53+2-key.pem"
    )
  ),

  cert: fs.readFileSync(
    path.resolve(
      __dirname,
      "../cert/192.168.1.53+2.pem"
    )
  ),
};

https
  .createServer(sslOptions, app)
  .listen(PORT, HOST, () => {
    console.log(
      `Leave management API running on https://192.168.1.52:${PORT}`
    );
  });
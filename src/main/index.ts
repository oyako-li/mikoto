/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 * npm install --no-save --build-from-source serialport@10.4.0 // build serialport
 */

import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import glob from "glob";
import router from "./server";
import { myLog } from "./logger";
import dotenv from "dotenv";

dotenv.config();
const HOSTNAME = process.env.HOSTNAME;
const DEBUG = process.env.DEBUG === "true";
const PORT = process.env.PORT;

if (!DEBUG) {
  console.log = console.info = console.warn = console.error = myLog();
}

let win: BrowserWindow | null = null;
function createWindow() {
  router.get("/", async (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
  });

  router.get("/list/", async (req, res) => {
    const files = await glob(`${app.getPath("userData")}/log/*/*.log`);
    console.log(`${app.getPath("userData")}/log/*/*.log`);
    return res.json({ files: files });
  });

  router.get("/log/:filename", async (req, res) => {
    const filename = req.params.filename;

    res.download(filename.replaceAll(",", "/"), (err) => {
      if (err) {
        console.log("Error downloading file:", err);
      } else {
        console.log("File downloaded successfully");
      }
    });
  });

  router.get("/pose/", async (req, res) => {});

  router.listen(Number(PORT), "127.0.0.1", () => {
    console.log(`Listening on port ${PORT}`);
    win = new BrowserWindow({
      width: 300,
      height: 600,
      frame: false,
      resizable: true,
      transparent: true,
      hasShadow: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
        enableBlinkFeatures: "WebSpeech",
        preload: path.join(__dirname, "preload.js"),
      },
    });

    win.loadURL(`http://127.0.0.1:${PORT}/#/home`);
    win.on("closed", () => {
      win = null;
    });
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});

ipcMain.handle("post", (event, data) => {
  return;
});

ipcMain.handle("get", async (event, data) => {
  return;
});

ipcMain.handle("command", async (event, data) => {
  let result = false;
  switch (data) {
    case "context-lost":
      result = true;
      win.reload();
    default:
      break;
  }
  return result;
});

ipcMain.handle("stream", async (event, data) => {
  return win.webContents.send("embody", data);
});

ipcMain.handle("voice", async (event, data) => {
  let newData = data.split(";");
  console.log(newData[0]);
  newData[0] = "data:audio/ogg;";
  newData = newData[0] + newData[1];
  return win.webContents.send("speak", newData);
});

process.on("uncaughtException", (err, source) => {
  console.error(err, source);
  app.quit();
});

process.on("SIGINT", () => {
  app.quit();
});

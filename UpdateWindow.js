const { app, BrowserWindow } = require("electron");
const log = require("electron-log");
const { autoUpdater } = require("electron-updater");

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

class UpdateWindow {
  win = null;

  constructor() {
    autoUpdater.on("checking-for-update", () => {
      this.sendStatusToWindow("Checking for update...");
    });
    autoUpdater.on("update-available", (info) => {
      this.sendStatusToWindow("Update available.");
    });
    autoUpdater.on("update-not-available", (info) => {
      this.sendStatusToWindow("Update not available.");
    });
    autoUpdater.on("error", (err) => {
      this.sendStatusToWindow("Error in auto-updater. " + err);
    });
    autoUpdater.on("download-progress", (progressObj) => {
      let log_message = "Download speed: " + progressObj.bytesPerSecond;
      log_message = log_message + " - Downloaded " + progressObj.percent + "%";
      log_message =
        log_message +
        " (" +
        progressObj.transferred +
        "/" +
        progressObj.total +
        ")";
      this.sendStatusToWindow(log_message);
    });
    autoUpdater.on("update-downloaded", (info) => {
      this.sendStatusToWindow("Update downloaded");
    });
  }

  createWindow() {
    this.win = new BrowserWindow({
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    // Open the DevTools.
    this.win.webContents.openDevTools();

    this.win.on("closed", () => {
      this.win = null;
    });
    this.win.loadURL(`file://${__dirname}/version.html#v${app.getVersion()}`);
    return this.win;
  }

  sendStatusToWindow(text) {
    log.info(text);
    this.win.webContents.send("message", text);
  }

  checkForUpdatesAndNotify() {
    autoUpdater.checkForUpdatesAndNotify();
  }
}

module.exports = UpdateWindow;

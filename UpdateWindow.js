const { app, BrowserWindow } = require("electron");
const log = require("electron-log");
const { autoUpdater } = require("electron-updater");

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

const PayloadStatus = {
  Error: 0,
  CheckUpdate: 1,
  UpdateAvailable: 2,
  UpdateNotAvailable: 3,
  Downloading: 4,
  Downloaded: 5,
};

function getPayloadStatusTitle(status) {
  if (status === PayloadStatus.Error) return "Auto Update Error";
  if (status === PayloadStatus.CheckUpdate) return "Check For Update";
  if (status === PayloadStatus.UpdateAvailable) return "Update Available";
  if (status === PayloadStatus.UpdateNotAvailable) return "Update Not Available";
  if (status === PayloadStatus.Downloading) return "Downloading";
  if (status === PayloadStatus.Downloaded) return "Downloaded";
}

class UpdateWindow {
  win = null;

  constructor() {
    autoUpdater.on("checking-for-update", () => {
      this.sendStatusToWindow(PayloadStatus.CheckUpdate, "Checking for update...");
    });
    autoUpdater.on("update-available", (info) => {
      this.sendStatusToWindow(PayloadStatus.UpdateAvailable, "Update available.");
    });
    autoUpdater.on("update-not-available", (info) => {
      this.sendStatusToWindow(PayloadStatus.UpdateNotAvailable, "Update not available.");
    });
    autoUpdater.on("error", (err) => {
      this.sendStatusToWindow(PayloadStatus.Error, "Error in auto-updater. " + err);
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
      this.sendStatusToWindow(PayloadStatus.Downloading, log_message);
    });
    autoUpdater.on("update-downloaded", (info) => {
      this.sendStatusToWindow(PayloadStatus.Downloaded, "Update downloaded");
    });
  }

  createWindow() {
    this.win = new BrowserWindow({
      webPreferences: {
        width: 500,
        height: 400,
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    // Open the DevTools.
    if (process.env.NODE_ENV === "development") {
      this.win.webContents.openDevTools();
    }

    this.win.on("closed", () => {
      this.win = null;
    });
    this.win.loadURL(`file://${__dirname}/version.html#v${app.getVersion()}`);
    return this.win;
  }

  sendStatusToWindow(status, message, data) {
    log.info(message);
    this.win.webContents.send('payload', JSON.stringify({
      title: getPayloadStatusTitle(status),
      status,
      message,
      data,
    }));
  }

  checkForUpdatesAndNotify() {
    autoUpdater.checkForUpdatesAndNotify();
  }
}

module.exports = UpdateWindow;

const {app, BrowserWindow, screen} = require('electron')

class InsistWindow {
  share;
  isShow = false

  constructor({share}) {
    this.share = share;
    app.whenReady().then(async () => {
      this.win = new BrowserWindow({
        width: 400,
        height: screen.getPrimaryDisplay().workAreaSize.height,
        y: 0,
        x: screen.getPrimaryDisplay().workAreaSize.width - 400 - 5,
        frame: false,
        skipTaskbar: true,
        resizable: false,
        alwaysOnTop: true,
        show: this.isShow
      });
      await this.win.loadURL(this.share.config.url);
    })
  }

  runJS(func) {
    this.win.webContents.executeJavaScript(`(${func.toString()})();`)
  }

  showOrHide() {
    if (!this.isShow) this.win.show()
    else this.win.hide()
    this.isShow = !this.isShow;
  }
}

module.exports = InsistWindow;

const {app, BrowserWindow, screen} = require('electron')

class InsistWindow {
  share;

  constructor({share}) {
    this.share = share;
    app.whenReady().then(async () => {
      this.win = new BrowserWindow({
        width: 400,
        height: screen.getPrimaryDisplay().workAreaSize.height,
        y: 0,
        x: screen.getPrimaryDisplay().workAreaSize.width - 400 ,
        frame: false,
        skipTaskbar: true,
        resizable: false,
        alwaysOnTop: true,
        show: false
      });
      await this.win.loadURL(this.share.config.url);
    })
  }

  runJS(func) {
    this.win.webContents.executeJavaScript(`(${func.toString()})();`)
  }

  showOrHide({force} = {}) {
    if (force || !this.win.isVisible()) this.win.show()
    else this.win.hide()
  }
}

module.exports = InsistWindow;

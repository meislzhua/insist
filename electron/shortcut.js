const {app, globalShortcut} = require('electron')

class InsistShortcut {
  share;
  list = []

  constructor({share}) {
    this.share = share;
    app.whenReady().then(async () => {
      let ret = globalShortcut.register("ctrl+shift+alt+q", () => share.window.showOrHide())
    })
  }
}

app.on('will-quit', () => {

  // 注销所有快捷键
  globalShortcut.unregisterAll()
})
module.exports = InsistShortcut;

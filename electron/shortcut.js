const {app, globalShortcut} = require('electron')

class InsistShortcut {
  share;
  list = []

  constructor({share}) {
    this.share = share;
    app.whenReady().then(async () => {
      //快速隐藏,显示
      globalShortcut.register("ctrl+shift+alt+q", () => share.window.showOrHide())
      //快速添加任务
      globalShortcut.register("ctrl+shift+alt+a", () => {
        share.window.showOrHide({force: true})
        share.window.runJS(async () => {
          window.insist.history.push("/goal");

          let count = 20;
          let delay = 500;
          while (count-- && !window.insist.event.emit("addGoalInPage")) {
            await new Promise(resolve => setTimeout(resolve, delay))
          }
        })
      })

    })
  }
}

app.on('will-quit', () => {

  // 注销所有快捷键
  globalShortcut.unregisterAll()
})
module.exports = InsistShortcut;

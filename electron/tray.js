const {app, Menu, Tray} = require('electron')
const path = require('path')


class InsistTray {
  tray = null;
  share = null;

  constructor({share}) {
    this.share = share;
    app.whenReady().then(() => {
      this.tray = new Tray(path.join(__dirname, './icon/icon.ico'))
      const contextMenu = Menu.buildFromTemplate([
        {label: '测试版本'},
        {label: '设置(尚未开发)'},
        {
          label: '显示/隐藏', click() {
            if (!share.window) return;
            share.window.showOrHide();
          }
        },
        {
          label: '退出',
          click() {
            app.quit();
          }
        }
      ])
      this.tray.setToolTip('坚持就胜利!')
      this.tray.setContextMenu(contextMenu)

      //设定事件
      // this.tray.on("click",()=>this.share.window.showOrHide())
      this.tray.on("double-click",()=>this.share.window.showOrHide())


    })




  }
}

module.exports = InsistTray

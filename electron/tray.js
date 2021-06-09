const {app, Menu, Tray, dialog} = require('electron')
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
          {
            label: '开机启动',
            checked: app.getLoginItemSettings().openAtLogin, // 获取当前自启动状态
            type: 'checkbox',
            click: () => {
              app.setLoginItemSettings({openAtLogin: !app.getLoginItemSettings().openAtLogin, path: process.execPath})
            }
          },

          {label: '设置(尚未开发)'},
          {
            label: '开发者', click() {
              share.window.win.webContents.openDevTools({mode: "detach"})
            }
          },
          {
            label: '显示/隐藏', click() {
              if (!share.window) return;
              share.window.showOrHide();
            }
          },
          {

            label: '清空缓存',
            click: async () => {

              if (!share.window) return;
              console.log("start clean");

              await share.window.win.webContents.session.clearStorageData({
                storages: ['appcache', 'filesystem', 'indexdb', 'localstorage', 'shadercache', 'websql', 'serviceworkers', 'cachestorage'],
              })


              share.window.win.reload()
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
        this.tray.on("double-click", () => this.share.window.showOrHide())


      }
    )


  }
}

module.exports = InsistTray

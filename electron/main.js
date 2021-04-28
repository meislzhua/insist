const {app} = require('electron')
const path = require('path')
const fs = require('fs')

const debug = (process.argv.indexOf("--debug") >= 0)
const config_production = require("./config.json")
const config_dev = require("./config.dev.json")
const config = debug ? config_dev : config_production


const InsistTray = require("./tray")
const InsistWindow = require("./window")
const InsistShortcut = require("./shortcut")


app.whenReady().then(() => {
  let share = {
    config
  }
  share.tray = new InsistTray({share});
  share.window = new InsistWindow({share});
  share.shortcut = new InsistShortcut({share});
})

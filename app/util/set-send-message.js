const {ipcMain} = require('electron')
module.exports = function setSendMessage(mainWindow){
  ipcMain.removeAllListeners('send-message')
  ipcMain.on('send-message', (ev, messageJson)=>{
    mainWindow.emit('send-message', messageJson, data=>{
      ev.sender.send('send-message-response', data)
    })
  })
}
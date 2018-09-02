module.exports = function uploadViaCLI(mainWindow,argObj){
  const {upload} = argObj
  if(upload){
    mainWindow.emit('upload-tl-app', upload)
  }
}
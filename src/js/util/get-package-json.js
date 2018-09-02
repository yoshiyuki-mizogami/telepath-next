const eventHub = require('../../js/g-event')
const {remote} = require('electron')
const {basename} = require('path')
let preventDuplicateDialog = false
function getPackageJson(message){
  if(preventDuplicateDialog){
    return false
  }
  preventDuplicateDialog = true
  const {dialog} = remote
  return new Promise(resolve=>{
    dialog.showOpenDialog({
      title:message,
      properties:['openFile'],
      filters:[{
        name:'package.json',
        extensions:['json']
      }]
    }, (files)=>{
      preventDuplicateDialog = false
      if(!files){
        return resolve()
      }
      const [file] = files
      const filename = basename(file)
      if(filename !== 'package.json'){
        eventHub.$emit('notify-message', 'Should select package.json.')
        return resolve()
      }
      resolve(file)
    })
  })
}
module.exports = getPackageJson
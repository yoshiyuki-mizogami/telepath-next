<script type="text/javascript">
document.write('hoge')
var validVersion = '1.1.7'
var update = (validVersion)=>{
  var toI = s=>{
    return s.split('.')
    .reverse().reduce((b,c,i)=> b + ((+c) * ( +('1' + '0'.repeat(i+1)) )), 0)
  }
  var el = require('electron')
  var remote = el.remote
  var currentVersion = remote.app.getVersion()
  var validValue = toI(validVersion)
  var currentValue = toI(currentVersion)
  console.log(validValue, currentValue)
  if(validValue <= currentValue){
    return
  }
  let installer = 'installerpath'
  console.log('update')
  //el.shell.openItem(installer)
}

update(validVersion)
</script>
UpdateIt
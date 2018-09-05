const g = require('gulp')
const runSeq = require('run-sequence')
const {fork} = require('child_process')
const path = require('path')
const fs = require('fs').promises
const UPLOAD_DIR = 'INSTALLER_UPLOAD_DIR'
const DEPLOY_DEST = '--'
const ATTACHMENT_DEST = 'ATTACHMENT_DEST_URL'
let LOCAL = false
let isDEV = false
g.task('boot-server', ()=>{
  let sv
  bootServer()
  function bootServer(){
    console.log('boot ws server')
    const scr = path.join('server', 'server.js')
    sv = fork(scr, {
      execArg:['--inspect']
    })
    sv.on('close', bootServer)
  }
})
g.task('dev', ()=>{
  const el = require('electron')
  const {spawn} = require('child_process')
  let cp
  const boot = ()=>{
    const arg = ['app']
    if(LOCAL){
      arg.push('--local')
    }
    cp = spawn(el, arg)
    cp.on('close', boot)
    cp.stdout.pipe(process.stdout)
  }
  const webpack = require('webpack')
  const wpConfig = require('./webpack.config')
  wpConfig.mode = 'development'
  const comp = webpack(wpConfig)
  comp.watch({},(er, stats)=>{
    if(er){
      console.error(er)
    }
    if(cp){
      cp.stdin.write('reload\n')
    }else{
      boot()
    }
    console.log(stats.toString({colors:true}))
  })
})
g.task('dev-local',()=>{
  LOCAL = true
  return runSeq('dev')
})

g.task('compile-product',clbk=>{
  const webpack = require('webpack')
  const wpConfig = require('./webpack.config')
  wpConfig.devtool = false
  const comp = webpack(wpConfig)
  comp.run((er, stats)=>{
    if(er){
      console.error(er)
    }
    console.log(stats.toString({colors:true}))
    clbk()
  })
})

g.task('build', ['compile-product'],async ()=>{
  const del =  require('del')
  await del('./dist/nsis-web/**')
  const builder = require('electron-builder')
  return builder.build({
    platform:'win32',
    arch:'ia32',
    config:{
      asar:false,
      productName:'TelepathNextCloud',
      directories:{
        app:'app',
        output:'dist'
      },
      copyright:'Copyright © 2018 Yoshiyuki Mizogami',
      win:{
        target:['nsis'],
        icon:'app/img/logo.ico',
      },
      nsis:{
        oneClick:true,
        shortcutName:'TelepathNextCloud',
        artifactName:'TelepathNextCloudInstaller.exe',
        installerIcon:'img/ins.ico',
        uninstallerIcon:'img/ins.ico'
      }
    }
  })
})
g.task('deploy-help',async ()=>{
  
  const mounter = require('sp-mounter')('Y')
  await mounter.mount(ATTACHMENT_DEST)
  const str = g.src('./help/**')
    .pipe(g.dest('Y:\\'))
  str.on('finish', ()=>{
    mounter.unmount()
  })
  return str
})

g.task('deploy', ['build'],async (clbk)=>{
  const del = require('del')
  del(UPLOAD_DIR + '/*.{exe,7z}')
    .then(()=>{
      const res = g.src('./dist/*.exe')
        .pipe(g.dest(UPLOAD_DIR))
      res.on('close',()=>clbk())
    })
})
g.task('compile-manager', ()=>{
  isDEV = true
  runSeq('compile-manager-product')
})
g.task('compile-manager-product', clbk=>{
  const webpack = require('webpack')
  const wpConfig = require('./manager-webpack.config')
  wpConfig.devtool = false
  if(isDEV){
    wpConfig.mode = 'development'
  }
  const comp = webpack(wpConfig)
  comp.watch({},(er, stats)=>{
    if(er){
      console.error(er)
    }
    console.log(stats.toString({colors:true}))
    clbk()
    clbk = function(){}
  })
})
const SERVER_DEPLOY_DEST = '\\\\10.26.196.243\\telepath-next-server\\server'
g.task('deploy-server',()=>{
  return g.src([
    './server/*.{js,json}',
    './server/{actions,manage-actions,files,resources,util}/**'
  ],{
    base:'./server'
  }).pipe(g.dest(SERVER_DEPLOY_DEST))
})
g.task('sync-ver', async ()=>{
  const {version} = require('./app/package.json')
  const {MongoClient} = require('mongodb')
  const url = 'mongodb://telepathUser:telepathPassword@10.26.196.243:27017/telepath'
  await MongoClient.connect(url, async (er, client)=>{
    if(er){
      console.error(er)
      throw new Error(er)
    }
    const db = client.db('telepath')
    await db.collection('etcs').updateOne({key:'version'}, {$set:{value:version}})
    await client.close()
    console.log(`db.etcs version document update to ${version}`)
  })
})
g.task('reload-server-funcs', ()=>{
  return g.src('./server/update-event-file', {base:'./server'})
    .pipe(g.dest(SERVER_DEPLOY_DEST))
})

g.task('deploy-server-modules',()=>{
  return g.src('./node_modules/**')
    .pipe(g.dest(`\\\\${DEPLOY_DEST}\\telepath-next-server\\node_modules`))
})

g.task('dev-manager',['compile-manager', 'boot-server'])

g.task('reboot-server', clbk=>{
  const script = 'server-script-file'
  const host = 'D0802931'
  const {exec} = require('child_process')
  exec(`powershell Invoke-Command -ScriptBlock {${script}} -ComputerName ${host}`, ()=>{
    console.log('exec done')
    clbk()
  })
})

const ASAR_DEST = '\\\\10.26.196.243\\telepath-next-server\\server\\resources'
const LOCAL_DEST = 'server\\resources\\app.asar'
g.task('deploy-asar', ['compile-product'], resolve=>{
  const asar = require('asar')
  asar.createPackage('app/', LOCAL_DEST, ()=>{
    const sr =g.src(LOCAL_DEST)
      .pipe(g.dest(ASAR_DEST))
    sr.on('finish',()=>{
      console.log(ASAR_DEST, 'done')
      resolve()
    })
  })
})

g.task('init-setting', async ()=>{
  fs.mkdir(path.join(__dirname, 'server', 'root', 'apps'))
})
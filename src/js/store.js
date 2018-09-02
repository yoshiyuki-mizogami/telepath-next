import Vuex from 'vuex'
import Vue from 'vue'
import config from './config'
import uiStrings from './ui-strings'
import avoidNameSaveFile from './util/avoid-name-save-file.js'
import el from 'electron'
import ws from './ws-connection'
import path from 'path'
import Message from './classes/message'
import gev from './g-event'
import globals from './globals'
import db from './db'
import fontSizeChanger from './util/font-size-changer'
import setTheme from './util/set-theme'
import getIdleManager from './util/detect-idle'
import {format, promisify} from 'util'
import {deployApp, removeApp} from '../js/util/deploy-app'
import asar from './asar'
import fs from 'fs'
import pfs from './util/fs-promise'
import getPackageJson from './util/get-package-json'
import ofs from 'original-fs'
import messageParser from  './util/message-parser'
const oWriteFilep = promisify(ofs.writeFile)
const UNREAD_TIMEOUT = 30000
const SET_IDLE_TIME = 1000 * 60 * 4
const LIMIT_APP_BIN_SIZE = 1024 * 1024 * 15// 15 Mib
const {SORT_ORDER} = globals
const {remote, ipcRenderer} = el
const {Menu,protocol, app, dialog} = remote
const thisWindow = remote.getCurrentWindow()
thisWindow.removeAllListeners('upload-tl-app')
thisWindow.on('upload-tl-app', (data)=>{//for cli upload
  store.dispatch('uploadApp', data)
})
thisWindow.on('get-account-info', f=>{
  const {state} = store
  f(JSON.stringify({
    name:state.loginedInfo.nickname || state.loginedInfo.name,
    account:state.loginedInfo.account,
    icon:store.getters.createIconUrl(state.loginedInfo.account)
  }))
})
thisWindow.on('send-message', async (messageObj, clbk = ()=>{})=>{
  const tf = await store.dispatch('sendMessage',JSON.parse(messageObj))
  clbk(tf)
})
Vue.use(Vuex)
const store = new Vuex.Store({
  state:{
    version:globals.version,
    boot:true,
    loginedInfo:{
      account:'',
      name:'',
      nickname:'', 
      tel:'',
      mail:'',
      depart:'',
      message:'',
      teamOrder:[],
      iconCache:0
    },
    config:{
      lang:'ja',
      fontSize:13,
      downloadDir:'',
      theme:'basic',
      unselectAfterSend:false,
      sortOrder:SORT_ORDER.DD,
      preventScroll:false,
      aggregateDests:true,
      preventNotify:false
    },
    ui:uiStrings.en,
    messages:[],
    teams:[],
    ws,
    alwaysOnTop:false,
    favorites:[],
    bootingOther:false,
    sending:false,
    filterUnread:false,
    filterImportant:false,
    unreadCount:0,
    showReplyForm:false,
    searchText:'',
    getBelongsQueue:[],
    unreadCursorIndex:0,
    unreadCursorEv:null,
    idle:false,
    apps:[],
    connected:false,
    appUploading:false
  },
  mutations:{
    setConnect(state, b){
      state.connected = b
    },
    addBelongsQueue(state, vm){
      state.getBelongsQueue.push(vm)
    },
    addNewMessage(state,obj){
      const m = new Message(obj.message, state.loginedInfo._id)
      if(!state.showReplyForm && (m.isMine || !thisWindow.isFocused())){
        setTimeout(()=>m.emit('scroll'), 100)
      }
      if(m.isMine){
        state.sending = false
      }
      const SO = state.config.sortOrder
      if(m.parent){
        return Message.addChild(m, SO & SORT_ORDER.MA)
      }
      if( SO & SORT_ORDER.TA){
        return state.messages.push(m)
      }
      state.messages.unshift(m)
    },
    setConfig(state, config){
      Object.assign(state.config, config)
      setTheme(state.config.theme)
    },
    setSending(state){
      state.sending = true
    },
    setUI(state){
      state.ui = uiStrings[state.config.lang]
    },
    setLang(state, lang){
      state.config.lang = lang
      store.commit('setUI')
    },
    setFontSize(state, size){
      state.config.fontSize = size
      fontSizeChanger(size)
    },
    setSortOrderOR(state, order){
      state.config.sortOrder = state.config.sortOrder | order
      store.commit('sortChange')
    },
    setSortOrderXOR(state, order){
      state.config.sortOrder = state.config.sortOrder ^ order
      store.commit('sortChange')
    },
    setAggregateDests(state, tf){
      state.config.aggregateDests = tf
    },
    setShowReplyForm(state, show){
      state.showReplyForm = show
    },
    setSearchText(state, text){
      state.searchText = text
    },
    sortChange(state){
      const so = state.config.sortOrder
      let ox = -1
      if(so & SORT_ORDER.TA){
        ox = 1
      }
      state.messages.sort((a,b)=>(a.sendAt.getTime() - b.sendAt.getTime()) * ox)
      ox = -1
      if(so & SORT_ORDER.MA){
        ox = 1
      }
      state.messages.forEach(m=>m.children.sort((a,b)=>(a.sendAt.getTime() - b.sendAt.getTime()) * ox))
    },
    setUnselectAfterSend(state, send){
      state.config.unselectAfterSend = send
    },
    setTheme(state, theme){
      state.config.theme = theme
      setTheme(theme)
    },
    setPreventNotify(state, tf){
      state.config.preventNotify = tf
    },
    setMessages(state, messages){
      const so = state.config.sortOrder
      if(so & SORT_ORDER.TA){
        messages.reverse()
      }
      if(so & SORT_ORDER.MA){
        messages.forEach(m=>m.children.reverse())
      }
      state.boot = true
      state.messages = messages
      setTimeout(()=>{
        state.boot = false
      },15)
    },
    setTeams(state, teams){
      const max = teams.length + 1
      const so = state.loginedInfo.teamOrder || {}
      teams.sort(function sortTeam(a,b){
        const ai = so[a._id] || max
        const bi = so[b._id] || max
        return ai - bi
      })
      state.teams = teams
    },
    setUploading(state, b){
      state.appUploading = b
    },
    switchFilterUnread(state){
      state.filterUnread = !state.filterUnread
    },
    switchFilterImportant(state){
      state.filterImportant = !state.filterImportant
    },
    toggleAlwaysOnTop(state){
      state.alwaysOnTop = !state.alwaysOnTop
      thisWindow.setAlwaysOnTop(state.alwaysOnTop)
    },
    bootOther(state, set){
      state.bootingOther = set
    },
    clearFilter(state){
      state.searchText = ''
      state.filterImportant =  state.filterUnread = false
    }
  },
  actions:{
    addKeep({state}, messageId){
      state.sending = true
      state.ws.send({
        method:'addKeep',
        messageId
      })
    },
    removeKeep({state}, messageId){
      state.sending = true
      state.ws.send({
        method:'removeKeep',
        messageId
      })
    },
    removedKeep({state}, obj){
      state.sending = false
      gev.$emit('remove-keep', obj.messageId)
    },
    getKeeps({state}){
      state.sending = true
      state.ws.send({
        method:'getKeeps'
      })
    },
    getTelepath({state}){
      state.ws.send({
        method:'getTelepath'
      })
    },
    async gotTelepath(store, obj){
      const {state} = store
      const {data} = obj
      const tmpAsar = path.join(remote.app.getPath('temp'), Date.now() + '.asar')
      await oWriteFilep(tmpAsar, data, 'base64')
      asar.extractAll(tmpAsar,globals.rootdir)
      store.dispatch('notifyDetail', state.ui.TELEPATH_UPDATED)
    },
    gotKeeps({state}, obj){
      state.sending = false
      gev.$emit('show-keeps', obj.keeps)
    },
    initConfig(store){
      thisWindow.on('get-account', f=> f(store.state.loginedInfo.account))
      const idleManager = getIdleManager(SET_IDLE_TIME)
      idleManager.on('idle', ()=>store.dispatch('setIdle'))
      idleManager.on('active', ()=>store.dispatch('unsetIdle'))
      return config.get()
        .then(conf=>{
          store.commit('setConfig', conf)
          store.commit('setUI')
          fontSizeChanger(store.state.config.fontSize)
        })
    },
    async loadAllApps({state}){
      const dirItems = await pfs.readdir(globals.appsDir)
      const jsons = dirItems.filter(i=>/\.apps\.json$/.test(i)).map(i=>path.join(globals.appsDir, i))
      const allApp = []
      await jsons.reduce((b, json)=>{
        return b.then(async ()=>{
          const apps = JSON.parse(await pfs.readFile(json))
          allApp.push(...Object.keys(apps).map(k=>apps[k]))
        })
      }, Promise.resolve())
      state.apps = allApp
    },
    async setApps(store){
      const {state} = store
      if(!state.loginedInfo.account){
        return store.dispatch('loadAllApps')
      }
      const jsonPath = path.join(globals.appsDir, state.loginedInfo.account + globals.appsJson)
      try{
        const aJson = await pfs.readFile(jsonPath, 'utf8')
        const apps = JSON.parse(aJson)
        state.apps = Object.keys(apps).map(a=>{
          return apps[a]
        })
      }catch(e){
        console.error(e)
      }
    },
    receiveUpdateApp({state},{name}){
      const app = state.apps.find(a=> a.name === name)
      if(!app){
        return
      }
      state.ws.send({
        method:'checkUpdateApps',
        apps:[{_id:app._id, version:app.version}]
      })
    },
    checkUpdate({state}, tgApp){
      let apps
      if(tgApp){
        apps = [tgApp]
      }else{
        apps = state.apps
      }
      if(!apps.length){
        return
      }
      state.ws.send({
        method:'checkUpdateApps',
        apps:state.apps.map(a=>{
          return {
            _id:a._id,
            version:a.version
          }
        })
      })
    },
    login({state},{account, password, version}){
      state.ws.send({
        method:'login',
        account:account,
        pwd:password,
        version
      })
    },
    loginFailed({state}){
      gev.$emit('result-login',{
        ok:false,
        message:format(state.ui.LOGIN_FAILED)
      })
    },
    logined(store,data){
      const {state} = store
      store.dispatch('unselectAll')
      Message.clearMessage()
      gev.$emit('result-login', {ok:true})
      const {user, teams, messages} = data
      Object.assign(state.loginedInfo, user)
      store.commit('setTeams',teams)
      store.dispatch('getMessages', messages)
      store.dispatch('setApps')
        .then(()=>{
          store.dispatch('checkUpdate')
          store.dispatch('autoBootApp')
        })
    },
    autoBootApp(store){
      const {state:{apps}} = store
      apps.forEach(a=>a.autoBoot && store.dispatch('bootApp', a))

    }, 
    saveConfig(store, conf){
      return config.set(conf)
    },
    getFile({state}, {id,download}){
      state.sending =true
      state.ws.send({
        method:'getFile',
        id,
        download
      })
    },
    checkUnread({state}){
      state.unreadCount = Message.getUnreadCount()
    },
    async gotFile({state}, {file, download}){
      state.sending = false
      if(!download){
        return gev.$emit('recieve-img', file)
      }
      const savedFilepath = await avoidNameSaveFile(state.config.downloadDir, file.name, file.content)
      gev.$emit('download-effect', savedFilepath)
    },
    openDownloadDir({state}){
      const {shell} = el
      shell.openExternal(state.config.downloadDir)
    },
    notifyDetail(store, body){
      const noti = new Notification('Telepath Notification', {
        icon:path.join(globals.imgDir, 'logo.ico'),
        body
      })
      noti.onclick = ()=>{
        store.dispatch('restore')
      }
    },
    notify(store,title){
      if(store.state.config.preventNotify || thisWindow.isFocused()){
        return
      }
      const noti = new Notification(title)
      noti.onclick = ()=>{
        store.dispatch('restore')
      }
    },
    readMessage({state}, obj){
      state.ws.send({
        method:'addRead',
        messageId:obj.id,
        priority:obj.priority
      })
    },
    readAllUnreadMessage(store){
      const unreads = Message.getUnreads()
      unreads.forEach(o=>store.dispatch('readMessage', o))
    },
    moveToUnread(store){
      const {state} = store
      const {unreadCursorIndex, messages} = state
      let hitCount = 0
      clearTimeout(state.unreadCursorEv)
      const hit = messages.some(m=>{
        if(!m.isRead){
          if(unreadCursorIndex === hitCount){
            m.emit('scroll')
            return true
          }
          hitCount++
        }
        return m.children.some((cm)=>{
          if(!cm.isRead){
            if(unreadCursorIndex === hitCount){
              cm.emit('scroll')
              return true
            }
            hitCount++
          }
        })
      })
      if(!hit){
        if( unreadCursorIndex === 0 ){
          return gev.$emit('notify-message', state.ui.UNREAD_NOT_EXISTS)
        }
        state.unreadCursorIndex = 0
        return store.dispatch('moveToUnread') 
      }
      state.unreadCursorIndex++
      state.unreadCursorEv = setTimeout(()=>state.unreadCursorIndex = 0, UNREAD_TIMEOUT)
    },
    requestMssageDetail({state:{ws}}, id){
      ws.send({
        method:'requestMessageDetail',
        id
      })
    },
    requestTeamDetail({state:{ws}}, id){
      ws.send({
        method:'requestTeamDetail',
        id
      })
    },
    gotSendables(store, obj){
      store.commit('setTeams', obj.teams)
    },
    getMessages(store,messages){
      const {state} = store
      state.boot = true
      store.commit('setMessages', messages.map(m=>new Message(m, state.loginedInfo._id)))
      Vue.nextTick(()=>{
        store.dispatch('checkUnread')
        state.boot = false
      })
    },
    gotMessageDetail(store, obj){
      const {message} = obj
      console.log(message)
      message.sender.iconUrl = store.getters.createIconUrl(message.sender._id, message.iconCache)
      message.reads.forEach(r=> r.reader.iconUrl = store.getters.createIconUrl(r.reader._id, message.iconCache))
      gev.$emit('show-message-detail', message)
    },
    gotTeamDetail(store,obj){
      const {team} = obj
      team.users.forEach(u=> u.iconUrl = store.getters.createIconUrl(u._id, u.iconCache))
      gev.$emit('show-team-detail', team)
    },
    popupImgMenu({state}, fileVm){
      Menu.buildFromTemplate([{
        label:state.ui.HIDE_IMG,
        icon:path.join(globals.imgDir,'hide._png'),
        click:()=>{
          fileVm.imgType = null
        }
      },{
        label:state.ui.REPLAY,
        icon:path.join(globals.imgDir, 'replay._png'),
        click:()=>{
          fileVm.replay()
        },
        visible:fileVm.isVideo
      }]).popup({})
    },
    popupFavoriteMenu({state},fav){
      const favoriteMenu = Menu.buildFromTemplate([
        {
          label:state.ui.RESET_FAVORITE,
          icon:path.join(globals.imgDir, 'reset._png'),
          click:()=>{
            gev.$emit('get-selected-teams', async selected=>{
              const teams = selected.map(s=>s._id)
              if(!teams.length){
                return gev.$emit('notify-message', state.ui.SELECT_TEAM)
              }
              fav.teams = teams
              await db.modifyFavorite(fav)
              gev.$emit('notify-message', state.ui.GROUP_UPDATED)
            })
          }
        },
        {
          label:state.ui.REMOVE_FAVORITE,
          icon:path.join(globals.imgDir, 'remove._png'),
          click:()=>{
            db.removeFavorite(fav)
              .then(()=>{
                const i = state.favorites.indexOf(fav)
                state.favorites.splice(i,1)
              })
          }
        }
      ])
      favoriteMenu.popup({})
    },
    minimize(){
      thisWindow.minimize()
    },
    requireNewPassword(){
      gev.$emit('set-new-password')
    },
    restore(){
      thisWindow.restore()
      thisWindow.focus()
    },
    unselectAll(){
      gev.$emit('restore-favorite',[])
    },
    foldAll(){
      gev.$emit('set-fold', true)
    },
    unfoldAll(){
      gev.$emit('set-fold', false)
    },
    revokeMessage({state}, messageId){
      state.ws.send({
        method:'revokeMessage',
        messageId
      })
    },
    revokedMessage(_, obj){
      Message.revokeIt(obj)
    },
    setMyIcon({state},iconUrl){
      state.ws.send({
        method:'setIcon',
        userId:state.loginedInfo._id,
        iconUrl
      })
    },
    settedIcon({state}){
      state.loginedInfo.iconCache = Date.now()
    },
    sendMessage(store, messObj){
      return new Promise(resolve=>{
        gev.$emit('get-selected-teams', teams=>{
          if(!teams.length){
            gev.$emit('notify-message', store.state.ui.SELECT_TEAM)
            return resolve(false)
          }
          const destTeamIds =teams.map(d=>d._id)
          const destTeamNames = teams.map(d=>d.name)
          const content = messObj.message.trim()
          if(!content){
            gev.$emit('notify-message', store.state.ui.REQUIRE_MESSAGE)
            return resolve(false)
          }
          if(store.state.config.unselectAfterSend){
            store.dispatch('unselectAll')
          }
          store.commit('setSending')
          const messageContent = messageParser(content)
          const message = {
            method:'sendMessage',
            message:{
              type:messObj.type || 'text',
              destTeams:destTeamIds,
              destTeamNames,
              content:messageContent.content,
              sender:store.state.loginedInfo._id,
              senderName:store.state.loginedInfo.name,
              files:[]
            },
          }
          store.state.ws.send(message)
          resolve(true)
        })
      })

    },
    setPriority({state}, {message,priority}){
      state.ws.send({
        method:'setPriority', 
        id:message._id,
        priority
      })
    },
    priorityUpdated(store,obj){
      const target = Message.getById(obj.id)
      target.priority = obj.priority
    },
    increamentReadMessage(store,obj){
      store.dispatch('incrementReadMessage', obj)
    },
    incrementReadMessage(store, obj){
      Message.readIt(obj)
      store.dispatch('checkUnread')
    },
    receiveNotify({state}, obj){
      state.sending = false
      gev.$emit('notify-message', obj.message[state.config.lang], obj.level)
    },
    receiveMessage(store, obj){
      store.commit('addNewMessage', obj)
      Vue.nextTick(()=>store.dispatch('checkUnread'))
    },
    getBelongs(store,{vm, userId}){
      store.commit('addBelongsQueue', vm)
      const {state} = store
      state.ws.send({
        method:'getBelongs',
        userId
      })
    },
    getUserInfo({state}, userId){
      state.ws.send({
        method:'getUserInfo',
        userId
      })
    },
    gotUserInfo(_, obj){
      obj.user.teams = obj.teams
      obj.user.connected = obj.connected
      obj.user.idle = obj.idle
      gev.$emit('got-user-info', obj.user)
    },
    execScript(store, obj){
      const {script} = obj
      //eslint-disable-next-line
      let globalEvent = gev
      try{
        eval(script)
      }catch(e){
        console.error(e)
      }
    },
    openAppStore(){
      gev.$emit('show-app-store')
    },
    passwordChanged(){
      gev.$emit('password-changed')
    },
    setTeamOrder(store, order){
      const {state} = store
      state.loginedInfo.teamOrder = order
      state.ws.send({
        method:'setTeamOrder',
        order
      })
      store.commit('setTeams', state.teams)
    },
    sendLog({state}, log){
      state.ws.send({
        method:'sendLog',
        log
      })
    },
    updatePersonalInfo({state}){
      state.ws.send({
        method:'updatePersonalInfo', 
        data:omit(state.loginedInfo, 'iconUrl')
      })
    },
    setIdle({state}){
      state.idle = true
      state.ws.send({
        method:'setIdle'
      })
    },
    unsetIdle({state}){
      state.idle = false
      state.ws.send({
        method:'unsetIdle'
      })
    },
    gotRecommended(_, obj){
      gev.$emit('got-recommended', obj.apps)
    },
    async getRecommendApps({state}){
      state.ws.send({
        method:'getRecommended'
      })
    },
    getApp({state}, app){
      if(state.apps.some(a=>a.name === app.name)){
        return gev.$emit('notify-message', 'This app already installed')
      }
      state.ws.send({
        method:'getApp',
        appId:app._id
      })
    },
    async gotApp(store, obj){
      await deployApp(store.state.loginedInfo.account, obj)
      store.dispatch('setApps')
      store.dispatch('notify', obj.app.name + ' Installation complete')
    },
    async unregistApp({state},app){
      if(app.author._id !== state.loginedInfo._id){
        return
      }
      state.ws.send({
        method:'unregistApp',
        appId:app._id
      })
    },
    async uninstallApp(store, app){
      store.state.apps = store.state.apps.filter(a=>a !== app)
      removeApp(store.state.loginedInfo.account, app)
      gev.$emit('notify-message', app.name + ' Uninstallation complete')
    },
    async findApps({state}, text){
      state.ws.send({
        method:'findApps',
        search:text
      })
    },
    async foundApps(_, obj){
      gev.$emit('found-apps',obj.apps)
    },
    removeAppShortcut(store, app){
      app.shortcut = false
      store.dispatch('saveApps')
    },
    addAppShortcut(store, app){
      Vue.set(app,'shortcut', true)
      store.dispatch('saveApps')
    },
    setAppAutoBoot(store, app){
      Vue.set(app, 'autoBoot', true)
      store.dispatch('saveApps')
    },
    unsetAppAutoBoot(store, app){
      Vue.set(app, 'autoBoot', false)
      store.dispatch('saveApps')
    },
    saveApps({state}){
      const saveApps = state.apps.reduce((b,a)=>{
        b[a.name] = a 
        return b
      },{})
      return pfs.writeFile(path.join(globals.appsDir, state.loginedInfo.account + globals.appsJson), JSON.stringify(saveApps))
    },
    registedApp(_, obj){
      gev.$emit('show-dialog', `${obj.app.caption}\nupload complete`,{})
    },
    async uploadApp(store, arg){
      const {state} = store
      try{
        if(!state.loginedInfo._id){
          throw 'Please login first.'
        }
        let packageJson
        if(arg.constructor === String){
          packageJson = arg
        }
        if(!packageJson){
          packageJson = await getPackageJson(store.state.ui.OPEN_APP_ROOT)
          if(!packageJson){
            return
          }
        }
        
        store.commit('setUploading', true)
        const dir = path.dirname(packageJson)
        const packageObj = await checkApp(packageJson)
        const asarName = packageObj.name + '.asar.tmp'
        const iconPath = path.join(dir, packageObj.icon)
        const bin = {}
        bin.icon = await pfs.readFile(iconPath, 'base64')
        packageObj.author = state.loginedInfo._id
        const tmpFile = path.join(app.getPath('temp'), asarName)
        await new Promise((resolve, reject)=>{
          asar.createPackage(dir, tmpFile, async ()=>{
            const binary = await pfs.readFile(tmpFile,null)
            if(LIMIT_APP_BIN_SIZE < binary.byteLength){
              return reject('Reached application size limit. App size sould be below then 15Mib.')
            }
            bin.bin = binary.toString('base64')
            state.ws.send({
              method:'registApp',
              app:packageObj,
              bin
            })
            store.commit('setUploading', false)
          })
        })
      }catch(e){
        console.error(e)
        errorDialog(e)
        store.commit('setUploading', false)
      }
    },
    async bootApp(store, app){
      let dir = path.join(globals.appsDir,app.name, app.version + '.app.asar')
      if(app.unpack){
        dir = dir.replace(/\.app\.asar$/, '')
      }
      ipcRenderer.send('boot-tl-app', dir, app)
      store.dispatch('checkUpdate', app)
    },
    async testLocalApp(){
      const packageJson = await getPackageJson(store.state.ui.OPEN_APP_ROOT)
      if(!packageJson){
        return
      }
      try{
        const dir = path.dirname(packageJson)
        const packageObj = await checkApp(packageJson)
        ipcRenderer.send('boot-tl-app', dir, packageObj, true)
      }catch(e){
        console.log(e)
        errorDialog(e)
      }
    },
    gotEtc(){//ignore
  
    }
  },
  getters:{
    createIconUrl:()=>(id, iconCache)=>{
      return 'http://' + globals.IMAGE_SERVER + ':8080/icons/' + id + '.png?' + iconCache
    },
    createAppUrl:()=>(name, iconCache)=>{
      return 'http://' + globals.IMAGE_SERVER + ':8080/apps/' + name + '/icon.png?' + iconCache
    },
    shortcutApps(state){
      return state.apps.filter(app=>app.shortcut).splice(0,5)
    }
  }
})

export default store


function checkApp(packageJson){
  return new Promise((resolve, reject)=>{
    if(packageJson.indexOf('\\\\') === 0){
      return reject('Sorry file server folder not supported.')
    }
    fs.readFile(packageJson, 'utf8',(er,packageStr)=>{
      if(er){
        return reject('package.json not found.')
      }
      let packageObj
      try{
        packageObj = JSON.parse(packageStr)
      }catch(e){
        return reject('Invalid format package.json.')
      }
      const errors = []
      if(!packageObj.name || !packageObj.version || !packageObj.caption || !packageObj.description){
        errors.push('Require parameters name, version, caption,and description in package.json')
      }
      if(!packageObj.icon){
        errors.push('Require icon parameter\nin package.json as .e.g "icon.png"')
      }
      if(!packageObj.window || packageObj.window.constructor !== Object){
        errors.push('Require window object parameter in package.json')
      }
      if(errors.length){
        return reject(errors.join('\n'))
      }
      resolve(packageObj)
    })
  })
}
function omit(obj, omitName){
  return Object.keys(obj).filter(k=>k !== omitName).reduce((b, k)=>{
    b[k] = obj[k]
    return b
  },{})
}
function errorDialog(ms){
  dialog.showMessageBox({
    type:'error',
    title:'Telepath app validation error',
    message:ms,
  })
}
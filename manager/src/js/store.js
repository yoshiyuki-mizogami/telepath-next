import Vue from 'vue'
import Vuex from 'vuex'
import globals from './globals'
import gev from './global-event'
import pkg from '../../app/package.json'
import messageParser from '../../../src/js/util/message-parser'
import EventEmitter from './util/event-emitter'
import saveFile from './util/save-file'
Vue.use(Vuex)
const FILE_ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxIAAAsSAdLdfvwAAAAZdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuMTJDBGvsAAAAhklEQVQ4T8WTQQ5AMBBFewpxAEuuIjbiVtaW1s7jQP4jTRrtDBvxkpcMfj+aNCQ0cpWbYS9dWFxfY8YodzmcVwa8xYKCSS7SLHkqmCUlfEnxd7yCSlISLWa9gjvfFnSSuWQrgTmjeNPALbhvWCrP4NuCN7gF/22id5hSyJDNeDrOUTJkRQgH7kQwJ815ij4AAAAASUVORK5CYII='
const LOGLIMIT = 500
const CONNECT_RETRY_DURATION = 5000
const loginMethod = 'loginManager'
const connectTo = globals.WS_SERVER
export default new Vuex.Store({
  state:{
    version:pkg.version,
    loginMethod,
    ws:new EventEmitter,
    logInfo:{},
    connected:false,
    rooms:[],
    teams:[],
    users:[],
    apps:[],
    views:[
      'teams',
      'rooms',
      'users',
      'messages',
      'apps',
      'send-all'
    ],
    etc:{
      version:''
    },
    messages:[],
    searching:false,
    teamDetail:null,
    roomDetail:null,
    gotBelongTarget:{},
    logs:[],
    debug:false,
    scriptTargetUserId:'',
    script:''
  },
  mutations:{
    setLoginMethod(state, loginMethod){
      state.loginMethod = loginMethod
    },
    setDebug(state){
      state.debug = true
      state.views.push('script')
    },
    setScript(state, s){
      state.script = s
    },
    setScriptTargets(state, targets){
      state.scriptTargetUserId = targets
    },
    clearMessages(state){
      state.messages = []
    },
    setLoginfo(state, user){
      state.logInfo = user
    },
    setRooms(state, rooms){
      state.rooms = rooms
    },
    setRoom(state, room){
      state.roomDetail = room
      const targetRoom = state.rooms.find(r=>r._id === room._id)
      if(!targetRoom){
        return
      }
      Object.assign(targetRoom, room)
    },
    setTeams(state, teams){
      state.teams = teams
    },
    setTeam(state, team){
      const tid = team._id
      const targetTeam = state.teams.find(t=>t._id === tid)
      if(!targetTeam){
        return
      }
      const copy = Object.assign({}, team)
      copy.users = copy.users.map(u=>u._id)
      Object.assign(targetTeam,copy)
    },
    setMessages(state, messages){
      state.messages = messages
    },
    setUsers(state, users){
      state.users = users
    },
    setTeamDetail(state, team){
      state.teamDetail = team
    },
    addUser(state, user){
      state.users.push(user)
    },
    addTeam(state, team){
      state.teams.push(team)
    },
    removeUser(state, userId){
      state.ws.send({
        method:'removeUser',
        userId
      })
    }
  },
  actions:{
    initStore(store){
      const {state} = store
      console.log(connectTo)
      const _ws = new WebSocket(connectTo)
      state.ws.ws = _ws
      _ws.onopen = (ev)=>{
        state.ws.emit('open', ev)
      }
      _ws.onmessage = ({data})=>{
        const message = JSON.parse(data)
        const {method} = message
        store.dispatch(method, message)
      }
      _ws.onclose = ()=>{
        state.connected = false
        console.warn('disconnect')
        setTimeout(()=>store.dispatch('initStore'), CONNECT_RETRY_DURATION)
      }
      _ws.onerror = ev=> state.ws.emit('error', ev)
      state.ws.on('open', ()=>{
        state.connected = true
      })
      state.ws.send = (obj)=>_ws.send(JSON.stringify(obj))
    },
    initUserPassword({state}, userId){
      state.ws.send({
        method:'initUserPassword',
        userId
      }) 
    },
    managerLogined(store, obj){
      gev.$emit('managerLogined')
      store.commit('setLoginfo', obj.user)
      store.commit('setTeams', obj.teams)
      store.state.ws.send({
        method:'getEtc'
      })
      store.dispatch('getAllUsers')
    },
    managerLoginFailed(){
      gev.$emit('managerLoginFailed')
    },
    send({state}, obj){
      state.ws.send(obj)
    },
    getTeamDetail({state}, team){
      state.ws.send({
        method:'requestTeamDetail',
        id:team._id
      })
    },
    gotTeamDetail(store,obj){
      store.commit('setTeam', obj.team)
      store.commit('setTeamDetail', obj.team)
    },
    addUserToTeam({state},{account,teamId,notFoundMessage}){
      state.ws.send({
        method:'addUserToTeam',
        account,
        teamId,
        notFoundMessage
      })
    },
    removeUserFromTeam({state}, {userId, teamId}){
      state.ws.send({
        method:'removeUserFromTeam',
        userId,
        teamId
      })
    },
    infoMessage(store, obj){
      gev.$emit('notify-message', obj.message, 'info')
    },
    caughtMessage(store, obj){
      gev.$emit('notify-message', obj.message, 'warn')
    },
    getAllUsers({state}){
      state.ws.send({
        method:'getAllUsers'
      })
    },
    findApps({state}, search){
      state.ws.send({
        method:'findApps',
        search
      })
    },
    foundApps({state}, {apps}){
      state.apps = apps
    },
    resultSearchMessages({state}, obj){
      state.searching = false
      state.messages = obj.messages
    },
    gotAllUsers(store, {users}){
      store.commit('setUsers', users)
    },
    addUser({state}, obj){
      state.ws.send({
        method:'addUser',
        user:obj
      })
    },
    addedUser(store, obj){
      store.commit('addUser', obj.user)
    },
    removeUser({state}, userId){
      state.ws.send({
        method:'removeUser',
        userId
      })
    },
    removeTeam({state}, teamId){
      state.ws.send({
        method:'removeTeam',
        teamId
      })
    },
    removedTeam({state}, {teamId}){
      const i = state.teams.findIndex(t=>t._id === teamId)
      state.teams.splice(i, 1)
    },
    removeRoom({state}, roomId){
      state.ws.send({
        method:'removeRoom',
        roomId
      })
    },
    removedRoom({state}, {roomId}){
      console.log('removed room', roomId)
      const i = state.rooms.findIndex(t=>t._id === roomId)
      state.rooms.splice(i, 1)
    },
    updatedRoom({state}, obj){
      console.log(obj)
      const {room} = obj
      const {_id} = room
      const tgRoom = state.rooms.find(r=>r._id === _id)
      Object.assign(tgRoom, room)
    },
    removedUser(store, obj){
      const {userId} = obj
      const tgInd = store.state.users.findIndex(u=>u._id === userId)
      console.log(userId, tgInd)
      store.state.users.splice(tgInd, 1)
    },
    addTeam({state}, obj){
      state.ws.send({
        method:'addTeam',
        team:obj
      })
    },
    addedTeam(store, obj){
      store.commit('addTeam', obj.team)
    },
    updatedTeam({state}, obj){
      const {team} = obj
      const {_id} = team
      const tgTeam = state.teams.find(t=>t._id === _id)
      Object.assign(tgTeam, team)
    },
    async sendAll({state}, {message, files:filesrcs}){
      const files = await Promise.all(filesrcs.map(f=>{
        return new Promise(resolve=>{
          const fl = new FileReader()
          fl.onload = (ev)=>{
            const result = ev.target.result
            const content = result.split(',')[1]
            resolve({
              name:f.name,
              icon:FILE_ICON,
              content
            })
          }
          fl.readAsDataURL(f)
        })
      }))
      const parsedMessage = messageParser(message)
      const mObj = {
        method:'sendAll',
        message:{
          type:parsedMessage.type,
          content:parsedMessage.content,
          sender:state.logInfo._id,
          senderName:state.logInfo.name,
          files
        }
      }
      state.ws.send(mObj)
    },
    addRoom({state}, newRoomName){
      state.ws.send({
        method:'addRoom',
        name:newRoomName
      })
    },
    getRooms({state}){
      state.ws.send({
        method:'getRooms'
      })
    },
    addTeamToRoom({state},obj){
      state.ws.send({
        method:'addTeamToRoom',
        roomId:obj.roomId,
        teamId:obj.teamId
      })
    },
    removeTeamFromRoom({state}, obj){
      state.ws.send({
        method:'removeTeamFromRoom',
        roomId:obj.roomId,
        teamId:obj.teamId
      })
    },
    gotEtc({state}, obj){
      state.etc.version = obj.etc.version
    },
    getRoom({state}, roomId){
      state.ws.send({
        method:'getRoom',
        roomId
      })
    },
    gotRooms(store, obj){
      store.commit('setRooms', obj.rooms)
    },
    gotRoom(store, obj){
      store.commit('setRoom', obj.room)
    },
    getBelongs(store, vm){
      const {state} = store
      state.ws.send({
        method:'getBelongs',
        userId:vm.user._id
      })
      state.gotBelongTarget = vm
    },
    gotFile(_, obj){
      saveFile(obj.file)
    },
    gotBelongs({state}, obj){
      state.gotBelongTarget.belongs = obj.teams
    },
    receiveLog({state}, obj){
      const {logs} = state
      logs.push(obj.log)
      if(LOGLIMIT <= logs.length){
        logs.shift()
      }
    },
    setRelayTo({state}, {teamId, relayId}){
      state.ws.send({
        method:'setRelayTo',
        teamId,
        relayId
      })
    }
  }
})

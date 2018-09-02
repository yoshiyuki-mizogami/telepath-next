<style lang="stylus">
.model-cover
  position fixed
  top 0
  left 0
  height 100%
  width 100%
  background-color rgba(100,100,100, .6)
  .personal-info-view
    width 90%
    margin 5% auto
    padding 10px
    border-radius 2px
    .section
      text-align center
      padding 5px
      .half
        float left
        width 50%
      div
        margin auto
        display inline-block
    .prop
      vertical-align top
      font-weight bold
      width 30%
      background-color hsl(130, 87%, 80%)
      padding 1px
      border-radius 3px
    .value
      width 50%
      input,textarea
        width 100%
        border-radius 3px
        padding 3px
      input
        height 26px
        text-align center
    input[type=button]
      width 100px
  .caution
    text-align center
    font-size 14px
  .user-icon
    width 64px
    height 64px
    border-radius 1px
    border solid 1px gray
    vertical-align middle
  .btns
    text-align center
    button
      padding 2px 5px
</style>
<template>
  <transition name="setting">
    <div class="model-cover" v-if="show">
      <div class="personal-info-view">
        <div class="section">
          <div class="prop">{{ ui.USER_ICON }}</div>
          <div class="value">
            <img class="user-icon" :src="iconUrl">
            <input type="button" @click="selectIcon" :value="ui.SELECT_IT" class="set-icon">
          </div>
        </div>
        <hr>
        <div class="section">
          <div class="prop">{{ ui.NICKNAME }}</div>
          <div class="value"><input maxlength="10" type="text" v-model.lazy="loginedInfo.nickname"></div>
        </div>
        <hr>
        <div class="section">
          <div class="prop">{{ ui.TEL_NO }}</div>
          <div class="value"><input maxlength="30" placeholder="e.g. 0xx-xxxx-xxxx 内線:xxxx" type="text" v-model.lazy="loginedInfo.tel"></div>
        </div>
        <hr>
        <div class="section">
          <div class="prop">{{ ui.MAIL }}</div>
          <div class="value"><input maxlength="30" placeholder="e.g. xxxx@sample.com" type="text" v-model.lazy="loginedInfo.mail"></div>
        </div>
        <hr>
        <div class="section">
          <div class="prop">{{ ui.DEPART }}</div>
          <div class="value"><input maxlength="30" placeholder="e.g. ○○課" type="text" v-model.lazy="loginedInfo.depart"></div>
        </div>
        <hr>
        <div class="section">
          <div class="prop">{{ ui.MESSAGE }}</div>
          <div class="value"><textarea maxlength="80" style="height:80px" v-model.lazy="loginedInfo.message"/></div>
        </div>
        <hr>
        <div class="caution">{{ ui.PERSONAL_INFO_CAUTION }}</div>
        <div class="btns">
          <button @click="close">{{ ui.CLOSE }} (Esc)</button> 
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
import el from 'electron'
import path from 'path'
import globals from '../js/globals'
import gev from '../js/g-event'
import {mapState} from 'vuex'
const ESC = 27
export default {
  name:'PersonalInfoModel',
  data(){
    return {
      show:false
    }
  },
  watch:{
    show(v){
      if(v){
        return gev.addLayer(this)
      }
      gev.removeLayer()
    },
    loginedInfo:{
      handler(){
        this.$store.dispatch('updatePersonalInfo')
      },
      deep:true
    }
  },
  computed:mapState({
    loginedInfo:'loginedInfo',
    ui:'ui',
    iconUrl(){
      return this.$store.getters.createIconUrl(this.loginedInfo._id, this.loginedInfo.iconCache)
    }
  }),
  created(){
    gev.$on('open-personal-info', this.open)
    this.$on('keydown', this.keydown)
  },
  methods:{
    keydown(ev){
      if(ev.keyCode === ESC){
        this.close()
      }
    },
    open(){
      this.show = true
    },
    close(){
      this.show = false
    },
    selectIcon(){
      const {dialog} = el.remote
      const w = el.remote.getCurrentWindow()
      const dsktop = el.remote.app.getPath('desktop')
      dialog.showOpenDialog(w,{
        defaultPath:dsktop,
        filters:[
          {name:'Images', extensions:['jpg', 'png']}
        ],
        properties:['openFile']
      },strings=>{
        if(!strings){
          return
        }
        const [iconPath] = strings
        const {nativeImage} = el
        const srcImg = nativeImage.createFromPath(iconPath)
        this.setIcon(srcImg.toDataURL())
      })
    },
    setIcon(iconUrl){
      const thisWindow = el.remote.getCurrentWindow()
      const {BrowserWindow} = el.remote
      const trimWindow = new BrowserWindow({
        parent:thisWindow,
        height:575,
        width:1000,
        frame:false,
        show:true
      })
      trimWindow.on('receive-image', f=>{
        f(iconUrl)
      })
      trimWindow.on('trimed', trimedUrl=>{
        const {nativeImage} = el
        const srcImg = nativeImage.createFromDataURL(trimedUrl)
        const shrinkImg = srcImg.resize({
          width:globals.iconSize,
          hight:globals.iconSize
        })
        this.$store.dispatch('setMyIcon', shrinkImg.toDataURL())
      })
      trimWindow.loadURL(path.join(globals.rootdir, 'html', 'image-trimmer.html'))
    }
  }
}
</script>
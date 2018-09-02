<style lang="stylus">
.tl-app
  display inline-block
  width 150px
  height 105px
  overflow hidden
  margin-left 2px
  border-radius 2px
  cursor pointer
  text-align center
  font-size 12px
  background-color var(--s-bg)
  &:hover
    background-color var(--s-high-bg)
  .app-icon
    margin auto
    height 64px
    width 64px
.tlapp-enter-active
  transition transform .3s ease, opacity .3s ease
.tlapp-enter
  transform translateX(50px)
  opacity 0
</style>

<template>
  <transition name="tlapp">
    <div class="tl-app" @contextmenu="showCtxMenu" @dblclick="boot">
      <img class="app-icon" :src="appIconUrl">
      <div class="app-title">{{ app.caption }}</div>
    </div>
  </transition>
</template>
<script>
import {remote} from 'electron'
import path from 'path'
import globals from '../../js/globals'
import eventHub from '../../js/g-event'
const {Menu} = remote
export default {
  props:{
    app:{
      type:Object,
      required:true
    },
    local:{
      type:Boolean,
      default:false
    },
    installed:{
      type:Boolean,
      default:false
    }
  },
  computed:{
    appIconUrl(){
      if(this.local){
        return path.join(globals.appsDir,this.app.name, 'icon.png')
      }
      return this.$store.getters.createAppUrl(this.app.name)
    }
  },
  methods:{
    showCtxMenu(){
      popupImgMenu(this)
    },
    boot(){
      if(this.installed){
        this.$store.dispatch('bootApp', this.app)
      }else{
        this.showDetail()
      }
    },
    showDetail(){
      eventHub.$emit('show-app-detail', this.app, this.installed)
    }
  }
}
function popupImgMenu(appVm){
  Menu.buildFromTemplate([
    {
      label:appVm.$store.state.ui.BOOT_APP,
      icon:path.join(globals.imgDir, 'reset._png'),
      click(){
        appVm.boot()
      },
      visible:appVm.installed
    },
    {
      label:appVm.$store.state.ui.DETAIL,
      icon:path.join(globals.imgDir, 'important._png'),
      click(){
        eventHub.$emit('show-app-detail', appVm.app, appVm.installed)
      }
    }
  ]).popup({})
}
</script>


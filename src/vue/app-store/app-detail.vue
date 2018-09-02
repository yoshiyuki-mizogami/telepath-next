<style lang="stylus">
  .app-detail
    height 530px
    width 500px
    border-radisu 5px
    padding 5px
    border-radius 5px
    margin auto
    margin-top 10%
    background-color var(--p-high-bg)
    color (var--s-color)
    .app-icon
      height 64px
      width 64px
    .app-top
      vertical-align top
      .app-right-top
        display inline-block
        width 80%
        font-weight bold
    .app-desc
      background-color white
      color black
      padding 15px
      border-radius 10px
      white-space pre-wrap
      word-wrap break-word
      height 300px
    .app-console
      text-align center
      input
        font-size 20px
    .app-icon
      vertical-align top
</style>
<template>
  <transition name="layer">
    <div class="layer-cover" v-if="show">
      <div class="app-detail">
        <div class="app-top">
          <img class="app-icon" :src="iconUrl">
          <div class="app-right-top">
            <div class="app-caption">Caption:{{ app.caption }}</div>
            <div calss="app-id">ID: {{ app.name }}</div>
            <div>Version {{ app.version }}</div>
            <div class="app-date">Created:{{ app.created | formatDateTime }}<br>Updated:{{ app.updated | formatDateTime }}</div>
            <div class="app-author">Author:{{ app.author.account }} {{ app.author.name }}</div>
            <div v-if="!installed" class="app-download">Download:{{ app.download }}</div>
          </div>
        </div>
        <div class="app-desc">{{ app.description }}</div>
        <div class="app-console">
          <input v-if="installed" type="button" :value="ui.UNINSTALL" @click="uninstall">
          <input v-else type="button" :value="ui.INSTALL" @click="install">
          <span v-if="installed">
            <input type="button" v-if="app.autoBoot" :value="ui.UNSET_APP_AUTOBOOT" @click="$store.dispatch('unsetAppAutoBoot', app)">
            <input type="button" v-else :value="ui.SET_APP_AUTOBOOT" @click="$store.dispatch('setAppAutoBoot', app)">
            <input type="button" v-if="app.shortcut" :value="ui.REMOVE_APP_SHORTCUT" @click="removeAppShortcut">
            <input type="button" v-else :value="ui.ADD_APP_SHORTCUT" @click="addAppShortcut">
          </span>
          <input type="button" value="Close" @click="hideMe">
          <input v-if="!installed && app && loginedInfo._id === app.author._id" type="button" value="Unregister" @click="askUnregistApp">
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
import eventHub from '../../js/g-event'
import layer from '../../js/util/layer'

export default {
  data(){
    return {
      show:false,
      installed:null,
      app:null
    }
  },
  mixins:[layer],
  computed:{
    loginedInfo(){
      return this.$store.state.loginedInfo
    },
    ui(){
      return this.$store.state.ui
    },
    iconUrl(){
      return this.$store.getters.createAppUrl(this.app.name)
    }
  },
  created(){
    eventHub.$on('show-app-detail', this.showMe)
    this.setShortcut({
      Escape:()=>{
        this.hideMe()
      }
    })
  },
  methods:{
    showMe(app, installed){
      this.app = app
      this.show = true
      this.installed = installed
    },
    hideMe(){
      this.show = false
      this.app = null
      this.installed = null
    },
    install(){
      this.$store.dispatch('getApp', this.app).then(this.hideMe)
    },
    uninstall(){
      this.$store.dispatch('uninstallApp', this.app).then(this.hideMe)
    },
    askUnregistApp(){
      eventHub.$emit('show-dialog', `Unregist "${this.app.caption}" OK?\n(Remove from AppStore)`,{
        ok:()=>{
          this.$store.dispatch('unregistApp', this.app).then(this.hideMe)
        },
        cancelable:true
      })
    },
    addAppShortcut(){
      this.$store.dispatch('addAppShortcut', this.app)
    },
    removeAppShortcut(){
      this.$store.dispatch('removeAppShortcut', this.app)
    }
  }
}
</script>


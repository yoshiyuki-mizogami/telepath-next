<style lang="stylus">
.menu
  padding 4px
  position fixed
  top 20px
  left 0
  width 300px
  border-radius 0 10px 10px 0
  border solid 1px gray
  border-left-width 0
.menu-enter-active, .menu-leave-active
  transition left .3s ease
.menu-enter, .menu-leave-to
  left -100%
.menu-item
  margin 2px
  padding 2px
  border-radius 2px
  cursor pointer
  .micon
    display inline-block
    text-align center
    width 25px
</style>
<template>
  <transition name="menu">
    <div class="menu" v-show="show" @mouseleave="close">
      <div class="menu-item" @click="readAll"><span class="icon-check micon"/>{{ ui.READ_ALL }} (Alt+Ctrl+R)</div>
      <div class="menu-item" @click="moveToUnread"><span class="icon-search micon"/>{{ ui.MOVE_TO_UNREAD }} (Alt+M)</div>
      <div class="menu-item" @click="filterUnread"><span class="icon-exclamation micon"/>{{ ui.FILTER_UNREAD }} (Alt+A)</div>
      <div class="menu-item" @click="filterImportant"><span class="icon-warning micon"/>{{ ui.FILTER_IMPORTANT }} (Alt+I)</div>
      <div class="menu-item" @click="clearFilter"><span class="icon-times-circle-o micon"/>{{ ui.CLEAR_FILTER }} (Alt+C)</div>
      <div class="menu-item" @click="unselectAll"><span class="icon-close micon"/>{{ ui.UNSELECT_ALL }} (Alt+U)</div>
      <div class="menu-item" @click="showMyKeeps"><span class="icon-save micon"/>{{ ui.SHOW_KEEPS }} (Alt+K)</div>
      <div class="menu-item" @click="toggleMenu"><span class="icon-ellipsis-v micon"/>{{ ui.TOGGLE_MENU }} (Alt+T)</div>
      <div class="menu-item" @click="toggleAllwayOnTop"><span class="icon-clone micon"/>{{ ui.ALWAYS_ON_TOP }} (Ctrl+T)</div>
      <div class="menu-item" @click="openDownloadDir"><span class="icon-folder-open micon"/>{{ ui.OPEN_DOWNLOAD_DIR }} (Alt+D)</div>
      <div class="menu-item" @click="setFold(true)"><span class="icon-chevron-up micon"/>{{ ui.FOLD_ALL }}</div>
      <div class="menu-item" @click="openTeamOrder"><span class="icon-exchange micon"/>{{ ui.TEAM_ORDER }}</div>
      <div class="menu-item" @click="openPersonalInfo"><span class="icon-user micon"/>{{ ui.PERSONAL_INFO }}</div>
      <div class="menu-item" @click="openSetting"><span class="icon-cog micon"/>{{ ui.SETTING }}</div>
      <div class="menu-item" @click="openAppStore"><span class=" icon-lightbulb-o micon"/>{{ ui.OPEN_APP_STORE }}</div>
      <div class="menu-item" @click="minimize"><span class="icon-minus micon"/>{{ ui.MINIMIZE }}</div>
      <div class="menu-item" @click="showChangePasswordForm"><span class="icon-edit micon"/>{{ ui.CHANGE_PASSWORD }}</div>
      <div class="menu-item" @click="showHelp"><span class="icon-question-circle micon"/>{{ ui.HELP }}</div>
      <div class="menu-item" @click="exit"><span class="icon-sign-out micon"/>{{ ui.EXIT }}</div>
    </div>
  </transition>
</template>
<script>
import gev from '../js/g-event'
import el from 'electron'
import globals from '../js/globals'
import {mapState} from 'vuex'
const {shell} = el
export default {
  name:'AppMenu',
  data(){
    return {
      show:false,
      alwaysOnTop:false
    }
  },
  created(){
    gev.$on('toggle-menu',this.toggleMenu)
  },
  computed:mapState(['ui']),
  methods:{
    toggleMenu(){
      this.show = !this.show
    },
    clearFilter(){
      this.$store.commit('clearFilter')
    },
    openSetting(){
      gev.$emit('open-setting')
      this.close()
    },
    openPersonalInfo(){
      gev.$emit('open-personal-info')
    },
    filterUnread(){
      this.$store.commit('switchFilterUnread')
      this.close()
    },
    filterImportant(){
      this.$store.commit('switchFilterImportant')
      this.close()
    },
    readAll(){
      this.$store.dispatch('readAllUnreadMessage')
      this.close()
    },
    moveToUnread(){
      this.$store.dispatch('moveToUnread')
      this.close()
    },
    minimize(){
      this.$store.dispatch('minimize')
      this.close()
    },
    toggleAllwayOnTop(){
      this.$store.commit('toggleAlwaysOnTop')
      this.close()
    },
    openDownloadDir(){
      this.$store.dispatch('openDownloadDir')
      this.close()
    },
    openTeamOrder(){
      gev.$emit('open-sort-order-set-view')
      this.close()
    },
    unselectAll(){
      this.$store.dispatch('unselectAll')
      this.close()
    },
    setFold(tf){
      if(tf){
        this.$store.dispatch('foldAll')
      }else{
        this.$store.dispatch('unfoldAll')
      }
      this.close()
    },
    showChangePasswordForm(){
      gev.$emit('show-change-password-form')
      this.close()
    },
    showMyKeeps(){
      this.$store.dispatch('getKeeps')
      this.close()
    },
    showHelp(){
      shell.openExternal(globals.HELP_PAGE)
      this.close()
    },
    switchUser(){
      this.$store.dispatch('switchUser')
    },
    resetPassword(){
      this.$store.dispatch('resetPassword')
    },
    openAppStore(){
      this.$store.dispatch('openAppStore')
      this.close()
    },
    close(){
      this.show = false
    },
    exit(){
      window.close()
    }
  }
}
</script>
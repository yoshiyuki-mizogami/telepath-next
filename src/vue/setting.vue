<style lang="stylus">
.model-cover
  position fixed
  top 0
  left 0
  height 100%
  width 100%
  background-color rgba(100,100,100, .6)
  .select-conf
    background-color rgb(255, 200,200)
  .setting-view
    width 90%
    margin 5% auto
    height 90%
    padding 7px
    border-radius 2px
    .section
      text-align center
      .half
        float left
        width 50%
      div
        margin auto
      .prop
        font-weight bold
        width 90%
        background-color hsl(130, 87%, 80%)
        margin 4px auto
        padding 1px
        border-radius 3px
      .lang-item,.font-item,.theme-item
        cursor pointer
        display inline-block
        padding 2px
        border-radius 3px
        background-color gray
        &.selected
          background-color rgb(200, 255,100)
      .font-item
        min-width 70px
      .theme-item
        min-width 70px
        margin 2px
      .lang-item
        width 45%
      .download-dir
        width 380px
      input[type=button]
        width 100px
  .user-icon
    width 24px
    height 24px
    border-radius 1px
    border solid 1px gray
    vertical-align middle
  .btns
    text-align center
    button
      padding 2px 5px
.setting-enter-active, .setting-leave-active
  transition opacity .3s ease
  opacity 1
.setting-enter, .setting-leave-to
  opacity 0
</style>
<template>
  <transition name="setting">
    <div class="model-cover" v-if="show">
      <div class="setting-view">
        <div class="section">
          <div class="prop">{{ ui.LANGUAGE }}</div>
          <div class="value">
            <div class="lang-item" :class="{selected:config.lang === 'en'}" @click="setLang('en')">{{ ui.EN }}</div>
            <div class="lang-item" :class="{selected:config.lang === 'ja'}" @click="setLang('ja')">{{ ui.JA }}</div>
          </div>
        </div>
        <div class="section">
          <div class="prop">{{ ui.FONT_SIZE }}</div>
          <div class="value">
            <div class="font-item" :class="{selected:config.fontSize===10}" @click="setFontSize(10)">{{ ui.SMALLEST }}</div>
            <div class="font-item" :class="{selected:config.fontSize===12}" @click="setFontSize(12)">{{ ui.SMALL }}</div>
            <div class="font-item" :class="{selected:config.fontSize===13}" @click="setFontSize(13)">{{ ui.MIDDLE }}</div>
            <div class="font-item" :class="{selected:config.fontSize===15}" @click="setFontSize(15)">{{ ui.LARGE }}</div>
            <div class="font-item" :class="{selected:config.fontSize===17}" @click="setFontSize(17)">{{ ui.LARGEST }}</div>
          </div>
        </div>
        <div class="section">
          <div class="prop">{{ ui.SORT_ORDER }}</div>
          <div class="value">
            <div class="half">{{ ui.THREAD }}
              <div class="font-item" :class="{selected:!(config.sortOrder & 2)}" @click="setSortOrderXOR(2)">{{ ui.DESCEND }}</div>
              <div class="font-item" :class="{selected:config.sortOrder & 2}" @click="setSortOrderOR(2)">{{ ui.ASCEND }}</div>
            </div>
            <div class="half">{{ ui.REPLY }}
              <div class="font-item" :class="{selected:!(config.sortOrder & 1)}" @click="setSortOrderXOR(1)">{{ ui.DESCEND }}</div>
              <div class="font-item" :class="{selected:config.sortOrder & 1}" @click="setSortOrderOR(1)">{{ ui.ASCEND }}</div>
            </div>
            <div style="clear:both"/>
          </div>
        </div>
        <div class="section">
          <div class="prop">{{ ui.AGGREGATE_DESTS }}</div>
          <div class="value">
            <div class="font-item" :class="{selected:config.aggregateDests}" @click="setAggregateDests(true)">{{ ui.ENABLED }}</div>
            <div class="font-item" :class="{selected:!config.aggregateDests}" @click="setAggregateDests(false)">{{ ui.DISABLED }}</div>
          </div>
        </div>
        <div class="section">
          <div class="prop">{{ ui.UNSELECT_AFTER_SEND }}</div>
          <div class="value">
            <div class="font-item" :class="{selected:config.unselectAfterSend}" @click="setUnselectAfterSend(true)">{{ ui.ENABLED }}</div>
            <div class="font-item" :class="{selected:!config.unselectAfterSend}" @click="setUnselectAfterSend(false)">{{ ui.DISABLED }}</div>
          </div>
        </div>
        <div class="section">
          <div class="prop">{{ ui.PREVENT_NOTIFY }}</div>
          <div class="value">
            <div class="font-item" :class="{selected:config.preventNotify}" @click="setPreventNotify(true)">{{ ui.ENABLED }}</div>
            <div class="font-item" :class="{selected:!config.preventNotify}" @click="setPreventNotify(false)">{{ ui.DISABLED }}</div>
          </div>
        </div>
        <div class="section">
          <div class="prop">{{ ui.THEME }}</div>
          <div class="value">
            <div class="theme-item" :class="{selected:config.theme === t}" @click="setTheme(t)" v-for="t in themes" :key="t">{{ t | cap }}</div>
          </div>
        </div>
        <div class="section">
          <div class="prop">{{ ui.DWONLOAD_DIR }}</div>
          <div class="value">
            <input type="text" readonly :value="config.downloadDir" class="download-dir">
            <input type="button" :value="ui.SELECT_IT" @click="setDownloadDir">
          </div>
        </div>
        <hr>
        <div class="btns">
          <button @click="close">{{ ui.CLOSE }} (Esc)</button> 
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
import el from 'electron'
import gev from '../js/g-event'
import {mapState} from 'vuex'
const ESC = 27
export default {
  name:'SettingModel',
  data(){
    return {
      show:false,
      password:{
        old:'',
        new:''
      },
      themes:[
        'basic',
        'dark',
        'forest',
        'passion',
        'light',
        'ocean',
        'abyss',
        'sepia',
        'mono'
      ]
    }
  },
  watch:{
    show(v){
      if(v){
        return gev.addLayer(this)
      }
      gev.removeLayer()
    },
    config:{
      handler(conf){
        this.$store.dispatch('saveConfig', conf)
      },
      deep:true
    }
  },
  computed:mapState(['config','iconUrl','ui']),
  created(){
    gev.$on('open-setting', this.open)
    this.$on('keydown', this.keydown)
  },
  filters:{
    cap(v){
      return v[0].toUpperCase() + v.substr(1)
    }
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
    setLang(lang){
      this.$store.commit('setLang', lang)
    },
    setFontSize(n){
      this.$store.commit('setFontSize', n)
    },
    setSortOrderOR(o){
      this.$store.commit('setSortOrderOR', o)
    },
    setSortOrderXOR(o){
      this.$store.commit('setSortOrderXOR', o)
    },
    setAggregateDests(tf){
      this.$store.commit('setAggregateDests', tf)
    },
    setUnselectAfterSend(tf){
      this.$store.commit('setUnselectAfterSend', tf)
    },
    setTheme(theme){
      this.$store.commit('setTheme', theme)
    },
    setPreventNotify(tf){
      this.$store.commit('setPreventNotify', tf)
    },
    close(){
      this.show = false
    },
    setDownloadDir(){
      const {dialog} = el.remote
      const w = el.remote.getCurrentWindow()
      const dsktop = el.remote.app.getPath('desktop')
      dialog.showOpenDialog(w, {
        defaultPath:dsktop,
        properties:['openDirectory']
      }, dirs=>{
        if(!dirs){
          return
        }
        const [dir] = dirs
        this.config.downloadDir = dir
      })
    }
  }
}
</script>
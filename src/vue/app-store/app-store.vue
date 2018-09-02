<style lang="stylus">
  .installed,.recommended
    background-color var(--p-even-bg)
    height 120px
    overflow-x scroll
    white-space nowrap
  .app-store 
    position relative
    width 500px
    margin auto
    margin-top 10px
    background-color var(--p-bg)
    color var(--p-color)
    height 700px
    border-radius 5px
    padding 5px
    .uploading
      text-align center
      background-color rgba(0,0,0, 0.3)
      padding-top 10%
      color white
      font-size 35px
      height 100%
      width 100%
      position absolute
      top 0
      left 0
      .uploadroll
        background-color white
        margin auto
        border-radius 10px
        height 100px
        width 100px
        animation updatingRoll 2s infinite ease
    .apps
      background-color var(--p-even-bg)
      height 350px
      overflow-y scroll
    .upload-console
      text-align center
@keyframes updatingRoll 
  0%
    transform rotate(0)
  50%
    transform rotate(180deg)
  100%
    transform rotate(360deg)
</style>
<template>
  <transition name="layer">
    <div class="layer-cover" v-if="show">
      <div class="app-store">
        <div class="uploading" v-if="appUploading">
          Uploading now....
          <div class="uploadroll"/>
        </div>
        <div class="app-store-header">
          <button class="close" @click="hideMe">X</button>
        </div>
        <div>{{ ui.INSTALLED }}</div>
        <div class="installed" @wheel="scrollY($event, 'installed')" ref="installed">
          <tl-app v-for="a in installed" :app="a" :installed="true" :key="a.name"/>
        </div>
        <div>{{ ui.RECOMMENDED }}</div>
        <div class="recommended" @wheel="scrollY($event, 'recommended')" ref="recommended">
          <tl-app v-for="a in recommended" :app="a" :key="a.name"/>
        </div>
        <div class="find-console"><input type="text" class="text-center" :placeholder="ui.SEARCH_ON_ENTER" @keydown.enter="findApps"></div>
        <div class="apps">
          <tl-app v-for="a in apps" :app="a" :key="a.name"/>
        </div>
        <div class="upload-console">
          <input type="button" value="Upload my app" @click="uploadApp">
          <input type="button" value="Test local app(F10)" @click="testLocalApp">
        </div>
      </div>
      <app-detail/>
    </div>
  </transition>
</template>
<script>
import eventHub from '../../js/g-event'
import {mapState, mapActions} from 'vuex'
import AppDetail from './app-detail.vue'
import layer from '../../js/util/layer'
export default {
  data(){
    return {
      show:false,
      recommended:[],
      apps:[]
    }
  },
  mixins:[layer],
  computed:mapState({
    ui:'ui',
    installed:'apps',
    appUploading:'appUploading'
  }),
  created(){
    this.setShortcut({
      Escape:()=>{
        this.hideMe()
      },
      F10:()=>{
        this.testLocalApp()
      }
    })
    eventHub.$on('show-app-store', this.showMe)
    eventHub.$on('found-apps', apps=>{
      this.apps = apps
    })
    eventHub.$on('got-recommended', apps=>{
      this.recommended = apps
    })
    eventHub.$on('test-local-app', this.testLocalApp)
  },
  watch:{
    show(v){
      if(v){
        eventHub.addLayer(this)
      }else{
        eventHub.removeLayer()
      }
    }
  },
  components:{
    'app-detail':AppDetail
  },
  methods:{
    scrollY(ev, name){
      const move = ev.deltaY > 0 ? 160: -160
      const tgEl = this.$refs[name]
      tgEl.scrollLeft += move
    },
    showMe(){
      this.show = true
      this.getRecommends()
    },
    getRecommends(){
      this.$store.dispatch('getRecommendApps')
        .then(recommends=> this.recommends = recommends)
    },
    findApps(ev){
      const searchStr = ev.target.value
      if(!searchStr){
        return
      }
      this.$store.dispatch('findApps', searchStr)
        .then(apps=> this.apps = apps)
    },
    hideMe(){
      this.show = false
      this.recommended = []
      this.apps = []
    },
    ...mapActions(['uploadApp', 'testLocalApp'])
  }
}

</script>


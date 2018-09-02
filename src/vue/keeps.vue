<style lang="stylus">
  .keeps
    background-color var(--p-bg)
    width 500px
    height 600px
    margin 30px auto
    color var(--p-color)
    border-radius 3px
    .keep-list
      padding 3px
      height 560px
      overflow-y scroll
    .keeps-header
      height 30px
      background-color var(--p-even-bg)
</style>

<template>
  <transition name="layer">
    <div class="layer-cover" v-if="show">
      <div class="keeps">
        <div class="keeps-header">
          <input type="text" placeholder="Filter" @keydown.enter="keepFilter = $event.target.value">
          <button class="close" @click="hideMe">X</button>
        </div>
        <div class="keep-list">
          <my-keep v-for="k in filterdKeeps" :keep="k" :key="k._id"/>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import gev from '../js/g-event'
import Keep from './keep.vue'
import moment from 'moment'
class KeepData{
  constructor(obj){
    Object.assign(this, obj)
  }
  get searchKey(){
    return [
      this.senderName,
      this.content,
      this.destTeamNames.join('\n'),
      moment(this.sendAt).format('YYYY-MM-DD HH:mm:ss')
    ].join('\n')
  }
}
export default {
  data(){
    return {
      show:false,
      keepFilter:'',
      keeps:[]
    }
  },
  created(){
    this.$on('keydown', this.keydown)
    gev.$on('show-keeps', this.showMe)
    gev.$on('remove-keep', this.removeKeep)
  },
  components:{
    'my-keep':Keep
  },
  computed:{
    filterdKeeps(){
      const fs = this.keepFilter
      if(!fs){
        return this.keeps
      }
      return this.keeps.filter(k=>k.searchKey.includes(fs))
    }
  },
  watch:{
    show(v){
      if(v){
        return gev.addLayer(this)
      }
      gev.removeLayer()
    }
  },
  methods:{
    keydown(ev){
      if(ev.key === 'Escape'){
        this.hideMe()
      }
    },
    showMe(keeps){
      this.keeps = keeps.map(k=>new KeepData(k))
      this.show = true
    },
    removeKeep(keepId){
      var i = this.keeps.findIndex(k=>k._id === keepId)
      if(i === -1){
        return
      }
      this.keeps.splice(i, 1)
    },
    hideMe(){
      this.keeps = []
      this.keepFilter = ''
      this.show = false
    }
  }
}
</script>

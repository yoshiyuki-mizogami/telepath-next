<template>
  <div class="apps-content">
    <div class="apps-wrap">
      <div class="apps-console">
        <input type="text" class="form-control"
               placeholder="Filter(Enter)" v-model="appFilter" @keydown.enter="findApps">
      </div>
      <div class="apps">
        <an-app v-for="a in apps" :key="a._id" :app="a"/>
      </div>
    </div>
  </div>
</template>
<script>
import {mapState} from 'vuex'
import App from './app.vue'
export default {
  data(){
    return {
      appFilter:''
    }
  },
  methods:{
    findApps(){
      if(!this.appFilter){
        return
      }
      this.$store.dispatch('findApps', this.appFilter)
    }
  },
  computed:mapState({apps:'apps'}),
  components:{
    'an-app':App
  }
}
</script>
<style lang="stylus">
.apps-content
  height 100%
  width 100%
  .apps-wrap
    float left
    height 100%
    width 100%;
    .apps-console
      height 30px
      border-bottom solid 1px gray
    .apps
      height calc(100% - 30px)
      overflow-y scroll
      display flex
      flex-wrap wrap
</style>

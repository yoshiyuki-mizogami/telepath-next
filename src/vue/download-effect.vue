<style lang="stylus">
</style>

<template>
  <transition name="download">
    <div v-show="effect" class="download-effect"/>
  </transition>
</template>
<script>
import eventHub from '../js/g-event'
const EFFECT_DURATION = 150
let effectEv = null
export default {
  data(){
    return {
      effect:false
    }
  },
  created(){
    eventHub.$on('download-effect', this.showEffect)
  },
  methods:{
    showEffect(filepath){
      clearTimeout(effectEv)
      this.effect = true
      effectEv = setTimeout(()=>{
        this.effect = false
        eventHub.$emit('show-direct-opener', filepath)
      }, EFFECT_DURATION)
    }
  }
}
</script>
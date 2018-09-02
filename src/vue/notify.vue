<style lang="stylus">
notifyWidth = 300px
notifyWidthMinus = -300px
  .notify
    text-align center
    position fixed
    top 70px
    right 0
    z-index 2000
    width notifyWidth
    padding 5px
    border-radius 5px 0 0 5px
    background-color rgb(255,244,244)
    font-weight bold
    border solid 2px rgb(255,220,220)
    border-right none
    box-shadow 0px 0px 3px gray
  .notify-enter-active, .notify-leave-active
    transition right .3s ease
    right 0
  .notify-enter, .notify-leave-to
    right notifyWidthMinus
  
</style>
<template>
  <transition name="notify">
    <div class="notify" v-show="show" :class="level">
      {{ message }}
    </div>
  </transition>
</template>

<script>
import gev from '../js/g-event'
let evId = null
const NOTIFY_TIME = 3000
export default {
  data(){
    return {
      show:false,
      message:'',
      level:null
    }
  },
  created(){
    gev.$on('notify-message', this.notify)
  },
  methods:{
    notify(message, level = 'info'){
      clearTimeout(evId)
      this.show = true
      this.message = message
      this.level = level
      evId = setTimeout(()=>{
        this.show = false
      }, NOTIFY_TIME)
    }
  }
}
</script>

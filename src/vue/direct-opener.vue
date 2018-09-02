<style lang="stylus">
.direct-opener
  bottom 30px
  left 0
  position fixed
  min-width 300px
  max-width 100%
  height 50px
  border-radius 5px
  background-color white
  text-align center
  box-shadow 0px 0px 3px 3px rgb(150,150,150)
  .direct-open-target
    width 80%
    margin auto
    text-align center
    text-decoration underline
    color blue
    cursor pointer
    white-space pre
    overflow-x hidden
.open-direct-enter-active,.open-direct-leave-active
  transition opacity .3s ease
  opacity 1
.open-direct-enter, .open-direct-leave-to
  opacity 0
</style>
<template>
  <transition name="open-direct">
    <div v-if="show" class="direct-opener">
      <div>{{ $store.state.ui.OPEN_DIRECT }}</div>
      <div class="direct-open-target" @click="openDirect">{{ filename }}</div>
    </div>
  </transition>
</template>
<script>
import {basename}  from 'path'
import eventHub from '../js/g-event'
import {remote} from 'electron'
let prevent = false
let closeEv = null
const {shell} = remote
const OPEN_DELAY = 300
const AUTO_CLOSE_DURATION = 5000
export default {
  data(){
    return {
      show:false,
      filepath:''
    }
  },
  created(){
    eventHub.$on('show-direct-opener', this.showMe)
  },
  computed:{
    filename(){
      return basename(this.filepath)
    }
  },
  methods:{
    showMe(filepath){
      prevent = false
      clearTimeout(closeEv)
      this.filepath = filepath
      this.show = true
      closeEv = setTimeout(this.hideMe, AUTO_CLOSE_DURATION)
    },
    hideMe(){
      this.show = false
      this.filepath = ''
    },
    openDirect(){
      if(prevent){
        return
      }
      prevent = true
      const {filepath} = this
      this.hideMe()
      setTimeout(()=>{
        shell.openExternal(filepath)
      },OPEN_DELAY)
    }
  }
}
</script>



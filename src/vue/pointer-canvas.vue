<style lang="stylus">
  #pointer-canvas
    position absolute
    top 0
    left 0
    pointer-events none
    width 100vw
    height 100vh
    .cursor
      opacity 0.8
      fill var(--p-bg)
</style>
<template>
  <svg id="pointer-canvas">
    <polygon v-show="showReplyForm" class="cursor" :points="points" />
  </svg>
</template>
<script>
import gev from '../js/g-event'
const XDIFF = 5
const WIDTH = 65
const AWAY = -100
const AWAYS = [AWAY, AWAY, AWAY, AWAY]
export default {
  created(){
    gev.$on('draw-cursor', this.drawCursor)
    gev.$on('clear-cursor', this.clear)
  },
  data(){
    return {
      ax:0,
      ay:0,
      bx:0,
      by:0
    }
  },
  computed:{
    showReplyForm(){
      return this.$store.state.showReplyForm
    },
    points(){
      const cx = this.bx + WIDTH
      return `${this.ax},${this.ay} ${this.bx},${this.by} ${cx},${this.by}`
    }
  },
  methods:{
    clear(){
      this.drawCursor(AWAYS)
    },
    drawCursor([ax, ay, bx, by]){
      this.visible = true
      this.ax = ax
      this.ay = ay
      this.bx = bx + XDIFF
      this.by = by
    }
  }
}
</script>



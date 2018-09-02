<template>
  <div class="alert notify" :class="alertLevel">{{notify.message}}</div>
</template>
<script>
import gev from '../js/global-event'
export default {
  props:['notify'],
  computed:{
    alertLevel(){
      let {level} = this.notify
      return {
        info:'alert-info',
        success:'alert-success',
        warn:'alert-warning',
        err:'alert-denger'
      }[level]
    }
  }
}
</script>
<style lang="stylus">
.notify
  margin-right 10px
  margin-bottom 10px
  white-space pre-wrap
  text-align center
  min-width 200px
  max-width 500px
</style>

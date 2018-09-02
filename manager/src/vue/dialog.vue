<style lang="stylus">
.dialog-cover-enter-active, .dialog-cover-leave-active
  transition opacity .3s ease
.dialog-cover-enter, .dialog-cover-leave-to
  opacity 0
.dialog-cover
  position fixed
  height 100%
  width 100%
  background-color rgba(0,0,0,.4)
  top 0
  left 0
  font-size 20px
  .dialog-header
    height 25px
    background-color rgb(200,200,200)
.dialog-box
  width 400px
  height 200px
  margin 100px auto
  border-radius 5px
  background-color white
  text-align center
  overflow hidden
  .dialog-message
    display table
    min-height 140px
    white-space pre-wrap
    padding 5px
    margin auto
    .mtext
      display table-cell
      margin auto
      vertical-align middle
  .dialog-ok,.dialog-cancel
    font-size 18px
    width 150px
  .dialog-ok:focus,.dialog-cancel:focus
    background-color lightyellow
</style>
<template>
<transition name="dialog-cover">
  <div class="dialog-cover" v-if="show">
    <div class="dialog-box">
      <div class="dialog-header">Telepath Manager Dialog</div>
      <div class="dialog-message"><span class="mtext">{{message}}</span></div>
      <div v-show="!noop" class="dialog-btn-wrap model-footer">
        <input class="dialog-ok btn btn-outline-success" type="button" :value="okCaption" @click="onOk">
        <input v-show="cancelable" class="btn btn-secondary dialog-cancel" type="button" value="Cancel" @click="onCancel">
      </div>
    </div>
  </div>
</transition>
</template>
<script>
import gEvent from '../js/global-event'
let OK = 'OK'
function noop(){}
export default {
  data(){
    return {
      show:false,
      message:'',
      cancelable:false,
      okCaption:OK,
      okHook:noop,
      noop:false
    }
  },
  created(){
    gEvent.$on('show-dialog', this.showDialog)
    gEvent.$on('hide-dialog', this.hideDialog)
  },
  methods:{
    showDialog(message, opt){
      this.message = message
      this.show = true
      this.okCaption = opt.okCaption || OK
      this.cancelable = opt.cancelable
      this.okHook = opt.ok || noop
      this.noop = !!opt.noop
    },
    onOk(){
      this.okHook()
      this.hideDialog()
    },
    onCancel(){
      this.hideDialog()
    },
    hideDialog(){
      this.show = false
    }
  }
}
</script>



<style lang="stylus">
.prompt-message
  padding 5px
  width 400px
  height 100px
  white-space pre-wrap
  display table
  .mtext
    margin auto
    display table-cell
    vertical-align middle
.prompt-input
  text-align center
</style>
<template>
  <transition name="dialog-cover">
    <div class="dialog-cover" v-if="show">
      <div class="dialog-box">
        <div class="dialog-header">Telepath Prompt</div>
        <div class="prompt-message"><span class="mtext">{{ message }}</span></div>
        <div><input class="prompt-input" ref="input" type="text" v-model="input" :maxlength="maxlength"></div>
        <div class="dialog-btn-wrap">
          <input class="dialog-ok" type="button" value="OK" @click="onOk">
          <input class="dialog-cancel" type="button" value="Cancel" @click="onCancel">
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
import gEvent from '../js/g-event'
const MAXLENGTH = 20
function noop(){}
export default {
  name:'Prompt',
  data(){
    return {
      show:false,
      message:'',
      input:'',
      okHook:noop,
      maxlength:MAXLENGTH
    }
  },
  watch:{
    show(v){
      if(v){
        return gEvent.addLayer(this)
      }
      gEvent.removeLayer()
    }
  },
  created(){
    gEvent.$on('show-prompt', this.showDialog)
  },
  methods:{
    showDialog(message, opt){
      this.input = ''
      this.message = message
      this.show = true
      this.okHook = opt.ok || noop
      this.noop = !!opt.noop
      this.$nextTick(()=>{
        this.$refs.input.focus()
      })
    },
    onOk(){
      const res = this.okHook(this.input)
      if(!res){
        return
      }
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



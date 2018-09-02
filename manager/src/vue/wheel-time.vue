<template>
  <input type="text" style="background-color:white;width:70px" readonly="true" @wheel="wheel" @click="init" :value="v" @keydown.up="backward" @keydown.down="forward">
</template>
<script>
import moment from 'moment'
const FORMAT = 'HH:mm'
const initial = '00:00'
const pre = '2000-01-01 '
export default {
  props:{
    value:{
      type:String,
      require:true
    }
  },
  computed:{
    v(){
      if(!this.value){
        return ''
      }
      return moment(pre + this.value).format(FORMAT)
    }
  },
  methods:{
    init(){
      if(!this.value){
        this.$emit('input', initial)
      }
    },
    wheel(ev){
      ev.deltaY < 0 ? this.backward() : this.forward()
    },
    forward(){
      this.init()
      this.$emit('input', moment(pre + this.value).add(1, 'hour').format(FORMAT))
    },
    backward(){
      this.init()
      this.$emit('input', moment(pre + this.value).add(1, 'hour').format(FORMAT))
    }
  }
}
</script>


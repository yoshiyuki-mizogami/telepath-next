<template>
  <input type="text" :placeholder="placeholder" style="background-color:white" readonly="true" @wheel="wheel" @click="init" :value="v" @keydown.up="backward" @keydown.down="forward">
</template>
<script>
import moment from 'moment'
const FORMAT = 'YYYY-MM-DD'
export default {
  props:{
    value:{
      type:Date,
      require:true
    },
    placeholder:String
  },
  computed:{
    v(){
      if(!this.value){
        return ''
      }
      return moment(this.value).format(FORMAT)
    }
  },
  methods:{
    init(){
      if(!this.value){
        this.$emit('input', new Date())
      }
    },
    wheel(ev){
      ev.deltaY < 0 ? this.backward() : this.forward()
    },
    forward(){
      this.init()
      this.$emit('input', moment(this.value).add(1, 'day').toDate())
    },
    backward(){
      this.init()
      this.$emit('input', moment(this.value).subtract(1, 'day').toDate())
    }
  }
}
</script>


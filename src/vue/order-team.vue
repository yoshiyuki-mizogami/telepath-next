<template>
  <div v-show="!hide" class="sort-team" :style="{'border-color':t.color}" :key="t._id">{{ t.name }}</div>
</template>
<script>
export default {
  props:{
    f:{
      type:String,
      required:true
    },
    t:{
      type:Object,
      required:true
    }
  },
  computed:{
    hide(){
      const {f} = this
      if(!f){
        return false
      }
      const {name} = this.t
      return !name.includes(f)
    }
  }
}
</script>


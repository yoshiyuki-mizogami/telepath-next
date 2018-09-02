<style lang="stylus">
  .imge-trimmer
    width 100%
    height 100%
  .img
    max-width:100%
  .image-content
    height 550px
    background-color rgb(233,233,233)
  .console 
    text-align center
    .input
      width 150px
      height 25px
</style>
<template>
  <div class="image-trimmer">
    <div class="image-content">
      <img ref="img" :src="imageUrl">
    </div>
    <div class="console">
      <input type="button" value="Apply" @click="apply">
      <input type="button" value="Cancel" @click="close">
    </div>
  </div>
</template>
<script>
import {remote} from 'electron'
let thisWindow = remote.getCurrentWindow()
let cropper
export default {
  data(){
    return {
      imageUrl:''
    }
  },
  created(){
    this.imageUrl = this.$parent.imageUrl
    this.$nextTick(()=>{
      cropper = new Cropper(this.$refs.img, {
        aspectRatio:1
      })
    })
  },
  methods:{
    cancel(){
      this.close()
    },
    apply(){
      let cav = cropper.getCroppedCanvas()
      thisWindow.emit('trimed', cav.toDataURL())
      this.close()
    },
    close(){
      window.close()
    }
  }
}
</script>


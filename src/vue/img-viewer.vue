<style lang="stylus">
  .img-wrapper
    transition opacity .3s ease
    text-align center
    width 100%
  .attach-img
    max-width 100%
    border-radius 5px
  .attach-enter-active
    opacity 1
  .attach-enter
    opacity 0
</style>

<template>
  <transition name="attach">
    <div class="img-wrapper" v-show="imgType" @contextmenu.stop="popupImgMenu">
      <video v-if="isVideo" ref="video" class="attach-img" :src="src" autoplay muted />
      <img v-else class="attach-img" :src="src">
    </div>
  </transition>
</template>

<script>
const videos = {
  mp4:true,
  webm:true
}
export default {
  props:{
    imgType:{
      type:String,
      required:true
    },
    img:{
      type:Object,
      required:true
    }
  },
  computed:{
    isVideo(){
      const iType = this.imgType.toLowerCase()
      return (iType in videos)
    },
    src(){
      return `data:${this.isVideo?'video':'image'}/${this.imgType};base64,${this.img.content}`
    }
  },
  methods:{
    popupImgMenu(){
      this.$store.dispatch('popupImgMenu', this.$parent)
    },
    replay(){
      const {video} = this.$refs
      video.position = 0
      video.play()
    }
  }
}
</script>



<style lang="stylus">
.file
  margin 1px
  cursor pointer
  display inline-block
  padding 1px 3px
  border-radius 2px
  background-color rgb(233,233,233)
  color black
  img,.filename
    vertical-align middle
</style>
<template>
  <div class="file" @dblclick="getFile()">
  <img :src="file.icon"><span class="filename">{{ file.name }}</span><img-viewer :img='img' :imgType="imgType" v-if="imgType" ref="imgPh"/></div>
</template>
<script>
import gEv from '../js/g-event.js'
import ImgViewer from './img-viewer.vue'
import getImgType from '../js/util/get-img-type'

export default {
  data(){
    return {
      showedImg:false,
      imgType:null,
      img:null
    }
  },
  props:{
    file:{
      type:Object,
      default(){
        return {}
      }
    }
  },
  computed:{
    isVideo(){
      return this.$refs.imgPh.isVideo
    }
  },
  methods:{
    getFile(){
      if(this.imgType){
        this.$store.dispatch('gotFile', {file:this.img, download:true})
        return
      }
      const imgType = getImgType(this.file.name)
      let download = true
      if(imgType){
        if(this.img){
          return this.imgType = imgType
        }
        download = false
        gEv.$once('recieve-img', img=>{
          this.imgType = imgType
          this.img = img
        })
      }
      this.$store.dispatch('getFile',{
        id:this.file._id,
        download
      })
    },
    replay(){
      this.$refs.imgPh.replay()
    }
  },
  components:{
    'img-viewer':ImgViewer
  }
}


</script>


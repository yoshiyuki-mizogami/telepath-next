<style lang="stylus">
  .keep
    background-color var(--s-bg)
    color var(--s-color)
    border-radius 2px
    font-size var(--global-font-size)
    line-height var(--global-line-height)
    .keep-header
      background-color var(--t-bg)
      color var(--t-color)
    .close
      font-size 13px
    .keep-send-at
      font-size 12px
    .keep-content
      padding 2px
      margin-left 10px
      white-space pre-wrap
      word-wrap break-word
      pre
        overflow-x auto
    .keep-content code
      overflow-x auto
    .keep-file
      display inline-block
      background-color rgb(244,244,244)
      padding 2px
      border-radius 2px
      color black
      font-size 12px
      cursor pointer
    .keep-delimiter
      margin-bottom 0
</style>

<template>
  <div class="keep">
    <div class="keep-header">
      <span class="keep-send-at">{{ keep.sendAt | formatDateTime }}</span>
      <span class="keep-sender">{{ keep.senderName }}</span> &gt;
      <span class="keep-send-to">{{ keep.destTeamNames.join(',') }}</span>
      <button class="close" @click="removeKeep">X</button>
    </div>
    <div v-if="keep.type==='text'" class="keep-content">{{ keep.content }}</div>
    <div v-else class="keep-content" v-html="keep.content"/>
    <div v-if="keep.files">
      <div class="keep-file" v-for="f in keep.files" @dblclick="downloadFile(f)" :key="f._id">{{ f.name }}</div>
    </div>
    <hr class="keep-delimiter">
  </div>
</template>

<script>
import gev from '../js/g-event'
export default {
  props:{
    keep:{
      type:Object,
      required:true
    }
  },
  methods:{
    removeKeep(){
      gev.$emit('show-dialog', this.$store.state.ui.REMOVE_KEEP_CONFIRM, {
        ok:()=>{
          this.$store.dispatch('removeKeep', this.keep._id)
        },
        cancelable:true
      })
    },
    downloadFile(f){
      this.$store.dispatch('getFile', {id:f._id,download: true})
    }
  }
}
</script>

<template>
  <div class="send-all-view" @drop.prevent="setFile" @dragenter.prevent @dragover.prevent>
    <div class="message-pane"><p>Message string's length must be longer than 20.</p>
      <textarea spellcheck="false" class="send-all-message form-control" v-model="sendAllMessage"/>
      <div class="files">
        <div class="file" v-for="f in files" :key="f.name">{{ f.name }}</div>
      </div>
      <div class="form-linline">
        <input class="btn btn-outline-warning" type="button" value="ClearFiles" @click="clearFiles">
        <input class="btn btn-outline-success" :disabled="sendAllMessage.length < 20" type="button" value="SendAll" @click="sendAll">
      </div>
    </div>
  </div>
</template>
<script>
import gev from '../js/global-event.js'
export default {
  data(){
    return {
      sendAllMessage:'',
      files:[]
    }
  },
  methods:{
    setFile(ev){
      this.clearFiles()
      this.files.push(...Array.from(ev.dataTransfer.files))
    },
    clearFiles(){
      this.files = []
    },
    sendAll(){
      const m = this.sendAllMessage.trim()
      if(!m || m.length <= 20){
        return gev.$emit('notify-message', 'Message too short')
      }
      this.$store.dispatch('sendAll', {message:m, files:this.files})
      this.clearFiles()
      this.sendAllMessage = ''
    }
  }
}
</script>

<style lang="stylus">
.send-all-view
  width 100%
  .send-all-message
    height 300px
    width 100%
    resize none
  .message-pane
    width 500px
  .files
    height 100px
    overflow-y scroll
    .file
      border-bottom solid 1px gray
</style>

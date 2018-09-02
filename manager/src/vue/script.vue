<template>
  <div class="script-view">
    <div class="script-editor form-group p-1">
      <textarea spellcheck="false" class="user-ids form-control" placeholder="Script target user id" v-model="scriptTargetUserId"></textarea>
      <textarea spellcheck="false" class="script form-control" v-model="script"></textarea>
      <input type="button" value="SendScript" class="btn btn-success" @click="sendScript">
    </div>
    <div class="log-pane">
      <div class="rlog" v-for="l in logs">{{l}}</div>
    </div>
  </div>
</template>
<script>
import {mapState} from 'vuex'
import gev from '../js/global-event.js'
export default {
  computed:{
    logs(){return this.$store.state.logs},
    debug(){this.$store.state.debug},
    scriptTargetUserId:{
      get(){
        return this.$store.state.scriptTargetUserId
      },
      set(v){
        this.$store.commit('setScriptTargets', v)
      }
    },
    script:{
      get(){
        return this.$store.state.script
      },
      set(v){
        this.$store.commit('setScript', v)
      }
    }
  },
  methods:{
    openSendScript(){
      this.scriptEditor = true
    },
    sendScript(){
      if(!this.scriptTargetUserId || !this.script){
        return 
      }
      let targetIds = this.scriptTargetUserId.split(/\r?\n/).filter(Boolean)
      targetIds.forEach(userId=>{
        this.$store.state.ws.send({
          method:'execute',
          userId:userId,
          script:this.script
        })
      })
      gev.$emit('notify', 'send done')
    }
  }
}
</script>

<style lang="stylus">
.script-view
  .script-editor
    margin auto
    float left
    width 700px
    textarea
      width 100%
      resize none
    .script
      height 650px
    .user-ids
      height 200px
  .log-pane
    padding 3px 5px
    width 500px
    height 700px
    font-size 12px
    font-family monospace
    overflow-y scroll
    background-color rgb(233,233,233)
    float left
    .rlog
      white-space pre-wrap
      word-wrap break-word
</style>

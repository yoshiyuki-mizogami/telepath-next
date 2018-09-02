<template>
  <div class="tl-mess p-1" :class="{child:!parent,revoked:m.revoked}">
    <div class="tl-mess-header"><span class="tl-mess-send-at">{{m.sendAt | formatDateTime}}</span>{{m.senderName}}<span v-if="parent"> to {{m.destTeamNames.join(',')}}</span></div>
    <div class="tl-mess-content ml-1">{{m.content}}</div>
    <div v-if="m.files && m.files.length" class="tl-mess-files">
      <div class="tl-mess-file" v-for="f in m.files" :key="f._id" @dblclick="downloadFile(f)">{{f.name}}</div>
    </div>
    <div v-if="parent && m.children.length" class="tl-children">
      <tl-message v-for="m in m.children" :m="m" :key="m._id"/>
    </div>
  </div>
</template>

<script>
export default {
  props:{
    m:Object,
    parent:{
      type:Boolean,
      default:false
    },
    hl:String
  },
  methods:{
    downloadFile(file){
      this.$store.state.ws.send({
        method:'getFile',
        id:file._id
      })
    } 
  }
}
</script>


<style lang="stylus">
.tl-mess
  max-width 100%
  border-color lightblue
  border-style solid
  border-width 0px
  border-bottom-width 1px
  &.child
    margin-left 25px
    border-left-width 2px
  &.revoked
    background-color rgb(222,222,222)
.tl-mess-send-at
  font-size smaller
  color gray
.tl-mess-content
  white-space pre-wrap
  word-wrap break-word
.tl-mess-file
  display inline-block
  padding 3px
  border-radius 3px
  border solid 1px gray
  margin 2px;
</style>


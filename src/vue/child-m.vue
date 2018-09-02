<template>
  <span ref="m" v-if="fold"/>
  <div v-else ref="m" class="m child" @contextmenu.stop="popupMessageMenu"
       :class="{'unread':!m.isRead, 'is-mine':m.isMine, 'imp':m.priority === IMPORTANT}">
    <div class="m-header">
      <div class="send-at" v-once>{{ m.sendAt | formatDateTime }}</div>
      <span class="sender-name">{{ m.senderName }}</span>
      <div class="read">{{ ui.READ }}:<div class="read-count">{{ readCount }}</div></div>
      <button v-once class="reply-btn icon-comment" @click="reply" :title="ui.REPLY"/>
      <button @click="readThis" v-if="!m.isRead" class="read-this icon-check" :title="ui.READ_THIS"/>
    </div>
    <div class="sender-icon" ref="icon" :style="{'background-image':'url(' + iconUrl + ')'}" @dblclick="getUserInfo"/>
    <div class="content-frame">
      <div ref="content" v-if="m.revoked"><div class="revoked">{{ ui.REVOKED }}</div></div>
      <div ref="content" v-else-if="m.type==='html'" class="content" v-html="m.content"/>
      <span v-else>
        <div class="content" v-text="m.content"/>
        <div class="files" v-if="m.files">
          <attach-file v-for="f in m.files" :file="f" :key="f._id"/>
        </div>
      </span>
    </div>
  </div>
</template>
<script>
import MessageMethods from '../js/util/message-methods.js'
export default {
  mixins:[MessageMethods],
  data(){
    return {
      isChild:true
    }
  },
  props:{
    fold:{
      type:Boolean,
      default:true
    }
  },
  created(){
    this.m.on('scroll', this.scroll)
    if(!this.m.isRead){
      this.$parent.unreads++
      this.$parent.fold = false
    }
  },
  watch:{
    'm.isRead'(v){
      if(v){
        this.$parent.unreads--
      }
    }
  },
  methods:{
    getUnreads(){
      const m = this.$parent.m
      const unreads = m.children.filter(m=>!m.isRead)
      if(!m.isRead){
        unreads.push(m)
      }
      return unreads
    }
  }
}
</script>

<style lang="stylus">
.sender-icon
  position relative
  margin-left 5px
  width 32px
  height 32px
  border-radius 3px
  overflow visible
  display inline-block
  vertical-align bottom
  background-size cover
  background-repeat no-repeat
.child .sender-icon
  width 24px
  height 24px
  vertical-align  top
  img
    height 100%
    width 100%
.m
  overflow visible
  width 100%
  margin-bottom 1px
  padding 0px 2px
  font-size 13px
  &.child
    padding 1px
  .fold-btn
    width 65px
    height 100%
  .child .m-header
    height 20px
    .sender-name
      min-height 20px
      font-size 13px
    .send-to
      display inline-block
      width 150px
  .header-right
    display inline-block
    width 404px
  .m-header
    height 15px
    vertical-align top
    div,button
      vertical-align top
      display inline-block
      font-size 10px
  .send-at
    color var(--r-color)
  .read-this
    font-size 13px !important
    margin-right 5px
    padding 0px 3px
    float right
  .read
    padding 0px 2px
    border-radius 2px
    height 15px
    float right
    .read-count
      display inline-block
      text-align right
      width 30px
  .reply-btn
    font-size 13px !important
    width 25px
    height 15px
    float right
    color hsl(100, 70%, 50%)
  .sender
    min-height 20px
    vertical-align top
    display flex
    align-items flex-end
    width 410px
    margin-bottom 1px
    .sender-name
      min-height 20px
      padding-left 5px
      width 200px
  .child .content-frame
    width 400px
    vertical-align top
  .content-frame
    transform-origin 0 0
    overflow visible
    display inline-block
    width 100%
    padding 5px
    margin-bottom 2px
    border-radius 2px
    .content
      white-space pre-wrap
      word-break break-all
      line-height 17px
    .att-img
      vertical-align middle
      height 16px
      width 16px
.unfold-enter-active
  transition opacity .3s ease
  opacity 1
.unfold-enter,.unfold-leave-to
  opacity 0
</style>
<template>
  <div ref="m" class="m" 
       @contextmenu.stop="popupMessageMenu"
       v-show="($store.state.filterUnread ? !m.isRead || unreads:true) &&
         (isMatched) &&
       ($store.state.filterImportant ? m.priority || hasImportant:true)"
       :class="{'unread':!m.isRead || unreads, 'is-mine':m.isMine,'imp':m.priority === IMPORTANT}">
    <div class="sender-icon" ref="icon" :style="{'background-image':'url(' + iconUrl + ')'}" @dblclick="getUserInfo"/>
    <div class="header-right">
      <div class="m-header">
        <div class="send-at" v-once>{{ m.sendAt | formatDateTime }}</div>
        <button :class="'icon-chevron-' + (fold?'down':'up')" class="fold-btn" :title="ui.FOLD" @click="toggleFold"/>
        <div class="read">{{ ui.READ }}:<div class="read-count">{{ readCount }}</div></div>
        <button class="reply-btn icon-comment" @click="reply" :title="ui.REPLY"/>
        <button @click="readThis" v-if="!m.isRead" class="read-this icon-check" :title="ui.READ_THIS"/>
      </div>
      <div class="sender">
        <div class="sender-name">{{ m.senderName }}</div>
        <span v-if="!m.revoked">
          <div v-if="agg" class="send-to" :title="toTeams">{{ to }}</div>
          <div class="send-to" v-else><div v-for="dn in m.destTeamNames" :key="dn">{{ dn }}</div></div>
        </span>
      </div>
    </div>
    <transition name="unfold">
      <div class="content-frame" v-show="!fold">
        <span v-if="!fold">
          <div ref="content" v-if="m.revoked"><div class="revoked">{{ ui.REVOKED }}</div></div>
          <div v-else-if="m.type==='html'" ref="content" v-html="m.content" class="content"/>
          <span v-else><div class="content" v-text="m.content"/>
            <div class="files" v-if="m.files">
              <attach-file v-for="f in m.files" :file="f" :key="f._id"/>
            </div>
          </span>
        </span>
        <child-message-box :fold="fold" v-for="cm in m.children" :m="cm" :key="cm._id"/>
      </div>
    </transition>
  </div>
</template>
<script>
import gev from '../js/g-event'
import ChildMessage from './child-m.vue'
import MessageMethods from '../js/util/message-methods.js'
export default {
  mixins:[MessageMethods],
  data(){
    return {
      fold:true,
      unreads:0
    }
  },
  components:{
    'child-message-box':ChildMessage
  },
  created(){
    gev.$on('set-fold', this.setFold)
    this.m.on('scroll', this.scroll)
    if(!this.m.isRead){
      return this.fold = false
    }
    if(!this.$store.state.boot){
      return this.fold = false
    }
  },
  computed:{
    searchText(){
      return this.$store.state.searchText
    },
    isMatched(){
      const txs = this.searchText
      if(!txs){
        return true
      }
      const words = txs.split(/ +/)
      return this.m.hitWord(words)
    },
    hasImportant(){
      const {m} = this
      return m.priority === this.IMPORTANT || this.m.children.some(c=>c.priority === this.IMPORTANT)
    }
  },
  methods:{
    setFold(tf){
      this.fold = tf
    },
    toggleFold(){
      this.fold = !this.fold
    },
    getUnreads(){
      const m = this.m
      const unreads = m.children.filter(m=>!m.isRead)
      if(!m.isRead){
        unreads.push(m)
      }
      return unreads
    }
  }
}



</script>

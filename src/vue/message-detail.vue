<style lang="stylus">
.message-detail
  height 550px
  width 500px
  margin 10% auto
  background-color var(--s-bg)
  .from-wrap
    padding-left 10px
    height 32px
    background-color var(--p-bg)
    color var(--p-color)
  .from
    font-size 12px
    vertical-align top
  .message-content
    padding 3px
    height 196px
    white-space pre-wrap
    width 100%
    overflow-y scroll
    background-color var(--ms-bg)
    color var(--ms-color)
  .reads-head
    height 20px
    font-size 13px
    color var(--t-color)
    background-color var(--t-bg)
    padding-left 10px
    .reads-filter
      float right
      border solid 1px gray
      height 100%
  .reads
    padding-left 15px
    height 290px
    background-color var(--s-bg)
    color var(--s-color)
    overflow-y scroll
    .read
      cursor pointer
      font-size 14px
      height 25px
      border-bottom solid 1px gray
    .read:nth-child(even)
      background-color var(--p-bg)
      color var(--p-color)
  .username
    display inline-block
    min-width 150px
    vertical-align middle
  .at
    vertical-align top
    font-size 12px
    color var(--p-color)
  .important
    vertical-align top
    font-size 18px
    color yellow
    text-shadow 1px 2px 2px black
</style>

<template>
  <transition name="layer">
    <div class="layer-cover" v-if="show">
      <div class="message-detail">
        <div class="from-wrap">
          <span class="from">from</span><div class="close" @click="close">X</div>
          <span style="cursor:pointer" @dblclick.prevent="showUserDetail(message.sender._id)">
            <img class="sender-icon" :src="message.sender.iconUrl">
            <span class="username">{{ message.senderName }}</span>
          </span>
          <span class="at">{{ message.sendAt | formatDateTime }}</span>
        </div>
        <div v-if="message.type === 'text'" class="message-content">{{ message.content }}</div>
        <div v-else ref="code" class="message-content" v-html="message.content"/>
        <div class="reads-head">Read count: {{ message.reads.length }} <input type="text" class="reads-filter" placeholder="Filter" @keydown.enter="applyFilter"></div>
        <div class="reads">
          <div class="read child" v-for="r in filterdReads" :key="r._id" @dblclick.prevent="showUserDetail(r.reader._id)">
            <img :src="r.reader.iconUrl" class="sender-icon">
            <span class="username">{{ r.reader.nickname || r.reader.name }}</span>
            <span class="at">{{ r.readAt | formatDateTime }}</span>
            <span class="important" v-text="r.priority ? '❢':''"/>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
import gev from '../js/g-event'
const IMPORTANT = '!'
export default {
  data(){
    return {
      show:false,
      readsFilter:'',
      message:{}
    }
  },
  created(){
    gev.$on('show-message-detail', this.showMe)
    this.$on('keydown', this.keydown)
  },
  watch:{
    show(v){
      if(v){
        return gev.addLayer(this)
      }
      gev.removeLayer()
    }
  },
  computed:{
    filterdReads(){
      const rf = this.readsFilter
      const reads = this.message.reads
      if(!rf){
        return reads
      }
      if(rf === IMPORTANT){
        return reads.filter(r=> r.priority)
      }
      return reads.filter(r=>{
        return (r.reader.account + '\n' + r.reader.name).includes(rf)
      })
    }
  },
  methods:{
    keydown(ev){
      if(ev.key === 'Escape'){
        this.close()
      }
    },
    showMe(message){
      this.message = message
      this.show = true
      if(this.message.type !== 'html'){
        return
      }
      this.$nextTick(()=>{
        const codeBlocks = this.$refs.code.querySelectorAll('.code')
        if(!codeBlocks.length){
          return
        }
        codeBlocks.forEach(codeBlock=>{
          //eslint-disable-next-line
          hljs.highlightBlock(codeBlock)
        })
      })
    },
    showUserDetail(userId){
      console.log(userId)
      this.$store.dispatch('getUserInfo',userId)
    },
    applyFilter(ev){
      this.readsFilter = ev.target.value
    },
    close(){
      this.show = false
    }
  }
}
</script>

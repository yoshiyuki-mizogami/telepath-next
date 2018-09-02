<template>
  <div class="messages-view">
    <div class="message-search-console form-inline">
      <label>From:</label><wheel-date class="form-control" v-model="from"/>
      <wheel-time class="form-control" v-model="fromTime"/>
      <label>To:</label><wheel-date class="form-control" v-model="to"/>
      <wheel-time class="form-control" v-model="toTime"/>
      <input type="text" class="form-control" v-model="senderName" placeholder="Sender name" @keydown.enter="search">
      <input type="text" class="form-control" style="cursor:pointer" readonly="readonly" v-model="destTeam.name" placeholder="Dest team" @click="selectTeam">
      <input type="text" class="form-control" v-model="content" placeholder="Content" @keydown.enter="search">
      <input type="button" value="Search" class="btn btn-outline-success" :disabled="searching" @click="search">
      <span class="result-count">Parent messages:{{pcount}} Child messages:{{ccount}}</span>
    </div>
    <div class="messages">
      <tl-message v-for="m in messages" :parent="true" :m="m" :key="m._id"/>
    </div>
  </div>
</template>
<script>
import gev from '../js/global-event'
import {mapState} from 'vuex'
import moment from 'moment'
import wheelDate from './wheel-date.vue'
import wheelTime from './wheel-time.vue'
let now = Date.now()
const ADAY = 1000 * 60 * 60 * 24
const SEARCH_LENGTH_LIMIT = ADAY * 10
let to = moment().set({hour:0,minute:0,second:0,millisecond:0}).add(1, 'day').toDate()
let from  = new Date(to.getTime() - ADAY * 1)
export default {
  data(){
    return {
      senderName:'',
      destTeam:{},
      sendAt:{
        from,
        to,
      },
      fromTime:'00:00',
      toTime:'00:00',
      content:''
    }
  },
  destroyed(){
    this.$store.commit('clearMessages')
  },
  computed:{
    messages(){ return this.$store.state.messages},
    searching(){ return this.$store.state.searching},
    debug(){ return this.$store.state.debug},
    pcount(){
      return this.messages.length
    },
    ccount(){
      return this.messages.reduce((c,m)=> c + m.children.length, 0)
    },
    from:{
      get(){
        return this.sendAt.from
      },
      set(v){
        let duration =this.sendAt.to.getTime() - v.getTime()
        if(SEARCH_LENGTH_LIMIT < duration){
          return gev.$emit('notify-message', 'Date range must not be longer than 10 days')
        }
        this.sendAt.from = v
      }
    },
    to:{
      get(){
        return this.sendAt.to
      },
      set(v){
        let duration = v.getTime() - this.sendAt.from.getTime()
        if(SEARCH_LENGTH_LIMIT < duration){
          return gev.$emit('notify-message', 'Date range must not be longer then 10 days')
        }
        this.sendAt.to = v
      }
    }
  },
  components:{
    'wheel-date':wheelDate,
    'wheel-time':wheelTime
  },
  methods:{
    search(){
      this.$store.state.searching = true
      this.$store.state.ws.send({
        method:'searchMessages',
        all:!!this.debug,
        searchParams:{
          sendAt:{
            $gt:moment(moment(this.sendAt.from).format('YYYY-MM-DD') + ' ' +this.fromTime, 'YYYY-MM-DD HH:mm' ).toDate().toGMTString(),
            $lt:moment(moment(this.sendAt.to).format('YYYY-MM-DD') + ' ' + this.toTime, 'YYYY-MM-DD HH:mm').add(1, 'day').toDate().toGMTString()
          },
          destTeam:this.destTeam._id || undefined,
          senderName:this.senderName || void 0,
          content:this.content || void 0
        }
      })
    },
    selectTeam(){
      gev.$emit('show-team-selector', 'Select Destination team', selected=>{
        this.destTeam = (selected === this.destTeam) ? {} : selected
      })
    },
    clear(){
      
    }
  }
}
</script>
<style lang="stylus">
  .messages-view
    height 100% 
    .messages
      height calc(100% - 50px)
      overflow-x hidden
      overflow-y scroll
</style>


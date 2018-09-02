<template>
  <div class="rooms-content">
    <div class="rooms-wrap">
      <div class="rooms-console">
        <input type="text" class="form-control" placeholder="Filter(Enter)" v-model="roomFilter">
        <div class="form-inline">
          <input type="text" class="form-control" placeholder="New room name" v-model="addRoomName">
          <input type="button" class="btn btn-outline-primary" value="Add" @click="addRoom">
        </div>
      </div>
      <div class="rooms">
        <a-room v-for="r in filterdRooms" :room="r" :key="r._id"></a-room>
      </div>
    </div>
    <div class="room-detail-wrap">
      <room-detail></room-detail>
    </div>
  </div>
</template>
<script>
import {mapState} from 'vuex'
import Room from './room.vue'
import gev from '../js/global-event'
import RooomDetail from './room-detail.vue'
export default {
  data(){
    return {
      roomFilter:'',
      addRoomName:''
    }
  },
  created(){
    this.$store.dispatch('getRooms')
  },
  computed:mapState({
    filterdRooms(){
      let rf = this.roomFilter
      if(!rf){
        return this.rooms
      }
      return this.rooms.filter(r=>{
        return r.name.includes(rf) || r.teams.some(t=>{
          return t.name.includes(rf)
        })
      })
    },
    rooms:'rooms'
  }),
  components:{
    'a-room':Room,
    'room-detail':RooomDetail
  },
  methods:{
    addRoom(){
      let roomname = this.addRoomName.trim()
      if(!roomname){
        return gev.$emit('notify-message', 'Require name for new room')
      }
      this.$store.dispatch('addRoom', roomname)
      this.addRoomName = ''
    }
  }
}
</script>
<style lang="stylus">
.rooms-content
  height 100%
  width 100%
  .rooms-wrap
    float left
    height 100%
    width calc(100% - 500px)
    .rooms-console
      height 80px
      border-bottom solid 1px gray
    .rooms
      height calc(100% - 100px)
      overflow-y scroll
  .room-detail-wrap
    float left
    width 450px
</style>

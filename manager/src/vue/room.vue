<template>
  <div class="room card" @dblclick="showRoomDetail" v-if="debug || !room.hide">
    <div class="room-name bg-warning">
      <span>{{room.name}}</span>
      <button v-show="room.teams.length === 0" type="button" class="close" @click="remove"><span aria-hidden="true">&times;</span></button>
    </div>
    <ul class="room-teams list-group">
      <li class="room-team list-group-item p-1 m-0"
      :style="{'border-color':t.color}" v-for="t in room.teams" :key="t._id">
        {{t.name}}
      </li>
    </ul>
  </div>
</template>

<script>
import gev from '../js/global-event'
import {mapState} from 'vuex'
export default {
  props:['room'],
  computed:mapState(['debug']),
  methods:{
    remove(){
      if(this.room.teams.length){
        return gev.$emit('notify-message', 'Can\'t delete. This room has team(s)')
      }
      this.$store.dispatch('removeRoom', this.room._id)
    },
    showRoomDetail(){
      this.$store.dispatch('getRoom', this.room._id)
    }
  }
}
</script>

<style lang="stylus">
  .room
    display inline-block
    width 230px
    text-align center
    .room-name
      padding 2px
    .room-teams
      height 250px
      overflow-y scroll
      padding 5px
    .room-team
      font-size 13px
      border-left solid 5px white
      text-indent 5px
</style>

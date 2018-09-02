<template>
  <transition name="layer">
    <div class="layer-cover" v-if="show">
      <div class="team-order">
        <div class="team-order-header"><span class="exp">{{ ui.TEAM_ORDER_EXP }}</span><button class="close" @click="close">X</button>
        </div>
        <div class="team-order-pane" @dragstart.stop>
          <input class="filter" type="text" :placeholder="ui.FILTER" v-model="afterFilter">
          <draggable v-model="after" class="after" :options="{draggable:'.sort-team', group:'teams'}">
            <order-team :t="a" :f="afterFilter" v-for="a in after" :key="a._id"/>
          </draggable>
        </div>
        <div class="order-cons">
          <input type="button" value="<<" @click="addAll">
          <input type="button" value=">>" @click="reverseAll">
          <input type="button" :value="ui.SET" @click="set">
        </div>
        <div class="team-order-pane" @dragstart.stop>
          <input class="filter" type="text" :placeholder="ui.FILTER" v-model="beforeFilter">
          <draggable v-model="before" class="before" :options="{draggable:'.sort-team', group:'teams'}">
            <order-team :t="b" :f="beforeFilter" v-for="b in before" :key="b._id"/>
          </draggable>
        </div>
      </div>
    </div>
  </transition>
</template>
<style lang="stylus">
  .team-order
    border-radius 5px
    padding 15px
    background-color var(--p-bg)
    color var(--p-color)
    height 90%
    width 510px
    margin 5% auto
    .dragArea
      min-height 10px
    .filter
      width 100%
      text-align center
    .team-order-header
      height 50px
      .exp
        display inline-block
        width 460px
    .team-order-pane
      float left
      width 200px
      height calc(100% - 100px)
    .order-cons
      float left
      width 80px
      height 100%
      padding-top 100px
      input
        width 100%
        font-size 20px
        padding 5px
    .after, .before
      background-color var(--p-even-bg)
      width 100%
      height calc(100% - 20px)
      overflow-y scroll
    .sort-team
      cursor pointer
      font-size 13px
      border-left-width 15px
      border-left-style solid
      text-align center
      border-radius 3px
      background-color var(--s-bg)
      color var(--s-color)
      margin 1px
      padding 3px
      &:hover
        background-color var(--s-high-bg)
</style>
<script>
import gev from '../js/g-event'
import {mapState} from 'vuex'
import vueDraggable from 'vuedraggable'
import OrderTeam from './order-team.vue'
export default {
  data(){
    return {
      before:[],
      after:[],
      show:false,
      afterFilter:'',
      beforeFilter:''
    }
  },
  computed:mapState({
    teamOrder:'loginedInfo.teamOrder',
    teams:'teams',
    ui:'ui'
  }),
  components:{
    draggable:vueDraggable,
    'order-team':OrderTeam
  },
  created(){
    gev.$on('open-sort-order-set-view', this.open)
  },
  methods:{
    open(){
      this.show = true
      const teamOrder = this.$store.state.loginedInfo.teamOrder || {}
      this.before = this.teams.filter(t=>!(t._id in teamOrder))
      this.after = this.teams.filter(t=>t._id in teamOrder)
    },
    add(bItem){
      const i = this.before.findIndex(b=>b === bItem)
      this.before.splice(i, 1)
      this.after.push(bItem)
    },
    reverse(aItem){
      const i = this.after.findIndex(a=>a === aItem)
      this.after.splice(i, 1)
      this.before.push(aItem)
    },
    addAll(){
      this.after.push(...this.before)
      this.before = []
    },
    reverseAll(){
      this.before = this.teams.map(t=>t)
      this.after = []
    },
    set(){
      const n = this.after.reduce((b,c, i)=>{
        b[c._id] = i + 1
        return b
      },{})
      this.$store.dispatch('setTeamOrder', n)
      gev.$emit('notify-message', this.ui.SAVE)
    },
    close(){
      this.show = false
      this.after = this.before =[]
    }
  }
}
</script>



<template>
  <transition name="layer">
    <div class="layer-cover" v-if="show">
      <div class="user-selector p-3 rounded bg-white">
        <div>{{ message }}<button type="button" class="close" @click="close"><span aria-hidden="true">&times;</span></button></div>
        <div class="form-inline"><input type="text" placeholder="Filter" class="form-control-feedback" @keydown.enter="filteruser"></div>
        <div class="select-users">
          <div class="select-user d-inline-block rounded p-1 bg-warning m-1" v-for="u in filteredUsers" @dblclick="selectIt(u)" :key="u._id">{{ u.name }}</div>
        </div>
      </div>
    </div>
  </transition>
</template>
<style lang="stylus">

.user-selector
  margin 5% auto
  width 800px
  background-color white
  .select-users
    height 500px
    overflow-y scroll
  .select-user:hover
    transition background-color .3s ease
    cursor pointer
    background-color lightgreen !important
</style>

<script>
import {mapState} from 'vuex'
import gev from '../js/global-event'
export default {
  data(){
    return {
      message:'',
      userFilter:'',
      multiple:false,
      show:false,
      clbk:null
    }
  },
  computed:mapState({
    users:'users',
    filteredUsers(){
      let tf = this.userFilter
      if(!tf){
        return this.users
      }
      return this.users.filter(t=>{
        return t.name.includes(tf)
      })
    }
  }),
  created(){
    gev.$on('show-user-selector', this.showMe)
  },
  methods:{
    showMe({message,multiple, clbk}){
      if(!clbk){
        throw new Error('Require clbk for user selector')
      }
      this.message = message
      this.multiple = !!multiple
      this.show = true
      this.clbk = clbk
    },
    filteruser(ev){
      this.userFilter = ev.target.value
    },
    selectIt(st){
      this.clbk(st)
      if(this.multiple){
        return
      }
      this.close()
    },
    close(){
      this.clbk = null
      this.show = false
    }
  }
}
</script>

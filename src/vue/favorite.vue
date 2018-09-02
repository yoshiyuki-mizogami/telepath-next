<template>
  <div class="favorite" 
       @contextmenu.stop="popupFavoriteMenu"
       @click="setFavorite" 
       @mousedown.middle="setFavorite($event, true)"
       :key="fav.name" ><span class="icon-star"/>{{ fav.name }}</div>
</template>
<script>
import gev from '../js/g-event'
export default {
  props:{
    fav:{
      type:Object,
      required:true
    }
  },
  methods:{
    setFavorite(ev, append){
      const teams = Array.from(this.fav.teams)
      if(append){
        teams.push(...this.$parent.getSelectedTeams().map(t=>t._id))
      }
      gev.$emit('restore-favorite', teams)
    },
    popupFavoriteMenu(){
      this.$store.dispatch('popupFavoriteMenu',this.fav)
    }
  }
}
</script>


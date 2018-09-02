<template>
  <div class="app">
    <div class="icon-wrap">
      <img :src="iconUrl">
      <span>{{ app.caption }}</span>
    </div>
    <table class="app-tbl">
      <tbody>
        <tr>
          <td>Name</td>
          <td>{{ app.name }}</td>
        </tr>
        <tr>
          <td>Author</td>
          <td>{{ app.author.name }}</td>
        </tr>
        <tr>
          <td>Version</td>
          <td>{{ app.version }}</td>
        </tr>
        <tr>
          <td>UpdateAt</td>
          <td style="font-size:10px">{{ app.updated | formatDateTime }}</td>
        </tr>
      </tbody>
    </table>
    <input type="button" value="AddCollabolator" style="padding:2px" class="add-clb btn btn-warning" @click.stop="addCollaborator">
  </div>
</template>
<style lang="stylus">
.app
  display inline-block
  height 300px
  width 250px
  flex-basis 250px
  margin 3px
  box-shadow 2px 2px 3px gray
  border-radius 5px;
  padding 5px
  position relative
.app-tbl
  width 100%
  td
    background-color rgb(233,255,255)
    border-bottom solid 1px rgb(200,200,200)
.add-clb
  position absolute
  bottom 0px
  right 0px
</style>

<script>
import globals from '../js/globals.js'
const {IMAGE_SERVER} = globals
export default {
  props:{
    app:Object,
    require:true
  },
  computed:{
    iconUrl(){
      return `http://${IMAGE_SERVER}:8080/apps/${this.app.name}/icon.png`
    }
  },
  methods:{
    addCollaborator(){

    }
  }
}
</script>

/*globals hljs*/
import el from 'electron'
import path from 'path'
import AttachFile from '../../vue/attach-file.vue'
import gev from '../g-event'
import globals from '../globals.js'
import SmoothScroll from './smooth-scroll'
const {remote:{Menu}} = el

const HTML = 'html'

const MESSAGE_OFFSET = 40
const ICON_OFFSET = 30
export default {
  data(){
    return {
      IMPORTANT:10,
      match:false
    }
  },
  props:{
    m:{
      type:Object,
      required:true
    }
  },
  watch:{
    fold(v){
      if(v){
        return
      }
      this.setCodeHighlight()
    }
  },
  components:{
    'attach-file':AttachFile
  },
  mounted(){
    this.setCodeHighlight()
  },
  computed:{
    to(){
      const d = this.m.destTeamNames
      return (2 <= d.length)?d.length + ' ' + this.ui.TEAMS:d[0]
    },
    toTeams(){
      return this.m.destTeamNames.join('\n')
    },
    ui(){
      return this.$store.state.ui
    },
    agg(){
      return this.$store.state.config.aggregateDests
    },
    iconUrl(){
      return 'http://' + globals.IMAGE_SERVER + ':8080/icons/' + this.m.sender._id + '.png?' + this.m.iconCache
    },
    readCount(){
      const m = this.m
      return m.revoked ? '-' : m.readCount < 100 ? m.readCount : '99+'
    }
  },
  methods:{
    setCodeHighlight(){
      if(this.m.revoked){
        return
      }
      this.$nextTick(()=>{
        if(this.m.type === HTML){
          const c = this.$refs.content
          if(!c){
            return
          }
          const codeBlocks = c.querySelectorAll('.code')
          if(!codeBlocks.length){
            return
          }
          codeBlocks.forEach(codeBlock=>{
            hljs.highlightBlock(codeBlock)
          })
        }
      })
    },
    getUserInfo(){
      const userId = this.m.sender._id
      this.$store.dispatch('getUserInfo',userId)
    },
    scroll(){
      if(this.isChild){
        this.$parent.fold = false
      }else{
        this.fold = false
      }
      this.$nextTick(()=>{
        const parent = document.querySelector('.messages')
        SmoothScroll(this.$refs.m || this.$parent.$refs.m, parent, MESSAGE_OFFSET)
      })
    },
    readThis(){
      this.m.isRead = true
      this.$store.dispatch('readMessage',this.m)
    },
    reply(){
      const el = this.$refs.icon
      const rect = el.getBoundingClientRect()
      gev.$emit('show-reply-form', {
        y:rect.bottom + ICON_OFFSET,
        x:rect.left,
        parent:this.m.parent || this.m._id,
        parentEl:this.$refs.icon
      })
    },
    popupMessageMenu(){
      const unreads = this.getUnreads()
      const {fold} = this
      Menu.buildFromTemplate([
        {
          label:this.ui.REPLY,
          icon:path.join(globals.imgDir, 'reply._png'),
          click:this.reply
        },
        {
          label:this.ui.SHOW_MESSAGE_DETAIL,
          icon:path.join(globals.imgDir, 'detail._png'),
          click:()=>{
            this.$store.dispatch('requestMssageDetail', this.m.id)
          },
          visible:!this.m.revoked
        },
        {
          label:this.ui.FOLDTHIS,
          icon:path.join(globals.imgDir, 'fold._png'),
          click:()=>{
            (this.isChild?this.$parent:this).fold = true
          },
          visible:!fold
        },
        {
          label:this.ui.READ_THIS_THREAD,
          icon:path.join(globals.imgDir, 'checks._png'),
          click:()=>{
            unreads.forEach(m=>{
              this.$store.dispatch('readMessage', m)
            })
          },
          visible:!!unreads.length
        },
        {
          label:this.ui.ADD_KEEP,
          icon:path.join(globals.imgDir, 'keep._png'),
          click:()=>{
            this.$store.dispatch('addKeep', this.m._id)
          }
        },
        {
          label:this.ui.SET_IMPORTANT,
          icon:path.join(globals.imgDir, 'important._png'),
          click:()=>{
            if(this.m.isRead){
              this.$store.dispatch('setPriority',{
                message:this.m,
                priority:this.IMPORTANT
              })
              return
            }
            this.$store.dispatch('readMessage', {
              id:this.m._id,
              priority:this.IMPORTANT
            })
          },
          visible:!this.m.priority
        },
        {
          label:this.ui.UNSET_IMPORTANT,
          icon:path.join(globals.imgDir, 'important._png'),
          click:()=>{
            this.$store.dispatch('setPriority',{
              message:this.m,
              priority:0
            })
          },
          visible:!!this.m.priority
        },
        {
          label:this.ui.REVOKE_MESSAGE,
          icon:path.join(globals.imgDir, 'revoke._png'),
          click:()=>{
            gev.$emit('show-dialog',this.ui.CONFIRM_REVOKE, {
              ok:()=>{
                this.$store.dispatch('revokeMessage', this.m.id)
              },
              cancelable:true
            })
          },
          visible:this.m.isMine && !this.m.revoked
        }
      ]).popup({})
    }
  }
}
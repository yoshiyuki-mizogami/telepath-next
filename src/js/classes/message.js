import moment from 'moment'
import EventEmitter from 'events'
let messageHash = {}
const blank = {}
class Message extends EventEmitter{
  static clearMessage(){
    messageHash = {}
  }
  static getUnreadCount(){
    return Object.keys(messageHash).map(key=>{
      const m = messageHash[key]
      return !m.isRead
    }).filter(Boolean).length
  }
  static getUnreads(){
    return Object.keys(messageHash).map(key=>{
      const m = messageHash[key]
      if(!m.isRead){
        return m
      }
    }).filter(Boolean)
  }
  static addChild(m, ascend){
    const parentMessage = messageHash[m.parent]
    if(ascend){
      return parentMessage.children.push(m)
    }
    parentMessage.children.unshift(m)
  }
  static readIt(obj){
    const m = obj.message
    const message = messageHash[m._id]
    if(!message){//for logined but before message recieve
      return
    }
    message.readCount = m.readCount
    if(obj.yours){
      message.isRead = true
      /* for direct set important */
      message.priority = obj.read.priority
    }
  }
  static revokeIt(obj){
    const m = obj.message
    const message = messageHash[m._id]
    if(!message){
      return
    }
    message.revoked = true
  }
  static getById(id){
    return messageHash[id]
  }
  /**
   * Creates an instance of Message.
   * @param {object} message 
   * @param {string} myAccount 
   * 
   * @memberof Message
   */
  constructor(message, myAccount){
    super()
    this.isMine = myAccount === message.sender._id
    this.isRead = this.isMine || !!message.reads.length
    if(message.children){
      message.children = message.children.map(cm=> new Message(cm, myAccount))
    }else{
      message.children = []
    }
    this.priority = message.reads[0] ? message.reads[0].priority || 0 : 0
    /*priority setting triarl remove after this line*/
    Object.assign(this,message)
    this.sendAt = new Date(this.sendAt)
    messageHash[this._id] = this
  }
  get serial(){
    return [
      moment(this.sendAt).format('YYYY-MM-DD HH:mm:ss'),
      this.senderName,
      this.dests.join('\n'),
      this.files.map(f=>f.name).join('\n')
    ].join('\n')
  }
  /**
   * @param {string[]} words 
   * @memberof Message
   * @returns {boolean}
   */
  hitWord(words){
    const txts = []
    if(this.children && this.children.length){
      txts.push(...this.children.map(c=>c.searchText))
    }
    txts.push(this.searchText)
    return txts.some(txt=>{
      return words.every(w=> txt.includes(w))
    })
  }
  /**
   * @readonly
   * @memberof Message
   * @returns {string}
   */
  get searchText(){
    const txts = [
      moment(this.sendAt).format('YYYY-MM-DD HH:mm:ss'),
      this.senderName,
      (this.destTeamNames||[]).join('\n'),
      this.files.map(f=>f.name).join('\n'),
      this.content
    ].join('\n')
    return txts
  }

}
export default Message
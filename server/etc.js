'use strict'
const mongoose = require('mongoose')
const {Schema} = mongoose

const EtcSchema = new Schema({
  key:String,
  value:String
})
EtcSchema.statics.setEtc = function(base){
  return this.find({})
    .then(ret=>{
      return ret.reduce((before, current)=>{
        before[current.key] = current.value
        return before
      },base)
    })
}
const Etc = mongoose.model('Etc', EtcSchema)
const etc = {}

module.exports = {
  async set(){
    await Etc.setEtc(etc)
  },
  get(){
    return etc
  }
}

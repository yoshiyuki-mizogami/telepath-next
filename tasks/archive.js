const mongo = require('mongodb')
const moment = require('moment')
const _ = require('lodash')
const mongoClient =mongo.MongoClient
const path = require('path')
const fs = require('fs')
const NOW = moment().format('YYYY-MM-DD_HHmmss')
const param = require('./archive-param.json')
const {
  archiveDir:ARCHIVE_DIR,
  account,
  archiveLimitDay,
  archiveFileCountLimit
} = param

fs.mkdir(ARCHIVE_DIR, ()=>{})

const ARCHIVE_LIMIT = 1000 * 60 * 60 * 24 * archiveLimitDay
const borderDate = new Date()
borderDate.setTime(borderDate.getTime() - ARCHIVE_LIMIT)
borderDate.setHours(0)
borderDate.setMinutes(0)
borderDate.setSeconds(0)
borderDate.setMilliseconds(0)
console.log('Remove target limit date:', borderDate.toLocaleString())


const archiveMessages = async (archiveFilePath, db)=>{
  const teams = await getTeams(db)
  const message = db.collection('messages')
  const parents = await new Promise(resolve=>{
    message.find({
      parent:null,
      updatedAt:{$lt:borderDate}
    }).toArray((er, d)=>{
      console.log(`Parent message count is ${d.length}.`)
      resolve(d)
    })
  })
  if(parents.length === 0){
    return false
  }
  const deleteIds = parents.map(p=>p._id)
  const children = await  new Promise(resolve=>{
    message.find({
      parent:{$in:deleteIds}
    }).toArray((er,children)=>{
      resolve(children)
    })
  })
  console.log(`Children message count is ${children.length}`)
  const parentGroups = _.groupBy(children,c=> c.parent.toString())
  const childDeleteIds = children.map(c=>c._id)
  deleteIds.push(...childDeleteIds)
  parents.forEach(p=>{
    const pg = parentGroups[p._id.toString()]
    if(!pg){
      return
    }
    p.children = pg
  })
  console.log('All delete target id count %d',deleteIds.length )
  const saveResultMessages = parents.filter(m=>{
    return !m.destTeams.some(d=>{
      const dstr = d.toString()
      return teams.some(t=>t === dstr)
    })
  })
  fs.writeFileSync(archiveFilePath, JSON.stringify(saveResultMessages, 0, 1), 'utf8')
  const deleteFileIds = await getFileIds(db, parents)
  console.log('Complete save messages.')
  await removeReads(db, deleteIds)
  await removeFiles(db, deleteFileIds)
  await removeMessages(db, deleteIds)
  return true
}


const getFileIds = async (db, messages)=>{
  const result = []
  messages.forEach(m=>{
    if(m.children){
      m.children.forEach(c=>{
        if(c.files){
          result.push(...c.files)
        }
      })
    }
    if(m.files){
      result.push(...m.files)
    }
  })
  const limitDate = new Date()
  limitDate.setTime(limitDate.getTime() - 1000 * 60 * 60 * 24 * 30)
  const users = await db.collection('users').find({
    lastLogin:{$gt:limitDate}
  }).toArray()
  const keepFileIds = users.map(u=>{
    const keeps = u.keeps || []
    return keeps
  }).reduce((b,c)=>{
    b.push(...c)
    return b
  },[]).reduce((b, k)=>{
    b.push(...(k.files || []))
    return b
  }, []).reduce((base, file)=>{
    const strId = file._id.toString()
    base[strId] = true
    return base
  },{})
  return result.filter(r=>{
    const id = r.toString()
    return !keepFileIds[id]
  })
}
const removeMessages = (db, deleteIds)=>{
  const messages = db.collection('messages')
  return new Promise(resolve=>{
    messages.deleteMany({
      _id:{
        $in:deleteIds
      }
    }, (er, r)=>{
      if(er){
        console.log(er)
      }
      console.log('%d message deleted', r.deletedCount)
      resolve()
    })
  })
}
const removeReads = (db, deleteIds)=>{
  const reads = db.collection('reads')
  return new Promise(resolve=>{
    reads.deleteMany({
      message:{
        $in:deleteIds
      }
    }, (er, r)=>{
      if(er){
        console.log(er)
      }
      console.log('%d reads deleted', r.deletedCount)
      resolve()
    })
  })
}
const removeFiles = (db, deleteIds)=>{
  const files = db.collection('files')
  return new Promise(resolve=>{
    files.deleteMany({
      _id:{
        $in:deleteIds
      }
    }, (er, r)=>{
      if(er){
        console.log(er)
      }
      console.log('%d files deleted', r.deletedCount)
      resolve()
    })
  })
}
const getTeams = (db)=>{
  const teams = db.collection('teams')
  return new Promise(resolve=>{
    teams.find({hide:true}).toArray((er, r)=>{
      resolve(r.map(r=>r._id.toString()))
    })
  })
}

const url = `mongodb://${account.user}:${account.pwd}@${param.mongoServer}:27017/telepath`
function archive(filepath){
  return new Promise(async res=>{
    const client = await mongoClient.connect(url, {useNewUrlParser:true})
    const db = client.db('telepath')
    const deleted = await archiveMessages(filepath, db)
    client.close()
    res(deleted)
  })
}

async function deployArchiveFile(deployDir, filepath){
  const {unlink} = fs.promises
  const admZip = require('adm-zip')
  const basename = path.basename(filepath, '.json')
  const zip = new admZip()
  zip.addLocalFile(filepath)
  zip.writeZip(path.join(deployDir, basename + '.zip'))
  console.log('zip created')
  return unlink(filepath)
}
async function rotateFiles(dir){
  const {readdir, unlink} = fs.promises
  const _files = await readdir(dir)
  const files = _files.map(f=>path.join(dir,f)).sort()
  if(files.length < archiveFileCountLimit){
    console.log('Actual file count Less than limit ' + archiveFileCountLimit)
    return
  }
  const over = files.length - archiveFileCountLimit
  const removeTargets = files.splice(0, over)
  return Promise.all(removeTargets.map(unlink))
}
async function main(){
  const archiveFilepath = path.join(ARCHIVE_DIR, `${NOW}_messages.json`)
  const deployDir = param.deployDir
  const deleted = await archive(archiveFilepath)
  if(!deleted){
    return console.log('exit Archive target message is empty')
  }
  await deployArchiveFile(deployDir, archiveFilepath)
  await rotateFiles(deployDir)
}

main()
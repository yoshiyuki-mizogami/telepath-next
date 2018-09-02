import Dexie from 'dexie'

const db = new Dexie('telepath')
db.version(1).stores({
  favorites:'name,teams'
})

export default {
  getFavorites(){
    return db.favorites.toArray()
  },
  addFavorites(team){
    return db.favorites.add(team)
      .then(()=>team)
  },
  modifyFavorite(team){
    return db.favorites
      .put(team).then(()=>team)
  },
  removeFavorite(team){
    return db.favorites.where('name').equals(team.name).delete()
  }
}
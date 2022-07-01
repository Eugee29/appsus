import { storageService } from "../../../services/storage.service.js"
import { utilService } from "../../../services/util.service.js"

export const keepService = {
    query,
    getFromId,
    remove,
    saveKeep,
    bgcColor,
    fixYoutubeUrl,
}

const KEEP_STORAGE_KEY = 'keepBD'

const gKeeps = [
    {
        id: "n101",
        type: "note-txt",
        isPinned: true,
        title: "JS",
        content: "Hello",
        style: {
        backgroundColor: "#B22222",
        }
    },
    {
        id: "n102",
        type: "note-img",
        title: "Bobby and I",
        content: "https://wallpaperaccess.com/full/1331386.jpg",
        style: {
            backgroundColor: "#B0E0E6",
        }
    },
    {
        id: "n103",
        type: "note-todos",
        title: "todos",
        content: "to, do, an, hello",
        style: {
        backgroundColor: "#2E8B57",
        }
    }, 
       {
        id: "n104",
        type: "note-vid",
        title: "Funnies",
        content: "https://www.youtube.com/embed/4_ozS7X0zyw",
        style: {
        backgroundColor: "teal",
        }
    },
    {
        id: "n105",
        type: "note-txt",
        isPinned: true,
        title: "Hello",
        content: "Welcome to React",
        style: {
        backgroundColor: "#B22222",
        }
    },
    {
        id: "n106",
        type: "note-img",
        title: "From that time...",
        content: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0wd-TtnQms_MhwwwzlSKXIF-M28qp7ZblXg&usqp=CAU",
        style: {
            backgroundColor: "#ffffff",
        }
    },
    {
        id: "n107",
        type: "note-todos",
        title: "todos",
        content: "Hello, To, React, From, JS",
        style: {
        backgroundColor: "#ffffff",
        }
    }, 
       {
        id: "n108",
        type: "note-vid",
        title: "Witcher Logic",
        content: "https://www.youtube.com/embed/ldtZMgyPXmc",
        style: {
        backgroundColor: "#ffffff",
        }
    }, 
       {
        id: "n109",
        type: "note-todos",
        title: "ABCs",
        content: "a, b, c, d, e, f, g",
        style: {
        backgroundColor: "#ffffff",
        }
    }, 
       {
        id: "n110",
        type: "note-img",
        title: "Forest",
        content: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6g7pOfhliG4v6-s_xaTmTAjJyhXKe_g5JSg&usqp=CAU",
        style: {
        backgroundColor: "#ffffff",
        }
    }, 
       {
        id: "n111",
        type: "note-note",
        title: "Lorem",
        content: "Lorem Ipsum",
        style: {
        backgroundColor: "#ffffff",
        }
    }, 
       {
        id: "n112",
        type: "note-vid",
        title: "Witcher Logic",
        content: "https://www.youtube.com/embed/ldtZMgyPXmc",
        style: {
        backgroundColor: "#ffffff",
        }
    },
]

function query(filterBy) {

  let keeps = _loadFromStorage()

  if (!keeps) {
    keeps = gKeeps
    _saveToStorage(keeps)
  }


  if (filterBy !== 'all' && filterBy) {

    let type = filterBy
    keeps = keeps.filter(keep => {
      return keep.type === type
    })
  }

  return Promise.resolve(keeps)
}


function fixYoutubeUrl(Url){
    
    Url.replace('watch?v=', 'embed')
    const newUrl = Url.replace('watch?v=', 'embed/')
    return newUrl
}

function getFromId(id){
    const keeps = _loadFromStorage()
    const keep = keeps.find(keep => keep.id === id)
    return Promise.resolve(keep)
}

function remove(id) {
  let keeps = _loadFromStorage()
  keeps = keeps.filter(keep => keep.id !== id)
  _saveToStorage(keeps)

  return Promise.resolve()
}

function bgcColor(color, id) {
  let keeps = _loadFromStorage()
  let keep = keeps.find(keep => keep.id === id)
  keep.style.backgroundColor = color
  _saveToStorage(keeps)
  return Promise.resolve()
}

function saveKeep(keep) {

     _add(keep)
     return Promise.resolve()
}

function _add(keep){
    let keeps = _loadFromStorage()
    keeps = [keep, ... keeps]
    _saveToStorage(keeps)
    // return Promise.resolve()
}

function _saveToStorage(keeps) {
  storageService.saveToStorage(KEEP_STORAGE_KEY, keeps)
}

function _loadFromStorage() {
  return storageService.loadFromStorage(KEEP_STORAGE_KEY)
}
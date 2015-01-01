const window = require('global/window')
const document = require('global/document')

var items = {
  code: [
    'algorithms',
    'bash',
    'best-practices'
  ]
}

var list = document.createElement('section')

Object.keys(items).forEach(function(key) {

  var h2 = document.createElement('h2')
  h2.appendChild(document.createTextNode(key))
  list.appendChild(h2)

  var ul = document.createElement('ul')

  items[key].forEach(function(item) {
    var li = document.createElement('li')
    li.appendChild(document.createTextNode(item))
    ul.appendChild(li)
  })

  list.appendChild(ul)
})

document.querySelector('.nav-inner').appendChild(list)

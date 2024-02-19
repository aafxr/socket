import './style.css'

const ADDRESS = '127.0.0.1'
const PORT = 8000

let messages
let userID
let receiverID
let send
let $alert
let message
let list = []


document.addEventListener('DOMContentLoaded', () => {
  messages = document.querySelector('.messages')
  userID = document.querySelector('#userID') 
  receiverID = document.querySelector('#receiver') 
  send = document.querySelector('#send') 
  $alert = document.querySelector('.alert') 
  message = document.querySelector('#message') 

  let ws// = new WebSocket(`ws://${ADDRESS}:${PORT}/?user=${userID.innerText}`)


  send.addEventListener('click', async () => {
    const id = userID.value.trim()
    if(!id) showAlert('write your userID')
    if(!ws) {
      ws = await connect(ADDRESS, PORT, id).catch(() => ws = undefined)
      if(!ws) {
        showAlert('check connection')
        return
      }
    }

    sendMessage(ws, id, receiverID.value || 'all', message.value)
    addMessage(id, message.value, true)
    message.value = ''
  })
})


function sendMessage(socket, sender, receiver = 'all', msg = ''){
  socket.send(JSON.stringify({sender, receiver, msg}))
}


function connect(addres, port, userID){
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://${addres}:${port}/?user=${userID}`)

    ws.onerror = () => {
      showAlert('Socket Connection failed')
      reject()
    }

    ws.addEventListener('open', () => resolve(ws))

    ws.onclose = () => ws = undefined

    ws.onmessage = (e) => {
      try{
        list.push(JSON.parse(e.data))
      }catch(e){
        showAlert('unknow Message')
        console.error(e)
      }

      const m = list[list.length - 1]

      addMessage(m.user, m.msg, m.user === userID.value)

      // list.forEach(m => addMessage(m.user, m.msg, m.user === userID.value))
    }
  })
}


function showAlert(msg){
  $alert.innerText = msg
  if(!$alert.classList.contains('hidden')) 
    $alert.classList.remove('hidden')
}


function hideAlert(){
  $alert.classList.add('hidden')
}


function addMessage(from, msg, self = false){
  messages.innerHTML += `
            <li class="list-item mt-2">
              <div class="message ${self ? 'self': ''}">
                <div class="user">${from}</div>
                <div class="message-text">${msg}</div>
              </div>
            </li>
            `
}
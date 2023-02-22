import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

const maxlen = 200;
var his_log = localStorage.getItem('logs') ? JSON.parse(localStorage.getItem('logs')) : [];
var log_itm_df = {id: "", user: "",bot: ""},log_itm = log_itm_df;
/*
const loadLog = ()=> {
	// 展示记录
	for(var key in his_log) {
		chatContainer.innerHTML += chatStripe(false, his_log[key]['user'], his_log[key]['id']);
		chatContainer.innerHTML += chatStripe(true, his_log[key]['bot'], his_log[key]['id']);
	}
	// document.getElementById('addBtn').remove();
	setTimeout(()=>{
	  document.getElementById('chat_container').scrollTop = chatContainer.scrollHeight;
	},200)
}

if(his_log.length > 0) {
	loadLog();
	// var btn = `<button id="addBtn" class="btns">显示记录</button>`;
	// chatContainer.innerHTML += btn;
	// document.getElementById('addBtn').onclick = loadLog;
}
*/

function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if(element.textContent === '....') {
      element.textContent = '';
    }
  }, 300)
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if(index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
      document.getElementById('chat_container').scrollTop = chatContainer.scrollHeight;
  } else {
    clearInterval(interval);
  }
  }, 10)
}

function generateUniqueID() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  var str_user = `
      <div class="wrapper">
          <div class="chat">
              <div class="message" id=${uniqueId}>${value}</div>
              <div class="profile">
                  <img 
                    src="${user}" 
                    alt="user" 
                  />
              </div>
          </div>
      </div>
  `;
  var str_ai = `
      <div class="wrapper ai">
          <div class="chat">
              <div class="profile">
                  <img 
                    src="${bot}" 
                    alt="bot" 
                  />
              </div>
              <div class="message" id=${uniqueId}>${value}</div>
          </div>
      </div>
  `
  return (
    isAi ? str_ai : str_user
    /*
      `
      <div class="wrapper ${isAi && 'ai'}">
          <div class="chat">
              <div class="profile">
                  <img 
                    src="${isAi ? bot : user}" 
                    alt="${isAi ? 'bot' : 'user'}" 
                  />
              </div>
              <div class="message" id=${uniqueId}>${value}</div>
          </div>
      </div>
  `
  */
  )
}

const handleSubmit = async (e) => {
  e.preventDefault();
	
	// document.getElementById('addBtn') && document.getElementById('addBtn').remove();

  const data = new FormData(form);
  if(data.get('prompt') == "") {return false;}
	
  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));
	form.reset();

// bot's chat stripe
	const uniqueId = generateUniqueID()
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);
  setTimeout(()=>{
    document.getElementById('chat_container').scrollTop = chatContainer.scrollHeight;
    //chatContainer.scollTop = chatContainer.scrollHeight;
  },200)
	
	// save log, max 200 lim
	his_log = localStorage.getItem('logs') ? JSON.parse(localStorage.getItem('logs')) : [];
	log_itm['user'] = data.get('prompt');
	log_itm['id'] = uniqueId;
	
  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  // fetch data from the server

  //const response = await fetch('https://chatwithcodex.onrender.com/', {
  //const response = await fetch('https://chatgpt-t2dn.onrender.com/', {
const response = await fetch('https://openai-server-pu79.onrender.com/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if(response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

		
    typeText(messageDiv, parsedData);
		
		
		log_itm['bot'] = parsedData;
		// add to local
		if(his_log.length >= maxlen) {
			his_log.shift();
		}
		his_log.push(log_itm);
		localStorage.setItem('logs',JSON.stringify(his_log));
		log_itm = log_itm_df;
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong";

    alert(err);
  }
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
})

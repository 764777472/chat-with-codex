import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;


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

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  // fetch data from the server

  const response = await fetch('https://chatwithcodex.onrender.com/', {
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

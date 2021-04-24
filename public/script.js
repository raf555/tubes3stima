const send = document.querySelector('.send');
const chatArea = document.querySelector('.chat-area');
const textArea = document.querySelector('textarea');

       
send.addEventListener('click', ()=>{
    let input = textArea.value;

    let temp = `<div class="out-msg">
    <span class="my-msg">${input}</span>
    <div class="avatar"> <i class="material-icons"> account_circle </i></div>`;

    chatArea.insertAdjacentHTML("beforeend", temp);
    textArea.value = '';

})


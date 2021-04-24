$(document).ready(function() {
  const send = document.querySelector(".send");
  const chatArea = document.querySelector(".chat-area");
  const textArea = document.querySelector("textarea");

  /* key binding */
  $(textArea)
    .keydown(submit)
    .keypress(submit);

  /* event listener */
  $(send).on("click", sendmsg);

  function submit(event) {
    if (event.keyCode == 13 && !event.shiftKey) {
      sendmsg(event);
      event.preventDefault();
    }
  }

  function sendmsg(event) {
    let input = textArea.value;
    if (!input || input == ""){
      return;
    }

    
    let temp = `<div class="out-msg">
    <span class="my-msg">${input}</span>
    <div class="avatar"> <i class="material-icons"> account_circle </i></div>`;
    chatArea.insertAdjacentHTML("beforeend", temp);
    textArea.value = "";

    $.post(
      "/parsechat",
      {
        chat: input
      },
      function(res, status) {
        let temp2 = `<div class="income-msg">
            <img src="assets/botan.png" class="avatar" alt="">
            <span class="msg">${res.response}</span>
        </div>`;
        chatArea.insertAdjacentHTML("beforeend", temp2);
        $(chatArea).scrollTop(chatArea.scrollHeight);
      }
    );
  }
});

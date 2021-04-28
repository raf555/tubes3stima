$(document).ready(function() {
  const send = document.querySelector(".send");
  const chatArea = document.querySelector(".chat-area");
  const textArea = document.querySelector("textarea");
  const delhist = document.querySelector(".delhist");

  $(textArea).focus();

  /* history chat */
  if (localStorage.getItem("history") != null) {
    $(chatArea).html(localStorage.getItem("history"));
    $(chatArea).scrollTop(chatArea.scrollHeight);
  }

  /* key binding */
  $(textArea)
    .keydown(submit)
    .keypress(submit);

  /* event listener */
  $(send).on("click", sendmsg);
  $(delhist).on("click", removeHistory);
  $("#help a").on("click", demo);

  /* methods */
  function demo(event) {
    let idx = $(this).index();
    let text = "";
    switch (idx) {
      case 1:
        text =
          "Bot, tolong tambahin tubes IF2211 bikin chatbot nanti tanggal 28 april 2021";
        break;
      case 3:
        text = "Bot, ada tubes apa saja sejauh ini?";
        break;
      case 5:
        text = "Bot, ada deadline apa aja sejauh ini?";
        break;
      case 7:
        text = "Bot, deadline dari task 1 diundur jadi 29 april 2021";
        break;
      case 9:
        text = "Bot, task 1 sudah selesai";
        break;
      case 11:
        text = "Bot, kamu bisa ngapain aja?";
        break;
      case 13:
        text = "Bot, tolong hapus history chat";
        break;
      default:
        text = "";
    }
    if (text != "") {
      textArea.value = text;
      sendmsg();
    }
  }

  function removeHistory() {
    localStorage.removeItem("history");
    location.reload();
  }

  function submit(event) {
    if (event.keyCode == 13 && !event.shiftKey) {
      sendmsg(event);
      event.preventDefault();
    }
  }

  function sendmsg(event) {
    let input = textArea.value;

    if (!input || input == "") {
      return;
    }

    const removenewline = text => {
      return text.replace(/\n/g, "<br>");
    };

    let temp = `<div class="out-msg">
    <span class="my-msg">${removenewline(input)}</span>
    <img src="https://media-exp1.licdn.com/dms/image/C510BAQF29VPd4q7H9w/company-logo_200_200/0/1525360759270?e=2159024400&v=beta&t=2vZsqlINJsQHgU5a0I7hwURaHpvUedhdcwwJYuo-thI" class="avatar" alt="" />`;
    chatArea.insertAdjacentHTML("beforeend", temp);
    textArea.value = "";

    /* delete history chat */
    if (
      input.toLowerCase() == "clear" ||
      /(hapus|delete)\s(history|riwayat)\schat/gi.test(input)
    ) {
      removeHistory();
      return;
    }

    $.post(
      "/parsechat",
      {
        chat: input
      },
      function(res, status) {
        if (!Array.isArray(res.response)) {
          let temp2 = `<div class="income-msg">
            <img src="assets/botan.png" class="avatar" alt="">
            <span class="msg">${removenewline(res.response)}</span>
        </div>`;
          chatArea.insertAdjacentHTML("beforeend", temp2);
        } else {
          res.response.forEach(response => {
            let temp2 = `<div class="income-msg">
            <img src="assets/botan.png" class="avatar" alt="">
            <span class="msg">${removenewline(response)}</span>
        </div>`;
            chatArea.insertAdjacentHTML("beforeend", temp2);
          });
        }
        $(chatArea).scrollTop(chatArea.scrollHeight);
        localStorage.setItem("history", $(chatArea).html());
      }
    );
  }
});

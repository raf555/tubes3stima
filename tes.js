const express = require("express"),
  app = express.Router();

const katapenting = ["Kuis", "Ujian", "Tucil", "Tubes", "Praktikum"];

app.get("/chat", (req, res) => {
  res.sendStatus(200);
});

module.exports = app;

function parse(text) {
  text = text.toLowerCase()
  let task, kuliah, content, date;
  let regex, exec;
  /* getting task */
  for (let i in katapenting) {
    regex = new RegExp(katapenting[i], "gi");
    let match = text.match(regex);
    if (match != null) {
      task = katapenting[i];
    }
  }
  console.log("Task:", task);

  /* getting course */
  regex = new RegExp(task + "\\s(.+?)\\s", "gi"); /* [task]\s(.+?)\s */
  exec = regex.exec(text);
  if (exec) {
    kuliah = exec[1];
  }
  console.log("Course:", kuliah);

  /* getting content */
  regex = new RegExp(
    kuliah + "\\s(.+?)\\s(nanti|tanggal|tgl|pada|\\d\\d)",
    "gi"
  ); /* [kuliah]\s(.+?)\spada */
  exec = regex.exec(text);
  if (exec) {
    content = exec[1];
  }
  console.log("Content:", content);

  /* getting date */
  let bulan = [
    "januari",
    "februari",
    "maret",
    "april",
    "mei",
    "juni",
    "juli",
    "agustus",
    "september",
    "oktober",
    "november",
    "desember"
  ];
  let format1 = /\s(\d{2}|\d{1})\s(.+)\s(\d{4})/gi; /* tanggal bulan(str) tahun */
  let format2 = /\s(\d{2}|\d{1})\/(\d{2}|\d{1})\/(\d{4})/gi; /* DD/MM/YYYY */
  let format3 = /\s(\d{2}|\d{1})\s?-\s?(\d{2}|\d{1})\s?-\s?(\d{4})/gi; /* DD-MM-YYYY */

  exec = format1.exec(text);
  if (exec == null) {
    exec = format2.exec(text);
  }
  if (exec == null) {
    exec = format3.exec(text);
  }
  date = {
    tgl: exec[1],
    bln:
      (typeof exec[2] === "string"
        ? bulan.indexOf(exec[2].toLowerCase())
        : exec[2]) + 1,
    thn: exec[3]
  };
  console.log("Date:", JSON.stringify(date))

  return !!task && !!kuliah && !!content && !!date;
}

console.log(parse("Bot ingetin gw kl ada tubes oop tubes engimon keren 26 april 2021"));

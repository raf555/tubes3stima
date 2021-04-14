const express = require("express"),
  app = express.Router(),
  editJsonFile = require("edit-json-file"),
  chatjs = require("./chat.js");

app.get("/parsechat", (req, res) => {
  let chat = req.query.chat;
  let parsed = chatjs.parse(chat);

  if (parsed == null) {
    res.json({
      status: "error",
      response: "Maaf pesan tidak dikenali."
    });
  } else {
    let result = process(parsed);
    res.json(result);
  }
});

function process(parsed) {
  let status, response;
  const makedate = date => {
    // accept {tgl, bln, thn}
    let tgl = (date.tgl < 10 ? "0" : "") + date.tgl;
    let bln = (date.bln < 10 ? "0" : "") + date.bln;
    let thn = date.thn;

    return `${tgl}/${bln}/${thn}`;
  };
  let type = parsed.type;
  if (type == "add") {
    // add task type
    const taskdb = editJsonFile("db/task.json");
    let id = (Object.keys(taskdb.get()).length + 1).toString();
    let data = {
      tanggal: makedate(parsed.tanggal),
      kuliah: parsed.kuliah,
      jenis: parsed.task,
      topik: parsed.konten,
      selesai: false
    };
    taskdb.set(id, data);
    taskdb.save();

    status = "ok";
    response = `[TASK BERHASIL DICATAT]\n(ID: ${id}) ${data.tanggal} - ${data.kuliah} - ${data.jenis} - ${data.topik}`;
  } else if (type == "update") {
  } else if (type == "finish") {
  } else if (type == "fetch") {
  } else if (type == "find") {
  } else if (type == "help") {
  }

  return {
    status: status,
    response: response
  };
}

module.exports = app;

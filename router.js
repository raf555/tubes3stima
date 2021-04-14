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
  const taskdb = editJsonFile("db/task.json");
  let type = parsed.type;
  if (type == "add") {
    // add task type
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
    // update date
    let id = parsed.id;
    let newdate = parsed.newdate;
    let newdatestamp = new Date(
      `${newdate.bln}/${newdate.tgl}/${newdate.thn}`
    ).getTime();
    let indikator = parsed.indikator;

    let target = taskdb.get(id);

    if (!target) {
      status = "error";
      response = "Task dengan id " + id + " tidak ditemukan.";
    } else {
      let curdate = target.tanggal.split("/");
      curdate = new Date(`${curdate[1]}/${curdate[0]}/${curdate[2]}`).getTime();
      newdate = makedate(newdate);

      if (indikator == "diubah") {
        taskdb.set(id + ".tanggal", newdate);
        taskdb.save();
        status = "ok";
        response = "Task dengan id " + id + " berhasil diperbarui tanggalnya.";
      } else if (indikator == "diundur") {
        if (newdatestamp < curdate) {
          status = "error";
          response = "Tanggal tidak valid";
        } else {
          taskdb.set(id + ".tanggal", newdate);
          taskdb.save();
          status = "ok";
          response =
            "Task dengan id " + id + " berhasil diperbarui tanggalnya.";
        }
      } else if (indikator == "dimajuin") {
        if (newdatestamp > curdate) {
          status = "error";
          response = "Tanggal tidak valid";
        } else {
          taskdb.set(id + ".tanggal", newdate);
          taskdb.save();
          status = "ok";
          response =
            "Task dengan id " + id + " berhasil diperbarui tanggalnya.";
        }
      }
    }
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

function makedate(date) {
  // accept {tgl, bln, thn}
  let tgl = (date.tgl < 10 ? "0" : "") + date.tgl;
  let bln = (date.bln < 10 ? "0" : "") + date.bln;
  let thn = date.thn;

  return `${tgl}/${bln}/${thn}`;
}

module.exports = app;

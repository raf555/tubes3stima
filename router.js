const express = require("express"),
  app = express.Router(),
  editJsonFile = require("edit-json-file"),
  chatjs = require("./chat.js");

app.post("/parsechat", (req, res) => {
  let chat = req.body.chat;
  let err = false;
  let parsed;

  try {
    parsed = chatjs.parse(chat);
  } catch (e) {
    err = true;
  }

  if (!chat || err || !parsed) {
    res.json({
      status: "error",
      response: "Maaf pesan tidak dikenali."
    });
  } else {
    let result = process(parsed);
    res.json(result);
  }
});

/**
 * Memproses hasil parsing
 *
 * Mereturn responseobj
 *
 * {
 * status: {string},
 * response: {string}
 * }
 *
 * @param {string} text untuk di-parse.
 * @return {responseobj} status hasil proses teks
 */
function process(parsed) {
  let result;
  let type = parsed.type;
  if (type == "add") {
    result = add(parsed);
  } else if (type == "update") {
    result = update(parsed);
  } else if (type == "finish") {
  } else if (type == "fetch") {
  } else if (type == "find") {
  } else if (type == "help") {
  }

  return result;
}

/**
 * Mereturn responseobj hasil proses parsing untuk fitur tambah task
 *
 * @param {parseobj} parsed hasil parsing teks.
 * @return {responseobj} hasil proses
 */
function add(parsed) {
  const taskdb = editJsonFile("db/task.json");
  let result, status, response;
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

  result = {
    status: status,
    response: response
  };

  return result;
}

/**
 * Mereturn responseobj hasil proses parsing untuk fitur update tanggal
 *
 * @param {parseobj} parsed hasil parsing teks.
 * @return {responseobj} hasil proses
 */
function update(parsed) {
  const taskdb = editJsonFile("db/task.json");
  let result, status, response;

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

    let condition;
    if (indikator == "diundur") {
      condition = newdatestamp > curdate;
    } else if (indikator == "dimajuin") {
      condition = newdatestamp < curdate;
    } else if (indikator == "diubah" || indikator == "revisi") {
      condition = true;
    }
    if (!condition) {
      status = "error";
      response = "Tanggal tidak valid";
    } else {
      taskdb.set(id + ".tanggal", newdate);
      taskdb.save();
      status = "ok";
      response = "Task dengan id " + id + " berhasil diperbarui tanggalnya.";
    }
  }
  result = {
    status: status,
    response: response
  };

  return result;
}

/**
 * Mereturn string format tanggal
 *
 * @param {date} date untuk di-parse.
 * @return {string} tanggal
 */
function makedate(date) {
  // accept {tgl, bln, thn}
  let tgl = (date.tgl < 10 ? "0" : "") + date.tgl;
  let bln = (date.bln < 10 ? "0" : "") + date.bln;
  let thn = date.thn;

  return `${tgl}/${bln}/${thn}`;
}

module.exports = app;

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
    result = finish(parsed);
  } else if (type == "fetch") {
    result = fetch(parsed);
  } else if (type == "find") {
  } else if (type == "help") {
    result = help(parsed)
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

function fetch(parsed) {
  const taskdb = editJsonFile("db/task.json");
  const x = json.parse("db/task.json");
  
  let result, status, response;

  let filter = parsed.jenis;
  let tipefetch = parsed.tipefetch;

  // if (tipefetch == "all") {

  // } else if (tipefetch == "incr") {

  // } else if (tipefetch == "range") {

  // }
  result = {
    status : "ok",
    response: "anjay"
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

/**
 * Mereturn responseobj hasil proses parsing untuk fitur finish task
 *
 * @param {parseobj} parsed hasil parsing teks.
 * @return {responseobj} hasil proses
 */
function finish(parsed){
  const taskdb = editJsonFile("db/task.json");
  let result, status, response;

  // update fi
  let id = parsed.id;
 
  let target = taskdb.get(id);

  if (!target) {
    status = "error";
    response = "Maaf, Task dengan id " + id + " tidak ditemukan.";
  }
  else{
    let condition;
    if(target.selesai == false){
      condition = true;
    }
    else condition = false;

    if (!condition) {
      status = "error";
      response = "Maaf, Task dengan id " + id + " sudah pernah diselesaikan sebelumnya";
    } else {
      taskdb.set(id + ".selesai", true);
      taskdb.save();
      status = "ok";
      response = "Berhasil! Task dengan id " + id + " selesai dikerjakan";
    }
  }
  result = {
    status: status,
    response: response
  };

  return result;
}

/**
 * Mereturn responseobj hasil proses parsing untuk fitur help
 *
 * @param {parseobj} parsed hasil parsing teks.
 * @return {responseobj} hasil proses
 */

function help(parsed){
  let fitur = '[Fitur]<br>';
  for (let index = 0; index < parsed.fitur.length; index++) fitur+='  '+(index+1)+'. '+parsed.fitur[index]+'<br>';
  let penting = '[Daftar Kata Penting]<br>';
  for (let index = 0; index < parsed.katapenting.length; index++) penting+='  '+(index+1)+'. '+parsed.katapenting[index]+'<br>';
  let resp = fitur + penting;
  let result = {
    status : "ok",
    response : resp
  }
  return result;
}

module.exports = app;

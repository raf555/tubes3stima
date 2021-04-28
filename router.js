const express = require("express"),
  app = express.Router(),
  editJsonFile = require("edit-json-file"),
  chatjs = require("./chat.js");

app.post("/parsechat", (req, res) => {
  let chat = req.body.chat;
  let err = false;
  let parsed;

  let sim = chatjs.similarity(chat);
  if (sim.length > 0) {
    res.json(similarity(sim, chat));
  } else {
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
 * @param {parseobj} hasil parsing teks.
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
    result = find(parsed);
  } else if (type == "help") {
    result = help(parsed);
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
    let curdatestamp = new Date(
      `${curdate[1]}/${curdate[0]}/${curdate[2]}`
    ).getTime();

    let condition;
    if (indikator == "diundur") {
      condition = newdatestamp > curdatestamp;
    } else if (indikator == "dimajuin") {
      condition = newdatestamp < curdatestamp;
    } else if (indikator == "diubah" || indikator == "revisi") {
      condition = true;
    }
    if (!condition) {
      status = "error";
      response = "Tanggal tidak valid";
    } else {
      if (taskdb.get(id).selesai){
        status = "error";
        response = "Task dengan id " + id + " sudah selesai, tidak dapat memperbarui tanggal."
      /*} else if (curdatestamp < (new Date()).getTime()){
        status = "error";
        response = "Task dengan id " + id + " sudah lewat deadline-nya, tidak dapat memperbarui tanggal."*/
      } else {
        let olddate = taskdb.get(id).tanggal;
        newdate = makedate(newdate);

        taskdb.set(id + ".tanggal", newdate);
        taskdb.save();
        status = "ok";
        response = "Task dengan id " + id + " berhasil diperbarui tanggalnya.";
        response += "\n" + olddate + " -> " + newdate;
      }
    }
  }
  result = {
    status: status,
    response: response
  };

  return result;
}

/**
 * Mereturn responseobj hasil proses parsing untuk fitur fetch task
 *
 * @param {parseobj} parsed hasil parsing teks.
 * @return {responseobj} hasil proses
 */
function fetch(parsed) {
  let result;
  let rangeawal, rangeakhir;

  let filter = parsed.jenis;
  let tipefetch = parsed.tipefetch;

  if (tipefetch == "all") {
    result = fetchtask(filter);
  } else if (tipefetch == "incr") {
    let curdate = new Date();
    curdate = {
      tgl: curdate.getDate(),
      bln: curdate.getMonth() + 1,
      thn: curdate.getFullYear()
    };
    rangeawal = makedate(curdate);

    let lastdate = new Date();
    lastdate.setDate(lastdate.getDate() + parsed.incr);
    lastdate = {
      tgl: lastdate.getDate(),
      bln: lastdate.getMonth() + 1,
      thn: lastdate.getFullYear()
    };
    rangeakhir = makedate(lastdate);

    result = fetchtaskrange(filter, rangeawal, rangeakhir);
  } else if (tipefetch == "range") {
    rangeawal = makedate(parsed.range0);
    rangeakhir = makedate(parsed.range1);
    result = fetchtaskrange(filter, rangeawal, rangeakhir);
  }

  return result;
}

/**
 * fetch task tanpa range
 *
 * @param {string} filter
 * @return {responseobj}
 */
function fetchtask(filter) {
  const taskdb = editJsonFile("db/task.json");
  const id = Object.keys(taskdb.get());

  let curdate;
  let result;
  let string;

  // buat response
  string = "[DAFTAR DEADLINE]\n";

  // buat tanggal sekarang
  curdate = new Date();
  curdate = new Date(
    `${curdate.getMonth() + 1}/${curdate.getDate()}/${curdate.getFullYear()}`
  ).getTime();

  // filter task.json
  if (filter == "semua") {
    for (let i in id) {
      let taskdate = taskdb.get(id[i] + ".tanggal").split("/");
      taskdate = new Date(
        `${taskdate[1]}/${taskdate[0]}/${taskdate[2]}`
      ).getTime();

      // task belum selesai
      let masuklist = taskdb.get(id[i] + ".selesai") == false;

      if (masuklist) {
        let tempdate = taskdb.get(id[i] + ".tanggal");
        let tempcode = taskdb.get(id[i] + ".kuliah");
        let temptype = taskdb.get(id[i] + ".jenis");
        let tempdesc = taskdb.get(id[i] + ".topik");
        let list = `(ID: ${id[i]}) - ${tempdate} - ${tempcode} - ${temptype} - ${tempdesc}`;

        // cek jika task sudah overdue
        if (taskdate < curdate) {
          list = list + " - OVERDUE";
        }
        list = list + "\n";
        string = string + list;
      }
    }
  } else {
    for (let i in id) {
      let taskdate = taskdb.get(id[i] + ".tanggal").split("/");
      taskdate = new Date(
        `${taskdate[1]}/${taskdate[0]}/${taskdate[2]}`
      ).getTime();

      // task belum selesai dan sesuai jenis
      let masuklist =
        taskdb.get(id[i] + ".selesai") == false &&
        taskdb.get(id[i] + ".jenis") == filter;

      if (masuklist) {
        let tempdate = taskdb.get(id[i] + ".tanggal");
        let tempcode = taskdb.get(id[i] + ".kuliah");
        let temptype = taskdb.get(id[i] + ".jenis");
        let tempdesc = taskdb.get(id[i] + ".topik");
        let list = `(ID: ${id[i]}) - ${tempdate} - ${tempcode} - ${temptype} - ${tempdesc}`;

        // cek jika task sudah overdue
        if (taskdate < curdate) {
          list = list + " - OVERDUE";
        }
        list = list + "\n";
        string = string + list;
      }
    }
  }

  // cek jika ada hasil
  if (string != "[DAFTAR DEADLINE]\n") {
    result = {
      status: "ok",
      response: string
    };
  } else {
    result = {
      status: "error",
      response: "Tidak ada hasil yang ditemukan."
    };
  }

  return result;
}

/**
 * fetch task dengan range
 *
 * @param {string} filter
 * @param {string} rangeawal
 * @param {string} rangeakhir
 * @returns {responseobj} result
 */
function fetchtaskrange(filter, rangeawal, rangeakhir) {
  const taskdb = editJsonFile("db/task.json");
  const id = Object.keys(taskdb.get());

  let curdate, firstdate, lastdate;
  let result;
  let string;

  // buat response
  string = "[DAFTAR DEADLINE]\n";

  // buat batas tanggal awal
  rangeawal = rangeawal.split("/");
  firstdate = new Date(
    `${rangeawal[1]}/${rangeawal[0]}/${rangeawal[2]}`
  ).getTime();

  // buat tanggal sekarang
  curdate = new Date();
  curdate = new Date(
    `${curdate.getMonth() + 1}/${curdate.getDate()}/${curdate.getFullYear()}`
  ).getTime();

  // buat batas tanggal akhir
  rangeakhir = rangeakhir.split("/");
  lastdate = new Date(
    `${rangeakhir[1]}/${rangeakhir[0]}/${rangeakhir[2]}`
  ).getTime();

  // filter task.json
  if (filter == "semua") {
    for (let i in id) {
      let taskdate = taskdb.get(id[i] + ".tanggal").split("/");
      taskdate = new Date(
        `${taskdate[1]}/${taskdate[0]}/${taskdate[2]}`
      ).getTime();

      // task belum selesai
      let masuklist1 = taskdb.get(id[i] + ".selesai") == false;
      // task masuk range tanggal
      let masuklist2 = firstdate <= taskdate && taskdate <= lastdate;

      if (masuklist1 && masuklist2) {
        let tempdate = taskdb.get(id[i] + ".tanggal");
        let tempcode = taskdb.get(id[i] + ".kuliah");
        let temptype = taskdb.get(id[i] + ".jenis");
        let tempdesc = taskdb.get(id[i] + ".topik");
        let list = `(ID: ${id[i]}) - ${tempdate} - ${tempcode} - ${temptype} - ${tempdesc}`;

        // cek jika task sudah overdue
        if (taskdate < curdate) {
          list = list + " - OVERDUE";
        }
        list = list + "\n";
        string = string + list;
      }
    }
  } else {
    for (let i in id) {
      let taskdate = taskdb.get(id[i] + ".tanggal").split("/");
      taskdate = new Date(
        `${taskdate[1]}/${taskdate[0]}/${taskdate[2]}`
      ).getTime();

      // task belum selesai dan sesuai jenis
      let masuklist1 =
        taskdb.get(id[i] + ".selesai") == false &&
        taskdb.get(id[i] + ".jenis") == filter;
      // task masuk range tanggal
      let masuklist2 = firstdate <= taskdate && taskdate <= lastdate;

      if (masuklist1 && masuklist2) {
        let tempdate = taskdb.get(id[i] + ".tanggal");
        let tempcode = taskdb.get(id[i] + ".kuliah");
        let temptype = taskdb.get(id[i] + ".jenis");
        let tempdesc = taskdb.get(id[i] + ".topik");
        let list = `(ID: ${id[i]}) - ${tempdate} - ${tempcode} - ${temptype} - ${tempdesc}`;

        // cek jika task sudah overdue
        if (taskdate < curdate) {
          list = list + " - OVERDUE";
        }
        list = list + "\n";
        string = string + list;
      }
    }
  }

  // cek jika ada hasil
  if (string != "[DAFTAR DEADLINE]\n") {
    result = {
      status: "ok",
      response: string
    };
  } else {
    result = {
      status: "error",
      response: "Tidak ada hasil yang ditemukan."
    };
  }

  return result;
}

/**
 * Mereturn responseobj hasil proses parsing untuk fitur find task
 *
 * @param {parseobj} parsed hasil parsing teks.
 * @return {responseobj} hasil proses
 */
function find(parsed) {
  const taskdb = editJsonFile("db/task.json");
  const id = Object.keys(taskdb.get());
  let result, status, response;

  for (let i in id) {
    let condition =
      taskdb.get(id[i] + ".jenis") == parsed.task &&
      taskdb.get(id[i] + ".kuliah") == parsed.kuliah;
    if (condition) {
      status = "ok";
      response = taskdb.get(id[i] + ".tanggal");
      break;
    }
  }

  result = {
    status: status ? status : "error",
    response: response ? response : "Tidak ada hasil yang ditemukan."
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
function finish(parsed) {
  const taskdb = editJsonFile("db/task.json");
  let result, status, response;

  // update fi
  let id = parsed.id;

  if (id == -1)
    return {
      status: "error",
      response: "Maaf, Anda belum mendefinisikan id task"
    };
  let target = taskdb.get(id);

  if (!target) {
    status = "error";
    response = "Maaf, Task dengan id " + id + " tidak ditemukan.";
  } else {
    let condition;
    if (target.selesai == false) {
      condition = true;
    } else condition = false;

    if (!condition) {
      status = "error";
      response =
        "Maaf, Task dengan id " + id + " sudah pernah diselesaikan sebelumnya";
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

function help(parsed) {
  let fitur = "[Fitur]<br>";
  if (parsed.fitur.length == 1) fitur += parsed.fitur[0] + "<br>";
  else for (let index = 0; index < parsed.fitur.length; index++)
    fitur += "  " + (index + 1) + ". " + parsed.fitur[index] + "<br>";
  fitur +="<br>";
  let penting = "[Daftar Kata Penting]<br>";
  for (let index = 0; index < parsed.katapenting.length; index++)
    penting += "  " + (index + 1) + ". " + parsed.katapenting[index] + "<br>";
  let resp = fitur + penting;
  let result = {
    status: "ok",
    response: resp
  };
  return result;
}

/**
 * Mereturn responseobj hasil proses parsing untuk handle similarity
 *
 * @param {array} sim, hasil fungsi chatjs.similarity
 * @return {responseobj} hasil proses
 */
function similarity(sim, chat) {
  for (let i in sim) {
    let word = sim[i].word;
    let rec = sim[i].recommended;
    chat = chat.replace(new RegExp(word, "gi"),`<b title="${rec}">${word}</b>`);
  }
  return {
    status: "ok",
    response: chat+"\n\nApakah maksud kamu " + sim[0].recommended + " ?"
  };
}

module.exports = app;

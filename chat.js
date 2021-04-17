const editJsonFile = require("edit-json-file");
const worddb = editJsonFile("db/word.json");

/**
 * Export attribut and method
 */
module.exports = {
  /* attr */
  jenis: worddb.get("jenis"), // jenis tugas
  kataupdate: worddb.get("update"), // kata penting fitur update
  katahelp: worddb.get("help"), // keyword fitur help
  katafitur: worddb.get("fitur"), // fitur bot
  /* method */
  parse: text => {
    let _this = module.exports;
    let parsefunc = [
      _this.parse1, // add
      _this.parse4, // update
      _this.parse5, // finish
      _this.parse2, // fetch
      _this.parse3, // find
      _this.parse6 // help
    ];
    let i = 0;
    let parsed = null;

    while (parsed == null && i < 6) {
      parsed = parsefunc[i](text);
      i++;
    }

    return parsed;
  },
  parse1: parse1,
  parse2: parse2,
  parse3: parse3,
  parse4: parse4,
  parse5: parse5,
  parse6: parse6
};

/**
 * Mengembalikan array of date
 * **asumsi format seluruh tanggal pada teks adalah sama**
 *
 * date{tgl: {int}, bln: {int}, thn: {int}}
 *
 * @param {string} text untuk di-parse.
 * @return {date} array of date yang diekstrak dari teks
 */
function getdate(text) {
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
  let exec,
    type,
    date = null;
  let format1 = /(\d{2}|\d{1})\s(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s(\d{4})/gi; /* tanggal bulan(str) tahun */
  let format2 = /(\d{2}|\d{1})\/(\d{2}|\d{1})\/(\d{4})/gi; /* DD/MM/YYYY */
  let format3 = /(\d{2}|\d{1})\s?-\s?(\d{2}|\d{1})\s?-\s?(\d{4})/gi; /* DD-MM-YYYY */

  type = 1;
  exec = format1.exec(text);
  if (exec == null) {
    type = 2;
    exec = format2.exec(text);
  }
  if (exec == null) {
    type = 3;
    exec = format3.exec(text);
  }

  if (exec != null) {
    let tgl, bln, thn, format;
    date = [];

    tgl = parseInt(exec[1]);
    bln = isNaN(exec[2])
      ? bulan.indexOf(exec[2].toLowerCase()) + 1
      : parseInt(exec[2]);
    thn = parseInt(exec[3]);

    format = `${bln}/${tgl}/${thn}`;

    if (new Date(format) != "Invalid Date") {
      date.push({
        tgl: tgl,
        bln: bln,
        thn: thn
      });
    }

    let reg = [format1, format2, format3];
    let exec2;

    while ((exec2 = reg[type - 1].exec(text)) !== null) {
      tgl = parseInt(exec2[1]);
      bln = isNaN(exec2[2])
        ? bulan.indexOf(exec2[2].toLowerCase()) + 1
        : parseInt(exec2[2]);
      thn = parseInt(exec2[3]);
      format = `${bln}/${tgl}/${thn}`;

      if (new Date(format) != "Invalid Date") {
        date.push({
          tgl: tgl,
          bln: bln,
          thn: thn
        });
      }
    }
  }

  return date.length > 0 ? date : null;
}

/**
 * Mengembalikan parseobj
 * parse object
 * {
    type: {string},
    task: {string},
    kuliah: {string},
    konten: {string},
    tanggal: {date}
  }
 * 
 * @param {string} text untuk di-parse.
 * @return {parseobj} hasil parsing berupa object
 */
function parse1(text) {
  /* add task ke db */

  let task, kuliah, content, date;
  let regex, exec;
  const jenis = module.exports.jenis;

  /* getting task */
  /* ini bisa diganti pake string matching kmp / bm kl udh jadi */
  for (let i in jenis) {
    let match = bmSearch(text, jenis[i]);
    if (match != -1) {
      task = jenis[i];
      break;
    }
  }

  /* getting course */
  regex = new RegExp(task + "\\s(.+?)\\s", "gi"); /* [task]\s(.+?)\s */
  exec = regex.exec(text);
  if (exec) {
    kuliah = exec[1];
  }

  /* getting content */
  regex = new RegExp(
    kuliah + "\\s(.+?)\\s(nanti|tanggal|tgl|pada|\\s|\\d\\d)+",
    "gi"
  ); /* [kuliah]\s(.+?)\s(nanti|tanggal|tgl|pada|\d\d)\s */
  exec = regex.exec(text);
  if (exec) {
    content = exec[1];
  }

  /* getting date */
  date = getdate(text);

  if (date != null) {
    date = date[0];
  }

  let out = {
    type: "add",
    task: task,
    kuliah: kuliah,
    konten: content,
    tanggal: date
  };

  return !!task && !!kuliah && !!content && !!date ? out : null;
}

function parse2(text) {
  /* fetch data (full, time range, task) */
}

function parse3(text) {
  /* find data untuk suatu kuliah */
}

/**
 * Mengembalikan parseobj
 * parse object
 * {
    type: {string},
    id: {string},
    newdate: {string},
    indikator: {string}
  }
 * 
 * @param {string} text untuk di-parse.
 * @return {parseobj} hasil parsing berupa object
 */
function parse4(text) {
  /* update tanggal */

  const keyword = module.exports.kataupdate;
  let deadlineexist, indikator, id, date;
  let result;
  let regex, exec;

  /* checking keyword */
  /* ini bisa diganti pake string matching kmp / bm kl udh jadi */
  for (let i in keyword) {
    let match = bmSearch(text, keyword[i]);
    if (match != -1) {
      if (keyword[i] == "deadline") {
        deadlineexist = true;
      } else {
        indikator = keyword[i];
      }
    }
  }

  if (!deadlineexist || !indikator) {
    return null;
  }

  regex = /task\s(\d+)\s/gi;
  exec = regex.exec(text);

  if (exec != null) {
    id = exec[1];
  }

  date = getdate(text);

  if (!id || !date) {
    return null;
  }

  date = date[0];

  return {
    type: "update",
    id: id,
    newdate: date,
    indikator: indikator
  };
}

function parse5(text) {
  /* update selesai */
}

function parse6(text) {
  /* help */
  const kword = module.exports.katahelp;
  let katakey = module.exports.jenis;
  for (let i in kword) {
    if (bmSearch(text, kword[i]) != -1) {
      return {
        type: "help",
        fitur: module.exports.katafitur,
        katapenting: katakey.concat(module.exports.kataupdate, kword)
      };
    }
  }
}

function bmSearch(text, pattern) {
  // Boyer - Moore string matching, masi ver. kuliah modified dikit
  // non case-sensitive search - convert all to lowercase
  let ltext = text.toLowerCase();
  let lpat = pattern.toLowerCase();

  if (lpat.length > ltext.length) {
    return -1; // not found if pattern.len - 1 > text.len
  }

  let txtidx = lpat.length - 1; // set current text index ke idx terakhir pattern
  let patidx = lpat.length - 1; // current pattern index

  // find last occurence idx of char in pattern
  let lastOcc = Array(128).fill(-1); // semacam dict untuk setiap char,value = index kemunculan terakhir pada pattern. ASCII Table len = 128
  for (let index = 0; index < lpat.length; index++) {
    lastOcc[lpat.charCodeAt(index)] = index; // set/update index muncul terakhir dari setiap char pada pattern
  }

  // Compare char by char
  while (txtidx <= ltext.length - 1) {
    if (lpat.charCodeAt(patidx) != ltext.charCodeAt(txtidx)) {
      // mismatch -> char jump
      // shifting current text index
      if (lastOcc[ltext.charCodeAt(txtidx)] + 1 < patidx) {
        // case 1 & 3 : lastOcc dikiri current pattern index atau not found
        txtidx += lpat.length - (lastOcc[ltext.charCodeAt(txtidx)] + 1);
      } else {
        // case 2 : lastOcc dikanan current pattern index
        txtidx += lpat.length - patidx;
      }

      patidx = lpat.length - 1; // shift current pattern index ke char terakhir pada pattern
    } else {
      if (patidx == 0) {
        // found
        return txtidx;
      }
      // looking glass - moving backward dari akhir string pattern
      txtidx--;
      patidx--;
    }
  }

  return -1; // not found
}

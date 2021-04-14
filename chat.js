const editJsonFile = require("edit-json-file");
const worddb = editJsonFile("db/word.json");

module.exports = {
  /* attr */
  jenis: worddb.get("jenis"), // jenis tugas
  katapenting: worddb.get("penting"), // kata penting seperti deadline, dll

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
    date = [
      {
        tgl: parseInt(exec[1]),
        bln: isNaN(exec[2])
          ? bulan.indexOf(exec[2].toLowerCase()) + 1
          : parseInt(exec[2]),
        thn: parseInt(exec[3])
      }
    ];

    let reg = [format1, format2, format3];
    let exec2;

    while ((exec2 = reg[type - 1].exec(text)) !== null) {
      date.push({
        tgl: parseInt(exec2[1]),
        bln: isNaN(exec2[2])
          ? bulan.indexOf(exec2[2].toLowerCase()) + 1
          : parseInt(exec2[2]),
        thn: parseInt(exec2[3])
      });
    }
  }
  return date;
}

function parse1(text) {
  /* add task ke db */

  let task, kuliah, content, date;
  let regex, exec;
  const jenis = module.exports.jenis;

  /* getting task */
  /* ini bisa diganti pake string matching kmp / bm */
  for (let i in jenis) {
    regex = new RegExp(jenis[i], "gi");
    let match = text.match(regex);
    if (match != null) {
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

function parse4(text) {
  /* update tanggal */
}

function parse5(text) {
  /* update selesai */
}

function parse6(text) {
  /* help */
}

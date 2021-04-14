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
      _this.parse1,
      _this.parse2,
      _this.parse3,
      _this.parse4,
      _this.parse5,
      _this.parse6
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
    date = null;
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

  if (exec != null) {
    date = {
      tgl: parseInt(exec[1]),
      bln: isNaN(exec[2])
        ? bulan.indexOf(exec[2].toLowerCase()) + 1
        : parseInt(exec[2]),
      thn: parseInt(exec[3])
    };
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
  /* fetch data (full, time range, task) */
}

function parse4(text) {
  /* find data untuk suatu kuliah */
}

function parse5(text) {
  /* update tanggal */
}

function parse6(text) {
  /* update selesai */
}

function parse7(text) {
  /* help */
}

const editJsonFile = require("edit-json-file");
const worddb = editJsonFile("db/word.json");

/**
 * Export attribut and method
 */
module.exports = {
  /* attr */
  jenis: worddb.get("jenis"), // jenis tugas
  katafetch: worddb.get("fetch"),
  kataupdate: worddb.get("update"), // kata penting fitur update
  katahelp: worddb.get("help"), // keyword fitur help
  katafitur: worddb.get("fitur"), // fitur bot
  katafinish: worddb.get("finish"),
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
  parse6: parse6,
  similarity: similarity
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

  if (date != null) return date.length > 0 ? date : null;
  else return null;
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

/**
 * Mengembalikan parseobj
 * parse object
 * {
    type: {string},
    jenis: {string},
    rangeawal: {string},
    rangeakhir: {string}
  }
 * 
 * @param {string} text untuk di-parse.
 * @return {parseobj} hasil parsing berupa object
 */
function parse2(text) {
  /* fetch data (full, time range, task) */

  const keyword = module.exports.katafetch;
  const keyjenis = module.exports.jenis;
  let tipe, jenis;

  /* getting jenis */
  for (let i in keyjenis) {
    let match = bmSearch(text, keyjenis[i]);
    if (match != -1) {
      jenis = keyjenis[i];
      break;
    }
  }

  /* getting tipe fetch */
  for (let i in keyword) {
    let match = bmSearch(text, keyword[i]);
    if (match != -1) {
      /* cek jika jenisnya semua */
      if (match == "deadline") {
        if (jenis == null) {
          jenis = "semua";
        }
        continue;
      }

      tipe = keyword[i];
      break;
    }
  }

  /* return checker sejauh ini */
  if (tipe == "sejauh ini") {
    let out = {
      type: "fetch",
      jenis: jenis,
      tipefetch: "all"
    };
    return !!jenis ? out : null;
  }

  /* return checker hari ini */
  if (tipe == "hari ini") {
    let date = new Date();
    date = date.setDate();
    let out = {
      type: "fetch",
      jenis: jenis,
      tipefetch: "incr",
      incr: 0
    };
    return !!jenis ? out : null;
  }

  /* return checker N hari ke depan */
  if (tipe == "hari ke depan") {
    let N;
    let regex = new RegExp("\\s(\\d|\\d\\d)\\shari\\ske\\sdepan");
    let exec = regex.exec(text);
    if (exec == null) {
      return null;
    }
    N = exec[1];
    let out = {
      type: "fetch",
      jenis: jenis,
      tipefetch: "incr",
      incr: parseInt(N, 10)
    };
    return !!jenis ? out : null;
  }

  /* return checker N minggu ke depan */
  if (tipe == "minggu ke depan") {
    let N;
    let regex = new RegExp("\\s(\\d|\\d\\d)\\sminggu\\ske\\sdepan");
    let exec = regex.exec(text);
    if (exec == null) {
      return null;
    }
    N = exec[1];
    let out = {
      type: "fetch",
      jenis: jenis,
      tipefetch: "incr",
      incr: parseInt(N * 7, 10)
    };
    return !!jenis ? out : null;
  }

  /* return checker antara DATE_1 dan DATE_2 */
  if (tipe == "antara") {
    let date = getdate(text);
    if (date == null) {
      return null;
    }
    let out = {
      type: "fetch",
      jenis: jenis,
      tipefetch: "range",
      range0: date[0],
      range1: date[1]
    };
    return !!jenis ? out : null;
  }

  /* else */
  return null;
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
/**
 * Mengembalikan parseobj
 * parse object
 * {
    type: {string},
    id : {string}
  }
 * 
 * @param {string} text untuk di-parse.
 * @return {parseobj} hasil parsing berupa object
 */
function parse5(text) {
  /* update selesai - finish */
  const keyword = module.exports.katafinish;
  let updatefinish, id;
  let regex, exec;

  /* checking keyword */
  /* ini bisa diganti pake string matching kmp / bm kl udh jadi */
  for (let i in keyword) {
    let match = bmSearch(text, keyword[i]);
    if (match != -1) {
      updatefinish = true;
    }
  }
  regex = /task\s(\d+)/gi;
  exec = regex.exec(text);

  if (exec != null) {
    id = exec[1];
  }

  if (!updatefinish) {
    return null;
  }
  
  if(exec==null){
    return {
      type:"finish",
      id: -1
    }
  }

  return {
    type: "finish",
    id: id
  };
}
/**
 * Mengembalikan parseobj
 * parse object
 * {
    type: {string},
    fitur : {array of string}
    katapenting : {array of string}
  }
 * 
 * @param {string} text untuk di-parse.
 * @return {parseobj} hasil parsing berupa object
 */
function parse6(text) {
  /* help */
  const katahelp = module.exports.katahelp;
  for (let i in katahelp) {
    if (bmSearch(text, katahelp[i]) != -1) {
      let katakey = module.exports.jenis.concat(
        module.exports.kataupdate,
        katahelp,
        module.exports.katafetch,
        module.exports.katafinish
      );
      katakey.sort();
      return {
        type: "help",
        fitur: module.exports.katafitur,
        katapenting: katakey
      };
    }
  }
}
/**
 * Boyer-Moore String Matching Algorithm
 *
 * @param {string} text string input
 * @param {string} pattern pattern untuk dicek apakah berada dalam text
 * @return {int} index kemunculan pertama pattern pada text atau -1 jika tidak ditemukan
 */
function bmSearch(text, pattern) {
  // Boyer - Moore string matching - backward searching
  // non case-sensitive search - convert all to lowercase
  let ltext = text.toLowerCase();
  let lpat = pattern.toLowerCase();

  if (lpat.length > ltext.length) {
    return -1; // not found if pattern.len  > text.len
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
/**
 * Knuth-Morris-Pratt String Matching Algorithm
 *
 * @param {string} text string input
 * @param {string} pattern pattern untuk dicek apakah berada dalam text
 * @return {int} index kemunculan pertama pattern pada text atau -1 jika tidak ditemukan
 */
function kmpSearch(text, pattern) {
  // Knuth-Morris-Pratt string matching - forward searching
  // non case-sensitive search - convert all to lowercase
  let ltext = text.toLowerCase();
  let lpat = pattern.toLowerCase();

  if (lpat.length > ltext.length) {
    return -1; // not found if pattern.len  > text.len
  }
  // find Failure Function
  // F[j] = length of longest possible prefix of Pattern that is a suffix of Pattern[i..j]
  let F = Array(lpat.length); // Failure func
  // i, j pattern index (untuk dicocokkan char pada index tersebut)
  let i = 1;
  let j = 0;
  while (i < lpat.length) {
    if (lpat.charCodeAt(i) == lpat.charCodeAt(j)) {
      // match
      F[i] = j + 1;
      i++;
      j++;
    } else {
      // prefix length count interrupted (ada mismatch)

      if (j > 0) j = F[j - 1];
      else {
        F[i] = 0;
        i++;
      }
    }
  }

  // Find pattern starting index at text
  let txtidx = 0; // text index
  let patidx = 0; // pattern index
  while (txtidx < ltext.length) {
    // Compare char by char
    if (ltext.charCodeAt(txtidx) == lpat.charCodeAt(patidx)) {
      if (patidx == lpat.length - 1) return txtidx + 1 - lpat.length; // found, mencapai akhir string pattern
      txtidx++;
      patidx++;
    } else {
      // mismatch
      if (patidx > 0) patidx = F[patidx - 1];
      else txtidx++;
    }
  }

  return -1; // not found
}
/**
 * Levenshtein distance algorithm
 *
 * @param {string} text string input
 * @param {string} pattern pattern untuk dicek distance nya dengan text
 * @return {int} banyak char mismatch untuk menyamakan text dengan pattern
 */
function Levenshtein(text, pattern) {
  let ltext = text.toLowerCase();
  let lpat = pattern.toLowerCase();
  // case empty string
  if (ltext.length == 0) return lpat.length;
  if (lpat.length == 0) return ltext.length;
  let d = Array(ltext.length + 1)
    .fill(null)
    .map(() => Array(lpat.length + 1).fill(0)); // DP matrix of integer - indikator banyak char mismatch sejauh subproblem pada index i,j
  for (let index = 0; index < ltext.length + 1; index++) d[index][0] = index;
  for (let index = 0; index < lpat.length + 1; index++) d[0][index] = index;

  // Iterate tiap char
  for (let i = 1; i < ltext.length + 1; i++) {
    for (let j = 1; j < lpat.length + 1; j++) {
      let match = ltext.charCodeAt(i - 1) == lpat.charCodeAt(j - 1) ? 0 : 1; // match = indikator char match
      // find minimum dari hasil matching subproblem yang dilakukan sebelumnya
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + match
      );
    }
  }
  return d[ltext.length][lpat.length]; // final sol
}
/**
 * compute similarity antara text dengan word pada database using levenshtein distance
 * min : 0, max : 1
 * @param {string} text string input
 * @return {obj} similarity(double) dan recommended word (string)
 */
function findSimilar(text) {
  // kamus kata pada db
  let katakey = module.exports.jenis.concat(
    module.exports.kataupdate,
    module.exports.katahelp,
    module.exports.katafetch,
    module.exports.katafinish
  );
  let maxsim;
  let lev;
  let sim;
  let rec;
  // iterate tiap kata pada db
  for (let i in katakey) {
    lev = Levenshtein(text, katakey[i]); // compute levenshtein
    sim = 1 - lev / Math.max(text.length, katakey[i].length); // find similarity
    if (i == "0") {
      // init
      maxsim = sim;
      rec = katakey[0];
    } else {
      if (sim > maxsim) {
        // find max similarity
        maxsim = sim;
        rec = katakey[i];
      }
    }
  }
  if (maxsim >= 0.75) {
    // valid bila similarity diatas 75%
    return {
      similarity: maxsim,
      recommended: rec
    };
  } else return null;
}

/**
 * menghasilkan array of obj findsimilar untuk suatu teks
 * @param {string} text string input
 * @return {array of obj} similarity(double) dan recommended word (string)
 */
function similarity(text) {
  let splited = text.split(" ");
  let out = [];
  splited.forEach(word => {
    let sim = findSimilar(word);
    if (sim != null && sim.similarity != 1) {
      out.push(sim);
    }
  });
  return out;
}

// let text = "dedline";
// let pattern = "FF";
// console.log(Levenshtein(text,pattern));
// console.log(findSimilar(text));
// console.log(module.exports.parse("task 1 selesai dikerjakan"));

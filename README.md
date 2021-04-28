# Tugas Besar 3 Strategi Algoritma IF2211
> Aplikasi Algoritma String Matching dan Regular Expression untuk membentuk Chatbot sederhana.

## Table of contents
- [Tugas Besar 3 Strategi Algoritma IF2211](#tugas-besar-3-strategi-algoritma-if2211)
  - [Table of contents](#table-of-contents)
  - [Info Umum](#info-umum)
  - [Fitur](#fitur)
  - [Algoritme](#algoritme)
  - [Prasyarat / Prerequisite](#prasyarat--prerequisite)
  - [Cara Menggunakan Program](#cara-menggunakan-program)
  - [Pengembang](#pengembang)

## Info Umum
Program dibuat untuk memenuhi Tugas Besar 3 IF2211 Strategi Algoritma Semester II tahun 2020/2021. Program berupa chatbot interaktif sederhana dengan memanfaatkan algoritma String Matching dan Regular Expression yang berfungsi untuk membantu mengingat berbagai deadline, tanggal penting, dan task-task tertentu kepada user yang menggunakannya.

## Fitur
- Menambahkan task baru
- Melihat daftar task
- Menampilkan deadline
- Update task
- Menandai task sudah selesai
- Menampilkan kata kunci
- Clear history chat

## Algoritme
Algoritma yang digunakan untuk pencocokan kata adalah Algoritma Boyer Moore.\
Algoritma ini berhasil mencari kecocokan suatu kata pada suatu kalimat dan mengembalikan indeks pertama kali ditemukannya kata tersebut pada kalimat.\
Algoritma ini digunakan untuk mencari kecocokan kata kunci atau kata penting pada suatu kalimat yang kemudian akan diproses sesuai dengan fiturnya.\
Selain itu, juga digunakan Regular Expression untuk mencari pola suatu kata pada suatu kalimat juga Levenshtein Distance sebagai metrik similaritas antara suatu kata dengan kalimat.

## Prasyarat / Prerequisite
1. Pastikan terminal sudah berada di direktori program.
2. Jika belum menginstall NPM, install terlebih dahulu program tersebut. Tata cara dan informasi mengenai hal terkait dapat diperoleh melalui tautan [berikut](https://www.npmjs.com/get-npm).
3. Setelahnya, jalankan perintah npm install pada terminal. Perintah ini akan menginstall library-library yang dibutuhkan oleh program.

## Cara Menggunakan Program
1. Setelah prasyarat terpenuhi, jalankan perintah npm start pada terminal. Jika berhasil, terminal akan menunjukkan nomor port untuk program ini.
```
Your app is listening on port 54407
```
2. Setelah mendapatkan nomor port tersebut, buka peramban yang Anda pakai (Chrome ataupun peramban lainnya), lalu, arahkan situs ke berikut; http://localhost:(nomorport) ; pada kasus ini nomor port adalah 54407
![situs](https://i.ibb.co/MCbzQVm/link.png)
3. Jika situs tersebut berhasil dibuka, maka situs tersebut akan menampilkan halaman berikut
![antarmuka](https://i.ibb.co/CmX1cC5/botan.png)
4. Pengguna dapat langsung mengisi pesan pada kotak pesan yang disediakan dan dapat langsung mengirimkan pesan baik dengan menekan enter ataupun dengan menekan tombol kirim. Untuk mencoba dan melihat contoh, pengguna dapat langsung mengklik salah satu fitur dari pesan yang dikirim oleh Chatbot.

## Pengembang
- Mohammad Sheva Almeyda Sofjan - 13519018/K01
- Andrew - 13519036/K01
- Rezda Abdullah Fachrezzi - 13519194/K04  
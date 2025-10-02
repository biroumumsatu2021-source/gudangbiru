
import fs from 'fs';
import archiver from 'archiver';
import path from 'path';

// Nama file ZIP yang akan dihasilkan
const outputFileName = 'GudangBiru-SourceCode.zip';

// Buat stream untuk menulis file ZIP
const output = fs.createWriteStream(outputFileName);
const archive = archiver('zip', {
  zlib: { level: 9 } // Level kompresi tertinggi
});

// Daftar file dan folder yang akan dikecualikan
const excluded = [
  'node_modules',
  '.next',
  '.git',
  outputFileName,
  'GudangBiru-SourceCode.zip' // Pastikan file zip itu sendiri tidak ikut di-zip
];

// Notifikasi saat proses selesai
output.on('close', function() {
  console.log(`\n✅ Berhasil! Proyek telah di-zip ke dalam berkas: ${outputFileName}`);
  console.log(`   Ukuran berkas: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
  console.log('\n   Anda sekarang dapat mengunduh berkas tersebut dari file explorer di sebelah kiri.');
});

// Notifikasi jika ada error
archive.on('error', function(err) {
  throw err;
});

// Salurkan output arsip ke file
archive.pipe(output);

// Tambahkan semua file dari direktori saat ini ke dalam arsip, kecuali yang dikecualikan
console.log('Mengumpulkan berkas untuk di-zip...');
archive.glob('**/*', {
  cwd: '.',
  ignore: excluded,
  dot: true // Sertakan dotfiles (misal: .env, .gitignore)
});

// Selesaikan proses pembuatan arsip
archive.finalize();

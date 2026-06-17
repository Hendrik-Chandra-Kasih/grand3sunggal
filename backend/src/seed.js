import 'dotenv/config';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'grand3sunggal',
  waitForConnections: true,
  connectionLimit: 5,
  multipleStatements: false,
});

const toDate = (d) => {
  const dt = d instanceof Date ? d : new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};

const toDateTime = (d) => {
  const dt = d instanceof Date ? d : new Date(d);
  const pad = (n) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
};

// ─── helpers ─────────────────────────────────────────────────
const findUserId = async (conn, username) => {
  const [rows] = await conn.execute('SELECT id_user FROM users WHERE username = ? LIMIT 1', [username]);
  return rows[0]?.id_user || null;
};

const findTutorId = async (conn, userId) => {
  const [rows] = await conn.execute('SELECT id_tutor FROM tutor WHERE id_user = ? LIMIT 1', [userId]);
  return rows[0]?.id_tutor || null;
};

const findSiswaId = async (conn, userId) => {
  const [rows] = await conn.execute('SELECT id_siswa FROM siswa WHERE id_user = ? LIMIT 1', [userId]);
  return rows[0]?.id_siswa || null;
};

const findMapelId = async (conn, nama) => {
  const [rows] = await conn.execute('SELECT id_mapel FROM mapel WHERE nama_mapel = ? LIMIT 1', [nama]);
  return rows[0]?.id_mapel || null;
};

const nextId = async (conn, table, pk) => {
  const [rows] = await conn.execute(`SELECT COALESCE(MAX(\`${pk}\`), 0) + 1 AS n FROM \`${table}\``);
  return Number(rows[0]?.n) || 1;
};

// ─── main seed ───────────────────────────────────────────────
async function main() {
  console.log('🚀 Start seeding...\n');

  const password = await bcrypt.hash('password123', 10);
  const passwordAdmin = await bcrypt.hash('admin123', 10);
  const passwordOwner = await bcrypt.hash('owner123', 10);
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // ══════════════════════════════════════════════════════════
    // 1. Users
    // ══════════════════════════════════════════════════════════
    const userSeed = [
      { username: 'admin', role: 'admin' },
      { username: 'owner', role: 'pemilik' },
      { username: 'budi.setiawan', role: 'tutor' },
      { username: 'ani.wijaya', role: 'tutor' },
      { username: 'candra.putra', role: 'tutor' },
      { username: 'dewi.lestari', role: 'tutor' },
      { username: 'rizky.pratama', role: 'siswa' },
      { username: 'siti.aminah', role: 'siswa' },
      { username: 'andi.saputra', role: 'siswa' },
      { username: 'aisyah.putri', role: 'siswa' },
      { username: 'budi.santoso', role: 'siswa' },
      { username: 'citra.dewi', role: 'siswa' },
      { username: 'dimas.ari', role: 'siswa' },
      { username: 'eka.putri', role: 'siswa' },
      { username: 'fajar.nugraha', role: 'siswa' },
      { username: 'gita.lestari', role: 'siswa' },
      { username: 'hendra.wijaya', role: 'siswa' },
      { username: 'intan.permata', role: 'siswa' },
    ];

    const userIdMap = {};
    for (const u of userSeed) {
      let id = await findUserId(conn, u.username);
      if (!id) {
        id = await nextId(conn, 'users', 'id_user');
        let pwd = password;
        if (u.username === 'admin') pwd = passwordAdmin;
        else if (u.username === 'owner') pwd = passwordOwner;
        await conn.execute(
          'INSERT INTO users (id_user, username, password, role) VALUES (?, ?, ?, ?)',
          [id, u.username, pwd, u.role]
        );
      }
      userIdMap[u.username] = id;
    }
    console.log(`✔ users: ${Object.keys(userIdMap).length}`);

    // ══════════════════════════════════════════════════════════
    // 2. Mapel
    // ══════════════════════════════════════════════════════════
    const mapelName = ['SD', 'SMP', 'SMA', 'Calistung', 'MAFIA'];
    const mapelIds = {};
    for (const nama of mapelName) {
      let id = await findMapelId(conn, nama);
      if (!id) {
        id = await nextId(conn, 'mapel', 'id_mapel');
        await conn.execute('INSERT INTO mapel (id_mapel, nama_mapel) VALUES (?, ?)', [id, nama]);
      }
      mapelIds[nama] = id;
    }
    console.log(`✔ mapel: ${Object.keys(mapelIds).length}`);

    // ══════════════════════════════════════════════════════════
    // 3. Tutor — semua field nullable diisi
    // ══════════════════════════════════════════════════════════
    const tutorData = [
      { username: 'budi.setiawan', nama: 'Budi Setiawan', jk: 'L', hp: '081234567001',
        tempat_lahir: 'Medan', tanggal_lahir: '1990-03-15', alamat: 'Jl. Melati No.12, Medan',
        pendidikan: 'S1 Pendidikan Matematika', mapel: ['SD', 'SMP'] },
      { username: 'ani.wijaya', nama: 'Ani Wijaya', jk: 'P', hp: '081234567002',
        tempat_lahir: 'Jakarta', tanggal_lahir: '1992-07-22', alamat: 'Jl. Mawar No.8, Sunggal',
        pendidikan: 'S1 Pendidikan Bahasa Inggris', mapel: ['SMA', 'SD'] },
      { username: 'candra.putra', nama: 'Candra Putra', jk: 'L', hp: '081234567003',
        tempat_lahir: 'Bandung', tanggal_lahir: '1988-11-05', alamat: 'Jl. Anggrek No.3, Sunggal',
        pendidikan: 'S1 Matematika', mapel: ['MAFIA'] },
      { username: 'dewi.lestari', nama: 'Dewi Lestari', jk: 'P', hp: '081234567004',
        tempat_lahir: 'Surabaya', tanggal_lahir: '1995-01-30', alamat: 'Jl. Dahlia No.15, Sunggal',
        pendidikan: 'S1 PGSD', mapel: ['Calistung', 'SD'] },
    ];

    const tutors = [];
    for (const t of tutorData) {
      const uid = userIdMap[t.username];
      let tid = await findTutorId(conn, uid);
      if (!tid) {
        tid = await nextId(conn, 'tutor', 'id_tutor');
        const mapelJson = JSON.stringify(t.mapel.map((n) => mapelIds[n]).filter(Boolean));
        await conn.execute(
          `INSERT INTO tutor (id_tutor, id_user, nama_tutor, tempat_lahir, tanggal_lahir,
            jenis_kelamin, alamat, pendidikan, no_hp, tanggal_bergabung, status, mapel)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Aktif', ?)`,
          [tid, uid, t.nama, t.tempat_lahir, t.tanggal_lahir,
            t.jk, t.alamat, t.pendidikan, t.hp, '2024-01-15', mapelJson]
        );
      }
      tutors.push({ id_tutor: tid, ...t });
    }
    console.log(`✔ tutor: ${tutors.length}`);

    // ══════════════════════════════════════════════════════════
    // 4. Siswa — semua field nullable diisi
    // ══════════════════════════════════════════════════════════
    const siswaData = [
      { username: 'rizky.pratama', nama: 'Rizky Pratama', jk: 'L',
        tempat_lahir: 'Medan', tanggal_lahir: '2008-05-10', kelas: '10',
        asal_sekolah: 'SMA Negeri 1 Medan', alamat: 'Jl. Kenanga No.5, Medan',
        nama_ortu: 'Sukirman', pekerjaan_ortu: 'PNS', pendidikan_ortu: 'S1',
        spp: 550000, hp: '081234500001', mapel: ['SMA', 'MAFIA'] },
      { username: 'siti.aminah', nama: 'Siti Aminah', jk: 'P',
        tempat_lahir: 'Sunggal', tanggal_lahir: '2014-08-20', kelas: '2 SD',
        asal_sekolah: 'SD Negeri 1 Sunggal', alamat: 'Jl. Teratai No.3, Sunggal',
        nama_ortu: 'Suryanto', pekerjaan_ortu: 'Wiraswasta', pendidikan_ortu: 'SMA',
        spp: 300000, hp: '081234500002', mapel: ['SD', 'Calistung'] },
      { username: 'andi.saputra', nama: 'Andi Saputra', jk: 'L',
        tempat_lahir: 'Binjai', tanggal_lahir: '2010-12-03', kelas: '8',
        asal_sekolah: 'SMP Negeri 2 Binjai', alamat: 'Jl. Flamboyan No.7, Sunggal',
        nama_ortu: 'Hendro', pekerjaan_ortu: 'Karyawan Swasta', pendidikan_ortu: 'D3',
        spp: 450000, hp: '081234500003', mapel: ['SMP', 'SD'] },
      { username: 'aisyah.putri', nama: 'Aisyah Putri', jk: 'P',
        tempat_lahir: 'Jakarta', tanggal_lahir: '2009-02-14', kelas: '9',
        asal_sekolah: 'SMP Negeri 5 Sunggal', alamat: 'Jl. Cempaka No.11, Sunggal',
        nama_ortu: 'Fatimah', pekerjaan_ortu: 'Guru', pendidikan_ortu: 'S1',
        spp: 400000, hp: '081234500004', mapel: ['SMP'] },
      { username: 'budi.santoso', nama: 'Budi Santoso', jk: 'L',
        tempat_lahir: 'Surabaya', tanggal_lahir: '2007-09-18', kelas: '11',
        asal_sekolah: 'SMA Negeri 3 Medan', alamat: 'Jl. Bougenville No.2, Sunggal',
        nama_ortu: 'Rahmat', pekerjaan_ortu: 'TNI', pendidikan_ortu: 'S1',
        spp: 500000, hp: '081234500005', mapel: ['SMA'] },
      { username: 'citra.dewi', nama: 'Citra Dewi', jk: 'P',
        tempat_lahir: 'Medan', tanggal_lahir: '2013-11-25', kelas: '3 SD',
        asal_sekolah: 'SD Negeri 4 Sunggal', alamat: 'Jl. Melati No.20, Sunggal',
        nama_ortu: 'Indah', pekerjaan_ortu: 'Ibu Rumah Tangga', pendidikan_ortu: 'SMA',
        spp: 350000, hp: '081234500006', mapel: ['SD'] },
      { username: 'dimas.ari', nama: 'Dimas Ari', jk: 'L',
        tempat_lahir: 'Bandung', tanggal_lahir: '2010-06-07', kelas: '8',
        asal_sekolah: 'SMP Negeri 1 Sunggal', alamat: 'Jl. Sakura No.9, Sunggal',
        nama_ortu: 'Agus', pekerjaan_ortu: 'Dokter', pendidikan_ortu: 'S2',
        spp: 450000, hp: '081234500007', mapel: ['SMP', 'MAFIA'] },
      { username: 'eka.putri', nama: 'Eka Putri', jk: 'P',
        tempat_lahir: 'Yogyakarta', tanggal_lahir: '2008-01-12', kelas: '10',
        asal_sekolah: 'SMA Negeri 2 Sunggal', alamat: 'Jl. Asoka No.6, Sunggal',
        nama_ortu: 'Rini', pekerjaan_ortu: 'Perawat', pendidikan_ortu: 'D3',
        spp: 500000, hp: '081234500008', mapel: ['SMA', 'SD'] },
      { username: 'fajar.nugraha', nama: 'Fajar Nugraha', jk: 'L',
        tempat_lahir: 'Palembang', tanggal_lahir: '2009-07-30', kelas: '9',
        asal_sekolah: 'SMP Negeri 3 Sunggal', alamat: 'Jl. Tulip No.14, Sunggal',
        nama_ortu: 'Bambang', pekerjaan_ortu: 'Pengusaha', pendidikan_ortu: 'S1',
        spp: 400000, hp: '081234500009', mapel: ['SMP'] },
      { username: 'gita.lestari', nama: 'Gita Lestari', jk: 'P',
        tempat_lahir: 'Semarang', tanggal_lahir: '2015-04-03', kelas: '1 SD',
        asal_sekolah: 'SD Negeri 3 Sunggal', alamat: 'Jl. Lili No.18, Sunggal',
        nama_ortu: 'Dewi', pekerjaan_ortu: 'Apoteker', pendidikan_ortu: 'S1',
        spp: 350000, hp: '081234500010', mapel: ['SD', 'Calistung'] },
      { username: 'hendra.wijaya', nama: 'Hendra Wijaya', jk: 'L',
        tempat_lahir: 'Aceh', tanggal_lahir: '2009-10-22', kelas: '9',
        asal_sekolah: 'SMP Negeri 4 Sunggal', alamat: 'Jl. Kamboja No.1, Sunggal',
        nama_ortu: 'Joko', pekerjaan_ortu: 'Petani', pendidikan_ortu: 'SMP',
        spp: 450000, hp: '081234500011', mapel: ['SMP'] },
      { username: 'intan.permata', nama: 'Intan Permata', jk: 'P',
        tempat_lahir: 'Makassar', tanggal_lahir: '2007-12-28', kelas: '11',
        asal_sekolah: 'SMA Negeri 5 Medan', alamat: 'Jl. Edelweis No.4, Sunggal',
        nama_ortu: 'Slamet', pekerjaan_ortu: 'Polisi', pendidikan_ortu: 'S1',
        spp: 500000, hp: '081234500012', mapel: ['SMA', 'MAFIA'] },
    ];

    const siswa = [];
    for (const s of siswaData) {
      const uid = userIdMap[s.username];
      let sid = await findSiswaId(conn, uid);
      if (!sid) {
        sid = await nextId(conn, 'siswa', 'id_siswa');
        const mapelJson = JSON.stringify(s.mapel.map((n) => mapelIds[n]).filter(Boolean));
        await conn.execute(
          `INSERT INTO siswa (id_siswa, id_user, nama, tempat_lahir, tanggal_lahir,
            jenis_kelamin, kelas, mapel, asal_sekolah, alamat, tanggal_masuk,
            nama_ortu, pekerjaan_ortu, no_hp_ortu, pendidikan_ortu, spp, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Aktif')`,
          [sid, uid, s.nama, s.tempat_lahir, s.tanggal_lahir,
            s.jk, s.kelas, mapelJson, s.asal_sekolah, s.alamat, '2024-08-01',
            s.nama_ortu, s.pekerjaan_ortu, s.hp, s.pendidikan_ortu, s.spp]
        );
      }
      siswa.push({ id_siswa: sid, ...s });
    }
    console.log(`✔ siswa: ${siswa.length}`);

    // ══════════════════════════════════════════════════════════
    // 5. Kelas — id_tutor NOT NULL (semua kelas punya tutor)
    // ══════════════════════════════════════════════════════════
    const kelasData = [
      { nama: 'SD A1', mapel: 'SD', tutor: 0 },
      { nama: 'SMP B1', mapel: 'SMP', tutor: 1 },
      { nama: 'SMA C1', mapel: 'SMA', tutor: 1 },
      { nama: 'Calistung D1', mapel: 'Calistung', tutor: 3 },
      { nama: 'MAFIA E1', mapel: 'MAFIA', tutor: 2 },
    ];

    const kelas = [];
    for (const k of kelasData) {
      const [chk] = await conn.execute('SELECT id_kelas FROM kelas WHERE nama_kelas = ? LIMIT 1', [k.nama]);
      let kid = chk[0]?.id_kelas;
      if (kid) {
        await conn.execute('UPDATE kelas SET id_mapel = ?, id_tutor = ? WHERE id_kelas = ?',
          [mapelIds[k.mapel], tutors[k.tutor].id_tutor, kid]);
      } else {
        kid = await nextId(conn, 'kelas', 'id_kelas');
        await conn.execute('INSERT INTO kelas (id_kelas, nama_kelas, id_mapel, id_tutor) VALUES (?, ?, ?, ?)',
          [kid, k.nama, mapelIds[k.mapel], tutors[k.tutor].id_tutor]);
      }
      kelas.push({ id_kelas: kid, ...k });
    }
    console.log(`✔ kelas: ${kelas.length}`);

    // ══════════════════════════════════════════════════════════
    // 6. Kelas_siswa — enroll sesuai kecocokan mapel
    // ══════════════════════════════════════════════════════════
    let enrollCount = 0;
    for (const s of siswaData) {
      for (const k of kelasData) {
        const match = s.mapel.some((ms) => ms === k.mapel);
        if (!match) continue;

        const sid = siswa.find((x) => x.username === s.username)?.id_siswa;
        const kid = kelas.find((x) => x.nama === k.nama)?.id_kelas;
        if (!sid || !kid) continue;

        const [dup] = await conn.execute(
          'SELECT id_kelas_siswa FROM kelas_siswa WHERE id_siswa = ? AND id_kelas = ? LIMIT 1',
          [sid, kid]
        );
        if (dup.length > 0) continue;

        const ksId = await nextId(conn, 'kelas_siswa', 'id_kelas_siswa');
        await conn.execute('INSERT INTO kelas_siswa (id_kelas_siswa, id_siswa, id_kelas) VALUES (?, ?, ?)',
          [ksId, sid, kid]);
        enrollCount++;
      }
    }
    console.log(`✔ enrollments: ${enrollCount}`);

    // ══════════════════════════════════════════════════════════
    // 7. Jadwal — hari = JSON array Senin–Jumat, + jam_selesai
    // ══════════════════════════════════════════════════════════
    const addJam = (jam, durasiJam = 1, durasiMenit = 30) => {
      const [h, m] = jam.split(':').map(Number);
      const totalMenit = h * 60 + m + durasiJam * 60 + durasiMenit;
      const jj = String(Math.floor(totalMenit / 60)).padStart(2, '0');
      const mm = String(totalMenit % 60).padStart(2, '0');
      return `${jj}:${mm}:00`;
    };

    const jadwalData = [
      { kelas: 0, tutor: 0, mapel: 'SD', hari: ['Senin', 'Rabu'], jam: '14:00:00' },
      { kelas: 1, tutor: 1, mapel: 'SMP', hari: ['Senin', 'Selasa'], jam: '15:00:00' },
      { kelas: 2, tutor: 1, mapel: 'SMA', hari: ['Selasa', 'Kamis'], jam: '16:00:00' },
      { kelas: 3, tutor: 3, mapel: 'Calistung', hari: ['Rabu', 'Jumat'], jam: '13:00:00' },
      { kelas: 4, tutor: 2, mapel: 'MAFIA', hari: ['Jumat'], jam: '17:00:00' },
      { kelas: 0, tutor: 0, mapel: 'SD', hari: ['Kamis'], jam: '14:00:00' },
      { kelas: 2, tutor: 1, mapel: 'SMA', hari: ['Senin'], jam: '10:00:00' },
    ];

    const jadwalIds = [];
    for (const j of jadwalData) {
      const jid = await nextId(conn, 'jadwal', 'id_jadwal');
      const jamSelesai = addJam(j.jam);
      await conn.execute(
        `INSERT INTO jadwal (id_jadwal, id_kelas, id_tutor, id_mapel, hari, jam, jam_selesai)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [jid, kelas[j.kelas].id_kelas, tutors[j.tutor].id_tutor, mapelIds[j.mapel],
          JSON.stringify(j.hari), j.jam, jamSelesai]
      );
      jadwalIds.push(jid);
    }
    console.log(`✔ jadwal: ${jadwalIds.length}`);

    // ══════════════════════════════════════════════════════════
    // 8. Absensi_siswa — hari ini, random status, + confirmed
    // ══════════════════════════════════════════════════════════
    const today = new Date();
    const todayStr = toDate(today);
    const statusPool = ['Hadir', 'Hadir', 'Hadir', 'Tidak Hadir', 'Sakit', 'Izin'];

    // ambil id admin untuk confirmed_by
    const adminId = userIdMap['admin'];

    let absensiSiswaCount = 0;
    for (let ji = 0; ji < jadwalData.length; ji++) {
      const j = jadwalData[ji];
      const kid = kelas[j.kelas].id_kelas;
      const [enrolled] = await conn.execute('SELECT id_siswa FROM kelas_siswa WHERE id_kelas = ?', [kid]);

      for (const row of enrolled) {
        const dow = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][today.getDay()];
        if (!j.hari.includes(dow)) continue;

        const [dup] = await conn.execute(
          'SELECT id_absensi FROM absensi_siswa WHERE id_siswa = ? AND tanggal = ? AND id_jadwal IN (SELECT id_jadwal FROM jadwal WHERE id_kelas = ?) LIMIT 1',
          [row.id_siswa, todayStr, kid]
        );
        if (dup.length > 0) continue;

        const absId = await nextId(conn, 'absensi_siswa', 'id_absensi');
        const status = statusPool[Math.floor(Math.random() * statusPool.length)];
        // setengah dikonfirmasi admin
        const isConfirmed = Math.random() > 0.5;
        await conn.execute(
          `INSERT INTO absensi_siswa
            (id_absensi, id_siswa, id_jadwal, tanggal, pertemuan, status, id_mapel,
             is_confirmed, confirmed_at, confirmed_by)
           VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?, ?)`,
          [absId, row.id_siswa, jadwalIds[ji], todayStr, status, mapelIds[j.mapel],
            isConfirmed ? 1 : 0,
            isConfirmed ? todayStr : null,
            isConfirmed ? adminId : null]
        );
        absensiSiswaCount++;
      }
    }
    console.log(`✔ absensi_siswa hari ini: ${absensiSiswaCount}`);

    // ══════════════════════════════════════════════════════════
    // 9. Absensi_tutor — 5 hari terakhir
    // ══════════════════════════════════════════════════════════
    let absenTutorCount = 0;
    for (const t of tutors) {
      for (let i = 0; i < 5; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const [dup] = await conn.execute(
          'SELECT id_absensi_tutor FROM absensi_tutor WHERE id_tutor = ? AND tanggal = ? LIMIT 1',
          [t.id_tutor, toDate(d)]
        );
        if (dup.length > 0) continue;
        const atId = await nextId(conn, 'absensi_tutor', 'id_absensi_tutor');
        await conn.execute(
          'INSERT INTO absensi_tutor (id_absensi_tutor, id_tutor, tanggal, status) VALUES (?, ?, ?, ?)',
          [atId, t.id_tutor, toDate(d), Math.random() > 0.2 ? 'Hadir' : 'Absen']
        );
        absenTutorCount++;
      }
    }
    console.log(`✔ absensi_tutor: ${absenTutorCount}`);

    // ══════════════════════════════════════════════════════════
    // 10. Pembayaran — semua field diisi termasuk catatan
    // ══════════════════════════════════════════════════════════
    const currentMonth = `${MONTHS[today.getMonth()]} ${today.getFullYear()}`;

    const catatanPending = [
      'Menunggu konfirmasi admin', 'Pembayaran via transfer', 'Baru melakukan pembayaran',
      'Cek mutasi bank', 'Tunggu verifikasi bendahara', 'Pembayaran tunai diterima TU',
      'Belum ada konfirmasi dari bank', 'Sudah transfer, menunggu verifikasi',
    ];
    const catatanVerified = [
      'Pembayaran lunas', 'Sudah diverifikasi oleh admin', 'Lunas, tidak ada tunggakan',
      'Pembayaran tepat waktu',
    ];

    let bayarCount = 0;
    // 8 Pending
    for (let i = 0; i < Math.min(8, siswa.length); i++) {
      const s = siswa[i];
      const tgl = new Date(today);
      tgl.setDate(tgl.getDate() - Math.floor(Math.random() * 5));
      const id = await nextId(conn, 'pembayaran', 'id_pembayaran');
      const metode = Math.random() > 0.5 ? 'Transfer' : 'Tunai';
      const catatan = catatanPending[i % catatanPending.length];
      await conn.execute(
        `INSERT INTO pembayaran (id_pembayaran, id_siswa, bulan, tanggal_bayar,
          jenis_pembayaran, jumlah, metode_pembayaran, diskon, status, catatan)
         VALUES (?, ?, ?, ?, 'SPP', ?, ?, 0, 'Pending', ?)`,
        [id, s.id_siswa, currentMonth, toDate(tgl), s.spp, metode, catatan]
      );
      bayarCount++;
    }
    // 4 Verified
    for (let i = 8; i < Math.min(12, siswa.length); i++) {
      const s = siswa[i];
      const tgl = new Date(today);
      tgl.setDate(tgl.getDate() - Math.floor(Math.random() * 5));
      const id = await nextId(conn, 'pembayaran', 'id_pembayaran');
      const catatan = catatanVerified[(i - 8) % catatanVerified.length];
      await conn.execute(
        `INSERT INTO pembayaran (id_pembayaran, id_siswa, bulan, tanggal_bayar,
          jenis_pembayaran, jumlah, metode_pembayaran, diskon, status,
          tanggal_verifikasi, catatan)
         VALUES (?, ?, ?, ?, 'SPP', ?, 'Transfer', 0, 'Verified', ?, ?)`,
        [id, s.id_siswa, currentMonth, toDate(tgl), s.spp, toDate(today), catatan]
      );
      bayarCount++;
    }
    console.log(`✔ pembayaran: ${bayarCount} (8 Pending, 4 Verified)`);

    // ══════════════════════════════════════════════════════════
    // 11. Gaji_tutor
    // ══════════════════════════════════════════════════════════
    const periodeDt = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01 00:00:00`;
    for (const t of tutors) {
      const [dup] = await conn.execute(
        'SELECT id_gaji FROM gaji_tutor WHERE id_tutor = ? AND periode = ? LIMIT 1',
        [t.id_tutor, periodeDt]
      );
      if (dup.length > 0) continue;

      const gid = await nextId(conn, 'gaji_tutor', 'id_gaji');
      const pemasukan = Math.floor(Math.random() * 1000000) + 500000;
      const potongan = Math.floor(pemasukan * 0.1);
      const bonus = Math.floor(Math.random() * 150000);
      const total = pemasukan - potongan + bonus;
      await conn.execute(
        `INSERT INTO gaji_tutor (id_gaji, id_tutor, periode, total_pemasukan, potongan,
          bonus, total_infal, total_gaji, status_gaji)
         VALUES (?, ?, ?, ?, ?, ?, 0, ?, 'Draft')`,
        [gid, t.id_tutor, periodeDt, pemasukan, potongan, bonus, total]
      );
    }
    console.log(`✔ gaji_tutor: ${tutors.length}`);

    // ══════════════════════════════════════════════════════════
    // 12. App_settings
    // ══════════════════════════════════════════════════════════
    const settingsData = [
      ['bonus_kehadiran_enabled', 'true', 'Aktifkan bonus kehadiran'],
      ['bonus_kehadiran_nominal', '65000', 'Nominal bonus kehadiran per bulan'],
      ['bonus_kehadiran_maks_absen', '2', 'Maks absen agar tetap dapat bonus'],
      ['infal_enabled', 'true', 'Aktifkan fitur infal'],
      ['infal_nominal', '15000', 'Nominal per infal'],
      ['persentase_gaji_tutor', '40', 'Persentase gaji dari total SPP'],
      ['hari_kerja_per_bulan', '20', 'Hari kerja normal per bulan'],
    ];

    for (const [key, val, desc] of settingsData) {
      await conn.execute(
        `INSERT INTO app_settings (setting_key, setting_value, description)
         VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [key, val, desc]
      );
    }
    console.log(`✔ app_settings: ${settingsData.length}`);

    // commit
    await conn.commit();
    console.log('\n✅ Seeding finished.');
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });

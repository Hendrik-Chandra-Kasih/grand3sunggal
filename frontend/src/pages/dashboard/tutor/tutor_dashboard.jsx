import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  MdCalendarMonth,
  MdHowToReg,
  MdAttachMoney,
  MdPeople,
} from 'react-icons/md';
import api from '../../../services/api';
import styles from './tutor_dashboard.module.css';

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const formatRupiah = (nominal) => {
  if (!nominal && nominal !== 0) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(nominal);
};

const TutorDashboard = () => {
  const today = new Date();
  const bulanIni = today.getMonth() + 1;
  const tahunIni = today.getFullYear();
  const hariIni = DAYS[today.getDay()];

  const [user, setUser] = useState(null);
  const [idTutor, setIdTutor] = useState(null);
  const [namaTutor, setNamaTutor] = useState('');

  // Data states
  const [jadwalHariIni, setJadwalHariIni] = useState([]);
  const [kehadiran, setKehadiran] = useState(null);
  const [gaji, setGaji] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch tutor id from user
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setUser(u);

        // Get tutor data
        api.get(`/guru/by-user/${u.id}`).then((res) => {
          if (res.data?.success && res.data.data) {
            setIdTutor(res.data.data.id_tutor);
            setNamaTutor(res.data.data.nama_tutor || u.nama || 'Tutor');
          }
        }).catch(() => {});
      } catch {}
    }
  }, []);

  const fetchAll = useCallback(async () => {
    if (!idTutor) return;
    try {
      setLoading(true);

      const [jadwalRes, kehadiranRes, gajiRes] = await Promise.all([
        api.get(`/jadwal/tutor/${idTutor}`),
        api.get(`/absensi-tutor/recap/me?bulan=${bulanIni}&tahun=${tahunIni}`),
        api.get(`/gaji/perhitungan?bulan=${bulanIni}&tahun=${tahunIni}`),
      ]);

      // Jadwal hari ini
      if (jadwalRes.data?.success) {
        const all = jadwalRes.data.data || [];
        setJadwalHariIni(all.filter((j) => j.hari === hariIni));
      }

      // Kehadiran
      if (kehadiranRes.data?.success) {
        setKehadiran(kehadiranRes.data.data);
      }

      // Gaji
      if (gajiRes.data?.success) {
        setGaji(gajiRes.data.data);
      }
    } catch (err) {
      console.error('Gagal memuat data dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [idTutor, bulanIni, tahunIni, hariIni]);

  useEffect(() => {
    if (idTutor) fetchAll();
  }, [idTutor, fetchAll]);

  const formatJam = (jam) => {
    if (!jam) return '-';
    return jam.slice(0, 5);
  };

  const persenHadir = kehadiran ? kehadiran.persentase : 0;
  const totalTidakHadir = kehadiran ? (kehadiran.total_tidak_hadir || 0) : 0;

  if (loading && !gaji && !kehadiran) {
    return <div className={styles.loadingState}>Memuat dashboard...</div>;
  }

  return (
    <div className={styles.container}>
      {/* ─── Greeting ───────────────────────────── */}
      <div>
        <h1 className={styles.greeting}>Halo, {namaTutor} 👋</h1>
        <p className={styles.greetingSub}>
          Ringkasan aktivitas Anda periode {MONTHS[bulanIni - 1]} {tahunIni}
        </p>
      </div>

      {/* ─── Stat Cards Row ─────────────────────── */}
      <div className={styles.cardsRow}>
        <Link to="/tutor/jadwal-mengajar" className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#eff6ff', color: '#1e40af' }}>
            <MdCalendarMonth />
          </div>
          <span className={styles.statLabel}>Jadwal Hari Ini</span>
          <span className={styles.statValue}>{jadwalHariIni.length}</span>
          <span className={styles.statDetail}>{hariIni}</span>
        </Link>

        <Link to="/tutor/kehadiran" className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <MdHowToReg />
          </div>
          <span className={styles.statLabel}>Kehadiran</span>
          <span className={styles.statValue}>{persenHadir}%</span>
          {totalTidakHadir > 0 ? (
            <span className={`${styles.statDetail} ${styles.statDetailRed}`}>
              {totalTidakHadir}x tidak hadir
            </span>
          ) : (
            <span className={`${styles.statDetail} ${styles.statDetailGreen}`}>
              {kehadiran ? 'Kehadiran sempurna' : 'Belum ada data'}
            </span>
          )}
        </Link>

        <Link to="/tutor/gaji" className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fefce8', color: '#ca8a04' }}>
            <MdAttachMoney />
          </div>
          <span className={styles.statLabel}>Estimasi Gaji</span>
          <span className={styles.statValue}>{gaji ? formatRupiah(gaji.grand_total) : '-'}</span>
          <span className={styles.statDetail}>{MONTHS[bulanIni - 1]} {tahunIni}</span>
        </Link>

        <Link to="/tutor/kehadiran" className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <MdPeople />
          </div>
          <span className={styles.statLabel}>Infal</span>
          <span className={styles.statValue}>{gaji?.infal?.jumlah || 0}x</span>
          <span className={`${styles.statDetail} ${styles.statDetailGreen}`}>
            {gaji?.infal?.total ? formatRupiah(gaji.infal.total) : '0'}
          </span>
        </Link>
      </div>

      {/* ─── Bottom Section ─────────────────────── */}
      <div className={styles.bottomSection}>
        {/* ─── Jadwal Hari Ini ─────────────── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Jadwal Hari Ini — {hariIni}</h3>
            <Link to="/tutor/jadwal-mengajar" className={styles.cardHeaderLink}>
              Lihat Semua →
            </Link>
          </div>
          <div className={styles.cardBody}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Jam</th>
                  <th>Kelas</th>
                  <th>Mapel</th>
                </tr>
              </thead>
              <tbody>
                {jadwalHariIni.length === 0 ? (
                  <tr>
                    <td colSpan={3} className={styles.emptyCell}>
                      Tidak ada jadwal hari ini
                    </td>
                  </tr>
                ) : (
                  jadwalHariIni.map((j, i) => (
                    <tr key={j.id_jadwal || i}>
                      <td>
                        {formatJam(j.jam_mulai || j.jam)} - {formatJam(j.jam_selesai)}
                      </td>
                      <td>{j.nama_kelas || '-'}</td>
                      <td>{j.nama_mapel || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className={styles.cardFooter}>
            <span style={{ fontSize: '.75rem', color: '#94a3b8' }}>
              Total: {jadwalHariIni.length} jadwal
            </span>
            <Link to="/tutor/absensi-siswa" className={styles.cardHeaderLink} style={{ fontSize: '.75rem' }}>
              Absensi Siswa →
            </Link>
          </div>
        </div>

        {/* ─── Ringkasan Gaji ─────────────── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Ringkasan Gaji — {MONTHS[bulanIni - 1]} {tahunIni}</h3>
            <Link to="/tutor/gaji" className={styles.cardHeaderLink}>
              Detail →
            </Link>
          </div>
          <div className={styles.cardBody}>
            {gaji ? (
              <div className={styles.gajiSummary}>
                <div className={styles.gajiRow}>
                  <span className={styles.gajiLabel}>Komisi Dasar</span>
                  <span className={styles.gajiValue}>{formatRupiah(gaji.komisi_dasar)}</span>
                </div>
                <div className={styles.gajiRow}>
                  <span className={styles.gajiLabel}>Bonus Kehadiran</span>
                  <span className={`${styles.gajiValue} ${styles.gajiGreen}`}>
                    +{formatRupiah(gaji.bonus)}
                  </span>
                </div>
                <div className={styles.gajiRow}>
                  <span className={styles.gajiLabel}>Potongan Absen</span>
                  <span className={`${styles.gajiValue} ${styles.gajiRed}`}>
                    -{formatRupiah(gaji.potongan)}
                  </span>
                </div>
                <div className={styles.gajiRow}>
                  <span className={styles.gajiLabel}>Infal ({gaji.infal?.jumlah || 0}x)</span>
                  <span className={`${styles.gajiValue} ${styles.gajiPurple}`}>
                    +{formatRupiah(gaji.infal?.total || 0)}
                  </span>
                </div>
                <div className={styles.gajiDivider} />
                <div className={styles.gajiRow}>
                  <span className={styles.gajiLabel}>Grand Total</span>
                  <span className={`${styles.gajiValue} ${styles.gajiTotal}`}>
                    {formatRupiah(gaji.grand_total)}
                  </span>
                </div>
              </div>
            ) : (
              <div className={styles.emptyCell}>Belum ada data gaji</div>
            )}
          </div>
          <div className={styles.cardFooter}>
            <span style={{ fontSize: '.75rem', color: '#94a3b8' }}>
              Kehadiran: {gaji?.absensi?.hadir || 0}x hadir
            </span>
            <span style={{ fontSize: '.75rem', color: '#94a3b8' }}>
              {gaji?.absensi?.tidak_masuk || 0}x tidak masuk
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;

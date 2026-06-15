import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  MdCalendarMonth,
  MdHowToReg,
  MdPayments,
  MdSchool,
  MdAccessTime,
} from 'react-icons/md';
import api from '../../../services/api';
import styles from './siswa_dashboard.module.css';

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const formatRupiah = (v) => {
  if (!v && v !== 0) return '-';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);
};

const formatJam = (jam) => {
  if (!jam) return '-';
  return jam.slice(0, 5);
};

const SiswaDashboard = () => {
  const today = new Date();
  const bulanIni = today.getMonth() + 1;
  const tahunIni = today.getFullYear();
  const hariIni = DAYS[today.getDay()];

  const [idSiswa, setIdSiswa] = useState(null);
  const [namaSiswa, setNamaSiswa] = useState('');
  const [loading, setLoading] = useState(true);

  // Data states
  const [jadwalHariIni, setJadwalHariIni] = useState([]);
  const [absensiRecap, setAbsensiRecap] = useState([]);
  const [meta, setMeta] = useState(null);
  const [tunggakan, setTunggakan] = useState({ count: 0, months: [] });
  const [totalDibayar, setTotalDibayar] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        api.get(`/siswa/by-user/${u.id}`).then((res) => {
          if (res.data?.success && res.data.data) {
            setIdSiswa(res.data.data.id_siswa);
            setNamaSiswa(res.data.data.nama || 'Siswa');
          }
        }).catch(() => {});
      } catch {}
    }
  }, []);

  const fetchAll = useCallback(async () => {
    if (!idSiswa) return;
    try {
      setLoading(true);

      const [jadwalRes, absensiRes, pembayaranRes, tunggakanRes] = await Promise.all([
        api.get(`/jadwal/siswa/${idSiswa}`),
        api.get(`/absensi-siswa/recap/me?bulan=${bulanIni}&tahun=${tahunIni}`),
        api.get(`/pembayaran?id_siswa=${idSiswa}`),
        api.get(`/pembayaran/tunggakan/${idSiswa}`).catch(() => ({ data: { data: { tunggakan_count: 0, tunggakan_months: [] } } })),
      ]);

      // Jadwal hari ini
      if (jadwalRes.data?.success) {
        const all = jadwalRes.data.data || [];
        setJadwalHariIni(all.filter((j) => j.hari === hariIni).sort((a, b) => (a.jam > b.jam ? 1 : -1)));
      }

      // Absensi recap
      if (absensiRes.data?.success) {
        setAbsensiRecap(absensiRes.data.data || []);
        setMeta(absensiRes.data.meta);
      }

      // Pembayaran
      if (pembayaranRes.data?.success) {
        const list = pembayaranRes.data.data || [];
        const verified = list.filter((p) => p.status === 'Verified').reduce((sum, p) => sum + Number(p.jumlah || 0), 0);
        setTotalDibayar(verified);
      }

      // Tunggakan
      const tData = tunggakanRes.data?.data;
      setTunggakan({ count: tData?.tunggakan_count || 0, months: tData?.tunggakan_months || [] });
    } catch (err) {
      console.error('Gagal memuat dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [idSiswa, bulanIni, tahunIni, hariIni]);

  useEffect(() => {
    if (idSiswa) fetchAll();
  }, [idSiswa, fetchAll]);

  // Total stats dari absensi
  const totalHadir = absensiRecap.reduce((s, a) => s + a.hadir, 0);
  const totalAlpha = absensiRecap.reduce((s, a) => s + a.alpha, 0);
  const totalPertemuan = absensiRecap.reduce((s, a) => s + a.total_pertemuan, 0);
  const persenHadir = totalPertemuan > 0 ? Math.round((totalHadir / totalPertemuan) * 100) : 0;

  if (loading && !meta) {
    return <div className={styles.loadingState}>Memuat dashboard...</div>;
  }

  return (
    <div className={styles.container}>
      {/* Greeting */}
      <div>
        <h1 className={styles.greeting}>Halo, {namaSiswa} 👋</h1>
        <p className={styles.greetingSub}>
          Ringkasan kegiatan belajar Anda periode {MONTHS[bulanIni - 1]} {tahunIni}
        </p>
      </div>

      {/* Stat Cards */}
      <div className={styles.cardsRow}>
        <Link to="/siswa/jadwal" className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#eff6ff', color: '#1e40af' }}>
            <MdCalendarMonth />
          </div>
          <span className={styles.statLabel}>Jadwal Hari Ini</span>
          <span className={styles.statValue}>{jadwalHariIni.length}</span>
          <span className={`${styles.statDetail} ${styles.statDetailGray}`}>{hariIni}</span>
        </Link>

        <Link to="/siswa/rekap-absensi" className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <MdHowToReg />
          </div>
          <span className={styles.statLabel}>Kehadiran</span>
          <span className={styles.statValue}>{persenHadir}%</span>
          {totalAlpha > 0 ? (
            <span className={`${styles.statDetail} ${styles.statDetailRed}`}>
              {totalAlpha}x absen
            </span>
          ) : (
            <span className={`${styles.statDetail} ${styles.statDetailGreen}`}>
              {totalPertemuan > 0 ? 'Kehadiran sempurna' : 'Belum ada data'}
            </span>
          )}
        </Link>

        <Link to="/siswa/pembayaran" className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fefce8', color: '#ca8a04' }}>
            <MdPayments />
          </div>
          <span className={styles.statLabel}>Pembayaran</span>
          {tunggakan.count > 0 ? (
            <>
              <span className={styles.statValue}>{tunggakan.count}x</span>
              <span className={`${styles.statDetail} ${styles.statDetailRed}`}>
                Tunggakan {formatRupiah(tunggakan.count * 0)}
              </span>
            </>
          ) : (
            <>
              <span className={styles.statValue}>Lunas</span>
              <span className={`${styles.statDetail} ${styles.statDetailGreen}`}>
                Dibayar {formatRupiah(totalDibayar)}
              </span>
            </>
          )}
        </Link>

        <Link to="/siswa/jadwal" className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <MdSchool />
          </div>
          <span className={styles.statLabel}>Mata Pelajaran</span>
          <span className={styles.statValue}>{absensiRecap.length}</span>
          <span className={`${styles.statDetail} ${styles.statDetailGray}`}>
            {totalPertemuan} total pertemuan
          </span>
        </Link>
      </div>

      {/* Bottom Section */}
      <div className={styles.bottomSection}>
        {/* Jadwal Hari Ini */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Jadwal Hari Ini — {hariIni}</h3>
            <Link to="/siswa/jadwal" className={styles.cardHeaderLink}>Lihat Semua →</Link>
          </div>
          <div className={styles.cardBody}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Jam</th>
                  <th>Mapel</th>
                  <th>Kelas</th>
                </tr>
              </thead>
              <tbody>
                {jadwalHariIni.length === 0 ? (
                  <tr><td colSpan={3} className={styles.emptyCell}>Tidak ada jadwal hari ini</td></tr>
                ) : (
                  jadwalHariIni.map((j, i) => (
                    <tr key={j.id_jadwal || i}>
                      <td className={styles.colJam}>
                        <MdAccessTime style={{ fontSize: '.75rem', marginRight: 4 }} />
                        {formatJam(j.jam)}{j.jam_selesai ? ` - ${formatJam(j.jam_selesai)}` : ''}
                      </td>
                      <td>{j.nama_mapel || '-'}</td>
                      <td>{j.nama_kelas || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className={styles.cardFooter}>
            <span>{jadwalHariIni.length} jadwal</span>
            <span>Sesi: {jadwalHariIni.map((j) => j.sesi).filter(Boolean).join(', ') || '-'}</span>
          </div>
        </div>

        {/* Rekap Absensi per Mapel */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Rekap Absensi — {meta ? `${MONTHS[meta.bulan - 1]} ${meta.tahun}` : ''}</h3>
            <Link to="/siswa/rekap-absensi" className={styles.cardHeaderLink}>Detail →</Link>
          </div>
          <div className={styles.cardBody}>
            {absensiRecap.length === 0 ? (
              <div className={styles.emptyCell}>Belum ada data absensi</div>
            ) : (
              <div className={styles.absensiList}>
                {absensiRecap.slice(0, 6).map((item) => (
                  <div key={item.id_jadwal} className={styles.absensiItem}>
                    <div className={styles.absensiInfo}>
                      <div className={styles.absensiMapel}>{item.nama_mapel || '-'}</div>
                      <div className={styles.absensiMeta}>{item.hari} • {item.nama_kelas}</div>
                    </div>
                    <div className={styles.absensiStats}>
                      <span className={`${styles.statBadge} ${styles.statBadgeGreen}`}>
                        ✓ {item.hadir}
                      </span>
                      {item.alpha > 0 && (
                        <span className={`${styles.statBadge} ${styles.statBadgeRed}`}>
                          ✗ {item.alpha}
                        </span>
                      )}
                      {item.sakit > 0 && (
                        <span className={`${styles.statBadge} ${styles.statBadgeYellow}`}>
                          S {item.sakit}
                        </span>
                      )}
                      {item.izin > 0 && (
                        <span className={`${styles.statBadge} ${styles.statBadgeBlue}`}>
                          I {item.izin}
                        </span>
                      )}
                      <span className={`${styles.badgePct} ${item.persentase >= 80 ? styles.badgePctGood : item.persentase >= 50 ? styles.badgePctWarn : styles.badgePctBad}`}>
                        {item.persentase}%
                      </span>
                    </div>
                  </div>
                ))}
                {absensiRecap.length > 6 && (
                  <div style={{ textAlign: 'center', padding: '8px 20px', fontSize: '.75rem', color: '#94a3b8' }}>
                    +{absensiRecap.length - 6} mapel lainnya
                  </div>
                )}
              </div>
            )}
          </div>
          <div className={styles.cardFooter}>
            <span>Total hadir: {totalHadir}/{totalPertemuan}</span>
            <span>Alpha: {totalAlpha}x</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiswaDashboard;

import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MdAttachMoney, MdAssessment } from 'react-icons/md';
import api from '../../../services/api';
import styles from './owner_dashboard.module.css';

const formatRupiah = (nominal) => {
  if (nominal === null || nominal === undefined) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(nominal);
};

const OwnerDashboard = () => {
  const today = new Date();
  const bulanSekarang = today.getMonth() + 1;
  const tahunSekarang = today.getFullYear();

  const [keuangan, setKeuangan] = useState(null);
  const [gajiList, setGajiList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [gajiRes, keuRes] = await Promise.all([
        api.get(`/gaji/all?bulan=${bulanSekarang}&tahun=${tahunSekarang}`),
        api.get(`/keuangan/rekap?bulan=${bulanSekarang}&tahun=${tahunSekarang}`),
      ]);

      if (gajiRes.data?.success) setGajiList(gajiRes.data.data);
      if (keuRes.data?.success) setKeuangan(keuRes.data.data);
    } catch (err) {
      console.error('Gagal memuat data dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [bulanSekarang, tahunSekarang]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <div className={styles.loadingState}>Memuat dashboard...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.cardsRow}>
        {/* ─── Card 1: Mengelola Gaji ────────── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <MdAttachMoney style={{ color: '#1e40af', fontSize: '1.25rem' }} />
            <h3>Mengelola Gaji</h3>
          </div>
          <div className={styles.cardBody} style={{ padding: 0 }}>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Tutor</th>
                    <th className={styles.colNominal}>Gaji Neto</th>
                  </tr>
                </thead>
                <tbody>
                  {gajiList.length === 0 ? (
                    <tr>
                      <td colSpan={2} className={styles.emptyCell}>
                        Belum ada data gaji
                      </td>
                    </tr>
                  ) : (
                    gajiList.slice(0, 10).map((row) => (
                      <tr key={row.id_tutor}>
                        <td>{row.nama_tutor}</td>
                        <td className={styles.colNominal}>
                          {formatRupiah(row.total_gaji)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className={styles.cardFooter}>
            <span style={{ fontSize: '.75rem', color: '#94a3b8' }}>
              {gajiList.length} tutor aktif
            </span>
            <Link to="/owner/kelola-gaji" className={styles.cardFooterLink}>
              Lihat Detail →
            </Link>
          </div>
        </div>

        {/* ─── Card 2: Laporan Keuangan ────────── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <MdAssessment style={{ color: '#16a34a', fontSize: '1.25rem' }} />
            <h3>Laporan Keuangan</h3>
          </div>
          <div className={styles.cardBody}>
            {keuangan ? (
              <div className={styles.keuanganGrid}>
                <div className={styles.keuanganItem}>
                  <span className={styles.keuanganLabel}>Pemasukan</span>
                  <span className={`${styles.keuanganNominal} ${styles.keuanganHijau}`}>
                    {formatRupiah(keuangan.total_pendapatan)}
                  </span>
                </div>
                <div className={styles.keuanganItem}>
                  <span className={styles.keuanganLabel}>Pengeluaran</span>
                  <span className={`${styles.keuanganNominal} ${styles.keuanganMerah}`}>
                    {formatRupiah(keuangan.total_pengeluaran)}
                  </span>
                  <span className={styles.keuanganBreakdown}>
                    Gaji: {formatRupiah(keuangan.gaji_tutor_total || 0)}
                    {' + '}
                    Operasional: {formatRupiah(keuangan.pengeluaran_bimbel_total || 0)}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '.813rem', textAlign: 'center', padding: 16 }}>
                Belum ada data keuangan
              </div>
            )}
          </div>
          <div className={styles.cardFooter}>
            <span style={{ fontSize: '.75rem', color: '#94a3b8' }}>
              {keuangan ? `${keuangan.periode.bulan}/${keuangan.periode.tahun}` : '-'}
            </span>
            <Link to="/owner/laporan-keuangan" className={styles.cardFooterLink}>
              Lihat Detail →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  MdCalendarMonth,
  MdCheckCircle,
  MdRefresh,
  MdSave,
} from 'react-icons/md';
import api from '../../../services/api';
import AdminLayout from '../../../components/admin/AdminLayout';
import styles from './presensi_tutor.module.css';

const formatTanggalPanjang = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

const formatPenempatanLabel = (item) => {
  if (item?.nama_mapel && item?.nama_kelas && item.nama_mapel !== item.nama_kelas) {
    return `${item.nama_mapel} - ${item.nama_kelas}`;
  }
  return item?.nama_kelas || item?.nama_mapel || '-';
};

const PresensiTutor = () => {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({
    hari: '',
    tanggal: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchPresensiTutor = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/absensi-tutor/today');
      const data = Array.isArray(response.data?.data) ? response.data.data : [];

      setRows(
        data.map((item) => ({
          ...item,
          status: item.status || '',
        }))
      );
      setMeta(response.data?.meta || { hari: '', tanggal: '' });
    } catch (err) {
      console.error('Fetch presensi tutor error:', err);
      setRows([]);
      setError('Gagal memuat data presensi tutor hari ini.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPresensiTutor();
  }, [fetchPresensiTutor]);

  const tanggalLabel = useMemo(() => formatTanggalPanjang(meta.tanggal), [meta.tanggal]);

  const handleStatusChange = (idTutor, status) => {
    setRows((prev) =>
      prev.map((item) => (
        item.id_tutor === idTutor
          ? { ...item, status }
          : item
      ))
    );
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (rows.length === 0) {
      setError('Belum ada tutor terjadwal untuk hari ini.');
      return;
    }

    const belumDipilih = rows.find((item) => !item.status);
    if (belumDipilih) {
      setError(`Status kehadiran untuk ${belumDipilih.nama_tutor} belum dipilih.`);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        tanggal: meta.tanggal,
        absensi: rows.map((item) => ({
          id_tutor: item.id_tutor,
          status: item.status,
        })),
      };

      const response = await api.post('/absensi-tutor/bulk', payload);
      setSuccess(response.data?.message || 'Presensi tutor berhasil disimpan.');
      await fetchPresensiTutor();
    } catch (err) {
      console.error('Save presensi tutor error:', err);
      setError(err.response?.data?.message || 'Gagal menyimpan presensi tutor.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      {error && (
        <div className={styles.alertError} role="alert">
          <span>{error}</span>
          <button
            type="button"
            className={styles.alertClose}
            onClick={() => setError(null)}
            aria-label="Tutup pesan error"
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className={styles.successCard} role="status">
          <div className={styles.successHeader}>
            <span className={styles.successIcon}>
              <MdCheckCircle />
            </span>
            <div>
              <p className={styles.successTitle}>Presensi berhasil disimpan</p>
              <p className={styles.successSubtitle}>{success}</p>
            </div>
          </div>
          <button
            type="button"
            className={styles.successClose}
            onClick={() => setSuccess(null)}
            aria-label="Tutup notifikasi sukses"
          >
            ×
          </button>
        </div>
      )}

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <h2 className={styles.pageTitle}>Presensi Tutor</h2>
          <p className={styles.pageSubtitle}>
            Verifikasi kehadiran pengajar berdasarkan jadwal kelas hari ini.
          </p>
        </div>

        <div className={styles.heroActions}>
          <button
            type="button"
            className={styles.btnRefresh}
            onClick={fetchPresensiTutor}
            disabled={loading}
          >
            <MdRefresh className={loading ? styles.spin : ''} />
            <span>Refresh</span>
          </button>

          <div className={styles.dateBadge}>
            <MdCalendarMonth />
            <span>{tanggalLabel}</span>
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.columnNo}>No</th>
                <th>Nama Tutor</th>
                <th>Penempatan Kelas</th>
                <th>Sesi / Jam</th>
                <th>Status Kehadiran</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className={styles.emptyCell}>
                    Memuat data presensi tutor...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.emptyCell}>
                    Belum ada tutor yang memiliki jadwal pada hari ini.
                  </td>
                </tr>
              ) : (
                rows.map((item, index) => (
                  <tr key={item.id_tutor}>
                    <td className={styles.numberCell}>{index + 1}</td>
                    <td>
                      <p className={styles.tutorName}>{item.nama_tutor}</p>
                    </td>
                    <td>
                      <div className={styles.classList}>
                        {item.penempatan.map((kelas) => (
                          <span key={`${item.id_tutor}-${kelas.id_kelas}`} className={styles.classBadge}>
                            {formatPenempatanLabel(kelas)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className={styles.sessionList}>
                        {item.sesi.map((sesi) => (
                          <div key={`${item.id_tutor}-${sesi.label}-${sesi.jam}`} className={styles.sessionItem}>
                            <span className={styles.sessionLabel}>{sesi.label}</span>
                            <span className={styles.sessionTime}>{sesi.jam}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className={styles.radioGroup} role="radiogroup" aria-label={`Status ${item.nama_tutor}`}>
                        <label className={styles.radioOption}>
                          <input
                            type="radio"
                            name={`status-${item.id_tutor}`}
                            value="Hadir"
                            checked={item.status === 'Hadir'}
                            onChange={() => handleStatusChange(item.id_tutor, 'Hadir')}
                          />
                          <span className={styles.radioDot} />
                          <span className={styles.radioText}>Hadir</span>
                        </label>

                        <label className={styles.radioOption}>
                          <input
                            type="radio"
                            name={`status-${item.id_tutor}`}
                            value="Absen"
                            checked={item.status === 'Absen'}
                            onChange={() => handleStatusChange(item.id_tutor, 'Absen')}
                          />
                          <span className={styles.radioDot} />
                          <span className={styles.radioText}>Absen</span>
                        </label>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.footerAction}>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={handleSubmit}
            disabled={saving || loading || rows.length === 0}
          >
            <MdSave />
            <span>{saving ? 'Menyimpan...' : 'Simpan Presensi Hari Ini'}</span>
          </button>
        </div>
      </section>
    </AdminLayout>
  );
};

export default PresensiTutor;

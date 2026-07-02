import React, { useEffect, useState, useCallback } from 'react';
import api from '../../../services/api';
import styles from './pengaturan.module.css';

const SETTINGS_META = {
  biaya_pendaftaran: {
  label: 'Biaya Pendaftaran',
  description: 'Biaya awal pendaftaran siswa baru (Rp)',
  type: 'number'
},
  bonus_kehadiran_nominal: { label: 'Nominal Bonus Kehadiran', description: 'Nominal bonus per tutor per bulan (Rp) — Owner pilih manual siapa yang dapat', type: 'number' },
  infal_nominal: { label: 'Nominal Infal', description: 'Nominal per infal (Rp)', type: 'number' },
  persentase_gaji_tutor: { label: 'Persentase Gaji Tutor', description: 'Persentase gaji tutor dari total SPP (%)', type: 'number' },
  hari_kerja_per_bulan: { label: 'Hari Kerja per Bulan', description: 'Jumlah hari kerja normal dalam sebulan', type: 'number' },
};

const Pengaturan = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      if (res.data?.success) {
        setSettings(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat pengaturan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: { ...prev[key], value: String(value) },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const payload = {};
      Object.entries(settings).forEach(([key, val]) => {
        payload[key] = val.value;
      });

      const res = await api.put('/settings', { settings: payload });
      if (res.data?.success) {
        setSuccessMsg('Pengaturan berhasil disimpan');
        fetchSettings();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.loadingState}>Memuat pengaturan...</div>;

  return (
    <div className={styles.container}>
      {successMsg && <div className={styles.successAlert}>{successMsg}</div>}
      {error && <div className={styles.errorAlert}>{error}</div>}

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Pengaturan Sistem</h2>
          <p className={styles.cardSubtitle}>Konfigurasi perhitungan gaji dan bonus yang dapat diatur oleh Owner</p>
        </div>

        <div className={styles.cardBody}>
          {Object.entries(SETTINGS_META).map(([key, meta]) => {
            const currentVal = settings[key]?.value;

            return (
              <div key={key} className={styles.settingRow}>
                <div className={styles.settingInfo}>
                  <span className={styles.settingLabel}>{meta.label}</span>
                  <span className={styles.settingDesc}>{meta.description}</span>
                </div>
                <div className={styles.settingInput}>
                  {meta.type === 'boolean' ? (
                    <label className={styles.toggle}>
                      <input
                        type="checkbox"
                        checked={currentVal === 'true'}
                        onChange={(e) => handleChange(key, e.target.checked ? 'true' : 'false')}
                      />
                      <span className={styles.toggleSlider} />
                      <span className={styles.toggleLabel}>
                        {currentVal === 'true' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </label>
                  ) : (
                    <input
                      type="number"
                      className={styles.numberInput}
                      value={currentVal || ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.cardFooter}>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pengaturan;

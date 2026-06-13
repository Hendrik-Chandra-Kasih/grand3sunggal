import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {
  MdDashboard,
  MdPersonAdd,
  MdPayments,
  MdSchool,
  MdCalendarMonth,
  MdHowToReg,
  MdAssessment,
  MdLogout,
  MdSearch,
  MdCheckCircle,
  MdRefresh,
  MdInfo,
} from 'react-icons/md';
import api from '../../../services/api';
import styles from './pembayaran_siswa.module.css';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: MdDashboard, to: '/admin/dashboard' },
  { label: 'Pendaftaran Siswa', icon: MdPersonAdd, to: '/admin/pendaftaran' },
  { label: 'Pembayaran Siswa', icon: MdPayments, to: '/admin/pembayaran' },
  { label: 'Sistem Manajemen Guru', icon: MdSchool, to: '/admin/guru' },
  { label: 'Jadwal', icon: MdCalendarMonth, to: '/admin/jadwal' },
  { label: 'Rekap Absensi', icon: MdHowToReg, to: '/admin/absensi' },
  { label: 'Laporan', icon: MdAssessment, to: '/admin/laporan' },
];

const JENIS_PEMBAYARAN_OPTIONS = [
  { value: 'SPP', label: 'SPP Bulanan' },
  { value: 'Modul', label: 'Modul / Buku' },
];

const METODE_PEMBAYARAN_OPTIONS = [
  { value: 'Tunai', label: 'Tunai' },
  { value: 'Transfer', label: 'Transfer' },
];

const formatRupiah = (value) => {
  const num = Number(value) || 0;
  return `Rp ${num.toLocaleString('en-US')}`;
};

const formatNumericInput = (value) => {
  if (value === '' || value === null || value === undefined) return '';
  const num = String(value).replace(/\D/g, '');
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parseNumericInput = (value) => {
  if (value === '' || value === null || value === undefined) return 0;
  return Number(String(value).replace(/\./g, '')) || 0;
};

const buildKuitansiId = (id) => {
  if (!id) return '—';
  const year = new Date().getFullYear();
  return `KWT/${year}/${String(id).padStart(3, '0')}`;
};

const buildBulanTagihan = (date = new Date()) => {
  const BULAN_INDONESIA = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  return `${BULAN_INDONESIA[date.getMonth()]} ${date.getFullYear()}`;
};

const INITIAL_FORM = {
  search: '',
  selectedSiswa: null,
  namaLengkap: '',
  kelas: '',
  jenisPembayaran: '',
  metodePembayaran: 'Tunai',
  jumlahDibayar: '',
};

const PembayaranSiswa = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // ─── Auth & user ─────────────────────────────────────────────
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  // Tutup dropdown ketika klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce search
  useEffect(() => {
    const keyword = form.search.trim();
    if (!keyword) {
      setSearchResults([]);
      setShowDropdown(false);
      setSearchError(null);
      return;
    }
    if (form.selectedSiswa && form.selectedSiswa.nama === keyword) {
      // Tidak perlu cari ulang untuk siswa yang sudah dipilih
      return;
    }

    setSearching(true);
    setSearchError(null);
    const timer = setTimeout(async () => {
      try {
        const response = await api.get('/siswa');
        const all = response.data?.data || [];
        const filtered = all.filter((s) =>
          String(s.nama || '').toLowerCase().includes(keyword.toLowerCase())
        );
        setSearchResults(filtered.slice(0, 8));
        setShowDropdown(true);
        if (filtered.length === 0) {
          setSearchError('Siswa tidak ditemukan');
        }
      } catch (err) {
        console.error('Search siswa error:', err);
        setSearchError('Gagal mencari data siswa');
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [form.search, form.selectedSiswa]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setForm((prev) => ({
      ...prev,
      search: value,
      // Reset siswa yang dipilih jika query berubah
      selectedSiswa: prev.selectedSiswa && prev.selectedSiswa.nama === value
        ? prev.selectedSiswa
        : null,
      namaLengkap: '',
      kelas: '',
    }));
  };

  const handleSelectSiswa = (siswa) => {
    setForm((prev) => ({
      ...prev,
      search: siswa.nama,
      selectedSiswa: siswa,
      namaLengkap: siswa.nama,
      kelas: siswa.kelas || '',
    }));
    setShowDropdown(false);
    setSearchError(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'jumlahDibayar') {
      setForm((prev) => ({ ...prev, [name]: formatNumericInput(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ─── Hitung ringkasan ─────────────────────────────────────────
  const totalTagihan = useMemo(() => {
    if (!form.selectedSiswa) return 0;
    if (form.jenisPembayaran === 'SPP') {
      return Number(form.selectedSiswa.spp) || 0;
    }
    if (form.jenisPembayaran === 'Modul') {
      return 0; // Nominal modul/buku ditentukan manual via jumlahDibayar
    }
    return 0;
  }, [form.selectedSiswa, form.jenisPembayaran]);

  const jumlahNumeric = parseNumericInput(form.jumlahDibayar);
  const kembalian = Math.max(jumlahNumeric - totalTagihan, 0);
  const kurangBayar = totalTagihan > 0 && jumlahNumeric > 0
    ? Math.max(totalTagihan - jumlahNumeric, 0)
    : 0;

  // ─── Submit & reset ───────────────────────────────────────────
  const handleReset = () => {
    setForm(INITIAL_FORM);
    setSubmitError(null);
    setSubmitResult(null);
    setSearchError(null);
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError(null);

    if (!form.selectedSiswa) {
      setSubmitError('Pilih siswa terlebih dahulu dari hasil pencarian.');
      return;
    }
    if (!form.jenisPembayaran) {
      setSubmitError('Pilih jenis pembayaran.');
      return;
    }
    if (!form.metodePembayaran) {
      setSubmitError('Pilih metode pembayaran.');
      return;
    }
    if (jumlahNumeric <= 0) {
      setSubmitError('Jumlah uang dibayar harus lebih dari 0.');
      return;
    }

    setSubmitting(true);
    const today = new Date();

    const payload = {
      id_siswa: form.selectedSiswa.id_siswa,
      bulan: buildBulanTagihan(today),
      tanggal_bayar: today.toISOString().slice(0, 10),
      jenis_pembayaran: form.jenisPembayaran,
      jumlah: jumlahNumeric,
      metode_pembayaran: form.metodePembayaran,
      diskon: 0,
      status: 'Pending',
      catatan: null,
    };

    try {
      const response = await api.post('/pembayaran', payload);
      const created = response.data?.data;
      setSubmitResult({
        siswa: form.selectedSiswa,
        kuitansiId: buildKuitansiId(created?.id_pembayaran),
        jenis: form.jenisPembayaran,
        metode: form.metodePembayaran,
        jumlah: jumlahNumeric,
        kembalian,
        total: totalTagihan,
      });
      handleReset();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Submit pembayaran error:', err);
      const apiMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Gagal menyimpan data pembayaran.';
      setSubmitError(apiMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.appShell}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandLogo}>
            <MdSchool style={{ fontVariationSettings: "'FILL' 1" }} />
          </div>
          <div>
            <h2 className={styles.brandTitle}>GT Sunggal</h2>
            <p className={styles.brandSubtitle}>Management System</p>
          </div>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                }
              >
                <Icon className={styles.navIcon} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <button
            type="button"
            className={`${styles.navItem} ${styles.navItemLogout}`}
            onClick={handleLogout}
          >
            <MdLogout className={styles.navIcon} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        <header className={styles.topBar}>
          <h1 className={styles.pageTitle}>Administrator</h1>
          <div className={styles.userBlock}>
            <div className={styles.userInfo}>
              <p className={styles.userName}>{user?.username || 'Admin Utama'}</p>
              <p className={styles.userRole}>Super User</p>
            </div>
            <div className={styles.avatar} aria-label="User profile" />
          </div>
        </header>

        <section className={styles.content}>
          <div className={styles.pageHeader}>
            <h2 className={styles.formTitle}>PEMBAYARAN SISWA</h2>
          </div>

          {submitError && (
            <div className={styles.alertError} role="alert">
              <span>{submitError}</span>
              <button
                type="button"
                className={styles.alertClose}
                onClick={() => setSubmitError(null)}
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          )}

          {submitResult && (
            <section className={styles.successCard} role="status">
              <div className={styles.successHeader}>
                <div className={styles.successIcon}>
                  <MdCheckCircle />
                </div>
                <div>
                  <h3 className={styles.successTitle}>Pembayaran Tersimpan</h3>
                  <p className={styles.successSubtitle}>
                    Pembayaran atas nama <strong>{submitResult.siswa.nama}</strong> berhasil
                    dicatat dengan nomor kuitansi <strong>{submitResult.kuitansiId}</strong>.
                    Transaksi berstatus <em>Pending</em> menunggu verifikasi.
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.successClose}
                  onClick={() => setSubmitResult(null)}
                  aria-label="Tutup"
                >
                  ×
                </button>
              </div>
              <button
                type="button"
                className={styles.btnRegisterAnother}
                onClick={() => setSubmitResult(null)}
              >
                <MdRefresh />
                Buat Pembayaran Lainnya
              </button>
            </section>
          )}

          <form className={styles.formGrid} onSubmit={handleSubmit}>
            {/* Left column: form fields */}
            <div className={styles.formColumn}>
              <section className={styles.card}>
                <header className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>
                    <MdInfo className={styles.cardTitleIcon} />
                    Informasi Pembayaran
                  </h3>
                </header>

                <div className={styles.cardBody}>
                  {/* 1. Cari Nama Siswa */}
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="search">
                      Cari Nama Siswa
                    </label>
                    <div className={styles.searchWrap} ref={searchRef}>
                      <MdSearch className={styles.searchIcon} />
                      <input
                        id="search"
                        name="search"
                        type="text"
                        className={styles.input}
                        placeholder="Ketik nama (misal: Regan-1)"
                        value={form.search}
                        onChange={handleSearchChange}
                        onFocus={() => {
                          if (searchResults.length > 0) setShowDropdown(true);
                        }}
                        autoComplete="off"
                      />
                      {showDropdown && (searchResults.length > 0 || searching || searchError) && (
                        <ul className={styles.dropdown} ref={dropdownRef}>
                          {searching && (
                            <li className={styles.dropdownHint}>Mencari…</li>
                          )}
                          {!searching && searchError && searchResults.length === 0 && (
                            <li className={styles.dropdownHint}>{searchError}</li>
                          )}
                          {!searching && searchResults.map((siswa) => (
                            <li
                              key={siswa.id_siswa}
                              className={styles.dropdownItem}
                              onClick={() => handleSelectSiswa(siswa)}
                            >
                              <span className={styles.dropdownName}>{siswa.nama}</span>
                              <span className={styles.dropdownMeta}>
                                {siswa.kelas || '—'}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* 2 & 3. Nama Lengkap & Kelas */}
                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="namaLengkap">
                        Nama Lengkap
                      </label>
                      <input
                        id="namaLengkap"
                        name="namaLengkap"
                        type="text"
                        className={styles.input}
                        placeholder="Otomatis terisi"
                        value={form.namaLengkap}
                        readOnly
                      />
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="kelas">
                        Kelas
                      </label>
                      <input
                        id="kelas"
                        name="kelas"
                        type="text"
                        className={styles.input}
                        placeholder="Otomatis terisi"
                        value={form.kelas}
                        readOnly
                      />
                    </div>
                  </div>

                  {/* 4 & 5. Jenis & Metode Pembayaran */}
                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="jenisPembayaran">
                        Jenis Pembayaran
                      </label>
                      <select
                        id="jenisPembayaran"
                        name="jenisPembayaran"
                        className={styles.input}
                        value={form.jenisPembayaran}
                        onChange={handleInputChange}
                      >
                        <option value="">Pilih jenis…</option>
                        {JENIS_PEMBAYARAN_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="metodePembayaran">
                        Metode Pembayaran
                      </label>
                      <select
                        id="metodePembayaran"
                        name="metodePembayaran"
                        className={styles.input}
                        value={form.metodePembayaran}
                        onChange={handleInputChange}
                      >
                        {METODE_PEMBAYARAN_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 6. Jumlah Uang Dibayar */}
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="jumlahDibayar">
                      Jumlah Uang Dibayar (Rp)
                    </label>
                    <input
                      id="jumlahDibayar"
                      name="jumlahDibayar"
                      type="text"
                      inputMode="numeric"
                      className={styles.input}
                      placeholder="Masukkan jumlah uang…"
                      value={form.jumlahDibayar}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* 7 & 8. Tombol Simpan & Reset */}
                  <div className={styles.actionRow}>
                    <button
                      type="submit"
                      className={styles.btnPrimary}
                      disabled={submitting}
                    >
                      {submitting ? 'Menyimpan…' : 'Simpan Transaksi'}
                    </button>
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      onClick={handleReset}
                      disabled={submitting}
                    >
                      <MdRefresh className={styles.btnIcon} />
                      Reset
                    </button>
                  </div>
                </div>
              </section>
            </div>

            {/* Right column: ringkasan */}
            <aside className={styles.summaryColumn}>
              <section className={`${styles.card} ${styles.summaryCard}`}>
                <header className={styles.summaryHeader}>
                  <h3 className={styles.summaryTitle}>RINGKASAN</h3>
                </header>

                <div className={styles.summaryBody}>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>No. Kuitansi:</span>
                    <span className={styles.summaryValue}>
                      {submitResult?.kuitansiId || '—'}
                    </span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Status:</span>
                    <span
                      className={`${styles.summaryValue} ${
                        submitResult ? styles.statusPending : styles.summaryMuted
                      }`}
                    >
                      {submitResult ? 'Menunggu Verifikasi' : 'Belum Disimpan'}
                    </span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Siswa:</span>
                    <span
                      className={`${styles.summaryValue} ${
                        form.namaLengkap ? '' : styles.summaryMuted
                      }`}
                    >
                      {form.namaLengkap || '-'}
                    </span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Jenis:</span>
                    <span
                      className={`${styles.summaryValue} ${
                        form.jenisPembayaran ? '' : styles.summaryMuted
                      }`}
                    >
                      {form.jenisPembayaran === 'SPP'
                        ? 'SPP Bulanan'
                        : form.jenisPembayaran === 'Modul'
                        ? 'Modul / Buku'
                        : '-'}
                    </span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Uang Bayar:</span>
                    <span
                      className={`${styles.summaryValue} ${
                        jumlahNumeric > 0 ? '' : styles.summaryMuted
                      }`}
                    >
                      {formatRupiah(jumlahNumeric)}
                    </span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Kembalian:</span>
                    <span
                      className={`${styles.summaryValue} ${
                        kembalian > 0 ? styles.summaryAccent : styles.summaryMuted
                      }`}
                    >
                      {formatRupiah(kembalian)}
                    </span>
                  </div>

                  {kurangBayar > 0 && (
                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>Kurang:</span>
                      <span className={`${styles.summaryValue} ${styles.summaryDanger}`}>
                        {formatRupiah(kurangBayar)}
                      </span>
                    </div>
                  )}

                  <div className={styles.summaryTotalWrap}>
                    <p className={styles.summaryTotalLabel}>Total Tagihan:</p>
                    <p className={styles.summaryTotalValue}>
                      {formatRupiah(totalTagihan)}
                    </p>
                  </div>
                </div>
              </section>
            </aside>
          </form>
        </section>
      </main>
    </div>
  );
};

export default PembayaranSiswa;

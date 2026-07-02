import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdSearch,
  MdRefresh,
  MdAttachMoney,
  MdClose,
} from 'react-icons/md';
import api from '../../../services/api';
import styles from './pengeluaran_bimbel.module.css';

const formatRupiah = (nominal) => {
  if (nominal === null || nominal === undefined) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(nominal);
};

const formatTanggal = (isoDate) => {
  if (!isoDate) return '-';
  // Handle both ISO string "YYYY-MM-DD" and Date objects
  const dateStr = typeof isoDate === 'string' ? isoDate.split('T')[0] : null;
  const [y, m, d] = (dateStr || '').split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  const bulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  return `${d} ${bulan[m - 1]} ${y}`;
};

const todayISO = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const PengeluaranBimbel = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('tanggal_pengeluaran'); // 'tanggal_pengeluaran' | 'nominal'
  const [order, setOrder] = useState('DESC'); // 'ASC' | 'DESC'

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [formNominal, setFormNominal] = useState('');
  const [formTanggal, setFormTanggal] = useState(todayISO());
  const [formKeterangan, setFormKeterangan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Delete confirm
  const [deleteId, setDeleteId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        sortBy,
        order,
      };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get('/pengeluaran-bimbel', { params });
      if (res.data?.success) {
        setData(Array.isArray(res.data.data) ? res.data.data : []);
      } else {
        setError('Gagal memuat data pengeluaran');
      }
    } catch (err) {
      console.error('Gagal memuat data pengeluaran:', err);
      setError(err.response?.data?.message || 'Gagal memuat data pengeluaran');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [sortBy, order, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Total nominal dari filter yang sedang aktif
  const totalNominal = useMemo(() => {
    return data.reduce((sum, d) => sum + Number(d.nominal || 0), 0);
  }, [data]);

  const handleOpenAdd = () => {
    setModalMode('add');
    setEditingId(null);
    setFormNominal('');
    setFormTanggal(todayISO());
    setFormKeterangan('');
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setModalMode('edit');
    setEditingId(item.id_pengeluaran);
    setFormNominal(String(item.nominal ?? ''));
    setFormTanggal(
      item.tanggal_pengeluaran
        ? String(item.tanggal_pengeluaran).split('T')[0]
        : todayISO()
    );
    setFormKeterangan(item.keterangan || '');
    setFormError(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (submitting) return;
    setModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (formNominal === '' || formNominal === null) {
      setFormError('Nominal wajib diisi');
      return;
    }
    const numericNominal = Number(formNominal);
    if (Number.isNaN(numericNominal) || numericNominal < 0) {
      setFormError('Nominal harus berupa angka >= 0');
      return;
    }
    if (!formTanggal) {
      setFormError('Tanggal pengeluaran wajib diisi');
      return;
    }

    const payload = {
      nominal: numericNominal,
      tanggal_pengeluaran: formTanggal,
      keterangan: formKeterangan.trim(),
    };

    try {
      setSubmitting(true);
      const res =
        modalMode === 'add'
          ? await api.post('/pengeluaran-bimbel', payload)
          : await api.put(`/pengeluaran-bimbel/${editingId}`, payload);

      if (res.data?.success) {
        setModalOpen(false);
        fetchData();
      } else {
        setFormError(res.data?.message || 'Gagal menyimpan data');
      }
    } catch (err) {
      console.error('Gagal menyimpan pengeluaran:', err);
      setFormError(err.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await api.delete(`/pengeluaran-bimbel/${deleteId}`);
      if (res.data?.success) {
        setDeleteId(null);
        fetchData();
      }
    } catch (err) {
      console.error('Gagal menghapus:', err);
      setError(err.response?.data?.message || 'Gagal menghapus data');
    } finally {
      setDeleteId(null);
    }
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Pengeluaran Bimbel</h1>
          <p className={styles.pageSubtitle}>
            Catat dan kelola seluruh pengeluaran operasional bimbel
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnRefresh} onClick={fetchData} disabled={loading}>
            <MdRefresh className={styles.btnIcon} />
            {loading ? 'Memuat...' : 'Refresh'}
          </button>
          <button className={styles.btnPrimary} onClick={handleOpenAdd}>
            <MdAdd className={styles.btnIcon} />
            Tambah Pengeluaran
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
            <MdAttachMoney />
          </div>
          <div className={styles.statBody}>
            <span className={styles.statLabel}>Total Transaksi</span>
            <span className={styles.statValue}>{data.length}</span>
          </div>
        </div>
        <div className={styles.totalCard}>
          <div className={styles.totalBody}>
            <span className={styles.totalLabel}>Total Nominal</span>
            <span className={styles.totalValue}>{formatRupiah(totalNominal)}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Dari Tanggal</label>
          <input
            type="date"
            className={styles.dateInput}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Sampai Tanggal</label>
          <input
            type="date"
            className={styles.dateInput}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Urutkan Berdasarkan</label>
          <select
            className={styles.filterSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="tanggal_pengeluaran">Tanggal</option>
            <option value="nominal">Nominal</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Urutan</label>
          <select
            className={styles.filterSelect}
            value={order}
            onChange={(e) => setOrder(e.target.value)}
          >
            <option value="DESC">Descending (Terbesar / Terbaru)</option>
            <option value="ASC">Ascending (Terkecil / Terlama)</option>
          </select>
        </div>
        {(startDate || endDate) && (
          <button className={styles.btnClearFilter} onClick={handleClearFilter}>
            <MdClose className={styles.btnIconSmall} />
            Reset Filter
          </button>
        )}
      </div>

      {/* Error */}
      {error && <div className={styles.errorAlert}>{error}</div>}

      {/* Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: 56, textAlign: 'center' }}>No</th>
                <th>Tanggal</th>
                <th>Keterangan</th>
                <th style={{ textAlign: 'right' }}>Nominal</th>
                <th style={{ textAlign: 'center', width: 140 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className={styles.tableEmpty}>
                    Memuat data...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.tableEmpty}>
                    {startDate || endDate
                      ? 'Tidak ada data pengeluaran pada rentang tanggal ini.'
                      : 'Belum ada data pengeluaran.'}
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item.id_pengeluaran}>
                    <td className={styles.centerCell}>{index + 1}</td>
                    <td>{formatTanggal(item.tanggal_pengeluaran)}</td>
                    <td className={styles.keteranganCell}>
                      {item.keterangan || <span className={styles.muted}>—</span>}
                    </td>
                    <td className={styles.nominalCell}>
                      {formatRupiah(item.nominal)}
                    </td>
                    <td className={styles.actionCell}>
                      <button
                        type="button"
                        className={styles.btnEdit}
                        onClick={() => handleOpenEdit(item)}
                        title="Edit"
                      >
                        <MdEdit />
                      </button>
                      <button
                        type="button"
                        className={styles.btnDelete}
                        onClick={() => setDeleteId(item.id_pengeluaran)}
                        title="Hapus"
                      >
                        <MdDelete />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {modalOpen && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          onClick={handleCloseModal}
        >
          <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
            <header className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {modalMode === 'add' ? 'Tambah Pengeluaran' : 'Edit Pengeluaran'}
              </h3>
              <button
                type="button"
                className={styles.modalClose}
                onClick={handleCloseModal}
                aria-label="Tutup"
              >
                <MdClose />
              </button>
            </header>
            <form className={styles.modalBody} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Tanggal Pengeluaran <span className={styles.required}>*</span>
                </label>
                <input
                  type="date"
                  className={styles.formInput}
                  value={formTanggal}
                  onChange={(e) => setFormTanggal(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Nominal (Rp) <span className={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className={styles.formInput}
                  placeholder="Contoh: 500000"
                  value={formNominal}
                  onChange={(e) => setFormNominal(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Keterangan</label>
                <textarea
                  className={styles.formTextarea}
                  placeholder="Contoh: Beli alat tulis, Bayar listrik, dll."
                  value={formKeterangan}
                  onChange={(e) => setFormKeterangan(e.target.value)}
                  rows={3}
                  maxLength={255}
                />
              </div>

              {formError && <div className={styles.formError}>{formError}</div>}

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  Batal
                </button>
                <button type="submit" className={styles.btnPrimary} disabled={submitting}>
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          onClick={() => setDeleteId(null)}
        >
          <div
            className={styles.confirmDialog}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={styles.confirmTitle}>Hapus Pengeluaran?</h3>
            <p className={styles.confirmText}>
              Tindakan ini tidak dapat dibatalkan. Data pengeluaran akan dihapus permanen.
            </p>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setDeleteId(null)}
              >
                Batal
              </button>
              <button
                type="button"
                className={styles.btnDanger}
                onClick={handleDelete}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PengeluaranBimbel;

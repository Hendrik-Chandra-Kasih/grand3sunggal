import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Beranda.module.css';

function Beranda() {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>#1 Bimbel Terbaik di Sunggal</div>
          <h1 className={styles.title}>
            Belajar Lebih Mudah,<br />Prestasi Lebih <span>Tinggi</span>
          </h1>
          <p className={styles.heroDesc}>
            Wujudkan cita-citamu bersama pengajar profesional dan kurikulum yang menyenangkan.
          </p>
          <div className={styles.heroButtons}>
            <button className={styles.btnPrimary}>Mulai Belajar</button>
          </div>
        </div>
        <div className={styles.heroImage}>
          <div className={styles.heroImagePlaceholder}></div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>🎒</div>
            <h3 className={styles.cardTitle}>Program Unggulan</h3>
          </div>
          <ul className={styles.programGrid}>
            <li>Matematika</li>
            <li>Bahasa Inggris</li>
            <li>Fisika</li>
            <li>Kimia</li>
            <li>Biologi</li>
            <li>IPS Terpadu</li>
          </ul>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader} style={{ justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className={styles.cardIcon} style={{ color: '#f97316', backgroundColor: '#fff7ed' }}>📰</div>
              <h3 className={styles.cardTitle}>Berita & Pengumuman</h3>
            </div>
            <Link to="/berita" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Lihat Semua</Link>
          </div>
          <div className={styles.newsPlaceholder}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
            <div>Info Pendaftaran Gelombang II Tahun 2026</div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={styles.testimonials}>
        <div className={styles.flexBetween}>
          <div>
            <h2 className={styles.sectionTitle}>Apa Kata Orang Tua & Siswa?</h2>
            <p className={styles.sectionSubtitle}>Kisah sukses mereka bermula di Grand 3 Sunggal</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #e2e8f0', backgroundColor: 'white', cursor: 'pointer' }}>&lt;</button>
            <button style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #e2e8f0', backgroundColor: 'white', cursor: 'pointer' }}>&gt;</button>
          </div>
        </div>

        <div className={styles.testimonialGrid}>
          <div className={styles.testiCard}>
            <div className={styles.stars}>★★★★★</div>
            <p className={styles.quote}>"Sejak anak saya mengikuti bimbingan belajar di sini, nilainya meningkat cukup signifikan. Cara mengajarnya mudah dipahami dan Tutornya sangat sabar membimbing siswa."</p>
            <div className={styles.author}>
              <div className={styles.authorBadge} style={{ backgroundColor: '#dbeafe', color: '#1e3a8a' }}>RW</div>
              <div className={styles.authorInfo}>
                <h5>Ibu Rina Wijaya</h5>
                <p>Orang Tua Siswa Kelas IX</p>
              </div>
            </div>
          </div>

          <div className={styles.testiCard}>
            <div className={styles.stars}>★★★★★</div>
            <p className={styles.quote}>"Suasana belajarnya asik banget, tutornya ga kaku dan seru diajak diskusi. PR sesulit apapun jadi kerasa gampang kalau dikerjain bareng di sini."</p>
            <div className={styles.author}>
              <div className={styles.authorBadge} style={{ backgroundColor: '#dcfce7', color: '#14532d' }}>AD</div>
              <div className={styles.authorInfo}>
                <h5>Aditya Pratama</h5>
                <p>Siswa SMA 1 Medan</p>
              </div>
            </div>
          </div>

          <div className={styles.testiCard}>
            <div className={styles.stars}>★★★★★</div>
            <p className={styles.quote}>"Fasilitas ruangannya nyaman dan ber-AC. Sangat mendukung fokus belajar anak-anak di sore hari setelah pulang sekolah."</p>
            <div className={styles.author}>
              <div className={styles.authorBadge} style={{ backgroundColor: '#ffedd5', color: '#9a3412' }}>BS</div>
              <div className={styles.authorInfo}>
                <h5>Bapak Santoso</h5>
                <p>Wali Siswa Kelas 6 SD</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Profile Section */}
      <section className={styles.videoSection}>
        <div className={styles.flexBetween}>
          <h2 className={styles.sectionTitle}>Mengenal Lebih Dekat</h2>
          <Link to="/tentang" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Selengkapnya →</Link>
        </div>
        <div className={styles.videoContainer}>
          <div className={styles.playBtn}>▶</div>
          <div className={styles.videoText}>Tonton Video Profil Kami</div>
          <div className={styles.videoDuration}>Durasi: 2:45 menit</div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className={styles.gallery}>
        <h2 className={styles.sectionTitle} style={{ marginBottom: '2rem' }}>Galeri Kegiatan</h2>
        <div className={styles.galleryGrid}>
          <div className={styles.galleryItem}>1</div>
          <div className={styles.galleryItem}>2</div>
          <div className={styles.galleryItem}>3</div>
          <div className={styles.galleryItem}>4</div>
        </div>
      </section>
    </div>
  );
}

export default Beranda;

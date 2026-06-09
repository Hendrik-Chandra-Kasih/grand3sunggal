import React from 'react';
import styles from './Tutor.module.css';

// SVG Icons
const StarIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

const ArrowRightIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const SearchIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const PersonIcon = ({ size = 64, color = '#CBD5E1' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

function Tutor() {
  const tutors = [
    {
      id: 1,
      name: 'Ahmad Hidayat',
      subject: 'Matematika & Fisika',
      level: 'SMA',
      badgeClass: styles.badgeSMA,
      rating: 4.9,
      image: null // Menggunakan null untuk placeholder
    },
    {
      id: 2,
      name: 'Siti Aminah',
      subject: 'Bahasa Inggris',
      level: 'SMP / SMA',
      badgeClass: styles.badgeSMPSMA,
      rating: 5.0,
      image: null
    },
    {
      id: 3,
      name: 'Budi Santoso',
      subject: 'Tematik SD',
      level: 'SD',
      badgeClass: styles.badgeSD,
      rating: 4.8,
      image: null
    },
    {
      id: 4,
      name: 'Diana Putri',
      subject: 'Biologi & Kimia',
      level: 'SMA',
      badgeClass: styles.badgeSMA,
      rating: 4.9,
      image: null
    },
    {
      id: 5,
      name: 'Erik Wijaya',
      subject: 'Ekonomi & Akuntansi',
      level: 'SMA',
      badgeClass: styles.badgeSMA,
      rating: 4.8,
      image: null
    },
    {
      id: 6,
      name: 'Rina Kartika',
      subject: 'Bahasa Indonesia',
      level: 'SMP / SMA',
      badgeClass: styles.badgeSMPSMA,
      rating: 4.9,
      image: null
    },
    {
      id: 7,
      name: 'Fajar Ramadhan',
      subject: 'Sejarah & Geografi',
      level: 'SMP / SMA',
      badgeClass: styles.badgeSMPSMA,
      rating: 4.7,
      image: null
    },
    {
      id: 8,
      name: 'Lusi Amelia',
      subject: 'Seni Budaya',
      level: 'SD / SMP',
      badgeClass: styles.badgeSD,
      rating: 4.8,
      image: null
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Tutor Kami</h1>
        <p className={styles.subtitle}>Temukan pengajar ahli untuk membimbing perjalanan akademis Anda.</p>
      </div>

      <div className={styles.filterBox}>
        <div className={`${styles.filterGroup} ${styles.searchGroup}`}>
          <label className={styles.label}>Cari Tutor</label>
          <div className={styles.inputWrapper}>
            <span className={styles.searchIcon}>
              <SearchIcon />
            </span>
            <input type="text" className={styles.input} placeholder="Masukkan nama tutor..." />
          </div>
        </div>

        <div className={`${styles.filterGroup} ${styles.selectGroup}`}>
          <label className={styles.label}>Mata Pelajaran</label>
          <div className={styles.selectWrapper}>
            <select className={styles.select}>
              <option>Semua Mata Pelajaran</option>
              <option>Matematika</option>
              <option>Fisika</option>
              <option>Bahasa Inggris</option>
              <option>Biologi</option>
              <option>Kimia</option>
              <option>Ekonomi</option>
              <option>Akuntansi</option>
              <option>Sejarah</option>
              <option>Geografi</option>
              <option>Seni Budaya</option>
            </select>
            <span className={styles.selectIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </span>
          </div>
        </div>

        <div className={`${styles.filterGroup} ${styles.selectGroup}`}>
          <label className={styles.label}>Jenjang</label>
          <div className={styles.selectWrapper}>
            <select className={styles.select}>
              <option>Semua Jenjang</option>
              <option>SD</option>
              <option>SMP</option>
              <option>SMA</option>
            </select>
            <span className={styles.selectIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </span>
          </div>
        </div>
      </div>

      <div className={styles.tutorGrid}>
        {tutors.map(tutor => (
          <div key={tutor.id} className={styles.tutorCard}>
            <div className={styles.tutorImageContainer}>
              {tutor.image ? (
                <img src={tutor.image} alt={tutor.name} className={styles.tutorImage} />
              ) : (
                <div className={styles.tutorPlaceholder}>
                  <PersonIcon size={80} color="#94A3B8" />
                </div>
              )}
            </div>
            <div className={styles.tutorInfo}>
              <h3 className={styles.tutorName}>{tutor.name}</h3>
              <p className={styles.tutorSubject}>{tutor.subject}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Tutor;
        

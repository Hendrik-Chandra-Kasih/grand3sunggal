import React from 'react';
import styles from './Tutor.module.css';

function Tutor() {
  const tutors = [
    {
      id: 1,
      name: 'Ahmad Hidayat',
      subject: 'Matematika & Fisika',
      level: 'SMA',
      badgeClass: styles.badgeSMA,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 2,
      name: 'Siti Aminah',
      subject: 'Bahasa Inggris',
      level: 'SMP / SMA',
      badgeClass: styles.badgeSMPSMA,
      rating: 5.0,
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 3,
      name: 'Budi Santoso',
      subject: 'Tematik SD',
      level: 'SD',
      badgeClass: styles.badgeSD,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 4,
      name: 'Diana Putri',
      subject: 'Biologi & Kimia',
      level: 'SMA',
      badgeClass: styles.badgeSMA,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 5,
      name: 'Erik Wijaya',
      subject: 'Ekonomi & Akuntansi',
      level: 'SMA',
      badgeClass: styles.badgeSMA,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 6,
      name: 'Rina Kartika',
      subject: 'Bahasa Indonesia',
      level: 'SMP / SMA',
      badgeClass: styles.badgeSMPSMA,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1598550874175-4d0ef43ce416?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 7,
      name: 'Fajar Ramadhan',
      subject: 'Sejarah & Geografi',
      level: 'SMP / SMA',
      badgeClass: styles.badgeSMPSMA,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 8,
      name: 'Lusi Amelia',
      subject: 'Seni Budaya',
      level: 'SD / SMP',
      badgeClass: styles.badgeSD,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600'
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input type="text" className={styles.input} placeholder="Masukkan nama tutor..." />
          </div>
        </div>

        <div className={`${styles.filterGroup} ${styles.selectGroup}`}>
          <label className={styles.label}>Kelas</label>
          <div className={styles.selectWrapper}>
            <select className={styles.select} defaultValue="">
              <option value="" disabled hidden>Semua Kelas</option>
              <option value="all">Semua Kelas</option>
              <option value="sd">SD</option>
              <option value="smp">SMP</option>
              <option value="sma">SMA</option>
            </select>
            <span className={styles.selectIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </span>
          </div>
        </div>

        <div className={`${styles.filterGroup} ${styles.selectGroup}`}>
          <label className={styles.label}>Gender</label>
          <div className={styles.selectWrapper}>
            <select className={styles.select} defaultValue="">
              <option value="" disabled hidden>Semua Gender</option>
              <option value="all">Semua Gender</option>
              <option value="male">Laki-laki</option>
              <option value="female">Perempuan</option>
            </select>
            <span className={styles.selectIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </span>
          </div>
        </div>

        <button className={styles.searchButton}>Cari Sekarang</button>
      </div>

      <div className={styles.tutorGrid}>
        {tutors.map((tutor) => (
          <div key={tutor.id} className={styles.tutorCard}>
            <div className={styles.cardImageWrapper}>
              <img src={tutor.image} alt={tutor.name} className={styles.cardImage} />
              <span className={`${styles.badge} ${tutor.badgeClass}`}>{tutor.level}</span>
            </div>
            <div className={styles.cardBody}>
              <h3 className={styles.tutorName}>{tutor.name}</h3>
              <p className={styles.tutorSubject}>{tutor.subject}</p>
              
              <div className={styles.divider}></div>
              
              <div className={styles.cardFooter}>
                <div className={styles.rating}>
                  <svg className={styles.starIcon} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  {tutor.rating}
                </div>
                <a href={`#tutor-${tutor.id}`} className={styles.profileLink}>
                  Profil Lengkap
                  <svg className={styles.arrowIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.pagination}>
        <button className={styles.pageButton}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button className={`${styles.pageButton} ${styles.active}`}>1</button>
        <button className={styles.pageButton}>2</button>
        <button className={styles.pageButton}>3</button>
        <button className={styles.pageButton}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Tutor;

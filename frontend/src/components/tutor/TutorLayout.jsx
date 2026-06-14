import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {
  MdSchool,
  MdPerson,
  MdCalendarMonth,
  MdHowToReg,
  MdAttachMoney,
  MdLogout,
} from 'react-icons/md';
import styles from './TutorLayout.module.css';

const NAV_ITEMS = [
  { label: 'Profile', icon: MdPerson, to: '/tutor/profile' },
  { label: 'Jadwal Mengajar', icon: MdCalendarMonth, to: '/tutor/jadwal-mengajar' },
  { label: 'Kehadiran', icon: MdHowToReg, to: '/tutor/kehadiran' },
  { label: 'Gaji', icon: MdAttachMoney, to: '/tutor/gaji' },
];

function TutorLayout({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
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

      {/* Main wrapper */}
      <main className={styles.main}>
        {/* Header */}
        <header className={styles.topBar}>
          <h1 className={styles.pageTitle}>Tutor</h1>
          <div className={styles.userBlock}>
            <div className={styles.userInfo}>
              <p className={styles.userName}>{user?.nama || 'Tutor'}</p>
              <p className={styles.userRole}>Tutor</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <section className={styles.content}>{children}</section>
      </main>
    </div>
  );
}

export default TutorLayout;

import styles from './Home.module.css'

function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.badge}>🚀 Fullstack App</div>
        <h1 className={styles.title}>
          Grand3Sunggal
        </h1>
        <p className={styles.subtitle}>
          React.js + Vite · Express.js · MySQL
        </p>
        <div className={styles.actions}>
          <a href="/api/health" className={styles.btnPrimary}>
            Cek API Health
          </a>
          <a
            href="https://vitejs.dev"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnSecondary}
          >
            Vite Docs
          </a>
        </div>
      </div>

      <div className={styles.cards}>
        <div className={styles.card}>
          <span className={styles.cardIcon}>⚛️</span>
          <h3>Frontend</h3>
          <p>React 18 + Vite 5<br />React Router DOM<br />Axios HTTP Client</p>
        </div>
        <div className={styles.card}>
          <span className={styles.cardIcon}>🟢</span>
          <h3>Backend</h3>
          <p>Express.js<br />JWT Authentication<br />RESTful API</p>
        </div>
        <div className={styles.card}>
          <span className={styles.cardIcon}>🗄️</span>
          <h3>Database</h3>
          <p>MySQL 8<br />mysql2 Driver<br />Connection Pool</p>
        </div>
      </div>
    </div>
  )
}

export default Home

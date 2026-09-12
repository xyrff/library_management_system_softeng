import styles from './StatCard.module.css';

export default function StatCard({ label, value, icon, color = 'primary', trend }) {
  return (
    <div className={`${styles.card} ${styles[color]}`}>
      <div className={styles.top}>
        <div className={styles.info}>
          <p className={styles.label}>{label}</p>
          <p className={styles.value}>{value}</p>
          {trend && <p className={styles.trend}>{trend}</p>}
        </div>
        <div className={styles.iconBox}>{icon}</div>
      </div>
    </div>
  );
}

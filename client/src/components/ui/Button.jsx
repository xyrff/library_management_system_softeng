import styles from './Button.module.css';

export default function Button({ children, variant = 'primary', size = 'md', onClick, disabled, type = 'button', fullWidth, icon }) {
  return (
    <button
      type={type}
      className={`${styles.btn} ${styles[variant]} ${styles[size]} ${fullWidth ? styles.fullWidth : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </button>
  );
}

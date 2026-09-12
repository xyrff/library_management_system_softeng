import styles from './Card.module.css';

export default function Card({ children, className = '', padding = 'md', hover }) {
  return (
    <div className={`${styles.card} ${styles[`p-${padding}`]} ${hover ? styles.hover : ''} ${className}`}>
      {children}
    </div>
  );
}

import styles from './EmptyState.module.css';
import Button from './Button';

export default function EmptyState({ icon, title, description, actionLabel, onAction }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.illustration}>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.desc}>{description}</p>}
      {actionLabel && <Button onClick={onAction}>{actionLabel}</Button>}
    </div>
  );
}

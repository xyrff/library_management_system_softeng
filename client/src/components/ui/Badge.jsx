import styles from './Badge.module.css';

const variantMap = {
  available:  'success',
  borrowed:   'info',
  overdue:    'danger',
  pending:    'warning',
  approved:   'success',
  returned:   'neutral',
  rejected:   'danger',
  'low risk': 'success',
  'high risk':'danger',
  'new borrower': 'warning',
};

export default function Badge({ label, variant }) {
  const v = variant || variantMap[label?.toLowerCase()] || 'neutral';
  return <span className={`${styles.badge} ${styles[v]}`}>{label}</span>;
}

import { useNavigate } from 'react-router-dom';
import { Library } from 'lucide-react';
import Button from '../components/ui/Button';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className={styles.page}>
      <div className={styles.icon}><Library size={40} /></div>
      <h1 className={styles.code}>404</h1>
      <h2 className={styles.title}>Page not found</h2>
      <p className={styles.desc}>
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Button onClick={() => navigate(-1)}>Go Back</Button>
    </div>
  );
}

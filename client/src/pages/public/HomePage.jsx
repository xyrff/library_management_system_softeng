import { useNavigate } from 'react-router-dom';
import { BookMarked, BookOpen, Bookmark, Library } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { APP_NAME, APP_SUBTITLE } from '../../constants/branding';
import styles from './HomePage.module.css';

const features = [
  {
    icon: <BookOpen size={20} />,
    title: 'Browse the catalog',
    description: 'Find your next read across the school library collection.',
  },
  {
    icon: <BookMarked size={20} />,
    title: 'Track your borrows',
    description: 'Keep up with active loans, due dates, and your borrowing history.',
  },
  {
    icon: <Bookmark size={20} />,
    title: 'Reserve unavailable books',
    description: 'Join the queue and get notified when a book is ready for pickup.',
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brandIcon}><Library size={22} /></div>
        <div>
          <p className={styles.brandName}>{APP_NAME}</p>
          <p className={styles.brandSubtitle}>{APP_SUBTITLE}</p>
        </div>
      </header>

      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>{APP_SUBTITLE}</p>
          <h1 id="hero-title">A smarter way to browse, borrow, and manage your school library.</h1>
          <p className={styles.pitch}>
            Discover books, keep track of your loans, and reserve titles from one simple place.
          </p>
          <div className={styles.actions}>
            <Button size="lg" onClick={() => navigate('/login')}>Log In</Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/register')}>Create Account</Button>
          </div>
        </div>
        <div className={styles.heroMark} aria-hidden="true">
          <div className={styles.heroIcon}><Library size={56} strokeWidth={1.5} /></div>
          <span />
          <span />
          <span />
        </div>
      </section>

      <section className={styles.features} aria-label="SmartLib features">
        {features.map(feature => (
          <Card className={styles.featureCard} key={feature.title}>
            <div className={styles.featureIcon}>{feature.icon}</div>
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
          </Card>
        ))}
      </section>

      <footer className={styles.footer}>{APP_NAME}</footer>
    </main>
  );
}

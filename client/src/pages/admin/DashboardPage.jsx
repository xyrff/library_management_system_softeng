import { useEffect, useState } from 'react';
import { BookOpen, BookMarked, Clock, AlertTriangle } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { currentUser } = useApp();
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    Promise.all([api.get('/books'), api.get('/transactions')])
      .then(([booksResponse, transactionsResponse]) => {
        if (!isMounted) return;

        const transactions = transactionsResponse.data;
        setTransactions(transactions);
        setStats({
          totalBooks: booksResponse.data.length,
          activeLoans: transactions.filter(transaction => transaction.status === 'approved').length,
          pendingRequests: transactions.filter(transaction => transaction.status === 'pending').length,
          overdueCount: transactions.filter(transaction => transaction.status === 'overdue').length,
        });
      })
      .catch(() => {
        if (isMounted) setError('Could not load dashboard statistics. Please try again.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const recentActivity = transactions
    .slice()
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 8)
    .map(transaction => {
      const memberName = transaction.memberId?.name || 'Unknown member';
      const bookTitle = transaction.bookId?.title || 'Unknown book';
      const labels = {
        pending: `${memberName} requested "${bookTitle}"`,
        approved: `${memberName}'s request for "${bookTitle}" was approved`,
        rejected: `${memberName}'s request for "${bookTitle}" was rejected`,
        overdue: `"${bookTitle}" overdue from ${memberName}`,
        returned: `"${bookTitle}" returned by ${memberName}`,
      };

      return {
        id: transaction._id,
        label: labels[transaction.status] || `${memberName}'s transaction for "${bookTitle}" was updated`,
        status: transaction.status,
        date: transaction.updatedAt,
      };
    });

  return (
    <div className={styles.page}>
      <PageHeader
        title={`Good morning, ${currentUser?.name?.split(' ')[0]} 👋`}
        subtitle="Here's what's happening in the library today."
      />

      <div className={styles.statsGrid}>
        <StatCard label="Total Books"        value={loading ? '…' : stats?.totalBooks ?? '—'}     icon={<BookOpen size={22} />}      color="primary" trend="all books in catalog" />
        <StatCard label="Currently Borrowed" value={loading ? '…' : stats?.activeLoans ?? '—'}     icon={<BookMarked size={22} />}    color="info"    trend="across all students" />
        <StatCard label="Pending Requests"   value={loading ? '…' : stats?.pendingRequests ?? '—'} icon={<Clock size={22} />}         color="warning" trend="awaiting your approval" />
        <StatCard label="Overdue Books"      value={loading ? '…' : stats?.overdueCount ?? '—'}    icon={<AlertTriangle size={22} />} color="danger"  trend="need immediate attention" />
      </div>
      {error && <p className={styles.status}>{error}</p>}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent Activity</h2>
        <div className={styles.activityCard}>
          {loading ? (
            <p className={styles.emptyActivity}>Loading recent activity…</p>
          ) : recentActivity.length === 0 ? (
            <p className={styles.emptyActivity}>No transactions yet.</p>
          ) : recentActivity.map(item => (
            <div key={item.id} className={styles.activityRow}>
              <div className={`${styles.dot} ${styles[item.status]}`} aria-hidden="true" />
              <p className={styles.activityLabel}>{item.label}</p>
              <div className={styles.activityMeta}>
                <Badge label={item.status[0].toUpperCase() + item.status.slice(1)} />
                <span className={styles.activityDate}>
                  {new Date(item.date).toLocaleDateString('en-US', { month:'short', day:'numeric' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

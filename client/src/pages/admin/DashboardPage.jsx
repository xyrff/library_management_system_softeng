import { BookOpen, BookMarked, Clock, AlertTriangle } from 'lucide-react';
import { mockBooks, mockActiveBorrows, mockRequests, mockHistory } from '../../data/mockData';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import { useApp } from '../../context/AppContext';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { currentUser } = useApp();
  const overdue   = mockActiveBorrows.filter(b => b.status === 'overdue').length;
  const recentActivity = [
    ...mockRequests.map(r => ({ type: 'request', label: `${r.student.name} requested "${r.book.title}"`, date: r.requestDate, status: 'pending' })),
    ...mockActiveBorrows.filter(b=>b.status==='overdue').map(b => ({ type: 'overdue', label: `"${b.book.title}" overdue from ${b.student.name}`, date: b.dueDate, status: 'overdue' })),
    ...mockHistory.slice(0,2).map(h => ({ type: 'return', label: `"${h.book.title}" returned by ${h.student.name}`, date: h.returnDate || h.dueDate, status: 'returned' })),
  ].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

  return (
    <div className={styles.page}>
      <PageHeader
        title={`Good morning, ${currentUser?.name?.split(' ')[0]} 👋`}
        subtitle="Here's what's happening in the library today."
      />

      <div className={styles.statsGrid}>
        <StatCard label="Total Books"         value={mockBooks.length}            icon={<BookOpen size={22} />}      color="primary" trend={`${mockBooks.reduce((s,b)=>s+b.copies,0)} total copies`} />
        <StatCard label="Currently Borrowed"  value={mockActiveBorrows.length}    icon={<BookMarked size={22} />}    color="info"    trend="across all students" />
        <StatCard label="Pending Requests"    value={mockRequests.length}         icon={<Clock size={22} />}         color="warning" trend="awaiting your approval" />
        <StatCard label="Overdue Books"       value={overdue}                     icon={<AlertTriangle size={22} />} color="danger"  trend="need immediate attention" />
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent Activity</h2>
        <div className={styles.activityCard}>
          {recentActivity.map((item, i) => (
            <div key={i} className={styles.activityRow}>
              <div className={`${styles.dot} ${styles[item.status]}`} aria-hidden="true" />
              <p className={styles.activityLabel}>{item.label}</p>
              <div className={styles.activityMeta}>
                <Badge label={item.status === 'returned' ? 'Returned' : item.status === 'overdue' ? 'Overdue' : 'Pending'} />
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

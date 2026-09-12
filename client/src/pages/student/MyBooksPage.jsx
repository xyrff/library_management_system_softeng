import { BookMarked } from 'lucide-react';
import { mockMyBorrows } from '../../data/mockData';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import styles from './MyBooksPage.module.css';

const statusLabel = { pending:'Pending', approved:'Approved', borrowed:'Borrowed', returned:'Returned', overdue:'Overdue', rejected:'Rejected' };

export default function MyBooksPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        title="My Books"
        subtitle="Your borrowing history and active requests"
      />

      {mockMyBorrows.length === 0 ? (
        <EmptyState
          icon={<BookMarked size={36} />}
          title="No borrowing history yet"
          description="Browse the catalog and request a book to get started."
          actionLabel="Browse Catalog"
          onAction={() => window.location.href = '/catalog'}
        />
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Book</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {mockMyBorrows.map(item => (
                <tr key={item.id} className={item.status === 'overdue' ? styles.overdueRow : ''}>
                  <td>
                    <div className={styles.bookCell}>
                      <div className={styles.bookThumb}><BookMarked size={16} /></div>
                      <div>
                        <p className={styles.bookTitle}>{item.book.title}</p>
                        <p className={styles.bookAuthor}>{item.book.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className={styles.date}>{item.borrowDate ? new Date(item.borrowDate).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : '—'}</td>
                  <td className={styles.date}>{item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : '—'}</td>
                  <td className={styles.date}>{item.returnDate ? new Date(item.returnDate).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : '—'}</td>
                  <td><Badge label={statusLabel[item.status] || item.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

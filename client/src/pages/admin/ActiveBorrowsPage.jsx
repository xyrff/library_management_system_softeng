import { useEffect, useState } from 'react';
import { CheckSquare, List } from 'lucide-react';
import api from '../../services/api';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import styles from './ActiveBorrowsPage.module.css';

const formatDate = date => new Date(date).toLocaleDateString('en-US', {
  month: 'short', day: 'numeric', year: 'numeric',
});

function daysRemaining(dueDate) {
  return Math.ceil((new Date(dueDate) - new Date()) / 86400000);
}

export default function ActiveBorrowsPage() {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [returnId, setReturnId] = useState(null);

  const fetchBorrows = async () => {
    try {
      const response = await api.get('/transactions?status=approved,overdue');
      setBorrows(response.data);
    } catch (err) {
      setError('Could not load active borrows. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrows();
  }, []);

  const selectedBorrow = borrows.find(borrow => borrow._id === returnId);

  const markReturned = async () => {
    setActionError('');
    try {
      await api.post(`/transactions/${returnId}/return`);
      setBorrows(current => current.filter(borrow => borrow._id !== returnId));
      setReturnId(null);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not mark this book as returned.');
    }
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title="Active Borrows"
        subtitle={`${borrows.length} book${borrows.length !== 1 ? 's' : ''} currently out`}
      />

      {loading ? (
        <p className={styles.status}>Loading active borrows…</p>
      ) : error ? (
        <p className={styles.status}>{error}</p>
      ) : borrows.length === 0 ? (
        <EmptyState icon={<List size={36} />} title="No active borrows" description="All books have been returned." />
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student</th><th>Book</th><th>Borrow Date</th><th>Due Date</th>
                <th>Days Remaining</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {borrows.map(borrow => {
                const days = daysRemaining(borrow.dueDate);
                const isOverdue = borrow.status === 'overdue' || days < 0;
                return (
                  <tr key={borrow._id} className={isOverdue ? styles.overdueRow : ''}>
                    <td>
                      <div className={styles.studentCell}>
                        <div className={styles.avatar}>{borrow.memberId?.name?.[0] || '?'}</div>
                        <div>
                          <p className={styles.name}>{borrow.memberId?.name || 'Unknown member'}</p>
                          <p className={styles.email}>{borrow.memberId?.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className={styles.bookTitle}>{borrow.bookId?.title || 'Unknown book'}</p>
                      <p className={styles.bookAuthor}>{borrow.bookId?.author || '—'}</p>
                    </td>
                    <td className={styles.muted}>{formatDate(borrow.borrowDate)}</td>
                    <td className={styles.muted}>{formatDate(borrow.dueDate)}</td>
                    <td>
                      {isOverdue
                        ? <span className={styles.overdueTag}>{Math.abs(days)} days overdue</span>
                        : <span className={styles.daysTag}>{days} day{days !== 1 ? 's' : ''}</span>}
                    </td>
                    <td><Badge label={isOverdue ? 'Overdue' : 'Approved'} variant={isOverdue ? 'danger' : 'success'} /></td>
                    <td>
                      <Button size="sm" variant="secondary" icon={<CheckSquare size={14} />} onClick={() => setReturnId(borrow._id)}>
                        Mark as Returned
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {actionError && <p className={styles.status}>{actionError}</p>}

      <Modal isOpen={!!returnId} onClose={() => setReturnId(null)} title="Confirm Return" size="sm">
        {selectedBorrow && (
          <>
            <div className={styles.returnInfo}>
              <p><strong>{selectedBorrow.bookId?.title || 'Unknown book'}</strong></p>
              <p className={styles.returnSub}>Borrowed by {selectedBorrow.memberId?.name || 'Unknown member'}</p>
              <p className={styles.returnDate}>Return date: <strong>{formatDate(new Date())}</strong></p>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <Button variant="ghost" onClick={() => setReturnId(null)}>Cancel</Button>
              <Button onClick={markReturned}>Confirm Return</Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

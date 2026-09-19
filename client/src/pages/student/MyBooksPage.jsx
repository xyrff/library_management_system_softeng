import { useEffect, useState } from 'react';
import { BookMarked, Bookmark } from 'lucide-react';
import api from '../../services/api';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import BookCover from '../../components/ui/BookCover';
import ReservationClaimModal from './ReservationClaimModal';
import styles from './MyBooksPage.module.css';

const statusLabel = { pending: 'Pending', approved: 'Approved', returned: 'Returned', overdue: 'Overdue', rejected: 'Rejected' };

export default function MyBooksPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reservations, setReservations] = useState([]);
  const [reservationsLoading, setReservationsLoading] = useState(true);
  const [reservationError, setReservationError] = useState('');
  const [reservationActionError, setReservationActionError] = useState('');
  const [claimReservation, setClaimReservation] = useState(null);
  const [tab, setTab] = useState('books');

  useEffect(() => {
    let isMounted = true;

    const fetchTransactions = async () => {
      try {
        const response = await api.get('/transactions');
        if (isMounted) setTransactions(response.data);
      } catch (err) {
        if (isMounted) setError('Could not load your borrowing history. Please try again.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTransactions();
    return () => { isMounted = false; };
  }, []);

  const fetchReservations = async () => {
    setReservationError('');
    try {
      const response = await api.get('/reservations/my');
      setReservations(response.data);
    } catch (err) {
      setReservationError(err.response?.data?.message || 'Could not load your reservations.');
    } finally {
      setReservationsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const reservationAction = async (id, action) => {
    setReservationActionError('');
    try {
      await api.post(`/reservations/${id}/${action}`);
      await fetchReservations();
    } catch (err) {
      setReservationActionError(err.response?.data?.message || `Could not ${action} this reservation.`);
    }
  };

  return (
    <div className={styles.page}>
      <PageHeader title="My Books" subtitle="Your borrowing history and active requests" />

      <div className={styles.tabs}>
        <button className={tab === 'books' ? styles.activeTab : ''} onClick={() => setTab('books')}>My Books</button>
        <button className={tab === 'reservations' ? styles.activeTab : ''} onClick={() => setTab('reservations')}>
          My Reservations
        </button>
      </div>

      {tab === 'books' && loading ? (
        <p className={styles.status}>Loading your borrowing history…</p>
      ) : tab === 'books' && error ? (
        <p className={styles.status}>{error}</p>
      ) : tab === 'books' && transactions.length === 0 ? (
        <EmptyState
          icon={<BookMarked size={36} />}
          title="No borrowing history yet"
          description="Browse the catalog and request a book to get started."
          actionLabel="Browse Catalog"
          onAction={() => window.location.href = '/catalog'}
        />
      ) : tab === 'books' ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>Book</th><th>Borrow Date</th><th>Due Date</th><th>Return Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              {transactions.map(item => (
                <tr key={item._id} className={item.status === 'overdue' ? styles.overdueRow : ''}>
                  <td>
                    <div className={styles.bookCell}>
                      <div className={styles.bookThumb}><BookMarked size={16} /></div>
                      <div>
                        <p className={styles.bookTitle}>{item.bookId?.title || 'Unknown book'}</p>
                        <p className={styles.bookAuthor}>{item.bookId?.author || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className={styles.date}>{item.borrowDate ? new Date(item.borrowDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                  <td className={styles.date}>{item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                  <td className={styles.date}>{item.returnDate ? new Date(item.returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                  <td><Badge label={statusLabel[item.status] || item.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : reservationsLoading ? (
        <p className={styles.status}>Loading your reservations…</p>
      ) : reservationError ? (
        <p className={styles.status} role="alert">{reservationError}</p>
      ) : reservations.length === 0 ? (
        <EmptyState icon={<Bookmark size={36} />} title="No reservations yet" description="Reserve a book when all copies are currently borrowed." />
      ) : (
        <>
          {reservationActionError && <p className={styles.inlineError} role="alert">{reservationActionError}</p>}
          <div className={styles.reservationList}>
            {reservations.map(reservation => (
              <div className={styles.reservationItem} key={reservation._id}>
                <div className={styles.reservationBook}>
                  <BookCover book={reservation.bookId} className={styles.reservationCover} iconSize={20} />
                  <div>
                    <p className={styles.bookTitle}>{reservation.bookId?.title || 'Unknown book'}</p>
                    <p className={styles.bookAuthor}>{reservation.bookId?.author || '—'}</p>
                    <p className={styles.reservationDetail}>
                      {reservation.status === 'waiting' && (
                        <>Waiting in queue{reservation.estimatedAvailableDate && ` · Estimated availability ${new Date(reservation.estimatedAvailableDate).toLocaleDateString()}`}</>
                      )}
                      {reservation.status === 'ready' && (
                        <>Ready for pickup{reservation.readyAt && ` · Claim by ${new Date(new Date(reservation.readyAt).getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}`}</>
                      )}
                      {reservation.status === 'claimed' && 'Claimed'}
                      {reservation.status === 'expired' && 'Claim window expired'}
                      {reservation.status === 'cancelled' && 'Cancelled'}
                    </p>
                  </div>
                </div>
                <div className={styles.reservationActions}>
                  <Badge label={reservation.status[0].toUpperCase() + reservation.status.slice(1)} />
                  {reservation.status === 'ready' && (
                    <Button size="sm" onClick={() => setClaimReservation(reservation)}>Claim</Button>
                  )}
                  {['waiting', 'ready'].includes(reservation.status) && (
                    <Button size="sm" variant="ghost" onClick={() => reservationAction(reservation._id, 'cancel')}>Cancel</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <ReservationClaimModal
        reservation={claimReservation}
        onClose={() => setClaimReservation(null)}
        onSuccess={fetchReservations}
      />
    </div>
  );
}

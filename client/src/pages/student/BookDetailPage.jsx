import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import BookCover from '../../components/ui/BookCover';
import BorrowModal from './BorrowModal';
import styles from './BookDetailPage.module.css';

const coverColors = ['#e8f5ee', '#fdf0f2', '#dbeafe', '#fef3c7', '#f3e8ff', '#fde8d8'];

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [reservationMessage, setReservationMessage] = useState('');
  const [reservationError, setReservationError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchBook = async (showLoading = true) => {
      if (showLoading) setLoading(true);
      setNotFound(false);
      setError('');

      if (!id || !/^[a-f\d]{24}$/i.test(id)) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/books/${id}`);
        if (isMounted) {
          if (res.data) {
            setBook(res.data);
          } else {
            setNotFound(true);
          }
        }
      } catch (err) {
        if (isMounted) {
          if (err.response?.status === 404) {
            setNotFound(true);
          } else {
            setError('Could not load this book. Please make sure the server is running.');
          }
        }
      } finally {
        if (isMounted && showLoading) setLoading(false);
      }
    };

    fetchBook();

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') fetchBook(false);
    };
    window.addEventListener('focus', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', refreshWhenVisible);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [id]);

  const reserveBook = async () => {
    setReserving(true);
    setReservationMessage('');
    setReservationError('');
    try {
      await api.post('/reservations', { bookId: book._id });
      setReservationMessage('You are now in the reservation queue.');
    } catch (err) {
      setReservationError(err.response?.data?.message || 'Could not reserve this book. Please try again.');
    } finally {
      setReserving(false);
    }
  };

  if (loading) return (
    <div className={styles.page}>
      <Button variant="ghost" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>Back</Button>
      <p style={{ marginTop: 40, color: 'var(--color-text-secondary)' }}>Loading book…</p>
    </div>
  );

  if (notFound) return (
    <div className={styles.page}>
      <Button variant="ghost" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>Back</Button>
      <p style={{ marginTop: 40, color: 'var(--color-text-secondary)' }}>Book not found.</p>
    </div>
  );

  if (error) return (
    <div className={styles.page}>
      <Button variant="ghost" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>Back</Button>
      <p style={{ marginTop: 40, color: 'var(--color-text-secondary)' }}>{error}</p>
    </div>
  );

  const colorIdx = book._id ? book._id.charCodeAt(0) : 0;
  const availableCopies = Number(book.availableCopies) || 0;
  const totalCopies = Number(book.totalCopies) || 0;
  const availability = availableCopies > 0
    ? 'Available'
    : totalCopies > 0
      ? 'Currently Borrowed'
      : 'Unavailable';

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link to="/catalog">Catalog</Link>
        <span>/</span>
        <span>{book.genre}</span>
        <span>/</span>
        <strong>{book.title}</strong>
      </nav>

      <div className={styles.detail}>
        <div className={styles.coverSection}>
          <BookCover
            book={book}
            className={styles.cover}
            style={{ background: coverColors[colorIdx % coverColors.length] }}
            iconSize={64}
          />
        </div>

        <div className={styles.infoSection}>
          <div className={styles.genreTag}>{book.genre}</div>
          <h1 className={styles.title}>{book.title}</h1>
          <p className={styles.author}>by {book.author}</p>

          <div className={styles.metadata}>
            <h2 className={styles.sectionHeading}>Book details</h2>
            <div className={styles.metaList}>
              <div className={styles.metaRow}><span>Genre</span><strong>{book.genre || 'Not available'}</strong></div>
              <div className={styles.metaRow}><span>ISBN</span><strong>{book.isbn || 'Not available'}</strong></div>
              <div className={styles.metaRow}><span>Shelf location</span><strong>{book.shelfLocation || 'Not available'}</strong></div>
            </div>
          </div>

          <section className={styles.synopsis}>
            <h2 className={styles.sectionHeading}>Synopsis</h2>
            <p className={`${styles.description} ${!showFullSynopsis ? styles.clamped : ''}`}>
              {book.description || 'Description not available.'}
            </p>
            {book.description && book.description.length > 220 && (
              <button
                className={styles.seeMoreBtn}
                onClick={() => setShowFullSynopsis((prev) => !prev)}
              >
                {showFullSynopsis ? 'See less' : 'See more'}
              </button>
            )}
          </section>

          <div className={styles.statusCard}>
            <div className={styles.statusHeader}>
              <div>
                <h2 className={styles.sectionHeading}>Availability</h2>
                <p className={styles.copies}>{availableCopies} of {totalCopies} copies available</p>
              </div>
              <Badge label={availability} />
            </div>

            <div className={styles.actions}>
              {availableCopies > 0 ? (
                <Button size="lg" onClick={() => setShowModal(true)}>Request to Borrow</Button>
              ) : (
                <Button size="lg" variant="outline" onClick={reserveBook} disabled={reserving}>
                  {reserving ? 'Reserving…' : 'Reserve'}
                </Button>
              )}
              <Button variant="secondary" size="lg" onClick={() => navigate('/catalog')}>Back to Catalog</Button>
            </div>
            {reservationMessage && <p className={styles.reservationSuccess}>{reservationMessage}</p>}
            {reservationError && <p className={styles.reservationError}>{reservationError}</p>}
          </div>
        </div>
      </div>

      <BorrowModal book={showModal ? book : null} onClose={() => setShowModal(false)} />
    </div>
  );
}
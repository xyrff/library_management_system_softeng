import { useRef, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import BookCover from '../../components/ui/BookCover';
import styles from './BorrowModal.module.css';

// Formats a Date object as "YYYY-MM-DD", the format <input type="date"> needs
const toDateInputValue = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Adds N days to a "YYYY-MM-DD" string and returns a new "YYYY-MM-DD" string
const addDays = (dateStr, days) => {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return toDateInputValue(d);
};

const todayStr = toDateInputValue(new Date());

export default function BorrowModal({ book, onClose }) {
  const [borrowDate, setBorrowDate] = useState(todayStr);
  const [returnDate, setReturnDate] = useState(addDays(todayStr, 14));
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const submitLockRef = useRef(false);

  const handleClose = () => {
    setSubmitted(false);
    setBorrowDate(todayStr);
    setReturnDate(addDays(todayStr, 14));
    setSubmitting(false);
    setError('');
    submitLockRef.current = false;
    onClose();
  };

  const handleSubmit = async () => {
    if (submitLockRef.current) return;
    submitLockRef.current = true;
    setSubmitting(true);
    setError('');

    try {
      await api.post('/transactions/borrow', {
        bookId: book._id,
        borrowDate,
        returnDate,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit your request. Please try again.');
    } finally {
      setSubmitting(false);
      submitLockRef.current = false;
    }
  };

  const handleBorrowDateChange = (e) => {
    const newBorrowDate = e.target.value;
    setBorrowDate(newBorrowDate);

    const minReturn = addDays(newBorrowDate, 1);
    const maxReturn = addDays(newBorrowDate, 30);

    // If the current return date no longer makes sense with the new borrow
    // date, auto-adjust it instead of showing an error
    if (returnDate <= newBorrowDate) {
      setReturnDate(addDays(newBorrowDate, 14));
    } else if (returnDate > maxReturn) {
      setReturnDate(maxReturn);
    }
  };

  if (!book) return null;

  const minReturnDate = addDays(borrowDate, 1);
  const maxReturnDate = addDays(borrowDate, 30);

  return (
    <Modal isOpen={!!book} onClose={handleClose} title="Borrow Request" size="sm">
      {!submitted ? (
        <div className={styles.content}>
          {/* Book summary */}
          <div className={styles.bookSummary}>
            <BookCover book={book} className={styles.bookCover} iconSize={28} />
            <div>
              <p className={styles.bookTitle}>{book.title}</p>
              <p className={styles.bookAuthor}>{book.author}</p>
              <p className={styles.bookGenre}>{book.genre}</p>
            </div>
          </div>

          <div className={styles.field}>
            <div className={styles.dateGrid}>
              <Input
                type="date"
                label="Borrow date"
                value={borrowDate}
                onChange={handleBorrowDateChange}
                min={todayStr}
              />
              <Input
                type="date"
                label="Return date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                min={minReturnDate}
                max={maxReturnDate}
              />
            </div>
          </div>

          <div className={styles.summary}>
            <span>Due date:</span>
            <strong>
              {new Date(returnDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </strong>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <Button variant="ghost" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Request'}
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.confirmation}>
          <div className={styles.checkIcon}><CheckCircle size={40} color="var(--color-success)" /></div>
          <h3>Request submitted!</h3>
          <p>Your borrow request for <strong>{book.title}</strong> is now <em>pending approval</em> by the librarian.</p>
          <p className={styles.note}>You'll be able to track its status in <strong>My Books</strong>.</p>
          <Button onClick={handleClose} fullWidth>Done</Button>
        </div>
      )}
    </Modal>
  );
}
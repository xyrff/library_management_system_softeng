import { useEffect, useRef, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import BookCover from '../../components/ui/BookCover';
import styles from './ReservationClaimModal.module.css';

const CLAIM_WINDOW_MS = 2 * 24 * 60 * 60 * 1000;

const toDateInputValue = (date) => {
  const value = new Date(date);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
};

const addDays = (dateString, days) => {
  const value = new Date(`${dateString}T00:00:00`);
  value.setDate(value.getDate() + days);
  return toDateInputValue(value);
};

const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export default function ReservationClaimModal({ reservation, onClose, onSuccess }) {
  const today = toDateInputValue(new Date());
  const [returnDate, setReturnDate] = useState(addDays(today, 14));
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const submitLockRef = useRef(false);

  useEffect(() => {
    if (reservation) {
      setReturnDate(addDays(today, 14));
      setSubmitted(false);
      setSubmitting(false);
      setError('');
      submitLockRef.current = false;
    }
  }, [reservation?._id]);

  const handleClose = () => {
    setSubmitted(false);
    setSubmitting(false);
    setError('');
    submitLockRef.current = false;
    onClose();
  };

  const handleSubmit = async () => {
    if (submitLockRef.current) return;
    if (!returnDate) {
      setError('Please select a return date.');
      return;
    }
    if (returnDate <= today) {
      setError('Return date must be after today.');
      return;
    }
    if (returnDate > addDays(today, 30)) {
      setError('Return date cannot be more than 30 days from today.');
      return;
    }

    submitLockRef.current = true;
    setSubmitting(true);
    setError('');

    try {
      await api.post(`/reservations/${reservation._id}/claim`, {
        borrowDate: today,
        returnDate,
      });
      setSubmitted(true);
      await onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not claim this reservation. Please try again.');
    } finally {
      setSubmitting(false);
      submitLockRef.current = false;
    }
  };

  if (!reservation) return null;

  const deadline = reservation.readyAt
    ? new Date(new Date(reservation.readyAt).getTime() + CLAIM_WINDOW_MS)
    : null;
  const book = reservation.bookId;

  return (
    <Modal isOpen={!!reservation} onClose={handleClose} title="Claim Reservation" size="sm">
      {!submitted ? (
        <div className={styles.content}>
          <div className={styles.bookSummary}>
            <BookCover book={book} className={styles.bookCover} iconSize={28} />
            <div>
              <p className={styles.bookTitle}>{book?.title || 'Unknown book'}</p>
              <p className={styles.bookAuthor}>{book?.author || '—'}</p>
            </div>
          </div>

          <div className={styles.deadline} role="status">
            {deadline ? `Claim by: ${formatDate(deadline)}` : 'Claim deadline is unavailable.'}
          </div>

          <div className={styles.dateGrid}>
            <Input label="Borrow date" type="date" value={today} readOnly />
            <Input
              label="Return date"
              type="date"
              value={returnDate}
              onChange={(event) => {
                setReturnDate(event.target.value);
                setError('');
              }}
              min={addDays(today, 1)}
              max={addDays(today, 30)}
              error={error && !returnDate ? error : ''}
            />
          </div>

          {error && <p className={styles.error} role="alert">{error}</p>}

          <div className={styles.actions}>
            <Button variant="ghost" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Claiming…' : 'Claim Book'}
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.confirmation}>
          <div className={styles.checkIcon}><CheckCircle size={40} color="var(--color-success)" /></div>
          <h3>Reservation claimed!</h3>
          <p><strong>{book?.title || 'This book'}</strong> has been added to your active loans.</p>
          <Button onClick={handleClose} fullWidth>Done</Button>
        </div>
      )}
    </Modal>
  );
}

import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import BookCover from '../../components/ui/BookCover';
import styles from './BorrowModal.module.css';

export default function BorrowModal({ book, onClose }) {
  const [days, setDays]     = useState(14);
  const [submitted, setSubmitted] = useState(false);

  const handleClose = () => { setSubmitted(false); onClose(); };

  if (!book) return null;

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
            <label className={styles.label}>Borrow duration</label>
            <div className={styles.durationGrid}>
              {[7, 14, 21, 30].map(d => (
                <button
                  key={d}
                  className={`${styles.durationChip} ${days === d ? styles.active : ''}`}
                  onClick={() => setDays(d)}
                  type="button"
                >
                  {d} days
                </button>
              ))}
            </div>
            <Input
              type="number"
              label="Or enter custom days (1–30)"
              value={days}
              onChange={e => setDays(Math.min(30, Math.max(1, Number(e.target.value))))}
              min={1}
              max={30}
            />
          </div>

          <div className={styles.summary}>
            <span>Due date:</span>
            <strong>{new Date(Date.now() + days * 86400000).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric' })}</strong>
          </div>

          <div className={styles.actions}>
            <Button variant="ghost" onClick={handleClose}>Cancel</Button>
            <Button onClick={() => setSubmitted(true)}>Submit Request</Button>
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

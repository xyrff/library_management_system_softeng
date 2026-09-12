import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { mockBooks } from '../../data/mockData';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import BookCover from '../../components/ui/BookCover';
import BorrowModal from './BorrowModal';
import styles from './BookDetailPage.module.css';

const coverColors = ['#e8f5ee','#fdf0f2','#dbeafe','#fef3c7','#f3e8ff','#fde8d8'];

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const book = mockBooks.find(b => b.id === id);
  if (!book) return (
    <div className={styles.page}>
      <Button variant="ghost" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>Back</Button>
      <p style={{ marginTop: 40, color: 'var(--color-text-secondary)' }}>Book not found.</p>
    </div>
  );

  const colorIdx = mockBooks.indexOf(book);

  return (
    <div className={styles.page}>
      <Button variant="ghost" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>Back to Catalog</Button>

      <div className={styles.detail}>
        <div className={styles.coverSection}>
          <BookCover
            book={book}
            className={styles.cover}
            style={{ background: coverColors[colorIdx % coverColors.length] }}
            iconSize={64}
          />
          <div className={styles.metaBox}>
            <div className={styles.metaRow}><span>Genre</span><strong>{book.genre}</strong></div>
            <div className={styles.metaRow}><span>ISBN</span><strong>{book.isbn}</strong></div>
            <div className={styles.metaRow}><span>Total copies</span><strong>{book.copies}</strong></div>
            <div className={styles.metaRow}><span>Available</span><strong>{book.availableCopies}</strong></div>
          </div>
        </div>

        <div className={styles.infoSection}>
          <div className={styles.genreTag}>{book.genre}</div>
          <h1 className={styles.title}>{book.title}</h1>
          <p className={styles.author}>by {book.author}</p>

          <Badge label={book.status === 'available' ? 'Available' : 'Currently Borrowed'} />

          <p className={styles.description}>{book.description}</p>

          {book.status !== 'available' && book.expectedReturn && (
            <div className={styles.returnInfo}>
              <Calendar size={15} />
              <span>Expected return: <strong>{new Date(book.expectedReturn).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })}</strong></span>
            </div>
          )}

          <div className={styles.cta}>
            {book.status === 'available' ? (
              <Button size="lg" onClick={() => setShowModal(true)}>Request to Borrow</Button>
            ) : (
              <Button size="lg" variant="ghost" disabled>Currently Unavailable</Button>
            )}
          </div>
        </div>
      </div>

      <BorrowModal book={showModal ? book : null} onClose={() => setShowModal(false)} />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { GENRES } from '../../data/mockData';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import BookCover from '../../components/ui/BookCover';
import api from '../../services/api';
import styles from './AdminCatalogPage.module.css';

const emptyForm = {
  title: '',
  author: '',
  isbn: '',
  genre: '',
  description: '',
  totalCopies: '1',
  shelfLocation: '',
};

function BookFormModal({ isOpen, onClose, book, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (isOpen) {
      setForm(book ? {
        title: book.title || '',
        author: book.author || '',
        isbn: book.isbn || '',
        genre: book.genre || '',
        description: book.description || '',
        totalCopies: String(book.totalCopies ?? 1),
        shelfLocation: book.shelfLocation || '',
      } : emptyForm);
      setError('');
    }
  }, [isOpen, book]);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = { ...form, totalCopies: Number(form.totalCopies) };
      const response = book
        ? await api.put(`/books/${book._id}`, payload)
        : await api.post('/books', payload);
      onSaved(response.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the book. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={book ? 'Edit Book' : 'Add New Book'} size="md">
      <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <Input label="Title" placeholder="Book title" value={form.title} onChange={set('title')} required />
          <Input label="Author" placeholder="Author name" value={form.author} onChange={set('author')} required />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <Select label="Genre" value={form.genre} onChange={set('genre')}
              options={GENRES.map(g => ({ value:g, label:g }))} placeholder="Select genre" />
            <Input label="ISBN" placeholder="978-..." value={form.isbn} onChange={set('isbn')} required />
          </div>
          <Input label="Description" placeholder="Book description" value={form.description} onChange={set('description')} />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <Input label="Number of Copies" type="number" min={1} max={99} value={form.totalCopies} onChange={set('totalCopies')} required />
            <Input label="Shelf Location" placeholder="e.g. A-12" value={form.shelfLocation} onChange={set('shelfLocation')} />
          </div>
          {error && <p style={{ color:'var(--color-danger)', fontSize:13, margin:0 }}>{error}</p>}
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:4 }}>
            <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : book ? 'Save Changes' : 'Add Book'}</Button>
          </div>
      </form>
    </Modal>
  );
}

export default function AdminCatalogPage() {
  const [books, setBooks] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/books');
      setBooks(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load the catalog. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBooks(); }, []);

  const handleSaved = (savedBook) => {
    setBooks(current => {
      const exists = current.some(book => book._id === savedBook._id);
      return exists ? current.map(book => book._id === savedBook._id ? savedBook : book) : [savedBook, ...current];
    });
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/books/${deleteId}`);
      setBooks(current => current.filter(book => book._id !== deleteId));
      setDeleteId(null);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete the book. Please try again.');
    }
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title="Book Catalog"
        subtitle={`Managing ${books.length} books`}
        actions={<Button icon={<Plus size={16} />} onClick={() => setShowAdd(true)}>Add Book</Button>}
      />

      {error && <p style={{ color:'var(--color-danger)', fontSize:13, margin:'0 0 16px' }}>{error}</p>}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Book</th>
              <th>Genre</th>
              <th>ISBN</th>
              <th>Copies</th>
              <th>Available</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7">Loading catalog…</td></tr>
            ) : books.map(book => (
              <tr key={book._id}>
                <td>
                  <div className={styles.bookCell}>
                    <BookCover book={book} className={styles.thumb} iconSize={15} iconColor="var(--color-primary)" />
                    <div>
                      <p className={styles.bookTitle}>{book.title}</p>
                      <p className={styles.bookAuthor}>{book.author}</p>
                    </div>
                  </div>
                </td>
                <td className={styles.muted}>{book.genre}</td>
                <td className={styles.muted} style={{fontSize:12}}>{book.isbn}</td>
                <td className={styles.center}>{book.totalCopies}</td>
                <td className={styles.center}>{book.availableCopies}</td>
                <td><Badge label={book.availableCopies > 0 ? 'Available' : 'Currently Borrowed'} /></td>
                <td>
                  <div className={styles.actionBtns}>
                    <button className={styles.iconBtn} aria-label="Edit book" onClick={() => setEditBook(book)}><Pencil size={15} /></button>
                    <button className={`${styles.iconBtn} ${styles.danger}`} aria-label="Delete book" onClick={() => { setDeleteId(book._id); setError(''); }}><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <BookFormModal isOpen={showAdd} onClose={() => setShowAdd(false)} onSaved={handleSaved} />
      <BookFormModal book={editBook} isOpen={!!editBook} onClose={() => setEditBook(null)} onSaved={handleSaved} />

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Book" size="sm">
        <p style={{ fontSize:14, color:'var(--color-text-secondary)', marginBottom:20 }}>
          Are you sure you want to delete this book from the catalog? This action cannot be undone.
        </p>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

import { useState } from 'react';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import { mockBooks, GENRES } from '../../data/mockData';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import BookCover from '../../components/ui/BookCover';
import styles from './AdminCatalogPage.module.css';

function AddBookModal({ isOpen, onClose }) {
  const [form, setForm] = useState({ title:'', author:'', genre:'', isbn:'', copies:'1' });
  const [done, setDone] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    setDone(true);
    setTimeout(() => { setDone(false); setForm({ title:'', author:'', genre:'', isbn:'', copies:'1' }); onClose(); }, 1500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={done ? 'Book Added!' : 'Add New Book'} size="md">
      {done ? (
        <div style={{ textAlign:'center', padding:'20px 0', color:'var(--color-success)', fontSize:15 }}>
          ✓ Book added to catalog successfully.
        </div>
      ) : (
        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <Input label="Title" placeholder="Book title" value={form.title} onChange={set('title')} required />
          <Input label="Author" placeholder="Author name" value={form.author} onChange={set('author')} required />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <Select label="Genre" value={form.genre} onChange={set('genre')}
              options={GENRES.map(g=>({value:g,label:g}))} placeholder="Select genre" />
            <Input label="ISBN" placeholder="978-..." value={form.isbn} onChange={set('isbn')} />
          </div>
          <Input label="Number of Copies" type="number" min={1} max={99} value={form.copies} onChange={set('copies')} required />
          <div className={styles.uploadBox}>
            <BookOpen size={24} color="var(--color-text-muted)" />
            <span>Click to upload cover image</span>
            <span className={styles.uploadSub}>PNG, JPG up to 2MB</span>
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:4 }}>
            <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit">Add Book</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export default function AdminCatalogPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  return (
    <div className={styles.page}>
      <PageHeader
        title="Book Catalog"
        subtitle={`Managing ${mockBooks.length} books`}
        actions={<Button icon={<Plus size={16} />} onClick={() => setShowAdd(true)}>Add Book</Button>}
      />

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
            {mockBooks.map(book => (
              <tr key={book.id}>
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
                <td className={styles.center}>{book.copies}</td>
                <td className={styles.center}>{book.availableCopies}</td>
                <td><Badge label={book.status === 'available' ? 'Available' : 'Currently Borrowed'} /></td>
                <td>
                  <div className={styles.actionBtns}>
                    <button className={styles.iconBtn} aria-label="Edit book"><Pencil size={15} /></button>
                    <button className={`${styles.iconBtn} ${styles.danger}`} aria-label="Delete book" onClick={() => setDeleteId(book.id)}><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddBookModal isOpen={showAdd} onClose={() => setShowAdd(false)} />

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Book" size="sm">
        <p style={{ fontSize:14, color:'var(--color-text-secondary)', marginBottom:20 }}>
          Are you sure you want to delete this book from the catalog? This action cannot be undone.
        </p>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => setDeleteId(null)}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

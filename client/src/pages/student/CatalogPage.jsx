import { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GENRES } from '../../data/mockData';
import api from '../../services/api';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import BookCover from '../../components/ui/BookCover';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import EmptyState from '../../components/ui/EmptyState';
import styles from './CatalogPage.module.css';

const coverColors = ['#e8f5ee', '#fdf0f2', '#dbeafe', '#fef3c7', '#f3e8ff', '#fde8d8'];
const BOOKS_PER_PAGE = 20;

export default function CatalogPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [avail, setAvail] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const gridRef = useRef(null);
  const hasRenderedGrid = useRef(false);

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchBooks = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/books');
        if (isMounted) {
          setBooks(res.data);
        }
      } catch (err) {
        if (isMounted) setError('Could not load books. Please make sure the server is running.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBooks();

    return () => { isMounted = false; };
  }, []); // empty dependency array — fetch once on mount only

  const filtered = books.filter(b => {
    const q = search.toLowerCase();
    const isAvailable = b.availableCopies > 0;
    const matchQ = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
    const matchG = !genre || b.genre === genre;
    const matchA = !avail || (avail === 'available' ? isAvailable : !isAvailable);
    return matchQ && matchG && matchA;
  });
  const totalPages = Math.ceil(filtered.length / BOOKS_PER_PAGE);
  const pageStart = (currentPage - 1) * BOOKS_PER_PAGE;
  const paginatedBooks = filtered.slice(pageStart, currentPage * BOOKS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, genre, avail]);

  useEffect(() => {
    if (hasRenderedGrid.current) {
      gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    hasRenderedGrid.current = true;
  }, [currentPage]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className={styles.page}>
      <PageHeader
        title="Book Catalog"
        subtitle={`${filtered.length} books in the library collection`}
      />

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <Input
            placeholder="Search by title or author…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon={<Search size={16} />}
          />
        </div>
        <Select
          value={genre}
          onChange={e => setGenre(e.target.value)}
          options={GENRES.map(g => ({ value: g, label: g }))}
          placeholder="All Genres"
        />
        <Select
          value={avail}
          onChange={e => setAvail(e.target.value)}
          options={[{ value: 'available', label: 'Available' }, { value: 'borrowed', label: 'Currently Borrowed' }]}
          placeholder="All Status"
        />
        {(search || genre || avail) && (
          <Button variant="secondary" size="sm" onClick={() => { setSearch(''); setGenre(''); setAvail(''); }}>
            Clear
          </Button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <p className={styles.status}>Loading books…</p>
      ) : error ? (
        <p className={styles.status}>{error}</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={36} />}
          title="No books found"
          description="Try adjusting your search or filters to find what you're looking for."
          actionLabel="Clear Filters"
          onAction={() => { setSearch(''); setGenre(''); setAvail(''); }}
        />
      ) : (
        <>
          <div className={styles.grid} ref={gridRef}>
            {paginatedBooks.map((book, i) => (
              <div
                key={book._id}
                className={styles.bookCard}
                onClick={() => navigate(`/books/${book._id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && navigate(`/books/${book._id}`)}
              >
                <BookCover
                  book={book}
                  className={styles.cover}
                  style={{ background: coverColors[i % coverColors.length] }}
                  iconSize={40}
                  ariaLabel={`View details for ${book.title}`}
                />
                <div className={styles.info}>
                  <div className={styles.genreTag}>{book.genre}</div>
                  <h3 className={styles.title}>{book.title}</h3>
                  <p className={styles.author}>{book.author}</p>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.pagination}>
            <span className={styles.pageSummary}>
              Showing {pageStart + 1}–{Math.min(pageStart + BOOKS_PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            {totalPages > 1 && (
              <div className={styles.pageControls}>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(page => page - 1)}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => (
                  <button
                    key={page}
                    type="button"
                    className={`${styles.pageNumber} ${page === currentPage ? styles.currentPage : ''}`}
                    onClick={() => setCurrentPage(page)}
                    aria-current={page === currentPage ? 'page' : undefined}
                  >
                    {page}
                  </button>
                ))}
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(page => page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
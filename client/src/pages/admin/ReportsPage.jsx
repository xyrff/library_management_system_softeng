import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import styles from './ReportsPage.module.css';

const BORROWED_STATUSES = new Set(['approved', 'returned', 'overdue']);
const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'returned', label: 'Returned' },
  { value: 'overdue', label: 'Overdue' },
];

const formatDate = date => date
  ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  : '—';

const getMostBorrowedBooks = transactions => {
  const counts = new Map();
  transactions.filter(tx => BORROWED_STATUSES.has(tx.status)).forEach(tx => {
    const book = tx.bookId;
    const key = String(book?._id || book?.title || 'unknown-book');
    const current = counts.get(key) || { name: book?.title || 'Unknown book', borrows: 0 };
    current.borrows += 1;
    counts.set(key, current);
  });
  return [...counts.values()].sort((a, b) => b.borrows - a.borrows).slice(0, 5);
};

const getBorrowsByGenre = transactions => {
  const counts = new Map();
  transactions.filter(tx => BORROWED_STATUSES.has(tx.status)).forEach(tx => {
    const genre = tx.bookId?.genre || 'Unknown genre';
    counts.set(genre, (counts.get(genre) || 0) + 1);
  });
  return [...counts.entries()]
    .map(([name, borrows]) => ({ name, borrows }))
    .sort((a, b) => b.borrows - a.borrows)
    .slice(0, 5);
};

export default function ReportsPage() {
  const [transactions, setTransactions] = useState([]);
  const [members, setMembers] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    Promise.all([api.get('/transactions'), api.get('/members')])
      .then(([transactionResponse, memberResponse]) => {
        if (!isMounted) return;
        setTransactions(transactionResponse.data);
        setMembers(memberResponse.data);
      })
      .catch(() => {
        if (isMounted) setError('Could not load report data. Please try again.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const mostBorrowedBooks = useMemo(() => getMostBorrowedBooks(transactions), [transactions]);
  const borrowsByGenre = useMemo(() => getBorrowsByGenre(transactions), [transactions]);
  const lateReturnStudents = useMemo(() => members
    .map(member => ({ ...member, lateReturns: Number(member.lateReturnHistory) || 0 }))
    .filter(member => member.lateReturns > 0)
    .sort((a, b) => b.lateReturns - a.lateReturns)
    .slice(0, 3), [members]);
  const maxLateReturns = lateReturnStudents[0]?.lateReturns || 0;
  const filteredTransactions = useMemo(() => transactions
    .filter(tx => !filter || tx.status === filter)
    .sort((a, b) => new Date(b.createdAt || b.borrowDate) - new Date(a.createdAt || a.borrowDate)),
  [transactions, filter]);

  return (
    <div className={styles.page}>
      <PageHeader title="Reports & History" subtitle="Transactions, trends, and borrowing analytics" />

      {loading ? (
        <p className={styles.message}>Loading report data…</p>
      ) : error ? (
        <p className={styles.message}>{error}</p>
      ) : (
        <>
          <div className={styles.charts}>
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Most Borrowed Books</h3>
              {mostBorrowedBooks.length === 0 ? <p className={styles.empty}>No data yet.</p> : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={mostBorrowedBooks} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={false}
                      tickFormatter={value => value.length > 14 ? `${value.slice(0, 13)}…` : value} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--color-border)', fontSize: 13 }} />
                    <Bar dataKey="borrows" fill="var(--color-primary)" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Borrows by Genre</h3>
              {borrowsByGenre.length === 0 ? <p className={styles.empty}>No data yet.</p> : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={borrowsByGenre} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--color-border)', fontSize: 13 }} />
                    <Bar dataKey="borrows" fill="var(--color-accent)" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className={styles.lateCard}>
            <h3 className={styles.chartTitle}>Students with Most Late Returns</h3>
            {lateReturnStudents.length === 0 ? <p className={styles.empty}>No late returns yet.</p> : (
              <div className={styles.lateList}>
                {lateReturnStudents.map((student, index) => (
                  <div key={student._id} className={styles.lateRow}>
                    <span className={styles.rank}>#{index + 1}</span>
                    <span className={styles.studentName}>{student.name}</span>
                    <div className={styles.bar}>
                      <div className={styles.barFill} style={{ width: `${(student.lateReturns / maxLateReturns) * 100}%` }} />
                    </div>
                    <span className={styles.lateCount}>{student.lateReturns} late{student.lateReturns !== 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.chartTitle}>Transaction History</h3>
              <Select
                value={filter}
                onChange={event => setFilter(event.target.value)}
                options={STATUS_OPTIONS}
                placeholder="All Status"
              />
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Book</th>
                    <th>Borrow Date</th>
                    <th>Due Date</th>
                    <th>Return Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length === 0 ? (
                    <tr><td className={styles.emptyRow} colSpan={6}>
                      {transactions.length === 0 ? 'No transactions yet.' : 'No transactions match this status.'}
                    </td></tr>
                  ) : filteredTransactions.map(tx => (
                    <tr key={tx._id}>
                      <td className={styles.name}>{tx.memberId?.name || 'Unknown member'}</td>
                      <td>
                        <p className={styles.bookTitle}>{tx.bookId?.title || 'Unknown book'}</p>
                        <p className={styles.bookAuthor}>{tx.bookId?.author || '—'}</p>
                      </td>
                      <td className={styles.muted}>{formatDate(tx.borrowDate)}</td>
                      <td className={styles.muted}>{formatDate(tx.dueDate)}</td>
                      <td className={styles.muted}>{formatDate(tx.returnDate)}</td>
                      <td><Badge label={`${tx.status.charAt(0).toUpperCase()}${tx.status.slice(1)}`} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

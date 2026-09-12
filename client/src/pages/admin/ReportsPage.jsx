import { useState } from 'react';
import { BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockHistory, reportData } from '../../data/mockData';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import styles from './ReportsPage.module.css';

export default function ReportsPage() {
  const [filter, setFilter] = useState('');

  const filtered = mockHistory.filter(h => !filter || h.status === filter);

  return (
    <div className={styles.page}>
      <PageHeader title="Reports & History" subtitle="Transactions, trends, and borrowing analytics" />

      <div className={styles.charts}>
        {/* Most Borrowed Books */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Most Borrowed Books</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={reportData.mostBorrowedBooks} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={false}
                tickFormatter={v => v.length > 14 ? v.slice(0,13)+'…' : v} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--color-border)', fontSize: 13 }} />
              <Bar dataKey="borrows" fill="var(--color-primary)" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Most Borrowed Genres */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Borrows by Genre</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={reportData.mostBorrowedGenres} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--color-border)', fontSize: 13 }} />
              <Bar dataKey="borrows" fill="var(--color-accent)" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Late Returns Leaderboard */}
      <div className={styles.lateCard}>
        <h3 className={styles.chartTitle}>Students with Most Late Returns</h3>
        <div className={styles.lateList}>
          {reportData.lateReturnStudents.map((s, i) => (
            <div key={i} className={styles.lateRow}>
              <span className={styles.rank}>#{i + 1}</span>
              <span className={styles.studentName}>{s.name}</span>
              <div className={styles.bar}>
                <div className={styles.barFill} style={{ width: `${(s.lateReturns / 5) * 100}%` }} />
              </div>
              <span className={styles.lateCount}>{s.lateReturns} late{s.lateReturns !== 1 ? 's' : ''}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History Table */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.chartTitle}>Transaction History</h3>
          <Select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            options={[{ value:'returned', label:'Returned' }, { value:'rejected', label:'Rejected' }]}
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
              {filtered.map(tx => (
                <tr key={tx.id}>
                  <td className={styles.name}>{tx.student.name}</td>
                  <td>
                    <p className={styles.bookTitle}>{tx.book.title}</p>
                    <p className={styles.bookAuthor}>{tx.book.author}</p>
                  </td>
                  <td className={styles.muted}>{new Date(tx.borrowDate).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}</td>
                  <td className={styles.muted}>{new Date(tx.dueDate).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}</td>
                  <td className={styles.muted}>{tx.returnDate ? new Date(tx.returnDate).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : '—'}</td>
                  <td><Badge label={tx.status === 'returned' ? 'Returned' : 'Rejected'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

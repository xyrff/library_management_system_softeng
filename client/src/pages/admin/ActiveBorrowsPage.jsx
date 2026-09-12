import { useState } from 'react';
import { List, CheckSquare } from 'lucide-react';
import { mockActiveBorrows } from '../../data/mockData';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import styles from './ActiveBorrowsPage.module.css';

function daysRemaining(dueDate) {
  const diff = Math.ceil((new Date(dueDate) - new Date()) / 86400000);
  return diff;
}

export default function ActiveBorrowsPage() {
  const [borrows, setBorrows] = useState(mockActiveBorrows);
  const [returnId, setReturnId] = useState(null);

  const markReturned = (id) => {
    setBorrows(b => b.filter(borrow => borrow.id !== id));
    setReturnId(null);
  };

  const selectedBorrow = borrows.find(b => b.id === returnId);

  return (
    <div className={styles.page}>
      <PageHeader
        title="Active Borrows"
        subtitle={`${borrows.length} book${borrows.length !== 1 ? 's' : ''} currently out`}
      />

      {borrows.length === 0 ? (
        <EmptyState
          icon={<List size={36} />}
          title="No active borrows"
          description="All books have been returned."
        />
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Book</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Days Remaining</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {borrows.map(borrow => {
                const days = daysRemaining(borrow.dueDate);
                const isOverdue = days < 0;
                return (
                  <tr key={borrow.id} className={isOverdue ? styles.overdueRow : ''}>
                    <td>
                      <div className={styles.studentCell}>
                        <div className={styles.avatar}>{borrow.student.name[0]}</div>
                        <div>
                          <p className={styles.name}>{borrow.student.name}</p>
                          <p className={styles.email}>{borrow.student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className={styles.bookTitle}>{borrow.book.title}</p>
                      <p className={styles.bookAuthor}>{borrow.book.author}</p>
                    </td>
                    <td className={styles.muted}>{new Date(borrow.borrowDate).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}</td>
                    <td className={styles.muted}>{new Date(borrow.dueDate).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}</td>
                    <td>
                      {isOverdue ? (
                        <span className={styles.overdueTag}>{Math.abs(days)} days overdue</span>
                      ) : (
                        <span className={styles.daysTag}>{days} day{days !== 1 ? 's' : ''}</span>
                      )}
                    </td>
                    <td><Badge label={isOverdue ? 'Overdue' : 'Borrowed'} /></td>
                    <td>
                      <Button size="sm" variant="secondary" icon={<CheckSquare size={14} />}
                        onClick={() => setReturnId(borrow.id)}>
                        Mark Returned
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!returnId} onClose={() => setReturnId(null)} title="Confirm Return" size="sm">
        {selectedBorrow && (
          <>
            <div className={styles.returnInfo}>
              <p><strong>{selectedBorrow.book.title}</strong></p>
              <p className={styles.returnSub}>Borrowed by {selectedBorrow.student.name}</p>
              <p className={styles.returnDate}>Return date: <strong>{new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })}</strong></p>
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:20 }}>
              <Button variant="ghost" onClick={() => setReturnId(null)}>Cancel</Button>
              <Button onClick={() => markReturned(returnId)}>Confirm Return</Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

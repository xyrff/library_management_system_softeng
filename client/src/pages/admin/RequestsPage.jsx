import { useState } from 'react';
import { ClipboardList, CheckCircle, XCircle } from 'lucide-react';
import { mockRequests } from '../../data/mockData';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import styles from './RequestsPage.module.css';

function riskLabel(score) {
  if (score < 0.25) return 'Low Risk';
  if (score < 0.6)  return 'High Risk';
  return 'High Risk';
}
function riskVariant(score) {
  if (score < 0.25) return 'success';
  return 'danger';
}
function borrowerLabel(count) {
  if (count === 0 || count === 1) return 'New Borrower';
  return null;
}

export default function RequestsPage() {
  const [requests, setRequests] = useState(mockRequests);
  const [confirm, setConfirm]   = useState(null); // { id, action }

  const act = (id, action) => {
    setRequests(r => r.map(req => req.id === id ? { ...req, status: action } : req));
    setConfirm(null);
  };

  const pending = requests.filter(r => r.status === 'pending');

  return (
    <div className={styles.page}>
      <PageHeader
        title="Borrow Requests"
        subtitle={`${pending.length} request${pending.length !== 1 ? 's' : ''} awaiting approval`}
      />

      {pending.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={36} />}
          title="No pending requests"
          description="All caught up! Check back later for new borrow requests."
        />
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Book</th>
                <th>Duration</th>
                <th>Requested</th>
                <th>Risk Assessment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pending.map(req => (
                <tr key={req.id}>
                  <td>
                    <div className={styles.studentCell}>
                      <div className={styles.avatar}>{req.student.name[0]}</div>
                      <div>
                        <p className={styles.name}>{req.student.name}</p>
                        <p className={styles.email}>{req.student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className={styles.bookTitle}>{req.book.title}</p>
                    <p className={styles.bookAuthor}>{req.book.author}</p>
                  </td>
                  <td className={styles.muted}>{req.duration} days</td>
                  <td className={styles.muted}>{new Date(req.requestDate).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}</td>
                  <td>
                    <div className={styles.riskCell}>
                      <Badge label={riskLabel(req.riskScore)} variant={riskVariant(req.riskScore)} />
                      {borrowerLabel(req.student.borrowCount) && (
                        <Badge label={borrowerLabel(req.student.borrowCount)} variant="warning" />
                      )}
                      <span className={styles.riskPct}>{Math.round(req.riskScore * 100)}%</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.actBtns}>
                      <Button size="sm" onClick={() => setConfirm({ id: req.id, action: 'approved' })}
                        icon={<CheckCircle size={14} />}>Approve</Button>
                      <Button size="sm" variant="danger" onClick={() => setConfirm({ id: req.id, action: 'rejected' })}
                        icon={<XCircle size={14} />}>Reject</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Processed */}
      {requests.filter(r=>r.status!=='pending').length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontSize:16, fontWeight:700, marginBottom:12, color:'var(--color-text-secondary)' }}>Processed This Session</h3>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <tbody>
                {requests.filter(r=>r.status!=='pending').map(req => (
                  <tr key={req.id}>
                    <td><strong>{req.student.name}</strong></td>
                    <td>{req.book.title}</td>
                    <td><Badge label={req.status === 'approved' ? 'Approved' : 'Rejected'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={!!confirm} onClose={() => setConfirm(null)} title={`Confirm ${confirm?.action === 'approved' ? 'Approval' : 'Rejection'}`} size="sm">
        <p style={{ fontSize:14, color:'var(--color-text-secondary)', marginBottom:20 }}>
          Are you sure you want to <strong>{confirm?.action === 'approved' ? 'approve' : 'reject'}</strong> this borrow request?
        </p>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <Button variant="ghost" onClick={() => setConfirm(null)}>Cancel</Button>
          <Button
            variant={confirm?.action === 'approved' ? 'primary' : 'danger'}
            onClick={() => act(confirm.id, confirm.action)}
          >
            {confirm?.action === 'approved' ? 'Approve' : 'Reject'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

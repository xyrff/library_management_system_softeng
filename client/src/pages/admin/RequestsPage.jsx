import { useEffect, useState } from 'react';
import { ClipboardList, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import styles from './RequestsPage.module.css';

function riskLabel(score) {
  if (score < 0.35) return 'Low Risk';
  if (score <= 0.65) return 'Medium Risk';
  return 'High Risk';
}

function riskVariant(score) {
  if (score < 0.35) return 'success';
  if (score <= 0.65) return 'warning';
  return 'danger';
}

const formatDate = date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    let isMounted = true;
    api.get('/transactions/pending')
      .then(response => { if (isMounted) setRequests(response.data); })
      .catch(() => { if (isMounted) setError('Could not load pending requests. Please try again.'); })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, []);

  const act = async (id, action) => {
    setActionError('');
    try {
      await api.post(`/transactions/${id}/${action === 'approved' ? 'approve' : 'reject'}`);
      setRequests(current => current.filter(request => request._id !== id));
      setConfirm(null);
    } catch (err) {
      setActionError(err.response?.data?.message || `Could not ${action === 'approved' ? 'approve' : 'reject'} this request.`);
    }
  };

  return (
    <div className={styles.page}>
      <PageHeader title="Borrow Requests" subtitle={`${requests.length} request${requests.length !== 1 ? 's' : ''} awaiting approval`} />

      {loading ? (
        <p className={styles.status}>Loading pending requests…</p>
      ) : error ? (
        <p className={styles.status}>{error}</p>
      ) : requests.length === 0 ? (
        <EmptyState icon={<ClipboardList size={36} />} title="No pending requests" description="All caught up! Check back later for new borrow requests." />
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Student</th><th>Book</th><th>Borrow / Return</th><th>Requested</th><th>Risk Assessment</th><th>Actions</th></tr></thead>
            <tbody>
              {requests.map(req => (
                <tr key={req._id}>
                  <td><div className={styles.studentCell}>
                    <div className={styles.avatar}>{req.memberId?.name?.[0] || '?'}</div>
                    <div><p className={styles.name}>{req.memberId?.name || 'Unknown member'}</p><p className={styles.email}>{req.memberId?.email || '—'}</p></div>
                  </div></td>
                  <td><p className={styles.bookTitle}>{req.bookId?.title || 'Unknown book'}</p><p className={styles.bookAuthor}>{req.bookId?.author || '—'}</p>{req.reservationId && <Badge label="From reservation" variant="info" />}</td>
                  <td className={styles.muted}>{formatDate(req.borrowDate)} – {formatDate(req.dueDate)}</td>
                  <td className={styles.muted}>{formatDate(req.createdAt || req.borrowDate)}</td>
                  <td><div className={styles.riskCell}>
                    {req.lateReturnRiskScore == null ? <span className={styles.muted}>Not available</span> : (
                      <><Badge label={riskLabel(req.lateReturnRiskScore)} variant={riskVariant(req.lateReturnRiskScore)} /><span className={styles.riskPct}>{Math.round(req.lateReturnRiskScore * 100)}%</span></>
                    )}
                  </div></td>
                  <td><div className={styles.actBtns}>
                    <Button size="sm" onClick={() => setConfirm({ id: req._id, action: 'approved' })} icon={<CheckCircle size={14} />}>Approve</Button>
                    <Button size="sm" variant="danger" onClick={() => setConfirm({ id: req._id, action: 'rejected' })} icon={<XCircle size={14} />}>Reject</Button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {actionError && <p className={styles.status}>{actionError}</p>}

      <Modal isOpen={!!confirm} onClose={() => setConfirm(null)} title={`Confirm ${confirm?.action === 'approved' ? 'Approval' : 'Rejection'}`} size="sm">
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 20 }}>
          Are you sure you want to <strong>{confirm?.action === 'approved' ? 'approve' : 'reject'}</strong> this borrow request?
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setConfirm(null)}>Cancel</Button>
          <Button variant={confirm?.action === 'approved' ? 'primary' : 'danger'} onClick={() => act(confirm.id, confirm.action)}>
            {confirm?.action === 'approved' ? 'Approve' : 'Reject'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

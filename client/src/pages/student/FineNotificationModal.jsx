import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import styles from './FineNotificationModal.module.css';

const formatIssuedDate = (date) => new Date(date).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

export default function FineNotificationModal({ fines, onClose }) {
  if (!fines.length) return null;

  return (
    <Modal isOpen onClose={onClose} title="Outstanding fines" size="md">
      <div className={styles.content}>
        <p className={styles.intro}>
          You have outstanding fines. Please settle them at the library.
        </p>
        <ul className={styles.fineList}>
          {fines.map((fine) => {
            const title = fine.transactionId?.bookId?.title || 'an unknown book';
            return (
              <li className={styles.fine} key={fine._id}>
                <p>
                  You have an outstanding fine for returning '<strong>{title}</strong>' late.
                  Please settle this at the library.
                </p>
                <dl className={styles.details}>
                  <div>
                    <dt>Amount</dt>
                    <dd>{fine.amount}</dd>
                  </div>
                  <div>
                    <dt>Issued</dt>
                    <dd>{formatIssuedDate(fine.createdAt)}</dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
        <div className={styles.actions}>
          <Button onClick={onClose}>Got it</Button>
        </div>
      </div>
    </Modal>
  );
}

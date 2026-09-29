import { Outlet } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import FineNotificationModal from '../../pages/student/FineNotificationModal';
import Sidebar from './Sidebar';
import styles from './AppLayout.module.css';

export default function AppLayout() {
  const { currentUser, fineNotification, dismissFineNotification } = useApp();

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <Outlet />
      </main>
      {currentUser?.role === 'member' && fineNotification && (
        <FineNotificationModal
          fines={fineNotification}
          onClose={dismissFineNotification}
        />
      )}
    </div>
  );
}

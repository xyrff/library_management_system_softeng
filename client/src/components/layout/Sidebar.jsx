import { NavLink } from 'react-router-dom';
import { BookOpen, LayoutDashboard, List, BookMarked, BarChart2, LogOut, Library, ClipboardList } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import styles from './Sidebar.module.css';

const studentLinks = [
  { to: '/catalog', icon: <BookOpen size={18} />, label: 'Book Catalog' },
  { to: '/my-books', icon: <BookMarked size={18} />, label: 'My Books' },
];

const adminLinks = [
  { to: '/admin/dashboard',    icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/admin/catalog',      icon: <BookOpen size={18} />,        label: 'Book Catalog' },
  { to: '/admin/requests',     icon: <ClipboardList size={18} />,   label: 'Requests' },
  { to: '/admin/active-borrows', icon: <List size={18} />,          label: 'Active Borrows' },
  { to: '/admin/reports',      icon: <BarChart2 size={18} />,       label: 'Reports' },
];

export default function Sidebar() {
  const { currentUser, logout } = useApp();
  const links = currentUser?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandIcon}><Library size={22} /></div>
        <div>
          <p className={styles.brandName}>Greenfield Library</p>
          <p className={styles.brandSub}>School Library System</p>
        </div>
      </div>

      <div className={styles.userInfo}>
        <div className={styles.avatar}>{currentUser?.name?.[0]}</div>
        <div>
          <p className={styles.userName}>{currentUser?.name}</p>
          <p className={styles.userRole}>{currentUser?.role === 'admin' ? 'Librarian' : 'Student'}</p>
        </div>
      </div>

      <nav className={styles.nav} aria-label="Main navigation">
        <p className={styles.navSection}>Menu</p>
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            <span className={styles.linkIcon}>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <button className={styles.logout} onClick={logout}>
        <LogOut size={16} />
        Sign out
      </button>
    </aside>
  );
}

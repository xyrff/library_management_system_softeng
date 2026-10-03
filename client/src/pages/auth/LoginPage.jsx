import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Library } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { APP_NAME, APP_SUBTITLE } from '../../constants/branding';
import styles from './AuthPage.module.css';

export default function LoginPage() {
  const { login } = useApp();
  const navigate   = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const { data } = await api.post('/auth/login', { email, password });
      login({ token: data.token, email, role: data.role, name: data.name });
      navigate(data.role === 'member' ? '/catalog' : '/admin/dashboard');
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        'Unable to sign in. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Branding */}
        <div className={styles.brand}>
          <div className={styles.brandIcon}><Library size={28} /></div>
          <h1 className={styles.brandName}>{APP_NAME}</h1>
          <p className={styles.brandTagline}>{APP_SUBTITLE}</p>
        </div>

        <h2 className={styles.heading}>Welcome back</h2>
        <p className={styles.subheading}>Sign in to your account to continue</p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <Input
            label="Email address"
            type="email"
            placeholder="you@school.edu"
            value={email}
            onChange={e => setEmail(e.target.value)}
            icon={<Mail size={16} />}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            icon={<Lock size={16} />}
            required
          />
          {error && <p className={styles.error}>{error}</p>}

          <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Signing In…' : 'Sign In'}
          </Button>
        </form>

        <div className={styles.hint}>
          <p>Sign in with your library account.</p>
        </div>

        <p className={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" className={styles.link}>Create one</Link>
        </p>
      </div>
    </div>
  );
}

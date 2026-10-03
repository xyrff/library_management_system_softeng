import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Library } from 'lucide-react';
import api from '../../services/api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { APP_NAME, APP_SUBTITLE } from '../../constants/branding';
import styles from './AuthPage.module.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name    = 'Name is required';
    if (!form.email.trim()) e.email   = 'Email is required';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setErrors({});
    setIsSubmitting(true);

    try {
      await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        memberType: 'student',
      });
      setDone(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (requestError) {
      setErrors({
        form: requestError.response?.data?.message ||
          'Unable to create your account. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (done) return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.successIcon}>✓</div>
        <h2 className={styles.heading}>Account created!</h2>
        <p className={styles.subheading}>Redirecting you to login…</p>
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}><Library size={28} /></div>
          <h1 className={styles.brandName}>{APP_NAME}</h1>
          <p className={styles.brandTagline}>{APP_SUBTITLE}</p>
        </div>

        <h2 className={styles.heading}>Create an account</h2>
        <p className={styles.subheading}>Join the school library system</p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <Input label="Full name" placeholder="Your full name" value={form.name}
            onChange={set('name')} icon={<User size={16} />} error={errors.name} required />
          <Input label="Email address" type="email" placeholder="you@school.edu" value={form.email}
            onChange={set('email')} icon={<Mail size={16} />} error={errors.email} required />
          <Input label="Password" type="password" placeholder="At least 6 characters" value={form.password}
            onChange={set('password')} icon={<Lock size={16} />} error={errors.password} required />
          <Input label="Confirm password" type="password" placeholder="Repeat your password" value={form.confirm}
            onChange={set('confirm')} icon={<Lock size={16} />} error={errors.confirm} required />

          <div className={styles.roleNote}>
            <span>📚</span>
            <span>All new accounts are registered as <strong>Student / Borrower</strong>. Contact the librarian to change your role.</span>
          </div>

          {errors.form && <p className={styles.error}>{errors.form}</p>}
          <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Account…' : 'Create Account'}
          </Button>
        </form>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link to="/" className={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

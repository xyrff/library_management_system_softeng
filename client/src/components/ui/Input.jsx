import styles from './Input.module.css';

export default function Input({ label, type = 'text', placeholder, value, onChange, error, icon, required, name, min, max, readOnly }) {
  return (
    <div className={styles.field}>
      {label && <label className={styles.label}>{label}{required && <span className={styles.required}>*</span>}</label>}
      <div className={styles.inputWrap}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <input
          className={`${styles.input} ${icon ? styles.hasIcon : ''} ${error ? styles.hasError : ''}`}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          name={name}
          min={min}
          max={max}
          required={required}
          readOnly={readOnly}
        />
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}

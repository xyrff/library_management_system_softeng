import styles from './Select.module.css';

export default function Select({ label, value, onChange, options, placeholder, name }) {
  return (
    <div className={styles.field}>
      {label && <label className={styles.label}>{label}</label>}
      <select className={styles.select} value={value} onChange={onChange} name={name}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
        ))}
      </select>
    </div>
  );
}

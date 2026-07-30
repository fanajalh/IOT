import { useState } from 'react';
import { Lock, Eye, EyeSlash } from '@phosphor-icons/react';

export default function PasswordInput({ value, onChange, placeholder = '••••••••', ...props }) {
  const [show, setShow] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
      <input 
        type={show ? 'text' : 'password'} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder}
        style={{ width: '100%', padding: '1rem 3rem 1rem 3rem', fontSize: '1rem', fontFamily: 'var(--font-main)' }}
        {...props}
      />
      <button 
        type="button"
        onClick={() => setShow(!show)} 
        style={{ 
          position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem',
          color: 'var(--text-muted)', display: 'flex', alignItems: 'center'
        }}
      >
        {show ? <EyeSlash size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
}

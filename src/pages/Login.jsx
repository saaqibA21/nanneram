import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div style={{ position: 'relative', overflow: 'hidden', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Background Glows */}
      <div style={{ position: 'absolute', top: '10%', left: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)', zIndex: -1 }}></div>
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(112, 0, 255, 0.2) 0%, transparent 70%)', zIndex: -1 }}></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass"
        style={{ width: '100%', maxWidth: '450px', padding: '3rem', textAlign: 'center' }}
      >
        <h2 className="display-font" style={{ fontSize: '2rem', marginBottom: '1rem' }}>WELCOME BACK</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '0.9rem' }}>Enter your credentials to access your profile.</p>

        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>EMAIL ADDRESS</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                placeholder="athlete@anywhey.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', background: '#121216', border: '1px solid var(--glass-border)', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', color: 'white' }} 
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', background: '#121216', border: '1px solid var(--glass-border)', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', color: 'white' }} 
              />
            </div>
          </div>

          <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
            <a href="#" style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }}>Forgot password?</a>
          </div>

          <button className="glow-hover" style={{ background: 'var(--primary)', color: 'black', padding: '1.2rem', borderRadius: '12px', fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', marginTop: '1rem' }}>
            <LogIn size={20} /> SIGN IN
          </button>
        </form>

        <div style={{ margin: '3rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ height: '1px', background: 'var(--glass-border)', flex: 1 }}></div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>OR CONTINUE WITH</span>
          <div style={{ height: '1px', background: 'var(--glass-border)', flex: 1 }}></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <button className="glass" style={{ padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', fontWeight: 600, fontSize: '0.9rem' }}>
            GOOGLE
          </button>
          <button className="glass" style={{ padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', fontWeight: 600, fontSize: '0.9rem' }}>
            GITHUB
          </button>
        </div>

        <p style={{ marginTop: '3rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account? <a href="#" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create Account</a>
        </p>
      </motion.div>
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, ShoppingBag, Clock, Heart, LogOut, Edit3, Award, Zap } from 'lucide-react';

const OrderItem = ({ id, status, date, amount, products }) => (
  <div className="glass" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
      <div style={{ background: '#121216', padding: '1rem', borderRadius: '12px' }}>
        <ShoppingBag size={24} color="var(--primary)" />
      </div>
      <div>
        <p style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.2rem' }}>Order #{id} <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '1rem' }}>({date})</span></p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{products}</p>
      </div>
    </div>
    <div style={{ textAlign: 'right' }}>
      <p style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.25rem' }}>${amount}</p>
      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: status === 'DELIVERED' ? '#4ade80' : '#fb923c', padding: '4px 8px', borderRadius: '4px', background: 'rgba(0,0,0,0.5)' }}>{status}</span>
    </div>
  </div>
);

export default function Profile() {
  return (
    <div className="container" style={{ paddingTop: '50px', paddingBottom: '100px', display: 'grid', gridTemplateColumns: '350px 1fr', gap: '3rem' }}>
      {/* Sidebar Profile Info */}
      <motion.aside initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <div className="glass" style={{ padding: '2.5rem', textAlign: 'center', position: 'sticky', top: '120px' }}>
          <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 2rem' }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--accent-gradient)', padding: '4px' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#121216', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <User size={60} color="var(--primary)" />
              </div>
            </div>
            <button style={{ position: 'absolute', bottom: '0', right: '0', background: 'white', color: 'black', padding: '0.5rem', borderRadius: '50%', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
              <Edit3 size={16} />
            </button>
          </div>
          
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Marcus Kane</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Elite Member</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
            <div className="glass" style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)' }}>
              <Zap size={20} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '1.2rem', fontWeight: 800 }}>2450</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>RECOVERY PTS</p>
            </div>
            <div className="glass" style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)' }}>
              <Award size={20} color="var(--secondary)" style={{ marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '1.2rem', fontWeight: 800 }}>Gold</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>TIER STATUS</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            <button className="glass" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 600, fontSize: '0.95rem' }}>
              <Shield size={18} /> Account Security
            </button>
            <button className="glass" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 600, fontSize: '0.95rem' }}>
              <Heart size={18} /> Favorites
            </button>
            <button className="glass" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 600, fontSize: '0.95rem', color: '#ff4b4b' }}>
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Profile Content */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>MISSION OVERVIEW</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>Management of your orders and performance history.</p>

        <section style={{ marginBottom: '4rem' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Clock size={24} color="var(--primary)" /> RECENT ORDERS
          </h3>
          <OrderItem 
            id="45210" 
            status="DELIVERED" 
            date="Dec 12, 2025" 
            amount="124.98" 
            products="Whey Isolate x2, Creatine Mono x1" 
          />
          <OrderItem 
            id="44982" 
            status="SHIPPING" 
            date="Jan 05, 2026" 
            amount="59.99" 
            products="Vegan Power - Vanilla Blast" 
          />
          <OrderItem 
            id="44120" 
            status="DELIVERED" 
            date="Nov 22, 2025" 
            amount="84.99" 
            products="Mass Catalyst x1, Pre-Workout x1" 
          />
        </section>

        <section>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <Shield size={24} color="var(--primary)" /> PERSONAL INFORMATION
          </h3>
          <div className="glass" style={{ padding: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
             <div>
               <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700 }}>FULL NAME</label>
               <input readOnly value="Marcus Kane" style={{ width: '100%', background: '#121216', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '8px', color: 'white' }} />
             </div>
             <div>
               <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700 }}>EMAIL ADDRESS</label>
               <input readOnly value="m.kane@ifbbpro.com" style={{ width: '100%', background: '#121216', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '8px', color: 'white' }} />
             </div>
             <div>
               <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700 }}>SHIPPING ADDRESS</label>
               <input readOnly value="742 Evergreen Terrace, Springfield" style={{ width: '100%', background: '#121216', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '8px', color: 'white' }} />
             </div>
             <div>
               <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700 }}>PHONE NUMBER</label>
               <input readOnly value="+1 (555) 0123-456" style={{ width: '100%', background: '#121216', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '8px', color: 'white' }} />
             </div>
          </div>
        </section>
      </motion.div>
    </div>
  );
}

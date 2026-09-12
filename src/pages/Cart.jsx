import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, CreditCard, Apple, ShieldCheck, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

const CartItem = ({ name, price, img, quantity }) => (
  <div className="glass" style={{ padding: '1.5rem', display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
    <div style={{ background: '#121216', padding: '1rem', borderRadius: '12px', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src={img} alt={name} style={{ height: '80%', objectFit: 'contain' }} />
    </div>
    <div style={{ flex: 1 }}>
      <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{name}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Flavor: Extreme Chocolate Blast</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#121216', borderRadius: '8px', padding: '0.4rem' }}>
          <button style={{ padding: '0.4rem', color: 'var(--text-muted)' }}><Minus size={16} /></button>
          <span style={{ padding: '0 1.2rem', fontWeight: 800 }}>{quantity}</span>
          <button style={{ padding: '0.4rem', color: 'var(--primary)' }}><Plus size={16} /></button>
        </div>
        <button style={{ color: '#ff4b4b', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>
          <Trash2 size={16} /> REMOVE
        </button>
      </div>
    </div>
    <div style={{ textAlign: 'right' }}>
      <p style={{ fontWeight: 800, fontSize: '1.4rem' }}>${price}</p>
    </div>
  </div>
);

export default function Cart() {
  const subtotal = 119.98;
  const shipping = 5.00;
  const tax = 9.60;
  const total = subtotal + shipping + tax;

  return (
    <div className="container" style={{ paddingTop: '50px', paddingBottom: '100px', display: 'grid', gridTemplateColumns: '1fr 400px', gap: '3rem' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>YOUR CART</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '3.5rem' }}>Double check your fuel selection before checkout.</p>
        
        <CartItem name="Whey Isolate - Midnight Cyan" price="59.99" img="/assets/hero.png" quantity={1} />
        <CartItem name="Whey Isolate - Strawberry Rush" price="59.99" img="/assets/hero.png" quantity={1} />
        
        <div style={{ marginTop: '3rem', padding: '2rem', borderRadius: '16px', border: '1px dashed var(--glass-border)', display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ background: 'rgba(0, 245, 255, 0.1)', padding: '1rem', borderRadius: '12px' }}>
            <Truck color="var(--primary)" size={32} />
          </div>
          <div>
            <h4 style={{ marginBottom: '0.4rem' }}>Free shipping unlocked!</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Your order qualifies for premium rapid shipping worldwide.</p>
          </div>
        </div>
      </motion.div>

      <motion.aside initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="glass" style={{ padding: '2.5rem', position: 'sticky', top: '120px' }}>
          <h3 style={{ fontSize: '1.6rem', marginBottom: '2.5rem' }}>ORDER SUMMARY</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontWeight: 600 }}>
              <span>SUBTOTAL</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontWeight: 600 }}>
              <span>SHIPPING</span>
              <span style={{ color: '#4ade80' }}>FREE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontWeight: 600 }}>
              <span>TAX</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div style={{ height: '1px', background: 'var(--glass-border)', margin: '0.5rem 0' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.6rem', fontWeight: 800 }}>
              <span>TOTAL</span>
              <span style={{ color: 'var(--primary)' }}>${total.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <button className="glow-hover" style={{ background: 'var(--primary)', color: 'black', padding: '1.2rem', borderRadius: '12px', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
               <CreditCard size={22} /> PROCEED TO CHECKOUT
             </button>
             <button className="glass" style={{ padding: '1.2rem', borderRadius: '12px', fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
               <Apple size={22} /> PAY WITH APPLE PAY
             </button>
          </div>

          <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
               <ShieldCheck size={20} color="var(--text-muted)" />
               <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>SECURE SSL ENCRYPTION</span>
            </div>
            <Link to="/shop" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>RETURN TO MISSION CONTROL</Link>
          </div>
        </div>
      </motion.aside>
    </div>
  );
}

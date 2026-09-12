import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ShoppingCart, ChevronDown } from 'lucide-react';

const products = [
  { id: 1, name: 'Whey Isolate - Midnight Cyan', price: 59.99, image: '/assets/hero.png', category: 'WHEY', rating: 4.9, tags: ['PURE', 'FAST'] },
  { id: 2, name: 'Vegan Power - Arctic White', price: 49.99, image: '/assets/vegan.png', category: 'VEGAN', rating: 4.8, tags: ['PLANT', 'SUSTAINABLE'] },
  { id: 3, name: 'Mass Catalyst - Iron Gold', price: 64.99, image: '/assets/hero.png', category: 'MASS', rating: 4.7, tags: ['BULK', 'STRENGTH'] },
  { id: 4, name: 'Whey Isolate - Strawberry Rush', price: 59.99, image: '/assets/hero.png', category: 'WHEY', rating: 4.9, tags: ['FLAVOR', 'FAST'] },
  { id: 5, name: 'Casein Slow-Burn', price: 54.99, image: '/assets/hero.png', category: 'CASEIN', rating: 4.8, tags: ['NIGHT', 'STEADY'] },
  { id: 6, name: 'Pre-Workout Ignite', price: 39.99, image: '/assets/hero.png', category: 'PRE-WORKOUT', rating: 5.0, tags: ['ENERGY', 'FOCUS'] },
];

export default function Shop({ setCartCount }) {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filteredProducts = products.filter(p => 
    (filter === 'ALL' || p.category === filter) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container" style={{ paddingTop: '50px', paddingBottom: '100px' }}>
      <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>ELEVATE YOUR GAME</h1>
          <p style={{ color: 'var(--text-muted)' }}>Browse our elite range of scientifically formulated supplements.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search fuel..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: '#121216', border: '1px solid var(--glass-border)', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', color: 'white', width: '300px' }} 
            />
          </div>
          <button className="glass" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0 1.5rem', fontWeight: 600 }}>
            <Filter size={18} /> FILTER <ChevronDown size={16} />
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem' }}>
        {['ALL', 'WHEY', 'VEGAN', 'MASS', 'PRE-WORKOUT'].map(cat => (
          <button 
            key={cat}
            onClick={() => setFilter(cat)}
            style={{ 
              padding: '0.6rem 1.5rem', 
              borderRadius: '30px', 
              fontWeight: 600, 
              background: filter === cat ? 'var(--primary)' : '#121216',
              color: filter === cat ? 'black' : 'var(--text-muted)',
              transition: 'all 0.3s'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '3rem' }}>
        {filteredProducts.map((prod) => (
          <motion.div 
            layout
            key={prod.id} 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass" 
            style={{ padding: '1.5rem', transition: 'box-shadow 0.3s' }}
          >
            <div style={{ background: '#121216', borderRadius: '12px', height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', position: 'relative' }}>
              <img src={prod.image} alt={prod.name} style={{ height: '70%', objectFit: 'contain' }} />
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                {prod.tags.map(t => <span key={t} style={{ background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: 800, color: 'var(--primary)' }}>{t}</span>)}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{prod.category}</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--secondary)', fontWeight: 700 }}>★ {prod.rating}</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>{prod.name}</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>${prod.price}</span>
              <button onClick={() => setCartCount(c => c + 1)} className="glow-hover" style={{ background: 'var(--primary)', color: 'black', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 800, display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                <ShoppingCart size={18} /> BUY NOW
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

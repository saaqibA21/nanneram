import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, Zap, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Feature = ({ icon: Icon, title, desc }) => (
  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
    <div style={{ background: 'rgba(0, 245, 255, 0.1)', padding: '1rem', borderRadius: '12px' }}>
      <Icon color="var(--primary)" size={32} />
    </div>
    <div>
      <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>{desc}</p>
    </div>
  </div>
);

const Home = ({ setCartCount }) => {
  return (
    <div>
      {/* Hero Section */}
      <section className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', height: 'calc(100vh - 100px)', minHeight: '600px' }}>
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}>
          <span style={{ color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.2rem', fontSize: '0.9rem' }}>FUEL YOUR AMBITION</span>
          <h1 style={{ fontSize: '4.5rem', marginTop: '1.5rem', lineHeight: '1.1', fontWeight: 800 }}>
            ANY BODY. <br />
            <span style={{ color: 'var(--primary)' }}>ANYWHEY.</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginTop: '2rem', maxWidth: '500px', lineHeight: 1.6 }}>
            Engineered for elite performance. Our scientifically formulated protein delivers unmatched purity and rapid absorption for your most intense grinds.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '3rem' }}>
            <Link to="/shop" className="button-glow" style={{ background: 'var(--primary)', color: 'black', padding: '1rem 2.5rem', borderRadius: '8px', fontWeight: 700, fontSize: '1rem' }}>
              SHOP THE COLLECTION
            </Link>
            <button className="glass" style={{ border: '1px solid var(--glass-border)', color: 'white', padding: '1rem 2.5rem', borderRadius: '8px', fontWeight: 600 }}>
              OUR FORMULA
            </button>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2 }} style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', width: '500px', height: '500px', background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: -1 }}></div>
          <img className="animate-float" src="/assets/hero.png" alt="AnyWhey Protein Tub" style={{ width: '100%', maxWidth: '550px', filter: 'drop-shadow(0 0 50px rgba(0, 245, 255, 0.2))' }} />
        </motion.div>
      </section>

      {/* Features */}
      <section style={{ borderY: '1px solid var(--glass-border)', background: 'linear-gradient(180deg, #0a0a0c 0%, #0d0d12 100%)', padding: '5rem 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4rem' }}>
          <Feature icon={ShieldCheck} title="LAB TESTED" desc="Every batch is third-party lab tested for heavy metals and purity. Zero banned substances." />
          <Feature icon={Zap} title="FAST ABSORBING" desc="Proprietary enzymatic blend ensures rapid muscle recovery and peak nutrient delivery." />
          <Feature icon={Truck} title="GLOBAL SHIPPING" desc="Fast, reliable door-to-door delivery. Free shipping on orders over $100 worldwide." />
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>FEATURED FUEL</h2>
            <p style={{ color: 'var(--text-muted)' }}>Specialized blends for every goal.</p>
          </div>
          <Link to="/shop" style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            VIEW ALL PRODUCTS <ArrowRight size={18} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem' }}>
          {[
            { id: 1, name: 'Whey Isolate', price: '$59.99', img: '/assets/hero.png', type: 'ELITE PERFORMANCE' },
            { id: 2, name: 'Vegan Power', price: '$49.99', img: '/assets/vegan.png', type: 'PLANT POWERED' },
            { id: 3, name: 'Mass Catalyst', price: '$64.99', img: '/assets/hero.png', type: 'SIZE & STRENGTH' },
          ].map((prod) => (
            <motion.div key={prod.id} whileHover={{ y: -10 }} className="glass" style={{ padding: '1.5rem' }}>
              <div style={{ background: '#121216', borderRadius: '12px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', overflow: 'hidden' }}>
                <img src={prod.img} alt={prod.name} style={{ height: '80%', objectFit: 'contain' }} />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.1rem' }}>{prod.type}</span>
              <h3 style={{ fontSize: '1.4rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>{prod.name}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{prod.price}</span>
                <button onClick={() => setCartCount(c => c + 1)} style={{ background: 'white', color: 'black', padding: '0.6rem 1.2rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem' }}>
                  ADD TO CART
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonial Section */}
      <section style={{ background: '#0a0a0c', padding: '8rem 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.2rem', marginBottom: '1.5rem' }}>
            {[1,2,3,4,5].map(i => <Star key={i} size={20} color="var(--secondary)" fill="var(--secondary)" />)}
          </div>
          <h2 style={{ fontSize: '2.8rem', maxWidth: '800px', margin: '0 auto 3rem', lineHeight: 1.2 }}>"THE BEST TASTING AND HIGHEST QUALITY PROTEIN I'VE EVER USED FOR MY COMP PREP."</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#121216', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={30} color="var(--primary)" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>MARCUS KANE</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>IFBB PRO BODYBUILDER</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

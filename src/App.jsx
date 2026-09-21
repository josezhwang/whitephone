import React, { useEffect, useRef, useState } from 'react';
import Scene from './Scene.jsx';
import { FALLBACK_PRODUCTS, NAV_LINKS, FEATURES, MARQUEE } from './data.js';

function Loader({ done }) {
  return (
    <div className={`loader ${done ? 'done' : ''}`}>
      <div className="stack">
        <div className="cube" />
        <p>Exito — preparing stage</p>
      </div>
    </div>
  );
}

function Toast({ text }) {
  const [visible, setVisible] = useState(false);
  const timer = useRef();
  useEffect(() => {
    if (!text) return;
    setVisible(true);
    timer.current = setTimeout(() => setVisible(false), 2400);
    return () => clearTimeout(timer.current);
  }, [text]);
  return <div className={`toast ${visible ? 'show' : ''}`}>{text}</div>;
}

function Logo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 1.5 L14.2 9.8 L22.5 12 L14.2 14.2 L12 22.5 L9.8 14.2 L1.5 12 L9.8 9.8 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function App() {
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [active, setActive] = useState(0);
  const [colorIdx, setColorIdx] = useState(0);
  const [cart, setCart] = useState(0);
  const [toast, setToast] = useState('');
  const [loaded, setLoaded] = useState(false);
  const featuresRef = useRef(null);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => Array.isArray(d.products) && d.products.length && setProducts(d.products))
      .catch(() => {});
  }, []);

  const product = products[active] ?? products[0];
  if (!product) return null;

  const addToCart = () => {
    setCart((c) => c + 1);
    setToast(`${product.name} added to cart ✦`);
  };

  const scrollToFeatures = () =>
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <>
      <Loader done={loaded} />
      <div className="scene-wrap" style={{ position: 'fixed', inset: 0 }}>
        <Scene onLoaded={() => setLoaded(true)} />
      </div>

      <div className="page">
        {/* -------- top bar -------- */}
        <header className="topbar">
          <div className="logo">
            <span className="logo-mark">
              <Logo />
            </span>
            <span>
              EXI<em>TO</em>
            </span>
          </div>

          <nav className="nav">
            {NAV_LINKS.map((l, i) => (
              <a key={l} href="#" className={i === 0 ? 'active' : ''} onClick={(e) => e.preventDefault()}>
                {l}
              </a>
            ))}
          </nav>

          <div className="topbar-actions">
            <button className="icon-btn" title="Search">
              ⌕
            </button>
            <button
              className="icon-btn"
              title="Cart"
              onClick={() => setToast(cart ? `${cart} item(s) in cart` : 'Your cart is empty')}
            >
              ⬡
              {cart > 0 && <span className="cart-dot">{cart}</span>}
            </button>
            <button className="btn btn-primary" onClick={addToCart}>
              Get started
            </button>
          </div>
        </header>

        <main>
          {/* -------- hero -------- */}
          <section className="hero">
            <div className="hero-copy">
              <span className="eyebrow">Licensed FX Trading · MetaQuotes</span>
              <h1>
                FX Trading,
                <br />
                <em>rendered beautifully.</em>
              </h1>
              <p>
                FX trading brokered with MetaQuotes offers its services in the
                foreign exchange markets using platforms developed by MetaQuotes
                Software — such as MetaTrader 4 (MT4) and MetaTrader 5 (MT5).
              </p>
              <div className="hero-cta">
                <button className="btn btn-primary" onClick={addToCart}>
                  Get started
                </button>
                <button className="btn btn-ghost" onClick={scrollToFeatures}>
                  Explore ↓
                </button>
              </div>
            </div>

            {/* -------- product panel -------- */}
            <aside className="product-panel glass">
              <div className="panel-head">
                <h3>{product.name}</h3>
                <span className="product-badge">● LIVE</span>
              </div>
              <p className="panel-tag">{product.tagline}</p>

              <div className="rating-row">
                <span className="stars">★★★★★</span>
                <span>
                  {product.rating} · {product.reviews.toLocaleString()} reviews
                </span>
              </div>

              <div className="spec-grid">
                {product.specs.map(([k, v]) => (
                  <div className="spec" key={k}>
                    <span>{k}</span>
                    <b>{v}</b>
                  </div>
                ))}
              </div>

              <div className="swatch-row">
                <span>Plan</span>
                {product.colors.map((c, i) => (
                  <button
                    key={c}
                    className={`swatch ${i === colorIdx ? 'selected' : ''}`}
                    style={{ background: c }}
                    onClick={() => setColorIdx(i)}
                    title={c}
                  />
                ))}
              </div>

              <div className="price-row">
                <div className="price">
                  ${product.price}
                  <small>${product.oldPrice}</small>
                </div>
                <span className="discount">−{Math.round((1 - product.price / product.oldPrice) * 100)}%</span>
              </div>

              <button className="btn btn-primary" onClick={addToCart}>
                Add to cart
              </button>
            </aside>
          </section>

          {/* -------- bottom bar -------- */}
          <div className="bottom-bar">
            <div className="dots">
              {products.map((p, i) => (
                <button
                  key={p.id}
                  className={`dot ${i === active ? 'active' : ''}`}
                  onClick={() => {
                    setActive(i);
                    setColorIdx(0);
                  }}
                  title={p.name}
                />
              ))}
            </div>
            <div className="scroll-hint">
              Scroll
              <span className="mouse" />
            </div>
          </div>
        </main>

        {/* -------- marquee -------- */}
        <div className="marquee">
          <div className="marquee-track">
            {[...MARQUEE, ...MARQUEE].map((m, i) => (
              <span key={i}>
                <i>◆</i>
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* -------- features -------- */}
        <section className="features" ref={featuresRef}>
          {FEATURES.map((f) => (
            <article className="feature" key={f.title}>
              <div className="f-icon">{f.icon}</div>
              <h4>{f.title}</h4>
              <p>{f.text}</p>
            </article>
          ))}
        </section>

        {/* -------- footer -------- */}
        <footer>
          <span>© 2026 EXITO — Licensed FX trading infrastructure.</span>
          <div className="links">
            <a href="#" onClick={(e) => e.preventDefault()}>Privacy</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Terms</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Instagram</a>
            <a href="#" onClick={(e) => e.preventDefault()}>X</a>
          </div>
        </footer>
      </div>

      <Toast text={toast} />
    </>
  );
}

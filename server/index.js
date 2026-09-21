import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4310;

const products = [
  {
    id: 'fx-trading',
    name: 'FX Trading',
    tagline: 'FX trading brokered with MetaQuotes — MT4 & MT5 infrastructure for the foreign exchange markets.',
    price: 499,
    oldPrice: 799,
    rating: 4.9,
    reviews: 1284,
    accent: '#7c3aed',
    specs: [
      ['Platforms', 'MT4 + MT5'],
      ['Execution', '< 12 ms'],
      ['Regulation', 'Licensed'],
      ['Instruments', '1,200+'],
    ],
    colors: ['#f5f4f8', '#7c3aed', '#17151f'],
  },
  {
    id: 'metaquotes',
    name: 'MetaQuotes Platforms',
    tagline: 'Real-time quotes, customizable charting, and automated trading via Expert Advisors.',
    price: 249,
    oldPrice: 349,
    rating: 4.8,
    reviews: 3162,
    accent: '#8b5cf6',
    specs: [
      ['Charting', 'Advanced'],
      ['Automation', 'EAs built-in'],
      ['Uptime', '99.99%'],
      ['Mobile', 'iOS + Android'],
    ],
    colors: ['#f5f4f8', '#7c3aed', '#17151f'],
  },
  {
    id: 'strategies',
    name: 'Strategies & Analysis',
    tagline: 'Scalping, day trading, swing trading — deep technical and fundamental analysis tools.',
    price: 129,
    oldPrice: 199,
    rating: 4.7,
    reviews: 890,
    accent: '#a78bfa',
    specs: [
      ['Modes', '4 built-in'],
      ['Signals', 'Real-time'],
      ['Backtest', 'Tick-level'],
      ['API', 'Open'],
    ],
    colors: ['#f5f4f8', '#7c3aed', '#17151f'],
  },
];

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/products', (_req, res) => res.json({ products }));

const dist = path.join(__dirname, '..', 'dist');
app.use(express.static(dist));
app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));

app.listen(PORT, () => {
  console.log(`EXITO store running → http://localhost:${PORT}`);
});

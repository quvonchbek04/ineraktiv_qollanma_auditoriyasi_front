// pages/Home.jsx — Bosh sahifa (polished)

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: '📚', title: 'Kitoblar', desc: 'Elektron kitoblar va o\'quv materiallari' },
  { icon: '🎬', title: 'Video darslar', desc: 'YouTube va yuklangan video qo\'llanmalar' },
  { icon: '🎧', title: 'Audio kitoblar', desc: 'Quloqda eshitib o\'rganing' },
  { icon: '✍️', title: 'Blog', desc: 'O\'z fikr va tajribalaringizni ulashing' },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="page-container">
      <div className="hero">
        <h1>
          O'quv platformasiga<br />xush kelibsiz 🎓
        </h1>
        <p>
          Kitoblar, video qo'llanmalar va audio kitoblar — barchasi bir joyda.
          O'rganing, ulashing va rivojlaning.
        </p>
        <div className="hero-actions">
          <Link to="/library" className="btn-primary">
            Kutubxonaga o'tish →
          </Link>
          {!isAuthenticated && (
            <Link to="/register" className="btn-secondary">
              Ro'yxatdan o'tish
            </Link>
          )}
        </div>

        <div className="hero-features">
          {features.map((f) => (
            <div key={f.title} className="hero-feature-card">
              <div className="hero-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

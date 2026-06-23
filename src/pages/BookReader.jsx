// pages/BookReader.jsx — AI Kitob O'quvchi
// Foydalanuvchi kitob tanlaydi, AI (Claude) bilan savol-javob shaklida o'qiydi

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { contentApi, aiApi } from '../api/client';

export default function BookReader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  const [book, setBook] = useState(null);
  const [bookLoading, setBookLoading] = useState(true);
  const [bookError, setBookError] = useState('');

  const [messages, setMessages] = useState([]); // { role: 'user'|'ai', content: string }
  const [input, setInput] = useState('');
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState('');

  // Kitob ma'lumotlarini yuklash
  useEffect(() => {
    async function loadBook() {
      try {
        const data = await contentApi.getAll('book');
        const found = (data.content || []).find((c) => c.id === parseInt(id));
        if (!found) {
          setBookError('Kitob topilmadi.');
        } else if (found.content_source !== 'upload') {
          setBookError('Bu kitob AI o\'qish uchun yaroqsiz (faqat yuklangan PDF kitoblar).');
        } else {
          setBook(found);
          // Boshlang'ich xabar
          setMessages([
            {
              role: 'ai',
              content: `Salom! Men "${found.title}" kitobini o'qib, sizning savollaringizga javob beraman. Nima haqida bilmoqchisiz?`
            }
          ]);
        }
      } catch {
        setBookError('Kitobni yuklashda xatolik.');
      } finally {
        setBookLoading(false);
      }
    }
    loadBook();
  }, [id]);

  // Yangi xabar kelganda pastga scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    const question = input.trim();
    if (!question || asking) return;

    setInput('');
    setAskError('');
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setAsking(true);

    try {
      // Tarix sifatida faqat text xabarlarni yuboramiz (AI boshlang'ich xabarini o'tkazib)
      const history = messages
        .filter((m) => !(m.role === 'ai' && messages.indexOf(m) === 0))
        .map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }));

      const data = await aiApi.ask(parseInt(id), question, history);
      setMessages((prev) => [...prev, { role: 'ai', content: data.answer }]);
    } catch (err) {
      setAskError(err.message || 'AI dan javob olishda xatolik.');
      // Xato bo'lsa user xabarini olib tashlaymiz
      setMessages((prev) => prev.slice(0, -1));
      setInput(question);
    } finally {
      setAsking(false);
    }
  }

  if (bookLoading) {
    return <div className="page-container"><p className="page-loading">Yuklanmoqda...</p></div>;
  }

  if (bookError) {
    return (
      <div className="page-container">
        <div className="auth-error">{bookError}</div>
        <Link to="/library" className="btn-secondary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          ← Kutubxonaga qaytish
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Kitob sarlavhasi */}
      <div className="reader-header">
        <button className="btn-secondary" onClick={() => navigate('/library')}>
          ← Orqaga
        </button>
        <div className="reader-book-info">
          <h1>🤖 AI bilan o'qish</h1>
          <p className="reader-book-title">📚 {book.title}</p>
          {book.description && <p className="reader-book-desc">{book.description}</p>}
        </div>
      </div>

      {/* Chat oynasi */}
      <div className="reader-chat">
        <div className="reader-messages">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`reader-message ${msg.role === 'user' ? 'reader-message-user' : 'reader-message-ai'}`}
            >
              <div className="reader-message-avatar">
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="reader-message-bubble">
                {msg.content}
              </div>
            </div>
          ))}

          {asking && (
            <div className="reader-message reader-message-ai">
              <div className="reader-message-avatar">🤖</div>
              <div className="reader-message-bubble reader-typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {askError && <div className="auth-error" style={{ margin: '0.5rem 0' }}>{askError}</div>}

        {/* Savol kiritish */}
        <form onSubmit={handleSend} className="reader-input-row">
          <input
            type="text"
            className="reader-input"
            placeholder="Kitob haqida savol bering..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={asking}
          />
          <button
            type="submit"
            className="btn-primary"
            disabled={asking || !input.trim()}
          >
            {asking ? '...' : '➤'}
          </button>
        </form>

        <p className="reader-hint">
          💡 Masalan: "Bu kitob nimalar haqida?", "Asosiy fikrlar nimalar?", "3-bobni tushuntir"
        </p>
      </div>
    </div>
  );
}

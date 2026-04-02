import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (response.ok) {
        // БРАУЗЕР ЖАДЫНА САҚТАУ
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email); // <--- ПРОФИЛЬ ҮШІН МАҢЫЗДЫ ЖОЛ ҚОСЫЛДЫ!
        
        if (data.role === 'admin') navigate('/admin');
        else navigate('/');
      } else {
        setError(data.error || 'Қате шықты');
      }
    } catch {
      setError('Сервермен байланыс жоқ');
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --navy: #102B45; --gold: #EAB308; --gold-h: #FBBF24; }
        body { font-family: 'Inter', sans-serif; }

        .auth-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: var(--navy);
        }

        /* LEFT panel */
        .auth-left {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 40px 56px;
          overflow: hidden;
        }
        .auth-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 30% 80%, rgba(234,179,8,0.08) 0%, transparent 65%),
            radial-gradient(ellipse 50% 40% at 80% 10%, rgba(234,179,8,0.05) 0%, transparent 55%);
          pointer-events: none;
        }
        .auth-left::after {
          content: '';
          position: absolute;
          top: 0; left: 0; bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, transparent, var(--gold) 20%, var(--gold) 80%, transparent);
          opacity: 0.4;
        }

        .left-bg-text {
          position: absolute;
          font-family: 'Montserrat', sans-serif;
          font-size: 38vw;
          font-weight: 900;
          color: rgba(255,255,255,0.015);
          bottom: -15%;
          left: -10%;
          line-height: 1;
          pointer-events: none;
          user-select: none;
          z-index: 0;
        }

        .left-logo img {
          height: 42px;
          object-fit: contain;
          position: relative;
          z-index: 1;
        }

        .left-content {
          position: relative;
          z-index: 1;
        }
        .left-eyebrow {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
        }
        .eyebrow-line { width: 32px; height: 1px; background: var(--gold); opacity: 0.6; }
        .eyebrow-text {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: var(--gold);
        }
        .left-title {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(36px, 4vw, 56px);
          font-weight: 900;
          color: white;
          line-height: 1.05;
          letter-spacing: -0.03em;
          margin-bottom: 20px;
        }
        .left-title span { color: var(--gold); }
        .left-desc {
          font-size: 14px;
          font-weight: 400;
          color: rgba(255,255,255,0.4);
          line-height: 1.8;
          max-width: 340px;
        }

        .left-footer {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.18);
          position: relative;
          z-index: 1;
        }

        /* RIGHT panel */
        .auth-right {
          background: #F8FAFC;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 56px;
        }

        .auth-card {
          width: 100%;
          max-width: 400px;
        }

        .card-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 26px;
          font-weight: 900;
          color: var(--navy);
          letter-spacing: -0.02em;
          margin-bottom: 6px;
        }
        .card-sub {
          font-size: 13px;
          color: #94A3B8;
          font-weight: 500;
          margin-bottom: 36px;
        }

        .error-box {
          background: #FEE2E2;
          border: 1px solid #FECACA;
          border-radius: 10px;
          padding: 12px 16px;
          margin-bottom: 24px;
          font-size: 13px;
          font-weight: 600;
          color: #DC2626;
          text-align: center;
        }

        .form-group { margin-bottom: 20px; }
        .form-label {
          display: block;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #94A3B8;
          margin-bottom: 8px;
        }
        .form-input {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: var(--navy);
          background: white;
          border: 1.5px solid rgba(16,43,69,0.1);
          border-radius: 12px;
          padding: 14px 16px;
          width: 100%;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-shadow: 0 1px 3px rgba(16,43,69,0.04);
        }
        .form-input:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px rgba(234,179,8,0.12);
        }
        .form-input::placeholder { color: #CBD5E1; font-weight: 400; }

        .btn-submit {
          width: 100%;
          background: var(--navy);
          color: white;
          border: none;
          cursor: pointer;
          font-family: 'Montserrat', sans-serif;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 16px;
          border-radius: 12px;
          margin-top: 8px;
          transition: all 0.25s;
          position: relative;
          overflow: hidden;
        }
        .btn-submit::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 3px;
          background: var(--gold);
        }
        .btn-submit:hover {
          background: #0b1e30;
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(16,43,69,0.25);
        }
        .btn-submit:active { transform: scale(0.98); }

        .auth-bottom {
          text-align: center;
          margin-top: 28px;
          font-size: 13px;
          color: #94A3B8;
          font-weight: 500;
        }
        .auth-bottom a {
          color: var(--navy);
          font-weight: 800;
          text-decoration: none;
          border-bottom: 2px solid var(--gold);
          padding-bottom: 1px;
        }
        .auth-bottom a:hover { color: #C9980A; }

        @media (max-width: 768px) {
          .auth-root { grid-template-columns: 1fr; }
          .auth-left { display: none; }
          .auth-right { background: var(--navy); }
          .auth-card { max-width: 100%; }
          .form-input { background: rgba(255,255,255,0.07); color: white; border-color: rgba(255,255,255,0.12); }
          .form-input::placeholder { color: rgba(255,255,255,0.3); }
          .form-input:focus { border-color: var(--gold); background: rgba(255,255,255,0.1); }
          .card-title { color: white; }
          .card-sub { color: rgba(255,255,255,0.4); }
          .form-label { color: rgba(255,255,255,0.4); }
          .btn-submit { background: var(--gold); color: var(--navy); }
          .btn-submit::after { display: none; }
          .auth-bottom { color: rgba(255,255,255,0.4); }
          .auth-bottom a { color: var(--gold); }
        }
      `}</style>

      <div className="auth-root">
        {/* LEFT */}
        <div className="auth-left">
          <div className="left-bg-text">Т</div>
          <div className="left-logo">
            <Link to="/"><img src="/logo.png" alt="TILIM" /></Link>
          </div>
          <div className="left-content">
            <div className="left-eyebrow">
              <div className="eyebrow-line" />
              <span className="eyebrow-text">Білім платформасы</span>
            </div>
            <h1 className="left-title">
              Қазақ тілі<br /><span>ережелері</span>
            </h1>
            <p className="left-desc">
              5–9 сынып оқушыларына арналған интерактивті
              сабақтар, видео түсіндірмелер және тесттер.
            </p>
          </div>
          <div className="left-footer">© 2026 ТІЛІМ ПЛАТФОРМАСЫ</div>
        </div>

        {/* RIGHT */}
        <div className="auth-right">
          <div className="auth-card">
            <h2 className="card-title">Қош келдіңіз</h2>
            <p className="card-sub">Аккаунтыңызға кіріңіз</p>

            {error && <div className="error-box">{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Электронды пошта</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="email@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Құпия сөз</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-submit">
                Жүйеге кіру →
              </button>
            </form>

            <p className="auth-bottom">
              Аккаунтыңыз жоқ па? <Link to="/register">Тіркелу</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
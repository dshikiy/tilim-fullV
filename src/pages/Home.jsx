import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const grades = [5, 6, 7, 8, 9];
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  // Қолданушының жүйеге кіргенін және рөлін тексеру
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const role = localStorage.getItem('userRole');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --navy: #102B45;
          --navy-dark: #0b1e30;
          --navy-mid: #163752;
          --gold: #EAB308;
          --gold-hover: #FBBF24;
          --gold-dim: rgba(234,179,8,0.15);
          --cream: #F8F9FA;
          --white: #ffffff;
        }

        body { font-family: 'Inter', sans-serif; background: var(--cream); color: var(--navy); overflow-x: hidden; }

        /* ── HERO ── */
        .hero {
          background: var(--navy);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        .hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 50% 100%, rgba(234,179,8,0.06) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 15% 30%, rgba(234,179,8,0.04) 0%, transparent 60%);
          pointer-events: none;
        }

        .hero::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent 0%, var(--gold) 30%, var(--gold) 70%, transparent 100%);
        }

        /* ── NAVBAR ── */
        .navbar {
          position: relative;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 48px;
          background: white;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .nav-logo img {
          height: 44px;
          object-fit: contain;
          display: block;
          filter: brightness(0) invert(0.1) sepia(1) hue-rotate(180deg) saturate(3);
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 28px;
          list-style: none;
        }

        .nav-links a {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--navy);
          text-decoration: none;
          transition: color 0.2s;
        }
        .nav-links a:hover, .nav-links a.active { color: var(--gold); }

        .nav-divider {
          width: 1px;
          height: 20px;
          background: rgba(0,0,0,0.1);
          margin: 0 8px;
        }

        .btn-nav-login {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--navy);
          text-decoration: none;
          transition: color 0.2s;
        }
        .btn-nav-login:hover { color: var(--gold); }

        .btn-nav-register {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          background: var(--gold);
          color: var(--navy);
          text-decoration: none;
          padding: 10px 26px;
          border-radius: 50px;
          transition: all 0.25s;
          box-shadow: 0 4px 20px rgba(234,179,8,0.25);
        }
        .btn-nav-register:hover {
          background: var(--gold-hover);
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(234,179,8,0.35);
        }

        .btn-admin {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          background: var(--gold);
          color: var(--navy);
          text-decoration: none;
          padding: 10px 26px;
          border-radius: 50px;
        }

        .user-badge {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #10b981;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: color 0.2s;
        }
        .user-badge:hover { color: #059669; }

        .btn-logout {
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,100,100,0.8);
          transition: color 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .btn-logout:hover { color: #ef4444; }

        /* ── HERO CONTENT ── */
        .hero-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 60px 48px 100px;
          position: relative;
          z-index: 10;
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .hero-body.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .hero-bg-text {
          position: absolute;
          font-family: 'Montserrat', sans-serif;
          font-size: 28vw;
          font-weight: 900;
          color: rgba(255,255,255,0.015);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          white-space: nowrap;
          pointer-events: none;
          user-select: none;
          letter-spacing: -0.05em;
          z-index: 0;
        }

        .hero-title {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(48px, 7.5vw, 96px);
          font-weight: 900;
          line-height: 1.0;
          letter-spacing: -0.03em;
          color: white;
          margin-bottom: 20px;
        }
        .hero-title .gold { color: var(--gold); }

        .hero-sub {
          font-size: 14px;
          font-weight: 400;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin-bottom: 52px;
        }

        .hero-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-hero {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: var(--gold);
          color: var(--navy);
          font-family: 'Montserrat', sans-serif;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          text-decoration: none;
          padding: 18px 50px;
          border-radius: 50px;
          transition: all 0.3s;
          box-shadow: 0 12px 40px rgba(234,179,8,0.3);
          position: relative;
          overflow: hidden;
        }
        .btn-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent 60%);
          border-radius: 50px;
        }
        .btn-hero:hover {
          background: var(--gold-hover);
          transform: translateY(-3px);
          box-shadow: 0 20px 50px rgba(234,179,8,0.4);
        }
        .btn-hero:active { transform: scale(0.97); }

        .hero-dots {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 10;
        }
        .dot-long { width: 32px; height: 4px; background: var(--gold); border-radius: 2px; }
        .dot-sm { width: 8px; height: 4px; background: rgba(255,255,255,0.18); border-radius: 2px; }

        /* ── COMMON SECTION STYLES ── */
        .section-heading {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 40px;
        }
        .section-bar {
          width: 5px;
          height: 40px;
          background: var(--gold);
          border-radius: 3px;
          box-shadow: 0 0 16px rgba(234,179,8,0.4);
        }
        .section-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 32px;
          font-weight: 900;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          color: var(--navy);
        }

        /* ── GRADES SECTION ── */
        .grades-section {
          background: var(--cream);
          padding: 80px 48px 100px;
        }
        .grades-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .grade-card {
          background: var(--navy);
          border-radius: 28px;
          padding: 40px 20px 36px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          aspect-ratio: 4/5;
          text-decoration: none;
          position: relative;
          overflow: hidden;
          transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s;
          cursor: pointer;
        }
        .grade-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(234,179,8,0.08) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.4s;
        }
        .grade-card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 30px 60px rgba(16,43,69,0.3);
        }
        .grade-card:hover::before { opacity: 1; }

        .grade-ornament {
          position: absolute;
          bottom: -16px;
          right: -12px;
          font-size: 100px;
          opacity: 0.04;
          pointer-events: none;
          transition: transform 0.5s, opacity 0.4s;
          user-select: none;
        }
        .grade-card:hover .grade-ornament {
          transform: scale(1.3) rotate(5deg);
          opacity: 0.07;
        }

        .grade-num {
          font-family: 'Montserrat', sans-serif;
          font-size: 80px;
          font-weight: 900;
          color: var(--gold);
          line-height: 1;
          position: relative;
          z-index: 1;
          transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
          drop-shadow: 0 0 30px rgba(234,179,8,0.3);
          text-shadow: 0 0 40px rgba(234,179,8,0.2);
        }
        .grade-card:hover .grade-num { transform: scale(1.1); }
        .grade-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin-top: 14px;
          position: relative;
          z-index: 1;
          transition: color 0.3s;
        }
        .grade-card:hover .grade-label { color: rgba(255,255,255,0.65); }

        /* ── FEATURES / POSSIBILITIES SECTION (ЖАҢА) ── */
        .features-section {
          background: white;
          padding: 80px 48px;
          border-top: 1px solid rgba(16,43,69,0.05);
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 30px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .feature-card {
          background: var(--cream);
          border-left: 4px solid var(--gold);
          padding: 35px 30px;
          border-radius: 0 16px 16px 0;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
          transition: transform 0.3s, box-shadow 0.3s;
          position: relative;
        }
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.08);
        }
        .feat-icon {
          font-size: 32px;
          color: var(--navy);
          margin-bottom: 20px;
          display: inline-block;
          background: rgba(234,179,8,0.2);
          padding: 15px;
          border-radius: 12px;
        }
        .feat-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 18px;
          font-weight: 800;
          color: var(--navy);
          margin-bottom: 12px;
        }
        .feat-desc {
          font-size: 14px;
          color: rgba(16,43,69,0.7);
          line-height: 1.7;
        }

        /* ── ABOUT SECTION ── */
        .about-section {
          background: var(--cream);
          padding: 80px 48px;
          border-top: 1px solid rgba(16,43,69,0.07);
        }
        .about-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 80px;
          align-items: center;
        }
        .about-tagline {
          font-size: 15px;
          font-weight: 400;
          line-height: 1.8;
          color: rgba(16,43,69,0.65);
          margin-top: 16px;
        }
        .about-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .about-card {
          background: white;
          border: 1px solid rgba(16,43,69,0.07);
          border-radius: 20px;
          padding: 28px 24px;
          transition: border-color 0.2s, transform 0.2s;
        }
        .about-card:hover {
          border-color: rgba(234,179,8,0.4);
          transform: translateY(-2px);
        }
        .about-card-icon {
          font-size: 22px;
          color: var(--gold);
          margin-bottom: 12px;
        }
        .about-card-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 15px;
          font-weight: 800;
          color: var(--navy);
          margin-bottom: 6px;
        }
        .about-card-desc {
          font-size: 12px;
          color: rgba(16,43,69,0.5);
          line-height: 1.6;
        }

        /* ── FOOTER ── */
        .footer {
          background: var(--navy);
          border-top: 6px solid var(--gold);
          padding: 48px;
        }
        .footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }
        .footer-logo {
          font-family: 'Montserrat', sans-serif;
          font-size: 22px;
          font-weight: 900;
          color: white;
          letter-spacing: 0.15em;
        }
        .footer-logo span { color: var(--gold); }
        .footer-links {
          display: flex;
          gap: 32px;
          list-style: none;
          flex-wrap: wrap;
        }
        .footer-links a {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-links a:hover { color: var(--gold); }
        .footer-copy {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
        }

        @media (max-width: 900px) {
          .navbar { padding: 16px 24px; }
          .nav-links { display: none; }
          .hero-body { padding: 48px 24px 80px; }
          .grades-section, .features-section, .about-section { padding: 60px 24px; }
          .grades-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
          .about-inner { grid-template-columns: 1fr; gap: 40px; }
          .footer { padding: 40px 24px; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg-text">ТIL</div>

        {/* NAVBAR */}
        <nav className="navbar">
          <Link to="/" className="nav-logo">
            <img src="/logo.png" alt="TILIM" />
          </Link>

          <ul className="nav-links">
            <li><Link to="/" className="active">Бастау</Link></li>
            <li><a href="#grades">Сыныптар</a></li>
            <li><Link to="/games">Ойын</Link></li>
            <li><Link to="/group-work">Топтық жұмыс</Link></li>
            
            {/* Тек жүйеге кіргенде ғана менюда көрсетіледі */}
            {isLoggedIn && <li><Link to="/chat">ИИ Чат</Link></li>}
            
            <li>
              <div style={{display:'flex',alignItems:'center',gap:'20px'}}>
                <div className="nav-divider" />
                {isLoggedIn ? (
                  <>
                    {role === 'admin' ? (
                      <Link to="/admin" className="btn-admin">Админ панель</Link>
                    ) : (
                      <Link to="/profile" className="user-badge">
                        <i className="fa-solid fa-user-check" /> Менің профилім
                      </Link>
                    )}
                    <button onClick={handleLogout} className="btn-logout">
                      Шығу <i className="fa-solid fa-right-from-bracket" />
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="btn-nav-login">Кіру</Link>
                    <Link to="/register" className="btn-nav-register">Тіркелу</Link>
                  </>
                )}
              </div>
            </li>
          </ul>
        </nav>

        {/* HERO BODY */}
        <div className={`hero-body ${visible ? 'visible' : ''}`}>
          <h1 className="hero-title">
            <span className="gold">TILIM:</span> Қазақ тілі<br />ережелері
          </h1>
          <p className="hero-sub">ескірмейтін ереже, жаңаша зерде</p>
          
          <div className="hero-buttons">
            <Link to="/grades/5" className="btn-hero">Бастау</Link>
            
            {/* ИИ ЧАТ БАТЫРМАСЫНЫҢ ЛОГИКАСЫ */}
            {isLoggedIn ? (
              <Link 
                to="/chat" 
                className="btn-hero" 
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  color: '#fff', 
                  border: '1px solid rgba(234,179,8,0.5)', 
                  boxShadow: '0 8px 25px rgba(234,179,8,0.15)' 
                }}
              >
                <i className="fa-solid fa-robot"></i> ИИ Чат
              </Link>
            ) : (
              <Link 
                to="/login" 
                className="btn-hero" 
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  color: 'rgba(255,255,255,0.5)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  cursor: 'pointer'
                }}
                title="Чатты қолдану үшін жүйеге кіріңіз"
              >
                <i className="fa-solid fa-lock"></i> ИИ Чат 
              </Link>
            )}
          </div>
        </div>

        <div className="hero-dots">
          <div className="dot-long" />
          <div className="dot-sm" />
          <div className="dot-sm" />
        </div>
      </section>

      {/* ── GRADES ── */}
      <section className="grades-section" id="grades">
        <div style={{maxWidth:'1200px', margin:'0 auto'}}>
          <div className="section-heading">
            <div className="section-bar" />
            <h2 className="section-title">Оқу бағдарламасы</h2>
          </div>

          <div className="grades-grid">
            {grades.map((grade) => (
              <Link key={grade} to={`/grades/${grade}`} className="grade-card">
                <div className="grade-ornament">⚜</div>
                <span className="grade-num">{grade}</span>
                <span className="grade-label">сынып</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES / POSSIBILITIES (ЖАҢА ТОЛЫҚТЫРЫЛҒАН БӨЛІМ) ── */}
      <section className="features-section" id="features">
        <div style={{maxWidth:'1200px', margin:'0 auto'}}>
          <div className="section-heading">
            <div className="section-bar" />
            <h2 className="section-title">Платформа мүмкіндіктері</h2>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <i className="fa-solid fa-robot feat-icon"></i>
              <h3 className="feat-title">ИИ Көмекші (Chat AI)</h3>
              <p className="feat-desc">
                Ережелерді жаттап қана қоймай, түсінбеген сұрақтарыңызды Жасанды Интеллектке қойыңыз. Ол сізге мысалдармен, жеңіл тілмен 24/7 түсіндіруге дайын. (Тек тіркелген қолданушылар үшін қолжетімді)
              </p>
            </div>

            <div className="feature-card">
              <i className="fa-solid fa-gamepad feat-icon"></i>
              <h3 className="feat-title">Интерактивті Ойындар</h3>
              <p className="feat-desc">
                Оқу процесін қызықты ету үшін сөзжұмбақтар, викториналар және логикалық тапсырмалар орындаңыз. Ойын ойнау арқылы грамматика мен фонетиканы жылдам меңгеріңіз.
              </p>
            </div>

            <div className="feature-card">
              <i className="fa-solid fa-users feat-icon"></i>
              <h3 className="feat-title">Топтық Жұмыс</h3>
              <p className="feat-desc">
                Сыныптастарыңызбен немесе платформадағы басқа оқушылармен бірігіп жұмыс жасаңыз. Ортақ бөлмелер құрып, тапсырмаларды бірге шешіп, біліммен алмасыңыз.
              </p>
            </div>

            <div className="feature-card">
              <i className="fa-solid fa-chart-line feat-icon"></i>
              <h3 className="feat-title">Прогресс бақылау</h3>
              <p className="feat-desc">
                Жеке кабинетіңізде қанша сабақ өткеніңізді, қай тақырыптан қате көп жібергеніңізді көріп, өз біліміңізді сараптаңыз. Нақты статистика арқылы даму деңгейіңізді қадағалаңыз.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="about-section" id="about">
        <div className="about-inner">
          <div className="about-left">
            <div className="section-heading">
              <div className="section-bar" />
              <h2 className="section-title">Біз туралы</h2>
            </div>
            <p className="about-tagline">
              <strong>TILIM</strong> — Қазақ әдеби тілінің заңдылықтарын жүйелі түрде, заманауи технологиялар арқылы үйрететін отандық платформа. 
              <br/><br/>
              Біздің мақсатымыз: 5–9 сынып оқушыларына фонетика, морфология және сөз таптарын жалықтырмайтын, интерактивті форматта жеткізу.
            </p>
          </div>

          <div className="about-cards">
            {[
              { icon: 'fa-solid fa-volume-high', title: 'Фонетика', desc: 'Дыбыс, әріп, буын және екпін ережелерін толық қамтиды.' },
              { icon: 'fa-solid fa-shapes', title: 'Морфология', desc: 'Сөз түрлендіру, сөзжасам және қосымшалар жүйесі.' },
              { icon: 'fa-solid fa-tags', title: 'Сөз табы', desc: 'Зат есім, сын есім, етістік және басқа да грамматикалық таптар.' },
              { icon: 'fa-solid fa-spell-check', title: 'Тесттер', desc: 'Әр тақырыпты бекітуге арналған білім тексеру жүйесі.' },
            ].map((item, i) => (
              <div key={i} className="about-card">
                <div className="about-card-icon"><i className={item.icon} /></div>
                <div className="about-card-title">{item.title}</div>
                <div className="about-card-desc">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo"><span>TILIM</span></div>
          <ul className="footer-links">
            <li><Link to="/">Бастау</Link></li>
            <li><a href="#features">Мүмкіндіктер</a></li>
            <li><a href="#about">Біз туралы</a></li>
            <li><Link to="/games">Ойын</Link></li>
            <li><Link to="/group-work">Топтық жұмыс</Link></li>
            {/* Тек жүйеге кіргенде ғана Footer-де көрсетіледі */}
            {isLoggedIn && <li><Link to="/chat">ИИ Чат</Link></li>}
          </ul>
          <p className="footer-copy">© 2026 ТІЛІМ ПЛАТФОРМАСЫ — Барлық құқықтар қорғалған</p>
        </div>
      </footer>
    </>
  );
};

export default Home;
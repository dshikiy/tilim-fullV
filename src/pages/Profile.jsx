import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const userEmail = localStorage.getItem('userEmail');

  // Нақты статистика мен тарихты сақтайтын өрістер
  const [userData, setUserData] = useState({ 
    full_name: '', 
    city: '', 
    score: 0,
    completed_lessons: 0,
    accuracy: 0,
    history: []
  });
  
  const [passData, setPassData] = useState({ old_password: '', new_password: '' });

  // 1. Бет ашылғанда анимация қосу және Бэкендтен мәлімет тарту
  useEffect(() => {
    setTimeout(() => setVisible(true), 100);

    if (!userEmail) {
      navigate('/login');
      return;
    }
    
    fetch(`https://tilim-sqx4.onrender.com/api/profile?email=${userEmail}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setUserData({ 
            full_name: data.full_name || '', 
            city: data.city || '', 
            score: data.score || 0,
            completed_lessons: data.completed_lessons || 0,
            accuracy: data.accuracy || 0,
            history: data.history || [] 
          });
        }
      })
      .catch(err => console.error("Деректерді алуда қате кетті:", err));
  }, [userEmail, navigate]);

  // 2. Профильді сақтау (Аты-жөні, Қала)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const res = await fetch('https://tilim-sqx4.onrender.com/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, full_name: userData.full_name, city: userData.city })
    });
    if (res.ok) alert("✅ Жеке мәліметтер сақталды!");
  };

  // 3. Парольді ауыстыру
  const handleChangePassword = async (e) => {
    e.preventDefault();
    const res = await fetch('https://tilim-sqx4.onrender.com/api/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, old_password: passData.old_password, new_password: passData.new_password })
    });
    const data = await res.json();
    if (res.ok) {
      alert("✅ Құпия сөз ауыстырылды!");
      setPassData({ old_password: '', new_password: '' });
    } else {
      alert("Қате: " + data.error);
    }
  };

  // Тұрақты жетістіктер (әзірге дизайн үшін қалдырамыз)
  const achievements = [
    { id: 1, title: 'Бастама', desc: 'Алғашқы сабақты аяқтады', icon: 'fa-solid fa-seedling', color: '#10b981' },
    { id: 2, title: 'Грамматика шебері', desc: 'Морфологиядан 5 тесттен сүрінбей өтті', icon: 'fa-solid fa-crown', color: '#EAB308' },
    { id: 3, title: 'Ойыншы', desc: 'Ойындарда 10 рет жеңіске жетті', icon: 'fa-solid fa-gamepad', color: '#3b82f6' },
    { id: 4, title: 'Белсенді', desc: 'Қатарынан 7 күн кірді', icon: 'fa-solid fa-fire', color: '#ef4444' },
  ];

  return (
    <>
      <style>{`
        .profile-container {
          min-height: 100vh;
          background: #F8F9FA;
          font-family: 'Inter', sans-serif;
          color: #102B45;
          padding: 40px 20px;
        }
        .header-top {
          max-width: 1000px;
          margin: 0 auto 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .btn-back {
          background: none;
          border: none;
          color: #102B45;
          font-family: 'Montserrat', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: color 0.3s;
        }
        .btn-back:hover { color: #EAB308; }

        .profile-content {
          max-width: 1000px;
          margin: 0 auto;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s ease;
        }
        .profile-content.visible { opacity: 1; transform: translateY(0); }

        /* Үстіңгі бас бөлік (Avatar & Info) */
        .profile-header {
          background: #102B45;
          border-radius: 24px;
          padding: 40px;
          display: flex;
          align-items: center;
          gap: 30px;
          color: white;
          box-shadow: 0 15px 40px rgba(16,43,69,0.15);
          margin-bottom: 30px;
          position: relative;
          overflow: hidden;
        }
        .profile-header::before {
          content: '';
          position: absolute;
          right: -50px;
          top: -50px;
          width: 200px;
          height: 200px;
          background: rgba(234,179,8,0.1);
          border-radius: 50%;
        }
        .avatar-circle {
          width: 100px;
          height: 100px;
          background: #EAB308;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          color: #102B45;
          font-weight: 800;
          border: 4px solid rgba(255,255,255,0.2);
          text-transform: uppercase;
        }
        .user-name {
          font-family: 'Montserrat', sans-serif;
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 5px;
        }
        .user-email-badge {
          font-size: 12px;
          color: #EAB308;
          letter-spacing: 1px;
          text-transform: uppercase;
          font-weight: 700;
        }
        .total-points {
          margin-left: auto;
          text-align: right;
          z-index: 10;
        }
        .points-val {
          font-family: 'Montserrat', sans-serif;
          font-size: 36px;
          font-weight: 900;
          color: #EAB308;
        }
        .points-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: rgba(255,255,255,0.7);
        }

        /* Статистика */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }
        .stat-card {
          background: white;
          border-radius: 20px;
          padding: 30px 20px;
          text-align: center;
          box-shadow: 0 5px 20px rgba(16,43,69,0.04);
        }
        .stat-icon { font-size: 24px; color: #102B45; margin-bottom: 15px; opacity: 0.5; }
        .stat-num { font-family: 'Montserrat', sans-serif; font-size: 28px; font-weight: 800; color: #102B45; margin-bottom: 5px; }
        .stat-label { font-size: 12px; color: rgba(16,43,69,0.5); text-transform: uppercase; letter-spacing: 1px; }

        /* Формалар мен Тарих Grid */
        .bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-top: 40px;
        }

        .box-card {
          background: white;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 5px 20px rgba(16,43,69,0.04);
        }
        .box-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 25px;
          color: #102B45;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* Форма стилдері */
        .form-group { margin-bottom: 20px; }
        .form-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: rgba(16,43,69,0.5);
          text-transform: uppercase;
          margin-bottom: 8px;
          letter-spacing: 1px;
        }
        .form-input {
          width: 100%;
          padding: 14px 15px;
          border-radius: 12px;
          border: 2px solid rgba(16,43,69,0.05);
          background: #F8F9FA;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #102B45;
          outline: none;
          transition: all 0.3s;
        }
        .form-input:focus { border-color: #EAB308; background: white; }
        
        .btn-submit {
          background: #10b981;
          color: white;
          border: none;
          padding: 14px 20px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          width: 100%;
          transition: all 0.3s;
        }
        .btn-submit:hover { background: #059669; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(16,185,129,0.3); }
        
        .btn-danger { background: #ef4444; }
        .btn-danger:hover { background: #dc2626; box-shadow: 0 5px 15px rgba(239,68,68,0.3); }

        /* Тарих стилдері */
        .history-list {
          max-height: 550px;
          overflow-y: auto;
          padding-right: 10px;
        }
        .history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #F8F9FA;
          border-radius: 16px;
          margin-bottom: 12px;
          border: 1px solid rgba(16,43,69,0.03);
          transition: transform 0.2s;
        }
        .history-item:hover { transform: translateX(5px); border-color: rgba(234,179,8,0.3); }
        .h-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
        }
        .h-details { flex: 1; margin: 0 15px; }
        .h-title { font-weight: 700; font-size: 14px; margin-bottom: 4px; color: #102B45; }
        .h-date { font-size: 11px; color: rgba(16,43,69,0.5); }
        .h-points { font-weight: 800; color: #10b981; font-size: 14px; }

        /* Жетістіктер */
        .section-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 20px;
          font-weight: 800;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .achievements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }
        .badge-card {
          background: white;
          border: 1px solid rgba(16,43,69,0.05);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          transition: transform 0.2s;
        }
        .badge-card:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(16,43,69,0.05); }
        .badge-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: white;
        }
        .badge-title { font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 700; margin-bottom: 4px; }
        .badge-desc { font-size: 11px; color: rgba(16,43,69,0.5); line-height: 1.4; }

        @media (max-width: 768px) {
          .profile-header { flex-direction: column; text-align: center; gap: 15px; }
          .total-points { margin-left: 0; text-align: center; margin-top: 20px; }
          .stats-grid { grid-template-columns: 1fr; }
          .bottom-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="profile-container">
        <div className="header-top">
          <button onClick={() => navigate('/')} className="btn-back">
            <i className="fa-solid fa-arrow-left"></i> Басты бетке
          </button>
        </div>

        <div className={`profile-content ${visible ? 'visible' : ''}`}>
          
          {/* 1. БАС БӨЛІК */}
          <div className="profile-header">
            <div className="avatar-circle">
              {userData.full_name ? userData.full_name.charAt(0) : '🧑‍🎓'}
            </div>
            <div>
              <h1 className="user-name">{userData.full_name || "Жаңа оқушы"}</h1>
              <div className="user-email-badge"><i className="fa-regular fa-envelope"></i> {userEmail}</div>
            </div>
            <div className="total-points">
              <div className="points-val">{userData.score}</div>
              <div className="points-label">Жалпы ұпай <i className="fa-solid fa-star" style={{color: '#EAB308'}}></i></div>
            </div>
          </div>

          {/* 2. СТАТИСТИКА */}
          <div className="stats-grid">
            <div className="stat-card">
              <i className="fa-solid fa-book-open stat-icon"></i>
              <div className="stat-num">{userData.completed_lessons}</div>
              <div className="stat-label">Өтілген сабақ</div>
            </div>
            <div className="stat-card">
              <i className="fa-solid fa-map-location-dot stat-icon"></i>
              <div className="stat-num" style={{fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '34px'}}>
                {userData.city || 'Көрсетілмеген'}
              </div>
              <div className="stat-label">Аймақ / Мектеп</div>
            </div>
            <div className="stat-card">
              <i className="fa-solid fa-bullseye stat-icon"></i>
              <div className="stat-num">{userData.accuracy}%</div>
              <div className="stat-label">Дұрыс жауаптар</div>
            </div>
          </div>

          {/* 3. ЖЕТІСТІКТЕР (BADGES) */}
          <h2 className="section-title"><i className="fa-solid fa-medal" style={{color: '#EAB308'}}></i> Менің жетістіктерім</h2>
          <div className="achievements-grid">
            {achievements.map((badge) => (
              <div key={badge.id} className="badge-card">
                <div className="badge-icon" style={{background: badge.color}}>
                  <i className={badge.icon}></i>
                </div>
                <div>
                  <div className="badge-title">{badge.title}</div>
                  <div className="badge-desc">{badge.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* 4. ТӨМЕНГІ БӨЛІК: ТАРИХ ЖӘНЕ ФОРМАЛАР */}
          <div className="bottom-grid">
            
            {/* СОЛ ЖАҚ: ТАРИХ */}
            <div className="box-card">
              <h3 className="box-title"><i className="fa-solid fa-clock-rotate-left" style={{color: '#3b82f6'}}></i> Менің белсенділігім</h3>
              
              {userData.history.length > 0 ? (
                <div className="history-list">
                  {userData.history.map((item, index) => (
                    <div key={index} className="history-item">
                      <div className="h-icon" style={{ background: item.type === 'game' ? '#8b5cf6' : '#3b82f6' }}>
                        <i className={`fa-solid ${item.type === 'game' ? 'fa-gamepad' : 'fa-book'}`}></i>
                      </div>
                      <div className="h-details">
                        <div className="h-title">{item.title}</div>
                        <div className="h-date">{item.date}</div>
                      </div>
                      <div className="h-points">+{item.points}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{textAlign: 'center', padding: '40px 20px', color: 'rgba(16,43,69,0.4)'}}>
                  <i className="fa-solid fa-folder-open" style={{fontSize: '40px', marginBottom: '15px', opacity: 0.5}}></i>
                  <p style={{fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px'}}>Әзірге тарих бос</p>
                  <p style={{fontSize: '12px', marginTop: '5px'}}>Сабақтарды оқып немесе ойын ойнап ұпай жинаңыз.</p>
                </div>
              )}
            </div>

            {/* ОҢ ЖАҚ: ФОРМАЛАР */}
            <div>
              {/* Профиль сақтау */}
              <div className="box-card" style={{marginBottom: '30px'}}>
                <h3 className="box-title"><i className="fa-solid fa-user-pen" style={{color: '#EAB308'}}></i> Мәліметтерді жаңарту</h3>
                <form onSubmit={handleSaveProfile}>
                  <div className="form-group">
                    <label className="form-label">Аты-жөніңіз</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={userData.full_name} 
                      onChange={e => setUserData({...userData, full_name: e.target.value})} 
                      placeholder="Мысалы: Асан Үсенов" 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Қала немесе Мектеп</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={userData.city} 
                      onChange={e => setUserData({...userData, city: e.target.value})} 
                      placeholder="Мысалы: Ақтау қаласы, №1 мектеп" 
                    />
                  </div>
                  <button type="submit" className="btn-submit">Мәліметтерді сақтау</button>
                </form>
              </div>

              {/* Құпия сөзді өзгерту */}
              <div className="box-card">
                <h3 className="box-title"><i className="fa-solid fa-shield-halved" style={{color: '#ef4444'}}></i> Қауіпсіздік</h3>
                <form onSubmit={handleChangePassword}>
                  <div className="form-group">
                    <label className="form-label">Ескі құпия сөз</label>
                    <input 
                      type="password" 
                      required 
                      className="form-input" 
                      value={passData.old_password} 
                      onChange={e => setPassData({...passData, old_password: e.target.value})} 
                      placeholder="••••••" 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Жаңа құпия сөз</label>
                    <input 
                      type="password" 
                      required 
                      className="form-input" 
                      value={passData.new_password} 
                      onChange={e => setPassData({...passData, new_password: e.target.value})} 
                      placeholder="Жаңасын жазыңыз" 
                    />
                  </div>
                  <button type="submit" className="btn-submit btn-danger">Құпия сөзді жаңарту</button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GroupWork = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [inRoom, setInRoom] = useState(false);
  const [roomCode, setRoomCode] = useState('');

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const handleJoinRoom = () => {
    if (roomCode.trim().length > 3) {
      setInRoom(true);
    } else {
      alert('Бөлме кодын дұрыс енгізіңіз!');
    }
  };

  const handleCreateRoom = () => {
    setRoomCode(Math.random().toString(36).substring(2, 8).toUpperCase());
    setInRoom(true);
  };

  return (
    <>
      <style>{`
        .group-container {
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

        .auth-box {
          max-width: 500px;
          margin: 0 auto;
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(16,43,69,0.08);
          text-align: center;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s;
        }
        .auth-box.visible { opacity: 1; transform: translateY(0); }

        .box-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 30px;
        }

        .input-code {
          width: 100%;
          padding: 15px 20px;
          border: 2px solid rgba(16,43,69,0.1);
          border-radius: 10px;
          font-size: 16px;
          margin-bottom: 20px;
          outline: none;
          text-align: center;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .input-code:focus { border-color: #EAB308; }

        .btn-join, .btn-create {
          width: 100%;
          padding: 15px;
          border-radius: 10px;
          font-family: 'Montserrat', sans-serif;
          font-size: 14px;
          font-weight: 800;
          text-transform: uppercase;
          cursor: pointer;
          border: none;
          transition: all 0.3s;
        }
        .btn-join {
          background: #102B45;
          color: white;
          margin-bottom: 15px;
        }
        .btn-join:hover { background: #163752; }
        
        .btn-create {
          background: #EAB308;
          color: #102B45;
        }
        .btn-create:hover { background: #FBBF24; }

        .divider {
          margin: 20px 0;
          font-size: 12px;
          color: rgba(16,43,69,0.4);
          display: flex;
          align-items: center;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(16,43,69,0.1);
          margin: 0 10px;
        }

        /* ROOM ACTIVE STATE */
        .room-active {
          max-width: 1000px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
        }
        .workspace {
          background: white;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 5px 20px rgba(16,43,69,0.05);
          min-height: 500px;
        }
        .chat-sidebar {
          background: #102B45;
          color: white;
          border-radius: 20px;
          padding: 30px;
          display: flex;
          flex-direction: column;
        }
        .room-badge {
          background: rgba(234,179,8,0.2);
          color: #EAB308;
          padding: 5px 15px;
          border-radius: 5px;
          font-weight: 700;
          letter-spacing: 2px;
        }
      `}</style>

      <div className="group-container">
        <div className="header-top">
          <button onClick={() => inRoom ? setInRoom(false) : navigate('/')} className="btn-back">
            <i className="fa-solid fa-arrow-left"></i> {inRoom ? 'Бөлмеден шығу' : 'Артқа қайту'}
          </button>
        </div>

        {!inRoom ? (
          <div className={`auth-box ${visible ? 'visible' : ''}`}>
            <h2 className="box-title">ТОПТЫҚ ЖҰМЫСҚА ҚОСЫЛУ</h2>
            <input 
              type="text" 
              className="input-code" 
              placeholder="Бөлме кодын енгізіңіз..." 
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            />
            <button className="btn-join" onClick={handleJoinRoom}>Қосылу</button>
            <div className="divider">немесе</div>
            <button className="btn-create" onClick={handleCreateRoom}>Жаңа бөлме құру</button>
          </div>
        ) : (
          <div className="room-active">
            <div className="workspace">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
                <h3 style={{fontFamily: 'Montserrat', fontWeight: 800}}>Ортақ тақта</h3>
                <span className="room-badge">БӨЛМЕ: {roomCode}</span>
              </div>
              <p style={{color: 'rgba(16,43,69,0.6)'}}>Бұл жерде оқушылар ортақ грамматикалық тапсырмаларды орындайды. (Мысалы, сөйлемге морфологиялық талдау жасау).</p>
              
              <div style={{marginTop: '40px', padding: '20px', border: '2px dashed rgba(16,43,69,0.2)', borderRadius: '10px', textAlign: 'center'}}>
                <i>Мұғалімнің тапсырмасы күтілуде...</i>
              </div>
            </div>

            <div className="chat-sidebar">
              <h4 style={{fontFamily: 'Montserrat', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '20px'}}>
                <i className="fa-solid fa-users"></i> Қатысушылар (3)
              </h4>
              <div style={{flex: 1, overflowY: 'auto'}}>
                <div style={{background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px', marginBottom: '10px', fontSize: '14px'}}>
                  <strong style={{color: '#EAB308'}}>Алихан:</strong> Сәлем бәріне! Тапсырманы кім бастайды?
                </div>
                <div style={{background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px', marginBottom: '10px', fontSize: '14px'}}>
                  <strong style={{color: '#EAB308'}}>Аружан:</strong> Мен бірінші сөйлемді талдаймын.
                </div>
              </div>
              <div style={{display: 'flex', marginTop: '20px'}}>
                <input type="text" placeholder="Хабарлама..." style={{flex: 1, padding: '10px', borderRadius: '5px 0 0 5px', border: 'none', outline: 'none'}} />
                <button style={{background: '#EAB308', border: 'none', padding: '0 15px', borderRadius: '0 5px 5px 0', cursor: 'pointer'}}>
                  <i className="fa-solid fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default GroupWork;
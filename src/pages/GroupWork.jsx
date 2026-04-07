import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const GroupWork = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [inRoom, setInRoom] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  
  // Пайдаланушы мәліметтері
  const userEmail = localStorage.getItem('userEmail') || 'Белгісіз оқушы';
  const userName = userEmail.split('@')[0]; // Уақытша атын поштадан аламыз

  // WebSocket және нақты уақыт күйлері
  const [ws, setWs] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [boardText, setBoardText] = useState('Бұл ортақ тақта. Осы жерге жазған мәтін барлық оқушыларға бірден көрінеді...\n\nТапсырма: Төмендегі сөйлемге синтаксистік талдау жасаңыздар:\n"Жақсының аты өлмейді, ғалымның хаты өлмейді."');
  const chatEndRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  // Бөлмеге кіргенде WebSocket қосу
  useEffect(() => {
    if (inRoom && roomCode) {
      // НАЗАР АУДАРЫҢЫЗ: СІЛТЕМЕ wss:// БОЛЫП ӨЗГЕРДІ 👇
      const socket = new WebSocket(`wss://tilim-sqx4.onrender.com/api/ws/room/${roomCode}?user=${userName}`);

      socket.onopen = () => {
        console.log('Бөлмеге қосылдық:', roomCode);
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'chat') {
          setMessages((prev) => [...prev, data]);
        } else if (data.type === 'board') {
          setBoardText(data.content);
        } else if (data.type === 'system') {
          setMessages((prev) => [...prev, { sender: 'Жүйе', content: data.content, isSystem: true }]);
        }
      };

      socket.onclose = () => console.log('Бөлмеден шықтық');
      setWs(socket);

      return () => socket.close(); // Компонент жабылғанда байланысты үзу
    }
  }, [inRoom, roomCode, userName]);

  // Чатты әрқашан ең төменгі жаңа хатқа түсіру
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleJoinRoom = () => {
    if (roomCode.trim().length > 3) setInRoom(true);
    else alert('Бөлме кодын дұрыс енгізіңіз!');
  };

  const handleCreateRoom = () => {
    setRoomCode(Math.random().toString(36).substring(2, 8).toUpperCase());
    setInRoom(true);
  };

  // Чатқа хат жіберу
  const sendMessage = (e) => {
    e.preventDefault();
    if (chatInput.trim() && ws) {
      const msg = { type: 'chat', sender: userName, content: chatInput };
      ws.send(JSON.stringify(msg));
      setChatInput('');
    }
  };

  // Ортақ тақтаға мәтін жазғанда (барлығына жіберу)
  const handleBoardChange = (e) => {
    const newText = e.target.value;
    setBoardText(newText); // Өзімізге көрсетеміз
    if (ws) {
      ws.send(JSON.stringify({ type: 'board', content: newText })); // Басқаларға жібереміз
    }
  };

  return (
    <>
      <style>{`
        .group-container { min-height: 100vh; background: #F8F9FA; font-family: 'Inter', sans-serif; color: #102B45; padding: 40px 20px; }
        .header-top { max-width: 1200px; margin: 0 auto 40px; display: flex; align-items: center; justify-content: space-between; }
        .btn-back { background: none; border: none; color: #102B45; font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: color 0.3s; }
        .btn-back:hover { color: #EAB308; }

        .auth-box { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 40px rgba(16,43,69,0.08); text-align: center; opacity: 0; transform: translateY(20px); transition: all 0.6s; }
        .auth-box.visible { opacity: 1; transform: translateY(0); }
        .box-title { font-family: 'Montserrat', sans-serif; font-size: 24px; font-weight: 800; margin-bottom: 30px; }
        .input-code { width: 100%; padding: 15px 20px; border: 2px solid rgba(16,43,69,0.1); border-radius: 10px; font-size: 16px; margin-bottom: 20px; outline: none; text-align: center; letter-spacing: 2px; text-transform: uppercase; font-weight: bold;}
        .input-code:focus { border-color: #EAB308; }

        .btn-join, .btn-create { width: 100%; padding: 15px; border-radius: 10px; font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 800; text-transform: uppercase; cursor: pointer; border: none; transition: all 0.3s; }
        .btn-join { background: #102B45; color: white; margin-bottom: 15px; }
        .btn-join:hover { background: #163752; }
        .btn-create { background: #EAB308; color: #102B45; }
        .btn-create:hover { background: #FBBF24; }

        /* ROOM ACTIVE STATE */
        .room-active { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr; gap: 20px; height: 75vh;}
        
        .workspace { background: white; border-radius: 20px; padding: 30px; box-shadow: 0 5px 20px rgba(16,43,69,0.05); display: flex; flex-direction: column;}
        .board-textarea { flex: 1; width: 100%; border: 2px dashed rgba(16,43,69,0.2); border-radius: 10px; padding: 20px; font-family: 'Inter', sans-serif; font-size: 16px; color: #102B45; resize: none; outline: none; transition: border-color 0.3s; line-height: 1.6;}
        .board-textarea:focus { border-color: #EAB308; }

        .chat-sidebar { background: #102B45; color: white; border-radius: 20px; padding: 20px; display: flex; flex-direction: column; box-shadow: 0 5px 20px rgba(16,43,69,0.1);}
        .room-badge { background: rgba(234,179,8,0.2); color: #EAB308; padding: 5px 15px; border-radius: 5px; font-weight: 700; letter-spacing: 2px; }
        
        .msg-container { margin-bottom: 15px; }
        .msg-sender { font-size: 11px; color: rgba(255,255,255,0.5); margin-bottom: 3px; font-weight: bold;}
        .msg-bubble { background: rgba(255,255,255,0.1); padding: 10px 15px; border-radius: 12px; font-size: 14px; display: inline-block; word-break: break-word;}
        .msg-bubble.system { background: transparent; color: #EAB308; font-style: italic; font-size: 12px; text-align: center; display: block;}
        .msg-bubble.me { background: #EAB308; color: #102B45; font-weight: 600;}
        
        .chat-input-form { display: flex; margin-top: 15px; background: rgba(255,255,255,0.05); border-radius: 10px; padding: 5px;}
        .chat-input { flex: 1; background: transparent; border: none; padding: 10px; color: white; outline: none; font-size: 14px;}
        .chat-btn { background: #EAB308; border: none; width: 40px; border-radius: 8px; color: #102B45; cursor: pointer; transition: background 0.2s;}
        .chat-btn:hover { background: #FBBF24; }

        @media (max-width: 900px) { .room-active { grid-template-columns: 1fr; height: auto; } .workspace { height: 500px; } .chat-sidebar { height: 400px; } }
      `}</style>

      <div className="group-container">
        <div className="header-top">
          <button onClick={() => { if(ws) ws.close(); inRoom ? setInRoom(false) : navigate('/'); }} className="btn-back">
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
            {/* ОРТАҚ ТАҚТА */}
            <div className="workspace">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <h3 style={{fontFamily: 'Montserrat', fontWeight: 800}}>Ортақ тақта</h3>
                <span className="room-badge">БӨЛМЕ: {roomCode}</span>
              </div>
              <textarea 
                className="board-textarea"
                value={boardText}
                onChange={handleBoardChange}
                placeholder="Осы жерге жазыңыз. Өзгерістер басқаларға бірден көрінеді..."
              />
            </div>

            {/* ЧАТ */}
            <div className="chat-sidebar">
              <h4 style={{fontFamily: 'Montserrat', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '15px'}}>
                <i className="fa-solid fa-comments"></i> Бөлме чаты
              </h4>
              
              <div style={{flex: 1, overflowY: 'auto', paddingRight: '5px'}}>
                {messages.map((msg, index) => (
                  <div key={index} className={`msg-container ${msg.sender === userName ? 'text-right' : ''}`}>
                    {!msg.isSystem && msg.sender !== userName && <div className="msg-sender">{msg.sender}</div>}
                    <div className={`msg-bubble ${msg.isSystem ? 'system' : msg.sender === userName ? 'me' : ''}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={sendMessage} className="chat-input-form">
                <input 
                  type="text" 
                  className="chat-input"
                  placeholder="Хабарлама..." 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button type="submit" className="chat-btn">
                  <i className="fa-solid fa-paper-plane"></i>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default GroupWork;
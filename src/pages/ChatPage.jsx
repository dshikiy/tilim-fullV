import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ChatPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Сәлеметсіз бе! Мен TILIM платформасының жасанды интеллектісімін. Қазақ тілі грамматикасы, ережелері немесе кез келген тақырып бойынша сұрақтарыңыз болса, қуана жауап беремін!' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Жаңа хат келгенде экранды автоматты түрде төменге айналдыру
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Хат жіберу функциясы
  const handleSend = async (e, textOverride = null) => {
    if (e) e.preventDefault();
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text: textToSend }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('http://localhost:8080/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend })
      });
      const data = await res.json();
      
      setTimeout(() => {
        setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
        setIsTyping(false);
      }, 800);
      
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: "Кешіріңіз, сервермен байланыс үзілді ⚠️" }]);
      setIsTyping(false);
    }
  };

  // Дайын сұрақтар (Оқушыға көмек)
  const suggestedPrompts = [
    "Үндестік заңы дегеніміз не?",
    "Сингармонизмге 3 мысал келтірші",
    "Құрмалас сөйлемнің түрлерін түсіндір",
    "Маған фонетикадан тест сұрағын қойшы"
  ];

  return (
    <div className="min-h-screen flex bg-[#F8F9FB] font-['Inter'] text-[#102B45]">
      
      <style>{`
        .chat-container { display: flex; height: 100vh; width: 100%; }
        
        /* СОЛ ЖАҚ: СИПАТТАМА ЖӘНЕ НАВИГАЦИЯ */
        .sidebar-chat { width: 320px; background: #102B45; color: white; display: flex; flex-direction: column; padding: 30px; }
        .sidebar-brand { display: flex; align-items: center; gap: 12px; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .sidebar-brand img { height: 32px; filter: brightness(0) invert(1); }
        
        .ai-hero { text-align: center; margin-bottom: 40px; }
        .ai-icon { width: 80px; height: 80px; background: #EAB308; border-radius: 24px; display: flex; align-items: center; justify-content: center; font-size: 36px; color: #102B45; margin: 0 auto 20px; box-shadow: 0 10px 25px rgba(234,179,8,0.2); }
        .ai-title { font-family: 'Montserrat', sans-serif; font-size: 24px; font-weight: 900; margin-bottom: 8px; }
        .ai-subtitle { font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.5; }
        
        .suggestions-title { font-size: 10px; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; color: #EAB308; margin-bottom: 16px; }
        .prompt-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); width: 100%; text-align: left; padding: 12px 16px; border-radius: 12px; color: rgba(255,255,255,0.8); font-size: 13px; font-weight: 500; margin-bottom: 10px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 10px; }
        .prompt-btn i { color: #EAB308; font-size: 14px; }
        .prompt-btn:hover { background: rgba(255,255,255,0.1); color: white; border-color: rgba(255,255,255,0.2); transform: translateX(5px); }
        
        .sidebar-bottom { margin-top: auto; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }
        .back-btn { display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.6); text-decoration: none; font-size: 13px; font-weight: 600; transition: color 0.2s; }
        .back-btn:hover { color: white; }

        /* ОҢ ЖАҚ: НЕГІЗГІ ЧАТ */
        .chat-main { flex: 1; display: flex; flex-direction: column; background: white; position: relative; }
        .chat-header { padding: 20px 40px; border-bottom: 1px solid #F1F5F9; display: flex; justify-content: space-between; align-items: center; background: white; z-index: 10; }
        .chat-header-status { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; color: #10B981; background: #ECFDF5; padding: 6px 16px; border-radius: 20px; letter-spacing: 0.1em; text-transform: uppercase; }
        
        .messages-area { flex: 1; padding: 40px; overflow-y: auto; display: flex; flex-direction: column; gap: 24px; background: #F8FAFC; }
        .msg-wrapper { display: flex; gap: 16px; max-width: 80%; }
        .msg-wrapper.user { align-self: flex-end; flex-direction: row-reverse; }
        .msg-wrapper.ai { align-self: flex-start; }
        
        .avatar { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
        .avatar.ai { background: #EAB308; color: #102B45; }
        .avatar.user { background: #102B45; color: white; }
        
        .msg-bubble { padding: 16px 20px; font-size: 15px; line-height: 1.6; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
        .msg-wrapper.user .msg-bubble { background: #102B45; color: white; border-top-right-radius: 4px; }
        .msg-wrapper.ai .msg-bubble { background: white; color: #334155; border: 1px solid #E2E8F0; border-top-left-radius: 4px; }
        
        .typing-dots { display: flex; gap: 6px; padding: 20px; background: white; border-radius: 20px; border-top-left-radius: 4px; border: 1px solid #E2E8F0; width: max-content; }
        .dot { width: 8px; height: 8px; background: #CBD5E1; border-radius: 50%; animation: blink 1.4s infinite ease-in-out both; }
        .dot:nth-child(1) { animation-delay: -0.32s; }
        .dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes blink { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }

        /* ИНПУТ АЙМАҒЫ */
        .input-area { padding: 30px 40px; background: white; border-top: 1px solid #F1F5F9; }
        .input-form { display: flex; gap: 16px; max-width: 1000px; margin: 0 auto; position: relative; }
        .main-input { flex: 1; background: #F8FAFC; border: 1.5px solid #E2E8F0; padding: 20px 24px; border-radius: 20px; font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 500; color: #102B45; outline: none; transition: all 0.2s; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); }
        .main-input:focus { border-color: #EAB308; background: white; box-shadow: 0 0 0 4px rgba(234,179,8,0.1); }
        .main-input::placeholder { color: #94A3B8; }
        
        .send-btn { background: #EAB308; color: #102B45; border: none; width: 64px; height: 64px; border-radius: 20px; font-size: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; box-shadow: 0 8px 20px rgba(234,179,8,0.3); }
        .send-btn:hover { background: #FBBF24; transform: translateY(-2px); box-shadow: 0 12px 25px rgba(234,179,8,0.4); }
        .send-btn:disabled { background: #E2E8F0; color: #94A3B8; cursor: not-allowed; transform: none; box-shadow: none; }
      `}</style>

      <div className="chat-container">
        
        {/* СОЛ ЖАҚ ПАНЕЛЬ */}
        <aside className="sidebar-chat">
          <div className="sidebar-brand">
            <img src="/logo.png" alt="TILIM" />
          </div>
          
          <div className="ai-hero">
            <div className="ai-icon"><i className="fa-solid fa-robot"></i></div>
            <h1 className="ai-title">TILIM AI</h1>
            <p className="ai-subtitle">Қазақ тілін үйренуге арналған жеке виртуалды ұстазыңыз.</p>
          </div>

          <div className="suggestions">
            <h3 className="suggestions-title">Сұрап көріңіз:</h3>
            {suggestedPrompts.map((prompt, idx) => (
              <button key={idx} className="prompt-btn" onClick={() => handleSend(null, prompt)} disabled={isTyping}>
                <i className="fa-solid fa-sparkles"></i> {prompt}
              </button>
            ))}
          </div>

          <div className="sidebar-bottom">
            <Link to="/" className="back-btn"><i className="fa-solid fa-arrow-left"></i> Басты бетке оралу</Link>
          </div>
        </aside>

        {/* ОҢ ЖАҚ НЕГІЗГІ ЧАТ */}
        <main className="chat-main">
          <div className="chat-header">
            <div className="text-xl font-black uppercase text-[#102B45] tracking-widest">Виртуалды ұстаз</div>
            <div className="chat-header-status"><i className="fa-solid fa-circle text-[8px]"></i> Онлайн</div>
          </div>

          <div className="messages-area">
            {messages.map((m, i) => (
              <div key={i} className={`msg-wrapper ${m.sender}`}>
                <div className={`avatar ${m.sender}`}>
                  <i className={`fa-solid ${m.sender === 'ai' ? 'fa-robot' : 'fa-user'}`}></i>
                </div>
                <div className="msg-bubble">{m.text}</div>
              </div>
            ))}
            
            {isTyping && (
              <div className="msg-wrapper ai">
                <div className="avatar ai"><i className="fa-solid fa-robot"></i></div>
                <div className="typing-dots">
                  <div className="dot"></div><div className="dot"></div><div className="dot"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-area">
            <form className="input-form" onSubmit={e => handleSend(e)}>
              <input 
                type="text" 
                className="main-input" 
                placeholder="Сұрағыңызды осында жазыңыз..." 
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={isTyping}
                autoFocus
              />
              <button type="submit" className="send-btn" disabled={!input.trim() || isTyping}>
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatPage;
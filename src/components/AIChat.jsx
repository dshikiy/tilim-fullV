import React, { useState, useRef, useEffect } from 'react';

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Сәлем! Мен TILIM-нің Ақылды көмекшісімін. Қандай ережені түсінбей қалдыңыз?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Жаңа хат келгенде төменге түсіру
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setIsTyping(true);

    try {
      // МІНЕ, ОСЫ ЖЕРДЕГІ СІЛТЕМЕ ЖАҢА РЕНДЕР БЭКЕНДІНЕ АУЫСТЫРЫЛДЫ 👇
      const res = await fetch('https://tilim-sqx4.onrender.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });
      const data = await res.json();
      
      // ИИ ойланып жатқандай әсер беру үшін 1 секунд күттіреміз
      setTimeout(() => {
        setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
        setIsTyping(false);
      }, 1000);
      
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: "Кешіріңіз, менің миым (сервер) ұйықтап қалды 😴" }]);
      setIsTyping(false);
    }
  };

  return (
    <>
      <style>{`
        .chat-widget {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 1000;
          font-family: 'Inter', sans-serif;
        }
        .chat-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #102B45, #163752);
          border: 3px solid #EAB308;
          color: #EAB308;
          font-size: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 10px 25px rgba(16,43,69,0.3);
          transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .chat-btn:hover { transform: scale(1.1); }
        
        .chat-window {
          position: absolute;
          bottom: 80px;
          right: 0;
          width: 350px;
          height: 500px;
          background: white;
          border-radius: 24px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid rgba(16,43,69,0.1);
          transform-origin: bottom right;
          animation: scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }

        .chat-header {
          background: #102B45;
          padding: 20px;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 4px solid #EAB308;
        }
        .chat-header-info { display: flex; align-items: center; gap: 12px; }
        .ai-avatar {
          width: 40px;
          height: 40px;
          background: #EAB308;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #102B45;
          font-size: 20px;
        }
        .chat-title { font-family: 'Montserrat', sans-serif; font-size: 15px; font-weight: 900; line-height: 1.2;}
        .chat-status { font-size: 10px; color: #6ee7b7; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
        .close-btn { background: none; border: none; color: rgba(255,255,255,0.5); cursor: pointer; font-size: 20px; transition: color 0.2s; }
        .close-btn:hover { color: white; }

        .chat-body {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          background: #F8FAFC;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .msg-bubble { max-width: 80%; padding: 12px 16px; font-size: 13px; line-height: 1.5; border-radius: 16px; }
        .msg-ai { background: white; color: #102B45; border: 1px solid rgba(16,43,69,0.05); border-bottom-left-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.02); align-self: flex-start; }
        .msg-user { background: #102B45; color: white; border-bottom-right-radius: 4px; align-self: flex-end; }
        
        .typing-indicator { display: flex; gap: 4px; padding: 16px 20px; background: white; width: max-content; border-radius: 16px; border-bottom-left-radius: 4px; align-self: flex-start; }
        .dot { width: 6px; height: 6px; background: #94A3B8; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; }
        .dot:nth-child(1) { animation-delay: -0.32s; }
        .dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }

        .chat-footer { padding: 16px; background: white; border-top: 1px solid rgba(16,43,69,0.05); }
        .chat-form { display: flex; gap: 10px; }
        .chat-input { flex: 1; background: #F1F5F9; border: none; padding: 12px 16px; border-radius: 12px; font-family: 'Inter', sans-serif; font-size: 13px; outline: none; transition: box-shadow 0.2s; }
        .chat-input:focus { box-shadow: 0 0 0 2px rgba(234,179,8,0.3); }
        .chat-send { background: #EAB308; color: #102B45; border: none; width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 16px; cursor: pointer; transition: all 0.2s; }
        .chat-send:hover { background: #FBBF24; transform: translateY(-2px); }
        .chat-send:disabled { background: #E2E8F0; color: #94A3B8; cursor: not-allowed; transform: none; }
      `}</style>

      <div className="chat-widget">
        {!isOpen && (
          <button className="chat-btn" onClick={() => setIsOpen(true)}>
            <i className="fa-solid fa-robot"></i>
          </button>
        )}

        {isOpen && (
          <div className="chat-window">
            <div className="chat-header">
              <div className="chat-header-info">
                <div className="ai-avatar"><i className="fa-solid fa-bolt"></i></div>
                <div>
                  <div className="chat-title">TILIM AI</div>
                  <div className="chat-status">● ОНЛАЙН</div>
                </div>
              </div>
              <button className="close-btn" onClick={() => setIsOpen(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>

            <div className="chat-body">
              {messages.map((m, i) => (
                <div key={i} className={`msg-bubble ${m.sender === 'ai' ? 'msg-ai' : 'msg-user'}`}>
                  {m.text}
                </div>
              ))}
              {isTyping && (
                <div className="typing-indicator">
                  <div className="dot"></div><div className="dot"></div><div className="dot"></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-footer">
              <form className="chat-form" onSubmit={handleSend}>
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Сұрағыңызды жазыңыз..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={isTyping}
                />
                <button type="submit" className="chat-send" disabled={!input.trim() || isTyping}>
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

export default AIChat;
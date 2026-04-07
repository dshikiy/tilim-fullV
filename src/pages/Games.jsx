import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
 
// ════════════════════════════════════════════════
// ҮЛКЕН СҰРАҚТАР БАЗАСЫ (Стандартты ойындар)
// ════════════════════════════════════════════════
const allGamesData = {
  1: [
    { question: "«Мектеп» сөзінде неше дыбыс бар?", options: ["5", "6", "7", "4"], answer: "6" },
    { question: "Қандай дыбыс тек қазақ тілінде ғана бар?", options: ["А", "Ң", "О", "Е"], answer: "Ң" },
    { question: "«Ауыл» сөзінде неше буын бар?", options: ["1", "2", "3", "4"], answer: "2" },
    { question: "Ашық буынға мысал:", options: ["Мал", "Қыз", "Ба-ла", "Үй"], answer: "Ба-ла" },
    { question: "«Балалар» сөзінде екпін қай буынға түседі?", options: ["1-ші", "2-ші", "3-ші", "4-ші"], answer: "3-ші" },
  ],
  2: [
    { clue: "Заттың атын білдіретін сөз табы", answer: "ЗАТЕСІМ" },
    { clue: "Іс-әрекет пен қимылды білдіретін сөз табы", answer: "ЕТІСТІК" },
    { clue: "Сын есімнің негізгі сұрағы", answer: "ҚАНДАЙ" },
    { clue: "Заттың санын, ретін білдіретін сөз табы", answer: "САНЕСІМ" },
  ],
  3: [
    { word: "Қызыл", boxes: ["Зат есім", "Сын есім", "Етістік", "Сан есім"], correctBox: "Сын есім" },
    { word: "Жүгірді", boxes: ["Зат есім", "Сын есім", "Етістік", "Үстеу"], correctBox: "Етістік" },
    { word: "Кітап", boxes: ["Зат есім", "Сын есім", "Етістік", "Сан есім"], correctBox: "Зат есім" },
    { word: "Отыз", boxes: ["Зат есім", "Сын есім", "Сан есім", "Есімдік"], correctBox: "Сан есім" },
  ],
  4: [
    { text: "Отан отбасынан ...", options: ["басталады", "аяқталады", "бөлінеді", "құралады"], answer: "басталады" },
    { text: "Өнер алды — қызыл ...", options: ["тіл", "білек", "ой", "еңбек"], answer: "тіл" },
    { text: "Еңбек түбі — ...", options: ["бейнет", "қуаныш", "байлық", "береке"], answer: "береке" },
    { text: "Көз қорқақ, қол ...", options: ["батыр", "батыл", "ақыл", "жүрек"], answer: "батыр" },
  ],
};
 
const Games = () => {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail');
  const userRole = localStorage.getItem('userRole'); // 'admin' немесе 'student'
  const userName = userEmail ? userEmail.split('@')[0] : 'Қонақ';

  const [mode, setMode] = useState('home'); 
  const [activeGame, setActiveGame] = useState(null);
  const [questionPool, setQuestionPool] = useState(allGamesData);
 
  // Play state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState(null); 
  const [selectedOption, setSelectedOption] = useState(null);
 
  // Builder state
  const [builderGameType, setBuilderGameType] = useState(1);
  const [builderStep, setBuilderStep] = useState('type'); 
  const [customQuestions, setCustomQuestions] = useState([]);
  const [form, setForm] = useState({});
  const [createdGames, setCreatedGames] = useState([]);
  const [isPublic, setIsPublic] = useState(false); // Админге арналған
 
  // ─── ДЕРЕКҚОРДАН ОЙЫНДАРДЫ ТАРТУ ────────────────────────
  const fetchCustomGames = async () => {
    if (!userEmail) return;
    try {
      const res = await fetch(`https://tilim-sqx4.onrender.com/api/custom-games?email=${userEmail}`);
      const data = await res.json();
      if (!data.error) {
        setCreatedGames(data);
      }
    } catch (err) {
      console.error("Ойындарды тартуда қате:", err);
    }
  };

  useEffect(() => {
    fetchCustomGames();
  }, [userEmail]);

  // Timer
  useEffect(() => {
    let t;
    if (mode === 'play' && activeGame === 1 && !showResult && !feedback) {
      if (timeLeft > 0) {
        t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
      } else {
        handleAnswer(null, null, true);
      }
    }
    return () => clearTimeout(t);
  }, [timeLeft, mode, activeGame, showResult, feedback]);
 
  const gamesList = [
    { id: 1, title: 'Кім жылдам?', desc: 'Тест — 10 секунд ішінде жауап бер', icon: '⚡', color: '#EAB308' },
    { id: 2, title: 'Жасырын сөз', desc: 'Анықтамадан сөзді тап', icon: '🔑', color: '#10b981' },
    { id: 3, title: 'Сиқырлы сандық', desc: 'Сөздерді сөз табына бөл', icon: '🧲', color: '#6366f1' },
    { id: 4, title: 'Мақалды тап', desc: 'Бос орынды дұрыс сөзбен толтыр', icon: '📜', color: '#f97316' },
  ];
 
  const handlePlay = (gameId) => {
    setActiveGame(gameId);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setTimeLeft(10);
    setInputValue('');
    setFeedback(null);
    setSelectedOption(null);
    setMode('play');
  };
 
  const saveResultToDatabase = async (finalScore) => {
    if (!userEmail || !activeGame) return;
    const earnedPoints = finalScore * 10;
    let accuracyPercent = 0;
    if (questionPool[activeGame] && questionPool[activeGame].length > 0) {
      accuracyPercent = Math.round((finalScore / questionPool[activeGame].length) * 100);
    }

    try {
      await fetch('https://tilim-sqx4.onrender.com/api/add-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          score: earnedPoints, 
          title: "Интерактивті ойын", 
          type: "game", 
          is_completed: true,
          accuracy: accuracyPercent
        })
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleAnswer = (selected, correct, timeout = false) => {
    if (feedback) return;
    const isCorrect = !timeout && selected === correct;
    setSelectedOption(selected);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) setScore(s => s + 1);
 
    setTimeout(async () => {
      const data = questionPool[activeGame];
      const next = currentQuestion + 1;
      if (next < data.length) {
        setCurrentQuestion(next);
        setTimeLeft(10);
        setInputValue('');
        setFeedback(null);
        setSelectedOption(null);
      } else {
        setShowResult(true);
        await saveResultToDatabase(score + (isCorrect ? 1 : 0));
      }
    }, 900);
  };
 
  const handleGame2 = (e) => {
    e.preventDefault();
    const correct = questionPool[activeGame][currentQuestion].answer;
    handleAnswer(inputValue.trim().toUpperCase(), correct);
  };
 
  // ─── BUILDER HELPERS ────────────────────────────────
  const emptyForm = (type) => {
    if (type === 1) return { question: '', opt1: '', opt2: '', opt3: '', opt4: '', answer: '' };
    if (type === 2) return { clue: '', answer: '' };
    if (type === 3) return { word: '', box1: 'Зат есім', box2: 'Сын есім', box3: 'Етістік', box4: 'Сан есім', correctBox: '' };
    if (type === 4) return { text: '', opt1: '', opt2: '', opt3: '', opt4: '', answer: '' };
  };
 
  const formToQuestion = (f, type) => {
    if (type === 1) return { question: f.question, options: [f.opt1, f.opt2, f.opt3, f.opt4], answer: f.answer };
    if (type === 2) return { clue: f.clue, answer: f.answer.toUpperCase() };
    if (type === 3) return { word: f.word, boxes: [f.box1, f.box2, f.box3, f.box4], correctBox: f.correctBox };
    if (type === 4) return { text: f.text, options: [f.opt1, f.opt2, f.opt3, f.opt4], answer: f.answer };
  };
 
  const addQuestion = () => {
    const q = formToQuestion(form, builderGameType);
    setCustomQuestions(prev => [...prev, q]);
    setForm(emptyForm(builderGameType));
  };
 
  // ДЕРЕКҚОРҒА ОЙЫНДЫ САҚТАУ
  const saveGame = async () => {
    if (!userEmail) return alert("Жүйеге кіріңіз!");
    
    const gamePayload = {
      author_email: userEmail,
      author_name: userRole === 'admin' ? 'Мұғалім' : userName,
      type: builderGameType,
      title: gamesList[builderGameType - 1].title,
      questions: customQuestions,
      is_public: userRole === 'admin' ? isPublic : false
    };

    try {
      const res = await fetch('https://tilim-sqx4.onrender.com/api/custom-games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gamePayload)
      });
      if (res.ok) {
        alert("Ойын сәтті сақталды!");
        setCustomQuestions([]);
        setBuilderStep('type');
        setMode('home');
        fetchCustomGames(); // Тізімді жаңарту
      }
    } catch (err) {
      console.error(err);
      alert("Сақтау мүмкін болмады!");
    }
  };
 
  const playCustomGame = (game) => {
    // customGame ID-сін уақытша activeGame ретінде қолданамыз
    const poolId = `custom_${game.id}`;
    const pool = { ...questionPool, [poolId]: game.questions };
    setQuestionPool(pool);
    
    // UI үшін ойын түрін сақтаймыз (1,2,3,4)
    setActiveGame(poolId);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setTimeLeft(10);
    setInputValue('');
    setFeedback(null);
    setSelectedOption(null);
    setMode('play');
  };
 
  // ─── RENDER GAME CONTENT ─────────────────────────────
  const renderGame = () => {
    const data = questionPool[activeGame];
    if (!data || !data[currentQuestion]) return null;
    const d = data[currentQuestion];
    
    // custom_1, custom_2 деген ID-ден негізгі типті алу
    const actualType = String(activeGame).includes('custom') 
        ? createdGames.find(g => `custom_${g.id}` === activeGame)?.type 
        : activeGame;
 
    if (actualType === 1) {
      const pct = (timeLeft / 10) * 100;
      return (
        <div>
          <div className="timer-wrap">
            <div className="timer-track"><div className="timer-fill" style={{ width: `${pct}%`, background: timeLeft <= 3 ? '#ef4444' : '#EAB308' }} /></div>
            <span className="timer-num" style={{ color: timeLeft <= 3 ? '#ef4444' : '#102B45' }}>
              {String(timeLeft).padStart(2, '0')}s
            </span>
          </div>
          <p className="q-text">{d.question}</p>
          <div className="opts-grid">
            {d.options.map((opt, i) => (
              <button key={i}
                className={`opt-btn ${selectedOption === opt ? (opt === d.answer ? 'correct' : 'wrong') : feedback && opt === d.answer ? 'correct' : ''}`}
                onClick={() => handleAnswer(opt, d.answer)}
                disabled={!!feedback}
              >{opt}</button>
            ))}
          </div>
        </div>
      );
    }
    if (actualType === 2) {
      return (
        <div>
          <div className="clue-card">
            <span className="clue-icon">💡</span>
            <p className="q-text" style={{ fontSize: '20px' }}>{d.clue}</p>
          </div>
          <form onSubmit={handleGame2} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <input className={`word-input ${feedback === 'correct' ? 'inp-correct' : feedback === 'wrong' ? 'inp-wrong' : ''}`}
              value={inputValue} onChange={e => setInputValue(e.target.value.toUpperCase())}
              placeholder="ЖАУАПТЫ ЖАЗЫҢЫЗ..." autoFocus disabled={!!feedback} />
            <button type="submit" className="submit-btn" disabled={!!feedback}>
              Тексеру ✓
            </button>
          </form>
          {feedback && (
            <div className={`feedback-badge ${feedback}`}>
              {feedback === 'correct' ? `✅ Дұрыс! Жауап: ${d.answer}` : `❌ Қате! Дұрыс жауап: ${d.answer}`}
            </div>
          )}
        </div>
      );
    }
    if (actualType === 3) {
      return (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'rgba(16,43,69,0.4)', fontSize: '11px', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '12px' }}>Бұл қай сөз табы?</p>
          <div className="floating-word">{d.word}</div>
          <div className="boxes-row">
            {d.boxes.map((box, i) => (
              <button key={i}
                className={`box-btn ${selectedOption === box ? (box === d.correctBox ? 'correct' : 'wrong') : feedback && box === d.correctBox ? 'correct' : ''}`}
                onClick={() => handleAnswer(box, d.correctBox)}
                disabled={!!feedback}>
                <span className="box-icon-emoji">📦</span>
                <span>{box}</span>
              </button>
            ))}
          </div>
          {feedback && (
            <div className={`feedback-badge ${feedback}`}>
              {feedback === 'correct' ? `✅ Дұрыс!` : `❌ Дұрыс жауап: ${d.correctBox}`}
            </div>
          )}
        </div>
      );
    }
    if (actualType === 4) {
      const parts = d.text.split('...');
      return (
        <div>
          <div className="proverb-box">
            <span className="proverb-mark">«</span>
            <p className="proverb-text">
              {parts[0]}<span className="blank">___</span>{parts[1]}
            </p>
            <span className="proverb-mark">»</span>
          </div>
          <div className="pill-row">
            {d.options.map((opt, i) => (
              <button key={i}
                className={`pill-btn ${selectedOption === opt ? (opt === d.answer ? 'correct' : 'wrong') : feedback && opt === d.answer ? 'correct' : ''}`}
                onClick={() => handleAnswer(opt, d.answer)}
                disabled={!!feedback}>{opt}</button>
            ))}
          </div>
          {feedback && (
            <div className={`feedback-badge ${feedback}`}>
              {feedback === 'correct' ? `✅ Дұрыс!` : `❌ Дұрыс жауап: «${d.answer}»`}
            </div>
          )}
        </div>
      );
    }
  };
 
  // ─── BUILDER FORM ────────────────────────────────────
  const renderBuilderForm = () => {
    const labels = {
      1: [['question','Сұрақ мәтіні'],['opt1','Нұсқа 1'],['opt2','Нұсқа 2'],['opt3','Нұсқа 3'],['opt4','Нұсқа 4'],['answer','Дұрыс жауап (нұсқалардың бірі)']],
      2: [['clue','Кілт сөз / Анықтама'],['answer','Жасырын сөз (бас әрпімен)']],
      3: [['word','Сұрыпталатын сөз'],['box1','Санық 1'],['box2','Санық 2'],['box3','Санық 3'],['box4','Санық 4'],['correctBox','Дұрыс санық (дәл солай жаз)']],
      4: [['text','Мақал мәтіні (бос орын үшін ... қой)'],['opt1','Нұсқа 1'],['opt2','Нұсқа 2'],['opt3','Нұсқа 3'],['opt4','Нұсқа 4'],['answer','Дұрыс жауап']],
    };
    return (
      <div className="builder-form">
        <h3 className="bf-title">Сұрақ қосу ({customQuestions.length} қосылды)</h3>
        {labels[builderGameType].map(([key, label]) => (
          <div className="bf-field" key={key}>
            <label className="bf-label">{label}</label>
            <input className="bf-input" value={form[key] || ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
          </div>
        ))}
        
        {/* АДМИН ҮШІН ҚОСЫМША БАПТАУ */}
        {userRole === 'admin' && (
          <div className="bf-field" style={{flexDirection: 'row', alignItems: 'center', gap: '10px', marginTop: '10px'}}>
             <input type="checkbox" id="isPublic" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} style={{width: '20px', height: '20px', accentColor: '#EAB308'}} />
             <label htmlFor="isPublic" style={{fontSize: '13px', fontWeight: 'bold', color: '#102B45', cursor: 'pointer'}}>
               Бұл ойынды барлық оқушыларға көрсету (Ортақ ойын)
             </label>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button className="bf-add" onClick={addQuestion}>+ Сұрақ қос</button>
          {customQuestions.length >= 2 && (
            <button className="bf-save" onClick={saveGame}>💾 Ойынды сақтау</button>
          )}
        </div>
        {customQuestions.length > 0 && (
          <div className="added-list">
            <p className="al-title">Қосылған сұрақтар:</p>
            {customQuestions.map((q, i) => (
              <div key={i} className="al-item">
                <span className="al-num">{i + 1}</span>
                <span>{q.question || q.clue || q.word || (q.text || '').slice(0, 40)}</span>
                <button className="al-del" onClick={() => setCustomQuestions(p => p.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
 
  const totalQ = questionPool[activeGame]?.length || 0;
  const pct = totalQ ? Math.round((score / totalQ) * 100) : 0;
 
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap');
 
        * { box-sizing: border-box; margin: 0; padding: 0; }
 
        .gb-root { min-height: 100vh; background: #F0F2F5; font-family: 'Inter', sans-serif; color: #102B45; }
 
        /* ЛОГОТИП ЖӨНДЕЛДІ */
        .topbar { background: #102B45; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; box-shadow: 0 4px 20px rgba(16,43,69,0.3); }
        .topbar-logo img { height: 40px; object-fit: contain; filter: brightness(0) invert(1); transition: transform 0.3s; }
        .topbar-logo img:hover { transform: scale(1.05); }

        .topbar-tabs { display: flex; gap: 8px; }
        .tab-btn { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; padding: 8px 22px; border-radius: 50px; cursor: pointer; transition: all 0.2s; }
        .tab-btn:hover { background: rgba(255,255,255,0.12); color: white; }
        .tab-btn.active { background: #EAB308; color: #102B45; border-color: #EAB308; }
 
        .home-wrap { max-width: 1100px; margin: 0 auto; padding: 50px 24px; }
        .home-headline { font-family: 'Montserrat', sans-serif; font-size: clamp(32px, 5vw, 52px); font-weight: 900; line-height: 1.1; margin-bottom: 12px; letter-spacing: -0.02em; }
        .home-sub { color: rgba(16,43,69,0.5); font-size: 14px; margin-bottom: 48px; letter-spacing: 0.05em; }
        .section-label { font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 800; letter-spacing: 0.25em; text-transform: uppercase; color: rgba(16,43,69,0.35); margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
        .section-label::after { content:''; flex:1; height:1px; background:rgba(16,43,69,0.1); }
 
        .games-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 56px; }
        .game-card { background: white; border-radius: 20px; padding: 32px 24px; cursor: pointer; transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); border-bottom: 4px solid transparent; box-shadow: 0 2px 12px rgba(0,0,0,0.04); position: relative; overflow: hidden; }
        .game-card::before { content: attr(data-icon); position: absolute; right: -10px; bottom: -10px; font-size: 80px; opacity: 0.07; transition: transform 0.4s; }
        .game-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        .game-card:hover::before { transform: scale(1.3) rotate(10deg); opacity: 0.12; }
        .gc-icon { font-size: 36px; margin-bottom: 16px; display: block; }
        .gc-title { font-family: 'Montserrat', sans-serif; font-size: 18px; font-weight: 800; margin-bottom: 8px; }
        .gc-desc { font-size: 13px; color: rgba(16,43,69,0.5); margin-bottom: 24px; line-height: 1.5; }
        .gc-count { font-size: 11px; font-weight: 700; color: rgba(16,43,69,0.35); margin-bottom: 16px; }
        .play-btn { width: 100%; padding: 12px; border-radius: 12px; border: none; background: #102B45; color: white; font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; }
        .play-btn:hover { background: #EAB308; color: #102B45; }
 
        /* CUSTOM GAMES */
        .custom-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
        .custom-card { background: white; border-radius: 16px; padding: 24px; border-left: 5px solid #EAB308; box-shadow: 0 2px 10px rgba(0,0,0,0.04); display: flex; flex-direction: column; gap: 8px; position: relative; }
        .cc-title { font-family:'Montserrat',sans-serif; font-weight:800; font-size:15px; }
        .cc-meta { font-size:12px; color:rgba(16,43,69,0.45); }
        .cc-public-badge { position: absolute; top: 10px; right: 10px; background: #10b981; color: white; font-size: 9px; padding: 4px 8px; border-radius: 4px; font-weight: bold; text-transform: uppercase; }
        .cc-play { margin-top: 8px; padding: 10px; border-radius: 10px; border: none; background: #102B45; color: white; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; transition: background 0.2s; }
        .cc-play:hover { background: #10b981; }
        .empty-hint { text-align: center; padding: 40px; color: rgba(16,43,69,0.3); font-size: 14px; background: white; border-radius: 16px; border: 2px dashed rgba(16,43,69,0.1); }
 
        /* PLAY AREA */
        .play-wrap { max-width: 720px; margin: 0 auto; padding: 40px 24px; }
        .play-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
        .back-btn { background: white; border: none; padding: 10px 20px; border-radius: 50px; font-weight: 700; font-size: 13px; cursor: pointer; color: #102B45; box-shadow: 0 2px 8px rgba(0,0,0,0.06); transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
        .back-btn:hover { background: #EAB308; color: #102B45; box-shadow: none; }
        .score-pill { background: #102B45; color: #EAB308; font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 900; padding: 8px 20px; border-radius: 50px; letter-spacing: 0.1em; }
        .progress-bar { height: 6px; background: rgba(16,43,69,0.1); border-radius: 10px; margin-bottom: 32px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #EAB308, #FBBF24); border-radius: 10px; transition: width 0.5s ease; }
        .play-card { background: white; border-radius: 24px; padding: 48px 40px; box-shadow: 0 8px 40px rgba(16,43,69,0.08); animation: slideUp 0.35s ease; }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .q-label { font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(16,43,69,0.3); margin-bottom: 20px; }
        .q-text { font-family: 'Montserrat', sans-serif; font-size: 22px; font-weight: 800; line-height: 1.4; color: #102B45; margin-bottom: 32px; }
 
        /* Timer */
        .timer-wrap { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .timer-track { flex: 1; height: 8px; background: rgba(16,43,69,0.08); border-radius: 10px; overflow: hidden; }
        .timer-fill { height: 100%; border-radius: 10px; transition: width 1s linear, background 0.3s; }
        .timer-num { font-family: 'Montserrat', sans-serif; font-size: 20px; font-weight: 900; min-width: 40px; text-align: right; }
 
        /* Options */
        .opts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .opt-btn { padding: 18px 20px; border-radius: 14px; border: 2px solid rgba(16,43,69,0.08); background: #F8F9FA; font-size: 15px; font-weight: 700; color: #102B45; cursor: pointer; transition: all 0.18s; text-align: left; }
        .opt-btn:hover:not(:disabled) { background: #102B45; color: white; border-color: #102B45; transform: translateY(-2px); }
        .opt-btn.correct { background: #10b981 !important; color: white !important; border-color: #10b981 !important; }
        .opt-btn.wrong { background: #ef4444 !important; color: white !important; border-color: #ef4444 !important; }
        .opt-btn:disabled { cursor: default; }
 
        /* Word input */
        .clue-card { background: rgba(234,179,8,0.08); border: 1px dashed rgba(234,179,8,0.5); border-radius: 16px; padding: 28px; text-align: center; margin-bottom: 28px; }
        .clue-icon { font-size: 32px; display: block; margin-bottom: 12px; }
        .word-input { display: block; width: 100%; max-width: 360px; margin: 0 auto; padding: 18px 20px; font-size: 22px; font-weight: 900; text-align: center; letter-spacing: 4px; border: 3px solid rgba(16,43,69,0.1); border-radius: 14px; outline: none; color: #102B45; text-transform: uppercase; transition: border-color 0.2s; }
        .word-input:focus { border-color: #EAB308; }
        .word-input.inp-correct { border-color: #10b981 !important; background: rgba(16,185,129,0.08); }
        .word-input.inp-wrong { border-color: #ef4444 !important; background: rgba(239,68,68,0.08); }
        .submit-btn { padding: 16px 48px; border-radius: 14px; border: none; background: #102B45; color: white; font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; transition: all 0.2s; }
        .submit-btn:hover:not(:disabled) { background: #10b981; transform: translateY(-2px); }
 
        /* Sorting */
        .floating-word { display: inline-block; background: #102B45; color: #EAB308; font-family: 'Montserrat', sans-serif; font-size: 30px; font-weight: 900; padding: 16px 48px; border-radius: 16px; margin-bottom: 40px; animation: floatAnim 2.5s ease-in-out infinite; box-shadow: 0 12px 30px rgba(16,43,69,0.2); }
        @keyframes floatAnim { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .boxes-row { display: flex; flex-wrap: wrap; gap: 14px; justify-content: center; }
        .box-btn { background: #F8F9FA; border: 2px dashed rgba(16,43,69,0.2); border-radius: 14px; width: 130px; height: 120px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; font-weight: 800; font-size: 13px; text-transform: uppercase; cursor: pointer; transition: all 0.2s; color: #102B45; }
        .box-btn:hover:not(:disabled) { background: rgba(234,179,8,0.1); border-color: #EAB308; border-style: solid; transform: translateY(-4px); }
        .box-btn.correct { background: #10b981 !important; color: white !important; border-color: #10b981 !important; border-style: solid !important; }
        .box-btn.wrong { background: #ef4444 !important; color: white !important; border-color: #ef4444 !important; border-style: solid !important; }
        .box-icon-emoji { font-size: 28px; }
        .box-btn:disabled { cursor: default; }
 
        /* Proverb */
        .proverb-box { background: #F8F9FA; border-left: 5px solid #EAB308; border-radius: 0 16px 16px 0; padding: 32px 40px; margin-bottom: 32px; display: flex; align-items: center; gap: 12px; }
        .proverb-mark { font-size: 60px; color: rgba(234,179,8,0.3); font-family: Georgia, serif; line-height: 1; }
        .proverb-text { font-family: 'Montserrat', sans-serif; font-size: 20px; font-weight: 800; line-height: 1.6; color: #102B45; }
        .blank { display: inline-block; min-width: 80px; border-bottom: 3px solid #102B45; color: #EAB308; text-align: center; font-size: 24px; margin: 0 4px; }
        .pill-row { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
        .pill-btn { background: white; border: 2px solid rgba(16,43,69,0.1); padding: 14px 28px; border-radius: 50px; font-size: 15px; font-weight: 800; cursor: pointer; transition: all 0.18s; color: #102B45; box-shadow: 0 3px 10px rgba(0,0,0,0.04); }
        .pill-btn:hover:not(:disabled) { background: #EAB308; border-color: #EAB308; transform: translateY(-2px); }
        .pill-btn.correct { background: #10b981 !important; color: white !important; border-color: #10b981 !important; }
        .pill-btn.wrong { background: #ef4444 !important; color: white !important; border-color: #ef4444 !important; }
        .pill-btn:disabled { cursor: default; }
 
        /* Feedback & Result */
        .feedback-badge { margin-top: 20px; padding: 14px 24px; border-radius: 12px; font-weight: 700; font-size: 14px; text-align: center; animation: fadeIn 0.3s ease; }
        .feedback-badge.correct { background: rgba(16,185,129,0.12); color: #059669; }
        .feedback-badge.wrong { background: rgba(239,68,68,0.1); color: #dc2626; }
        .result-card { background: white; border-radius: 24px; padding: 60px 40px; text-align: center; box-shadow: 0 8px 40px rgba(16,43,69,0.08); }
        .result-trophy { font-size: 72px; margin-bottom: 20px; animation: bounce 0.6s ease; }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 40%{transform:translateY(-20px)} 70%{transform:translateY(-8px)} }
        .result-title { font-family:'Montserrat',sans-serif; font-size:32px; font-weight:900; margin-bottom:12px; }
        .result-score { font-size:48px; font-weight:900; color:#EAB308; font-family:'Montserrat',sans-serif; margin-bottom:8px; }
        .result-sub { font-size:14px; color:rgba(16,43,69,0.45); margin-bottom:32px; }
        .result-bar { height:12px; background:rgba(16,43,69,0.08); border-radius:10px; max-width:300px; margin:0 auto 8px; overflow:hidden; }
        .result-bar-fill { height:100%; background:linear-gradient(90deg,#EAB308,#10b981); border-radius:10px; transition:width 1s ease; }
        .result-pct { font-size:13px; font-weight:700; color:rgba(16,43,69,0.5); margin-bottom:36px; }
        .result-btns { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }
        .res-btn { padding: 16px 40px; border-radius: 50px; border: none; font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; transition: all 0.2s; }
        .res-btn-primary { background:#EAB308; color:#102B45; }
        .res-btn-primary:hover { background:#FBBF24; transform:translateY(-2px); box-shadow:0 8px 20px rgba(234,179,8,0.35); }
        .res-btn-ghost { background:white; color:#102B45; border:2px solid rgba(16,43,69,0.12); }
        .res-btn-ghost:hover { border-color:#102B45; }
 
        /* BUILDER */
        .builder-wrap { max-width: 860px; margin: 0 auto; padding: 40px 24px; }
        .builder-card { background: white; border-radius: 24px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); margin-bottom: 28px; }
        .builder-title { font-family: 'Montserrat', sans-serif; font-size: 24px; font-weight: 900; margin-bottom: 8px; }
        .builder-sub { font-size: 14px; color: rgba(16,43,69,0.5); margin-bottom: 28px; }
        .type-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 28px; }
        .type-btn { padding: 20px; border-radius: 14px; border: 2px solid rgba(16,43,69,0.1); background: #F8F9FA; cursor: pointer; transition: all 0.2s; text-align: left; }
        .type-btn:hover { border-color: #102B45; background: white; }
        .type-btn.selected { border-color: #EAB308; background: rgba(234,179,8,0.06); }
        .tb-icon { font-size: 24px; margin-bottom: 8px; display: block; }
        .tb-name { font-family:'Montserrat',sans-serif; font-weight:800; font-size:15px; margin-bottom:4px; }
        .tb-desc { font-size:12px; color:rgba(16,43,69,0.45); }
        .next-btn { padding: 14px 40px; border-radius: 12px; border: none; background: #102B45; color: white; font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; transition: all 0.2s; }
        .next-btn:hover { background: #EAB308; color: #102B45; }
 
        /* Builder Form */
        .builder-form { display:flex; flex-direction:column; gap:14px; }
        .bf-title { font-family:'Montserrat',sans-serif; font-weight:800; font-size:18px; margin-bottom:4px; }
        .bf-field { display:flex; flex-direction:column; gap:5px; }
        .bf-label { font-size:12px; font-weight:700; color:rgba(16,43,69,0.5); text-transform:uppercase; letter-spacing:0.1em; }
        .bf-input { padding: 12px 16px; border-radius: 10px; border: 2px solid rgba(16,43,69,0.1); font-size: 15px; color: #102B45; outline: none; transition: border-color 0.2s; font-family: 'Inter', sans-serif; }
        .bf-input:focus { border-color: #EAB308; }
        .bf-add { padding: 12px 28px; border-radius: 10px; border: none; background: #10b981; color: white; font-weight: 800; font-size: 13px; cursor: pointer; transition: background 0.2s; }
        .bf-add:hover { background: #059669; }
        .bf-save { padding: 12px 28px; border-radius: 10px; border: none; background: #EAB308; color: #102B45; font-weight: 800; font-size: 13px; cursor: pointer; transition: background 0.2s; }
        .bf-save:hover { background: #FBBF24; }
        .added-list { margin-top: 8px; background: #F8F9FA; border-radius: 12px; padding: 16px; }
        .al-title { font-weight:700; font-size:12px; text-transform:uppercase; letter-spacing:0.1em; color:rgba(16,43,69,0.4); margin-bottom:10px; }
        .al-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid rgba(16,43,69,0.06); font-size: 13px; }
        .al-num { width: 22px; height: 22px; background: #102B45; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; flex-shrink: 0; }
        .al-del { margin-left: auto; background: none; border: none; color: rgba(16,43,69,0.3); cursor: pointer; font-size: 14px; transition: color 0.2s; flex-shrink: 0; }
        .al-del:hover { color: #ef4444; }
 
        @media (max-width: 600px) {
          .topbar { padding: 0 16px; }
          .topbar-tabs .tab-btn { font-size: 9px; padding: 7px 14px; }
          .play-card { padding: 28px 20px; }
          .opts-grid { grid-template-columns: 1fr; }
          .type-grid { grid-template-columns: 1fr; }
          .boxes-row .box-btn { width: 110px; height: 100px; }
        }
      `}</style>
 
      <div className="gb-root">
        {/* TOP BAR (ЛОГОТИП АУЫСТЫРЫЛДЫ) */}
        <div className="topbar">
          <Link to="/" className="topbar-logo">
            <img src="/logo.png" alt="TILIM" />
          </Link>
          <div className="topbar-tabs">
            <button className={`tab-btn ${mode === 'home' || mode === 'play' ? 'active' : ''}`}
              onClick={() => { setMode('home'); setActiveGame(null); setShowResult(false); }}>
              🎮 Ойындар
            </button>
            <button className={`tab-btn ${mode === 'builder' ? 'active' : ''}`}
              onClick={() => { setMode('builder'); setBuilderStep('type'); setForm(emptyForm(builderGameType)); setCustomQuestions([]); }}>
              ✏️ Конструктор
            </button>
          </div>
        </div>
 
        {/* ══ HOME ══ */}
        {mode === 'home' && (
          <div className="home-wrap">
            <h1 className="home-headline">
              Интерактивті<br /><span style={{ color: '#EAB308' }}>Ойындар</span>
            </h1>
            <p className="home-sub">Қазақ тілі грамматикасын ойын арқылы үйрен</p>
 
            <div className="section-label">Стандартты ойындар</div>
            <div className="games-grid">
              {gamesList.map(g => (
                <div key={g.id} className="game-card" data-icon={g.icon} style={{ borderBottomColor: g.color }}
                  onClick={() => handlePlay(g.id)}>
                  <span className="gc-icon">{g.icon}</span>
                  <h3 className="gc-title">{g.title}</h3>
                  <p className="gc-desc">{g.desc}</p>
                  <p className="gc-count">{allGamesData[g.id].length} сұрақ</p>
                  <button className="play-btn">Ойнау →</button>
                </div>
              ))}
            </div>
 
            <div className="section-label">Жеке және ортақ ойындар</div>
            {createdGames.length === 0 ? (
              <div className="empty-hint">
                Әзірге жасалған ойын жоқ.<br />
                <strong>«Конструктор»</strong> арқылы өз ойыныңды жаса! 🎨
              </div>
            ) : (
              <div className="custom-grid">
                {createdGames.map(cg => (
                  <div key={cg.id} className="custom-card">
                    {cg.is_public && <div className="cc-public-badge">БАРЛЫҒЫНА ОРТАҚ</div>}
                    <div className="cc-title">{gamesList[cg.type - 1].icon} {cg.title}</div>
                    <div className="cc-meta">
                      {cg.questions ? JSON.parse(cg.questions).length : 0} сұрақ · {cg.author_name}
                    </div>
                    <button className="cc-play" onClick={() => {
                        const parsedQuestions = JSON.parse(cg.questions);
                        playCustomGame({...cg, questions: parsedQuestions});
                    }}>▶ Ойнау</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
 
        {/* ══ PLAY ══ */}
        {mode === 'play' && (
          <div className="play-wrap">
            <div className="play-header">
              <button className="back-btn" onClick={() => { setMode('home'); setActiveGame(null); setShowResult(false); }}>
                ← Артқа
              </button>
              <div className="score-pill">⭐ {score * 10} ҰПАЙ</div>
            </div>
 
            {!showResult && (
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${((currentQuestion) / totalQ) * 100}%` }} />
              </div>
            )}
 
            {showResult ? (
              <div className="result-card">
                <div className="result-trophy">{pct >= 80 ? '🏆' : pct >= 50 ? '🥈' : '📚'}</div>
                <h2 className="result-title">Ойын аяқталды!</h2>
                <div className="result-score">{score}/{totalQ}</div>
                <div className="result-sub">Дұрыс жауаптар</div>
                <div className="result-bar">
                  <div className="result-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <p className="result-pct">{pct}% дәлдік · +{score * 10} ұпай сақталды</p>
                <div className="result-btns">
                  <button className="res-btn res-btn-primary" onClick={() => handlePlay(activeGame)}>🔄 Қайтадан</button>
                  <button className="res-btn res-btn-ghost" onClick={() => { setMode('home'); setActiveGame(null); }}>Ойындар</button>
                </div>
              </div>
            ) : (
              <div className="play-card">
                <p className="q-label">
                  Сұрақ {currentQuestion + 1}/{totalQ}
                </p>
                {renderGame()}
              </div>
            )}
          </div>
        )}
 
        {/* ══ BUILDER ══ */}
        {mode === 'builder' && (
          <div className="builder-wrap">
            <div className="builder-card">
              <div className="play-header" style={{ marginBottom: '24px' }}>
                <button className="back-btn" onClick={() => setMode('home')}>← Артқа</button>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(16,43,69,0.4)' }}>
                  {builderStep === 'type' ? '1/2 — Ойын түрі' : '2/2 — Сұрақтар'}
                </span>
              </div>
 
              <h2 className="builder-title">✏️ Ойын Конструкторы</h2>
              <p className="builder-sub">
                Өз сұрақтарыңыздан жеке ойын жасаңыз
              </p>
 
              {builderStep === 'type' && (
                <div>
                  <div className="type-grid">
                    {gamesList.map(g => (
                      <div key={g.id} className={`type-btn ${builderGameType === g.id ? 'selected' : ''}`}
                        onClick={() => setBuilderGameType(g.id)}>
                        <span className="tb-icon">{g.icon}</span>
                        <div className="tb-name">{g.title}</div>
                        <div className="tb-desc">{g.desc}</div>
                      </div>
                    ))}
                  </div>
                  <button className="next-btn" onClick={() => { setBuilderStep('form'); setForm(emptyForm(builderGameType)); }}>
                    Келесі →
                  </button>
                </div>
              )}
 
              {builderStep === 'form' && renderBuilderForm()}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
 
export default Games;
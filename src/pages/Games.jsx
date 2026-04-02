import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Games = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  
  // Ойынның күйлері (States)
  const [activeGame, setActiveGame] = useState(null); // Қай ойын қосылып тұр?
  const [currentQuestion, setCurrentQuestion] = useState(0); // Ағымдағы сұрақ
  const [score, setScore] = useState(0); // Ұпай
  const [showResult, setShowResult] = useState(false); // Нәтижені көрсету

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const gamesList = [
    { id: 1, title: 'Кім жылдам?', desc: 'Сөздерді буынға бөлу және екпін қоюдан жарыс.', icon: 'fa-solid fa-stopwatch' },
    { id: 2, title: 'Сөзжұмбақ', desc: 'Морфологиялық ережелер бойынша сөзжұмбақ шешу.', icon: 'fa-solid fa-border-all' },
    { id: 3, title: 'Сиқырлы сандық', desc: 'Зат есім, сын есім, етістіктерді өз сандығына дұрыс орналастыр.', icon: 'fa-solid fa-box-open' },
    { id: 4, title: 'Мақалды тап', desc: 'Жасырылған мақал-мәтелдердің жалғасын табу.', icon: 'fa-solid fa-puzzle-piece' },
  ];

  // "Мақалды тап" ойынының сұрақтары
  const proverbsQuiz = [
    { question: "Отан отбасынан ...", options: ["басталады", "аяқталады", "құралады", "бөлінеді"], answer: "басталады" },
    { question: "Өнер алды - ...", options: ["қызыл тіл", "ақ білек", "терең ой", "адал еңбек"], answer: "қызыл тіл" },
    { question: "Еңбек түбі - ...", options: ["бейнет", "береке", "қуаныш", "байлық"], answer: "береке" },
    { question: "Жеті рет өлше, ...", options: ["он рет ойлан", "бір рет кес", "екі рет піш", "ешқашан кеспе"], answer: "бір рет кес" },
    { question: "Көз қорқақ, ...", options: ["сөз батыр", "қол батыр", "ақыл батыр", "жүрек батыр"], answer: "қол батыр" }
  ];

  // Ойынды бастау
  const handlePlayGame = (id) => {
    if (id === 4) {
      setActiveGame(4);
      setCurrentQuestion(0);
      setScore(0);
      setShowResult(false);
    } else {
      alert("Бұл ойын жақында іске қосылады! Әзірге «Мақалды тап» ойынын ойнап көріңіз.");
    }
  };

  // Жауапты тексеру
  const handleAnswerClick = (selectedOption) => {
    if (selectedOption === proverbsQuiz[currentQuestion].answer) {
      setScore(score + 1); // Дұрыс болса ұпай қосу
    }

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < proverbsQuiz.length) {
      setCurrentQuestion(nextQuestion); // Келесі сұраққа өту
    } else {
      setShowResult(true); // Сұрақтар бітсе, нәтижені шығару
    }
  };

  return (
    <>
      <style>{`
        .games-container {
          min-height: 100vh;
          background: #F8F9FA;
          font-family: 'Inter', sans-serif;
          color: #102B45;
          padding: 40px 20px;
        }
        .header-top {
          max-width: 1200px;
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
        
        .page-title {
          text-align: center;
          font-family: 'Montserrat', sans-serif;
          font-size: 40px;
          font-weight: 900;
          color: #102B45;
          margin-bottom: 50px;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s ease;
        }
        .page-title.visible { opacity: 1; transform: translateY(0); }

        /* Ойындар тізімі */
        .games-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 30px;
          max-width: 1200px;
          margin: 0 auto;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.8s ease 0.2s;
        }
        .games-grid.visible { opacity: 1; transform: translateY(0); }

        .game-card {
          background: white;
          border-radius: 20px;
          padding: 40px 30px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(16,43,69,0.05);
          border-bottom: 4px solid transparent;
          transition: all 0.3s;
        }
        .game-card:hover {
          transform: translateY(-10px);
          border-bottom-color: #EAB308;
          box-shadow: 0 15px 40px rgba(16,43,69,0.1);
        }
        .game-icon { font-size: 50px; color: #EAB308; margin-bottom: 20px; }
        .game-title { font-family: 'Montserrat', sans-serif; font-size: 20px; font-weight: 800; margin-bottom: 12px; }
        .game-desc { font-size: 14px; color: rgba(16,43,69,0.6); line-height: 1.6; margin-bottom: 30px; }
        
        .btn-play {
          background: #102B45;
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 50px;
          font-family: 'Montserrat', sans-serif;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s;
        }
        .btn-play:hover { background: #EAB308; color: #102B45; }

        /* --- ОЙЫННЫҢ ІШКІ ДИЗАЙНЫ --- */
        .active-game-area {
          max-width: 700px;
          margin: 0 auto;
          background: white;
          border-radius: 20px;
          padding: 50px;
          box-shadow: 0 15px 50px rgba(16,43,69,0.1);
          text-align: center;
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

        .quiz-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          color: rgba(16,43,69,0.6);
        }
        .quiz-question {
          font-family: 'Montserrat', sans-serif;
          font-size: 28px;
          font-weight: 900;
          color: #102B45;
          margin-bottom: 40px;
        }
        .options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        .btn-option {
          background: #F8F9FA;
          border: 2px solid rgba(16,43,69,0.1);
          padding: 20px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          color: #102B45;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-option:hover {
          background: #102B45;
          color: white;
          border-color: #102B45;
          transform: translateY(-2px);
        }

        .result-box {
          text-align: center;
        }
        .result-icon {
          font-size: 70px;
          color: #EAB308;
          margin-bottom: 20px;
        }
        .result-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 32px;
          font-weight: 900;
          margin-bottom: 10px;
        }
        .result-score {
          font-size: 20px;
          color: rgba(16,43,69,0.7);
          margin-bottom: 40px;
        }
        .result-score span {
          color: #102B45;
          font-weight: 800;
          font-size: 24px;
        }
        .btn-restart {
          background: #EAB308;
          color: #102B45;
          border: none;
          padding: 15px 40px;
          border-radius: 50px;
          font-family: 'Montserrat', sans-serif;
          font-size: 14px;
          font-weight: 800;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s;
        }
        .btn-restart:hover { background: #FBBF24; transform: translateY(-2px); }
        
        @media (max-width: 600px) {
          .options-grid { grid-template-columns: 1fr; }
          .active-game-area { padding: 30px 20px; }
        }
      `}</style>

      <div className="games-container">
        <div className="header-top">
          <button 
            onClick={() => activeGame ? setActiveGame(null) : navigate('/')} 
            className="btn-back"
          >
            <i className="fa-solid fa-arrow-left"></i> 
            {activeGame ? 'Ойындар тізіміне қайту' : 'Артқа қайту'}
          </button>
        </div>

        {/* ЕГЕР ОЙЫН ТАҢДАЛМАСА - ТІЗІМ КӨРІНЕДІ */}
        {!activeGame ? (
          <>
            <h1 className={`page-title ${visible ? 'visible' : ''}`}>
              ИНТЕРАКТИВТІ <span style={{color: '#EAB308'}}>ОЙЫНДАР</span>
            </h1>
            <div className={`games-grid ${visible ? 'visible' : ''}`}>
              {gamesList.map((game) => (
                <div key={game.id} className="game-card">
                  <i className={`${game.icon} game-icon`}></i>
                  <h3 className="game-title">{game.title}</h3>
                  <p className="game-desc">{game.desc}</p>
                  <button className="btn-play" onClick={() => handlePlayGame(game.id)}>
                    Ойнау <i className="fa-solid fa-play" style={{marginLeft:'5px'}}></i>
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* ЕГЕР ОЙЫН ТАҢДАЛСА - ОЙЫН ПРОЦЕСІ КӨРІНЕДІ */
          <div className="active-game-area">
            {showResult ? (
              <div className="result-box">
                <i className="fa-solid fa-trophy result-icon"></i>
                <h2 className="result-title">ОЙЫН АЯҚТАЛДЫ!</h2>
                <p className="result-score">
                  Сіздің ұпайыңыз: <span>{score} / {proverbsQuiz.length}</span>
                </p>
                <button className="btn-restart" onClick={() => handlePlayGame(4)}>
                  Қайта ойнау <i className="fa-solid fa-rotate-right" style={{marginLeft:'8px'}}></i>
                </button>
              </div>
            ) : (
              <div>
                <div className="quiz-header">
                  <span>Сұрақ {currentQuestion + 1} / {proverbsQuiz.length}</span>
                  <span>Ұпай: {score}</span>
                </div>
                <h2 className="quiz-question">{proverbsQuiz[currentQuestion].question}</h2>
                <div className="options-grid">
                  {proverbsQuiz[currentQuestion].options.map((option, index) => (
                    <button 
                      key={index} 
                      className="btn-option"
                      onClick={() => handleAnswerClick(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Games;
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { allGradesData } from '../data'; // Мәліметтерді импорттау

const Topic = () => {
  // 1. URL-ден қай сынып, қай бөлім және қай сабақ екенін оқып алу
  const { gradeId, topicId, lessonId } = useParams();

  // 2. Деректер базасынан нақты осы сабақты іздеу
  const currentGrade = allGradesData[gradeId] || {};
  const currentTopicName = currentGrade.lessons?.[topicId]?.title || "Бөлім";
  
  // Егер сабақ базада табылмаса (әлі жазылмаса), қатып қалмас үшін "Дайындалуда" дегенді шығарамыз
  const currentContent = currentGrade.content?.[lessonId] || {
    title: "Сабақ дайындалуда 🛠",
    theory: "Бұл сабаққа ереже мен видео әлі қосылмаған. Жобаны дамыту барысында міндетті түрде қосылады!",
    videoLocked: true,
    quiz: [
      {
        question: "Бұл сабақтың тесті дайын емес. Артқа қайтыңыз.",
        answers: [
          { text: "Жарайды", correct: true },
          { text: "Түсіндім", correct: false }
        ]
      }
    ]
  };

  const quizData = currentContent.quiz;

  // 3. Ойынның күйін (state) басқару
  const [gameState, setGameState] = useState('start'); // start, playing, result
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const handleStart = () => setGameState('playing');

  const handleAnswer = (answer) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);
    if (answer.correct) setScore(score + 10);

    setTimeout(() => {
      if (currentIdx + 1 < quizData.length) {
        setCurrentIdx(currentIdx + 1);
        setSelectedAnswer(null);
      } else {
        setGameState('result');
      }
    }, 1500);
  };

  return (
    <div className="bg-gray-50 flex flex-col min-h-screen font-sans text-[#102B45] antialiased">
      
      {/* HEADER */}
      <header className="bg-[#102B45] text-white">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold flex items-center gap-2 font-['Montserrat']">
                <span className="text-yellow-500">⚜️</span> TILIM
            </Link>
            {/* Артқа қайту батырмасы енді дәл сол бөлімге қайтарады */}
            <Link to={`/grades/${gradeId}/${topicId}`} className="text-sm hover:text-yellow-400 transition font-medium tracking-tight">
                ← Артқа қайту
            </Link>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-6 py-8 max-w-4xl">
        
        {/* Breadcrumbs (Навигациялық тізбек) */}
        <nav className="text-xs text-gray-400 mb-6 font-medium uppercase tracking-widest">
            {gradeId}-сынып  <i className="fa-solid fa-chevron-right mx-2 text-[8px]"></i> 
            {currentTopicName} <i className="fa-solid fa-chevron-right mx-2 text-[8px]"></i> 
            <span className="text-[#102B45] font-bold">{currentContent.title}</span>
        </nav>

        <h1 className="font-['Montserrat'] text-3xl font-black mb-8 border-l-8 border-yellow-500 pl-4 tracking-tight uppercase">
            {currentContent.title}
        </h1>

        {/* ТЕОРИЯ БӨЛІМІ */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-10">
            <div className="flex items-center gap-3 mb-4 text-emerald-600 font-bold">
                <i className="fa-solid fa-book-open"></i>
                <span>Теория (Ереже)</span>
            </div>
            <div className="prose prose-blue max-w-none text-lg leading-relaxed">
                <p>{currentContent.theory}</p>
            </div>
        </section>

        {/* ВИДЕО БӨЛІМІ */}
        <section className="mb-10">
            <div className="flex items-center gap-3 mb-4 text-blue-600 font-bold">
                <i className="fa-solid fa-play-circle text-xl"></i>
                <span>Видео түсіндірме</span>
            </div>
            <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl group border-4 border-[#102B45]">
                {currentContent.videoLocked ? (
                    <>
                        <div className="absolute inset-0 bg-black/70 z-10 flex flex-col items-center justify-center text-white p-6 text-center">
                            <i className="fa-solid fa-lock text-5xl text-yellow-500 mb-4"></i>
                            <h3 className="text-xl font-bold mb-2 font-['Montserrat']">Бұл видео тек жазылушыларға қолжетімді</h3>
                            <p className="text-sm text-gray-300 mb-6 font-medium">Толық түсіндірмені көру үшін Premium пакетін алыңыз</p>
                            <button className="bg-yellow-500 text-[#102B45] px-8 py-3 rounded-full font-black hover:bg-yellow-400 transition shadow-lg text-xs uppercase tracking-widest">
                                Premium-ды ашу
                            </button>
                        </div>
                        <img 
                            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                            className="w-full h-full object-cover opacity-40" 
                            alt="Video cover" 
                        />
                    </>
                ) : (
                    <iframe 
                        className="w-full h-full absolute top-0 left-0"
                        src={currentContent.videoUrl} 
                        title="YouTube video player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen>
                    </iframe>
                )}
            </div>
        </section>

        {/* ОЙЫН (QUIZ) БӨЛІМІ */}
        <section className="mb-20">
            <div className="flex items-center gap-3 mb-4 text-purple-600 font-bold">
                <i className="fa-solid fa-gamepad text-xl"></i>
                <span>Біліміңді тексер (Ойын)</span>
            </div>
            
            <div className={`p-10 rounded-3xl text-center text-white shadow-xl relative overflow-hidden transition-all duration-500 ${gameState === 'playing' ? 'bg-purple-900' : 'bg-gradient-to-br from-purple-700 to-[#102B45]'}`}>
                {gameState !== 'playing' && <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl pointer-events-none">❓</div>}

                {/* Бастау экраны */}
                {gameState === 'start' && (
                  <div>
                      <h3 className="font-['Montserrat'] text-2xl font-black mb-4 uppercase">Kahoot стиліндегі тест</h3>
                      <p className="mb-8 opacity-80 max-w-md mx-auto font-medium">Ойынды ойнап, ұпай жинаңыз және рейтингте көш бастаңыз!</p>
                      <button onClick={handleStart} className="bg-white text-purple-700 px-10 py-4 rounded-2xl font-black text-lg hover:bg-gray-100 transition shadow-xl hover:scale-105 transform uppercase tracking-widest">
                          Ойынды бастау
                      </button>
                  </div>
                )}

                {/* Ойын экраны */}
                {gameState === 'playing' && (
                  <div className="text-left animate-in fade-in duration-500">
                      <div className="flex justify-between items-center text-sm mb-6 pb-4 border-b border-purple-400/30">
                          <span className="font-bold uppercase tracking-widest">Сұрақ: {currentIdx + 1} / {quizData.length}</span>
                          <span className="text-yellow-400 font-black tracking-widest uppercase">Ұпай: {score}</span>
                      </div>

                      <h3 className="font-['Montserrat'] text-xl md:text-2xl font-black mb-10 leading-snug">
                          {quizData[currentIdx].question}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {quizData[currentIdx].answers.map((ans, i) => (
                            <button 
                              key={i}
                              onClick={() => handleAnswer(ans)}
                              className={`p-6 rounded-xl text-lg font-bold text-left transition duration-300 transform border-2 flex justify-between items-center
                                ${selectedAnswer ? (ans.correct ? 'bg-emerald-600 border-emerald-400 scale-105 shadow-[0_0_20px_rgba(52,211,153,0.5)]' : (selectedAnswer === ans ? 'bg-red-600 border-red-400 shadow-[0_0_20px_rgba(248,113,113,0.5)]' : 'bg-white/5 border-white/5 opacity-50')) 
                                : 'bg-white/10 border-white/5 hover:bg-white/20 hover:border-white/20 hover:scale-[1.02]'}`}
                            >
                              {ans.text}
                              {selectedAnswer && ans.correct && <i className="fa-solid fa-circle-check text-2xl"></i>}
                              {selectedAnswer && !ans.correct && selectedAnswer === ans && <i className="fa-solid fa-circle-xmark text-2xl"></i>}
                            </button>
                          ))}
                      </div>
                  </div>
                )}

                {/* Нәтиже экраны */}
                {gameState === 'result' && (
                  <div className="py-10 animate-in zoom-in duration-500">
                      <i className="fa-solid fa-trophy text-6xl text-yellow-500 mb-6 drop-shadow-lg"></i>
                      <h3 className="font-['Montserrat'] text-3xl font-black mb-4 uppercase">Ойын аяқталды!</h3>
                      <p className={`text-xl mb-10 font-bold ${score === (quizData.length * 10) ? 'text-emerald-300' : 'text-yellow-300'}`}>
                        {score === (quizData.length * 10) ? 'Керемет! Сен барлық сұраққа дұрыс жауап бердің.' : `Жиған ұпайың: ${score}`}
                      </p>
                      <button onClick={() => window.location.reload()} className="bg-white text-purple-700 px-8 py-3 rounded-xl font-black hover:bg-gray-100 transition shadow-md uppercase tracking-widest text-sm">
                          Қайта ойнау
                      </button>
                  </div>
                )}
            </div>
        </section>

      </main>

      <footer className="bg-[#102B45] text-white py-10 text-center text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">
          <p>© 2026 Tilim Платформасы</p>
      </footer>

    </div>
  );
};

export default Topic;
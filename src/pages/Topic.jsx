import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

// YouTube сілтемесін дұрыстайтын функция
const getEmbedUrl = (url) => {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
};

const Topic = () => {
  const { gradeId, topicId, lessonId } = useParams();
  const navigate = useNavigate(); // Басқа бетке лақтыру үшін керек
  
  const [lessonData, setLessonData] = useState(null);
  const [gameState, setGameState] = useState('start');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);

  // 1. ЛОГИН ТЕКСЕРУ ЖӘНЕ МӘЛІМЕТТЕРДІ ЖҮКТЕУ
  useEffect(() => {
    // Егер оқушы жүйеге кірмеген болса, оны Логин бетіне қуып жібереміз
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
      alert("Бұл сабақты көру үшін жүйеге кіруіңіз керек!");
      navigate('/login');
      return; // Код әрі қарай оқылмайды
    }

    // Егер кірген болса, сабақты базадан тартамыз
    fetch(`http://localhost:8080/api/grades/${gradeId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.topics) {
          const topic = data.topics.find(t => t.slug === topicId);
          const lesson = topic?.lessons?.find(l => l.slug === lessonId);
          if (lesson) setLessonData(lesson);
          else setLessonData({ error: true, message: "Бұл сабақ табылмады." });
        } else {
          setLessonData({ error: true, message: "Бөлімдер жоқ." });
        }
      })
      .catch(err => setLessonData({ error: true, message: "Сервермен байланыс жоқ." }));
  }, [gradeId, topicId, lessonId, navigate]);

  if (lessonData === null) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-2xl font-black text-[#102B45] animate-pulse">
        Жүктелуде... ⏳
    </div>
  );

  if (lessonData.error) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-black text-red-500 mb-4">Қате ⚠️</h1>
      <p className="font-bold text-gray-600 mb-8">{lessonData.message}</p>
      <Link to={`/grades/${gradeId}/${topicId}`} className="bg-[#102B45] text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition">← Бөлімге қайту</Link>
    </div>
  );

  const quizzes = lessonData.quizzes || [];
  const handleAnswer = (isCorrect) => {
    if (isCorrect) setScore(score + 10);
    setTimeout(() => {
      if (currentIdx + 1 < quizzes.length) setCurrentIdx(currentIdx + 1);
      else setGameState('result');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-['Inter'] text-[#102B45]">
      
      {/* HEADER */}
      <header className="bg-white border-b border-gray-100 py-4 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link to="/"><img src="/logo.png" alt="Tilim" className="h-8 md:h-10 hover:scale-105 transition" /></Link>
          <div className="flex gap-4 items-center">
             <span className="font-bold text-sm text-[#102B45]"><i className="fa-solid fa-user-check text-emerald-500 mr-2"></i> Оқушы</span>
             <Link to={`/grades/${gradeId}/${topicId}`} className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-[#102B45] transition flex items-center gap-2">
               Артқа қайту <i className="fa-solid fa-arrow-right"></i>
             </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-4xl flex-grow">
        
        {/* НАВИГАЦИЯ ЖӘНЕ ТАҚЫРЫП */}
        <div className="mb-10">
            <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span>{gradeId}-СЫНЫП</span> <span>›</span> <span>{topicId.replace('-', ' ')}</span> <span>›</span> <span className="text-[#102B45]">САБАҚ ДАЙЫНДАЛУДА 🛠</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black uppercase border-l-8 border-yellow-500 pl-4 text-[#102B45] leading-tight">
                {lessonData.title}
            </h1>
        </div>

        <div className="flex flex-col gap-10">
            
            {/* 1. ТЕОРИЯ БЛОГЫ (Жасыл) */}
            <div>
                <h3 className="text-emerald-500 font-black flex items-center gap-2 text-sm uppercase tracking-widest mb-3 pl-2">
                    <i className="fa-solid fa-book-open"></i> Теория (Ереже)
                </h3>
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="text-gray-700 font-medium leading-loose text-base whitespace-pre-wrap">
                        {lessonData.theory}
                    </div>
                </div>
            </div>

            {/* 2. ВИДЕО БЛОГЫ (Көк) */}
            <div>
                <h3 className="text-blue-600 font-black flex items-center gap-2 text-sm uppercase tracking-widest mb-3 pl-2">
                    <i className="fa-solid fa-circle-play"></i> Видео түсіндірме
                </h3>
                <div className="rounded-3xl overflow-hidden shadow-lg bg-black aspect-video relative group">
                    {lessonData.video_locked ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gradient-to-br from-black/80 to-gray-900 bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center bg-blend-overlay">
                        <i className="fa-solid fa-lock text-5xl text-yellow-500 mb-4 drop-shadow-lg"></i>
                        <h3 className="text-xl md:text-2xl font-black mb-2 text-center">Бұл видео тек жазылушыларға қолжетімді</h3>
                        <p className="text-xs font-bold text-gray-300 mb-6 text-center">Толық түсіндірмені көру үшін Premium пакетін алыңыз</p>
                        <button className="bg-yellow-500 text-[#102B45] px-8 py-3 rounded-full font-black hover:bg-yellow-400 transition shadow-lg text-xs uppercase tracking-widest">
                            Premium-ды ашу
                        </button>
                    </div>
                    ) : (
                    <iframe 
                        className="w-full h-full absolute top-0 left-0" 
                        src={getEmbedUrl(lessonData.video_url)} 
                        title={lessonData.title} 
                        allowFullScreen>
                    </iframe>
                    )}
                </div>
            </div>

            {/* 3. ОЙЫН БЛОГЫ (Күлгін) */}
            <div>
                <h3 className="text-purple-600 font-black flex items-center gap-2 text-sm uppercase tracking-widest mb-3 pl-2">
                    <i className="fa-solid fa-gamepad"></i> Біліміңді тексер (Ойын)
                </h3>
                
                <section className="bg-gradient-to-br from-[#5B21B6] to-[#1E1B4B] p-8 md:p-14 rounded-[2rem] text-white text-center shadow-xl relative overflow-hidden">
                    <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-10 text-[10rem] font-black pointer-events-none">
                        ?
                    </div>
                    
                    {quizzes.length === 0 ? (
                    <div className="py-6 relative z-10">
                        <h3 className="text-xl font-black uppercase text-gray-300 tracking-widest">Тапсырма дайындалуда...</h3>
                    </div>
                    ) : (
                    <>
                        {gameState === 'start' && (
                        <div className="py-8 relative z-10">
                            <h3 className="text-3xl md:text-4xl font-black mb-4 uppercase tracking-widest">KAHOOT СТИЛІНДЕГІ ТЕСТ</h3>
                            <p className="text-purple-200 font-medium mb-10 max-w-sm mx-auto">Ойынды ойнап, ұпай жинаңыз және рейтингте көш бастаңыз!</p>
                            <button onClick={() => setGameState('playing')} className="bg-white text-purple-900 px-12 py-4 rounded-xl font-black text-lg hover:scale-105 transition shadow-lg uppercase tracking-widest">
                            Ойынды бастау
                            </button>
                        </div>
                        )}

                        {gameState === 'playing' && (
                        <div className="animate-in fade-in duration-500 text-left relative z-10">
                            <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-8">
                                <span className="bg-white/20 px-4 py-1 rounded-full text-white font-black uppercase tracking-widest text-xs">Сұрақ {currentIdx + 1} / {quizzes.length}</span>
                                <div className="text-white font-black uppercase tracking-widest text-xs">Ұпай: <span className="text-yellow-400 text-base">{score}</span></div>
                            </div>
                            
                            <h3 className="text-2xl md:text-3xl font-black mb-8 leading-tight text-center md:text-left">
                            {quizzes[currentIdx].question}
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {quizzes[currentIdx].answers.map((ans, i) => (
                                <button key={i} onClick={() => handleAnswer(ans.is_correct)} className="bg-white/10 p-6 rounded-2xl font-bold text-lg hover:bg-white text-white hover:text-purple-900 border-b-4 border-black/20 hover:border-purple-300 transition-all duration-300 hover:-translate-y-1 text-left shadow-md">
                                {ans.answer_text}
                                </button>
                            ))}
                            </div>
                        </div>
                        )}

                        {gameState === 'result' && (
                        <div className="animate-in zoom-in duration-500 py-8 relative z-10">
                            <h3 className="text-4xl font-black mb-2 uppercase">Керемет!</h3>
                            <p className="text-purple-200 font-bold uppercase tracking-widest mb-6">Сенің нәтижең</p>
                            <div className="text-6xl font-black text-yellow-400 mb-10">
                                {score} <span className="text-2xl text-white/50">/ {quizzes.length * 10}</span>
                            </div>
                            <button onClick={() => window.location.reload()} className="bg-white text-purple-900 px-8 py-3 rounded-xl font-black hover:scale-105 transition shadow-lg uppercase tracking-widest text-sm">
                                Қайта ойнау
                            </button>
                        </div>
                        )}
                    </>
                    )}
                </section>
            </div>

        </div>
      </main>
    </div>
  );
};

export default Topic;
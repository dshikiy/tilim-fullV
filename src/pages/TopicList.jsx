import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const TopicList = () => {
  const { gradeId, topicId } = useParams();
  const [topicData, setTopicData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
      navigate('/login');
      return;
    }

    // СІЛТЕМЕ ОСЫ ЖЕРДЕ ӨЗГЕРДІ 👇
    fetch(`https://tilim-sqx4.onrender.com/api/grades/${gradeId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.topics) {
          // Бөлімдердің ішінен URL-дегі (мысалы, 'phonetics') бөлімді тауып аламыз
          const foundTopic = data.topics.find(t => t.slug === topicId);
          setTopicData(foundTopic);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Қате:", err);
        setLoading(false);
      });
  }, [gradeId, topicId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl font-black text-[#102B45] animate-pulse">Сабақтар жүктелуде... ⏳</div>
      </div>
    );
  }

  if (!topicData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-black text-red-500 mb-4">Бөлім табылмады ⚠️</h1>
        <Link to={`/grades/${gradeId}`} className="bg-[#102B45] text-white px-8 py-3 rounded-xl font-bold">Артқа қайту</Link>
      </div>
    );
  }

  // Шығу функциясы
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-['Inter'] text-[#102B45]">
      
      {/* HEADER */}
      <header className="bg-white border-b border-gray-100 py-4 shadow-sm">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link to="/">
            <img src="/logo.png" alt="Tilim" className="h-10 w-auto hover:scale-105 transition" />
          </Link>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex text-xs font-bold text-gray-400 uppercase tracking-widest items-center gap-2">
              <Link to={`/grades/${gradeId}`} className="hover:text-[#102B45] transition">{gradeId}-сынып</Link>
              <span>/</span>
              <span className="text-[#102B45]">{topicData.title}</span>
            </div>

            {/* ======================================================== */}
            {/* ПРОФИЛЬ ЖӘНЕ ШЫҒУ БАТЫРМАСЫ (ӨЗГЕРТІЛДІ) */}
            {/* ======================================================== */}
            <div className="flex items-center gap-4 pl-6 border-l border-gray-100">
               {/* Осы жер енді жай ғана мәтін емес, Профильге апаратын сілтеме болды */}
               <Link to="/profile" className="text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full flex items-center gap-2 hover:bg-emerald-100 hover:text-emerald-700 transition">
                 <i className="fa-solid fa-user-check"></i> Менің профилім
               </Link>

               <button onClick={handleLogout} className="text-xs font-bold text-red-400 uppercase tracking-widest hover:text-red-600 transition flex items-center gap-2">
                 Шығу <i className="fa-solid fa-right-from-bracket"></i>
               </button>
            </div>
            {/* ======================================================== */}

          </div>
        </div>
      </header>

      {/* НЕГІЗГІ МАЗМҰН */}
      <main className="container mx-auto px-6 py-12 max-w-5xl flex-grow animate-in fade-in duration-700">
        
        <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-black mb-4 uppercase border-l-8 border-yellow-500 pl-4 text-[#102B45]">
            {topicData.title}
            </h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest ml-6">{topicData.description}</p>
        </div>

        {/* САБАҚТАР ТІЗІМІ (КАРТОЧКАЛАР) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topicData.lessons && topicData.lessons.length > 0 ? (
            topicData.lessons.map((lesson, idx) => (
              <Link 
                to={`/grades/${gradeId}/${topicId}/${lesson.slug}`} 
                key={idx} 
                className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
              >
                {/* Карточка ішіндегі фондық иконка */}
                <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-8xl pointer-events-none group-hover:scale-110 transition-transform duration-500 text-[#102B45]">
                    <i className="fa-solid fa-graduation-cap"></i>
                </div>
                
                <h3 className="text-2xl font-black mb-6 text-[#102B45] group-hover:text-yellow-500 transition-colors duration-300 pr-10">
                    {idx + 1}. {lesson.title}
                </h3>
                
                {/* Дизайндағыдай: Теория, Видео, Тест иконкалары */}
                <div className="flex gap-6 text-xs font-bold uppercase tracking-widest">
                  <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-emerald-500 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                        <i className="fa-solid fa-book-open text-lg"></i>
                    </div>
                    <span>Теория</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-blue-500 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                        {lesson.video_locked ? <i className="fa-solid fa-lock text-lg"></i> : <i className="fa-solid fa-circle-play text-lg"></i>}
                    </div>
                    <span>Видео</span>
                  </div>

                  <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-yellow-500 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-yellow-50 transition-colors">
                        <i className="fa-solid fa-gamepad text-lg"></i>
                    </div>
                    <span>Тест</span>
                  </div>
                </div>

                {/* Бағыттаушы жебе */}
                <div className="absolute top-8 right-8 text-gray-200 group-hover:text-yellow-500 transition-colors text-2xl">
                    <i className="fa-solid fa-circle-arrow-right"></i>
                </div>
              </Link>
            ))
          ) : (
            // Егер мұғалім бұл бөлімге әлі сабақ қоспаған болса
            <div className="col-span-full bg-white p-16 rounded-[3rem] text-center border-2 border-dashed border-gray-200">
                <i className="fa-solid fa-person-digging text-6xl text-gray-300 mb-6"></i>
                <h3 className="text-2xl font-black text-gray-400 uppercase tracking-widest mb-2">Бөлім әлі бос</h3>
                <p className="text-gray-400 font-medium">Мұғалім бұл тақырыпқа жақында жаңа материалдар жүктейді.</p>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-[#102B45] text-white py-10 mt-auto border-t-4 border-yellow-500">
        <div className="container mx-auto px-6 text-center opacity-50 text-[10px] font-black uppercase tracking-[0.4em]">
            © 2026 ТІЛІМ ПЛАТФОРМАСЫ
        </div>
      </footer>
    </div>
  );
};

export default TopicList;
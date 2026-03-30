import React from 'react';
import { useParams, Link } from 'react-router-dom';

const TopicList = () => {
  const { gradeId, topicId } = useParams();

  // БАРЛЫҚ СЫНЫПТАРДЫҢ САБАҚТАРЫ
  const allContent = {
    "5": {
      "phonetics": {
        title: "Фонетика",
        lessons: [
          { name: "Дыбыс пен әріп", count: "2 сабақ" },
          { name: "Дауысты дыбыстар", count: "4 сабақ" },
          { name: "Дауыссыз дыбыстар", count: "3 сабақ" },
          { name: "Буын түрлері", count: "3 сабақ" },
          { name: "Үндестік заңы", count: "4 сабақ" }
        ]
      },
      "section": {
        title: "Сөз табы",
        lessons: [
          { name: "Зат есім", count: "3 сабақ" },
          { name: "Сын есім", count: "2 сабақ" },
          { name: "Сан есім", count: "2 сабақ" }
        ]
      }
    },
    "6": {
      "lexis": {
        title: "Лексика",
        lessons: [
          { name: "Сөз мағынасы", count: "2 сабақ" },
          { name: "Синоним, антоним, омоним", count: "4 сабақ" },
          { name: "Көп мағыналы сөздер", count: "2 сабақ" }
        ]
      }
    },
    "7": {
      "adverb": {
        title: "Үстеу",
        lessons: [
          { name: "Үстеудің мағыналық түрлері", count: "4 сабақ" },
          { name: "Үстеудің жасалу жолдары", count: "3 сабақ" }
        ]
      }
    },
    "8": {
      "syntax": {
        title: "Сөйлем мүшелері",
        lessons: [
          { name: "Бастауыш пен Баяндауыш", count: "4 сабақ" },
          { name: "Тұрлаусыз мүшелер", count: "6 сабақ" }
        ]
      }
    },
    "9": {
      "complex-sentence": {
        title: "Құрмалас сөйлем",
        lessons: [
          { name: "Салалас құрмалас", count: "5 сабақ" },
          { name: "Сабақтас құрмалас", count: "6 сабақ" },
          { name: "Аралас құрмалас", count: "4 сабақ" }
        ]
      }
    }
  };

  const currentData = allContent[gradeId]?.[topicId] || { title: "Мәлімет табылған жоқ", lessons: [] };

  return (
    <div className="min-h-screen bg-white font-['Inter'] flex flex-col antialiased">
      <header className="p-6 border-b border-gray-50 flex justify-between items-center container mx-auto">
        <Link to="/"><img src="/logo.png" alt="Tilim" className="h-8" /></Link>
        <nav className="flex gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <Link to={`/grades/${gradeId}`} className="hover:text-[#102B45]">{gradeId}-сынып</Link>
            <span className="opacity-30">/</span>
            <span className="text-[#102B45] font-black uppercase tracking-widest italic">{currentData.title}</span>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-16 max-w-5xl">
        <div className="mb-16 relative pl-8">
            <div className="absolute left-0 top-1 w-2.5 h-16 bg-[#EAB308] rounded-full"></div>
            <h1 className="font-['Montserrat'] text-5xl font-black mb-2 tracking-tighter uppercase italic">{currentData.title}</h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] font-black italic">{gradeId}-сынып сабақтары</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {currentData.lessons.map((lesson, index) => (
                <Link key={index} to="/topic" className="bg-[#102B45] rounded-[2.5rem] p-10 transition-all duration-300 hover:translate-x-4 hover:shadow-2xl group relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-[0.05] text-[8rem] text-white italic pointer-events-none group-hover:scale-110 transition-transform">⚜️</div>
                    <h2 className="font-['Montserrat'] text-2xl font-black mb-1 text-white group-hover:text-yellow-400 transition-colors uppercase italic">{lesson.name}</h2>
                    <p className="text-[10px] font-bold text-gray-300 uppercase mb-8 font-black tracking-widest">{lesson.count}</p>
                    <div className="flex gap-6 pt-6 border-t border-white/10">
                        <div className="flex flex-col items-center gap-1"><i className="fa-solid fa-book-open text-blue-400"></i><span className="text-[8px] font-black text-gray-400 uppercase">Free</span></div>
                        <div className="flex flex-col items-center gap-1"><i className="fa-solid fa-play text-red-500"></i><span className="text-[8px] font-black text-gray-400 uppercase">Video</span></div>
                        <div className="flex flex-col items-center gap-1"><i className="fa-solid fa-gamepad text-purple-500"></i><span className="text-[8px] font-black text-gray-400 uppercase">Game</span></div>
                    </div>
                </Link>
            ))}
        </div>
      </main>

      <footer className="bg-white py-12 border-t border-gray-50 mt-auto">
        <div className="container mx-auto px-6 text-center opacity-30 text-[9px] font-black uppercase tracking-[0.4em]">
            © 2026 TILIM Платформасы
        </div>
      </footer>
    </div>
  );
};

export default TopicList;
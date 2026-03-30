import React from 'react';
import { Link } from 'react-router-dom';

const Phonetics = () => {
  const lessons = [
    { id: 1, title: "Дыбыс пен әріп", count: "2 тарауша", free: true, video: true, game: true },
    { id: 2, title: "Дауысты дыбыстар", count: "4 тарауша", free: true, video: false, game: true },
    { id: 3, title: "Дауыссыз дыбыстар", count: "3 тарауша", free: true, video: false, game: true },
    { id: 4, title: "Буын түрлері", count: "3 тарауша", free: true, video: true, game: true },
    { id: 5, title: "Тасымал", count: "1 тарауша", free: true, video: false, game: false },
    { id: 6, title: "Үндестік заңы", count: "4 тарауша", free: true, video: true, game: true, special: true },
  ];

  return (
    <div className="min-h-screen flex flex-col antialiased bg-white text-[#102B45] font-['Inter']">

      {/* Header */}
      <header className="p-6 border-b border-gray-50 flex justify-between items-center container mx-auto">
        <Link to="/" className="hover:opacity-80 transition">
            <img src="/logo.png" alt="Tilim" className="h-8" />
        </Link>
        <nav className="flex gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <Link to="/grades" className="hover:text-[#102B45]">5-сынып</Link>
            <span className="opacity-30">/</span>
            <span className="text-[#102B45]">Фонетика</span>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-16 max-w-5xl">
        
        <div className="mb-16 relative pl-8">
            <div className="absolute left-0 top-1 w-2.5 h-16 bg-[#EAB308] rounded-full"></div>
            <h1 className="font-['Montserrat'] text-5xl font-black mb-2 tracking-tighter uppercase">Фонетика</h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">6 негізгі тақырып</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {lessons.map((lesson) => (
                <Link 
                    key={lesson.id} 
                    to="#" 
                    className={`bg-white rounded-[2.5rem] p-10 border transition-all duration-400 hover:-translate-y-2 hover:border-[#EAB308] hover:shadow-[0_25px_50px_-12px_rgba(16,43,69,0.15)] group ${lesson.special ? 'border-yellow-500/20' : 'border-[#F1F5F9]'}`}
                >
                    <h2 className="font-['Montserrat'] text-2xl font-black mb-1 group-hover:text-yellow-600 transition">{lesson.title}</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-8">{lesson.count}</p>
                    
                    <div className="flex gap-6 pt-6 border-t border-gray-50">
                        <div className={`flex flex-col items-center gap-1 ${!lesson.free && 'opacity-30'}`}>
                            <i className={`fa-solid fa-book-open ${lesson.free ? 'text-blue-500' : 'text-gray-400'}`}></i>
                            <span className="text-[8px] font-black text-gray-400 uppercase mt-1">Free</span>
                        </div>
                        <div className={`flex flex-col items-center gap-1 ${!lesson.video && 'opacity-30'}`}>
                            <i className={`fa-solid fa-play ${lesson.video ? 'text-red-500' : 'text-gray-400'}`}></i>
                            <span className="text-[8px] font-black text-gray-400 uppercase mt-1">Video</span>
                        </div>
                        <div className={`flex flex-col items-center gap-1 ${!lesson.game && 'opacity-30'}`}>
                            <i className={`fa-solid fa-gamepad ${lesson.game ? 'text-purple-500' : 'text-gray-400'}`}></i>
                            <span className="text-[8px] font-black text-gray-400 uppercase mt-1">Game</span>
                        </div>
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

export default Phonetics;
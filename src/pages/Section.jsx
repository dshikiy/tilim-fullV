import React from 'react';
import { Link } from 'react-router-dom';

const Section = () => {
  // Сабақтардың тізімі (Кодты қайталай бермеу үшін осылай жазған ыңғайлы)
  const topics = [
    { id: 1, title: "Зат есім", count: "9 тарауша", to: "/topic", active: true },
    { id: 2, title: "Сын есім", count: "9 тарауша", to: "#", active: false },
    { id: 3, title: "Сан есім", count: "9 тарауша", to: "#", active: false },
    { id: 4, title: "Етістік", count: "12 тарауша", to: "#", active: false },
  ];

  return (
    <div className="min-h-screen flex flex-col antialiased bg-white text-[#102B45] font-['Inter']">

      {/* 1. HEADER */}
      <header className="w-full bg-white border-b border-gray-50 py-5">
        <div className="container mx-auto px-8 flex justify-between items-center">
            <Link to="/" className="hover:opacity-80 transition">
                <img src="/logo.png" alt="Tilim Logo" className="h-9 w-auto" />
            </Link>
            <nav className="flex gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                <Link to="/grades" className="hover:text-[#102B45] transition">5-сынып</Link>
                <span className="opacity-30">/</span>
                <span className="text-[#102B45]">Сөз табы</span>
            </nav>
        </div>
      </header>

      {/* 2. MAIN CONTENT */}
      <main className="flex-grow container mx-auto px-8 py-16 max-w-6xl">
        
        {/* Тақырып бөлімі */}
        <div className="mb-16 relative pl-8">
            <div className="absolute left-0 top-1 w-2.5 h-16 bg-[#EAB308] rounded-full"></div>
            <h1 className="font-['Montserrat'] text-5xl font-black mb-2 tracking-tighter">Сөз табы</h1>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.3em]">9 тақырып бар</p>
        </div>

        {/* Карточкалар торы */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {topics.map((topic) => (
                <Link 
                    key={topic.id} 
                    to={topic.to} 
                    className="bg-white rounded-[2.5rem] border border-[#F1F5F9] shadow-sm hover:-translate-y-3 hover:border-[#EAB308] hover:shadow-[0_25px_50px_-12px_rgba(16,43,69,0.15)] transition-all duration-500 p-10 flex flex-col justify-between group relative overflow-hidden"
                >
                    {/* Бірінші карточкадағы ою */}
                    {topic.active && (
                        <div className="absolute -right-6 -top-6 opacity-[0.03] text-9xl italic group-hover:scale-110 transition-transform pointer-events-none">⚜️</div>
                    )}
                    
                    <div className="mb-12 relative z-10">
                        <h2 className="font-['Montserrat'] text-3xl font-black mb-2 group-hover:text-[#EAB308] transition-colors">{topic.title}</h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">{topic.count}</p>
                    </div>

                    <div className="flex gap-8 pt-8 border-t border-gray-50 relative z-10">
                        <div className="flex flex-col items-center gap-2">
                            <i className="fa-solid fa-book-open text-blue-500 text-xl"></i>
                            <span className="text-[9px] font-bold uppercase text-gray-400 tracking-tighter">Free</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <i className="fa-solid fa-circle-play text-red-500 text-xl"></i>
                            <span className="text-[9px] font-bold uppercase text-gray-400 tracking-tighter">Video</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <i className="fa-solid fa-gamepad text-purple-500 text-xl"></i>
                            <span className="text-[9px] font-bold uppercase text-gray-400 tracking-tighter">Game</span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
      </main>

      {/* 3. FOOTER */}
      <footer className="bg-white py-12 border-t border-gray-50 mt-auto">
        <div className="container mx-auto px-8 text-center opacity-30 text-[9px] font-black uppercase tracking-[0.4em]">
            © 2026 TILIM Платформасы
        </div>
      </footer>

    </div>
  );
};

export default Section;
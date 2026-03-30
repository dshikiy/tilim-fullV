import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  // Барлық сыныптар тізімі
  const grades = [5, 6, 7, 8, 9];

  return (
    <div className="min-h-screen bg-white font-sans text-[#102B45]">
      
      {/* 1. HERO SECTION (Басты көк блок) */}
      <section className="bg-[#102B45] text-white relative overflow-hidden pb-32 pt-6">
        {/* Фондағы декоративті оюлар */}
        <div className="absolute left-[-5%] top-0 bottom-0 opacity-[0.03] text-[25rem] font-serif italic pointer-events-none select-none">
          ⚜️
        </div>
        <div className="absolute right-[-5%] top-0 bottom-0 opacity-[0.03] text-[25rem] font-serif italic pointer-events-none select-none">
          ⚜️
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {/* Header */}
          <header className="flex justify-between items-center mb-24 md:mb-32">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="TILIM Logo" className="h-10 md:h-12 object-contain" />
            </Link>
            
            <nav className="hidden md:flex items-center gap-10 text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
              <Link to="/" className="hover:text-[#EAB308] transition-colors">Бастау</Link>
              <a href="#about" className="hover:text-[#EAB308] transition-colors">Қазақ тілі</a>
              <a href="#rules" className="hover:text-[#EAB308] transition-colors">Ережелері</a>
              <Link to="/login" className="bg-[#EAB308] text-[#102B45] px-8 py-2.5 rounded-full hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20 active:scale-95">
                Бастау
              </Link>
            </nav>
          </header>

          {/* Мәтіндік блок */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-['Montserrat'] text-5xl md:text-[5.5rem] font-black mb-8 leading-[1.1] tracking-tight">
              <span className="text-[#EAB308]">TILIM:</span> Қазақ тілі<br/>ережелері
            </h1>
            <p className="text-lg md:text-xl text-white/60 mb-14 font-medium tracking-wide">
              ескірмейтін ереже, жаңаша зерде
            </p>
            {/* "Бастау" батырмасы әдепкі бойынша 5-сыныпқа бағыттайды */}
            <Link 
              to="/grades/5" 
              className="inline-block bg-[#EAB308] text-[#102B45] px-16 py-5 rounded-full font-black text-xl hover:bg-yellow-400 hover:-translate-y-1 active:scale-95 transition-all shadow-[0_15px_40px_rgba(234,179,8,0.3)] uppercase tracking-widest"
            >
              Бастау
            </Link>

            {/* Слайдер индикаторы */}
            <div className="flex justify-center items-center gap-3 mt-24">
              <div className="w-10 h-1.5 bg-[#EAB308] rounded-full"></div>
              <div className="w-2.5 h-1.5 bg-white/20 rounded-full"></div>
              <div className="w-2.5 h-1.5 bg-white/20 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. СЫНЫПТАР БӨЛІМІ (Кәсіби дизайн) */}
      <section className="max-w-6xl mx-auto px-6 py-28 font-['Inter']">
        <div className="flex items-center gap-4 mb-16">
          <div className="w-2 h-10 bg-[#EAB308] rounded-full shadow-[0_0_15px_rgba(234,179,8,0.4)]"></div>
          <h2 className="font-['Montserrat'] text-4xl font-black tracking-tight uppercase">Сыныптар</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 lg:gap-8">
          {grades.map((grade) => (
            <Link 
                key={grade} 
                to={`/grades/${grade}`} // Әр сынып өз нөміріне бағытталады
                className="group bg-[#102B45] rounded-[2.5rem] p-10 flex flex-col items-center justify-center aspect-[4/5] hover:-translate-y-3 hover:shadow-[0_30px_60px_-15px_rgba(16,43,69,0.3)] transition-all duration-500 relative overflow-hidden"
            >
              {/* Карточка ішіндегі декоративті элемент */}
              <div className="absolute -right-4 -bottom-4 text-7xl opacity-5 group-hover:scale-125 transition-transform duration-700 pointer-events-none">⚜️</div>

              <span className="font-['Montserrat'] text-8xl font-black text-[#EAB308] group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl">
                {grade}
              </span>
              <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mt-6 group-hover:text-white/80 transition-colors">
                сынып
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FOOTER */}
      <footer className="bg-[#102B45] text-white py-16 border-t-[10px] border-[#EAB308]">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="font-['Montserrat'] text-2xl font-black mb-4 tracking-widest uppercase">TILIM</div>
          <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.5em]">
            © 2026 ТІЛІМ ПЛАТФОРМАСЫ — БАРЛЫҚ ҚҰҚЫҚТАР ҚОРҒАЛҒАН
          </p>
        </div>
      </footer>

    </div>
  );
};

export default Home;
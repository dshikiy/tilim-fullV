import React from 'react';
import { Link, useParams } from 'react-router-dom';

const Grades = () => {
  const { id } = useParams();

  // Әр сыныптың бөлімдері (Topics)
  const gradesData = {
    "5": {
      title: "5-сынып",
      subtitle: "ПӘНДІК БАҒДАРЛАМА БОЙЫНША 3 НЕГІЗГІ БӨЛІМ",
      topics: [
        { title: "ФОНЕТИКА", desc: "ДЫБЫС, БУЫН, ҮНДЕСТІК ЗАҢЫ (12 САБАҚ)", path: "/grades/5/phonetics" },
        { title: "МОРФОЛОГИЯ", desc: "ТҮБІР МЕН ҚОСЫМША, ЖҰРНАҚ (8 САБАҚ)", path: "/grades/5/morphology" },
        { title: "СӨЗ ТАБЫ", desc: "ЗАТ ЕСІМ, СЫН ЕСІМ, САН ЕСІМ (9 САБАҚ)", path: "/grades/5/section" }
      ]
    },
    "6": {
      title: "6-сынып",
      subtitle: "ЛЕКСИКА ЖӘНЕ ФРАЗЕОЛОГИЯ НЕГІЗДЕРІ",
      topics: [
        { title: "ЛЕКСИКА", desc: "СӨЗ МАҒЫНАСЫ, СИНОНИМ, АНТОНИМ (10 САБАҚ)", path: "/grades/6/lexis" },
        { title: "ФРАЗЕОЛОГИЯ", desc: "ТҰРАҚТЫ СӨЗ ТІРКЕСТЕРІ (6 САБАҚ)", path: "/grades/6/phraseology" },
        { title: "ЕСІМДІК", desc: "ЕСІМДІКТІҢ ТҮРЛЕРІ МЕН ТҰЛҒАСЫ (8 САБАҚ)", path: "/grades/6/pronoun" }
      ]
    },
    "7": {
      title: "7-сынып",
      subtitle: "ҮСТЕУ ЖӘНЕ КӨМЕКШІ СӨЗДЕР",
      topics: [
        { title: "ҮСТЕУ", desc: "ҮСТЕУДІҢ МАҒЫНАЛЫҚ ТҮРЛЕРІ (8 САБАҚ)", path: "/grades/7/adverb" },
        { title: "ЕЛІКТЕУ СӨЗДЕР", desc: "БЕЙНЕЛЕУІШ ЖӘНЕ ДЫБЫСТЫҚ ЕЛІКТЕУІШ (5 САБАҚ)", path: "/grades/7/mimic" },
        { title: "ОДАҒАЙ", desc: "ОДАҒАЙДЫҢ ТҮРЛЕРІ МЕН ТЫНЫС БЕЛГІСІ (4 САБАҚ)", path: "/grades/7/interjection" }
      ]
    },
    "8": {
      title: "8-сынып",
      subtitle: "СИНТАКСИС ЖӘНЕ СӨЙЛЕМ МҮШЕЛЕРІ",
      topics: [
        { title: "СӨЙЛЕМ МҮШЕЛЕРІ", desc: "ТҰРЛАУЛЫ ЖӘНЕ ТҰРЛАУСЫЗ МҮШЕЛЕР (12 САБАҚ)", path: "/grades/8/syntax" },
        { title: "ЖАЙ СӨЙЛЕМ", desc: "ЖАЙ СӨЙЛЕМНІҢ ТҮРЛЕРІ МЕН ҚҰРЫЛЫСЫ (10 САБАҚ)", path: "/grades/8/simple-sentence" }
      ]
    },
    "9": {
      title: "9-сынып",
      subtitle: "ҚҰРМАЛАС СӨЙЛЕМ СИНТАКСИСІ",
      topics: [
        { title: "ҚҰРМАЛАС СӨЙЛЕМ", desc: "САЛАЛАС, САБАҚТАС ҚҰРМАЛАС СӨЙЛЕМ (15 САБАҚ)", path: "/grades/9/complex-sentence" },
        { title: "ШЕШЕНДІК ӨНЕР", desc: "ШЕШЕНДІК СӨЗДЕР МЕН СӨЙЛЕУ МӘДЕНИЕТІ (6 САБАҚ)", path: "/grades/9/rhetoric" }
      ]
    }
  };

  // URL-дегі ID арқылы мәліметті алу (қате болса 5-сынып ашылады)
  const currentGrade = gradesData[id] || gradesData["5"];
  // Қай сыныпта тұрғанымызды анықтау үшін (қате болса 5 шығады)
  const activeGradeId = gradesData[id] ? id : "5";

  return (
    <div className="min-h-screen flex flex-col antialiased bg-white font-['Inter']">
      
      {/* 1. Жоғарғы мәзір (Header) */}
      <header className="bg-white border-b border-gray-100 py-4">
        <div className="container mx-auto px-6 flex justify-between items-center">
            <Link to="/"><img src="/logo.png" alt="Tilim" className="h-10 w-auto hover:scale-105 transition" /></Link>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{activeGradeId}-сынып {'>'} Бөлімдер</div>
        </div>
      </header>
      
      <div className="bg-[#102B45] text-white py-4 shadow-md">
        <div className="container mx-auto px-6 flex justify-between items-center">
            <nav className="flex gap-6 text-[11px] font-bold uppercase tracking-[0.15em]">
                <Link to="/" className="hover:text-yellow-400 transition">Басты бет</Link>
                <Link to={`/grades/${activeGradeId}`} className="text-yellow-400 font-black">Сыныптар</Link>
            </nav>
            <div className="bg-yellow-500 text-[#102B45] px-4 py-1 rounded-lg font-black text-[10px] uppercase tracking-tighter shadow-sm">Белсенді</div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-16 max-w-5xl flex-grow">
        
        {/* СЫНЫПТАРДЫ АУЫСТЫРУ ПАНЕЛІ */}
        <div className="mb-20">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8">БАСҚА СЫНЫПТАР</h3>
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {[5, 6, 7, 8, 9].map((num) => (
                  <Link 
                    key={num}
                    to={`/grades/${num}`}
                    className={`p-6 rounded-[2rem] text-center min-w-[120px] transition-all duration-300 border-2 ${
                      activeGradeId === num.toString() 
                      ? 'bg-[#102B45] border-yellow-500 shadow-xl scale-105' 
                      : 'bg-white border-transparent opacity-60 hover:opacity-100 hover:shadow-md'
                    }`}
                  >
                    <span className={`font-['Montserrat'] block text-5xl font-black mb-1 ${activeGradeId === num.toString() ? 'text-yellow-500' : 'text-[#102B45]'}`}>{num}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${activeGradeId === num.toString() ? 'text-white' : 'text-gray-400'}`}>сынып</span>
                  </Link>
                ))}
            </div>
        </div>

        {/* ТАҚЫРЫПТАР КАРТОЧКАСЫ */}
        <div className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-5 mb-4">
                <div className="w-2.5 h-14 bg-yellow-500 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.5)]"></div>
                <h1 className="font-['Montserrat'] text-6xl font-black text-[#102B45] tracking-tighter uppercase">{currentGrade.title}</h1>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mb-14 ml-8">{currentGrade.subtitle}</p>

            <div className="flex flex-col gap-8">
                {currentGrade.topics.map((topic, index) => (
                  <Link 
                    key={index} 
                    to={topic.path} 
                    className="bg-[#102B45] p-10 rounded-[3rem] flex justify-between items-center group relative overflow-hidden transition-all duration-300 hover:translate-x-4 hover:bg-[#1a3f61] hover:shadow-2xl"
                  >
                    <div className="absolute -right-4 -top-4 opacity-[0.05] text-[10rem] text-white italic pointer-events-none group-hover:scale-110 transition-transform">⚜️</div>
                    <div className="relative z-10">
                        <h2 className="font-['Montserrat'] text-4xl font-black text-white group-hover:text-yellow-400 transition-colors tracking-tight uppercase">{topic.title}</h2>
                        <p className="text-[11px] font-bold text-gray-300 uppercase tracking-widest mt-2 opacity-80">{topic.desc}</p>
                    </div>
                    <div className="relative z-10 w-14 h-14 bg-yellow-500 rounded-full flex items-center justify-center text-[#102B45] font-black text-2xl group-hover:scale-110 transition shadow-lg shadow-yellow-500/20">
                        →
                    </div>
                  </Link>
                ))}
            </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#102B45] text-white py-12 border-t-8 border-yellow-500 mt-auto">
        <div className="container mx-auto px-6 text-center opacity-40 text-[10px] font-black uppercase tracking-[0.5em]">
            © 2026 ТІЛІМ ПЛАТФОРМАСЫ — ЕСКІРМЕЙТІН ЕРЕЖЕ, ЖАҢАША ЗЕРДЕ
        </div>
      </footer>

    </div>
  );
};

export default Grades;
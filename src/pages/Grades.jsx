import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

const Grades = () => {
  const { id } = useParams();
  
  // Серверден келетін мәліметті сақтайтын орын (state)
  const [gradeData, setGradeData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Бет ашылған кезде Бэкендке (Go серверіне) сұрау жіберу
  useEffect(() => {
    setLoading(true);
    // НАЗАР АУДАРЫҢЫЗ: Біз енді мәліметті 8080 порттағы базадан алып жатырмыз!
    fetch(`http://localhost:8080/api/grades/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setGradeData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Серверден мәлімет алу кезінде қате шықты:", error);
        setLoading(false);
      });
  }, [id]);

  // Егер мәлімет әлі серверден келіп үлгермесе, "Жүктелуде" деп тұрады
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-2xl font-black text-[#102B45] animate-pulse">Мәліметтер базадан жүктелуде... ⏳</div>
      </div>
    );
  }

  // Егер базада бұл сынып жоқ болса (мысалы 6-сыныпты бассаңыз)
  if (!gradeData || gradeData.error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-4xl font-black text-[#102B45] mb-4">Бұл сынып әлі базаға қосылмаған 🛠</h1>
        <Link to="/" className="text-yellow-500 font-bold hover:underline">Басты бетке қайту</Link>
      </div>
    );
  }

  const activeGradeId = gradeData.id.toString();

  return (
    <div className="min-h-screen flex flex-col antialiased bg-white font-['Inter']">
      
      {/* HEADER */}
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
                <span className="text-yellow-400 font-black">Сыныптар</span>
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

        {/* ДИНАМИКАЛЫҚ ТАҚЫРЫПТАР (БАЗАДАН КЕЛЕДІ) */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="font-['Montserrat'] text-5xl md:text-6xl font-black text-[#102B45] mb-2 uppercase border-l-8 border-yellow-500 pl-6">{gradeData.title}</h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mb-14 ml-8">{gradeData.subtitle}</p>

            <div className="flex flex-col gap-6 mt-10">
                {gradeData.topics && gradeData.topics.map((topic, index) => (
                  <Link 
                    key={index} 
                    to={`/grades/${activeGradeId}/${topic.slug}`} 
                    className="bg-[#102B45] p-10 rounded-[3rem] flex justify-between items-center group relative overflow-hidden transition-all duration-300 hover:translate-x-4 hover:shadow-2xl hover:bg-[#1a3f61]"
                  >
                    <div className="absolute -right-4 -top-4 opacity-[0.05] text-[10rem] text-white italic pointer-events-none group-hover:scale-110 transition-transform">⚜️</div>
                    <div className="relative z-10">
                        <h2 className="font-['Montserrat'] text-3xl md:text-4xl font-black text-white group-hover:text-yellow-400 uppercase">{topic.title}</h2>
                        <p className="text-gray-300 mt-2 text-[10px] md:text-xs tracking-widest uppercase font-bold opacity-80">{topic.description}</p>
                    </div>
                    <div className="relative z-10 w-14 h-14 bg-yellow-500 rounded-full flex items-center justify-center text-[#102B45] font-black text-2xl group-hover:scale-110 transition shadow-lg shadow-yellow-500/20">
                        →
                    </div>
                  </Link>
                ))}
            </div>
        </div>
      </main>

      <footer className="bg-[#102B45] text-white py-12 border-t-8 border-yellow-500 mt-auto">
        <div className="container mx-auto px-6 text-center opacity-40 text-[10px] font-black uppercase tracking-[0.5em]">
            © 2026 ТІЛІМ ПЛАТФОРМАСЫ
        </div>
      </footer>
    </div>
  );
};

export default Grades;
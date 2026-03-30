import React from 'react';
import { sections, userStats } from '../data/lessons';
import { Trophy, BookOpen, ChevronRight, Zap } from 'lucide-react';

const Dashboard = () => {
  return (
    <main className="max-w-7xl mx-auto px-6 py-12 bg-white min-h-screen">
      {/* 1. Сәлемдеме және Статистика */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 bg-[#102B45] p-10 rounded-tilim text-white relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-black mb-2 tracking-tighter uppercase">Қайырлы күн, {userStats.name}!</h1>
            <p className="opacity-60 font-medium">Бүгін жаңа білім алуға дайынсың ба? Сенің деңгейің: <span className="text-yellow-500">{userStats.rank}</span></p>
          </div>
          <Zap className="absolute right-[-20px] bottom-[-20px] w-64 h-64 text-white opacity-5 rotate-12" />
        </div>

        <div className="bg-yellow-500 p-10 rounded-tilim flex flex-col justify-center items-center text-[#102B45]">
          <Trophy size={48} className="mb-4" />
          <span className="text-5xl font-black tracking-tighter uppercase">{userStats.points}</span>
          <span className="text-[10px] font-black uppercase tracking-widest mt-2">Жалпы ұпай</span>
        </div>
      </div>

      {/* 2. Прогресс және Бөлімдер */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <h3 className="text-xs font-black text-gray-300 uppercase tracking-[0.3em] mb-8">Оқу барысы</h3>
          <div className="space-y-6">
            {sections.map((section) => (
              <div key={section.id} className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-end mb-4">
                  <h4 className="text-xl font-black text-[#102B45]">{section.title}</h4>
                  <span className="text-xs font-black text-gray-400">{section.progress}%</span>
                </div>
                <div className="w-full bg-gray-50 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#102B45] h-full transition-all duration-1000" 
                    style={{ width: `${section.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Соңғы тақырыптар */}
        <div>
          <h3 className="text-xs font-black text-gray-300 uppercase tracking-[0.3em] mb-8">Жалғастыру</h3>
          <div className="space-y-4">
            {sections[0].topics.slice(0, 3).map((topic) => (
              <div key={topic.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] group cursor-pointer hover:bg-white hover:shadow-lg transition border border-transparent hover:border-gray-100">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${topic.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h5 className="font-black text-[#102B45]">{topic.title}</h5>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{topic.count}</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-300 group-hover:text-[#102B45] group-hover:translate-x-1 transition" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
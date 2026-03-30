import React from 'react'

const TopicCard = ({ title, count }) => {
  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group relative overflow-hidden">
      {/* Декорация (Ою елесі) */}
      <div className="absolute -right-6 -top-6 opacity-[0.03] text-9xl italic font-black text-tilim-blue transition-transform group-hover:scale-110">⚜️</div>
      
      {/* Тақырып */}
      <div className="mb-12">
        <h2 className="text-3xl font-black text-tilim-blue tracking-tighter group-hover:text-tilim-yellow transition-colors">{title}</h2>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 leading-none">{count}</p>
      </div>
      
      {/* Иконкалар мен сілтемелер */}
      <div className="flex gap-8 pt-8 border-t border-gray-50 text-[10px] font-black uppercase tracking-widest">
        <span className="text-blue-500 flex items-center gap-2">📖 Free</span>
        <span className="text-red-500 flex items-center gap-2">🎬 Video</span>
        <span className="text-purple-500 flex items-center gap-2">🎮 Game</span>
      </div>
    </div>
  )
}

export default TopicCard
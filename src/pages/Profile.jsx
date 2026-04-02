import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail');
  const [userData, setUserData] = useState({ full_name: '', city: '', score: 0 });
  const [passData, setPassData] = useState({ old_password: '', new_password: '' });

  // 1. Профиль мәліметтерін тарту
  useEffect(() => {
    if (!userEmail) {
      navigate('/login');
      return;
    }
    fetch(`http://localhost:8080/api/profile?email=${userEmail}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setUserData({ full_name: data.full_name || '', city: data.city || '', score: data.score || 0 });
      });
  }, [userEmail, navigate]);

  // 2. Профильді сақтау (Аты-жөні, Қала)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:8080/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, full_name: userData.full_name, city: userData.city })
    });
    if (res.ok) alert("✅ Жеке мәліметтер сақталды!");
  };

  // 3. Парольді ауыстыру
  const handleChangePassword = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:8080/api/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, old_password: passData.old_password, new_password: passData.new_password })
    });
    const data = await res.json();
    if (res.ok) {
      alert("✅ Құпия сөз ауыстырылды!");
      setPassData({ old_password: '', new_password: '' });
    } else {
      alert("Қате: " + data.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-['Inter'] text-[#102B45] flex flex-col">
      {/* HEADER */}
      <header className="bg-white py-5 shadow-sm">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link to="/"><img src="/logo.png" alt="Tilim" className="h-10 hover:scale-105 transition" /></Link>
          <Link to="/" className="text-sm font-bold text-gray-400 hover:text-[#102B45] uppercase tracking-widest transition">
            <i className="fa-solid fa-arrow-left mr-2"></i> Басты бетке қайту
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-5xl flex-grow animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-4xl font-black uppercase mb-10 tracking-tight">Жеке кабинет</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* СОЛ ЖАҚ: СТАТИСТИКА ЖӘНЕ БЕЙДЖ */}
          <div className="md:col-span-1">
            <div className="bg-[#102B45] rounded-[2.5rem] p-8 text-center text-white shadow-xl relative overflow-hidden">
                <div className="w-24 h-24 bg-white/10 rounded-full mx-auto flex items-center justify-center text-5xl mb-6 shadow-inner">
                    🧑‍🎓
                </div>
                <h2 className="text-xl font-black mb-1">{userData.full_name || "Жаңа оқушы"}</h2>
                <p className="text-yellow-500 text-xs font-bold uppercase tracking-widest mb-8">{userEmail}</p>

                <div className="bg-white/10 p-6 rounded-3xl border border-white/20">
                    <p className="text-[10px] text-gray-300 uppercase tracking-widest font-bold mb-2">Жинаған ұпай</p>
                    <div className="text-5xl font-black text-emerald-400 flex items-center justify-center gap-3">
                        {userData.score} <i className="fa-solid fa-star text-3xl text-yellow-500 drop-shadow-lg"></i>
                    </div>
                </div>
            </div>
          </div>

          {/* ОҢ ЖАҚ: ФОРМАЛАР */}
          <div className="md:col-span-2 space-y-8">
            
            {/* 1. ЖЕКЕ МӘЛІМЕТТЕР */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                <h3 className="text-xl font-black uppercase mb-6 border-l-4 border-yellow-500 pl-4">Мәліметтерді толтыру</h3>
                <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Аты-жөніңіз</label>
                        <input type="text" value={userData.full_name} onChange={e => setUserData({...userData, full_name: e.target.value})} placeholder="Мысалы: Асан Үсенов" className="w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl font-bold focus:ring-2 focus:ring-yellow-500 outline-none transition" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Қала немесе Мектеп</label>
                        <input type="text" value={userData.city} onChange={e => setUserData({...userData, city: e.target.value})} placeholder="Мысалы: Ақтау қаласы, №1 мектеп" className="w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl font-bold focus:ring-2 focus:ring-yellow-500 outline-none transition" />
                    </div>
                    <button type="submit" className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-emerald-600 transition shadow-lg w-full md:w-auto">
                        Сақтау
                    </button>
                </form>
            </div>

            {/* 2. ҚАУІПСІЗДІК (ПАРОЛЬ) */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                <h3 className="text-xl font-black uppercase mb-6 border-l-4 border-red-500 pl-4">Қауіпсіздік</h3>
                <form onSubmit={handleChangePassword} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Ескі құпия сөз</label>
                        <input type="password" required value={passData.old_password} onChange={e => setPassData({...passData, old_password: e.target.value})} placeholder="••••••" className="w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl font-bold focus:ring-2 focus:ring-red-500 outline-none transition" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Жаңа құпия сөз</label>
                        <input type="password" required value={passData.new_password} onChange={e => setPassData({...passData, new_password: e.target.value})} placeholder="Жаңасын жазыңыз" className="w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl font-bold focus:ring-2 focus:ring-red-500 outline-none transition" />
                    </div>
                    <button type="submit" className="bg-gray-800 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black transition shadow-lg w-full md:w-auto">
                        Құпия сөзді жаңарту
                    </button>
                </form>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
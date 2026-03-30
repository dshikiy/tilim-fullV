import React from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="bg-[#102B45] min-h-screen flex items-center justify-center p-6 font-['Inter']">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative">
            
            {/* Декорация */}
            <div className="absolute -top-6 -right-6 text-8xl opacity-5 text-[#102B45] pointer-events-none">⚜️</div>

            <div className="p-10 relative z-10">
                <div className="text-center mb-10">
                    <Link to="/" className="font-['Montserrat'] text-3xl font-black text-[#102B45] inline-block mb-2">
                        <span className="text-yellow-500">⚜️</span> TILIM
                    </Link>
                    <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">Платформаға кіру</p>
                </div>

                <form className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-[#102B45] uppercase mb-2 ml-1">Электронды пошта</label>
                        <div className="relative">
                            <i className="fa-solid fa-envelope absolute left-4 top-4 text-gray-400"></i>
                            <input 
                                type="email" 
                                required 
                                placeholder="example@mail.com" 
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-white transition-all" 
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2 ml-1">
                            <label className="text-xs font-bold text-[#102B45] uppercase">Құпия сөз</label>
                            <a href="#" className="text-[10px] font-bold text-yellow-600 hover:text-yellow-700 uppercase transition">Ұмыттыңыз ба?</a>
                        </div>
                        <div className="relative">
                            <i className="fa-solid fa-lock absolute left-4 top-4 text-gray-400"></i>
                            <input 
                                type="password" 
                                required 
                                placeholder="••••••••" 
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-white transition-all" 
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 ml-1">
                        <input type="checkbox" id="remember" className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500 cursor-pointer" />
                        <label htmlFor="remember" className="text-xs font-medium text-gray-500 cursor-pointer">Мені есте сақта</label>
                    </div>

                    <button type="submit" className="w-full bg-yellow-500 text-[#102B45] font-black py-4 rounded-2xl shadow-lg shadow-yellow-500/20 hover:bg-yellow-400 hover:-translate-y-0.5 transition-all active:scale-95">
                        Жүйеге кіру
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-sm text-gray-500 font-medium">Аккаунтыңыз жоқ па?</p>
                    <Link to="/register" className="text-[#102B45] font-black hover:text-yellow-600 transition underline decoration-yellow-500 decoration-2 underline-offset-4">Тіркелу</Link>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Login;
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Grades from './pages/Grades';
import Section from './pages/Section';
import Topic from './pages/Topic';
import Phonetics from './pages/Phonetics';
import TopicList from './pages/TopicList';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import AIChat from './components/AIChat';
import ChatPage from './pages/ChatPage';

// ОСЫ ЖЕР ТҮЗЕТІЛДІ:
import Games from './pages/Games';
import GroupWork from './pages/GroupWork';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Сыныптар беті (мысалы: /grades/5) */}
        <Route path="/grades/:id" element={<Grades />} />
        <Route path="/chat" element={<ChatPage />} />
        
        {/* Сынып ішіндегі нақты тақырыптар тізімі (мысалы: /grades/5/phonetics) */}
        <Route path="/grades/:gradeId/:topicId" element={<TopicList />} />
        
        {/* Сабақтың өзі (ойыны мен видеосы бар бет). Сізде ол Topic.jsx деп аталып тұр */}
        <Route path="/grades/:gradeId/:topicId/:lessonId" element={<Topic />} />

        {/* Админка және Профиль */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/profile" element={<Profile />} />

        {/* ЖАҢА БЕТТЕР */}
        <Route path="/games" element={<Games />} />
        <Route path="/group-work" element={<GroupWork />} />
        
        {/* Ескі статикалық беттер (керек болса қалдырыңыз) */}
        <Route path="/section" element={<Section />} />
        <Route path="/phonetics" element={<Phonetics />} />
        <Route path="/topic" element={<Topic />} />
      </Routes>
      
      {/* ==================================================== */}
      {/* AI ЧАТ БАРЛЫҚ БЕТТЕ КӨРІНІП ТҰРУЫ ҮШІН ОСЫНДА ТҰРАДЫ */}
      {/* ==================================================== */}
      <AIChat />
      
    </Router>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Grades from './pages/Grades';
import Section from './pages/Section';
import Topic from './pages/Topic';
import Phonetics from './pages/Phonetics';
import TopicList from './pages/TopicList'; // <-- ОСЫ ЖОЛ ҚОСЫЛДЫ! БҰЛ ӨТЕ МАҢЫЗДЫ!
import Admin from './pages/Admin';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Сыныптар беті (мысалы: /grades/5) */}
        <Route path="/grades/:id" element={<Grades />} />
        
        {/* Сынып ішіндегі нақты тақырыптар тізімі (мысалы: /grades/5/phonetics) */}
        <Route path="/grades/:gradeId/:topicId" element={<TopicList />} />
        
        {/* Сабақтың өзі (ойыны мен видеосы бар бет) */}
        <Route path="/topic" element={<Topic />} />

        <Route path="/admin" element={<Admin />} />

        <Route path="/grades/:gradeId/:topicId/:lessonId" element={<Topic />} />

        {/* Ескі статикалық беттер (керек болса қалдырыңыз) */}
        <Route path="/section" element={<Section />} />
        <Route path="/phonetics" element={<Phonetics />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
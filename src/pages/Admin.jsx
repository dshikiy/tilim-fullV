import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
 
const Admin = () => {
  const [grades, setGrades] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lessons');
  const [isAdding, setIsAdding] = useState(false);
  const [viewingUser, setViewingUser] = useState(null); // ПРОФИЛЬ КӨРУ ҮШІН СТЕЙТ
  const navigate = useNavigate();
 
  // СТАТИСТИКА
  const totalStudents = users.length;
  let totalLessons = 0;
  grades.forEach(g => g.topics?.forEach(t => { totalLessons += (t.lessons?.length || 0); }));

  useEffect(() => {
    if (localStorage.getItem('userRole') !== 'admin') {
      navigate('/login');
    } else {
      fetchGrades();
      fetchUsers();
    }
  }, [navigate]);
 
  const fetchGrades = async () => {
    setLoading(true);
    try {
      const res = await Promise.all([5, 6, 7, 8, 9].map(i => fetch(`http://localhost:8080/api/grades/${i}`)));
      const data = await Promise.all(res.map(r => r.ok ? r.json() : null));
      setGrades(data.filter(g => g !== null && !g.error));
    } catch (e) { console.error(e); }
    setLoading(false);
  };
 
  const fetchUsers = () => {
    fetch('http://localhost:8080/api/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error(err));
  };
 
  useEffect(() => {
    if (activeTab === 'students') fetchUsers();
  }, [activeTab]);
 
  const handleDeleteLesson = async (lessonId) => {
    const isConfirmed = window.confirm("Бұл сабақты өшіруге сенімдісіз бе? Оның видеосы мен тесттері біржолата өшеді!");
    if (!isConfirmed) return;
    try {
      const response = await fetch(`http://localhost:8080/api/lessons/${lessonId}`, { method: 'DELETE' });
      if (response.ok) { alert("Сабақ сәтті өшірілді!"); fetchGrades(); }
      else alert("Өшіру мүмкін болмады!");
    } catch { alert("Сервермен байланыс үзілді."); }
  };

  const handleResetPassword = async (userId, userEmail) => {
    if (!window.confirm(`${userEmail} поштасының құпия сөзін "123456" етіп өзгертуге келісесіз бе?`)) return;
    try {
      const res = await fetch(`http://localhost:8080/api/users/${userId}/reset`, { method: 'PUT' });
      if (res.ok) alert("✅ Құпия сөз '123456' болып өзгертілді!");
      else alert("Қате шықты");
    } catch { alert("Сервермен байланыс үзілді"); }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`НАЗАР АУДАРЫҢЫЗ! ${userEmail} оқушысын базадан толық өшіруге сенімдісіз бе?`)) return;
    try {
      const res = await fetch(`http://localhost:8080/api/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        alert("✅ Оқушы сәтті өшірілді!");
        fetchUsers();
      } else alert("Қате шықты");
    } catch { alert("Сервермен байланыс үзілді"); }
  };
 
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [lessonData, setLessonData] = useState({ title: '', slug: '', theory: '', video_url: '' });
  const [imageFile, setImageFile] = useState(null); // СУРЕТ ФАЙЛЫН САҚТАУ ҮШІН
  const [quizzes, setQuizzes] = useState([{ question: '', answers: [{ answer_text: '', is_correct: true }, { answer_text: '', is_correct: false }, { answer_text: '', is_correct: false }, { answer_text: '', is_correct: false }] }]);
 
  const addQuestion = () => setQuizzes([...quizzes, { question: '', answers: [{ answer_text: '', is_correct: true }, { answer_text: '', is_correct: false }, { answer_text: '', is_correct: false }, { answer_text: '', is_correct: false }] }]);
  const removeQuestion = (index) => setQuizzes(quizzes.filter((_, i) => i !== index));
  const setCorrectAnswer = (qIndex, aIndex) => {
    const newQ = [...quizzes];
    newQ[qIndex].answers.forEach((ans, i) => { ans.is_correct = (i === aIndex); });
    setQuizzes(newQ);
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTopic) return alert("Бөлімді таңдаңыз!");

    let uploadedImageUrl = '';
    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);
      try {
        const imgRes = await fetch('http://localhost:8080/api/upload', { method: 'POST', body: formData });
        if (imgRes.ok) {
          const imgData = await imgRes.json();
          uploadedImageUrl = imgData.url;
        }
      } catch (err) { console.error("Сурет жүктеу қатесі:", err); }
    }

    const payload = {
      topic_id: parseInt(selectedTopic),
      title: lessonData.title,
      slug: lessonData.slug,
      theory: lessonData.theory,
      video_url: lessonData.video_url,
      image_url: uploadedImageUrl,
      quizzes
    };

    try {
      const response = await fetch('http://localhost:8080/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        alert("✅ Сабақ сәтті қосылды!");
        setIsAdding(false);
        setImageFile(null);
        setLessonData({ title: '', slug: '', theory: '', video_url: '' });
        setQuizzes([{ question: '', answers: [{ answer_text: '', is_correct: true }, { answer_text: '', is_correct: false }, { answer_text: '', is_correct: false }, { answer_text: '', is_correct: false }] }]);
        fetchGrades();
      } else alert("Қате шықты! Мәліметтерді тексеріңіз.");
    } catch { alert("Сервермен байланыс жоқ!"); }
  };
 
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
 
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
 
        :root {
          --navy: #102B45;
          --navy-dark: #0b1e30;
          --navy-mid: #163752;
          --gold: #EAB308;
          --gold-hover: #FBBF24;
          --sidebar-w: 280px;
        }
 
        .admin-root { display: flex; min-height: 100vh; background: #F1F5F9; font-family: 'Inter', sans-serif; color: var(--navy); }
 
        /* ── SIDEBAR ── */
        .sidebar { width: var(--sidebar-w); background: var(--navy); position: fixed; top: 0; left: 0; bottom: 0; display: flex; flex-direction: column; z-index: 100; overflow: hidden; }
        .sidebar::after { content: ''; position: absolute; top: 0; right: 0; bottom: 0; width: 1px; background: linear-gradient(180deg, transparent, rgba(234,179,8,0.3) 30%, rgba(234,179,8,0.3) 70%, transparent); }
        .sidebar-brand { padding: 28px 28px 24px; border-bottom: 1px solid rgba(255,255,255,0.07); display: flex; align-items: center; gap: 14px; }
        .brand-icon { width: 40px; height: 40px; background: var(--gold); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--navy); font-size: 16px; flex-shrink: 0; }
        .brand-text { display: flex; flex-direction: column; gap: 2px; }
        .brand-name { font-family: 'Montserrat', sans-serif; font-size: 18px; font-weight: 900; color: white; letter-spacing: 0.05em; }
        .brand-name span { color: var(--gold); }
        .brand-sub { font-size: 9px; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(255,255,255,0.3); }
        .sidebar-nav { flex: 1; padding: 20px 16px; display: flex; flex-direction: column; gap: 4px; }
        .nav-btn { background: none; border: none; cursor: pointer; font-family: 'Inter', sans-serif; width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 12px; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.45); transition: all 0.2s; text-align: left; }
        .nav-btn .nav-icon { width: 34px; height: 34px; border-radius: 8px; background: rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center; font-size: 13px; transition: all 0.2s; flex-shrink: 0; }
        .nav-btn:hover { color: white; background: rgba(255,255,255,0.06); }
        .nav-btn:hover .nav-icon { background: rgba(255,255,255,0.1); }
        .nav-btn.active { background: var(--gold); color: var(--navy); }
        .nav-btn.active .nav-icon { background: rgba(16,43,69,0.2); color: var(--navy); }
        .sidebar-footer { padding: 16px; border-top: 1px solid rgba(255,255,255,0.07); display: flex; flex-direction: column; gap: 4px; }
        .sidebar-link { display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 10px; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.3); text-decoration: none; transition: all 0.2s; }
        .sidebar-link:hover { color: white; background: rgba(255,255,255,0.06); }
        .sidebar-link.danger:hover { color: #f87171; background: rgba(248,113,113,0.08); }
 
        /* ── MAIN ── */
        .admin-main { margin-left: var(--sidebar-w); flex: 1; padding: 40px 48px; min-height: 100vh; }
        .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 36px; }
        .page-title { font-family: 'Montserrat', sans-serif; font-size: 28px; font-weight: 900; letter-spacing: -0.02em; text-transform: uppercase; color: var(--navy); }
        .btn-add { display: flex; align-items: center; gap: 8px; background: #10B981; color: white; border: none; cursor: pointer; font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; padding: 12px 24px; border-radius: 12px; transition: all 0.2s; box-shadow: 0 4px 16px rgba(16,185,129,0.25); }
        .btn-add:hover { background: #059669; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(16,185,129,0.35); }
 
        /* ACTION BUTTONS (For Students Table) */
        .action-group { display: flex; gap: 8px; justify-content: flex-end; }
        .btn-action { width: 32px; height: 32px; border-radius: 8px; border: none; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; transition: all 0.2s; }
        .btn-action.blue { background: #EFF6FF; color: #3B82F6; }
        .btn-action.blue:hover { background: #3B82F6; color: white; box-shadow: 0 4px 12px rgba(59,130,246,0.3); }
        .btn-action.yellow { background: #FEF9C3; color: #D97706; }
        .btn-action.yellow:hover { background: #D97706; color: white; box-shadow: 0 4px 12px rgba(217,119,6,0.3); }
        .btn-action.red { background: #FEE2E2; color: #EF4444; }
        .btn-action.red:hover { background: #EF4444; color: white; box-shadow: 0 4px 12px rgba(239,68,68,0.3); }

        /* USER MODAL (Оқушы профилі) */
        .modal-overlay { position: fixed; inset: 0; background: rgba(16,43,69,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 999; }
        .modal-card { background: white; border-radius: 24px; padding: 40px; width: 100%; max-width: 420px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); position: relative; animation: slideUp 0.3s ease; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .modal-close { position: absolute; top: 20px; right: 20px; background: #F1F5F9; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; color: #94A3B8; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
        .modal-close:hover { background: #FEE2E2; color: #EF4444; }
        .modal-header { text-align: center; margin-bottom: 24px; }
        .modal-avatar { width: 80px; height: 80px; background: var(--navy); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; color: white; margin: 0 auto 16px; border: 4px solid #EFF6FF; }
        .modal-name { font-family: 'Montserrat', sans-serif; font-size: 20px; font-weight: 900; color: var(--navy); margin-bottom: 4px; }
        .modal-email { font-size: 12px; font-weight: 600; color: #94A3B8; }
        .modal-details { background: #F8FAFC; border-radius: 16px; padding: 20px; border: 1px solid rgba(16,43,69,0.05); }
        .modal-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed rgba(16,43,69,0.05); font-size: 13px; }
        .modal-row:last-child { border-bottom: none; }
        .modal-label { color: #94A3B8; font-weight: 600; }
        .modal-value { font-weight: 800; color: var(--navy); }
 
        /* Cards */
        .grade-block { background: white; border-radius: 20px; overflow: hidden; border: 1px solid rgba(16,43,69,0.07); margin-bottom: 20px; box-shadow: 0 2px 8px rgba(16,43,69,0.04); }
        .grade-block-header { background: var(--navy); padding: 16px 24px; display: flex; align-items: center; gap: 14px; }
        .grade-badge { width: 36px; height: 36px; background: var(--gold); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 900; color: var(--navy); }
        .grade-block-title { font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 800; color: var(--gold); letter-spacing: 0.05em; text-transform: uppercase; }
        .grade-block-body { padding: 16px; }
        .topic-item { padding: 16px 16px 20px; border-radius: 14px; margin-bottom: 8px; border: 1px solid rgba(16,43,69,0.06); transition: background 0.2s; }
        .topic-item:hover { background: #F8FAFC; }
        .topic-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .topic-name { font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--navy); }
        .lesson-count { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; background: #EFF6FF; color: #3B82F6; padding: 5px 12px; border-radius: 20px; border: 1px solid #DBEAFE; }
        .lessons-list { display: flex; flex-direction: column; gap: 6px; padding-left: 12px; border-left: 3px solid var(--gold); }
        .lesson-row { display: flex; align-items: center; justify-content: space-between; background: white; border: 1px solid rgba(16,43,69,0.08); border-radius: 10px; padding: 10px 14px; transition: border-color 0.2s; }
        .lesson-row:hover { border-color: rgba(234,179,8,0.3); }
        .lesson-title { font-size: 13px; font-weight: 600; color: #334155; display: flex; align-items: center; gap: 12px; }
        .lesson-img-preview { width: 32px; height: 32px; border-radius: 6px; object-fit: cover; background: #F1F5F9; border: 1px solid rgba(16,43,69,0.1); }
        .lesson-title i { color: #CBD5E1; font-size: 10px; }
        .btn-delete { background: none; border: none; cursor: pointer; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #CBD5E1; font-size: 13px; transition: all 0.2s; opacity: 0; }
        .lesson-row:hover .btn-delete { opacity: 1; }
        .btn-delete:hover { color: #EF4444; background: #FEE2E2; }
 
        /* Students table */
        .table-card { background: white; border-radius: 20px; overflow: hidden; border: 1px solid rgba(16,43,69,0.07); box-shadow: 0 2px 8px rgba(16,43,69,0.04); }
        table { width: 100%; border-collapse: collapse; }
        thead { background: #F8FAFC; border-bottom: 1px solid rgba(16,43,69,0.07); }
        th { padding: 16px 20px; font-size: 10px; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; color: #94A3B8; text-align: left; }
        td { padding: 16px 20px; border-bottom: 1px solid rgba(16,43,69,0.05); vertical-align: middle; }
        tbody tr:last-child td { border-bottom: none; }
        tbody tr:hover td { background: #F8FAFC; }
        .td-id { font-size: 10px; font-weight: 700; color: #94A3B8; margin-bottom: 2px; }
        .td-email { font-size: 13px; font-weight: 700; color: var(--navy); }
        .td-name { font-size: 13px; font-weight: 600; color: #475569; }
        .td-city { font-size: 12px; color: #94A3B8; }
        .score-badge { display: inline-flex; align-items: center; gap: 6px; background: #FEF9C3; color: #854D0E; border: 1px solid #FDE68A; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; }
 
        /* Stats Section */
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .stat-card { background: white; border-radius: 20px; padding: 32px; display: flex; align-items: center; gap: 24px; border: 1px solid rgba(16,43,69,0.07); box-shadow: 0 4px 12px rgba(16,43,69,0.05); }
        .stat-icon { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; }
        .stat-icon.blue { background: #EFF6FF; color: #3B82F6; }
        .stat-icon.green { background: #ECFDF5; color: #10B981; }
        .stat-info h3 { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #94A3B8; letter-spacing: 0.1em; margin-bottom: 4px; }
        .stat-info p { font-family: 'Montserrat', sans-serif; font-size: 36px; font-weight: 900; color: var(--navy); line-height: 1; }
 
        /* ── FORM ── */
        .form-card { background: white; border-radius: 24px; padding: 48px; max-width: 860px; border: 1px solid rgba(16,43,69,0.07); box-shadow: 0 8px 32px rgba(16,43,69,0.08); }
        .form-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 36px; padding-bottom: 28px; border-bottom: 1px solid rgba(16,43,69,0.07); }
        .form-title { font-family: 'Montserrat', sans-serif; font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.01em; color: var(--navy); border-left: 5px solid var(--gold); padding-left: 16px; }
        .btn-cancel { background: none; border: 1px solid rgba(16,43,69,0.12); cursor: pointer; font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #94A3B8; padding: 9px 20px; border-radius: 10px; transition: all 0.2s; }
        .btn-cancel:hover { border-color: #EF4444; color: #EF4444; }
        .form-block { background: #F8FAFC; border: 1px solid rgba(16,43,69,0.07); border-radius: 16px; padding: 28px; margin-bottom: 28px; }
        .form-block-title { font-size: 11px; font-weight: 800; letter-spacing: 0.25em; text-transform: uppercase; color: var(--navy); margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
        .form-block-title i { color: var(--gold); }
        .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #94A3B8; }
        .form-input, .form-select, .form-textarea, .form-file { font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; color: var(--navy); background: white; border: 1.5px solid rgba(16,43,69,0.1); border-radius: 12px; padding: 13px 16px; transition: border-color 0.2s, box-shadow 0.2s; outline: none; width: 100%; }
        .form-file { padding: 10px 16px; background: #fff; cursor: pointer; }
        .form-file::file-selector-button { background: var(--gold); color: var(--navy); border: none; padding: 6px 12px; border-radius: 8px; font-weight: 800; font-size: 11px; cursor: pointer; margin-right: 12px; text-transform: uppercase; }
        .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(234,179,8,0.12); }
        .form-textarea { resize: vertical; min-height: 100px; line-height: 1.6; }
        .form-select:disabled { opacity: 0.5; cursor: not-allowed; }
 
        /* Quiz block */
        .quiz-block { background: var(--navy); border-radius: 20px; padding: 32px; margin-bottom: 28px; }
        .quiz-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .quiz-title { font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: var(--gold); display: flex; align-items: center; gap: 8px; }
        .quiz-count { background: rgba(255,255,255,0.08); color: rgba(234,179,8,0.8); font-size: 11px; font-weight: 700; padding: 5px 14px; border-radius: 20px; letter-spacing: 0.1em; }
        .quiz-item { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 24px; margin-bottom: 16px; position: relative; }
        .quiz-item-label { font-size: 10px; font-weight: 700; letter-spacing: 0.25em; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 10px; }
        .quiz-input { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; color: white; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 12px 16px; width: 100%; outline: none; transition: border-color 0.2s; margin-bottom: 16px; }
        .quiz-input:focus { border-color: var(--gold); }
        .answers-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .answer-opt { position: relative; cursor: pointer; border: 2px solid transparent; border-radius: 12px; padding: 2px; transition: all 0.2s; }
        .answer-opt.correct { border-color: #10B981; background: rgba(16,185,129,0.08); }
        .answer-opt input { font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; color: white; background: rgba(0,0,0,0.2); border: none; border-radius: 10px; padding: 11px 14px; width: 100%; outline: none; }
        .correct-badge { position: absolute; top: -8px; right: -6px; background: #10B981; color: white; font-size: 9px; font-weight: 800; letter-spacing: 0.1em; padding: 3px 8px; border-radius: 20px; display: flex; align-items: center; gap: 4px; }
        .btn-remove-q { position: absolute; top: -10px; right: -10px; width: 28px; height: 28px; background: #EF4444; border: none; border-radius: 50%; cursor: pointer; color: white; font-size: 11px; font-weight: 900; display: flex; align-items: center; justify-content: center; opacity: 0; transition: all 0.2s; box-shadow: 0 3px 8px rgba(239,68,68,0.4); }
        .quiz-item:hover .btn-remove-q { opacity: 1; }
        .btn-add-q { width: 100%; background: none; border: 2px dashed rgba(255,255,255,0.15); border-radius: 14px; color: rgba(255,255,255,0.35); cursor: pointer; font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; padding: 16px; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-add-q:hover { border-color: var(--gold); color: var(--gold); }
        .btn-submit { width: 100%; background: var(--gold); color: var(--navy); border: none; cursor: pointer; font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase; padding: 18px 40px; border-radius: 14px; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 12px; box-shadow: 0 8px 24px rgba(234,179,8,0.3); }
        .btn-submit:hover { background: var(--gold-hover); transform: translateY(-2px); box-shadow: 0 16px 36px rgba(234,179,8,0.4); }
        .btn-submit i { font-size: 16px; }
        .loading-text { font-family: 'Montserrat', sans-serif; font-size: 16px; font-weight: 700; color: var(--navy); opacity: 0.5; padding: 40px 0; }
      `}</style>
 
      {/* ПРОФИЛЬ КӨРУ МОДАЛЬДЫ ТЕРЕЗЕСІ */}
      {viewingUser && (
        <div className="modal-overlay" onClick={() => setViewingUser(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setViewingUser(null)}><i className="fa-solid fa-xmark"></i></button>
            <div className="modal-header">
              <div className="modal-avatar"><i className="fa-solid fa-user-graduate"></i></div>
              <h2 className="modal-name">{viewingUser.full_name || "Толтырылмаған"}</h2>
              <p className="modal-email">{viewingUser.email}</p>
            </div>
            <div className="modal-details">
              <div className="modal-row">
                <span className="modal-label">ID нөмірі:</span>
                <span className="modal-value">#{viewingUser.id}</span>
              </div>
              <div className="modal-row">
                <span className="modal-label">Рөлі:</span>
                <span className="modal-value" style={{textTransform:'capitalize'}}>{viewingUser.role}</span>
              </div>
              <div className="modal-row">
                <span className="modal-label">Қала / Мектеп:</span>
                <span className="modal-value">{viewingUser.city || "Көрсетілмеген"}</span>
              </div>
              <div className="modal-row">
                <span className="modal-label">Жалпы рейтинг:</span>
                <span className="modal-value" style={{color:'#D97706'}}><i className="fa-solid fa-star"></i> {viewingUser.score} ұпай</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="admin-root">
 
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="brand-icon"><i className="fa-solid fa-shield-halved" /></div>
            <div className="brand-text">
              <div className="brand-name"><span>TILIM</span></div>
              <div className="brand-sub">Басқару панелі</div>
            </div>
          </div>
 
          <nav className="sidebar-nav">
            {[
              { id: 'lessons', icon: 'fa-solid fa-layer-group', label: 'Сабақтар' },
              { id: 'students', icon: 'fa-solid fa-users', label: 'Оқушылар' },
              { id: 'stats', icon: 'fa-solid fa-chart-pie', label: 'Статистика' },
            ].map(item => (
              <button
                key={item.id}
                className={`nav-btn ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => { setActiveTab(item.id); setIsAdding(false); }}
              >
                <span className="nav-icon"><i className={item.icon} /></span>
                {item.label}
              </button>
            ))}
          </nav>
 
          <div className="sidebar-footer">
            <Link to="/" className="sidebar-link">
              <i className="fa-solid fa-arrow-left" /> Платформаға қайту
            </Link>
            <button
              className="sidebar-link danger"
              style={{background:'none',border:'none',cursor:'pointer',fontFamily:'Inter,sans-serif',width:'100%',textAlign:'left'}}
              onClick={() => { localStorage.clear(); navigate('/login'); }}
            >
              <i className="fa-solid fa-power-off" /> Жүйеден шығу
            </button>
          </div>
        </aside>
 
        {/* MAIN */}
        <main className="admin-main">
 
          {/* STUDENTS */}
          {activeTab === 'students' && (
            <div>
              <div className="page-header">
                <h1 className="page-title">Тіркелген оқушылар</h1>
              </div>
              <div className="table-card">
                <table>
                  <thead>
                    <tr>
                      <th>ID / Email</th>
                      <th>Аты-жөні</th>
                      <th>Қала</th>
                      <th>Рейтинг</th>
                      <th style={{textAlign:'right'}}>Басқару</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? users.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div className="td-id">#{u.id}</div>
                          <div className="td-email">{u.email}</div>
                        </td>
                        <td className="td-name">{u.full_name || 'Толтырылмаған'}</td>
                        <td className="td-city">{u.city || '—'}</td>
                        <td>
                          <span className="score-badge">
                            <i className="fa-solid fa-star" /> {u.score} ұпай
                          </span>
                        </td>
                        <td style={{textAlign:'right'}}>
                          <div className="action-group">
                            <button className="btn-action blue" onClick={() => setViewingUser(u)} title="Профильді көру">
                              <i className="fa-solid fa-eye" />
                            </button>
                            <button className="btn-action yellow" onClick={() => handleResetPassword(u.id, u.email)} title="Парольді сброс жасау">
                              <i className="fa-solid fa-unlock-keyhole" />
                            </button>
                            <button className="btn-action red" onClick={() => handleDeleteUser(u.id, u.email)} title="Оқушыны толық өшіру">
                              <i className="fa-solid fa-trash-can" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" style={{textAlign:'center',padding:'48px',color:'#CBD5E1',fontWeight:600}}>
                          Оқушылар әлі тіркелмеген
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
 
          {/* STATS (ЖАҢАРТЫЛҒАН НАҚТЫ ЦИФРЛАР) */}
          {activeTab === 'stats' && (
            <div>
              <div className="page-header">
                <h1 className="page-title">Платформа статистикасы</h1>
              </div>
              
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon blue"><i className="fa-solid fa-users" /></div>
                  <div className="stat-info">
                    <h3>Жалпы оқушы саны</h3>
                    <p>{totalStudents}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon green"><i className="fa-solid fa-book-open" /></div>
                  <div className="stat-info">
                    <h3>Жүктелген сабақтар</h3>
                    <p>{totalLessons}</p>
                  </div>
                </div>
              </div>
              
            </div>
          )}
 
          {/* LESSONS LIST */}
          {activeTab === 'lessons' && !isAdding && (
            <div>
              <div className="page-header">
                <h1 className="page-title">Оқу базасы</h1>
                <button className="btn-add" onClick={() => setIsAdding(true)}>
                  <i className="fa-solid fa-plus" /> Материал жүктеу
                </button>
              </div>
 
              {loading ? (
                <p className="loading-text">Базадан жүктелуде…</p>
              ) : (
                grades.map((grade) => (
                  <div key={grade.id} className="grade-block">
                    <div className="grade-block-header">
                      <div className="grade-badge">{grade.id}</div>
                      <span className="grade-block-title">сынып</span>
                    </div>
                    <div className="grade-block-body">
                      {grade.topics?.map(topic => (
                        <div key={topic.id} className="topic-item">
                          <div className="topic-header">
                            <div>
                              <div className="topic-name">{topic.title}</div>
                              {topic.description && (
                                <div style={{fontSize:'11px',color:'#94A3B8',marginTop:'3px'}}>{topic.description}</div>
                              )}
                            </div>
                            <span className="lesson-count">{topic.lessons?.length || 0} сабақ</span>
                          </div>
                          {topic.lessons?.length > 0 && (
                            <div className="lessons-list">
                              {topic.lessons.map(lesson => (
                                <div key={lesson.id} className="lesson-row">
                                  <span className="lesson-title">
                                    {lesson.image_url ? (
                                      <img src={lesson.image_url} alt="cover" className="lesson-img-preview" />
                                    ) : (
                                      <i className="fa-solid fa-play" style={{marginRight: '4px'}} />
                                    )}
                                    {lesson.title}
                                  </span>
                                  <button className="btn-delete" onClick={() => handleDeleteLesson(lesson.id)} title="Өшіру">
                                    <i className="fa-solid fa-trash-can" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
 
          {/* ADD FORM */}
          {activeTab === 'lessons' && isAdding && (
            <form onSubmit={handleSubmit}>
              <div className="page-header">
                <h1 className="page-title">Сабақ құрастыру</h1>
              </div>
 
              <div className="form-card">
                <div className="form-header">
                  <div className="form-title">Жаңа сабақ</div>
                  <button type="button" className="btn-cancel" onClick={() => setIsAdding(false)}>
                    ✖ Болдырмау
                  </button>
                </div>
 
                {/* Location */}
                <div className="form-block">
                  <div className="form-block-title">
                    <i className="fa-solid fa-folder-tree" /> 1. Орналасатын жері
                  </div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Қай сынып?</label>
                      <select
                        className="form-select"
                        value={selectedGrade}
                        onChange={(e) => { setSelectedGrade(e.target.value); setSelectedTopic(''); }}
                      >
                        <option value="">— Сыныпты таңдаңыз —</option>
                        {grades.map(g => <option key={g.id} value={g.id}>{g.id}-сынып</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Қай бөлім?</label>
                      <select
                        className="form-select"
                        required
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        disabled={!selectedGrade}
                      >
                        <option value="">— Бөлімді таңдаңыз —</option>
                        {grades.find(g => g.id.toString() === selectedGrade)?.topics?.map(t => (
                          <option key={t.id} value={t.id}>{t.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
 
                {/* Content */}
                <div className="form-block">
                  <div className="form-block-title">
                    <i className="fa-solid fa-file-lines" /> 2. Сабақ мазмұны
                  </div>
                  
                  <div className="form-grid-2" style={{marginBottom:'16px'}}>
                    <div className="form-group">
                      <label className="form-label">Сабақ тақырыбы</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        placeholder="Мысалы: Дыбыс және әріп"
                        value={lessonData.title}
                        onChange={e => setLessonData({ ...lessonData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Сілтеме аты (slug)</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        placeholder="mysaly-dybys"
                        value={lessonData.slug}
                        onChange={e => setLessonData({ ...lessonData, slug: e.target.value.toLowerCase() })}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{marginBottom:'16px'}}>
                    <label className="form-label">Теориялық түсіндірме</label>
                    <textarea
                      required
                      className="form-textarea"
                      placeholder="Конспект мәтінін осында жазыңыз..."
                      value={lessonData.theory}
                      onChange={e => setLessonData({ ...lessonData, theory: e.target.value })}
                    />
                  </div>

                  {/* ВИДЕО ЖӘНЕ ФОТО ЖҮКТЕУ */}
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">YouTube Embed сілтемесі</label>
                      <input
                        type="url"
                        required
                        className="form-input"
                        placeholder="https://www.youtube.com/embed/..."
                        value={lessonData.video_url}
                        onChange={e => setLessonData({ ...lessonData, video_url: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Сабақтың мұқабасы (Сурет қосу)</label>
                      <input
                        type="file"
                        accept="image/*"
                        className="form-file"
                        onChange={e => setImageFile(e.target.files[0])}
                      />
                    </div>
                  </div>

                </div>
 
                {/* Quizzes */}
                <div className="quiz-block">
                  <div className="quiz-header">
                    <div className="quiz-title"><i className="fa-solid fa-gamepad" /> 3. Тест сұрақтары</div>
                    <span className="quiz-count">{quizzes.length} сұрақ</span>
                  </div>
 
                  {quizzes.map((quiz, qIndex) => (
                    <div key={qIndex} className="quiz-item">
                      {quizzes.length > 1 && (
                        <button type="button" className="btn-remove-q" onClick={() => removeQuestion(qIndex)}>✖</button>
                      )}
                      <div className="quiz-item-label">Сұрақ {qIndex + 1}</div>
                      <input
                        type="text"
                        required
                        className="quiz-input"
                        placeholder="Сұрақты осында жазыңыз..."
                        value={quiz.question}
                        onChange={e => {
                          const newQ = [...quizzes];
                          newQ[qIndex].question = e.target.value;
                          setQuizzes(newQ);
                        }}
                      />
                      <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:'rgba(255,255,255,0.3)',marginBottom:'10px'}}>
                        Дұрыс жауапты басып белгілеңіз
                      </div>
                      <div className="answers-grid">
                        {quiz.answers.map((ans, aIndex) => (
                          <div
                            key={aIndex}
                            className={`answer-opt ${ans.is_correct ? 'correct' : ''}`}
                            onClick={() => setCorrectAnswer(qIndex, aIndex)}
                          >
                            {ans.is_correct && (
                              <span className="correct-badge"><i className="fa-solid fa-check" /> Дұрыс</span>
                            )}
                            <input
                              type="text"
                              required
                              placeholder={`Нұсқа ${aIndex + 1}`}
                              value={ans.answer_text}
                              onChange={e => {
                                const newQ = [...quizzes];
                                newQ[qIndex].answers[aIndex].answer_text = e.target.value;
                                setQuizzes(newQ);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
 
                  <button type="button" className="btn-add-q" onClick={addQuestion}>
                    <i className="fa-solid fa-plus" /> Тағы бір сұрақ қосу
                  </button>
                </div>
 
                <button type="submit" className="btn-submit">
                  <i className="fa-solid fa-cloud-arrow-up" /> Платформаға жүктеу
                </button>
              </div>
            </form>
          )}
 
        </main>
      </div>
    </>
  );
};
 
export default Admin;
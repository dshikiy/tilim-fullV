export const grade5 = {
  // 1. Бөлімдер (Grades.jsx үшін)
  sections: {
    title: "5-сынып",
    subtitle: "ПӘНДІК БАҒДАРЛАМА БОЙЫНША 3 НЕГІЗГІ БӨЛІМ",
    topics: [
      { title: "ФОНЕТИКА", desc: "ДЫБЫС, БУЫН, ҮНДЕСТІК ЗАҢЫ (12 САБАҚ)", path: "/grades/5/phonetics" },
      { title: "МОРФОЛОГИЯ", desc: "ТҮБІР МЕН ҚОСЫМША, ЖҰРНАҚ (8 САБАҚ)", path: "/grades/5/morphology" },
      { title: "СӨЗ ТАБЫ", desc: "ЗАТ ЕСІМ, СЫН ЕСІМ, САН ЕСІМ (9 САБАҚ)", path: "/grades/5/section" }
    ]
  },
  
  // 2. Сабақтар тізімі (TopicList.jsx үшін)
  lessons: {
    "phonetics": {
      title: "Фонетика",
      list: [
        { id: "fonetika-dybys", name: "Дыбыс пен әріп, алфавит", count: "2 сабақ" },
        { id: "dauysty", name: "Дауысты дыбыстар", count: "4 сабақ" },
        { id: "dauyssyz", name: "Дауыссыз дыбыстар", count: "3 сабақ" },
        { id: "buyn", name: "Буын және тасымал", count: "2 сабақ" },
        { id: "undestik", name: "Үндестік заңы (Сингармонизм)", count: "4 сабақ" }
      ]
    },
    "morphology": {
      title: "Морфология",
      list: [
        { id: "tubir-qosymsha", name: "Түбір мен қосымша", count: "3 сабақ" },
        { id: "zhurnaq", name: "Сөз тудырушы және форма тудырушы жұрнақ", count: "3 сабақ" },
        { id: "zhalgau", name: "Жалғаудың түрлері", count: "4 сабақ" }
      ]
    },
    "section": {
      title: "Сөз табы",
      list: [
        { id: "zat-esim", name: "Зат есім: Жалпы және жалқы есім", count: "3 сабақ" },
        { id: "syn-esim", name: "Сын есім: Сапалық және қатыстық", count: "3 сабақ" },
        { id: "san-esim", name: "Сан есім және оның түрлері", count: "3 сабақ" }
      ]
    }
  },

  // 3. Нақты сабақ мазмұны (Topic.jsx үшін - Ереже, Видео, Ойын)
  content: {
    "fonetika-dybys": {
      title: "Дыбыс пен әріп",
      theory: "Дыбыс — сөздің ең кішкене бөлшегі. Біз дыбысты айтамыз және естиміз. Ал әріп — дыбыстың жазудағы таңбасы. Әріпті біз көреміз және жазамыз. Қазақ алфавитінде 42 әріп бар.",
      videoLocked: false,
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      quiz: [
        {
          question: "Дыбыс дегеніміз не?",
          answers: [
            { text: "Жазудағы таңба", correct: false },
            { text: "Сөздің ең кішкене бөлшегі", correct: true },
            { text: "Сөйлемнің мүшесі", correct: false },
            { text: "Мағыналы сөз", correct: false }
          ]
        },
        {
          question: "Қазақ алфавитінде неше әріп бар?",
          answers: [
            { text: "40", correct: false },
            { text: "42", correct: true },
            { text: "38", correct: false },
            { text: "33", correct: false }
          ]
        }
      ]
    },
    "zat-esim": {
      title: "Зат есім",
      theory: "Зат есім — заттың, құбылыстың атын білдіріп, кім? не? деген сұрақтарға жауап беретін сөз табы. Мысалы: Абай (кім?), кітап (не?), жаңбыр (не?). Зат есімдер тұлғасына қарай: негізгі және туынды болып екіге бөлінеді.",
      videoLocked: true, // Бұл видео жабық тұрады
      quiz: [
        {
          question: "Төмендегі сөздердің қайсысы зат есім?",
          answers: [
            { text: "Мектеп", correct: true },
            { text: "Керемет", correct: false },
            { text: "Оқу", correct: false },
            { text: "Ол", correct: false }
          ]
        },
        {
          question: "\"Кітап\" сөзі қай сұраққа жауап береді?",
          answers: [
            { text: "Кім?", correct: false },
            { text: "Не?", correct: true },
            { text: "Қандай?", correct: false },
            { text: "Қайда?", correct: false }
          ]
        }
      ]
    }
  }
};
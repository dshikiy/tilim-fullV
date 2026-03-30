export const allGradesData = {
  "5": {
    sections: {
      title: "5-сынып",
      subtitle: "ПӘНДІК БАҒДАРЛАМА БОЙЫНША 3 НЕГІЗГІ БӨЛІМ",
      topics: [
        { title: "ФОНЕТИКА", desc: "ДЫБЫС, БУЫН, ҮНДЕСТІК ЗАҢЫ", path: "/grades/5/phonetics" },
        { title: "МОРФОЛОГИЯ", desc: "ТҮБІР МЕН ҚОСЫМША, ЖҰРНАҚ", path: "/grades/5/morphology" },
        { title: "СӨЗ ТАБЫ", desc: "ЗАТ ЕСІМ, СЫН ЕСІМ, САН ЕСІМ", path: "/grades/5/section" }
      ]
    },
    lessons: {
      "phonetics": {
        title: "Фонетика",
        list: [
          { id: "fonetika-dybys", name: "Дыбыс пен әріп, алфавит", count: "2 сабақ" },
          { id: "dauysty", name: "Дауысты дыбыстар", count: "4 сабақ" }
        ]
      },
      "section": {
        title: "Сөз табы",
        list: [
          { id: "zat-esim", name: "Зат есім", count: "3 сабақ" }
        ]
      }
    },
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
          }
        ]
      },
      "zat-esim": {
        title: "Зат есім",
        theory: "Зат есім — заттың, құбылыстың атын білдіріп, кім? не? деген сұрақтарға жауап беретін сөз табы.",
        videoLocked: true,
        quiz: [
          {
            question: "Төмендегі сөздердің қайсысы зат есім?",
            answers: [
              { text: "Мектеп", correct: true },
              { text: "Керемет", correct: false }
            ]
          }
        ]
      }
    }
  },
  "6": { sections: { title: "6-сынып", subtitle: "ЛЕКСИКА", topics: [] }, lessons: {}, content: {} },
  "7": { sections: { title: "7-сынып", subtitle: "ҮСТЕУ", topics: [] }, lessons: {}, content: {} },
  "8": { sections: { title: "8-сынып", subtitle: "СИНТАКСИС", topics: [] }, lessons: {}, content: {} },
  "9": { sections: { title: "9-сынып", subtitle: "ҚҰРМАЛАС СӨЙЛЕМ", topics: [] }, lessons: {}, content: {} }
};
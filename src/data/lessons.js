export const sections = [
  {
    id: "soz-taby",
    title: "Сөз табы",
    grade: 5,
    progress: 45, // Оқушының осы бөлімдегі прогресі (%)
    topics: [
      { id: "zat-esim", title: "Зат есім", count: "9 тарауша", status: "completed" },
      { id: "syn-esim", title: "Сын есім", count: "12 тарауша", status: "in-progress" },
      { id: "san-esim", title: "Сан есім", count: "6 тарауша", status: "locked" },
    ]
  },
  {
    id: "phonetics",
    title: "Фонетика",
    grade: 5,
    progress: 80,
    topics: [
      { id: "dybys", title: "Дыбыс пен әріп", count: "2 тарауша", status: "completed" },
    ]
  }
];

export const userStats = {
  name: "Нарцисс Муса",
  points: 1250,
  rank: "Алтын ізденуші",
  avatar: "Н"
};
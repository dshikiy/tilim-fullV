package main

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// =================== WEBSOCKET БАПТАУЛАРЫ ===================
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // CORS рұқсат беру
	},
}

type Room struct {
	Clients map[*websocket.Conn]string // Connection -> Username
	Mutex   sync.Mutex
}

var rooms = make(map[string]*Room)
var roomsMutex sync.Mutex

// =================== ЖАҢА МОДЕЛЬДЕР ===================

type AIChat struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserEmail string    `json:"user_email"`
	Role      string    `json:"role"` // "user" немесе "ai"
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"created_at"`
}

// ЖАҢА МОДЕЛЬ: Грамматика ережелері (ИИ үшін базадағы шпаргалка)
type GrammarRule struct {
	ID       uint   `json:"id" gorm:"primaryKey"`
	Topic    string `json:"topic"`
	Keywords string `json:"keywords"` // Іздеуге арналған кілт сөздер (үтірмен бөлінген)
	Content  string `json:"content"`  // Ереженің толық мәтіні
}

type RoomHistory struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	RoomCode  string    `json:"room_code"`
	UserName  string    `json:"user_name"`
	Type      string    `json:"type"` // "chat" немесе "draw"
	Data      string    `json:"data"` 
	CreatedAt time.Time `json:"created_at"`
}

// =================== МОДЕЛЬДЕР (БАЗА КЕСТЕЛЕРІ) ===================
type CustomGame struct {
	ID          uint   `json:"id"`
	AuthorEmail string `json:"author_email"`
	AuthorName  string `json:"author_name"`
	Type        int    `json:"type"`
	Title       string `json:"title"`
	Questions   string `json:"questions"`
	IsPublic    bool   `json:"is_public"`
}

type User struct {
	ID               uint       `json:"id"`
	Email            string     `json:"email"`
	Password         string     `json:"password"`
	Role             string     `json:"role"` // "admin" немесе "student"
	FullName         string     `json:"full_name"`
	City             string     `json:"city"`
	Score            int        `json:"score"`
	CompletedLessons int        `json:"completed_lessons"`
	Accuracy         int        `json:"accuracy"`
	Activities       []Activity `json:"history" gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE;"`
}

type Activity struct {
	ID     uint   `json:"id"`
	UserID uint   `json:"user_id"`
	Title  string `json:"title"`
	Date   string `json:"date"`
	Points int    `json:"points"`
	Type   string `json:"type"`
}

type Grade struct {
	ID       uint    `json:"id"`
	Title    string  `json:"title"`
	Subtitle string  `json:"subtitle"`
	Topics   []Topic `json:"topics" gorm:"foreignKey:GradeID;constraint:OnDelete:CASCADE;"`
}

type Topic struct {
	ID          uint     `json:"id"`
	GradeID     uint     `json:"grade_id"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Slug        string   `json:"slug"`
	Lessons     []Lesson `json:"lessons" gorm:"foreignKey:TopicID;constraint:OnDelete:CASCADE;"`
}

type Lesson struct {
	ID          uint   `json:"id"`
	TopicID     uint   `json:"topic_id"`
	Title       string `json:"title"`
	Theory      string `json:"theory"`
	VideoURL    string `json:"video_url"`
	ImageURL    string `json:"image_url"`
	VideoLocked bool   `json:"video_locked"`
	Slug        string `json:"slug"`
	Quizzes     []Quiz `json:"quizzes" gorm:"foreignKey:LessonID;constraint:OnDelete:CASCADE;"`
}

type Quiz struct {
	ID       uint         `json:"id"`
	LessonID uint         `json:"lesson_id"`
	Question string       `json:"question"`
	Answers  []QuizAnswer `json:"answers" gorm:"foreignKey:QuizID;constraint:OnDelete:CASCADE;"`
}

type QuizAnswer struct {
	ID         uint   `json:"id"`
	QuizID     uint   `json:"quiz_id"`
	AnswerText string `json:"answer_text"`
	IsCorrect  bool   `json:"is_correct"`
}

var DB *gorm.DB

// =================== БАЗАНЫ АВТОМАТТЫ ТОЛТЫРУ ===================

func seedGrammarRules(db *gorm.DB) {
	var count int64
	db.Model(&GrammarRule{}).Count(&count)
	if count == 0 {
		rules := []GrammarRule{
			{
				Topic:    "Сөз тіркесінің байланысу тәсілдері (8-сынып)",
				Keywords: "сөз тіркесі,байланысу тәсілдері,қиысу,матасу,қабысу,меңгеру,жанасу",
				Content: `Қазақ тілінде сөздердің байланысуының бес түрі бар:
1. Қиысу: Баяндауыштың бастауышпен жақ жағынан үйлесе байланысуы (Мысалы: Мен жазамын, Сен келдің).
2. Матасу: Ілік септігіндегі сөздің тәуелдік жалғауындағы сөзбен байланысуы (Мысалы: біздің ауыл, оның дәптері).
3. Қабысу: Бағыныңқы сөздің басыңқы сөзбен атау тұлғада тұрып жалғаусыз, орын тәртібі арқылы байланысуы (Мысалы: ағаш күрек, мөлдір су, тез оқу).
4. Жанасу: Басыңқы сөзбен қатар тұратын атау тұлғадағы бағыныңқы сөздің алшақ тұрып-ақ еркін байланысуы. Көбіне үстеу не еліктеуіш сөздер етістікпен жанасады (Мысалы: Қар жапалақтап жауды. Кеше келді).
5. Меңгеру: Бағыныңқы сөздің басыңқы сөзбен ілік септігінен басқа септік жалғауларының бірінде тұрып байланысуы (Мысалы: қалаға кету (барыс), суыққа төзімді, жұмыста болу).`,
			},
			{
				Topic:    "Сөйлем мүшелері (8-сынып)",
				Keywords: "сөйлем мүшесі,тұрлаулы,тұрлаусыз,бастауыш,баяндауыш,анықтауыш,толықтауыш,пысықтауыш",
				Content: `Сөйлем мүшелері тұрлаулы (бастауыш, баяндауыш) және тұрлаусыз (анықтауыш, толықтауыш, пысықтауыш) болып бөлінеді.
1. Бастауыш: Кім? Не? сұрақтарына жауап береді. Іс-әрекеттің иесі.
2. Баяндауыш: Не істеді? Қандай? Бастауыштың ісін білдіріп, ойды тиянақтайды.
3. Анықтауыш: Заттың сынын, сапасын, меншіктілігін білдіреді. Қандай? Қай? Кімнің? сұрақтары. Сын есімнен немесе ілік септігінен жасалады.
4. Толықтауыш: Атау мен іліктен басқа септікте тұрып, қимылдың нысанын білдіреді (Кімді? Нені? Кімге? Кімнен? т.б.).
5. Пысықтауыш: Қимылдың мезгілін, мекенін, мақсатын, себебін, амалын білдіреді (Қалай? Қашан? Қайда? Неліктен?).`,
			},
			{
				Topic:    "Құрмалас сөйлем: Салалас және Сабақтас (9-сынып)",
				Keywords: "құрмалас,салалас,сабақтас,ыңғайлас,қарсылықты,себеп-салдар,талғаулы,кезектес,түсіндірмелі,аралас",
				Content: `Құрмалас сөйлем құрамындағы жай сөйлемдердің байланысуына қарай Салалас, Сабақтас және Аралас болып бөлінеді.
Салалас құрмалас сөйлем (сыңарлары тең дәрежеде байланысады):
1. Ыңғайлас (және, әрі, да, де): Оқиғалар бір мезгілде өтеді.
2. Қарсылықты (бірақ, алайда, дегенмен): Ойлар қарама-қарсы.
3. Себеп-салдар (өйткені, себебі, сондықтан).
4. Түсіндірмелі (үнемі жалғаулықсыз, қос нүкте арқылы): Екінші сөйлем біріншіні түсіндіреді.
5. Талғаулы (не, немесе, я, яки): Екі істің бірі орындалады.
6. Кезектес (бірде, біресе, кейде): Іс-әрекет кезектесіп өтеді.
Сабақтас құрмалас сөйлем (алғашқысы бағыныңқы, соңғысы басыңқы болады): Мезгіл, Шартты (-са, -се), Қарсылықты, Себеп, Қимыл-сын, Мақсат бағыныңқылы болып бөлінеді.`,
			},
			{
				Topic:    "Етістіктің түрлері, райлары және шақтары (7-сынып)",
				Keywords: "етістік,тұйық етістік,есімше,көсемше,шақтар,өткен шақ,осы шақ,келер шақ,райлар,ашық рай,бұйрық рай,шартты рай,қалау рай,салт,сабақты,өзгелік,өздік,ырықсыз",
				Content: `Етістік қимылды білдіреді.
Түрлері:
1. Есімше (-ған/-ген, -қан/-кен, -ар/-ер, -мақ/-мек, -атын/-етін): Есім сөздерше түрленеді.
2. Көсемше (-а/-е/-й, -ып/-іп/-п, -ғалы/-гелі): Қимылдың амалын білдіреді.
3. Тұйық етістік (-у): Жіктелмейді, бірақ септеледі (оқуға, келуі).
Етістіктің шақтары: Осы шақ (нақ, ауыспалы), Келер шақ (болжалды, мақсатты, ауыспалы), Өткен шақ (жедел, бұрынғы, ауыспалы).
Етістіктің райлары: Ашық рай, Бұйрық рай, Шартты рай (-са, -се), Қалау рай (-ғысы келді).
Етіс түрлері: Салт/Сабақты, Өздік (-ын/-ін), Өзгелік (-ғыз/-гіз, -дыр/-дір), Ырықсыз (-ыл/-іл).`,
			},
			{
				Topic:    "Лексика: Көнерген, Диалект, Неологизм, Термин (6-сынып)",
				Keywords: "лексика,неологизм,термин,диалект,кәсіби,көнерген,архаизм,историзм,эвфемизм,дисфемизм,табу,синоним,антоним,омоним",
				Content: `Тілдің сөздік құрамы:
1. Синоним: мағынасы жақын. Антоним: қарама-қарсы. Омоним: дыбысталуы бірдей, мағынасы басқа.
2. Неологизм: Тілге жаңадан енген сөздер (ғаламтор).
3. Терминдер: Ғылым мен техниканың сөздері (аксиома).
4. Кәсіби сөздер: Кәсіп иелері қолданатын сөздер (атыз).
5. Диалект: Аймақта ғана қолданылатын сөздер (сым - шалбар).
6. Көнерген сөздер: Историзмдер (болыс, хан) және Архаизмдер (уәзір).
7. Эвфемизм: Дөрекі сөзді сыпайылап жеткізу.
8. Табу: Атын тура атауға тыйым салынған сөздер.`,
			},
		}

		for _, r := range rules {
			db.Create(&r)
		}
		log.Println("✅ ИИ үшін грамматика ережелері (RAG) базаға жүктелді!")
	}
}

func seedData(db *gorm.DB) {
	var userCount int64
	db.Model(&User{}).Count(&userCount)
	if userCount == 0 {
		db.Create(&User{Email: "admin@example.com", Password: "123", Role: "admin", FullName: "Бас Админ"})
	}

	var count int64
	db.Model(&Grade{}).Count(&count)
	if count == 0 {
		grades := []Grade{
			{
				ID: 5, Title: "5-СЫНЫП", Subtitle: "Тіл негіздері (Основы)",
				Topics: []Topic{
					{Title: "Фонетика", Description: "Дыбыс, әріп, буын түрлері, үндестік заңы", Slug: "phonetics"},
					{Title: "Лексика", Description: "Тура/ауыспалы мағына, синоним, антоним, омоним", Slug: "lexis"},
				},
			},
			{
				ID: 6, Title: "6-СЫНЫП", Subtitle: "Сөзжасам және тереңдетілген лексика",
				Topics: []Topic{
					{Title: "Сөзжасам", Description: "Сөздің жасалу жолдары, біріккен, қос, қысқарған сөздер", Slug: "word-formation"},
				},
			},
			{
				ID: 7, Title: "7-СЫНЫП", Subtitle: "Көмекші сөздер және орфография",
				Topics: []Topic{
					{Title: "Морфология", Description: "Үстеу, еліктеу сөздер, шылау, одағай", Slug: "morphology-end"},
				},
			},
			{
				ID: 8, Title: "8-СЫНЫП", Subtitle: "Жай сөйлем синтаксисі",
				Topics: []Topic{
					{Title: "Сөз тіркесі", Description: "Есімді және етістікті сөз тіркестері", Slug: "phrases"},
					{Title: "Сөйлем мүшелері", Description: "Тұрлаулы және тұрлаусыз мүшелер", Slug: "sentence-members"},
				},
			},
			{
				ID: 9, Title: "9-СЫНЫП", Subtitle: "Құрмалас сөйлем және риторика",
				Topics: []Topic{
					{Title: "Құрмалас сөйлем", Description: "Салалас, сабақтас, аралас құрмалас", Slug: "complex-sentences"},
				},
			},
		}

		for _, g := range grades {
			db.Create(&g)
		}
		log.Println("✅ 5-9 сыныптардың барлық модульдері базаға сәтті жүктелді!")
	}
}

func broadcastToRoom(room *Room, message map[string]interface{}) {
	room.Mutex.Lock()
	defer room.Mutex.Unlock()
	for client := range room.Clients {
		client.WriteJSON(message)
	}
}

// =================== НЕГІЗГІ СЕРВЕРДІ ҚОСУ ===================
func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("⚠️  .env файлын жүктеу мүмкін болмады")
	}

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "host=localhost user=postgres password=12345 dbname=tilim_db port=5432 sslmode=disable"
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Базаға қосылу мүмкін болмады! Қате: ", err)
	}
	DB = db
	log.Println("✅ PostgreSQL базасына сәтті қосылдық!")

	// ЖАҢА КЕСТЕНІ (GrammarRule) ҚОСТЫҚ
	DB.AutoMigrate(&Grade{}, &Topic{}, &Lesson{}, &Quiz{}, &QuizAnswer{}, &User{}, &Activity{}, &CustomGame{}, &AIChat{}, &RoomHistory{}, &GrammarRule{})
	
	seedData(DB)
	seedGrammarRules(DB) // БАЗАНЫ ЕРЕЖЕЛЕРМЕН ТОЛТЫРУ

	os.MkdirAll("uploads", os.ModePerm)

	r := gin.Default()
	r.Static("/uploads", "./uploads")

	r.Use(cors.New(cors.Config{
		AllowAllOrigins: true,
		AllowMethods:    []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:    []string{"Origin", "Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization"},
	}))

	// =================== API ЭНДПОИНТТЕР ===================

	r.GET("/api/grades/:id", func(c *gin.Context) {
		id := c.Param("id")
		var grade Grade
		if err := DB.Preload("Topics.Lessons.Quizzes.Answers").First(&grade, id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Сынып табылмады"})
			return
		}
		c.JSON(http.StatusOK, grade)
	})

	type LoginInput struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	r.POST("/api/login", func(c *gin.Context) {
		var input LoginInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Қате мәлімет жіберілді"})
			return
		}

		var user User
		if err := DB.Where("email = ? AND password = ?", input.Email, input.Password).First(&user).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Логин немесе пароль қате!"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Сәтті кірдіңіз!", "role": user.Role})
	})

	r.POST("/api/register", func(c *gin.Context) {
		var input User
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Мәлімет қате"})
			return
		}
		var existingUser User
		if err := DB.Where("email = ?", input.Email).First(&existingUser).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Бұл пошта тіркеліп қойған!"})
			return
		}
		input.Role = "student"
		DB.Create(&input)
		c.JSON(http.StatusOK, gin.H{"message": "Тіркелу сәтті!"})
	})

	r.GET("/api/users", func(c *gin.Context) {
		var users []User
		if err := DB.Where("role = ?", "student").Find(&users).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Оқушыларды алу мүмкін болмады"})
			return
		}
		c.JSON(http.StatusOK, users)
	})

	r.PUT("/api/users/:id/reset", func(c *gin.Context) {
		id := c.Param("id")
		if err := DB.Model(&User{}).Where("id = ?", id).Update("password", "123456").Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Қате шықты"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Құпия сөз 123456 болып өзгертілді!"})
	})

	r.DELETE("/api/users/:id", func(c *gin.Context) {
		id := c.Param("id")
		if err := DB.Delete(&User{}, id).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Оқушыны өшіру мүмкін болмады"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Оқушы базадан толық өшірілді!"})
	})

	r.POST("/api/upload", func(c *gin.Context) {
		file, err := c.FormFile("image")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Сурет жүктелмеді"})
			return
		}
		filename := "uploads/" + file.Filename
		if err := c.SaveUploadedFile(file, filename); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Сурет сақталмады"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"url": "http://localhost:8080/" + filename})
	})

	type QuizAnswerInput struct {
		AnswerText string `json:"answer_text"`
		IsCorrect  bool   `json:"is_correct"`
	}
	type QuizInput struct {
		Question string            `json:"question"`
		Answers  []QuizAnswerInput `json:"answers"`
	}
	type CreateLessonInput struct {
		TopicID  uint        `json:"topic_id"`
		Title    string      `json:"title"`
		Theory   string      `json:"theory"`
		VideoURL string      `json:"video_url"`
		ImageURL string      `json:"image_url"`
		Slug     string      `json:"slug"`
		Quizzes  []QuizInput `json:"quizzes"`
	}
	r.POST("/api/lessons", func(c *gin.Context) {
		var input CreateLessonInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Мәлімет қате жіберілді"})
			return
		}

		lesson := Lesson{
			TopicID:  input.TopicID,
			Title:    input.Title,
			Theory:   input.Theory,
			VideoURL: input.VideoURL,
			ImageURL: input.ImageURL,
			Slug:     input.Slug,
		}

		for _, qInput := range input.Quizzes {
			quiz := Quiz{Question: qInput.Question}
			for _, aInput := range qInput.Answers {
				quiz.Answers = append(quiz.Answers, QuizAnswer{
					AnswerText: aInput.AnswerText,
					IsCorrect:  aInput.IsCorrect,
				})
			}
			lesson.Quizzes = append(lesson.Quizzes, quiz)
		}

		if err := DB.Create(&lesson).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Базаға сақтау мүмкін болмады"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Сабақ және тест сәтті сақталды!"})
	})

	r.DELETE("/api/lessons/:id", func(c *gin.Context) {
		id := c.Param("id")
		var lesson Lesson

		if err := DB.Preload("Quizzes").First(&lesson, id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Сабақ табылмады"})
			return
		}

		for _, q := range lesson.Quizzes {
			DB.Where("quiz_id = ?", q.ID).Delete(&QuizAnswer{})
		}
		DB.Where("lesson_id = ?", lesson.ID).Delete(&Quiz{})

		if err := DB.Delete(&lesson).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Өшіру мүмкін болмады"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Сабақ толық өшірілді!"})
	})

	r.PUT("/api/lessons/:id", func(c *gin.Context) {
		id := c.Param("id")
		var input Lesson
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Мәлімет қате жіберілді"})
			return
		}

		var lesson Lesson
		if err := DB.First(&lesson, id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Сабақ табылмады"})
			return
		}

		DB.Model(&lesson).Updates(Lesson{
			Title:    input.Title,
			Theory:   input.Theory,
			VideoURL: input.VideoURL,
			Slug:     input.Slug,
		})

		c.JSON(http.StatusOK, gin.H{"message": "Сабақ сәтті жаңартылды!"})
	})

	type ProfileInput struct {
		Email    string `json:"email"`
		FullName string `json:"full_name"`
		City     string `json:"city"`
	}
	r.PUT("/api/profile", func(c *gin.Context) {
		var input ProfileInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Қате мәлімет"})
			return
		}
		DB.Model(&User{}).Where("email = ?", input.Email).Updates(User{FullName: input.FullName, City: input.City})
		c.JSON(http.StatusOK, gin.H{"message": "Профиль сәтті сақталды!"})
	})

	type ScoreInput struct {
		Email       string `json:"email"`
		Score       int    `json:"score"`
		Title       string `json:"title"`
		Type        string `json:"type"`
		IsCompleted bool   `json:"is_completed"`
		Accuracy    int    `json:"accuracy"`
	}
	r.POST("/api/add-score", func(c *gin.Context) {
		var input ScoreInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Қате формат"})
			return
		}

		var user User
		if err := DB.Where("email = ?", input.Email).First(&user).Error; err == nil {
			user.Score += input.Score

			if input.Type == "lesson" && input.IsCompleted {
				user.CompletedLessons += 1
				if user.Accuracy == 0 {
					user.Accuracy = input.Accuracy
				} else {
					user.Accuracy = (user.Accuracy + input.Accuracy) / 2
				}
			}
			DB.Save(&user)

			if input.Title != "" {
				currentDate := time.Now().Format("02.01.2006 15:04")
				newActivity := Activity{
					UserID: user.ID,
					Title:  input.Title,
					Date:   currentDate,
					Points: input.Score,
					Type:   input.Type,
				}
				DB.Create(&newActivity)
			}
		}
		c.JSON(http.StatusOK, gin.H{"message": "Ұпай мен тарих сәтті сақталды!"})
	})

	r.GET("/api/profile", func(c *gin.Context) {
		email := c.Query("email")
		var user User

		if err := DB.Preload("Activities", func(db *gorm.DB) *gorm.DB {
			return db.Order("id desc")
		}).Where("email = ?", email).First(&user).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Оқушы табылмады"})
			return
		}
		user.Password = ""
		c.JSON(http.StatusOK, user)
	})

	type PasswordInput struct {
		Email       string `json:"email"`
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
	}
	r.PUT("/api/password", func(c *gin.Context) {
		var input PasswordInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Қате мәлімет"})
			return
		}

		var user User
		if err := DB.Where("email = ? AND password = ?", input.Email, input.OldPassword).First(&user).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Ескі құпия сөз қате!"})
			return
		}

		user.Password = input.NewPassword
		DB.Save(&user)
		c.JSON(http.StatusOK, gin.H{"message": "Құпия сөз сәтті ауыстырылды!"})
	})

	// =========================================================================
	// ЧАТ С ИИ (RAG ТЕХНОЛОГИЯСЫМЕН: БАЗАДАН ЕРЕЖЕ ІЗДЕП ТАУЫП ЖАУАП БЕРУ)
	// =========================================================================
	type ChatMessage struct {
		Email   string `json:"email"`
		Message string `json:"message"`
	}

	r.POST("/api/chat", func(c *gin.Context) {
		var input ChatMessage
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Қате сұрау"})
			return
		}

		apiKey := os.Getenv("GROQ_API_KEY")
		if apiKey == "" {
			c.JSON(http.StatusInternalServerError, gin.H{"reply": "Қате: Серверде GROQ_API_KEY бапталмаған!"})
			return
		}

		if input.Email != "" {
			DB.Create(&AIChat{
				UserEmail: input.Email,
				Role:      "user",
				Message:   input.Message,
				CreatedAt: time.Now(),
			})
		}

		// ---------------------------------------------------------
		// RAG ЛОГИКАСЫ: БАЗАДАН КІЛТ СӨЗДЕР БОЙЫНША ЕРЕЖЕ ІЗДЕУ
		// ---------------------------------------------------------
		userMessageLower := strings.ToLower(input.Message)
		var rules []GrammarRule
		DB.Find(&rules)

		var contextBuilder strings.Builder
		for _, rule := range rules {
			keywords := strings.Split(strings.ToLower(rule.Keywords), ",")
			for _, kw := range keywords {
				kw = strings.TrimSpace(kw)
				if kw != "" && strings.Contains(userMessageLower, kw) {
					// Егер оқушы сөзінде кілт сөз кездессе, осы ережені ИИ-ге жібереміз
					contextBuilder.WriteString("ТАҚЫРЫП: " + rule.Topic + "\nЕРЕЖЕ: " + rule.Content + "\n\n")
					break
				}
			}
		}

		retrievedContext := contextBuilder.String()
		// ---------------------------------------------------------

		systemContext := `Сен "TILIM" платформасының қазақ тілі пәні бойынша жоғары дәрежелі виртуалды мұғалімісің (репетитор). 
Сенің мақсатың — 5-9 сынып оқушыларына қазақ тілі грамматикасын Қазақстанның мектеп бағдарламасына сай қатесіз түсіндіру.`

		if retrievedContext != "" {
			systemContext += "\n\nОҚУШЫНЫҢ СҰРАҒЫНА БАЙЛАНЫСТЫ ТӨМЕНДЕГІ МЕКТЕП ЕРЕЖЕЛЕРІ БАЗАДАН ТАБЫЛДЫ:\n" + retrievedContext + "\nОСЫ ЕРЕЖЕЛЕРГЕ СҮЙЕНІП, ОҚУШЫҒА ТҮСІНІКТІ ӘРІ НАҚТЫ МЫСАЛДАРМЕН ЖАУАП БЕР."
		} else {
			systemContext += "\n\nЕгер оқушы мектеп грамматикасынан сұрақ қойса, оны қазақ тілінің академиялық нормаларына сай, мысалдармен түсіндір."
		}

		requestBody, _ := json.Marshal(map[string]interface{}{
			"model": "llama-3.3-70b-versatile",
			"messages": []map[string]interface{}{
				{"role": "system", "content": systemContext},
				{"role": "user", "content": input.Message},
			},
			"temperature": 0.5,
		})

		url := "https://api.groq.com/openai/v1/chat/completions"
		req, _ := http.NewRequest("POST", url, bytes.NewBuffer(requestBody))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+apiKey)

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"reply": "Кешіріңіз, ИИ серверімен байланыс үзілді."})
			return
		}
		defer resp.Body.Close()

		bodyBytes, _ := io.ReadAll(resp.Body)
		var groqResponse map[string]interface{}
		json.Unmarshal(bodyBytes, &groqResponse)

		var replyText string

		if errorObj, ok := groqResponse["error"].(map[string]interface{}); ok {
			if errMsg, ok := errorObj["message"].(string); ok {
				replyText = "⚠️ Groq Қатесі: " + errMsg
			}
		} else if choices, ok := groqResponse["choices"].([]interface{}); ok && len(choices) > 0 {
			if choice, ok := choices[0].(map[string]interface{}); ok {
				if message, ok := choice["message"].(map[string]interface{}); ok {
					if content, ok := message["content"].(string); ok {
						replyText = content
					}
				}
			}
		}

		if replyText == "" {
			replyText = "Кешіріңіз, мен сұрағыңызды түсінбедім."
		}

		if input.Email != "" {
			DB.Create(&AIChat{
				UserEmail: input.Email,
				Role:      "ai",
				Message:   replyText,
				CreatedAt: time.Now(),
			})
		}

		c.JSON(http.StatusOK, gin.H{"reply": replyText})
	})

	r.GET("/api/chat/history", func(c *gin.Context) {
		email := c.Query("email")
		var history []AIChat
		DB.Where("user_email = ?", email).Order("created_at asc").Limit(50).Find(&history)
		c.JSON(http.StatusOK, history)
	})

	// =========================================================================
	// CUSTOM GAMES API
	// =========================================================================
	type CustomGameInput struct {
		AuthorEmail string      `json:"author_email"`
		AuthorName  string      `json:"author_name"`
		Type        int         `json:"type"`
		Title       string      `json:"title"`
		Questions   interface{} `json:"questions"`
		IsPublic    bool        `json:"is_public"`
	}

	r.POST("/api/custom-games", func(c *gin.Context) {
		var input CustomGameInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Қате мәлімет"})
			return
		}

		questionsBytes, _ := json.Marshal(input.Questions)

		newGame := CustomGame{
			AuthorEmail: input.AuthorEmail,
			AuthorName:  input.AuthorName,
			Type:        input.Type,
			Title:       input.Title,
			Questions:   string(questionsBytes),
			IsPublic:    input.IsPublic,
		}

		DB.Create(&newGame)
		c.JSON(http.StatusOK, gin.H{"message": "Ойын сақталды!"})
	})

	r.GET("/api/custom-games", func(c *gin.Context) {
		email := c.Query("email")
		var games []CustomGame

		DB.Where("author_email = ? OR is_public = ?", email, true).Order("id desc").Find(&games)
		c.JSON(http.StatusOK, games)
	})

	// =========================================================================
	// WEBSOCKET
	// =========================================================================
	r.GET("/api/ws/room/:roomCode", func(c *gin.Context) {
		roomCode := c.Param("roomCode")
		userName := c.Query("user")
		if userName == "" {
			userName = "Аноним"
		}

		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Println("WebSocket қатесі:", err)
			return
		}
		defer conn.Close()

		roomsMutex.Lock()
		if rooms[roomCode] == nil {
			rooms[roomCode] = &Room{Clients: make(map[*websocket.Conn]string)}
		}
		room := rooms[roomCode]
		roomsMutex.Unlock()

		room.Mutex.Lock()
		room.Clients[conn] = userName
		room.Mutex.Unlock()

		joinMsg := map[string]interface{}{
			"type":    "system",
			"content": userName + " бөлмеге қосылды",
		}
		broadcastToRoom(room, joinMsg)

		for {
			var msg map[string]interface{}
			err := conn.ReadJSON(&msg)
			if err != nil {
				room.Mutex.Lock()
				delete(room.Clients, conn)
				room.Mutex.Unlock()

				leaveMsg := map[string]interface{}{
					"type":    "system",
					"content": userName + " бөлмеден шықты",
				}
				broadcastToRoom(room, leaveMsg)
				break
			}

			msgType, _ := msg["type"].(string)
			if msgType != "system" {
				msgBytes, _ := json.Marshal(msg)
				DB.Create(&RoomHistory{
					RoomCode:  roomCode,
					UserName:  userName,
					Type:      msgType,
					Data:      string(msgBytes),
					CreatedAt: time.Now(),
				})
			}
			broadcastToRoom(room, msg)
		}
	})

	r.GET("/api/room/:roomCode/history", func(c *gin.Context) {
		roomCode := c.Param("roomCode")
		var history []RoomHistory
		DB.Where("room_code = ?", roomCode).Order("created_at asc").Find(&history)
		c.JSON(http.StatusOK, history)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	r.Run(":" + port)
}
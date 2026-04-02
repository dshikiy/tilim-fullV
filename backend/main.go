package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// =================== МОДЕЛЬДЕР (БАЗА КЕСТЕЛЕРІ) ===================
type User struct {
	ID       uint   `json:"id"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"` // "admin" немесе "student"

	FullName string `json:"full_name"` // Толық аты
	City     string `json:"city"`      // Қаласы
	Score    int    `json:"score"`     // Жинаған ұпайы
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
	ImageURL    string `json:"image_url"` // ФОТО ЖҮКТЕУ ҮШІН ЖАҢА БАҒАН!
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

// =================== БАЗАНЫ АВТОМАТТЫ ТОЛТЫРУ (SEEDER) ===================
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
			// =================== 5-СЫНЫП ===================
			{
				ID: 5, Title: "5-СЫНЫП", Subtitle: "Тіл негіздері (Основы)",
				Topics: []Topic{
					{Title: "Фонетика", Description: "Дыбыс, әріп, буын түрлері, үндестік заңы", Slug: "phonetics"},
					{Title: "Лексика", Description: "Тура/ауыспалы мағына, синоним, антоним, омоним", Slug: "lexis"},
					{Title: "Морфология (Бастамасы)", Description: "Түбір, қосымша, зат есім, сын есім, сан есім", Slug: "morphology-intro"},
				},
			},
			// =================== 6-СЫНЫП ===================
			{
				ID: 6, Title: "6-СЫНЫП", Subtitle: "Сөзжасам және тереңдетілген лексика",
				Topics: []Topic{
					{Title: "Сөзжасам", Description: "Сөздің жасалу жолдары, біріккен, қос, қысқарған сөздер", Slug: "word-formation"},
					{Title: "Фразеология және Лексика", Description: "Тұрақты тіркестер, мақал-мәтелдер, көне/жаңа сөздер", Slug: "phraseology-lexis"},
					{Title: "Морфология (Жалғасы)", Description: "Есімдік, етістік (шақтары, райлары)", Slug: "morphology-cont"},
				},
			},
			// =================== 7-СЫНЫП ===================
			{
				ID: 7, Title: "7-СЫНЫП", Subtitle: "Көмекші сөздер және орфография",
				Topics: []Topic{
					{Title: "Морфология (Аяқталуы)", Description: "Үстеу, еліктеу сөздер, шылау, одағай", Slug: "morphology-end"},
					{Title: "Орфография (Дұрыс жазу)", Description: "Қиын жазылатын сөздердің емлесі, бас әріппен жазылатын сөздер", Slug: "orthography"},
				},
			},
			// =================== 8-СЫНЫП ===================
			{
				ID: 8, Title: "8-СЫНЫП", Subtitle: "Жай сөйлем синтаксисі",
				Topics: []Topic{
					{Title: "Сөз тіркесі", Description: "Есімді және етістікті сөз тіркестері", Slug: "phrases"},
					{Title: "Сөйлем мүшелері", Description: "Тұрлаулы және тұрлаусыз мүшелер", Slug: "sentence-members"},
					{Title: "Жай сөйлем түрлері", Description: "Жақты/жақсыз, жалаң/жайылма, толымды/толымсыз, оқшау сөздер", Slug: "simple-sentences"},
				},
			},
			// =================== 9-СЫНЫП ===================
			{
				ID: 9, Title: "9-СЫНЫП", Subtitle: "Құрмалас сөйлем және риторика",
				Topics: []Topic{
					{Title: "Құрмалас сөйлем", Description: "Салалас, сабақтас, аралас құрмалас", Slug: "complex-sentences"},
					{Title: "Пунктуация", Description: "Құрмалас сөйлемдегі және төл/төлеу сөздегі тыныс белгілер", Slug: "punctuation"},
					{Title: "Шешендік өнер (Риторика)", Description: "Шешендік сөздер, сөйлеу мәдениеті, дебат ережелері", Slug: "rhetoric"},
				},
			},
		}

		for _, g := range grades {
			db.Create(&g)
		}
		log.Println("✅ 5-9 сыныптардың барлық модульдері (сабақтарсыз) базаға сәтті жүктелді!")
	}
}

// =================== НЕГІЗГІ СЕРВЕРДІ ҚОСУ ===================
func main() {
	// Пароль сіздің базаңызда "12345" екенін ұмытпаңыз
	dsn := "host=localhost user=postgres password=12345 dbname=tilim_db port=5432 sslmode=disable"

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Базаға қосылу мүмкін болмады! Қате: ", err)
	}
	DB = db
	log.Println("✅ PostgreSQL базасына сәтті қосылдық!")

	// 1. Кестелерді құру
	DB.AutoMigrate(&Grade{}, &Topic{}, &Lesson{}, &Quiz{}, &QuizAnswer{}, &User{})

	// 2. Базаны толтыру функциясын шақыру
	seedData(DB)

	// ФОТОЛАР САҚТАЛАТЫН ПАПКА ҚҰРУ
	os.MkdirAll("uploads", os.ModePerm)

	r := gin.Default()

	// СУРЕТТЕРДІ БРАУЗЕРГЕ КӨРСЕТУ ҮШІН СТАТИКАЛЫҚ ЖОЛ
	r.Static("/uploads", "./uploads")

	// CORS мәселесін шешу
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// =================== API ЭНДПОИНТТЕР ===================

	// 1. БАРЛЫҚ СЫНЫПТАРДЫ ТАРТУ
	r.GET("/api/grades/:id", func(c *gin.Context) {
		id := c.Param("id")
		var grade Grade
		if err := DB.Preload("Topics.Lessons.Quizzes.Answers").First(&grade, id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Сынып табылмады"})
			return
		}
		c.JSON(http.StatusOK, grade)
	})

	// 2. ЛОГИН
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

	// 3. ТІРКЕЛУ
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

	// 4. ОҚУШЫЛАРДЫ АЛУ (АДМИНГЕ)
	r.GET("/api/users", func(c *gin.Context) {
		var users []User
		if err := DB.Where("role = ?", "student").Find(&users).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Оқушыларды алу мүмкін болмады"})
			return
		}
		c.JSON(http.StatusOK, users)
	})

	// 5. АДМИН: СБРОС ПАРОЛЯ
	r.PUT("/api/users/:id/reset", func(c *gin.Context) {
		id := c.Param("id")
		// Оқушының құпия сөзін 123456-ға өзгертеміз
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

	// 6. ФОТО ЖҮКТЕУ API
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
		// Суреттің толық сілтемесін фронтендке қайтарамыз
		c.JSON(http.StatusOK, gin.H{"url": "http://localhost:8080/" + filename})
	})

	// 7. САБАҚ ҚОСУ (ФОТОМЕН)
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
		ImageURL string      `json:"image_url"` // ЖАҢА ФОТО СІЛТЕМЕСІ
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

	// 8. САБАҚТЫ ӨШІРУ (КЕПІЛДІ 100% ЖҰМЫС ІСТЕЙТІН НҰСҚА)
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

	// 9. ПРОФИЛЬ ЖАҢАРТУ
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

	// 10. ҰПАЙ ҚОСУ
	type ScoreInput struct {
		Email string `json:"email"`
		Score int    `json:"score"`
	}
	r.POST("/api/add-score", func(c *gin.Context) {
		var input ScoreInput
		if err := c.ShouldBindJSON(&input); err != nil {
			return
		}
		var user User
		if err := DB.Where("email = ?", input.Email).First(&user).Error; err == nil {
			user.Score += input.Score
			DB.Save(&user)
		}
		c.JSON(http.StatusOK, gin.H{"message": "Ұпай қосылды!"})
	})

	// 11. ОҚУШЫ ПРОФИЛІН КӨРУ
	r.GET("/api/profile", func(c *gin.Context) {
		email := c.Query("email")
		var user User
		
		if err := DB.Where("email = ?", email).First(&user).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Оқушы табылмады"})
			return
		}
		user.Password = "" 
		c.JSON(http.StatusOK, user)
	})

	// 12. ПАРОЛЬДІ АУЫСТЫРУ
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

	// ==========================================================
	// ЖАСАНДЫ ИНТЕЛЛЕКТ ЧАТЫ (AI TUTOR)
	// ==========================================================
	type ChatMessage struct {
		Message string `json:"message"`
	}

	r.POST("/api/chat", func(c *gin.Context) {
		var input ChatMessage
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Қате сұрау"})
			return
		}

		// Әзірге UI/UX тексеру үшін қарапайым алгоритм (Кейін ChatGPT/Gemini API қосамыз)
		userMsg := input.Message
		var reply string

		if len(userMsg) < 2 {
			reply = "Сәлем! Мен TILIM-нің жасанды интеллектісімін. Қазақ тілі грамматикасы бойынша қандай сұрағыңыз бар?"
		} else {
			reply = "Керемет сұрақ! Сіз: «" + userMsg + "» деп сұрадыңыз. Қазақ тілінде бұл ережені былай түсіндіруге болады: [Осы жерде нақты ИИ жауабы болады]. Тағы не білгіңіз келеді?"
		}

		c.JSON(http.StatusOK, gin.H{"reply": reply})
	})

	r.Run(":8080")
}
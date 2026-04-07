package main

import (
    "bytes"
    "encoding/json"
    "io"
    "log"
    "net/http"
    "os"
    "sync"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/gin-contrib/cors" // ЖАҢА CORS КІТАПХАНАСЫ
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

// =================== ЖАҢА МОДЕЛЬДЕР (ИИ ЧАТ ЖӘНЕ БӨЛМЕЛЕР ҮШІН) ===================

type AIChat struct {
    ID        uint      `json:"id" gorm:"primaryKey"`
    UserEmail string    `json:"user_email"`
    Role      string    `json:"role"` // "user" (оқушы) немесе "ai" (мұғалім)
    Message   string    `json:"message"`
    CreatedAt time.Time `json:"created_at"`
}

type RoomHistory struct {
    ID        uint      `json:"id" gorm:"primaryKey"`
    RoomCode  string    `json:"room_code"`
    UserName  string    `json:"user_name"`
    Type      string    `json:"type"` // "chat" немесе "draw" (тақта үшін)
    Data      string    `json:"data"` // JSON форматындағы мәлімет
    CreatedAt time.Time `json:"created_at"`
}

// =================== МОДЕЛЬДЕР (БАЗА КЕСТЕЛЕРІ) ===================
type CustomGame struct {
    ID          uint   `json:"id"`
    AuthorEmail string `json:"author_email"`
    AuthorName  string `json:"author_name"`
    Type        int    `json:"type"`
    Title       string `json:"title"`
    Questions   string `json:"questions"` // JSON түрінде (string болып) сақтаймыз
    IsPublic    bool   `json:"is_public"` // True болса барлық студенттер көреді
}

type User struct {
    ID       uint   `json:"id"`
    Email    string `json:"email"`
    Password string `json:"password"`
    Role     string `json:"role"` // "admin" немесе "student"

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
                    {Title: "Морфология (Бастамасы)", Description: "Түбір, қосымша, зат есім, сын есім, сан есім", Slug: "morphology-intro"},
                },
            },
            {
                ID: 6, Title: "6-СЫНЫП", Subtitle: "Сөзжасам және тереңдетілген лексика",
                Topics: []Topic{
                    {Title: "Сөзжасам", Description: "Сөздің жасалу жолдары, біріккен, қос, қысқарған сөздер", Slug: "word-formation"},
                    {Title: "Фразеология және Лексика", Description: "Тұрақты тіркестер, мақал-мәтелдер, көне/жаңа сөздер", Slug: "phraseology-lexis"},
                    {Title: "Морфология (Жалғасы)", Description: "Есімдік, етістік (шақтары, райлары)", Slug: "morphology-cont"},
                },
            },
            {
                ID: 7, Title: "7-СЫНЫП", Subtitle: "Көмекші сөздер және орфография",
                Topics: []Topic{
                    {Title: "Морфология (Аяқталуы)", Description: "Үстеу, еліктеу сөздер, шылау, одағай", Slug: "morphology-end"},
                    {Title: "Орфография (Дұрыс жазу)", Description: "Қиын жазылатын сөздердің емлесі, бас әріппен жазылатын сөздер", Slug: "orthography"},
                },
            },
            {
                ID: 8, Title: "8-СЫНЫП", Subtitle: "Жай сөйлем синтаксисі",
                Topics: []Topic{
                    {Title: "Сөз тіркесі", Description: "Есімді және етістікті сөз тіркестері", Slug: "phrases"},
                    {Title: "Сөйлем мүшелері", Description: "Тұрлаулы және тұрлаусыз мүшелер", Slug: "sentence-members"},
                    {Title: "Жай сөйлем түрлері", Description: "Жақты/жақсыз, жалаң/жайылма, толымды/толымсыз, оқшау сөздер", Slug: "simple-sentences"},
                },
            },
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

    DB.AutoMigrate(&Grade{}, &Topic{}, &Lesson{}, &Quiz{}, &QuizAnswer{}, &User{}, &Activity{}, &CustomGame{}, &AIChat{}, &RoomHistory{})
    seedData(DB)

    os.MkdirAll("uploads", os.ModePerm)

    r := gin.Default()
    r.Static("/uploads", "./uploads")

    // РЕСМИ CORS БАПТАУЫ ОСЫ ЖЕРДЕ ҚОСЫЛДЫ!
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
    // ЧАТ С ИИ (GROQ API + БАЗАҒА ТАРИХ САҚТАУ)
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

        systemContext := `Сен "TILIM" платформасының қазақ тілі пәні бойынша жеке виртуалды мұғалімісің (репетитор). 
Сенің мақсатың — 5-9 сынып оқушыларына жай ғана ақпарат беру емес, олармен қалыпты сөйлесу, ОҚЫТУ, ТҮСІНДІРУ және АНАЛИЗ ЖАСАУ.`

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
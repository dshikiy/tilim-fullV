package models

type Grade struct {
	ID       uint     `gorm:"primaryKey" json:"id"`
	Title    string   `json:"title"`
	Subtitle string   `json:"subtitle"`
	Topics   []Topic  `json:"topics"`
}

type Topic struct {
	ID          uint     `gorm:"primaryKey" json:"id"`
	GradeID     uint     `json:"grade_id"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Slug        string   `json:"slug"`
	Lessons     []Lesson `json:"lessons"`
}

type Lesson struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	TopicID     uint   `json:"topic_id"`
	Title       string `json:"title"`
	Theory      string `json:"theory"`
	VideoURL    string `json:"video_url"`
	VideoLocked bool   `json:"video_locked"`
	Slug        string `json:"slug"`
}
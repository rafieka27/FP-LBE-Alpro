package models

import "time"

type Role string

const (
	RoleDosen     Role = "dosen"
	RoleAsisten   Role = "asisten"
	RoleMahasiswa Role = "mahasiswa"
)

type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	NRP          string    `gorm:"uniqueIndex;size:20" json:"nrp,omitempty"`
	Name         string    `gorm:"size:150;not null" json:"name"`
	Email        string    `gorm:"uniqueIndex;size:150;not null" json:"email"`
	PasswordHash string    `json:"-"`
	Role         Role      `gorm:"type:varchar(20);not null" json:"role"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type Class struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	Code       string    `gorm:"uniqueIndex;size:30;not null" json:"code"`
	Name       string    `gorm:"size:100;not null" json:"name"`
	Subject    string    `gorm:"size:180;not null" json:"subject"`
	LecturerID uint      `gorm:"not null;index" json:"lecturer_id"`
	Lecturer   User      `json:"lecturer,omitempty"`
	Students   []User    `gorm:"many2many:enrollments;" json:"students,omitempty"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type Enrollment struct {
	ClassID   uint `gorm:"primaryKey"`
	StudentID uint `gorm:"primaryKey"`
	CreatedAt time.Time
}

type Assignment struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Title       string    `gorm:"size:180;not null" json:"title"`
	Description string    `json:"description"`
	FileURL     string    `json:"file_url"`
	DueAt       time.Time `json:"due_at"`
	Status      string    `gorm:"size:20;not null;default:Aktif" json:"status"`
	ClassID     uint      `gorm:"not null;index" json:"class_id"`
	CreatedBy   uint      `gorm:"not null" json:"created_by"`
	Class       Class     `json:"class,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Grade struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	StudentID uint      `gorm:"not null;index;uniqueIndex:grade_unique" json:"student_id"`
	ClassID   uint      `gorm:"not null;index;uniqueIndex:grade_unique" json:"class_id"`
	Component string    `gorm:"size:80;not null;uniqueIndex:grade_unique" json:"component"`
	Score     float64   `gorm:"not null" json:"score"`
	Note      string    `json:"note"`
	Published bool      `gorm:"not null;default:false" json:"published"`
	CreatedBy uint      `gorm:"not null" json:"created_by"`
	Student   User      `json:"student,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

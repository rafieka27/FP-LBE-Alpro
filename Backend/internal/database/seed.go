package database

import (
	"github.com/your-org/myits-recap-backend/internal/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"log"
)

func Seed(db *gorm.DB) {
	password, err := bcrypt.GenerateFromPassword([]byte("demo123"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("seed password failed: %v", err)
	}
	users := []models.User{
		{NRP: "", Name: "Dr. Rizky Januar Akbar", Email: "dosen@its.ac.id", PasswordHash: string(password), Role: models.RoleDosen},
		{NRP: "", Name: "Asisten Dosen Demo", Email: "asisten@its.ac.id", PasswordHash: string(password), Role: models.RoleAsisten},
		{NRP: "5025251001", Name: "Adit Pratama", Email: "5025251001@student.its.ac.id", PasswordHash: string(password), Role: models.RoleMahasiswa},
		{NRP: "5025251002", Name: "Bima Saputra", Email: "5025251002@student.its.ac.id", PasswordHash: string(password), Role: models.RoleMahasiswa},
		{NRP: "5025251003", Name: "Citra Lestari", Email: "5025251003@student.its.ac.id", PasswordHash: string(password), Role: models.RoleMahasiswa},
		{NRP: "5025251004", Name: "Daffa Ramadhan", Email: "5025251004@student.its.ac.id", PasswordHash: string(password), Role: models.RoleMahasiswa},
		{NRP: "5025251005", Name: "Elvina Putri", Email: "5025251005@student.its.ac.id", PasswordHash: string(password), Role: models.RoleMahasiswa},
		{NRP: "5025251006", Name: "Farhan Akmal", Email: "5025251006@student.its.ac.id", PasswordHash: string(password), Role: models.RoleMahasiswa},
		{NRP: "5025251007", Name: "Gilang Maulana", Email: "5025251007@student.its.ac.id", PasswordHash: string(password), Role: models.RoleMahasiswa},
		{NRP: "5025251008", Name: "Hana Salsabila", Email: "5025251008@student.its.ac.id", PasswordHash: string(password), Role: models.RoleMahasiswa},
	}
	for _, user := range users {
		var existing models.User
		if err := db.Where("email = ?", user.Email).First(&existing).Error; err == gorm.ErrRecordNotFound {
			if err := db.Create(&user).Error; err != nil {
				log.Printf("seed user %s failed: %v", user.Email, err)
			}
		}
	}
	var lecturer models.User
	if db.Where("email = ?", "dosen@its.ac.id").First(&lecturer).Error != nil {
		return
	}
	classes := []models.Class{{Code: "IF-101", Name: "PBO-A", Subject: "Pemrograman Berorientasi Objek", LecturerID: lecturer.ID}, {Code: "IF-102", Name: "PBO-B", Subject: "Pemrograman Berorientasi Objek", LecturerID: lecturer.ID}, {Code: "IF-103", Name: "PBO-C", Subject: "Pemrograman Berorientasi Objek", LecturerID: lecturer.ID}}
	for _, class := range classes {
		var existing models.Class
		if db.Where("code = ?", class.Code).First(&existing).Error == gorm.ErrRecordNotFound {
			db.Create(&class)
		}
	}
}

package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/your-org/myits-recap-backend/internal/models"
	"gorm.io/gorm"
)

type ClassHandler struct{ DB *gorm.DB }

func (h *ClassHandler) List(c *gin.Context) {
	var rows []models.Class
	q := h.DB.Preload("Students").Preload("Lecturer")
	if c.GetString("role") == "dosen" {
		q = q.Where("lecturer_id = ?", c.MustGet("user_id"))
	}
	if err := q.Find(&rows).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, rows)
}
func (h *ClassHandler) Create(c *gin.Context) {
	var req struct {
		Code    string `json:"code" binding:"required"`
		Name    string `json:"name" binding:"required"`
		Subject string `json:"subject" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	row := models.Class{Code: req.Code, Name: req.Name, Subject: req.Subject, LecturerID: c.MustGet("user_id").(uint)}
	if err := h.DB.Create(&row).Error; err != nil {
		c.JSON(409, gin.H{"error": "code kelas sudah digunakan"})
		return
	}
	c.JSON(201, row)
}
func (h *ClassHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var row models.Class
	if err := h.DB.Where("id = ? AND lecturer_id = ?", id, c.MustGet("user_id")).First(&row).Error; err != nil {
		c.JSON(404, gin.H{"error": "kelas tidak ditemukan"})
		return
	}
	var req struct {
		Code    string `json:"code"`
		Name    string `json:"name"`
		Subject string `json:"subject"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	if req.Code != "" {
		row.Code = req.Code
	}
	if req.Name != "" {
		row.Name = req.Name
	}
	if req.Subject != "" {
		row.Subject = req.Subject
	}
	h.DB.Save(&row)
	c.JSON(200, row)
}
func (h *ClassHandler) Delete(c *gin.Context) {
	if err := h.DB.Where("id = ? AND lecturer_id = ?", c.Param("id"), c.MustGet("user_id")).Delete(&models.Class{}).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.Status(204)
}
func (h *ClassHandler) AddStudent(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required,email"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	var classRow models.Class
	if h.DB.Where("id = ? AND lecturer_id = ?", c.Param("id"), c.MustGet("user_id")).First(&classRow).Error != nil {
		c.JSON(404, gin.H{"error": "kelas tidak ditemukan"})
		return
	}
	var student models.User
	if h.DB.Where("lower(email)=lower(?) AND role=?", req.Email, models.RoleMahasiswa).First(&student).Error != nil {
		c.JSON(404, gin.H{"error": "mahasiswa tidak ditemukan"})
		return
	}
	if err := h.DB.Model(&classRow).Association("Students").Append(&student); err != nil {
		c.JSON(409, gin.H{"error": err.Error()})
		return
	}
	c.JSON(201, student)
}
func (h *ClassHandler) RemoveStudent(c *gin.Context) {
	var classRow models.Class
	if h.DB.Where("id = ? AND lecturer_id = ?", c.Param("id"), c.MustGet("user_id")).First(&classRow).Error != nil {
		c.JSON(404, gin.H{"error": "kelas tidak ditemukan"})
		return
	}
	var student models.User
	if h.DB.First(&student, c.Param("studentId")).Error != nil {
		c.JSON(404, gin.H{"error": "mahasiswa tidak ditemukan"})
		return
	}
	h.DB.Model(&classRow).Association("Students").Delete(&student)
	c.Status(204)
}

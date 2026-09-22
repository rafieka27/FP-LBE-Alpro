package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/your-org/myits-recap-backend/internal/models"
	"gorm.io/gorm"
)

type GradeHandler struct {
	DB *gorm.DB
}

type gradeRequest struct {
	StudentID uint    `json:"student_id" binding:"required"`
	ClassID   uint    `json:"class_id" binding:"required"`
	Component string  `json:"component" binding:"required"`
	Score     float64 `json:"score" binding:"gte=0,lte=100"`
	Note      string  `json:"note"`
	Published bool    `json:"published"`
}

func (h *GradeHandler) List(c *gin.Context) {
	q := h.DB.Preload("Student")

	if v := c.Query("class_id"); v != "" {
		q = q.Where("class_id = ?", v)
	}

	if v := c.Query("component"); v != "" {
		q = q.Where("component = ?", v)
	}

	var rows []models.Grade

	if err := q.Find(&rows).Error; err != nil {
		c.JSON(500, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(200, rows)
}

func (h *GradeHandler) Upsert(c *gin.Context) {
	var req gradeRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{
			"error": err.Error(),
		})
		return
	}

	var row models.Grade

	err := h.DB.
		Where(
			"student_id = ? AND class_id = ? AND component = ?",
			req.StudentID,
			req.ClassID,
			req.Component,
		).
		First(&row).Error

	if err == gorm.ErrRecordNotFound {
		row = models.Grade{
			StudentID: req.StudentID,
			ClassID:   req.ClassID,
			Component: req.Component,
		}
	} else if err != nil {
		c.JSON(500, gin.H{
			"error": err.Error(),
		})
		return
	}

	row.Score = req.Score
	row.Note = req.Note
	row.Published = req.Published
	row.CreatedBy = c.MustGet("user_id").(uint)

	if err := h.DB.Save(&row).Error; err != nil {
		c.JSON(500, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(200, row)
}

func (h *GradeHandler) StudentGrades(c *gin.Context) {
	studentID := c.Param("studentId")
	userID := c.MustGet("user_id").(uint)

	var requestedStudentID uint

	err := h.DB.
		Model(&models.User{}).
		Where("id = ?", studentID).
		Select("id").
		Scan(&requestedStudentID).Error

	if err != nil || requestedStudentID == 0 {
		c.JSON(404, gin.H{
			"error": "mahasiswa tidak ditemukan",
		})
		return
	}

	// Mahasiswa hanya boleh lihat nilai miliknya sendiri.
	if requestedStudentID != userID {
		c.JSON(403, gin.H{
			"error": "akses nilai mahasiswa lain ditolak",
		})
		return
	}

	var rows []models.Grade

	if err := h.DB.
		Preload("Student").
		Where(
			"student_id = ? AND published = true",
			userID,
		).
		Find(&rows).Error; err != nil {
		c.JSON(500, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(200, rows)
}

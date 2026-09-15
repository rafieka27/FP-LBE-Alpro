package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/your-org/myits-recap-backend/internal/models"
	"gorm.io/gorm"
	"net/http"
	"time"
)

type AssignmentHandler struct{ DB *gorm.DB }
type assignmentRequest struct {
	Title       string    `json:"title" binding:"required"`
	Description string    `json:"description"`
	FileURL     string    `json:"file_url"`
	DueAt       time.Time `json:"due_at" binding:"required"`
	Status      string    `json:"status"`
	ClassID     uint      `json:"class_id" binding:"required"`
}

func (h *AssignmentHandler) List(c *gin.Context) {
	var rows []models.Assignment
	if err := h.DB.Preload("Class").Order("due_at asc").Find(&rows).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, rows)
}
func (h *AssignmentHandler) Create(c *gin.Context) {
	var req assignmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	row := models.Assignment{Title: req.Title, Description: req.Description, FileURL: req.FileURL, DueAt: req.DueAt, Status: req.Status, ClassID: req.ClassID, CreatedBy: c.MustGet("user_id").(uint)}
	if row.Status == "" {
		row.Status = "Aktif"
	}
	if err := h.DB.Create(&row).Error; err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(201, row)
}
func (h *AssignmentHandler) Update(c *gin.Context) {
	var row models.Assignment
	if h.DB.Where("id=? AND created_by=?", c.Param("id"), c.MustGet("user_id")).First(&row).Error != nil {
		c.JSON(404, gin.H{"error": "tugas tidak ditemukan"})
		return
	}
	var req assignmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	row.Title = req.Title
	row.Description = req.Description
	row.FileURL = req.FileURL
	row.DueAt = req.DueAt
	row.Status = req.Status
	row.ClassID = req.ClassID
	h.DB.Save(&row)
	c.JSON(200, row)
}
func (h *AssignmentHandler) Delete(c *gin.Context) {
	if h.DB.Where("id=? AND created_by=?", c.Param("id"), c.MustGet("user_id")).Delete(&models.Assignment{}).RowsAffected == 0 {
		c.JSON(404, gin.H{"error": "tugas tidak ditemukan"})
		return
	}
	c.Status(204)
}

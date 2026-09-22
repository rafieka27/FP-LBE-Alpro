package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/your-org/myits-recap-backend/internal/models"
	"gorm.io/gorm"
)

type AssignmentHandler struct {
	DB *gorm.DB
}

type assignmentRequest struct {
	Title       string    `json:"title" binding:"required"`
	Description string    `json:"description"`
	FileURL     string    `json:"file_url"`
	DueAt       time.Time `json:"due_at" binding:"required"`
	Status      string    `json:"status"`
	ClassID     uint      `json:"class_id" binding:"required"`
}

const maxUploadSize int64 = 10 << 20 // 10 MB

func saveUploadedFile(c *gin.Context) (string, error) {
	file, err := c.FormFile("file")
	if err != nil {
		if err == http.ErrMissingFile {
			return "", nil
		}

		return "", err
	}

	if file.Size > maxUploadSize {
		return "", fmt.Errorf("ukuran file maksimal 10 MB")
	}

	if err := os.MkdirAll("uploads", 0755); err != nil {
		return "", err
	}

	originalName := filepath.Base(file.Filename)

	// Hindari nama file bentrok.
	filename := fmt.Sprintf(
		"%d_%s",
		time.Now().UnixNano(),
		originalName,
	)

	destination := filepath.Join(
		"uploads",
		filename,
	)

	if err := c.SaveUploadedFile(
		file,
		destination,
	); err != nil {
		return "", err
	}

	return "/uploads/" + filename, nil
}

func (h *AssignmentHandler) List(c *gin.Context) {
	var rows []models.Assignment

	if err := h.DB.
		Preload("Class").
		Order("due_at asc").
		Find(&rows).Error; err != nil {

		c.JSON(500, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(200, rows)
}

func (h *AssignmentHandler) Create(c *gin.Context) {
	contentType := c.GetHeader("Content-Type")

	// Multipart/form-data untuk upload file.
	if strings.HasPrefix(
		contentType,
		"multipart/form-data",
	) {
		c.Request.Body = http.MaxBytesReader(
			c.Writer,
			c.Request.Body,
			maxUploadSize+1024*1024,
		)

		dueAtText := c.PostForm("due_at")

		dueAt, err := time.Parse(
			time.RFC3339,
			dueAtText,
		)

		if err != nil {
			c.JSON(400, gin.H{
				"error": "format due_at tidak valid",
			})
			return
		}

		classIDText := c.PostForm("class_id")

		var classID uint

		if _, err := fmt.Sscanf(
			classIDText,
			"%d",
			&classID,
		); err != nil {
			c.JSON(400, gin.H{
				"error": "class_id tidak valid",
			})
			return
		}

		fileURL, err := saveUploadedFile(c)

		if err != nil {
			c.JSON(400, gin.H{
				"error": err.Error(),
			})
			return
		}

		status := c.PostForm("status")

		if status == "" {
			status = "Aktif"
		}

		row := models.Assignment{
			Title:       c.PostForm("title"),
			Description: c.PostForm("description"),
			FileURL:     fileURL,
			DueAt:       dueAt,
			Status:      status,
			ClassID:     classID,
			CreatedBy:   c.MustGet("user_id").(uint),
		}

		if row.Title == "" {
			c.JSON(400, gin.H{
				"error": "judul tugas wajib diisi",
			})
			return
		}

		if err := h.DB.Create(&row).Error; err != nil {
			c.JSON(400, gin.H{
				"error": err.Error(),
			})
			return
		}

		h.DB.Preload("Class").First(&row, row.ID)

		c.JSON(201, row)
		return
	}

	// JSON biasa tetap didukung.
	var req assignmentRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{
			"error": err.Error(),
		})
		return
	}

	row := models.Assignment{
		Title:       req.Title,
		Description: req.Description,
		FileURL:     req.FileURL,
		DueAt:       req.DueAt,
		Status:      req.Status,
		ClassID:     req.ClassID,
		CreatedBy:   c.MustGet("user_id").(uint),
	}

	if row.Status == "" {
		row.Status = "Aktif"
	}

	if err := h.DB.Create(&row).Error; err != nil {
		c.JSON(400, gin.H{
			"error": err.Error(),
		})
		return
	}

	h.DB.Preload("Class").First(&row, row.ID)

	c.JSON(201, row)
}

func (h *AssignmentHandler) Update(c *gin.Context) {
	var row models.Assignment

	if h.DB.
		Where(
			"id = ? AND created_by = ?",
			c.Param("id"),
			c.MustGet("user_id"),
		).
		First(&row).Error != nil {

		c.JSON(404, gin.H{
			"error": "tugas tidak ditemukan",
		})

		return
	}

	contentType := c.GetHeader("Content-Type")

	// Update dengan kemungkinan file baru.
	if strings.HasPrefix(
		contentType,
		"multipart/form-data",
	) {
		c.Request.Body = http.MaxBytesReader(
			c.Writer,
			c.Request.Body,
			maxUploadSize+1024*1024,
		)

		dueAtText := c.PostForm("due_at")

		dueAt, err := time.Parse(
			time.RFC3339,
			dueAtText,
		)

		if err != nil {
			c.JSON(400, gin.H{
				"error": "format due_at tidak valid",
			})
			return
		}

		classIDText := c.PostForm("class_id")

		var classID uint

		if _, err := fmt.Sscanf(
			classIDText,
			"%d",
			&classID,
		); err != nil {
			c.JSON(400, gin.H{
				"error": "class_id tidak valid",
			})
			return
		}

		row.Title = c.PostForm("title")
		row.Description = c.PostForm("description")
		row.DueAt = dueAt
		row.ClassID = classID

		status := c.PostForm("status")

		if status == "" {
			status = "Aktif"
		}

		row.Status = status

		fileURL, err := saveUploadedFile(c)

		if err != nil {
			c.JSON(400, gin.H{
				"error": err.Error(),
			})
			return
		}

		if fileURL != "" {
			row.FileURL = fileURL
		}

		if err := h.DB.Save(&row).Error; err != nil {
			c.JSON(500, gin.H{
				"error": err.Error(),
			})
			return
		}

		h.DB.Preload("Class").First(&row, row.ID)

		c.JSON(200, row)
		return
	}

	// Update JSON biasa.
	var req assignmentRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{
			"error": err.Error(),
		})
		return
	}

	row.Title = req.Title
	row.Description = req.Description
	row.FileURL = req.FileURL
	row.DueAt = req.DueAt
	row.Status = req.Status
	row.ClassID = req.ClassID

	if err := h.DB.Save(&row).Error; err != nil {
		c.JSON(500, gin.H{
			"error": err.Error(),
		})
		return
	}

	h.DB.Preload("Class").First(&row, row.ID)

	c.JSON(200, row)
}

func (h *AssignmentHandler) Delete(c *gin.Context) {
	var row models.Assignment

	result := h.DB.
		Where(
			"id = ? AND created_by = ?",
			c.Param("id"),
			c.MustGet("user_id"),
		).
		First(&row)

	if result.Error != nil {
		c.JSON(404, gin.H{
			"error": "tugas tidak ditemukan",
		})
		return
	}

	// Hapus file fisik kalau ada.
	if row.FileURL != "" &&
		strings.HasPrefix(row.FileURL, "/uploads/") {

		filename := filepath.Base(
			row.FileURL,
		)

		_ = os.Remove(
			filepath.Join(
				"uploads",
				filename,
			),
		)
	}

	if err := h.DB.Delete(
		&row,
	).Error; err != nil {

		c.JSON(500, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.Status(204)
}
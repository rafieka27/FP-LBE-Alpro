package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/your-org/myits-recap-backend/internal/config"
	"github.com/your-org/myits-recap-backend/internal/middleware"
	"github.com/your-org/myits-recap-backend/internal/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"net/http"
	"time"
)

type AuthHandler struct {
	DB  *gorm.DB
	Cfg config.Config
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var user models.User
	if err := h.DB.Where("lower(email) = lower(?)", req.Email).First(&user).Error; err != nil || bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)) != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "email atau password salah"})
		return
	}
	exp := time.Now().Add(time.Duration(h.Cfg.JWTExpiresHour) * time.Hour)
	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, middleware.Claims{UserID: user.ID, Role: string(user.Role), RegisteredClaims: jwt.RegisteredClaims{ExpiresAt: jwt.NewNumericDate(exp), IssuedAt: jwt.NewNumericDate(time.Now())}}).SignedString([]byte(h.Cfg.JWTSecret))
	if err != nil {
		c.JSON(500, gin.H{"error": "could not sign token"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": token, "user": user})
}
func (h *AuthHandler) Me(c *gin.Context) {
	id := c.MustGet("user_id").(uint)
	var user models.User
	if err := h.DB.First(&user, id).Error; err != nil {
		c.JSON(404, gin.H{"error": "user not found"})
		return
	}
	c.JSON(200, user)
}

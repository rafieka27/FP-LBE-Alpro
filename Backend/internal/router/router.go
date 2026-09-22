package router

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/your-org/myits-recap-backend/internal/config"
	"github.com/your-org/myits-recap-backend/internal/handlers"
	"github.com/your-org/myits-recap-backend/internal/middleware"
	"gorm.io/gorm"
)

func Setup(db *gorm.DB, cfg config.Config) *gin.Engine {
	r := gin.Default()

	r.Static("/uploads", "./uploads")

	r.Use(func(c *gin.Context) {
		origin := c.GetHeader("Origin")

		if origin == "http://localhost:3000" ||
			origin == "https://fp-lbe-alpro-bots.vercel.app" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		}

		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	auth := &handlers.AuthHandler{
		DB:  db,
		Cfg: cfg,
	}

	r.POST("/api/auth/login", auth.Login)

	api := r.Group("/api")
	api.Use(middleware.Auth(cfg.JWTSecret))

	api.GET("/me", auth.Me)

	classes := &handlers.ClassHandler{
		DB: db,
	}

	cg := api.Group("/classes")
	cg.GET("", classes.List)

	cg.Use(middleware.RequireRoles("dosen"))

	cg.POST("", classes.Create)
	cg.PUT("/:id", classes.Update)
	cg.DELETE("/:id", classes.Delete)
	cg.POST("/:id/students", classes.AddStudent)
	cg.DELETE("/:id/students/:studentId", classes.RemoveStudent)

	assign := &handlers.AssignmentHandler{
		DB: db,
	}

	ag := api.Group("/assignments")
	ag.GET("", assign.List)

	ag.Use(middleware.RequireRoles("dosen"))

	ag.POST("", assign.Create)
	ag.PUT("/:id", assign.Update)
	ag.DELETE("/:id", assign.Delete)

	grades := &handlers.GradeHandler{
		DB: db,
	}

	gg := api.Group("/grades")
	gg.Use(middleware.RequireRoles("dosen", "asisten"))

	gg.GET("", grades.List)
	gg.POST("", grades.Upsert)

	studentGrades := api.Group("/students/:studentId")
	studentGrades.Use(middleware.RequireRoles("mahasiswa"))

	studentGrades.GET("/grades", grades.StudentGrades)

	r.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "route not found",
		})
	})

	return r
}

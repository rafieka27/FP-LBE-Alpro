package main

import (
	"github.com/your-org/myits-recap-backend/internal/config"
	"github.com/your-org/myits-recap-backend/internal/database"
	"github.com/your-org/myits-recap-backend/internal/models"
	"github.com/your-org/myits-recap-backend/internal/router"
	"log"
)

func main() {
	cfg := config.Load()
	db := database.Connect(cfg.DatabaseURL)
	if err := db.AutoMigrate(&models.User{}, &models.Class{}, &models.Enrollment{}, &models.Assignment{}, &models.Grade{}); err != nil {
		log.Fatalf("migration failed: %v", err)
	}
	database.Seed(db)
	r := router.Setup(db, cfg)
	log.Printf("myITS Recap backend listening on :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}

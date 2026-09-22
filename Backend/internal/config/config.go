package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port           string
	DatabaseURL    string
	JWTSecret      string
	JWTExpiresHour int
}

func Load() Config {
	_ = godotenv.Load()

	hours, err := strconv.Atoi(getenv("JWT_EXPIRES_HOURS", "24"))
	if err != nil || hours <= 0 {
		hours = 24
	}

	return Config{
		Port: getenv("PORT", "8080"),
		DatabaseURL: getenv(
			"DATABASE_URL",
			"host=127.0.0.1 user=postgres password=postgres dbname=myits_recap port=5432 sslmode=disable TimeZone=Asia/Jakarta",
		),
		JWTSecret: getenv(
			"JWT_SECRET",
			"development-only-secret",
		),
		JWTExpiresHour: hours,
	}
}

func getenv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}

	return fallback
}

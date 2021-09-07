package main

import (
	"github.com/bzeeno/RealTimeChat/database"
	"github.com/bzeeno/RealTimeChat/routes"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	mongo_client := database.Connect()              // connect to database
	defer mongo_client.Disconnect(database.Context) // defer disconnect to database

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowCredentials: true,
	}))

	routes.Setup(app) // setup routes

	app.Listen(":8000")
}

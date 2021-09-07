package routes

import (
	"github.com/bzeeno/RealTimeChat/api"
	"github.com/gofiber/fiber/v2"
)

func Setup(app *fiber.App) {
	app.Post("/api/register", api.Register)
	app.Post("/api/login", api.Login)
	app.Get("/api/getuser", api.GetUser)
	app.Post("/api/logout", api.Logout)
}

func GetHome(c *fiber.Ctx) error {
	return c.SendString("Home")
}

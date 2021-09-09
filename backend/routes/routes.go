package routes

import (
	"github.com/bzeeno/RealTimeChat/api"
	"github.com/gofiber/fiber/v2"
)

func Setup(app *fiber.App) {
	// Authentication
	app.Post("/api/register", api.Register)
	app.Post("/api/login", api.Login)
	app.Get("/api/getuser", api.GetUser)
	app.Post("/api/logout", api.Logout)
	// Friends
	app.Post("/api/add-friend", api.AddFriend)
	app.Post("/api/remove-friend", api.RemoveFriend)
}

func GetHome(c *fiber.Ctx) error {
	return c.SendString("Home")
}

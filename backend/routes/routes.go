package routes

import (
	"github.com/bzeeno/RealTimeChat/api"
	"github.com/gofiber/fiber/v2"
)

func Setup(app *fiber.App) {
	// Authentication
	app.Post("/api/register", api.Register)
	app.Post("/api/login", api.Login)
	app.Get("/api/getuser", api.GetUserAuth)
	app.Post("/api/logout", api.Logout)
	// Friends
	app.Get("/api/get-friends", api.GetFriends)
	app.Get("/api/get-friend-reqs", api.GetFriendReqs)
	app.Post("/api/get-friend-info", api.GetFriendInfo)
	app.Post("/api/add-friend", api.AddFriend)
	app.Post("/api/remove-friend", api.RemoveFriend)
	app.Post("/api/search-friend", api.SearchUsers)
	app.Post("/api/check-friend", api.CheckIfFriends)
}

func GetHome(c *fiber.Ctx) error {
	return c.SendString("Home")
}

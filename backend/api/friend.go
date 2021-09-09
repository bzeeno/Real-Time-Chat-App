package api

import (
	"github.com/bzeeno/RealTimeChat/database"
	"github.com/bzeeno/RealTimeChat/models"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
)

// Search for friends to add
func SearchUsers(c *fiber.Ctx) error {
	var data map[string]string
	userCollection := database.DB.Collection("users")
	var user models.User
	var users_search []models.User

	if err := c.BodyParser(&data); err != nil {
		return err
	}

	if err := userCollection.FindOne(database.Context, bson.M{"_id": data["user_id"]}).Decode(&user); err != nil { // Get user who is adding friend with specified id
		c.Status(fiber.StatusNotFound) // if user not found:
		return c.JSON(fiber.Map{       // send message
			"message": "You Are Not Logged In",
		})
	}

	if cursor, err := userCollection.Find(database.Context, bson.M{"username": data["username"]}).Decode(&users_search); err != nil { // Get friend who user is trying to add
		c.Status(fiber.StatusNotFound) // if user not found:
		return c.JSON(fiber.Map{       // send message
			"message": "User Not Found",
		})
	}

}

// Add friend (Takes in: ids for user and friend | Returns: message)
func AddFriend(c *fiber.Ctx) error {
	var data map[string]string
	userCollection := database.DB.Collection("users")
	var user, friend models.User

	if err := c.BodyParser(&data); err != nil {
		return err
	}

	if err := userCollection.FindOne(database.Context, bson.M{"_id": data["user_id"]}).Decode(&user); err != nil { // Get user who is adding friend with specified id
		c.Status(fiber.StatusNotFound) // if user not found:
		return c.JSON(fiber.Map{       // send message
			"message": "You Are Not Logged In",
		})
	}

	if err := userCollection.FindOne(database.Context, bson.M{"_id": data["friend_id"]}).Decode(&friend); err != nil { // Get friend who user is trying to add
		c.Status(fiber.StatusNotFound) // if user not found:
		return c.JSON(fiber.Map{       // send message
			"message": "User Not Found",
		})
	}

	user.Friends = append(user.Friends, friend.ID)
	return c.JSON(fiber.Map{
		"message": "Success",
	})

}

// Remove friend
func RemoveFriend(c *fiber.Ctx) error {
	var data map[string]string
	userCollection := database.DB.Collection("users")
	var user, friend models.User

	if err := c.BodyParser(&data); err != nil {
		return err
	}

	if err := userCollection.FindOne(database.Context, bson.M{"_id": data["user_id"]}).Decode(&user); err != nil { // Get user who is adding friend with specified id
		c.Status(fiber.StatusNotFound) // if user not found:
		return c.JSON(fiber.Map{       // send message
			"message": "You Are Not Logged In",
		})
	}

	if err := userCollection.FindOne(database.Context, bson.M{"_id": data["friend_id"]}).Decode(&friend); err != nil { // Get friend who user is trying to add
		c.Status(fiber.StatusNotFound) // if user not found:
		return c.JSON(fiber.Map{       // send message
			"message": "User Not Found",
		})
	}

	// Remove friend from user's list
	for i, friend_id := range user.Friends {
		if friend_id == friend.ID {
			user.Friends = append(user.Friends[:i], user.Friends[i+1:]...)
		}
	}

	// Remove user from friend's list
	for i, user_id := range friend.Friends {
		if user_id == user.ID {
			friend.Friends = append(friend.Friends[:i], friend.Friends[i+1:]...)
		}
	}

	return c.JSON(fiber.Map{
		"message": "Success",
	})
}

// Get all friends

// Get messages w/friend

// Get user helper function
func getUserHelper(c *fiber.Ctx, user *models.User, data *map[string]string) error {
	userCollection := database.DB.Collection("users")

	if err := userCollection.FindOne(database.Context, bson.M{"_id": (*data)["user_id"]}).Decode(user); err != nil { // Get user who is adding friend with specified id
		c.Status(fiber.StatusNotFound) // if user not found:
		return c.JSON(fiber.Map{       // send message
			"message": "You Are Not Logged In",
		})
	} else {
		return nil
	}
}

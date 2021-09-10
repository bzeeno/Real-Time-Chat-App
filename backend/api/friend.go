package api

import (
	"fmt"

	"github.com/bzeeno/RealTimeChat/database"
	"github.com/bzeeno/RealTimeChat/models"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
)

// Search for friends to add
func SearchUsers(c *fiber.Ctx) error {
	var data map[string]string
	userCollection := database.DB.Collection("users")
	//var user models.User
	var search_results []bson.M

	if err := c.BodyParser(&data); err != nil {
		return err
	}

	err := GetUser(c)
	if err != nil {
		c.Status(fiber.StatusNotFound) // if user not found:
		return c.JSON(fiber.Map{       // send message
			"message": "Unauthorized",
		})
	}

	cursor, err := userCollection.Find(database.Context, bson.M{"username": data["username"]})
	if err != nil { // Get friend who user is trying to add
		c.Status(fiber.StatusNotFound) // if user not found:
		return c.JSON(fiber.Map{       // send message
			"message": "User Not Found",
		})
	}

	if err := cursor.All(database.Context, &search_results); err != nil {
		c.Status(fiber.StatusNotFound) // if user not found:
		return c.JSON(fiber.Map{       // send message
			"message": "User Not Found",
		})
	}

	return c.JSON(search_results)
}

// Add friend (Takes in: ids for user and friend | Returns: message)
func AddFriend(c *fiber.Ctx) error {
	var data map[string]string
	userCollection := database.DB.Collection("users")
	var friend models.User

	if err := c.BodyParser(&data); err != nil {
		return err
	}

	user := GetUser(c)
	fmt.Println(user)

	if err := userCollection.FindOne(database.Context, bson.M{"_id": data["friend_id"]}).Decode(&friend); err != nil { // Get friend who user is trying to add
		c.Status(fiber.StatusNotFound) // if user not found:
		return c.JSON(fiber.Map{       // send message
			"message": "User Not Found",
		})
	}

	//user.Friends = append(user.Friends, friend.ID)
	return c.JSON(fiber.Map{
		"message": "Success",
	})

}

// Remove friend
func RemoveFriend(c *fiber.Ctx) error {
	var data map[string]string
	var user, friend models.User

	if err := c.BodyParser(&data); err != nil {
		return err
	}

	// Get user
	user = getUserHelper(data["user_id"])

	if user.UserName == "" { // if user not found:
		c.Status(fiber.StatusNotFound)
		return c.JSON(fiber.Map{ // send message
			"message": "You Are Not Logged In",
		})
	}

	// Get friend
	friend = getUserHelper(data["friend_id"])

	if friend.UserName == "" { // if user not found:
		c.Status(fiber.StatusNotFound)
		return c.JSON(fiber.Map{ // send message
			"message": "You Are Not Logged In",
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

// Check if current user and requested user are friends
func CheckIfFriends(c *fiber.Ctx) error {
	var data map[string]string
	var user, friend models.User

	if err := c.BodyParser(&data); err != nil {
		return err
	}

	// Get user
	user = getUserHelper(data["user_id"])

	if user.UserName == "" { // if user not found:
		c.Status(fiber.StatusNotFound)
		return c.JSON(fiber.Map{ // send message
			"message": "You Are Not Logged In",
		})
	}

	// Get friend
	friend = getUserHelper(data["friend_id"])

	if friend.UserName == "" { // if user not found:
		c.Status(fiber.StatusNotFound)
		return c.JSON(fiber.Map{ // send message
			"message": "You Are Not Logged In",
		})
	}

	// Check if friend is in user's list
	friend_in_user := false
	for _, friend_id := range user.Friends {
		if friend_id == friend.ID {
			friend_in_user = true
		}
	}

	// if friend not in user's list, they are not friends
	if !friend_in_user {
		return c.JSON(fiber.Map{
			"message": "false",
		})
	}

	// check if user is in friend's list
	for _, user_id := range friend.Friends {
		if user_id == user.ID {
			return c.JSON(fiber.Map{
				"message": "true",
			})
		}
	}

	return c.JSON(fiber.Map{
		"message": "false",
	})
}

// Get messages w/friend

// Get user helper function
func getUserHelper(user_id string) models.User {
	var user models.User
	userCollection := database.DB.Collection("users")

	userCollection.FindOne(database.Context, bson.M{"_id": user_id}).Decode(&user) // Get user who is adding friend with specified id
	return (user)
}

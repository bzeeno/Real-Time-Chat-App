package api

import (
	"fmt"
	"log"

	"github.com/bzeeno/RealTimeChat/database"
	"github.com/bzeeno/RealTimeChat/models"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Get all friends
func GetAllFriends(c *fiber.Ctx) error {
	var friends_list []primitive.ObjectID
	var pending_list []primitive.ObjectID
	var isFriend bool

	user := GetUser(c) // Get user if authenticated

	friends := user.Friends // get friends list

	for _, friend_id := range friends { // loop through user's friends list
		friend := getFriend(friend_id.Hex()) // get current friend

		for _, user_id := range friend.Friends { // check if user is in friend's list
			if user_id == user.ID { // if user is in friend's list
				friends_list = append(friends_list, friend_id) // append friend id to list
				isFriend = true
				break
			}
		}
		if isFriend { // if already added friend to friend list
			isFriend = false // reset isFriend bool
		} else {
			pending_list = append(pending_list, friend_id) // otherwise, add friend to pending
		}
	}
	fmt.Println(user.Friends)
	// return friends list and pending friends
	return c.JSON(fiber.Map{
		"friends": friends_list,
		"pending": pending_list,
	})
}

// Search for friends to add
func SearchUsers(c *fiber.Ctx) error {
	var data map[string]string
	userCollection := database.DB.Collection("users")
	//var user models.User
	var search_results []bson.M

	if err := c.BodyParser(&data); err != nil {
		return err
	}

	// Make sure user who is searching is authenticated
	err := GetUserAuth(c)

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

	if err := c.BodyParser(&data); err != nil {
		return err
	}

	user := GetUser(c)

	friend := getFriend(data["friend_id"])
	if friend.UserName == "" { // if user not found:
		c.Status(fiber.StatusNotFound)
		return c.JSON(fiber.Map{ // send message
			"message": "Could not find user",
		})
	}

	user.Friends = append(user.Friends, friend.ID)
	update_field := bson.D{primitive.E{Key: "Friends", Value: user.Friends}}

	_, err := userCollection.UpdateOne(database.Context, bson.M{"_id": user.ID}, bson.D{
		{"$set", update_field},
	})
	if err != nil {
		log.Fatal(err)
	}

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
	user = GetUser(c)

	if user.UserName == "" { // if user not found:
		c.Status(fiber.StatusNotFound)
		return c.JSON(fiber.Map{ // send message
			"message": "You Are Not Logged In",
		})
	}

	// Get friend
	friend = getFriend(data["friend_id"])

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

// Check if current user and requested user are friends
func CheckIfFriends(c *fiber.Ctx) error {
	var data map[string]string
	var user, friend models.User

	if err := c.BodyParser(&data); err != nil {
		return err
	}

	// Get user
	user = GetUser(c)

	// Get friend
	friend = getFriend(data["friend_id"])

	if friend.UserName == "" { // if user not found:
		c.Status(fiber.StatusNotFound)
		return c.JSON(fiber.Map{ // send message
			"message": "Could not find user",
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
func getFriend(user_id string) models.User {
	var user models.User
	userCollection := database.DB.Collection("users")

	objID, _ := primitive.ObjectIDFromHex(user_id)

	userCollection.FindOne(database.Context, bson.M{"_id": objID}).Decode(&user) // Get user who is adding friend with specified id
	return (user)
}

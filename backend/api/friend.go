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
func GetFriends(c *fiber.Ctx) error {
	user := GetUser(c) // Get user if authenticated

	friends := user.Friends // get friends list

	// return friends list and pending friends
	return c.JSON(fiber.Map{
		"friends": friends,
	})
}

// Get friend requests
func GetFriendReqs(c *fiber.Ctx) error {
	user := GetUser(c)
	requests := user.FriendReqs

	return c.JSON(fiber.Map{
		"requests": requests,
	})
}

func GetFriendInfo(c *fiber.Ctx) error {
	var data map[string]string
	var friend models.User

	if err := c.BodyParser(&data); err != nil {
		return err
	}

	// Get friend
	friend = getFriend(data["friend_id"])

	if friend.UserName == "" { // if user not found:
		c.Status(fiber.StatusNotFound)
		return c.JSON(fiber.Map{ // send message
			"message": "Could not find user",
		})
	}

	return c.JSON(fiber.Map{
		"username":    friend.UserName,
		"profile_pic": friend.ProfilePic,
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
	user := GetUser(c)
	if user.UserName == data["username"] {
		return c.JSON(fiber.Map{ // send message
			"message": "That's You!",
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
	var friend_is_pending bool
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
	// Check if user has already sent a friend request
	for _, user_id := range friend.FriendReqs {
		if user_id == user.ID {
			return c.JSON(fiber.Map{
				"message": "You have already sent a friend request.",
			})
		}
	}
	// Check if friend is in user's list
	for _, friend_id := range user.Friends {
		if friend_id == friend.ID {
			return c.JSON(fiber.Map{
				"message": "You are already friends!",
			})
		}
	}

	for i, pending_friend := range user.FriendReqs { // for pending_friend in user's friend requests
		if pending_friend == friend.ID { // if friend is in pending requests
			// add friend to user's friend list
			user.Friends = append(user.Friends, friend.ID)
			update_field := bson.D{primitive.E{Key: "friends", Value: user.Friends}}
			_, err := userCollection.UpdateOne(database.Context, bson.M{"_id": user.ID}, bson.D{
				{"$set", update_field},
			})
			if err != nil {
				log.Fatal(err)
			}
			// add user to friend's friend list
			friend.Friends = append(friend.Friends, user.ID)
			fmt.Println("Friend's friends: ", friend.Friends)
			update_field = bson.D{primitive.E{Key: "friends", Value: friend.Friends}}
			_, err = userCollection.UpdateOne(database.Context, bson.M{"_id": friend.ID}, bson.D{
				{"$set", update_field},
			})
			if err != nil {
				log.Fatal(err)
			}

			// remove friend from pending requests
			new_friend_reqs := append(user.FriendReqs[:i], user.FriendReqs[i+1:]...)
			fmt.Println("Friend reqs: ", new_friend_reqs)
			update_field = bson.D{primitive.E{Key: "friend_reqs", Value: new_friend_reqs}}
			_, err = userCollection.UpdateOne(database.Context, bson.M{"_id": user.ID}, bson.D{
				{"$set", update_field},
			})
			if err != nil {
				log.Fatal(err)
			}
			friend_is_pending = true
			return c.JSON(fiber.Map{
				"message": "Successfully added friend",
			})
		}
	}
	if !friend_is_pending { // if friend is not in pending request
		// add user to friend's pending list
		friend.FriendReqs = append(friend.FriendReqs, user.ID)
		update_field := bson.D{primitive.E{Key: "friend_reqs", Value: friend.FriendReqs}}

		_, err := userCollection.UpdateOne(database.Context, bson.M{"_id": friend.ID}, bson.D{
			{"$set", update_field},
		})
		if err != nil {
			log.Fatal(err)
		}
		return c.JSON(fiber.Map{
			"message": "Friend request sent",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Something went wrong",
	})

}

// Remove friend
func RemoveFriend(c *fiber.Ctx) error {
	var data map[string]string
	var user, friend models.User
	userCollection := database.DB.Collection("users")

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
			break
		}
	}
	update_field := bson.D{primitive.E{Key: "friends", Value: user.Friends}}
	_, err := userCollection.UpdateOne(database.Context, bson.M{"_id": user.ID}, bson.D{
		{"$set", update_field},
	})
	if err != nil {
		log.Fatal(err)
	}

	// Remove user from friend's list
	for i, user_id := range friend.Friends {
		if user_id == user.ID {
			friend.Friends = append(friend.Friends[:i], friend.Friends[i+1:]...)
			break
		}
	}
	update_field = bson.D{primitive.E{Key: "friends", Value: friend.Friends}}
	_, err = userCollection.UpdateOne(database.Context, bson.M{"_id": friend.ID}, bson.D{
		{"$set", update_field},
	})
	if err != nil {
		log.Fatal(err)
	}

	return c.JSON(fiber.Map{
		"message": "Friend has been removed",
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

package chat

import (
	"log"

	"github.com/bzeeno/RealTimeChat/database"
	"github.com/bzeeno/RealTimeChat/models"
	"github.com/gofiber/websocket/v2"
	"github.com/golang-jwt/jwt"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

const SECRET_KEY = "secret"

type ReturnMessage struct {
	User string `json:"user"`
	Text string `json:"text"`
}

func Reader(c *websocket.Conn) {
	log.Println("room id: ", c.Params("id")) // 123
	room_id, _ := primitive.ObjectIDFromHex(c.Params("id"))
	roomCollection := database.DB.Collection("rooms")
	var room models.Room

	if err := roomCollection.FindOne(database.Context, bson.M{"_id": room_id}).Decode(&room); err != nil { // Get room with specified id
		log.Println("Couldn't get room")
		return
	}

	for {
		_, msg, err := c.ReadMessage()
		if err != nil {
			log.Println("Error in read: ", err)
			return
		}
		log.Println("received msg: ", string(msg))

		// Get user who sent message
		cookie := c.Cookies("jwt")

		userCollection := database.DB.Collection("users")
		var user models.User

		token, err := jwt.ParseWithClaims(cookie, &jwt.StandardClaims{}, func(token *jwt.Token) (interface{}, error) { // Get token
			return []byte(SECRET_KEY), nil
		})
		if err != nil {
			return
		}

		claims := token.Claims.(*jwt.StandardClaims)
		objID, err := primitive.ObjectIDFromHex(claims.Issuer) // convert issuer in claims to mongo objectID
		if err != nil {
			return
		}

		if err := userCollection.FindOne(database.Context, bson.M{"_id": objID}).Decode(&user); err != nil { // Get user with specified id
			return
		}

		// set username to currently logged in user
		// set text to the received message
		//return_message := ReturnMessage{User: user.UserName, Text: string(msg)}
		return_message := models.Message{User: user.UserName, Text: string(msg)}

		// Add new message to database
		new_messages := append(room.Messages, return_message)
		update_field := bson.D{primitive.E{Key: "messages", Value: new_messages}}
		_, err = roomCollection.UpdateOne(database.Context, bson.M{"_id": room_id}, bson.D{
			{"$set", update_field},
		})
		if err != nil {
			log.Fatal(err)
		}

		if err := c.WriteJSON(return_message); err != nil { // write return message
			log.Println("Error in write: ", err)
			return
		}
	}
}

func Connect(c *websocket.Conn) {
	// c.Locals is added to the *websocket.Conn
	log.Println(c.Locals("allowed")) // true
	log.Println(c.Params("id"))      // 123
	log.Println(c.Query("v"))        // 1.0
	log.Println(c.Cookies("jwt"))    // ""

	// websocket.Conn bindings https://pkg.go.dev/github.com/fasthttp/websocket?tab=doc#pkg-index
	var (
		mt  int
		msg []byte
		err error
	)
	for {
		if mt, msg, err = c.ReadMessage(); err != nil {
			log.Println("read:", err)
			break
		}
		log.Printf("recv: %s", msg)

		if err = c.WriteMessage(mt, msg); err != nil {
			log.Println("write:", err)
			break
		}
	}
}

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
		return_message := ReturnMessage{User: user.UserName, Text: string(msg)}

		if err := c.WriteJSON(return_message); err != nil {
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

package chat

import (
	"fmt"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	socketio "github.com/googollee/go-socket.io"
)

func Chat(c *fiber.Ctx) error {
	id := c.Params("id")
	fmt.Println("ID: ", id)

	server := socketio.NewServer(nil)

	server.OnConnect("connection", func(so socketio.Conn) error {
		fmt.Println("new connection")
		return c.JSON(fiber.Map{
			"message": "huuhhhhh",
		})
	})
	return c.JSON(fiber.Map{
		"message": "yuhhhhhhhh",
	})
}

func Reader(c *websocket.Conn) {
	for {
		mt, msg, err := c.ReadMessage()
		if err != nil {
			log.Println("Error in read: ", err)
			return
		}
		log.Println("received msg: ", string(msg))

		if err := c.WriteMessage(mt, msg); err != nil {
			log.Println("Error in write: ", err)
			return
		}
	}
}

func Connect(c *websocket.Conn) {
	// c.Locals is added to the *websocket.Conn
	log.Println(c.Locals("allowed"))  // true
	log.Println(c.Params("id"))       // 123
	log.Println(c.Query("v"))         // 1.0
	log.Println(c.Cookies("session")) // ""

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

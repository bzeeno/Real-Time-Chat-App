package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var mongoURI = "mongodb://localhost:27017"

type Room struct {
	ID       primitive.ObjectID   `json:"_id,omitempty" bson:"_id,omitempty"`
	Name     string               `json:"name" bson:"name"`
	People   []primitive.ObjectID `json:"people" bson:"people"`
	Messages []Message            `json:"messages" bson:"messages"`
}

type Message struct {
	name, text string
}

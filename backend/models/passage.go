package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Passage struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Text      string             `bson:"text" json:"text"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
}
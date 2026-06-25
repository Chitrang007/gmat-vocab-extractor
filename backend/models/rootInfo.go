package models

type RootInfo struct {
	Root      string   `json:"root" bson:"root"`
	Meaning   string   `json:"meaning" bson:"meaning"`
	Prefixes  []string `json:"prefixes" bson:"prefixes"`
	Suffixes  []string `json:"suffixes" bson:"suffixes"`
	Breakdown string   `json:"breakdown" bson:"breakdown"`
}
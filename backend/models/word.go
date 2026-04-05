package models

type Word struct {
	Word          string   `json:"word" bson:"word"`
	Definition    string   `json:"definition"`
	ContextSentence string `json:"contextSentence"`
	Synonyms      []string `json:"synonyms"`
	Difficulty    string   `json:"difficulty"`
	PartOfSpeech  string   `json:"partOfSpeech"`
}
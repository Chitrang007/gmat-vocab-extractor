package models

type Word struct {
	Word            string   `json:"word" bson:"word"`
	Definition      string   `json:"definition" bson:"definition"`
	ContextSentence string   `json:"contextSentence" bson:"context_sentence"`
	Synonyms        []string `json:"synonyms" bson:"synonyms"`
	Antonyms        []string `json:"antonyms" bson:"antonyms"`
	Difficulty      string   `json:"difficulty" bson:"difficulty"`
	PartOfSpeech    string   `json:"partOfSpeech" bson:"part_of_speech"`
}
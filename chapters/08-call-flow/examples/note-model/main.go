package main

import (
	"encoding/json"
	"fmt"
	"log"
)

type Note struct {
	Title   string `json:"title"`
	Content string `json:"content"`
}

func main() {
	note := Note{
		Title:   "学习笔记",
		Content: "今天读懂调用过程。",
	}
	data, err := json.MarshalIndent(note, "", "  ")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(string(data))
}

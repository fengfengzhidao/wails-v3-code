package main

import (
	"encoding/json"
	"fmt"
	"log"
)

type Note struct {
	ID      string `json:"id"`
	Title   string `json:"title"`
	Content string `json:"content"`
}

func main() {
	notes := []Note{
		{ID: "note-001", Title: "学习笔记", Content: "今天确认保存链路。"},
		{ID: "note-002", Title: "练习安排", Content: "明天完成一个小扩展。"},
	}
	data, err := json.MarshalIndent(notes, "", "  ")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(string(data))
}

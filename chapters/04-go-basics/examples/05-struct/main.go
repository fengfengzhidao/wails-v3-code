package main

import "fmt"

type Note struct {
	Title string
	Saved bool
}

func main() {
	note := Note{Title: "我的便笺", Saved: true}
	fmt.Println(note.Title, note.Saved)
}

package main

import "fmt"

func greet(name string) string {
	return "你好，" + name
}

func main() {
	message := greet("小明")
	fmt.Println(message)
}

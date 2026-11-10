package main

import "fmt"

type GreetService struct{}

func (g *GreetService) Greet(name string) string {
	return "你好，" + name
}

func main() {
	service := &GreetService{}
	message := service.Greet("小明")
	fmt.Println(message)
}

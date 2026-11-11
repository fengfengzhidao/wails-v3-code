package main

import (
	"fmt"
	"strings"
)

type GreetService struct{}

func (g *GreetService) Greet(name string) (string, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		return "", fmt.Errorf("请输入姓名")
	}
	return "你好，" + name + "！欢迎学习 Wails v3。", nil
}

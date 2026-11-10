package main

import (
	"fmt"
	"strings"
)

func greet(name string) (string, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		return "", fmt.Errorf("请输入姓名")
	}
	return "你好，" + name, nil
}

func main() {
	message, err := greet("小明")
	if err != nil {
		fmt.Println("操作失败", err)
		return
	}
	fmt.Println(message)
}

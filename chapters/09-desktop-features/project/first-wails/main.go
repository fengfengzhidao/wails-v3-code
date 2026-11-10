package main

import (
	"embed"
	"log"
	"path/filepath"
	"time"

	"github.com/wailsapp/wails/v3/pkg/events"

	"github.com/wailsapp/wails/v3/pkg/application"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	fixtureDir, err := filepath.Abs("fixtures")
	if err != nil {
		log.Fatal(err)
	}
	noteService, err := NewNoteService()
	if err != nil {
		log.Fatal(err)
	}

	app := application.New(application.Options{
		Name:        "first-wails",
		Description: "Wails v3 零基础便笺示例",
		Services: []application.Service{
			application.NewService(&GreetService{}),
			application.NewService(noteService),
			application.NewService(&LifecycleService{}),
		},
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
	})

	app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title:            "我的 Wails 便笺",
		Width:            900,
		Height:           700,
		BackgroundColour: application.NewRGB(245, 247, 251),
		URL:              "/",
	})

	app.Event.On("note:time-request", func(event *application.CustomEvent) {
		app.Event.Emit("note:time", time.Now().Format("15:04:05"))
	})
	app.Event.OnApplicationEvent(events.Common.ApplicationStarted, func(event *application.ApplicationEvent) {
		path, err := app.Dialog.OpenFile().
			SetTitle("选择一个文本文件").
			SetDirectory(fixtureDir).
			AddFilter("文本文件", "*.txt").
			PromptForSingleSelection()
		if err != nil {
			log.Println("文件选择未完成", err)
			return
		}
		if path == "" {
			log.Println("第9章 未选择文件")
			return
		}
		log.Println("第9章 选中的文件", path)
	})

	if err := app.Run(); err != nil {
		log.Fatal(err)
	}
}

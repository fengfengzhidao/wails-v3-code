package main

import (
	"embed"
	"log"

	"github.com/wailsapp/wails/v3/pkg/application"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
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

	if err := app.Run(); err != nil {
		log.Fatal(err)
	}
}

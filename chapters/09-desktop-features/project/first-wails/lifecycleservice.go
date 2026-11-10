package main

import (
	"context"
	"log"

	"github.com/wailsapp/wails/v3/pkg/application"
)

type LifecycleService struct{}

func (s *LifecycleService) ServiceStartup(ctx context.Context, options application.ServiceOptions) error {
	log.Println("第9章 服务启动")
	return nil
}

func (s *LifecycleService) ServiceShutdown() error {
	log.Println("第9章 服务退出")
	return nil
}

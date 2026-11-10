package main

import (
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sync"
)

type NoteService struct {
	mu   sync.Mutex
	path string
}

func NewNoteService() (*NoteService, error) {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return nil, fmt.Errorf("获取用户配置目录失败 %w", err)
	}

	appDir := filepath.Join(configDir, "WailsLearningNote")
	if err := os.MkdirAll(appDir, 0700); err != nil {
		return nil, fmt.Errorf("创建便笺目录失败 %w", err)
	}

	return &NoteService{
		path: filepath.Join(appDir, "note.txt"),
	}, nil
}

func (s *NoteService) Load() (string, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	log.Println("开始加载便笺")
	content, err := os.ReadFile(s.path)
	if errors.Is(err, os.ErrNotExist) {
		return "", nil
	}
	if err != nil {
		return "", fmt.Errorf("读取便笺失败 %w", err)
	}
	return string(content), nil
}

func (s *NoteService) Save(text string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	file, err := os.CreateTemp(filepath.Dir(s.path), ".note-*.tmp")
	if err != nil {
		return fmt.Errorf("创建临时文件失败 %w", err)
	}
	tempPath := file.Name()
	defer os.Remove(tempPath)

	if _, err := file.WriteString(text); err != nil {
		_ = file.Close()
		return fmt.Errorf("写入便笺失败 %w", err)
	}
	if err := file.Close(); err != nil {
		return fmt.Errorf("关闭临时文件失败 %w", err)
	}
	if err := os.Rename(tempPath, s.path); err != nil {
		return fmt.Errorf("替换便笺文件失败 %w", err)
	}
	return nil
}

func (s *NoteService) FilePath() string {
	return s.path
}

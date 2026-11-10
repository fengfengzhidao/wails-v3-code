# 第 7 章便笺项目

本项目接着 Wails CLI v3.0.0 的 `vanilla-js` 模板，模块路径为 `example.com/learn/first-wails`。

本章增加 `NoteService`，提供读取、保存和数据文件路径三个方法。页面包含问候、多行便笺、保存状态和实际数据位置。

在本目录执行。

```powershell
gofmt -w main.go greetservice.go noteservice.go
wails3 generate bindings
wails3 dev
```

`frontend/dist/index.html` 是首次生成绑定使用的启动占位文件，开发命令会生成实际前端产物。

便笺保存在当前用户配置目录内的 `WailsLearningNote/note.txt`，具体位置显示在页面底部。编辑后点击“保存便笺”，等待成功，再关闭并重新启动验证读取。

未提交的编辑在关闭后丢失。应用按单个实例练习，保存状态会区分本次提交的快照和保存期间继续输入的内容。

练习结束，在开发终端按 `Ctrl+C`。完整步骤与验收表见[本章练习指南](../../练习指南.md)。

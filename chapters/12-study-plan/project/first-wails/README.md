# 第 12 章计数与保存快捷键练习

本工程在前一章便笺应用上加入 Unicode 码点计数与 Ctrl / Command + S 保存入口。完整步骤见[本章练习指南](../../练习指南.md)。

在此项目目录运行。

```powershell
wails3 dev
```

正式构建与运行使用以下命令。

```powershell
wails3 build
.\bin\first-wails.exe
```

计数函数在输入事件与初始读取成功后调用。快捷键匹配后，保存按钮允许操作时复用已有点击处理。保存快照、继续输入和错误提示沿用已有状态逻辑。

便笺位置为当前用户配置目录内的 `WailsLearningNote/note.txt`，实际路径显示在页面底部。

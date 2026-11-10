# 第 6 章项目示例

本项目由 Wails CLI v3.0.0 创建，模板为 `vanilla-js`，模块路径为 `example.com/learn/first-wails`。

本章完成两处修改。

- `greetservice.go` 去掉姓名首尾空白，检查空值，并返回中文问候。
- `frontend/index.html` 将标题里的 `Wails +` 改为 `Wails 课堂 ·`。

在本目录执行。

```powershell
wails3 dev
```

输入 `小明`，点击 `Greet`，返回 `你好，小明！欢迎学习 Wails v3。`。模板会短暂显示提示，并把页面里的姓名更新成输入值。

练习结束后，在开发终端按 `Ctrl+C`。完整操作步骤见[本章练习指南](../../练习指南.md)。

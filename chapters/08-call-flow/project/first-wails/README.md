# 第 8 章调用流程工程

本工程包含问候与本地便笺功能，用于对照按钮事件、生成绑定、Go 服务和返回结果。

## 阅读顺序

1. 在 `frontend/src/main.js` 找到问候表单与保存按钮的处理函数。
2. 沿导入进入 `frontend/bindings/example.com/learn/first-wails`。
3. 在 `main.go` 查看两个服务的注册。
4. 在 `greetservice.go` 与 `noteservice.go` 查看实际方法。
5. 回到前端，找到 `await` 后的成功处理，以及 `catch` 和 `finally`。

## 启动应用

```powershell
wails3 dev
```

项目包含实际生成的绑定供阅读，后续修改服务或模型时由工具重新生成。便笺数据位置显示在页面底部。

完整讲解与独立模型练习见[本章练习指南](../../练习指南.md)。

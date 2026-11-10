# 独立字段映射练习

在此目录运行。

```powershell
go run .
```

程序把包含 `Title` 与 `Content` 字段的 Go 结构体输出为 JSON。标签指定输出字段名为 `title` 与 `content`。

`note.json` 是制作时生成的示例输出。练习包根目录的 `validate_call_flow.mjs` 会重新运行此程序，再用 JavaScript 解析并验证两个字段。

把这种模型用于 Wails 业务时，需要让服务签名返回或接收相应模型，更新前端字段访问，再生成绑定并验证调用。

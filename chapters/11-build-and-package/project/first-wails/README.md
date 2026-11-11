# 第 11 章构建与打包示例

本工程包含问候和本地便笺功能。课程基线为 Wails CLI v3.0.0，完整步骤见[本章练习指南](../../练习指南.md)。

在本项目目录执行正式构建。

```powershell
wails3 build
.\bin\first-wails.exe
```

准备 NSIS 后，生成本章使用的当前用户安装包。

```powershell
wails3 package GOOS=windows INSTALL_SCOPE=user
```

输出位于 `bin`，产品信息保存在 `build/config.yml` 与生成的 Windows 资源中。修改产品配置后，可以通过 `wails3 task common:update:build-assets` 更新平台构建资源，再构建与打包。

便笺使用当前用户配置目录中的 `WailsLearningNote/note.txt`。页面底部显示实际文件位置。

# 撤销上次提交 (undo-last-commit)

在 VSCode 状态栏和源代码管理视图的仓库标题栏添加「撤销上次提交」按钮，点击后对当前工作区执行 `git reset --soft HEAD~1`，将上次提交的改动退回到暂存区，并自动把原 commit message 还原到提交消息输入框。

## 功能

- 状态栏左侧显示回退图标（`$(debug-step-back)`），点击即撤销，无确认弹窗
- 源代码管理视图中，每个仓库标题栏的操作按钮组也提供撤销图标（hover 提示「撤销上次提交」）
- 自动扫描工作区中的 Git 仓库：单仓库直接执行，多仓库弹出快速选择框
- 撤销成功后自动把原 commit message 还原到源代码管理的提交消息输入框
- 无提交记录或非 Git 仓库时给出友好提示

## 使用方式

**方式一：状态栏按钮**
1. 打开一个 Git 仓库（支持多仓库工作区）
2. 点击左下角状态栏的回退图标
3. 多仓库时在弹出的选择框中选择目标仓库
4. 撤销完成后，提交消息输入框自动填回原 commit message

**方式二：源代码管理视图**
1. 切换到「源代码管理」面板
2. 在目标仓库的标题栏操作按钮组中点击撤销图标
3. 直接对该仓库执行撤销，提交消息自动还原

## 编译

```bash
npm install
npm run compile
```

## 打包安装

```bash
npm install -g @vscode/vsce
vsce package --allow-missing-repository --no-dependencies
code --install-extension undo-last-commit-0.0.1.vsix --force
```

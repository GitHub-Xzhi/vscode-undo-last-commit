# 撤销上次提交 / Undo Last Commit

在 VSCode 状态栏和源代码管理视图的仓库标题栏添加「撤销上次提交」按钮，点击后对当前工作区执行 `git reset --soft HEAD~1`，将上次提交的改动退回到暂存区，并自动把原 commit message 还原到提交消息输入框。

Adds an "Undo Last Commit" button to the VSCode status bar and the repository header in the Source Control view. Clicking it runs `git reset --soft HEAD~1` on the current workspace, moves the last commit's changes back to the staging area, and automatically restores the original commit message to the commit input box.

## ✨ 功能 / Features

- 状态栏左侧显示回退图标（`$(debug-step-back)`），点击即撤销，无确认弹窗
- 源代码管理视图中，每个仓库标题栏的操作按钮组也提供撤销图标（hover 提示「撤销上次提交」）
- 自动扫描工作区中的 Git 仓库：单仓库直接执行，多仓库弹出快速选择框
- 撤销成功后自动把原 commit message 还原到源代码管理的提交消息输入框
- 无提交记录或非 Git 仓库时给出友好提示

---

- Shows a rollback icon (`$(debug-step-back)`) on the left side of the status bar; click to undo instantly with no confirmation dialog
- Also provides an undo icon in the action button group of each repository header in the Source Control view (tooltip: "Undo Last Commit")
- Auto-detects Git repositories in the workspace: executes directly for a single repo, shows a quick pick for multiple repos
- Automatically restores the original commit message to the Source Control input box after a successful undo
- Shows friendly prompts when there are no commits or the folder is not a Git repository

## 🚀 使用方式 / Usage

**方式一：状态栏按钮 / Method 1: Status Bar Button**
1. 打开一个 Git 仓库（支持多仓库工作区）
2. 点击左下角状态栏的回退图标
3. 多仓库时在弹出的选择框中选择目标仓库
4. 撤销完成后，提交消息输入框自动填回原 commit message

**方式二：源代码管理视图 / Method 2: Source Control View**
1. 切换到「源代码管理」面板
2. 在目标仓库的标题栏操作按钮组中点击撤销图标
3. 直接对该仓库执行撤销，提交消息自动还原

---

**Method 1: Status Bar Button**
1. Open a Git repository (multi-repo workspaces supported)
2. Click the rollback icon in the bottom-left status bar
3. For multiple repos, pick the target repository from the quick pick
4. After undo, the commit message input box is automatically filled with the original commit message

**Method 2: Source Control View**
1. Switch to the Source Control panel
2. Click the undo icon in the action button group of the target repository header
3. Undo is executed directly on that repository, and the commit message is restored automatically

## 🔨 编译 / Build

```bash
npm install
npm run compile
```

## 📦 打包安装 / Package & Install

```bash
# 全局安装vsce打包工具 / Install vsce packaging tool globally
npm install -g @vscode/vsce
# 打包为vsix文件（允许缺少仓库信息，不打包依赖） / Package into .vsix (allow missing repo, skip dependencies)
vsce package --allow-missing-repository --no-dependencies
# 强制安装扩展到VSCode / Force install the extension to VSCode
code --install-extension undo-last-commit-0.0.1.vsix --force
```


## 🐛 调试 / Debug

按 `F5` 启动扩展开发宿主窗口，在新窗口中打开任意 Git 仓库即可测试。

---

Press `F5` to launch the Extension Development Host window, then open any Git repository in the new window to test.

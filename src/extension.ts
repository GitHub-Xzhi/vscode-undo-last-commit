import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';

/**
 * 激活扩展
 */
export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('undoLastCommit.undo', async (arg?: any) => {
    let repoPath: string | undefined;
    let repoName: string | undefined;

    // 从菜单参数中获取当前仓库（scm/sourceControl/title 会传入 SourceControl 对象）
    if (arg && arg.rootUri) {
      const rootPath: string = arg.rootUri.fsPath;
      repoPath = rootPath;
      repoName = arg.label || path.basename(rootPath);
    }

    // 回退：使用当前活动编辑器所在的工作区，否则取第一个
    if (!repoPath) {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('没有打开的工作区，无法执行撤销提交。');
        return;
      }
      let targetFolder = workspaceFolders[0];
      const activeEditor = vscode.window.activeTextEditor;
      if (activeEditor) {
        const folder = vscode.workspace.getWorkspaceFolder(activeEditor.document.uri);
        if (folder) {
          targetFolder = folder;
        }
      }
      repoPath = targetFolder.uri.fsPath;
      repoName = targetFolder.name;
    }

    // 确认用户意图，避免误操作
    const confirm = await vscode.window.showWarningMessage(
      `确定要撤销仓库「${repoName}」的上次提交吗？\n改动将保留在暂存区（git reset --soft HEAD~1）`,
      { modal: true },
      '确认撤销'
    );
    if (confirm !== '确认撤销') {
      return;
    }

    // 先检查是否存在 HEAD（即是否有提交记录）
    exec('git rev-parse --verify HEAD', { cwd: repoPath }, (err) => {
      if (err) {
        vscode.window.showErrorMessage('当前仓库没有提交记录，无法撤销。');
        return;
      }

      // 执行撤销上次提交
      exec('git reset --soft HEAD~1', { cwd: repoPath }, (resetErr, _stdout, stderr) => {
        if (resetErr) {
          vscode.window.showErrorMessage(`撤销上次提交失败：${stderr || resetErr.message}`);
          return;
        }
        vscode.window.showInformationMessage('已撤销上次提交，改动保留在暂存区。');
      });
    });
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {
  // 无需清理
}

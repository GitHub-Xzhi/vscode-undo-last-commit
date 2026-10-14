import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';

/**
 * 激活扩展
 */
export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('undoLastCommit.undo', async (sourceControl?: vscode.SourceControl) => {
    let repoPath: string | undefined;
    let repoName: string | undefined;
    let scm: vscode.SourceControl | undefined = sourceControl;

    // 从菜单参数中获取当前仓库（scm/sourceControl/title 会传入 SourceControl 对象）
    if (sourceControl && sourceControl.rootUri) {
      repoPath = sourceControl.rootUri.fsPath;
      repoName = sourceControl.label || path.basename(repoPath);
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
      // 回退路径无 SourceControl 引用，撤销后不还原输入框消息
    }

    // 确认用户意图，避免误操作
    const confirm = await vscode.window.showWarningMessage(
      `确定要撤销仓库「${repoName}」的上次提交吗？\n改动将保留在暂存区，提交消息将还原到输入框。`,
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

      // 获取上次提交的 commit message
      exec('git log -1 --pretty=%B', { cwd: repoPath }, (logErr, logStdout) => {
        const commitMessage = logErr ? '' : logStdout.replace(/\s+$/, '');

        // 执行撤销上次提交
        exec('git reset --soft HEAD~1', { cwd: repoPath }, (resetErr, _stdout, stderr) => {
          if (resetErr) {
            vscode.window.showErrorMessage(`撤销上次提交失败：${stderr || resetErr.message}`);
            return;
          }

          // 将 commit message 还原到源代码管理的提交消息输入框
          if (scm && scm.inputBox) {
            scm.inputBox.value = commitMessage;
          }

          vscode.window.showInformationMessage('已撤销上次提交，提交消息已还原到输入框。');
        });
      });
    });
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {
  // 无需清理
}

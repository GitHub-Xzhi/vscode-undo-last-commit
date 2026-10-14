import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';

/**
 * 通过 Git 扩展 API 将 commit message 还原到指定仓库的提交消息输入框
 */
async function restoreCommitMessage(repoPath: string, commitMessage: string) {
  try {
    const gitExtension = vscode.extensions.getExtension('vscode.git');
    if (!gitExtension) {
      return;
    }
    if (!gitExtension.isActive) {
      await gitExtension.activate();
    }
    const api = gitExtension.exports.getAPI(1);
    const target = repoPath.toLowerCase();
    const repo = api.repositories.find(
      (r: any) => r.rootUri && r.rootUri.fsPath.toLowerCase() === target
    );
    if (repo && repo.inputBox) {
      repo.inputBox.value = commitMessage;
    }
  } catch {
    // Git 扩展 API 不可用时静默跳过
  }
}

/**
 * 对指定仓库执行撤销上次提交，并还原 commit message
 */
async function undoLastCommit(repoPath: string, repoName: string, scm?: vscode.SourceControl) {
  // 检查是否存在 HEAD（即是否有提交记录）
  exec('git rev-parse --verify HEAD', { cwd: repoPath }, (err) => {
    if (err) {
      vscode.window.showErrorMessage(`仓库「${repoName}」没有提交记录，无法撤销。`);
      return;
    }

    // 获取上次提交的 commit message
    exec('git log -1 --pretty=%B', { cwd: repoPath }, (logErr, logStdout) => {
      const commitMessage = logErr ? '' : logStdout.replace(/\s+$/, '');

      // 执行撤销上次提交
      exec('git reset --soft HEAD~1', { cwd: repoPath }, async (resetErr, _stdout, stderr) => {
        if (resetErr) {
          vscode.window.showErrorMessage(`撤销失败：${stderr || resetErr.message}`);
          return;
        }

        // 还原 commit message 到提交消息输入框
        if (scm && scm.inputBox) {
          scm.inputBox.value = commitMessage;
        } else {
          await restoreCommitMessage(repoPath, commitMessage);
        }

        vscode.window.showInformationMessage(`已撤销「${repoName}」的上次提交，提交消息已还原到输入框。`);
      });
    });
  });
}

/**
 * 扫描当前工作区中的所有 Git 仓库
 */
function findGitRepos(): Promise<{ repoPath: string; repoName: string }[]> {
  return new Promise((resolve) => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      resolve([]);
      return;
    }

    const results: { repoPath: string; repoName: string }[] = [];
    let pending = workspaceFolders.length;

    workspaceFolders.forEach((folder) => {
      exec('git rev-parse --show-toplevel', { cwd: folder.uri.fsPath }, (err, stdout) => {
        if (!err && stdout.trim()) {
          results.push({ repoPath: stdout.trim(), repoName: folder.name });
        }
        pending--;
        if (pending === 0) {
          resolve(results);
        }
      });
    });
  });
}

/**
 * 激活扩展
 */
export function activate(context: vscode.ExtensionContext) {
  // 状态栏按钮（仅图标，无文案）
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.text = '$(debug-step-back)';
  statusBarItem.tooltip = '撤销上次提交（git reset --soft HEAD~1，改动保留在暂存区）';
  statusBarItem.command = 'undoLastCommit.undo';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // 注册命令
  const disposable = vscode.commands.registerCommand('undoLastCommit.undo', async (sourceControl?: vscode.SourceControl) => {
    // 从 SCM 菜单点击时会传入 SourceControl 对象，直接执行
    if (sourceControl && sourceControl.rootUri) {
      const repoPath = sourceControl.rootUri.fsPath;
      const repoName = sourceControl.label || path.basename(repoPath);
      await undoLastCommit(repoPath, repoName, sourceControl);
      return;
    }

    // 状态栏点击：扫描工作区中的 Git 仓库
    const repos = await findGitRepos();
    if (repos.length === 0) {
      vscode.window.showErrorMessage('当前工作区没有 Git 仓库。');
      return;
    }

    // 只有一个仓库时直接执行
    if (repos.length === 1) {
      await undoLastCommit(repos[0].repoPath, repos[0].repoName);
      return;
    }

    // 多仓库时让用户选择
    const picked = await vscode.window.showQuickPick(
      repos.map((r) => ({ label: r.repoName, description: r.repoPath, repo: r })),
      { placeHolder: '选择要撤销提交的仓库' }
    );
    if (picked) {
      await undoLastCommit(picked.repo.repoPath, picked.repo.repoName);
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {
  // 无需清理
}

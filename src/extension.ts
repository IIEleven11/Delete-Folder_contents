import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('delete-folder-contents.deleteFolderContents', async (uri: vscode.Uri) => {
        if (!uri) {
            vscode.window.showErrorMessage('No folder selected');
            return;
        }

        const folderPath = uri.fsPath;

        const confirmation = await vscode.window.showWarningMessage(
            `Are you sure you want to delete all contents of "${path.basename(folderPath)}"?`,
            'Yes', 'No'
        );

        if (confirmation !== 'Yes') {
            return;
        }

        try {
            await deleteFolderContents(folderPath);
            vscode.window.showInformationMessage(`Successfully deleted contents of "${path.basename(folderPath)}"`);
        } catch (error) {
            vscode.window.showErrorMessage(`Error deleting folder contents: ${error}`);
        }
    });

    context.subscriptions.push(disposable);
}

async function deleteFolderContents(folderPath: string): Promise<void> {
    const files = await fs.promises.readdir(folderPath);

    for (const file of files) {
        const filePath = path.join(folderPath, file);
        const stat = await fs.promises.lstat(filePath);

        if (stat.isDirectory()) {
            await deleteFolderContents(filePath);
            await fs.promises.rmdir(filePath);
        } else {
            await fs.promises.unlink(filePath);
        }
    }
}

export function deactivate() {}

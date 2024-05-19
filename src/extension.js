const vscode = require('vscode');
const Anonymizer = require('./anonymizer');

let anonymizer = new Anonymizer();

function activate(context) {

    // Can try to gain efficiencies by running something when the active text editor changes
    // vscode.window.onDidChangeActiveTextEditor(editor => {
    //     if (editor) {
    //         const filePath = editor.document.uri.fsPath;
    //         const allText = editor.document.getText(); // This gets the entire text of the active document
    //         anonymizer.read_entire_script(filePath, allText);
    //     }
    // });

    let disposable = vscode.commands.registerCommand('code-sanitizer.anonymizeAndCopy', function () {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            const selectedText = editor.document.getText(selection);
            anonymizer.read_entire_script(editor.document.uri.fsPath, editor.document.getText());
            let modifiedText = anonymizer.anonymize(selectedText);
            vscode.env.clipboard.writeText(modifiedText)
        }
    });

    context.subscriptions.push(disposable);

    let disposableUnanonymizeAndPaste = vscode.commands.registerCommand('code-sanitizer.unanonymizeAndPaste', async function () {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            let clipboardText = await vscode.env.clipboard.readText();
            let modifiedText = anonymizer.unanonymize(clipboardText);
            await editor.edit(editBuilder => {
                editBuilder.replace(editor.selection, modifiedText);
            });
        }
    });

    context.subscriptions.push(disposableUnanonymizeAndPaste);
}

// This method is called when the extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
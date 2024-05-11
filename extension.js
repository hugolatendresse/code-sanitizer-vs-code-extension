const vscode = require('vscode');
const Anonymizer = require('./anonymizer');

let anonymizer = new Anonymizer();

function activate(context) {

	// console.log('Extension "code-sanitizer" is now active!');

    let disposable = vscode.commands.registerCommand('code-sanitizer.anonymizeAndCopy', function () {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            const text = editor.document.getText(selection);
            let modifiedText = anonymizer.anonymize(text);

            vscode.env.clipboard.writeText(modifiedText)
                .then(() => {
                    vscode.window.showInformationMessage('Text modified and copied!');
                }, (err) => {
                    vscode.window.showErrorMessage('Failed to copy text: ' + err);
                });
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

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}

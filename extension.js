const vscode = require('vscode');
const Anonymizer = require('./anonymizer');


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

    let a = new Anonymizer();

	console.log('Extension "code-sanitizer" is now active!');

    let disposable = vscode.commands.registerCommand('code-sanitizer.anonymizeAndCopy', function () {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            const text = editor.document.getText(selection);
            // let a = new Anonymizer();
            let modifiedText = a.anonymize(text);
            // const modifiedText = text.replace(/JOIN/g, 'NOTAJOINANYMORE!!!!!');

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
            // const Anonymizer = require('./anonymizer');
           
            let clipboardText = await vscode.env.clipboard.readText();
            let modifiedText = a.unanonymize(clipboardText);
    
            editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.start, modifiedText);
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

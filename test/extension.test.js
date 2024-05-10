// const assert = require('assert');

// // You can import and use all API from the 'vscode' module
// // as well as import your extension to test it
// const vscode = require('vscode');
// // const myExtension = require('../extension');

// suite('Extension Test Suite', () => {
// 	vscode.window.showInformationMessage('Start all tests.');

// 	test('Sample test', () => {
// 		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
// 		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
// 	});
// });

// to run: npm test


const vscode = require('vscode');
const assert = require('assert');
const extension = require('../extension');

function printDebugInfo(someName, someVar) {
    console.log("\n\!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.log("This is the ", someName, ":");
    console.log(someVar);
    console.log("#######################################\n");
}

suite('Original Test Suite', () => {

	test('Test anonymizeAndCopy function 00', async () => {
		const doc = await vscode.workspace.openTextDocument({ content: ' ' });
		const editor = await vscode.window.showTextDocument(doc);
		assert.ok(editor, 'No active editor');
		editor.selection = new vscode.Selection(0, 0, 0, 10);
		await editor.edit(editBuilder => {
			editBuilder.replace(editor.selection, 'Test String');
		});

		// Act
		await vscode.commands.executeCommand('code-sanitizer.anonymizeAndCopy');

		// Assert
		const clipboardText = await vscode.env.clipboard.readText();
		assert.notStrictEqual(clipboardText, 'Test String');
    });

    test('Test unanonymizeAndPaste function 01', async () => {
		// An editor is created and writes something in a first script
		let doc = await vscode.workspace.openTextDocument({ content: ' ' });
		let editor = await vscode.window.showTextDocument(doc);
		assert.ok(editor, 'No active editor');
		const originalText = 'Wewilltry amuchlonger pieceoftext tocheck ifthe unanonymize functionworksproperly';
		await editor.edit(editBuilder => {
			editBuilder.insert(new vscode.Position(0, 0), originalText);
		});
		editor.selection = new vscode.Selection(0, 0, 0, originalText.length);
		printDebugInfo("originalText", originalText);

		// Copy and sanitize
		await vscode.commands.executeCommand('code-sanitizer.anonymizeAndCopy');

		// Paste the result in some doc
		doc = await vscode.workspace.openTextDocument({ content: ' ' });
		editor = await vscode.window.showTextDocument(doc);
		await vscode.commands.executeCommand('editor.action.clipboardPasteAction');
		// TODO make sure is sanitized!!
	
		// Copy half the sanitized text
		const pastedText = editor.document.getText();
		printDebugInfo("pastedText (should be full length)", pastedText); // this is empty
		let halfLength = Math.ceil(editor.document.getText().length / 2);
		// Adjust the length such that the last character is an alphabetical character
		while (pastedText[halfLength] === ' ' || pastedText[halfLength] === '\n') {
			halfLength--;
		}
		editor.selection = new vscode.Selection(0, 0, 0, halfLength);
		await vscode.commands.executeCommand('editor.action.clipboardCopyAction');
		// Log the text contained in the clipboard
		const clipboardText = await vscode.env.clipboard.readText();
		printDebugInfo("clipboardText (should be half length)", clipboardText);

		// Select all text in the editor
		const fullLength = editor.document.getText().length;
		editor.selection = new vscode.Selection(0, 0, 0, fullLength);
		await vscode.commands.executeCommand('code-sanitizer.unanonymizeAndPaste');
	
		// Assert
		const finalText = editor.document.getText();
		printDebugInfo("finalText", finalText);
		printDebugInfo("originalText.substring(0, halfLength)", originalText.substring(0, halfLength));
		assert.strictEqual(finalText, originalText.substring(0, halfLength));


		// // Assert
		// const selection = editor.selection;
		// const pastedText = editor.document.getText(selection);
		// console.log("\n\!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
		// console.log("This is the pasted test: \n", pastedText);
		// console.log("This is the original text: \n", originalText);
		// console.log("\n\#######################################");
		// assert.strictEqual(pastedText, originalText);
    });

});



suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

	test('Test anonymizeAndCopy function 02', async () => {
		const doc = await vscode.workspace.openTextDocument({ content: ' ' });
		const editor = await vscode.window.showTextDocument(doc);
		assert.ok(editor, 'No active editor');
		editor.selection = new vscode.Selection(0, 0, 0, 10);
		const originalText = 'table2.somename allthe wordshere shouldbe.sanitized';
		await editor.edit(editBuilder => {
			editBuilder.replace(editor.selection, originalText);
		});
		await vscode.commands.executeCommand('code-sanitizer.anonymizeAndCopy');
		const clipboardText = await vscode.env.clipboard.readText();
		assert.notStrictEqual(clipboardText, originalText);
		// Tokenize the original text and make sure that no token is the same as before
		const tokens = originalText.match(/\b\w+\b/g);
		tokens.forEach(token => {
			// If the assert below will fail, print the token and clipboardText to console
			// console.log("\n\!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
			// console.log(token);
			// console.log(clipboardText);
			// console.log("\n\#######################################");
			assert.strictEqual(clipboardText.includes(token), false);
		});
    });
	
    test('Test anonymizeAndCopy function 03', async () => {
		const doc = await vscode.workspace.openTextDocument({ content: ' ' });
		const editor = await vscode.window.showTextDocument(doc);
		assert.ok(editor, 'No active editor');
		editor.selection = new vscode.Selection(0, 0, 0, 10);
		const originalText = 'SELECT * FROM table1';
		await editor.edit(editBuilder => {
			editBuilder.replace(editor.selection, originalText);
		});
		await vscode.commands.executeCommand('code-sanitizer.anonymizeAndCopy');
		const clipboardText = await vscode.env.clipboard.readText();
		assert.strictEqual(clipboardText.substring(0, 13), originalText.substring(0, 13));
		assert.notStrictEqual(clipboardText, originalText);

    });

	// // TODO!!
    // test('Test unanonymizeAndPaste function 04', async () => {
	// 	// TODO!!!!!

	// 	// const doc = await vscode.workspace.openTextDocument({ content: ' ' });
	// 	// const editor = await vscode.window.showTextDocument(doc);
	// 	// assert.ok(editor, 'No active editor');
	// 	// const originalText = 'Test String';
	// 	// await vscode.env.clipboard.writeText(originalText);

	// 	// // Act
	// 	// await vscode.commands.executeCommand('code-sanitizer.unanonymizeAndPaste');

	// 	// // Assert
	// 	// const selection = editor.selection;
	// 	// const pastedText = editor.document.getText(selection);
	// 	// assert.strictEqual(pastedText, originalText);
    // });
});
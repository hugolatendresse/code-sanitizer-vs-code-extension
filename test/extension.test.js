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

suite('Extension Test Suite', () => {

	test('Test 00 anonymizeAndCopy all sanitized', async () => {
		const doc = await vscode.workspace.openTextDocument({ content: ' ' });
		const editor = await vscode.window.showTextDocument(doc);
		assert.ok(editor, 'No active editor');
		editor.selection = new vscode.Selection(0, 0, 0, 10);
		const originalText = 'table2.somename allthe01 wordshere 23432 shouldbe.sanitized0';
		await editor.edit(editBuilder => {
			editBuilder.replace(editor.selection, originalText);
		});
		await vscode.commands.executeCommand('code-sanitizer.anonymizeAndCopy');
		const clipboardText = await vscode.env.clipboard.readText();
		assert.notStrictEqual(clipboardText, originalText);
		// Tokenize the original text and make sure that no token is the same as before
		const tokens = originalText.match(/\b\w+\b/g);
		tokens.forEach(token => {
			assert.strictEqual(clipboardText.includes(token), false);
		});
    });
	
    test('Test 01 anonymizeAndCopy with SQL keywords', async () => {
		const doc = await vscode.workspace.openTextDocument({ content: ' ' });
		const editor = await vscode.window.showTextDocument(doc);
		assert.ok(editor, 'No active editor');
		editor.selection = new vscode.Selection(0, 0, 0, 10);
		const originalText = 'SELECT * FROM table1.sometoken where column1 = 1234324 AND column2 = 23432';
		await editor.edit(editBuilder => {
			editBuilder.replace(editor.selection, originalText);
		});
		await vscode.commands.executeCommand('code-sanitizer.anonymizeAndCopy');
		const clipboardText = await vscode.env.clipboard.readText();
		
		// First 13 characters should be the same
		assert.strictEqual(clipboardText.substring(0, 13), originalText.substring(0, 13));
		
		// The entire thing should be different
		assert.notStrictEqual(clipboardText, originalText);

		// If the token is in ["SELECT", "FROM", "where", "AND"], it should be the same, else it should be different
		const tokens = originalText.match(/\b\w+\b/g);
		tokens.forEach(token => {
			const sqlReservedWords = ["SELECT", "FROM", "where", "AND"];
			if (sqlReservedWords.includes(token)) {
				assert.strictEqual(clipboardText.includes(token), true);
			} else {
				assert.strictEqual(clipboardText.includes(token), false);
			}
		});
    });

	
    test('Test 02 unanonymizeAndPaste function', async () => {
		// An editor is created and writes something in a first script
		let doc = await vscode.workspace.openTextDocument({ content: ' ' });
		let editor = await vscode.window.showTextDocument(doc);
		assert.ok(editor, 'No active editor');
		const originalText = 'Wewilltry.amuchlonger pieceoftext tocheck ifthe unanonymize functionworksproperly';
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
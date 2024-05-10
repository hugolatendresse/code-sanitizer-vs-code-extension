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



suite('Original Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Test anonymizeAndCopy function', async () => {
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

    test('Test unanonymizeAndPaste function', async () => {
		const doc = await vscode.workspace.openTextDocument({ content: ' ' });
		const editor = await vscode.window.showTextDocument(doc);
		assert.ok(editor, 'No active editor');
		const originalText = 'Test String';
		await vscode.env.clipboard.writeText(originalText);

		// Act
		await vscode.commands.executeCommand('code-sanitizer.unanonymizeAndPaste');

		// Assert
		const selection = editor.selection;
		const pastedText = editor.document.getText(selection);
		assert.strictEqual(pastedText, originalText);
    });
});



suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

	test('Test anonymizeAndCopy function 00', async () => {
		const doc = await vscode.workspace.openTextDocument({ content: ' ' });
		const editor = await vscode.window.showTextDocument(doc);
		assert.ok(editor, 'No active editor');
		editor.selection = new vscode.Selection(0, 0, 0, 10);
		const originalText = 'table2.some stuff all changed';
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
	
    test('Test anonymizeAndCopy function 01', async () => {
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

    test('Test unanonymizeAndPaste function', async () => {
		const doc = await vscode.workspace.openTextDocument({ content: ' ' });
		const editor = await vscode.window.showTextDocument(doc);
		assert.ok(editor, 'No active editor');
		const originalText = 'Test String';
		await vscode.env.clipboard.writeText(originalText);

		// Act
		await vscode.commands.executeCommand('code-sanitizer.unanonymizeAndPaste');

		// Assert
		const selection = editor.selection;
		const pastedText = editor.document.getText(selection);
		assert.strictEqual(pastedText, originalText);
    });
});
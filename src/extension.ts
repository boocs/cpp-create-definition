
import * as vscode from 'vscode';
import { HeaderEditor } from './headerEditor';
import { FUNC_BODY, POSTFIX_REMOVAL, PREFIX_REMOVAL, SOURCE_EXTENSIONS, CMD_CURSOR_BOTTOM } from './consts';

import * as npmPath from 'path';

import * as console from './console';


export async function activate(context: vscode.ExtensionContext) {

	console.log("C++ Create Definition is now active!\n");

	let disposable = vscode.commands.registerCommand('cpp-create-definition.createDefinition', createDefinition);

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {
	console.outputChannel.dispose();
}

const createDefinition = async () => {
	
	const currentTextEditor = new HeaderEditor(vscode.window.activeTextEditor);

	if (!currentTextEditor.isValid) {
		return;
	}

	const currentTextLine = currentTextEditor.currentTextLine;

	if (currentTextLine.isEmptyOrWhitespace) {
		console.log("Current text is empty");
		return;
	}

	const headerUri = currentTextEditor.document.uri;

	const sourceUri = await getSourceUri(getUriWorkspaceFolder(headerUri), headerUri);

	if (!sourceUri) {
		console.log("Could not get source uri!");
		return;
	}

	const className = getClassName(currentTextEditor.document.getText(), /(?<=class)(?<className>\s\w+)+\s*:?.*[\n\r]*{/);
	const sourceDoc = await vscode.workspace.openTextDocument(sourceUri);
	const newFunctionDefinition = getFunctionDefinition(currentTextLine.text, className, sourceDoc);

	if (!newFunctionDefinition) {
		console.warning(`Couldn't get function definition from: ${currentTextLine.text}`);
		return;
	}

	const sourceEditor = await vscode.window.showTextDocument(sourceDoc);
	
	const sourceDocTextLength = sourceDoc.getText().length;
	const editPosition = sourceDoc.positionAt(sourceDocTextLength);

	await sourceEditor.edit(editBuilder => {
		editBuilder.insert(editPosition, newFunctionDefinition);
	});

	await vscode.commands.executeCommand(CMD_CURSOR_BOTTOM);

	return;
};


function getFunctionDefinition(functionDeclaration: string, className_: string, sourceDoc: vscode.TextDocument): string {
	let declaration = functionDeclaration;

	let className = className_;
	if (!className) {
		console.log("Attempting 2nd try class name.");
		className = getClassName(sourceDoc.getText(), /(?<className>\w+)::/); // 2nd chance to get class name
	}

	const re = /(?<prefix>.*)(?<funcNameArgs>\s\w+\(.*\))(?<postfix>.*);$/;
	const match = declaration.match(re);

	if (!match || match.length === 0 || !match.groups) {
		console.warning(`No match found using: ${re.source}`);
		return "";
	}

	let prefix = match.groups["prefix"];
	let funcNameArgs = match.groups["funcNameArgs"];
	let postfix = match.groups["postfix"];

	for (const removeString of PREFIX_REMOVAL) {
		prefix = prefix.replace(removeString, "");
	}

	for (const removeString of POSTFIX_REMOVAL) {
		postfix = postfix.replace(removeString, "");
	}

	if (className) {
		funcNameArgs = funcNameArgs.trimStart();
		declaration = `${prefix} ${className}::${funcNameArgs}${postfix}`.trim();
	}
	else {
		declaration = `${prefix}${funcNameArgs}${postfix}`.trim();
	}

	const newDefinition = declaration.concat(FUNC_BODY);

	return `\n${newDefinition}\n`;
}


function getClassName(headerText: string, re: RegExp) {

	const match = headerText.match(re);

	if (!match || match.length < 1 || !match.groups) {
		console.log("Couldn't get class name match!");
		return "";
	}

	const className = match.groups["className"];

	if (!className) {
		console.log("No class name in match group!");
		return "";
	}

	return className;
}


async function getSourceUri(workspaceFolder: vscode.WorkspaceFolder | undefined, headerUri: vscode.Uri) {

	if (!workspaceFolder) {
		return undefined;
	}

	if (!headerUri.fsPath.toLowerCase().startsWith(workspaceFolder.uri.fsPath.toLowerCase())) {
		return;
	}

	const parsedHeaderPath = npmPath.parse(headerUri.fsPath);
	const fileNameNoExt = parsedHeaderPath.name;

	const workspacePathLength = workspaceFolder.uri.fsPath.length;

	let globSearchDirectory = parsedHeaderPath.dir.substring(workspacePathLength).split('\\').join('/');
	const globFileName = `${fileNameNoExt}.{${SOURCE_EXTENSIONS.join(',')}}`;

	let relPattern;
	do {

		if (globSearchDirectory.length === 1) {
			relPattern = new vscode.RelativePattern(workspaceFolder.uri, `**${globSearchDirectory}${globFileName}`);
		}
		else {
			relPattern = new vscode.RelativePattern(workspaceFolder.uri, `**${globSearchDirectory}/**/${globFileName}`);
		}

		const sourceFile = await vscode.workspace.findFiles(relPattern, undefined, 1);

		if (sourceFile && sourceFile.length > 0) {
			return sourceFile[0];
		}

		const newGlobSearchDirectory = npmPath.dirname(globSearchDirectory);
		if (newGlobSearchDirectory.length === globSearchDirectory.length) {
			break;
		}
		globSearchDirectory = newGlobSearchDirectory;

	} while (true);

	return;
}


function getUriWorkspaceFolder(uri: vscode.Uri) {
	if (!vscode.workspace.workspaceFolders) {
		console.log("No workspace folders found!");
		return;
	}

	for (const workspaceFolder of vscode.workspace.workspaceFolders) {
		if (uri.fsPath.toLowerCase().startsWith(workspaceFolder.uri.fsPath.toLowerCase())) {
			return workspaceFolder;
		}
	}

	return undefined;
}

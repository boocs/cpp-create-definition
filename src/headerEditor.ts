
import * as vscode from 'vscode';
import { HEADER_EXTENSIONS } from './consts';

import * as console from './console';

export class HeaderEditor {
    private _isValid = false;
    readonly textEditor: vscode.TextEditor;
    constructor(textEditor: vscode.TextEditor | undefined) {
        
        if(!textEditor){
            console.log("Invalid text editor!");
            this.textEditor = undefined as unknown as vscode.TextEditor;
            return;
        }

        if(!this.isHeader(textEditor)){
            console.log("Not header file!");
            this.textEditor = undefined as unknown as vscode.TextEditor;
            return ;
        }
        
        this.textEditor = textEditor;
        
        this.isValidate = true;    
    }

    
    public get isValid() : boolean {
        return this._isValid;
    }

    private set isValidate(v : boolean) {
        this._isValid = v;
    }
    
    
    public get document() : vscode.TextDocument {
        return this.textEditor.document;
    }

    /**Get current line at cursor*/
    public get currentTextLine(): vscode.TextLine {
        const cursorLine = this.textEditor.selection.active.line;
        return this.textEditor.document.lineAt(cursorLine);
    }
    
    private isHeader(textEditor: vscode.TextEditor): boolean {

        for (const ext of HEADER_EXTENSIONS) {
            if(textEditor.document.uri.fsPath.endsWith(`.${ext}`)){
                return true;
            }
        }
        return false;
    }
}
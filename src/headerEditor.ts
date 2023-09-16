
import * as vscode from 'vscode';
import { HEADER_EXTENSIONS } from './consts';

import * as console from './console';

const MAX_LINES_DECLARATION = 15;

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

    /**Get current declaration. Can be multi-line*/
    public get currentDeclaration(): string {

        let declaration = "";

        const cursorLine = this.textEditor.selection.active.line;
        for (let index = 0; index < MAX_LINES_DECLARATION; index++) {
            const textLine = this.textEditor.document.lineAt(cursorLine + index);

            if(index === 0 && textLine.isEmptyOrWhitespace){
                return declaration;
            }

            declaration += textLine.text;
            
            // We break out of loop if we have end of declaration
            if(declaration.includes(';')){
                console.log("Current line is empty!");
                break;
            }
        }
        
        // remove all unneeded whitespace
        declaration = declaration.replace(/\s{2,}/gm, ' ');

        return declaration;
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
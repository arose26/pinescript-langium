import { AstNode, LangiumDocument } from 'langium';
import { StartScript } from './generated/ast.js';

export interface ImportStatement extends AstNode {
    readonly $type: 'ImportStatement';
    path: string;
    alias?: string;
}

export function parseImports(document: LangiumDocument<StartScript>): ImportStatement[] {
    const text = document.textDocument.getText();
    const imports: ImportStatement[] = [];

    // Regular expression to match import statements
    // Format: import path/to/module [as alias]
    const importRegex = /import\s+([a-zA-Z_][a-zA-Z_0-9]*(?:\/[a-zA-Z_][a-zA-Z_0-9]*)*)(?:\s+as\s+([a-zA-Z_][a-zA-Z_0-9]*))?/g;

    let match;
    while ((match = importRegex.exec(text)) !== null) {
        const path = match[1];
        const alias = match[2];

        imports.push({
            $type: 'ImportStatement',
            path,
            alias,
            $container: document.parseResult.value,
            $document: document,
            $cstNode: undefined
        });
    }

    return imports;
}

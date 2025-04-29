import type { StartScript, Expression } from '../language/generated/ast.js';
import { expandToNode, joinToNode, toString } from 'langium/generate';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { extractDestinationAndName } from './cli-util.js';

export function generateJavaScript(model: StartScript, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.js`;

    // Extract function declarations
    const functionDeclarations: { structure: { function: any } }[] = [];

    // We'll implement this properly once we understand the AST structure better
    if (model.statements?.statements) {
        for (const statement of model.statements.statements) {
            if ('structure' in statement && statement.structure) {
                const struct = statement.structure as any;
                if (struct && 'function' in struct) {
                    functionDeclarations.push({ structure: { function: struct.function } });
                }
            }
        }
    }

    // Extract variable declarations
    const variableDeclarations: { declaration: any }[] = [];

    // We'll implement this properly once we understand the AST structure better
    if (model.statements?.statements) {
        for (const statement of model.statements.statements) {
            if ('declaration' in statement) {
                variableDeclarations.push({ declaration: (statement as any).declaration });
            }
        }
    }

    const fileNode = expandToNode`
        "use strict";

        // Variable declarations
        ${joinToNode(variableDeclarations, varDecl =>
            `let ${varDecl.declaration.name} = ${expressionToJs(varDecl.declaration)};`,
            { appendNewLineIfNotEmpty: true }
        )}

        // Function declarations
        ${joinToNode(functionDeclarations, funcDecl =>
            `function ${funcDecl.structure.function.name}(${funcDecl.structure.function.parameters?.parameters?.map((p: any) => p.name).join(', ') || ''}) {
                ${funcDecl.structure.function.body ? 'return /* function body */;' : ''}
            }`,
            { appendNewLineIfNotEmpty: true }
        )}
    `.appendNewLineIfNotEmpty();

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, toString(fileNode));
    return generatedFilePath;
}

// Helper function to convert PineScript expressions to JavaScript
function expressionToJs(expr: Expression | any): string {
    if (!expr) return 'undefined';

    if ('value' in expr) {
        // Literal values
        return expr.value?.toString() || 'undefined';
    } else if ('name' in expr) {
        // Name references
        return expr.name;
    } else if ('expression' in expr) {
        // Nested expressions
        return expressionToJs(expr.expression);
    }

    return '/* expression */';
}

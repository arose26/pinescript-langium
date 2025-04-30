import { createPineScriptServices } from '../language/pine-script-module.js';
import { NodeFileSystem } from 'langium/node';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { StartScript } from '../language/generated/ast.js';
import { inspect } from 'node:util';
import { extractDocument } from './cli-util.js';

/**
 * Command line interface for debugging PineScript files
 */
async function main() {
    // Get the file path from command line arguments
    const filePath = process.argv[2];
    
    if (!filePath) {
        console.error('Please provide a file path');
        console.error('Usage: node --loader ts-node/esm src/cli/debug-cli-2.ts <file-path>');
        process.exit(1);
    }

    try {
        // Create the language services
        const services = createPineScriptServices(NodeFileSystem).PineScript;

        // Parse the file
        console.log(`Parsing ${filePath}...`);
        const document = await extractDocument(filePath, services);

        // Check for validation errors
        const validationErrors = document.diagnostics?.filter(d => d.severity === 1);
        if (validationErrors && validationErrors.length > 0) {
            console.error('There are validation errors:');
            for (const error of validationErrors) {
                console.error(`line ${error.range.start.line + 1}: ${error.message} [${document.textDocument.getText(error.range)}]`);
            }
            process.exit(1);
        }

        // Get the AST
        const ast = document.parseResult?.value as StartScript;
        if (!ast) {
            console.error('Failed to parse the file');
            process.exit(1);
        }

        // Print the AST structure
        console.log('AST Structure:');
        console.log(inspect(ast, { depth: 10, colors: true }));

        // Save AST to file with circular references handled
        const astOutputPath = path.join(path.dirname(filePath), `${path.basename(filePath, path.extname(filePath))}.ast.json`);
        
        // Create a simplified AST without circular references
        const simplifiedAst = simplifyAst(ast);
        
        fs.writeFileSync(astOutputPath, JSON.stringify(simplifiedAst, null, 2));
        console.log(`AST saved to: ${astOutputPath}`);

        return true;
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}

/**
 * Simplify an AST node by removing circular references
 */
function simplifyAst(node: any, visited = new Set()): any {
    if (!node || typeof node !== 'object') {
        return node;
    }
    
    if (visited.has(node)) {
        return { $ref: 'circular' };
    }
    
    visited.add(node);
    
    if (Array.isArray(node)) {
        return node.map(item => simplifyAst(item, new Set(visited)));
    }
    
    const result: any = {};
    
    for (const key of Object.keys(node)) {
        // Skip properties that cause circular references
        if (key === '$cstNode' || key === '$container' || key === '$containerProperty' || key === '$containerIndex') {
            continue;
        }
        
        result[key] = simplifyAst(node[key], new Set(visited));
    }
    
    return result;
}

// Run the main function
main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
});

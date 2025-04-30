import { createPineScriptServices } from '../language/pine-script-module.js';
import { NodeFileSystem } from 'langium/node';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { PineScriptToESTreeConverter } from './estree-converter.js';
import { StartScript } from '../language/generated/ast.js';
import * as escodegen from 'escodegen';
import { LangiumDocument } from 'langium';
import { URI } from 'vscode-uri';
import { extractDocument } from './cli-util.js';

/**
 * Transpile PineScript code to JavaScript
 * @param pineScriptCode The PineScript code to transpile
 * @returns The transpiled JavaScript code, or null if there was an error
 */
export async function transpilePineToJavascript(pineScriptCode: string): Promise<string | null> {
    try {
        // Create the language services
        const services = createPineScriptServices(NodeFileSystem).PineScript;

        // Parse the code
        const document = await parseString(pineScriptCode, services);

        // Check for validation errors
        const validationErrors = document.diagnostics?.filter(d => d.severity === 1);
        if (validationErrors && validationErrors.length > 0) {
            console.error('There are validation errors:');
            for (const error of validationErrors) {
                console.error(`line ${error.range.start.line + 1}: ${error.message} [${document.textDocument.getText(error.range)}]`);
            }
            return null;
        }

        // Get the AST
        const ast = document.parseResult?.value as StartScript;
        if (!ast) {
            console.error('Failed to parse the code');
            return null;
        }

        // Convert to ESTree
        const converter = new PineScriptToESTreeConverter();
        const estree = converter.convert(ast);

        // Generate JavaScript code
        const jsCode = escodegen.generate(estree);

        return jsCode;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

/**
 * Parse a string of PineScript code
 */
async function parseString(content: string, services: ReturnType<typeof createPineScriptServices>['PineScript']): Promise<LangiumDocument> {
    // Create a virtual document URI
    const uri = URI.parse('memory://pinescript.pine');
    const document = services.shared.workspace.LangiumDocumentFactory.fromString(content, uri);
    await services.shared.workspace.DocumentBuilder.build([document]);
    return document;
}

/**
 * Command line interface for transpiling PineScript files to JavaScript
 */
async function main() {
    // Get the file path from command line arguments
    const filePath = process.argv[2];
    if (!filePath) {
        console.error('Please provide a file path');
        console.error('Usage: node --loader ts-node/esm src/cli/estree-cli.ts <file-path>');
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

        // Convert to ESTree
        console.log('Converting to ESTree...');
        const converter = new PineScriptToESTreeConverter();
        const estree = converter.convert(ast);

        // Generate JavaScript code
        console.log('Generating JavaScript...');
        const jsCode = escodegen.generate(estree);

        // Save the generated JavaScript to a file
        const outputPath = path.join(path.dirname(filePath), `${path.basename(filePath, path.extname(filePath))}.js`);
        fs.writeFileSync(outputPath, jsCode);
        console.log(`JavaScript code saved to: ${outputPath}`);

        return true;
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}

// This is a workaround to detect if this file is being run directly
// It will be false when imported as a module
let isMainModule = false;
try {
    // In ESM, this will throw an error when imported but work when run directly
    if (process.argv[1].endsWith('estree-cli.ts') || process.argv[1].endsWith('estree-cli.js')) {
        isMainModule = true;
    }
} catch (e) {
    // Ignore errors
}

if (isMainModule) {
    main().catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });
}

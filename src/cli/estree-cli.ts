import { createPineScriptServices } from '../language/pine-script-module.js';
import { NodeFileSystem } from 'langium/node';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { PineScriptToESTreeConverter } from './estree-converter.js';
import { extractDocument } from './cli-util.js';
import { StartScript } from '../language/generated/ast.js';
import * as escodegen from 'escodegen';

/**
 * Convert a PineScript file to JavaScript using ESTree
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

main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
});

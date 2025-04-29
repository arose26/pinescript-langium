import chalk from 'chalk';
import { Command } from 'commander';
import { PineScriptLanguageMetaData } from '../language/generated/module.js';
import { createPineScriptServices } from '../language/pine-script-module.js';
import { NodeFileSystem } from 'langium/node';
import * as path from 'node:path';
import { URI } from 'vscode-uri';
import { LangiumSharedCoreServices } from 'langium';

export const parseAction = async (fileName: string): Promise<void> => {
    // Create the language services
    const services = createPineScriptServices(NodeFileSystem);

    // Get the full path
    const fullPath = path.resolve(process.cwd(), fileName);

    try {
        // Create a document from the file content
        const uri = URI.file(fullPath);
        console.log(chalk.blue('Processing file:'), uri.toString());

        // Create a document and build it
        // First, set the root folder
        await setRootFolder(fullPath, services.shared);

        // Create the document
        const document = await services.shared.workspace.LangiumDocuments.getOrCreateDocument(uri);

        // Build the document (parse, link, validate)
        console.log(chalk.blue('\nBuilding document...'));
        await services.shared.workspace.DocumentBuilder.build([document], { validation: true });

        // Get the parse result
        const parseResult = document.parseResult;
        console.log(chalk.green('Parse complete!'));

        // Check for lexer errors
        if (parseResult.lexerErrors.length > 0) {
            console.log(chalk.red('Lexer errors:'), parseResult.lexerErrors.length);
            parseResult.lexerErrors.forEach((error, index) => {
                console.log(chalk.red(`  Error ${index + 1}:`), error.message);
            });
        } else {
            console.log(chalk.green('No lexer errors.'));
        }

        // Check for parser errors
        if (parseResult.parserErrors.length > 0) {
            console.log(chalk.red('Parser errors:'), parseResult.parserErrors.length);
            parseResult.parserErrors.forEach((error, index) => {
                console.log(chalk.red(`  Error ${index + 1}:`), error.message);
            });
        } else {
            console.log(chalk.green('No parser errors.'));
        }

        // Print the AST structure (just the top level)
        if (parseResult.value) {
            console.log(chalk.blue('\nAST structure:'));
            try {
                // Create a custom replacer function to handle circular references
                const getCircularReplacer = () => {
                    const seen = new WeakSet();
                    return (key: string, value: any) => {
                        // Skip container properties to avoid circular references
                        if (key === '$container' || key === '$containerProperty' || key === '$containerIndex' || key === '$cstNode') {
                            return '[Circular]';
                        }
                        if (typeof value === 'object' && value !== null) {
                            if (seen.has(value)) {
                                return '[Circular]';
                            }
                            seen.add(value);
                        }
                        return value;
                    };
                };

                // Stringify the AST with the custom replacer
                const astString = JSON.stringify(parseResult.value, getCircularReplacer(), 2);
                console.log(astString.substring(0, 500) + (astString.length > 500 ? '...' : ''));
            } catch (error) {
                console.error(chalk.red('Error stringifying AST:'), error);

                // Print a simplified version of the AST
                console.log(chalk.blue('Simplified AST:'));
                const simplifiedAst = {
                    $type: parseResult.value.$type,
                    statements: (parseResult.value as any).statements?.statements?.map((stmt: any) => ({
                        $type: stmt.$type
                    }))
                };
                console.log(JSON.stringify(simplifiedAst, null, 2));
            }
        }

        // Print validation diagnostics
        const diagnostics = document.diagnostics ?? [];
        if (diagnostics.length > 0) {
            console.log(chalk.yellow('\nValidation diagnostics:'));
            diagnostics.forEach((diagnostic: any, index: number) => {
                console.log(chalk.yellow(`  Diagnostic ${index + 1}:`),
                    diagnostic.message,
                    chalk.gray(`[${diagnostic.range.start.line}:${diagnostic.range.start.character}]`));
            });
        } else {
            console.log(chalk.green('\nNo validation diagnostics.'));
        }
    } catch (error) {
        console.error(chalk.red('Error processing file:'), error);
    }
};

/**
 * Set the root folder for the language server.
 */
async function setRootFolder(fileName: string, services: LangiumSharedCoreServices, root?: string): Promise<void> {
    // In Langium 3.0, we don't need to initialize the workspace explicitly
    // The workspace is initialized automatically when we create a document
}

export default function(): void {
    const program = new Command();

    const fileExtensions = PineScriptLanguageMetaData.fileExtensions.join(', ');
    program
        .command('parse')
        .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
        .description('parse a PineScript file and display the AST')
        .action(parseAction);

    program.parse(process.argv);
}

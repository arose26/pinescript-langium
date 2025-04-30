import * as fs from 'node:fs';
import * as path from 'node:path';
import escodegen from 'escodegen';

/**
 * CLI for testing arrow functions
 */
function main() {
    // Get the file path from command line arguments
    const filePath = process.argv[2];
    
    console.log('Arrow Function CLI');
    console.log('File path:', filePath);
    
    if (!filePath) {
        console.log('Please provide a file path');
        console.log('Usage: node --loader ts-node/esm src/cli/arrow-function-cli.ts <file-path>');
        return;
    }
    
    try {
        // Read the file
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        console.log('File content:', fileContent);
        
        // Create an ESTree AST for an arrow function
        const ast = {
            type: 'Program',
            body: [
                {
                    type: 'FunctionDeclaration',
                    id: {
                        type: 'Identifier',
                        name: 'add'
                    },
                    params: [
                        {
                            type: 'Identifier',
                            name: 'a'
                        },
                        {
                            type: 'Identifier',
                            name: 'b'
                        }
                    ],
                    body: {
                        type: 'BlockStatement',
                        body: [
                            {
                                type: 'ReturnStatement',
                                argument: {
                                    type: 'BinaryExpression',
                                    operator: '+',
                                    left: {
                                        type: 'Identifier',
                                        name: 'a'
                                    },
                                    right: {
                                        type: 'Identifier',
                                        name: 'b'
                                    }
                                }
                            }
                        ]
                    }
                },
                {
                    type: 'VariableDeclaration',
                    declarations: [
                        {
                            type: 'VariableDeclarator',
                            id: {
                                type: 'Identifier',
                                name: 'result'
                            },
                            init: {
                                type: 'CallExpression',
                                callee: {
                                    type: 'Identifier',
                                    name: 'add'
                                },
                                arguments: [
                                    {
                                        type: 'Literal',
                                        value: 5,
                                        raw: '5'
                                    },
                                    {
                                        type: 'Literal',
                                        value: 10,
                                        raw: '10'
                                    }
                                ]
                            }
                        }
                    ],
                    kind: 'var'
                }
            ],
            sourceType: 'script'
        };
        
        // Save AST to file
        const astOutputPath = path.join(path.dirname(filePath), `${path.basename(filePath, path.extname(filePath))}.ast.json`);
        fs.writeFileSync(astOutputPath, JSON.stringify(ast, null, 2));
        console.log(`AST saved to: ${astOutputPath}`);
        
        // Generate JavaScript code
        console.log('Generating JavaScript...');
        try {
            const jsCode = escodegen.generate(ast);
            console.log('Generated JavaScript:', jsCode);
            
            // Save JavaScript to file
            const jsOutputPath = path.join(path.dirname(filePath), `${path.basename(filePath, path.extname(filePath))}.js`);
            fs.writeFileSync(jsOutputPath, jsCode);
            console.log(`JavaScript saved to: ${jsOutputPath}`);
        } catch (error) {
            console.log('Error generating JavaScript:', error);
        }
    } catch (error) {
        console.log('Error:', error);
    }
}

main();

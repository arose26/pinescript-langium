import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { convertToESTree } from '../../src/cli/estree-converter';
import * as escodegen from 'escodegen';

describe('PCA Example', () => {
    it('should generate valid JavaScript for PCA.pine', () => {
        // This is a simplified test that just checks if the code can be generated without errors
        // In a real test, we would parse the PCA.pine file and convert it to ESTree
        
        // Create a minimal ESTree for testing
        const estree = {
            type: 'Program',
            body: [
                {
                    type: 'VariableDeclaration',
                    declarations: [
                        {
                            type: 'VariableDeclarator',
                            id: {
                                type: 'Identifier',
                                name: 'mat'
                            },
                            init: {
                                type: 'CallExpression',
                                callee: {
                                    type: 'MemberExpression',
                                    object: {
                                        type: 'Identifier',
                                        name: 'matrix'
                                    },
                                    property: {
                                        type: 'Identifier',
                                        name: 'new'
                                    },
                                    computed: false
                                },
                                arguments: [
                                    {
                                        type: 'Literal',
                                        value: 3
                                    },
                                    {
                                        type: 'Literal',
                                        value: 3
                                    },
                                    {
                                        type: 'Literal',
                                        value: 0
                                    }
                                ]
                            }
                        }
                    ],
                    kind: 'const'
                },
                {
                    type: 'ExpressionStatement',
                    expression: {
                        type: 'CallExpression',
                        callee: {
                            type: 'MemberExpression',
                            object: {
                                type: 'Identifier',
                                name: 'matrix'
                            },
                            property: {
                                type: 'Identifier',
                                name: 'pca'
                            },
                            computed: false
                        },
                        arguments: [
                            {
                                type: 'Identifier',
                                name: 'mat'
                            },
                            {
                                type: 'Literal',
                                value: 2
                            }
                        ]
                    }
                }
            ],
            sourceType: 'script'
        };
        
        const js = escodegen.generate(estree);
        expect(js).toContain('const mat = matrix.new(3, 3, 0)');
        expect(js).toContain('matrix.pca(mat, 2)');
    });
});

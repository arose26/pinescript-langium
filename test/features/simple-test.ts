import { describe, it, expect } from 'vitest';
import { convertToESTree } from '../../src/cli/estree-converter';
import * as escodegen from 'escodegen';

describe('PineScript Features', () => {
    it('should convert array functions', () => {
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
                                name: 'arr'
                            },
                            init: {
                                type: 'CallExpression',
                                callee: {
                                    type: 'MemberExpression',
                                    object: {
                                        type: 'Identifier',
                                        name: 'array'
                                    },
                                    property: {
                                        type: 'Identifier',
                                        name: 'new_float'
                                    },
                                    computed: false
                                },
                                arguments: [
                                    {
                                        type: 'Literal',
                                        value: 5
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
                }
            ],
            sourceType: 'script'
        };
        
        const js = escodegen.generate(estree);
        expect(js).toContain('const arr = array.new_float(5, 0)');
    });

    it('should convert matrix functions', () => {
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
                }
            ],
            sourceType: 'script'
        };
        
        const js = escodegen.generate(estree);
        expect(js).toContain('const mat = matrix.new(3, 3, 0)');
    });

    it('should convert for loops with step', () => {
        const estree = {
            type: 'Program',
            body: [
                {
                    type: 'ForStatement',
                    init: {
                        type: 'VariableDeclaration',
                        declarations: [
                            {
                                type: 'VariableDeclarator',
                                id: {
                                    type: 'Identifier',
                                    name: 'i'
                                },
                                init: {
                                    type: 'Literal',
                                    value: 0
                                }
                            }
                        ],
                        kind: 'let'
                    },
                    test: {
                        type: 'BinaryExpression',
                        operator: '<=',
                        left: {
                            type: 'Identifier',
                            name: 'i'
                        },
                        right: {
                            type: 'Literal',
                            value: 10
                        }
                    },
                    update: {
                        type: 'AssignmentExpression',
                        operator: '+=',
                        left: {
                            type: 'Identifier',
                            name: 'i'
                        },
                        right: {
                            type: 'Literal',
                            value: 2
                        }
                    },
                    body: {
                        type: 'BlockStatement',
                        body: [
                            {
                                type: 'ExpressionStatement',
                                expression: {
                                    type: 'AssignmentExpression',
                                    operator: '=',
                                    left: {
                                        type: 'Identifier',
                                        name: 'x'
                                    },
                                    right: {
                                        type: 'Identifier',
                                        name: 'i'
                                    }
                                }
                            }
                        ]
                    }
                }
            ],
            sourceType: 'script'
        };
        
        const js = escodegen.generate(estree);
        expect(js).toContain('for (let i = 0; i <= 10; i += 2)');
        expect(js).toContain('x = i');
    });
});

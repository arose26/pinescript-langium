import { AstNode } from 'langium';
import {
    StartScript,
    BinaryExpression,
    UnaryExpression,
    LiteralNumber,
    LiteralString,
    LiteralBool,
    NameReference,
    PrimaryExpressionCall,
    PrimaryExpressionAttribute,
    PrimaryExpressionSubscript,
    PrimaryExpressionMethodCall,
    SimpleNameInitialization,
    SimpleReassignment,
    IfStructure,
    ForStructure,
    ForStructureTo,
    ForStructureIn,
    WhileStructure,
    FunctionDeclaration,
    ArrayExpression,
    ExpressionStatement,
    BreakStatement,
    ContinueStatement,
    StructureStatement,
    AssignmentTargetName,
    InequalityExpressionRule,
    EqualityExpressionRule,
    ConditionalExpressionRule
} from '../language/generated/ast.js';

/**
 * Converts a Langium AST to an ESTree-compatible AST
 */
export class PineScriptToESTreeConverter {
    /**
     * Convert a Langium AST to an ESTree-compatible AST
     * @param ast The Langium AST to convert
     * @returns An ESTree-compatible AST
     */
    convert(ast: AstNode): any {
        if (!ast) {
            return null;
        }

        switch (ast.$type) {
            case 'StartScript':
                return this.convertProgram(ast as StartScript);
            case 'BinaryExpression':
                return this.convertBinaryExpression(ast as BinaryExpression);
            case 'UnaryExpression':
                return this.convertUnaryExpression(ast as UnaryExpression);
            case 'LiteralNumber':
                return this.convertLiteralNumber(ast as LiteralNumber);
            case 'LiteralString':
                return this.convertLiteralString(ast as LiteralString);
            case 'LiteralBool':
                return this.convertLiteralBool(ast as LiteralBool);
            case 'NameReference':
                return this.convertNameReference(ast as NameReference);
            case 'PrimaryExpressionCall':
                return this.convertPrimaryExpressionCall(ast as PrimaryExpressionCall);
            case 'PrimaryExpressionAttribute':
                return this.convertPrimaryExpressionAttribute(ast as PrimaryExpressionAttribute);
            case 'PrimaryExpressionSubscript':
                return this.convertPrimaryExpressionSubscript(ast as PrimaryExpressionSubscript);
            case 'PrimaryExpressionMethodCall':
                return this.convertPrimaryExpressionMethodCall(ast as PrimaryExpressionMethodCall);
            case 'SimpleNameInitialization':
                return this.convertSimpleNameInitialization(ast as SimpleNameInitialization);
            case 'SimpleReassignment':
                return this.convertSimpleReassignment(ast as SimpleReassignment);
            case 'IfStructure':
                return this.convertIfStructure(ast as IfStructure);
            case 'ForStructure':
                return this.convertForStructure(ast as ForStructure);
            case 'ForStructureTo':
                return this.convertForStructure(ast as ForStructureTo);
            case 'ForStructureIn':
                return this.convertForStructure(ast as ForStructureIn);
            case 'WhileStructure':
                return this.convertWhileStructure(ast as WhileStructure);
            case 'FunctionDeclaration':
                return this.convertFunctionDeclaration(ast as FunctionDeclaration);
            case 'ArrayExpression':
                return this.convertArrayExpression(ast as ArrayExpression);
            case 'ExpressionStatement':
                return this.convertExpressionStatement(ast as ExpressionStatement);
            case 'BreakStatement':
                return this.convertBreakStatement(ast as BreakStatement);
            case 'ContinueStatement':
                return this.convertContinueStatement(ast as ContinueStatement);
            case 'StructureStatement':
                return this.convertStructureStatement(ast as StructureStatement);
            case 'AssignmentTargetName':
                return this.convertAssignmentTargetName(ast as AssignmentTargetName);
            case 'InequalityExpressionRule':
                return this.convertInequalityExpressionRule(ast as InequalityExpressionRule);
            case 'EqualityExpressionRule':
                return this.convertEqualityExpressionRule(ast as EqualityExpressionRule);
            case 'ConditionalExpressionRule':
                return this.convertConditionalExpressionRule(ast as ConditionalExpressionRule);
            // ReturnStatement is not part of our AST yet
            // case 'ReturnStatement':
            //    return this.convertReturnStatement(ast as ReturnStatement);
            default:
                console.warn(`Unsupported AST node type: ${ast.$type}`);
                return {
                    type: 'Unknown',
                    originalType: ast.$type
                };
        }
    }

    /**
     * Convert a StartScript node to an ESTree Program node
     */
    convertProgram(node: StartScript): any {
        const body = node.statements?.statements.map(stmt => this.convert(stmt)) || [];
        return {
            type: 'Program',
            body,
            sourceType: 'script'
        };
    }

    /**
     * Convert a BinaryExpression node to an ESTree BinaryExpression node
     */
    convertBinaryExpression(node: BinaryExpression): any {
        return {
            type: 'BinaryExpression',
            operator: node.operator,
            left: this.convert(node.left),
            right: this.convert(node.right)
        };
    }

    /**
     * Convert a UnaryExpression node to an ESTree UnaryExpression node
     */
    convertUnaryExpression(node: UnaryExpression): any {
        // Map PineScript operators to JavaScript operators
        let operator = node.operator;
        if (operator === 'not') {
            // Use a string that's valid for ESTree
            return {
                type: 'UnaryExpression',
                operator: '!',
                argument: this.convert(node.operand),
                prefix: true
            };
        }

        return {
            type: 'UnaryExpression',
            operator: operator,
            argument: this.convert(node.operand),
            prefix: true
        };
    }

    /**
     * Convert a LiteralNumber node to an ESTree Literal node
     */
    convertLiteralNumber(node: LiteralNumber): any {
        return {
            type: 'Literal',
            value: Number(node.value),
            raw: String(node.value)
        };
    }

    /**
     * Convert a LiteralString node to an ESTree Literal node
     */
    convertLiteralString(node: LiteralString): any {
        return {
            type: 'Literal',
            value: node.value,
            raw: `"${node.value}"`
        };
    }

    /**
     * Convert a LiteralBool node to an ESTree Literal node
     */
    convertLiteralBool(node: LiteralBool): any {
        return {
            type: 'Literal',
            value: node.value === true,
            raw: node.value ? 'true' : 'false'
        };
    }

    /**
     * Convert a NameReference node to an ESTree Identifier node
     */
    convertNameReference(node: NameReference): any {
        return {
            type: 'Identifier',
            name: node.name.parts.join('.')
        };
    }

    /**
     * Convert a PrimaryExpressionCall node to an ESTree CallExpression node
     */
    convertPrimaryExpressionCall(node: PrimaryExpressionCall): any {
        return {
            type: 'CallExpression',
            callee: this.convert(node.expression),
            arguments: node.arguments?.arguments.map(arg => this.convert(arg.expression)) || []
        };
    }

    /**
     * Convert a PrimaryExpressionAttribute node to an ESTree MemberExpression node
     */
    convertPrimaryExpressionAttribute(node: PrimaryExpressionAttribute): any {
        return {
            type: 'MemberExpression',
            object: this.convert(node.expression),
            property: {
                type: 'Identifier',
                name: node.attribute
            },
            computed: false
        };
    }

    /**
     * Convert a PrimaryExpressionSubscript node to an ESTree MemberExpression node
     */
    convertPrimaryExpressionSubscript(node: PrimaryExpressionSubscript): any {
        return {
            type: 'MemberExpression',
            object: this.convert(node.expression),
            property: this.convert(node.slice.expressions[0]),
            computed: true
        };
    }

    /**
     * Convert a PrimaryExpressionMethodCall node to an ESTree CallExpression node
     */
    convertPrimaryExpressionMethodCall(node: PrimaryExpressionMethodCall): any {
        return {
            type: 'CallExpression',
            callee: {
                type: 'MemberExpression',
                object: this.convert(node.expression),
                property: {
                    type: 'Identifier',
                    name: node.method
                },
                computed: false
            },
            arguments: node.arguments?.arguments.map(arg => this.convert(arg.expression)) || []
        };
    }

    /**
     * Convert a SimpleNameInitialization node to an ESTree VariableDeclaration node
     */
    convertSimpleNameInitialization(node: SimpleNameInitialization): any {
        return {
            type: 'VariableDeclaration',
            declarations: [
                {
                    type: 'VariableDeclarator',
                    id: {
                        type: 'Identifier',
                        name: node.declaration.name
                    },
                    init: this.convert(node.expression)
                }
            ],
            kind: 'var'
        };
    }

    /**
     * Convert a SimpleReassignment node to an ESTree AssignmentExpression node
     */
    convertSimpleReassignment(node: SimpleReassignment): any {
        return {
            type: 'ExpressionStatement',
            expression: {
                type: 'AssignmentExpression',
                operator: '=',
                left: this.convert(node.target),
                right: this.convert(node.expression)
            }
        };
    }

    /**
     * Convert an IfStructure node to an ESTree IfStatement node
     */
    convertIfStructure(node: IfStructure): any {
        // Create block statement for the then block
        const consequent = {
            type: 'BlockStatement',
            body: this.convertStatementsToBody(node.thenBlock)
        };

        // Handle the else-if and else blocks
        let alternate = null;

        if (node.elifCondition && node.elifBlock) {
            // Create a nested if statement for the else-if block
            const elifConsequent = {
                type: 'BlockStatement',
                body: this.convertStatementsToBody(node.elifBlock)
            };

            let elifAlternate = null;

            if (node.elif2Condition && node.elif2Block) {
                // Create a nested if statement for the second else-if block
                const elif2Consequent = {
                    type: 'BlockStatement',
                    body: this.convertStatementsToBody(node.elif2Block)
                };

                let elif2Alternate = null;

                if (node.elseBlock) {
                    // Create a block statement for the else block
                    elif2Alternate = {
                        type: 'BlockStatement',
                        body: this.convertStatementsToBody(node.elseBlock)
                    };
                }

                elifAlternate = {
                    type: 'IfStatement',
                    test: this.convert(node.elif2Condition),
                    consequent: elif2Consequent,
                    alternate: elif2Alternate
                };
            } else if (node.elseBlock) {
                // Create a block statement for the else block
                elifAlternate = {
                    type: 'BlockStatement',
                    body: this.convertStatementsToBody(node.elseBlock)
                };
            }

            alternate = {
                type: 'IfStatement',
                test: this.convert(node.elifCondition),
                consequent: elifConsequent,
                alternate: elifAlternate
            };
        } else if (node.elseBlock) {
            // Create a block statement for the else block
            alternate = {
                type: 'BlockStatement',
                body: this.convertStatementsToBody(node.elseBlock)
            };
        }

        return {
            type: 'IfStatement',
            test: this.convert(node.condition),
            consequent,
            alternate
        };
    }

    /**
     * Convert a LocalBlock to an array of ESTree statements
     */
    convertStatementsToBody(block: any): any[] {
        if (block.$type === 'IndentedLocalBlock') {
            return block.statements.statements.map((stmt: any) => this.convert(stmt));
        } else if (block.$type === 'InlineLocalBlock') {
            return [this.convert(block.statement)];
        } else if (block.statements && Array.isArray(block.statements)) {
            return block.statements.map((stmt: any) => this.convert(stmt));
        } else if (block.statements && block.statements.statements && Array.isArray(block.statements.statements)) {
            return block.statements.statements.map((stmt: any) => this.convert(stmt));
        }

        return [];
    }

    /**
     * Convert a LocalBlock node to an ESTree BlockStatement node
     */
    convertLocalBlock(node: any): any {
        return {
            type: 'BlockStatement',
            body: this.convertStatementsToBody(node)
        };
    }

    /**
     * Convert a ForStructure node to an ESTree ForStatement node
     */
    convertForStructure(node: ForStructure): any {
        if (node.$type === 'ForStructureTo') {
            const forTo = node as ForStructureTo;
            // Convert PineScript's 'for i = 0 to 10' to JavaScript's 'for (let i = 0; i <= 10; i++)'
            const iteratorName = this.convertForIterator(forTo.iterator);

            return {
                type: 'ForStatement',
                init: {
                    type: 'VariableDeclaration',
                    declarations: [
                        {
                            type: 'VariableDeclarator',
                            id: {
                                type: 'Identifier',
                                name: iteratorName
                            },
                            init: this.convert(forTo.start)
                        }
                    ],
                    kind: 'let'
                },
                test: {
                    type: 'BinaryExpression',
                    operator: '<=',
                    left: {
                        type: 'Identifier',
                        name: iteratorName
                    },
                    right: this.convert(forTo.end)
                },
                update: {
                    type: 'UpdateExpression',
                    operator: '++',
                    argument: {
                        type: 'Identifier',
                        name: iteratorName
                    },
                    prefix: false
                },
                body: {
                    type: 'BlockStatement',
                    body: this.convertStatementsToBody(forTo.block)
                }
            };
        } else if (node.$type === 'ForStructureIn') {
            const forIn = node as ForStructureIn;
            // Convert PineScript's 'for i in arr' to JavaScript's 'for (const i of arr)'
            const iteratorName = this.convertForIterator(forIn.iterator);

            return {
                type: 'ForOfStatement',
                left: {
                    type: 'VariableDeclaration',
                    declarations: [
                        {
                            type: 'VariableDeclarator',
                            id: {
                                type: 'Identifier',
                                name: iteratorName
                            },
                            init: null
                        }
                    ],
                    kind: 'const'
                },
                right: this.convert(forIn.collection),
                body: {
                    type: 'BlockStatement',
                    body: this.convertStatementsToBody(forIn.block)
                }
            };
        }

        // Fallback
        return {
            type: 'ForStatement',
            init: null,
            test: null,
            update: null,
            body: {
                type: 'BlockStatement',
                body: []
            }
        };
    }

    /**
     * Convert a ForIterator to a string (iterator name)
     */
    convertForIterator(iterator: any): string {
        if (typeof iterator === 'string') {
            return iterator;
        } else if (iterator.$type === 'NameStore') {
            return iterator.name;
        } else if (iterator.$type === 'TupleDeclaration') {
            // For simplicity, just use the first name in the tuple
            return iterator.names[0] || 'i';
        }
        return 'i'; // Default iterator name
    }

    /**
     * Convert a WhileStructure node to an ESTree WhileStatement node
     */
    convertWhileStructure(node: WhileStructure): any {
        return {
            type: 'WhileStatement',
            test: this.convert(node.condition),
            body: {
                type: 'BlockStatement',
                body: this.convertStatementsToBody(node.block)
            }
        };
    }

    /**
     * Convert a FunctionDeclaration node to an ESTree FunctionDeclaration node
     */
    convertFunctionDeclaration(node: FunctionDeclaration): any {
        const params = node.parameters?.parameters.map(param => ({
            type: 'Identifier',
            name: param.name
        })) || [];

        let bodyStatements = [];

        // If it has a returnExpr, create a return statement with it
        if (node.returnExpr) {
            bodyStatements = [
                {
                    type: 'ReturnStatement',
                    argument: this.convert(node.returnExpr)
                }
            ];
        }
        // If it's an inline block, we need to add a return statement
        else if (node.body?.$type === 'InlineLocalBlock') {
            bodyStatements = [
                {
                    type: 'ReturnStatement',
                    argument: this.convert(node.body.statement)
                }
            ];
        } else if (node.body) {
            bodyStatements = this.convertStatementsToBody(node.body);
        }

        return {
            type: 'FunctionDeclaration',
            id: {
                type: 'Identifier',
                name: node.name
            },
            params,
            body: {
                type: 'BlockStatement',
                body: bodyStatements
            }
        };
    }



    /**
     * Convert an ArrayExpression node to an ESTree ArrayExpression node
     */
    convertArrayExpression(node: ArrayExpression): any {
        return {
            type: 'ArrayExpression',
            elements: node.elements.map(element => this.convert(element))
        };
    }

    /**
     * Convert an ExpressionStatement node to an ESTree ExpressionStatement node
     */
    convertExpressionStatement(node: ExpressionStatement): any {
        return {
            type: 'ExpressionStatement',
            expression: this.convert(node.expression)
        };
    }

    /**
     * Convert a BreakStatement node to an ESTree BreakStatement node
     */
    convertBreakStatement(_node: BreakStatement): any {
        return {
            type: 'BreakStatement',
            label: null
        };
    }

    /**
     * Convert a ContinueStatement node to an ESTree ContinueStatement node
     */
    convertContinueStatement(_node: ContinueStatement): any {
        return {
            type: 'ContinueStatement',
            label: null
        };
    }

    /**
     * Convert a StructureStatement node to an ESTree statement node
     */
    convertStructureStatement(node: StructureStatement): any {
        // A StructureStatement contains a structure, which can be an IfStructure, ForStructure, etc.
        return this.convert(node.structure);
    }

    /**
     * Convert an AssignmentTargetName node to an ESTree Identifier node
     */
    convertAssignmentTargetName(node: AssignmentTargetName): any {
        return {
            type: 'Identifier',
            name: node.name
        };
    }

    /**
     * Convert an InequalityExpressionRule node to an ESTree BinaryExpression node
     */
    convertInequalityExpressionRule(node: InequalityExpressionRule): any {
        if (node.pairs.length === 0) {
            return this.convert(node.left);
        }

        // For simplicity, we'll just handle the first pair
        const pair = node.pairs[0];
        let operator = '>';

        if (pair.$type === 'LessThanTrailingPair') {
            operator = '<';
        } else if (pair.$type === 'LessThanEqualTrailingPair') {
            operator = '<=';
        } else if (pair.$type === 'GreaterThanTrailingPair') {
            operator = '>';
        } else if (pair.$type === 'GreaterThanEqualTrailingPair') {
            operator = '>=';
        }

        return {
            type: 'BinaryExpression',
            operator,
            left: this.convert(node.left),
            right: this.convert(pair.right)
        };
    }

    /**
     * Convert an EqualityExpressionRule node to an ESTree BinaryExpression node
     */
    convertEqualityExpressionRule(node: EqualityExpressionRule): any {
        if (node.pairs.length === 0) {
            return this.convert(node.left);
        }

        // For simplicity, we'll just handle the first pair
        const pair = node.pairs[0];
        let operator = '==';

        if (pair.$type === 'EqualTrailingPair') {
            operator = '==';
        } else if (pair.$type === 'NotEqualTrailingPair') {
            operator = '!=';
        }

        return {
            type: 'BinaryExpression',
            operator,
            left: this.convert(node.left),
            right: this.convert(pair.right)
        };
    }

    /**
     * Convert a ConditionalExpressionRule node to an ESTree ConditionalExpression node
     */
    convertConditionalExpressionRule(node: ConditionalExpressionRule): any {
        return {
            type: 'ConditionalExpression',
            test: this.convert(node.condition),
            consequent: this.convert(node.thenExpr),
            alternate: this.convert(node.elseExpr)
        };
    }

    /**
     * Convert a ReturnStatement node to an ESTree ReturnStatement node
     * Note: ReturnStatement is not part of our AST yet
     */
    // convertReturnStatement(node: ReturnStatement): any {
    //     return {
    //         type: 'ReturnStatement',
    //         argument: node.expression ? this.convert(node.expression) : null
    //     };
    // }
}

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
    // These types are used in type assertions
    // ArrowFunctionExpression,
    // ArrowFunctionBlock,
    // RegularFunction,
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
            console.warn('Null node passed to convert');
            return null;
        }

        if (!ast.$type) {
            console.warn('Node has no $type property:', ast);
            return null;
        }

        try {
            // Log the node type for debugging
            console.log(`Converting node of type: ${ast.$type}`);

            // Create a function to safely stringify the AST without circular references
            function safeStringify(obj: any, indent = 2) {
                const cache = new Set();
                return JSON.stringify(obj, (key, value) => {
                    // Skip Langium-specific properties
                    if (key === '$cstNode') return undefined;
                    if (key === '$container') return undefined;
                    if (key === '$containerProperty') return undefined;
                    if (key === '$containerIndex') return undefined;
                    if (key === '$document') return undefined;

                    // Handle circular references
                    if (typeof value === 'object' && value !== null) {
                        if (cache.has(value)) {
                            return '[Circular]';
                        }
                        cache.add(value);
                    }
                    return value;
                }, indent);
            }

            // Log the node structure for debugging (safely)
            try {
                console.log('Node structure:', safeStringify(ast));
            } catch (error: any) {
                console.log('Could not stringify node structure:', error.message || String(error));
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
                case 'ElseIfClause':
                    return this.convertElseIfClause(ast as any);
                case 'ElseClause':
                    return this.convertElseClause(ast as any);
                case 'ForStructure':
                    return this.convertForStructure(ast as ForStructure);
                case 'ForStructureTo':
                    return this.convertForStructure(ast as ForStructureTo);
                case 'ForStructureIn':
                    return this.convertForStructure(ast as ForStructureIn);
                case 'WhileStructure':
                    return this.convertWhileStructure(ast as WhileStructure);
                case 'FunctionDeclaration':
                case 'ArrowFunctionExpression':
                case 'ArrowFunctionBlock':
                case 'RegularFunction':
                case 'ArrowFunctionDeclaration':
                case 'ArrowFunctionExpressionDecl':
                case 'ArrowFunctionBlockDecl':
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
                case 'SimpleTupleInitialization':
                    return this.convertSimpleTupleInitialization(ast as any);
                case 'GroupedExpression':
                    return this.convertGroupedExpression(ast as any);
                // ReturnStatement is not part of our AST yet
                // case 'ReturnStatement':
                //    return this.convertReturnStatement(ast as ReturnStatement);
                default:
                    console.warn(`Unsupported AST node type: ${ast.$type}`);
                    // Return a minimal valid node to avoid errors
                    return {
                        type: 'EmptyStatement'
                    };
            }
        } catch (error: any) {
            console.error(`Error converting node of type ${ast.$type}:`, error);

            // Create a function to safely stringify the AST without circular references
            function safeStringify(obj: any, indent = 2) {
                const cache = new Set();
                return JSON.stringify(obj, (key, value) => {
                    // Skip Langium-specific properties
                    if (key === '$cstNode') return undefined;
                    if (key === '$container') return undefined;
                    if (key === '$containerProperty') return undefined;
                    if (key === '$containerIndex') return undefined;
                    if (key === '$document') return undefined;

                    // Handle circular references
                    if (typeof value === 'object' && value !== null) {
                        if (cache.has(value)) {
                            return '[Circular]';
                        }
                        cache.add(value);
                    }
                    return value;
                }, indent);
            }

            try {
                console.error('Node:', safeStringify(ast));
            } catch (err: any) {
                console.error('Could not stringify node:', err.message || String(err));
            }

            // Return a minimal valid node to avoid errors
            return {
                type: 'EmptyStatement'
            };
        }
    }

    /**
     * Convert a StartScript node to an ESTree Program node
     */
    convertProgram(node: StartScript): any {
        console.log('Converting StartScript to Program');

        // Avoid circular references by not logging the entire node
        console.log('StartScript has statements:', !!node.statements);
        if (node.statements) {
            console.log('Statements count:', node.statements.statements?.length || 0);
        }

        let body: any[] = [];

        try {
            if (node.statements && node.statements.statements) {
                body = node.statements.statements.map(stmt => {
                    try {
                        return this.convert(stmt);
                    } catch (error) {
                        console.error('Error converting statement type:', stmt.$type);
                        return null;
                    }
                }).filter(stmt => stmt !== null);
            }
        } catch (error) {
            console.error('Error converting statements:', error);
        }

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
        console.log('Converting BinaryExpression with operator:', node.operator);

        // Convert the left and right operands
        const left = this.convert(node.left);
        const right = this.convert(node.right);

        // Check if either operand is null or undefined
        if (!left || !right) {
            console.error('Binary expression has null or undefined operand:',
                          'left =', left, 'right =', right);
            console.error('Binary expression node:', JSON.stringify(node, null, 2));

            // Return a valid expression to avoid errors
            return {
                type: 'Literal',
                value: 0,
                raw: '0'
            };
        }

        return {
            type: 'BinaryExpression',
            operator: node.operator,
            left: left,
            right: right
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
     * Enhanced to handle array functions and other built-in functions
     */
    convertPrimaryExpressionCall(node: PrimaryExpressionCall): any {
        console.log('Converting PrimaryExpressionCall');

        // Process arguments, separating positional and named arguments
        const args = node.arguments?.arguments || [];
        const positionalArgs: any[] = [];
        const namedArgs: {name: string, value: any}[] = [];

        args.forEach(arg => {
            if (arg.name) {
                // This is a named argument
                namedArgs.push({
                    name: arg.name,
                    value: this.convert(arg.expression)
                });
            } else {
                // This is a positional argument
                positionalArgs.push(this.convert(arg.expression));
            }
        });

        // If we have named arguments, create an object literal as the last argument
        const finalArgs = [...positionalArgs];
        if (namedArgs.length > 0) {
            finalArgs.push({
                type: 'ObjectExpression',
                properties: namedArgs.map(namedArg => ({
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: namedArg.name
                    },
                    value: namedArg.value,
                    kind: 'init',
                    computed: false,
                    method: false,
                    shorthand: false
                }))
            });
        }

        // Check if this is a namespace function call (array, matrix, etc.)
        const expressionNode = node.expression as any;

        // Handle direct namespace.function references
        if (expressionNode.$type === 'NameReference' &&
            expressionNode.name &&
            expressionNode.name.parts &&
            expressionNode.name.parts.length === 2) {

            const namespace = expressionNode.name.parts[0];
            const functionName = expressionNode.name.parts[1];

            console.log(`Detected namespace function call: ${namespace}.${functionName}`);

            return {
                type: 'CallExpression',
                callee: {
                    type: 'MemberExpression',
                    object: {
                        type: 'Identifier',
                        name: namespace
                    },
                    property: {
                        type: 'Identifier',
                        name: functionName
                    },
                    computed: false
                },
                arguments: finalArgs
            };
        }

        // Handle attribute-based namespace function calls
        else if (expressionNode.$type === 'PrimaryExpressionAttribute' &&
            expressionNode.expression &&
            expressionNode.expression.$type === 'NameReference' &&
            expressionNode.expression.name &&
            expressionNode.expression.name.parts) {

            const namespace = expressionNode.expression.name.parts[0];
            const functionName = expressionNode.attribute;

            console.log(`Detected attribute-based namespace function call: ${namespace}.${functionName}`);

            return {
                type: 'CallExpression',
                callee: {
                    type: 'MemberExpression',
                    object: {
                        type: 'Identifier',
                        name: namespace
                    },
                    property: {
                        type: 'Identifier',
                        name: functionName
                    },
                    computed: false
                },
                arguments: finalArgs
            };
        }

        return {
            type: 'CallExpression',
            callee: this.convert(node.expression),
            arguments: finalArgs
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
        // For simplicity, we'll just handle the first expression in the slice
        // This handles array subscripts like array[index]
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
        // Process arguments, separating positional and named arguments
        const args = node.arguments?.arguments || [];
        const positionalArgs: any[] = [];
        const namedArgs: {name: string, value: any}[] = [];

        args.forEach(arg => {
            if (arg.name) {
                // This is a named argument
                namedArgs.push({
                    name: arg.name,
                    value: this.convert(arg.expression)
                });
            } else {
                // This is a positional argument
                positionalArgs.push(this.convert(arg.expression));
            }
        });

        // If we have named arguments, create an object literal as the last argument
        const finalArgs = [...positionalArgs];
        if (namedArgs.length > 0) {
            finalArgs.push({
                type: 'ObjectExpression',
                properties: namedArgs.map(namedArg => ({
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: namedArg.name
                    },
                    value: namedArg.value,
                    kind: 'init',
                    computed: false,
                    method: false,
                    shorthand: false
                }))
            });
        }

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
            arguments: finalArgs
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
     * Convert a SimpleTupleInitialization node to an ESTree VariableDeclaration node
     * This handles assignments like [a, b] = someFunction()
     */
    convertSimpleTupleInitialization(node: any): any {
        console.log('Converting SimpleTupleInitialization');

        try {
            // Create an array pattern for the left side of the assignment
            const arrayPattern = {
                type: 'ArrayPattern',
                elements: node.declaration.names.map((variable: string) => ({
                    type: 'Identifier',
                    name: variable
                }))
            };

            // Convert the right side expression
            const rightExpression = node.expression ? this.convert(node.expression) : null;

            // Create a variable declaration with the array pattern
            return {
                type: 'VariableDeclaration',
                declarations: [
                    {
                        type: 'VariableDeclarator',
                        id: arrayPattern,
                        init: rightExpression
                    }
                ],
                kind: 'var'
            };
        } catch (error: any) {
            console.error('Error converting SimpleTupleInitialization:', error);
            console.error('Node structure:', JSON.stringify(node, null, 2));
            throw new Error(`Failed to convert tuple initialization: ${error?.message || String(error)}`);
        }
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

        // Handle the else block
        let alternate = null;

        // Cast to any to access properties that might not be in the interface
        const nodeAny = node as any;

        // Check for ElseIfClause
        if (nodeAny.ElseIfClause) {
            alternate = this.convert(nodeAny.ElseIfClause);
        }
        // Check for elseIfBlock (nested if in else clause)
        else if (nodeAny.elseIfBlock) {
            // If it's an elseIfBlock, convert it to an IfStatement
            alternate = this.convertIfStructure(nodeAny.elseIfBlock);
        }
        // Check for ElseClause
        else if (nodeAny.ElseClause) {
            alternate = this.convert(nodeAny.ElseClause);
        }
        // Check for elseBlock (regular else clause)
        else if (nodeAny.elseBlock) {
            // If it's an elseBlock, convert it to a BlockStatement
            alternate = {
                type: 'BlockStatement',
                body: this.convertStatementsToBody(nodeAny.elseBlock)
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
     * Convert an ElseIfClause node to an ESTree IfStatement node
     */
    convertElseIfClause(node: any): any {
        // Create block statement for the then block
        const consequent = {
            type: 'BlockStatement',
            body: this.convertStatementsToBody(node.thenBlock)
        };

        // Handle the else block
        let alternate = null;

        // Check for nested ElseIfClause
        if (node.ElseIfClause) {
            alternate = this.convert(node.ElseIfClause);
        }
        // Check for ElseClause
        else if (node.ElseClause) {
            alternate = this.convert(node.ElseClause);
        }

        return {
            type: 'IfStatement',
            test: this.convert(node.condition),
            consequent,
            alternate
        };
    }

    /**
     * Convert an ElseClause node to an ESTree BlockStatement or IfStatement node
     */
    convertElseClause(node: any): any {
        // Check if this is actually an if-else structure
        if (node.condition && node.thenBlock) {
            // This is actually an if statement with an else clause
            return {
                type: 'IfStatement',
                test: this.convert(node.condition),
                consequent: {
                    type: 'BlockStatement',
                    body: this.convertStatementsToBody(node.thenBlock)
                },
                alternate: node.elseBlock ? {
                    type: 'BlockStatement',
                    body: this.convertStatementsToBody(node.elseBlock)
                } : null
            };
        }

        // Regular else clause
        return {
            type: 'BlockStatement',
            body: this.convertStatementsToBody(node.elseBlock)
        };
    }



    /**
     * Convert a LocalBlock to an array of ESTree statements
     * This method handles various block types that can appear in functions, arrow functions,
     * and other structures.
     *
     * @param block The block to convert
     * @returns An array of ESTree statements
     */
    convertStatementsToBody(block: any): any[] {
        console.log('Converting statements to body, block type:', block?.$type || 'undefined');

        try {
            // Handle null or undefined blocks
            if (!block) {
                console.log('Block is null or undefined');
                return [];
            }

            // Handle different types of blocks based on their $type
            switch (block.$type) {
                case 'IndentedLocalBlock':
                    console.log('Block is IndentedLocalBlock');
                    if (block.statements?.statements && Array.isArray(block.statements.statements)) {
                        return block.statements.statements
                            .map((stmt: any) => {
                                try {
                                    return this.convert(stmt);
                                } catch (error: any) {
                                    console.error('Error converting statement in IndentedLocalBlock:', error);
                                    throw new Error(`Failed to convert statement in IndentedLocalBlock: ${error?.message || String(error)}`);
                                }
                            })
                            .filter((stmt: any) => stmt !== null);
                    }
                    console.log('IndentedLocalBlock has no statements');
                    return [];

                case 'InlineLocalBlock':
                    console.log('Block is InlineLocalBlock');
                    if (block.statement) {
                        try {
                            return [this.convert(block.statement)];
                        } catch (error: any) {
                            console.error('Error converting statement in InlineLocalBlock:', error);
                            throw new Error(`Failed to convert statement in InlineLocalBlock: ${error?.message || String(error)}`);
                        }
                    }
                    console.log('InlineLocalBlock has no statement');
                    return [];

                case 'Statements':
                    console.log('Block is Statements');
                    if (block.statements && Array.isArray(block.statements)) {
                        return block.statements
                            .map((stmt: any) => {
                                try {
                                    return this.convert(stmt);
                                } catch (error: any) {
                                    console.error('Error converting statement in Statements:', error);
                                    throw new Error(`Failed to convert statement in Statements: ${error?.message || String(error)}`);
                                }
                            })
                            .filter((stmt: any) => stmt !== null);
                    }

                    // Handle the case where statements is an object with a statements array
                    if (block.statements?.statements && Array.isArray(block.statements.statements)) {
                        return block.statements.statements
                            .map((stmt: any) => {
                                try {
                                    return this.convert(stmt);
                                } catch (error: any) {
                                    console.error('Error converting statement in Statements.statements:', error);
                                    throw new Error(`Failed to convert statement in Statements.statements: ${error?.message || String(error)}`);
                                }
                            })
                            .filter((stmt: any) => stmt !== null);
                    }

                    console.log('Statements has no valid statements array');
                    return [];

                default:
                    // Handle cases where the block doesn't have a specific $type but has statements

                    // Case 1: block has a direct statements array
                    if (block.statements && Array.isArray(block.statements)) {
                        console.log('Block has direct statements array');
                        return block.statements
                            .map((stmt: any) => {
                                try {
                                    return this.convert(stmt);
                                } catch (error: any) {
                                    console.error('Error converting statement in direct statements array:', error);
                                    throw new Error(`Failed to convert statement in direct statements array: ${error?.message || String(error)}`);
                                }
                            })
                            .filter((stmt: any) => stmt !== null);
                    }

                    // Case 2: block has a statements object with a statements array
                    if (block.statements?.statements && Array.isArray(block.statements.statements)) {
                        console.log('Block has nested statements.statements array');
                        return block.statements.statements
                            .map((stmt: any) => {
                                try {
                                    return this.convert(stmt);
                                } catch (error: any) {
                                    console.error('Error converting statement in nested statements.statements array:', error);
                                    throw new Error(`Failed to convert statement in nested statements.statements array: ${error?.message || String(error)}`);
                                }
                            })
                            .filter((stmt: any) => stmt !== null);
                    }

                    // Case 3: block itself is a statement
                    if (block.$type && !block.statements) {
                        console.log('Block appears to be a single statement with type:', block.$type);
                        try {
                            return [this.convert(block)];
                        } catch (error: any) {
                            console.error('Error converting single statement block:', error);
                            throw new Error(`Failed to convert single statement block: ${error?.message || String(error)}`);
                        }
                    }
            }

            // If we reach here, we couldn't handle the block
            console.log('Block structure:', JSON.stringify(block, (key, value) => {
                if (key === '$cstNode') return undefined;
                if (key === '$container') return undefined;
                if (key === '$containerProperty') return undefined;
                if (key === '$containerIndex') return undefined;
                return value;
            }, 2));

            console.log('Block does not match any known pattern');
            throw new Error(`Unknown block type: ${block.$type || 'undefined'}`);
        } catch (error: any) {
            console.error('Error in convertStatementsToBody:', error);
            throw new Error(`Failed to convert statements to body: ${error?.message || String(error)}`);
        }
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
     * Enhanced to handle complex for loops with dynamic conditions and nested statements
     */
    convertForStructure(node: ForStructure): any {
        console.log('Converting ForStructure of type:', node.$type);

        if (node.$type === 'ForStructureTo') {
            const forTo = node as ForStructureTo;
            // Convert PineScript's 'for i = 0 to 10' to JavaScript's 'for (let i = 0; i <= 10; i++)'
            const iteratorName = this.convertForIterator(forTo.iterator);

            // Handle the step value if provided
            let updateExpression;
            if (forTo.step) {
                // If a step is provided, use it in the update expression
                updateExpression = {
                    type: 'AssignmentExpression',
                    operator: '+=',
                    left: {
                        type: 'Identifier',
                        name: iteratorName
                    },
                    right: this.convert(forTo.step)
                };
            } else {
                // Default increment by 1
                updateExpression = {
                    type: 'UpdateExpression',
                    operator: '++',
                    argument: {
                        type: 'Identifier',
                        name: iteratorName
                    },
                    prefix: false
                };
            }

            // Convert the block statements, ensuring proper handling of nested conditions
            const blockBody = this.convertStatementsToBody(forTo.block);

            // Log the block body for debugging
            console.log('For loop block body:', JSON.stringify(blockBody, null, 2));

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
                update: updateExpression,
                body: {
                    type: 'BlockStatement',
                    body: blockBody
                }
            };
        } else if (node.$type === 'ForStructureIn') {
            const forIn = node as ForStructureIn;
            // Convert PineScript's 'for i in arr' to JavaScript's 'for (const i of arr)'
            const iteratorName = this.convertForIterator(forIn.iterator);

            // Handle tuple destructuring in for-in loops
            let leftDeclaration;
            if (forIn.iterator.$type === 'TupleDeclaration') {
                // Create an array pattern for destructuring
                const tupleDecl = forIn.iterator as any;
                leftDeclaration = {
                    type: 'VariableDeclaration',
                    declarations: [
                        {
                            type: 'VariableDeclarator',
                            id: {
                                type: 'ArrayPattern',
                                elements: tupleDecl.names.map((name: string) => ({
                                    type: 'Identifier',
                                    name: name
                                }))
                            },
                            init: null
                        }
                    ],
                    kind: 'const'
                };
            } else {
                // Regular single variable
                leftDeclaration = {
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
                };
            }

            // Convert the block statements, ensuring proper handling of nested conditions
            const blockBody = this.convertStatementsToBody(forIn.block);

            // Log the block body for debugging
            console.log('For-in loop block body:', JSON.stringify(blockBody, null, 2));

            return {
                type: 'ForOfStatement',
                left: leftDeclaration,
                right: this.convert(forIn.collection),
                body: {
                    type: 'BlockStatement',
                    body: blockBody
                }
            };
        }

        // Fallback
        console.warn('Unknown ForStructure type, using fallback implementation');
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
     * This method handles both regular functions and arrow functions with different body types.
     *
     * @param node The FunctionDeclaration node to convert
     * @returns An ESTree FunctionDeclaration node
     */
    convertFunctionDeclaration(node: FunctionDeclaration): any {
        console.log('Converting function declaration:', node.name, 'of type:', node.$type);

        try {
            // Extract parameters with proper error handling
            const params: Array<{type: string, name: string}> = [];
            try {
                if (node.parameters?.parameters) {
                    for (const param of node.parameters.parameters) {
                        params.push({
                            type: 'Identifier',
                            name: param.name
                        });
                    }
                }
            } catch (error: any) {
                console.error('Error extracting parameters:', error);
                console.log('Parameters structure:', JSON.stringify(node.parameters, null, 2));
                // Continue with empty params rather than failing
            }

            let bodyStatements: Array<{type: string, [key: string]: any}> = [];

            // Handle different function types based on the AST node type
            switch (node.$type) {
                case 'ArrowFunctionExpression':
                    // Arrow function with simple expression
                    console.log('Processing ArrowFunctionExpression with returnExpr');
                    try {
                        const arrowNode = node as any; // Type assertion to access returnExpr
                        const returnExprConverted = this.convert(arrowNode.returnExpr);
                        if (returnExprConverted) {
                            bodyStatements = [
                                {
                                    type: 'ReturnStatement',
                                    argument: returnExprConverted
                                }
                            ];
                        } else {
                            console.warn('Failed to convert returnExpr, using empty return');
                            bodyStatements = [
                                {
                                    type: 'ReturnStatement',
                                    argument: null
                                }
                            ];
                        }
                    } catch (error: any) {
                        console.error('Error converting arrow function expression:', error);
                        throw new Error(`Failed to convert arrow function expression: ${error?.message || String(error)}`);
                    }
                    break;

                case 'ArrowFunctionBlock':
                case 'RegularFunction':
                    // Arrow function with block or regular function
                    console.log(`Processing ${node.$type} with body`);
                    try {
                        const funcWithBody = node as any; // Type assertion to access body
                        if (funcWithBody.body) {
                            // Get the statements from the body
                            const statements = this.convertStatementsToBody(funcWithBody.body);

                            if (statements.length > 0) {
                                // Make a copy of the statements array to avoid modifying the original
                                bodyStatements = [...statements];

                                // For arrow functions, convert the last expression statement to a return statement
                                if (node.$type === 'ArrowFunctionBlock') {
                                    const lastStatement = bodyStatements[bodyStatements.length - 1];

                                    // If the last statement is an expression statement, convert it to a return statement
                                    if (lastStatement && lastStatement.type === 'ExpressionStatement') {
                                        const returnStatement = {
                                            type: 'ReturnStatement',
                                            argument: lastStatement.expression
                                        };

                                        // Replace the last statement with a return statement
                                        bodyStatements[bodyStatements.length - 1] = returnStatement;
                                    }
                                    // If the last statement is an if statement, add return statements to the consequent and alternate blocks
                                    else if (lastStatement && lastStatement.type === 'IfStatement') {
                                        // Handle the consequent block
                                        if (lastStatement.consequent && lastStatement.consequent.type === 'BlockStatement') {
                                            const consequentLastStatement = lastStatement.consequent.body[lastStatement.consequent.body.length - 1];
                                            if (consequentLastStatement && consequentLastStatement.type === 'ExpressionStatement') {
                                                const returnStatement = {
                                                    type: 'ReturnStatement',
                                                    argument: consequentLastStatement.expression
                                                };
                                                lastStatement.consequent.body[lastStatement.consequent.body.length - 1] = returnStatement;
                                            }
                                        }

                                        // Handle the alternate block
                                        if (lastStatement.alternate && lastStatement.alternate.type === 'BlockStatement') {
                                            const alternateLastStatement = lastStatement.alternate.body[lastStatement.alternate.body.length - 1];
                                            if (alternateLastStatement && alternateLastStatement.type === 'ExpressionStatement') {
                                                const returnStatement = {
                                                    type: 'ReturnStatement',
                                                    argument: alternateLastStatement.expression
                                                };
                                                lastStatement.alternate.body[lastStatement.alternate.body.length - 1] = returnStatement;
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            console.warn(`${node.$type} has no body, using empty body`);
                        }
                    } catch (error: any) {
                        console.error(`Error converting ${node.$type} body:`, error);
                        throw new Error(`Failed to convert function body: ${error?.message || String(error)}`);
                    }
                    break;

                default:
                    // Handle legacy or unknown function types
                    console.log('Processing function with unknown or legacy type:', node.$type);

                    // Try to handle returnExpr if it exists (for backward compatibility)
                    if ((node as any).returnExpr) {
                        try {
                            const returnExprConverted = this.convert((node as any).returnExpr);
                            if (returnExprConverted) {
                                bodyStatements = [
                                    {
                                        type: 'ReturnStatement',
                                        argument: returnExprConverted
                                    }
                                ];
                            }
                        } catch (error: any) {
                            console.error('Error converting legacy returnExpr:', error);
                        }
                    }
                    // Try to handle body if it exists (for backward compatibility)
                    else if ((node as any).body) {
                        try {
                            const statements = this.convertStatementsToBody((node as any).body);
                            bodyStatements = [...statements];
                        } catch (error: any) {
                            console.error('Error converting legacy body:', error);
                        }
                    } else {
                        console.warn('Function has neither returnExpr nor body');
                    }
                    break;
            }

            // Create the function declaration with proper error handling
            const functionDeclaration = {
                type: 'FunctionDeclaration',
                id: {
                    type: 'Identifier',
                    name: node.name || 'anonymous' // Provide a fallback name
                },
                params,
                body: {
                    type: 'BlockStatement',
                    body: bodyStatements
                },
                generator: false,
                expression: false,
                async: false
            };

            console.log('Created function declaration:', JSON.stringify(functionDeclaration, null, 2));
            return functionDeclaration;
        } catch (error: any) {
            console.error('Error in convertFunctionDeclaration:', error);
            console.log('Function node structure:', JSON.stringify(node, (key, value) => {
                if (key === '$cstNode') return undefined;
                if (key === '$container') return undefined;
                if (key === '$containerProperty') return undefined;
                if (key === '$containerIndex') return undefined;
                return value;
            }, 2));
            throw new Error(`Failed to convert function declaration: ${error?.message || String(error)}`);
        }
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
        const structure = node.structure;

        // Debug the structure type
        console.log('Structure type:', structure.$type);
        console.log('Structure:', JSON.stringify(structure, (key, value) => {
            if (key === '$cstNode') return undefined;
            if (key === '$container') return undefined;
            if (key === '$containerProperty') return undefined;
            if (key === '$containerIndex') return undefined;
            return value;
        }, 2));

        // Handle if statements
        if (structure.$type === 'IfStructure') {
            return this.convertIfStructure(structure as IfStructure);
        } else if (structure.$type === 'ElseClause') {
            return this.convertElseClause(structure);
        } else {
            return this.convert(structure);
        }
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

        // Debug the pair type
        console.log('Inequality pair type:', pair.$type);

        if (pair.$type === 'LessThanTrailingPair') {
            operator = '<';
            console.log('Setting operator to <');
        } else if (pair.$type === 'LessThanEqualTrailingPair') {
            operator = '<=';
            console.log('Setting operator to <=');
        } else if (pair.$type === 'GreaterThanTrailingPair') {
            operator = '>';
            console.log('Setting operator to >');
        } else if (pair.$type === 'GreaterThanEqualTrailingPair') {
            operator = '>=';
            console.log('Setting operator to >=');
        }

        // Create the binary expression
        const result = {
            type: 'BinaryExpression',
            operator,
            left: this.convert(node.left),
            right: this.convert(pair.right)
        };

        console.log('Created binary expression:', JSON.stringify(result, null, 2));
        return result;
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

    /**
     * Convert a GroupedExpression node to an ESTree Expression node
     * This handles expressions in parentheses like (a + b)
     */
    convertGroupedExpression(node: any): any {
        console.log('Converting GroupedExpression');
        return this.convert(node.expression);
    }
}
